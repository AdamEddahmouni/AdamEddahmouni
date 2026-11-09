/**
 * At a glance — the four-domain capability strip.
 *
 * Recreates the reference's horizontal band: a copper tick and tracked label,
 * four blocks separated by hairlines, a custom icon on the same 24-unit grid,
 * a serif heading and a mono qualifier. No counts and no invented metrics: the
 * band states what the work is, not how impressive it is supposed to be.
 */

import { schemeOf, text, label, rule, grain, dotField, dotFill } from './lib/svg.mjs'
import { asset } from './lib/asset.mjs'
import { sectionHeader, icon } from './lib/marks.mjs'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from './lib/svg.mjs'

const data = JSON.parse(readFileSync(join(ROOT, 'data', 'projects.json'), 'utf8'))
const blocks = data.glance

const DESKTOP = { w: 1200, h: 240, pad: 48 }
const MOBILE = { w: 480, h: 380, pad: 30 }

async function render(scheme, layout) {
  const sc = schemeOf(scheme)
  const mobile = layout === 'mobile'
  const L = mobile ? MOBILE : DESKTOP
  const { w, h, pad } = L

  const a = asset({
    w, h, scheme,
    background: sc.page,
    path: `assets/glance/glance-${layout}-${scheme}.svg`,
    title: 'At a glance: engineering, AI systems, research and markets',
    desc: blocks.map((b) => `${b.title}: ${b.note}`).join('. ') + '.',
    defs: dotField('glanceDots', sc, 32, 1),
  })

  a.node(dotFill(0, 0, w, h, 'glanceDots', scheme === 'dark' ? 0.35 : 0.5))
  a.node(sectionHeader(pad, mobile ? 40 : 44, 'AT A GLANCE', sc, { ruleTo: w - pad }))

  const cols = mobile ? 2 : 4
  const gapX = mobile ? 30 : 26
  const cellW = (w - pad * 2 - gapX * (cols - 1)) / cols
  const cellH = mobile ? 132 : 150
  const top = mobile ? 76 : 64
  const rowGap = 22

  blocks.forEach((block, i) => {
    const c = i % cols
    const r = Math.floor(i / cols)
    const x = pad + c * (cellW + gapX)
    const y = top + r * (cellH + rowGap)
    const cx = x + cellW / 2
    const iconSize = mobile ? 26 : 30

    // Centred cell, like the reference strip: mark, serif heading, mono note.
    a.node(`<g class="fade d${i + 2}">`)
    a.node(icon(block.icon, cx - iconSize / 2, y, iconSize, sc.brand.teal, { strokeWidth: 1.3 }))
    a.node(text(cx, y + (mobile ? 64 : 72), block.title, {
      family: 'serif', size: mobile ? 24 : 28, weight: 500, fill: sc.text,
      tracking: -0.2, anchor: 'middle',
    }))
    // The qualifier is 9px inside a 640-unit artboard, which is ~4.5 CSS px on
    // a phone. On the phone plate the title alone carries the domain; the
    // Markdown capabilities section carries the detail.
    if (!mobile) {
      a.node(label(cx, y + 96, block.note.toUpperCase(), {
        size: 13, tracking: 1.2, fill: sc.textFaint, anchor: 'middle',
      }))
    }
    a.node(`</g>`)

    // Separators span the band rather than stopping at the text baseline.
    if (!mobile && c > 0) {
      a.node(rule(x - gapX / 2, top - 6, x - gapX / 2, top + cellH - 10, sc.border, 0.85))
    }
    if (mobile && c > 0) {
      a.node(rule(x - gapX / 2, y + 4, x - gapX / 2, y + cellH - 14, sc.border, 0.8))
    }
    if (mobile && r > 0 && c === 0) {
      a.node(rule(pad, y - rowGap / 2, w - pad, y - rowGap / 2, sc.border, 0.7))
    }
  })

  // hairline foot, matching the reference's ruled band edges
  a.node(rule(pad, h - (mobile ? 26 : 22), w - pad, h - (mobile ? 26 : 22), sc.border, 0.55))

  a.node(grain(sc, w, h))
  await a.commit()
}

for (const layout of ['desktop', 'mobile']) {
  for (const scheme of ['dark', 'light']) await render(scheme, layout)
}
console.log('glance done')
