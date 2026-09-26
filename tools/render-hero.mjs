/**
 * Hero - an index of the four systems.
 *
 * Each quadrant carries its own project, its real current figures and its own
 * motif. The figures are static and exact: a number that animates up to a
 * value is not the value, and the projects these describe are careful about
 * exactly that distinction. Motion is spent on the motifs and the background
 * instead, and every figure is traceable to a file in the repos.
 */

import { tokens, schemeOf, accent, dotField, dotFill, grain, statusDot } from './lib/svg.mjs'
import { asset } from './lib/asset.mjs'
import { MOTIFS } from './lib/motifs.mjs'

const W = 1200
const H = 424
const PAD = 37
const ORDER = [
  'nosograph',
  'agent-ready',
  'market-trading-platform',
  'short-squeeze-screener-internship',
]

const SHORT = {
  nosograph: 'NosoGraph',
  'agent-ready': 'Agent-Ready',
  'market-trading-platform': 'Market Platform',
  'short-squeeze-screener-internship': 'Squeeze Screener',
}

const DOMAIN = {
  nosograph: 'biomedical',
  'agent-ready': 'ai tooling',
  'market-trading-platform': 'market systems',
  'short-squeeze-screener-internship': 'quant research',
}

async function render(scheme) {
  const sc = schemeOf(scheme)
  const a = asset({
    w: W, h: H, scheme,
    path: `assets/hero/hero-${scheme}.svg`,
    title: 'Adam Eddahmouni — systems index',
    desc:
      'Index of four open-source systems: NosoGraph for biomedical disease evidence, ' +
      'Agent-Ready for coding-agent repository contracts, a monorepo workspace with a ' +
      'lineage guard, and a read-only short-squeeze research screener.',
    defs: `
<linearGradient id="meshA" x1="0" y1="0" x2="1" y2="1">
  <stop offset="0" stop-color="${sc.brand.blue}" stop-opacity="${scheme === 'dark' ? '.20' : '.13'}"/>
  <stop offset="1" stop-color="${sc.brand.teal}" stop-opacity="0"/>
</linearGradient>
<linearGradient id="meshB" x1="1" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="${sc.brand.violet}" stop-opacity="${scheme === 'dark' ? '.18' : '.11'}"/>
  <stop offset="1" stop-color="${sc.brand.teal}" stop-opacity="0"/>
</linearGradient>
<linearGradient id="rule" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${sc.border}"/>
  <stop offset=".5" stop-color="${sc.borderStrong}"/>
  <stop offset="1" stop-color="${sc.border}"/>
</linearGradient>
<linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${sc.brand.teal}" stop-opacity="0"/>
  <stop offset=".5" stop-color="${sc.brand.teal}" stop-opacity=".55"/>
  <stop offset="1" stop-color="${sc.brand.teal}" stop-opacity="0"/>
</linearGradient>
<clipPath id="band"><rect x="0" y="152" width="${W}" height="196" rx="0"/></clipPath>
${dotField('heroDots', scheme, 26, 1)}`,
  })

  // ---- background: mesh, dot grid, bloom, grain -------------------------
  a.node(`<g class="drift" style="animation:drift ${tokens.motion.ambient} infinite"><ellipse cx="170" cy="90" rx="300" ry="190" fill="url(#meshA)"/></g>`)
  a.node(`<g class="drift" style="animation:drift ${tokens.motion.ambient} infinite;animation-delay:-3s"><ellipse cx="1050" cy="330" rx="320" ry="200" fill="url(#meshB)"/></g>`)
  a.node(dotFill(0, 0, W, H, 'heroDots', 0.55))
  a.node(
    `<circle cx="600" cy="230" r="150" fill="${sc.brand.blue}" opacity="${scheme === 'dark' ? '.10' : '.06'}" filter="url(#bloom)">` +
      `<animate attributeName="opacity" values="${scheme === 'dark' ? '.06;.13;.06' : '.04;.08;.04'}" dur="${tokens.motion.ambient}" repeatCount="indefinite"/></circle>`,
  )
  // scanline, clipped to the card band so it never crosses the title
  a.node(
    `<g clip-path="url(#band)"><rect x="-200" y="152" width="200" height="196" fill="url(#sweep)" opacity=".5" style="animation:sweep 9s linear infinite"/></g>`,
  )

  // ---- masthead --------------------------------------------------------
  const disp = (size, weight = 700) =>
    `${weight} ${size}px '${tokens.type.display.family}', ${tokens.type.bodyStack}`
  const mon = (size, weight = 500) =>
    `${weight} ${size}px '${tokens.type.mono.family}', ${tokens.type.monoStack}`

  a.node(
    `<text x="${PAD}" y="72" font-family="${disp(40)}" fill="${sc.text}" letter-spacing="-.6">Adam Eddahmouni</text>`,
  )
  a.node(
    `<text x="${PAD}" y="100" font-family="${400} 15px ${tokens.type.bodyStack}" fill="${sc.textMuted}">` +
      `biomedical research software · AI agent tooling · market &amp; platform systems</text>`,
  )

  // status pill, right aligned
  const pillLabel = 'open to collaborations'
  const pillW = pillLabel.length * 7.1 + 46
  const pillX = W - PAD - pillW
  a.node(
    `<g class="rise d2">` +
      `<rect x="${pillX}" y="56" width="${pillW}" height="30" rx="${tokens.radius.pill}" fill="${sc.brand.teal}" fill-opacity=".12" stroke="${sc.brand.teal}" stroke-opacity=".4"/>` +
      statusDot(pillX + 18, 71, scheme, 3.6) +
      `<text x="${pillX + 30}" y="${75}" font-family="${mon(12)}" fill="${sc.text}">${pillLabel}</text>` +
    `</g>`,
  )

  a.node(`<line x1="${PAD}" y1="128" x2="${W - PAD}" y2="128" stroke="url(#rule)"/>`)

  // ---- four system cards ----------------------------------------------
  const gutter = tokens.grid.heroGutter
  const cw = (W - PAD * 2 - gutter * 3) / 4
  const cy = 152
  const ch = 196

  ORDER.forEach((key, i) => {
    const p = tokens.projects[key]
    const x = PAD + i * (cw + gutter)
    const col = accent(scheme, p.accent)
    const d = `.d${i + 2}`

    a.node(
      `<g class="rise ${d}">` +
        `<rect x="${x}" y="${cy}" width="${cw}" height="${ch}" rx="${tokens.radius.card}" fill="${sc.surface}" stroke="${sc.border}"/>` +
        // project accent bar across the top edge
        `<rect x="${x + 14}" y="${cy}" width="${cw - 28}" height="2" rx="1" fill="${col}" opacity=".85"/>` +
      `</g>`,
    )

    // motif thumbnail
    a.node(`<g clip-path="url(#band)">${MOTIFS[key](scheme, x + 10, cy + 12, cw - 20, 84, { compact: true })}</g>`)

    // name + domain
    a.text(x + 14, cy + 118, SHORT[key], { size: 15, weight: 700, family: 'display', fill: sc.text })
    a.text(x + 14, cy + 134, DOMAIN[key], { size: 10.5, family: 'mono', weight: 500, family: 'mono', fill: col })

    // figures
    p.metrics.forEach((mtc, k) => {
      const mx = x + 14 + k * ((cw - 28) / 3)
      a.text(mx, cy + 160, mtc[0], { size: 17, weight: 700, family: 'display', fill: sc.text, tabular: true })
      a.text(mx, cy + 175, mtc[1], { size: 9, family: 'mono', weight: 500, family: 'mono', fill: sc.textFaint })
    })
  })

  // ---- footer strip ---------------------------------------------------
  a.node(`<line x1="${PAD}" y1="372" x2="${W - PAD}" y2="372" stroke="url(#rule)"/>`)
  const foot = 'Pennsylvania · Penn State · github.com/AdamEddahmouni'
  a.text(PAD, 398, foot, { size: 11.5, family: 'mono', weight: 500, family: 'mono', fill: sc.textFaint })

  const stackNote = 'python · typescript · fastapi · docker · github actions'
  a.text(W - PAD, 398, stackNote, { size: 11.5, family: 'mono', weight: 500, family: 'mono', fill: sc.textFaint, anchor: 'end' })

  a.node(grain(scheme))
  await a.commit()
}

for (const scheme of ['dark', 'light']) await render(scheme)
console.log('hero done')
