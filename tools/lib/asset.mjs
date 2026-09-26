/**
 * Asset builder.
 *
 * An asset is constructed, drawn into, then committed. Drawing records every
 * glyph the asset touches; committing turns that glyph set into a font subset,
 * embeds it, applies the motion block, and writes the file. Because the
 * glyph set is discovered rather than declared, a missing character can never
 * silently fall back to tofu.
 */

import { join } from 'node:path'
import { writeFileSync } from 'node:fs'
import { ROOT, tokens, esc, text as rawText } from './svg.mjs'
import { subset, faces, saveFontCache } from './fonts.mjs'

/**
 * Motion block. Every animated asset uses the same three durations and the
 * same easing, and every one of them collapses to a still frame when the
 * viewer has asked for reduced motion. A <style> element inside an SVG served
 * through <img> is honoured, including @media (prefers-reduced-motion).
 */
export function motionCss(extra = '') {
  const m = tokens.motion
  return `
*{animation-timing-function:${m.ease}}
.rise{animation:rise ${m.stagger} ${m.ease} both}
.d1{animation-delay:.08s}.d2{animation-delay:.16s}.d3{animation-delay:.24s}
.d4{animation-delay:.32s}.d5{animation-delay:.4s}.d6{animation-delay:.48s}
.d7{animation-delay:.56s}.d8{animation-delay:.64s}
/* ambient loops. Each class here must exist: a keyframe on its own does
   nothing, and an undeclared class fails silently. */
.breathe{animation:breathe ${m.secondary} infinite}
.drift{animation:drift ${m.ambient} infinite}
.sweep{animation:sweep 7s linear infinite}
.fadein{animation:rise ${m.stagger} ${m.ease} both}
@keyframes rise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes grow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes drift{0%,100%{transform:translate(0,0)}50%{transform:translate(18px,-14px)}}
@keyframes sweep{0%{transform:translateX(-30%)}100%{transform:translateX(130%)}}
@keyframes breathe{0%,100%{opacity:.45;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
${extra}
@media (prefers-reduced-motion:reduce){
  *{animation:none!important;transition:none!important}
}`
}

export class Asset {
  constructor({ w, h, title, desc, defs = '', style = '', scheme, path }) {
    this.w = w
    this.h = h
    this.title = title
    this.desc = desc
    this.defs = defs
    this.style = style
    this.scheme = scheme
    this.path = path
    this.parts = []
    this.glyphs = new Set()
  }

  /** Raw SVG fragment, recorded verbatim. */
  node(markup) {
    this.parts.push(markup)
    return markup
  }

  /**
   * Text. `family: 'display' | 'mono' | 'body'` selects the stack. Every glyph
   * drawn is recorded so the embedded subset can be built for exactly this
   * asset - including body text, which falls back through the display family
   * on some platforms and would otherwise render as tofu.
   */
  text(x, y, str, opts = {}) {
    for (const ch of String(str)) this.glyphs.add(ch)
    this.parts.push(rawText(x, y, str, opts))
    return this
  }

  render() {
    return this.parts.join('\n')
  }

  async fontCss() {
    // An asset that draws no text needs no embedded face. Embedding anyway
    // shipped ~16 KB of unused base64 on the dividers.
    if (this.glyphs.size === 0) return ''
    const out = []
    for (const face of faces) {
      for (const weight of face.weights) {
        const b64 = await subset(face.family, weight, [...this.glyphs].join(''))
        if (!b64) continue
        out.push(
          `@font-face{font-family:'${face.family}';font-style:normal;font-weight:${weight};` +
            `src:url(data:font/woff2;base64,${b64}) format('woff2');font-display:block}`,
        )
      }
    }
    return out.join('')
  }

  async commit() {
    const fonts = await this.fontCss()
    const s = tokens.schemes[this.scheme]
    const style = `${fonts}${motionCss(this.style)}`
    const svg =
`<svg xmlns="http://www.w3.org/2000/svg" width="${this.w}" height="${this.h}" viewBox="0 0 ${this.w} ${this.h}" fill="none" role="img" aria-labelledby="a11y-title">
<title id="a11y-title">${esc(this.title)}</title>${this.desc ? `\n<desc>${esc(this.desc)}</desc>` : ''}
<style>${style}</style>
<defs>
<filter id="bloom" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="30"/></filter>
<filter id="soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="grainF" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
${this.defs}
</defs>
<rect width="${this.w}" height="${this.h}" fill="${s.page}"/>
${this.render()}
</svg>
`
    const full = join(ROOT, this.path)
    writeFileSync(full, svg, 'utf8')
    saveFontCache()
    const kb = (Buffer.byteLength(svg, 'utf8') / 1024).toFixed(1)
    console.log(`  ${this.path}  ${kb} KB  (${this.glyphs.size} glyphs, ${this.scheme})`)
    return this
  }
}

export const asset = (opts) => new Asset(opts)
