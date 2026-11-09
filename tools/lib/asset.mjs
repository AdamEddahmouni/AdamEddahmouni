/**
 * Asset builder.
 *
 * An asset is constructed, drawn into, then committed. Drawing records every
 * glyph and the exact face+weight it was drawn in; committing turns that into
 * per-weight font subsets, embeds only those, applies the motion block and
 * writes the file. Discovering the glyph set rather than declaring it means a
 * missing character can never silently fall back to tofu, and recording the
 * weight means a plate that only uses a 400 serif does not ship 500 and 600.
 *
 * Every animation is authored so that its *unsupported* state is the finished
 * frame: a wipe mask that starts full, a fade that starts opaque. A renderer
 * that ignores CSS still shows a complete picture.
 */

import { join, dirname } from 'node:path'
import { mkdirSync, writeFileSync } from 'node:fs'
import { ROOT, esc, tokens, text as rawText } from './svg.mjs'
import { subset, faces, saveFontCache } from './fonts.mjs'

export function motionCss(extra = '') {
  return `
*{animation-timing-function:cubic-bezier(.22,.61,.36,1)}
.wipe{transform-box:fill-box;transform-origin:left center;animation:wipe 1.5s cubic-bezier(.22,.61,.36,1) both}
.d1{animation-delay:.10s}.d2{animation-delay:.20s}.d3{animation-delay:.30s}
.d4{animation-delay:.40s}.d5{animation-delay:.50s}.d6{animation-delay:.60s}
.d7{animation-delay:.70s}.d8{animation-delay:.80s}
.fade{animation:fade 1.2s cubic-bezier(.22,.61,.36,1) both}
.breathe{animation:breathe 6s ease-in-out infinite}
.drift{animation:drift 18s ease-in-out infinite}
.scan{animation:scan 7s linear infinite}
@keyframes wipe{0%{transform:scaleX(0)}100%{transform:scaleX(1)}}
@keyframes fade{0%{opacity:0}100%{opacity:1}}
@keyframes breathe{0%,100%{opacity:.55}50%{opacity:1}}
@keyframes drift{0%,100%{transform:translate(0,0)}50%{transform:translate(14px,-10px)}}
@keyframes scan{0%{transform:translateX(-15%)}100%{transform:translateX(115%)}}
${extra}
@media (prefers-reduced-motion:reduce){
  *{animation:none!important;transition:none!important}
  .wipe{transform:none!important}
  .fade{opacity:1!important}
  .scan{display:none}
}`
}

const roleOfFamily = (family) =>
  family === tokens.type.serif.family ? 'serif'
    : family === tokens.type.mono.family ? 'mono'
      : 'sans'

export class Asset {
  constructor({
    w, h, title, desc, scheme, path,
    defs = '', style = '', background,
  }) {
    this.w = w
    this.h = h
    this.title = title
    this.desc = desc
    this.defs = defs
    this.style = style
    this.scheme = scheme
    this.path = path
    this.background = background
    this.parts = []
    /** `${role}:${weight}` -> Set<glyph> */
    this.fonts = new Map()
  }

  record(role, weight, str) {
    const key = `${role}:${weight}`
    if (!this.fonts.has(key)) this.fonts.set(key, new Set())
    const set = this.fonts.get(key)
    for (const ch of String(str)) set.add(ch)
  }

  node(markup) {
    // Helpers such as sectionHeader() and ring() return finished SVG strings.
    // Record their glyphs and their declared face too, otherwise their text is
    // missing from the embedded subset and renders as tofu.
    for (const m of String(markup).matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)) {
      const attrs = m[1]
      const plain = m[2]
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      const style = (attrs.match(/style="([^"]*)"/) ?? [])[1] ?? ''
      const f = style.match(/font:\s*(\d+)\s+[\d.]+px\s+'([^']+)'/)
      this.record(roleOfFamily(f?.[2] ?? tokens.type.sans.family), Number(f?.[1] ?? 400), plain)
    }
    this.parts.push(markup)
    return markup
  }

  text(x, y, str, opts = {}) {
    this.record(opts.family ?? 'sans', opts.weight ?? 400, str)
    this.parts.push(rawText(x, y, str, opts))
    return this
  }

  render() {
    return this.parts.join('\n')
  }

  async fontCss() {
    if (this.fonts.size === 0) return ''
    const out = []
    for (const [key, glyphs] of this.fonts) {
      const [role, weight] = key.split(':')
      const face = faces[role]
      if (!face) continue
      const b64 = await subset(face.family, Number(weight), [...glyphs].join(''))
      if (!b64) continue
      out.push(
        `@font-face{font-family:'${face.family}';font-style:normal;font-weight:${weight};` +
          `src:url(data:font/woff2;base64,${b64}) format('woff2');font-display:block}`,
      )
    }
    return out.join('')
  }

  async commit() {
    const fonts = await this.fontCss()
    const style = `${fonts}${motionCss(this.style)}`
    const bg = this.background ?? 'transparent'
    const svg =
`<svg xmlns="http://www.w3.org/2000/svg" width="${this.w}" height="${this.h}" viewBox="0 0 ${this.w} ${this.h}" fill="none" role="img" aria-labelledby="a11y-title">
<title id="a11y-title">${esc(this.title)}</title>${this.desc ? `\n<desc>${esc(this.desc)}</desc>` : ''}
<style>${style}</style>
<defs>
<filter id="bloom" x="-70%" y="-70%" width="240%" height="240%"><feGaussianBlur stdDeviation="34"/></filter>
<filter id="soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="5"/></filter>
<filter id="grainF" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
${this.defs}
</defs>
<rect width="${this.w}" height="${this.h}" fill="${bg}"/>
${this.render()}
</svg>
`
    const full = join(ROOT, this.path)
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, svg, 'utf8')
    saveFontCache()
    const kb = (Buffer.byteLength(svg, 'utf8') / 1024).toFixed(1)
    console.log(`  ${this.path}  ${kb} KB  (${[...this.fonts.keys()].join(', ')})`)
    return this
  }
}

export const asset = (opts) => new Asset(opts)
