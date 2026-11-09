/**
 * Engineering evidence plate — NosoGraph's evidence chain.
 *
 * This is a diagram of something that exists, not decoration: sources,
 * adapters, normalisation, typed claims, four evidence states, provenance and
 * the surfaces the graph is consumed through. The stage text is the repository
 * README's own description of the pipeline (see data/projects.json → evidence).
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  ROOT, schemeOf, text, label, rule, grain, wrapText, mix,
  plateRect, plateClip,
} from './lib/svg.mjs'
import { asset } from './lib/asset.mjs'
import { bracketFrame, connector, connectorDown } from './lib/marks.mjs'

const data = JSON.parse(readFileSync(join(ROOT, 'data', 'projects.json'), 'utf8'))
const { stages } = data.evidence

const DESKTOP = { w: 1200, h: 430, pad: 44 }
const MOBILE = { w: 480, h: 820, pad: 26 }

function stageChips(a, sc, cx, y) {
  const states = [
    ['supporting', sc.evidence.supporting],
    ['contradictory', sc.evidence.contradictory],
    ['inconclusive', sc.evidence.inconclusive],
    ['unasserted', sc.evidence.unknown],
  ]
  const gap = 10
  const w = 64
  const total = states.length * w + (states.length - 1) * gap
  states.forEach(([, color], i) => {
    const x = cx - total / 2 + i * (w + gap)
    a.node(`<rect x="${x}" y="${y}" width="${w}" height="6" rx="3" fill="${color}" opacity=".9"/>`)
  })
}

async function renderDesktop(scheme) {
  const sc = schemeOf(scheme)
  const { w, h, pad } = DESKTOP
  const a = asset({
    w, h, scheme,
    path: `assets/evidence/pipeline-desktop-${scheme}.svg`,
    title: 'NosoGraph evidence pipeline',
    desc:
      'Conceptual diagram of NosoGraph’s evidence chain: source families enter 25 registered ' +
      'adapters, are normalised and validated into typed claims, carry one of four evidence states, ' +
      'keep a provenance snapshot, and are exposed through the CLI, API and exports.',
    defs: plateClip('evPlate', w, h),
  })

  a.node(plateRect(w, h, sc.surface, sc.border))
  a.node(`<g clip-path="url(#evPlate)">`)

  a.node(label(pad, 38, 'ARCHITECTURE / EVIDENCE CHAIN', { size: 10, tracking: 2.2, fill: sc.textFaint }))
  a.node(label(w - pad, 38, 'NOSOGRAPH · CONCEPTUAL', { size: 8.6, tracking: 1.8, fill: sc.textFaint, anchor: 'end' }))
  a.node(rule(pad, 54, w - pad, 54, sc.border, 0.85))

  const n = stages.length
  const span = w - pad * 2
  const colW = span / n
  const lineY = 196
  a.node(`<line x1="${pad + colW / 2}" y1="${lineY}" x2="${w - pad - colW / 2}" y2="${lineY}" stroke="${sc.borderStrong}" stroke-width="1" opacity=".8"/>`)

  stages.forEach((stage, i) => {
    const cx = pad + colW * (i + 0.5)
    const accent = i === 4 ? sc.brand.copper : sc.brand.teal

    a.node(`<g class="fade d${Math.min(i + 2, 8)}">`)
    a.node(label(cx, 150, stage.label, { size: 9.6, tracking: 1.6, fill: sc.text, anchor: 'middle' }))

    a.node(`<circle cx="${cx}" cy="${lineY}" r="17" fill="${sc.surface}" stroke="${accent}" stroke-width="1"/>`)
    a.node(text(cx, lineY + 3.6, String(i + 1).padStart(2, '0'), {
      family: 'mono', size: 9, weight: 500, fill: accent, anchor: 'middle', tracking: 0.8,
    }))

    const lines = wrapText(stage.detail, colW - 26, { size: 10.5, ratio: 0.52, maxLines: 4 })
    lines.forEach((line, k) => {
      a.node(text(cx, 232 + k * 15, line, {
        family: 'sans', size: 10.5, weight: 400, fill: sc.textMuted, anchor: 'middle',
      }))
    })

    if (stage.label === 'EVIDENCE STATE') stageChips(a, sc, cx, 232 + lines.length * 15 + 10)
    a.node(`</g>`)

    if (i < n - 1) {
      a.node(`<path d="M${cx + colW - 8} ${lineY - 4}L${cx + colW - 1} ${lineY}L${cx + colW - 8} ${lineY + 4}" stroke="${sc.borderStrong}" stroke-width="1" fill="none" opacity=".9"/>`)
    }
  })

  // the point of the chain, stated once
  a.node(rule(pad, h - 66, w - pad, h - 66, sc.border, 0.8))
  a.node(text(pad, h - 38, 'Evidence records support claims; they are not automatic proof.', {
    family: 'sans', size: 12, weight: 400, fill: sc.textMuted,
  }))
  a.node(text(w - pad, h - 38, 'SOURCE · SNAPSHOT · STATE', {
    family: 'mono', size: 8.6, weight: 500, tracking: 1.8, fill: sc.textFaint, anchor: 'end',
  }))

  a.node(bracketFrame(w - pad - 34, h - 30, 34, 20, sc.borderStrong, { len: 7, opacity: 0.45 }))
  a.node(grain(sc, w, h))
  a.node(`</g>`)
  await a.commit()
}

async function renderMobile(scheme) {
  const sc = schemeOf(scheme)
  const { w, h, pad } = MOBILE
  const a = asset({
    w, h, scheme,
    path: `assets/evidence/pipeline-mobile-${scheme}.svg`,
    title: 'NosoGraph evidence pipeline',
    desc:
      'Conceptual diagram of NosoGraph’s evidence chain as a vertical flow: sources, adapters, ' +
      'normalisation, typed claims, evidence state, provenance, and the surfaces that expose them.',
    defs: plateClip('evPlateM', w, h),
  })

  a.node(plateRect(w, h, sc.surface, sc.border))
  a.node(`<g clip-path="url(#evPlateM)">`)

  a.node(label(pad, 34, 'EVIDENCE CHAIN', { size: 16, tracking: 1.4, fill: sc.textFaint }))
  a.node(rule(pad, 48, w - pad, 48, sc.border, 0.85))

  const top = 86
  const step = (h - top - 52) / stages.length
  const lineX = pad + 14

  a.node(`<line x1="${lineX}" y1="${top}" x2="${lineX}" y2="${top + step * (stages.length - 1)}" stroke="${sc.borderStrong}" stroke-width="1" opacity=".75"/>`)

  stages.forEach((stage, i) => {
    const cy = top + step * i
    const accent = i === 4 ? sc.brand.copper : sc.brand.teal
    a.node(`<circle cx="${lineX}" cy="${cy}" r="13" fill="${sc.surface}" stroke="${accent}"/>`)
    a.node(text(lineX, cy + 4, String(i + 1).padStart(2, '0'), {
      family: 'mono', size: 10.5, weight: 500, fill: accent, anchor: 'middle',
    }))
    a.node(text(lineX + 32, cy - 2, stage.label, {
      family: 'mono', size: 16, weight: 500, tracking: 0.7, fill: sc.text,
    }))
    const lines = wrapText(stage.detail, w - pad * 2 - 54, { size: 16, ratio: 0.5, maxLines: 2 })
    lines.forEach((line, k) => {
      a.node(text(lineX + 32, cy + 20 + k * 19, line, {
        family: 'sans', size: 16, weight: 400, fill: sc.textMuted,
      }))
    })
    if (i < stages.length - 1) {
      a.node(connectorDown(lineX, cy + 12, lineX, top + step * (i + 1) - 12, sc.borderStrong, { opacity: 0.6 }))
    }
    if (stage.label === 'EVIDENCE STATE') {
    }
  })

  a.node(rule(pad, h - 44, w - pad, h - 44, sc.border, 0.8))
  a.node(text(pad, h - 24, 'Evidence is not proof.', {
    family: 'sans', size: 16, weight: 400, fill: sc.textMuted,
  }))

  a.node(grain(sc, w, h))
  a.node(`</g>`)
  await a.commit()
}

for (const scheme of ['dark', 'light']) {
  await renderDesktop(scheme)
  await renderMobile(scheme)
}
console.log('evidence done')
