/**
 * Project cards.
 *
 * One card per system, in both schemes. Each card is dominated by a large
 * version of that project's motif, with the real metadata the repository
 * actually reports next to it. Cards are 640x300 so two sit side by side in a
 * README table at a comfortable size, and three stack on narrow viewports.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  ROOT, tokens, schemeOf, accent, dotField, dotFill, grain, wrapText,
} from './lib/svg.mjs'
import { asset } from './lib/asset.mjs'
import { MOTIFS, evidenceLegend } from './lib/motifs.mjs'

const W = 640
const H = 300
const ORDER = [
  'nosograph',
  'agent-ready',
  'market-trading-platform',
  'short-squeeze-screener-internship',
]

const repoData = JSON.parse(readFileSync(join(ROOT, 'tools', 'repo-data.json'), 'utf8'))

const disp = (size, weight = 700) =>
  `${weight} ${size}px '${tokens.type.display.family}', ${tokens.type.bodyStack}`
const mon = (size, weight = 500) =>
  `${weight} ${size}px '${tokens.type.mono.family}', ${tokens.type.monoStack}`

const SHORT_LICENCE = {
  'Apache-2.0': 'Apache-2.0',
  MIT: 'MIT',
  'no licence': 'unlicensed',
}

async function render(key, scheme) {
  const p = tokens.projects[key]
  const live = repoData.repos[key] ?? {}
  const sc = schemeOf(scheme)
  const col = accent(scheme, p.accent)
  const licence = SHORT_LICENCE[live.license] ?? (live.license ?? '—')

  const a = asset({
    w: W, h: H, scheme,
    path: `assets/cards/${key}-${scheme}.svg`,
    title: `${p.name} — ${p.tagline}`,
    desc: p.desc,
    defs: `
<linearGradient id="acc" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${col}"/>
  <stop offset="1" stop-color="${col}" stop-opacity="0"/>
</linearGradient>
<clipPath id="motifClip"><rect x="14" y="86" width="312" height="156" rx="6"/></clipPath>
${dotField('dots', scheme, 20, 1)}`,
  })

  // surface
  a.node(
    `<rect width="${W}" height="${H}" fill="${sc.surface}"/>` +
    `<rect width="${W}" height="${H}" fill="none" stroke="${sc.border}"/>` +
    `<g clip-path="url(#motifClip)">${dotFill(0, 0, W, H, 'dots', 0.7)}</g>`,
  )

  // accent bar under the top edge
  a.node(`<rect x="26" y="24" width="${W - 52}" height="2" rx="1" fill="url(#acc)" opacity=".9"/>`)

  // name + repo
  a.text(26, 56, p.name, { size: 21, family: 'display', weight: 700, fill: sc.text })
  a.text(26, 73, p.repo, { size: 10, family: 'mono', weight: 500, fill: sc.textFaint })

  // status pill, right
  const bl = p.badge.left
  const br = p.badge.right
  const pw = bl.length * 6.2 + br.length * 6.2 + 30
  const px = W - 26 - pw
  a.node(
    `<rect x="${px}" y="38" width="${pw}" height="24" rx="${tokens.radius.pill}" fill="${col}" fill-opacity=".12" stroke="${col}" stroke-opacity=".4"/>`,
  )
  a.text(px + 14, 54, bl, { size: 10, family: 'mono', weight: 500, fill: sc.text })
  a.text(px + pw - 14, 54, br, { size: 10, family: 'mono', weight: 500, fill: col, anchor: 'end' })
  a.node(`<circle cx="${px + 14 + bl.length * 6.2 + 6}" cy="50" r="1.6" fill="${sc.textFaint}"/>`)

  // motif, large
  a.node(`<g clip-path="url(#motifClip)">${MOTIFS[key](scheme, 20, 90, 300, 148)}</g>`)

  // right column, laid out as a flow so nothing depends on a fixed height
  const RX = 352
  const RW = W - RX - 26
  const hasLegend = key === 'nosograph'
  // the legend is a reserved band: the flow above it is told to stop short
  const flowBottom = hasLegend ? 186 : 226
  let cy = 100

  const tagLines = wrapText(p.tagline, RW - 4, { size: 12.5, ratio: 0.58, maxLines: 2 })
  tagLines.forEach((ln, i) => {
    a.text(RX, cy, ln, { size: 12.5, family: 'display', weight: 500, fill: col })
    cy += 17
  })
  cy += 4

  const descRoom = Math.max(2, Math.floor((flowBottom - cy - 8) / 15))
  const lines = wrapText(p.desc, RW - 6, { size: 11, ratio: 0.6, maxLines: descRoom })
  lines.forEach((ln) => {
    a.text(RX, cy, ln, { size: 11, weight: 400, fill: sc.textMuted })
    cy += 15
  })
  cy += 8

  // meta chips
  let cx = RX
  for (const m of (cy + 19 <= flowBottom ? p.meta.slice(0, 3) : [])) {
    const w = Math.round(m.length * 5.4 + 16)
    if (cx + w > W - 26) break
    a.node(
      `<rect x="${cx}" y="${cy}" width="${w}" height="19" rx="${tokens.radius.chip}" fill="${sc.surfaceAlt}" stroke="${sc.border}"/>`,
    )
    a.text(cx + w / 2, cy + 13, m, { size: 9, family: 'mono', weight: 500, fill: sc.textMuted, anchor: 'middle' })
    cx += w + 6
  }

  // the evidence legend explains the motif's edge semantics, so it only
  // belongs on the card whose motif has them
  if (hasLegend) {
    a.text(RX, 200, 'evidence direction', { size: 8.5, family: 'mono', weight: 500, fill: sc.textFaint })
    a.node(evidenceLegend(scheme, RX, 212, { colGap: 130, rowGap: 14 }))
  }

  // figures
  const figTop = 262
  p.metrics.forEach((mtc, i) => {
    const mx = 26 + i * 100
    a.text(mx, figTop, mtc[0], { size: 15, family: 'display', weight: 700, fill: sc.text, tabular: true })
    a.text(mx, figTop + 14, mtc[1], { size: 8.5, family: 'mono', weight: 500, fill: sc.textFaint })
  })

  // footer, right column
  a.node(`<line x1="${RX}" y1="234" x2="${W - 26}" y2="234" stroke="${sc.border}"/>`)
  const footL = `${licence} · ${live.language ?? '—'}`
  const footR = `${live.stars ?? 0}★ · ${live.lastCommit ?? '—'}`
  a.text(RX, 254, footL, { size: 9.5, family: 'mono', weight: 500, fill: sc.textFaint })
  a.text(W - 26, 254, footR, { size: 9.5, family: 'mono', weight: 500, fill: sc.textFaint, anchor: 'end' })
  a.text(RX, 272, 'research use only', { size: 9, family: 'mono', weight: 500, fill: sc.textFaint, opacity: '.8' })

  a.node(grain(scheme))
  await a.commit()
}

for (const scheme of ['dark', 'light']) {
  for (const key of ORDER) await render(key, scheme)
}
console.log('cards done')
