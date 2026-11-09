/**
 * Featured work plates.
 *
 * Each project gets its own conceptual diagram rather than a stock image: an
 * evidence graph for NosoGraph, a contract pipeline for Agent-Ready, a
 * short-interest field for the screener. They share one frame, one grid and
 * one type system, so three different subjects still read as one set.
 *
 * The diagrams are explicitly labelled "conceptual diagram" — none of them is
 * a screenshot, and none contains invented data. Titles, descriptions, facts
 * and links live in README Markdown, not in the artwork.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  ROOT, schemeOf, text, label, rule, grain, dotField, dotFill, mix,
  plateRect, plateClip,
} from './lib/svg.mjs'
import { asset } from './lib/asset.mjs'
import { bracketFrame, icon } from './lib/marks.mjs'

const data = JSON.parse(readFileSync(join(ROOT, 'data', 'projects.json'), 'utf8'))

const DESKTOP = { w: 1200, h: 380, pad: 44 }
const MOBILE = { w: 480, h: 360, pad: 24 }

// ---------------------------------------------------------------------------
// artwork
// ---------------------------------------------------------------------------

function evidenceArt(a, sc, x, y, w, h, compact) {
  const cy = y + h / 2
  // faint measurement grid
  for (let i = 1; i < 4; i++) {
    a.node(rule(x, y + (h / 4) * i, x + w, y + (h / 4) * i, sc.grid, 0.9))
  }

  const dx = x + w * (compact ? 0.1 : 0.08)
  const dr = compact ? 18 : 34
  a.node(`<circle cx="${dx}" cy="${cy}" r="${dr}" fill="none" stroke="${sc.brand.teal}" stroke-width="1.1" opacity=".75"/>`)
  a.node(`<circle cx="${dx}" cy="${cy}" r="${dr + 7}" fill="none" stroke="${sc.borderStrong}" stroke-width=".7" opacity=".6" stroke-dasharray="2 4"/>`)
  a.node(text(dx, cy + 3, 'DZ', { family: 'mono', size: compact ? 9 : 10, weight: 500, fill: sc.brand.teal, anchor: 'middle', tracking: 1.4 }))
  a.node(label(dx, cy + dr + 20, 'DISEASE', { size: compact ? 7.5 : 8.6, tracking: 1.6, fill: sc.textFaint, anchor: 'middle' }))
  if (!compact) {
    a.node(text(dx, cy + dr + 36, 'record kept intact', { family: 'mono', size: 8, weight: 400, fill: sc.textFaint, anchor: 'middle' }))
  }

  // claim
  const cw = w * (compact ? 0.3 : 0.23)
  const ch = compact ? 40 : 62
  const cxx = x + w * (compact ? 0.3 : 0.3)
  a.node(`<rect x="${cxx}" y="${cy - ch / 2}" width="${cw}" height="${ch}" rx="7" fill="${sc.elevated}" stroke="${sc.brand.teal}" stroke-opacity=".55"/>`)
  a.node(text(cxx + cw / 2, cy - 2, 'TYPED CLAIM', { family: 'mono', size: compact ? 10 : 9.6, weight: 500, fill: sc.text, anchor: 'middle', tracking: 1.4 }))
  if (!compact) {
    a.node(text(cxx + cw / 2, cy + 14, 'disease · relation · study', { family: 'mono', size: 7.6, weight: 400, fill: sc.textFaint, anchor: 'middle' }))
  }
  a.node(`<path d="M${dx + dr + 8} ${cy}C${cxx - 40} ${cy} ${cxx - 40} ${cy} ${cxx - 2} ${cy}" stroke="${sc.brand.teal}" stroke-width="1.1" opacity=".55"/>`)
  a.node(`<circle cx="${cxx - 2}" cy="${cy}" r="2.4" fill="${sc.brand.teal}" opacity=".8"/>`)

  // four evidence states
  const states = [
    ['supporting', sc.evidence.supporting, false],
    ['contradictory', sc.evidence.contradictory, false],
    ['inconclusive', sc.evidence.inconclusive, true],
    ['unasserted', sc.evidence.unknown, true],
  ]
  const ex = x + w * (compact ? 0.7 : 0.68)
  const spread = compact ? h * 0.34 : h * 0.36
  states.forEach(([name, color, dashed], i) => {
    const ny = cy - spread + (i * spread * 2) / 3
    const startX = cxx + cw
    a.node(`<path d="M${startX} ${cy}C${startX + 40} ${cy} ${ex - 46} ${ny} ${ex - 8} ${ny}" stroke="${color}" stroke-width="1" opacity=".65"${dashed ? ' stroke-dasharray="3 4"' : ''}/>`)
    a.node(`<circle cx="${ex}" cy="${ny}" r="${compact ? 5 : 6.6}" fill="${color}" opacity="${name === 'unasserted' ? '.55' : '.95'}"/>`)
    // Compact plates still name the states: at GitHub's phone width an
    // unlabelled dot communicates nothing.
    a.node(text(ex + (compact ? 12 : 18), ny + 4, name, {
      family: 'mono', size: compact ? 9.8 : 9.8, weight: 400, fill: color, tracking: 0.6,
    }))
  })

  if (!compact) {
    // provenance chip
    const px = x + w * 0.84
    const pw = w * 0.15
    a.node(`<rect x="${px}" y="${cy + 30}" width="${pw}" height="50" rx="6" fill="${sc.surface}" stroke="${sc.border}"/>`)
    a.node(text(px + 12, cy + 49, 'SNAPSHOT', { family: 'mono', size: 8.6, weight: 500, fill: sc.brand.copper, tracking: 1.5 }))
    a.node(text(px + 12, cy + 64, 'kept with every reading', { family: 'mono', size: 7.6, weight: 400, fill: sc.textFaint }))
    a.node(`<path d="M${ex + 12} ${cy + spread}V${cy + 49}H${px}" stroke="${sc.borderStrong}" stroke-width=".8" stroke-dasharray="3 4" fill="none" opacity=".7"/>`)
  }
}

function contractArt(a, sc, x, y, w, h, compact) {
  const cy = y + h / 2
  const cardW = w * (compact ? 0.3 : 0.17)
  const cardH = compact ? h * 0.4 : h * 0.52
  const stackX = x + w * (compact ? 0.05 : 0.04)

  // layered cards: the contract sits under generated adapter files
  for (let i = 2; i >= 0; i--) {
    const ox = stackX + i * 5
    const oy = cy - cardH / 2 - i * 9
    a.node(
      `<rect x="${ox}" y="${oy}" width="${cardW}" height="${cardH}" rx="8" fill="${sc.elevated}" fill-opacity="${0.55 + i * 0.12}" stroke="${sc.brand.violet}" stroke-opacity="${0.3 + i * 0.16}"/>`,
    )
    if (i === 0) {
      a.node(text(ox + 12, oy + 22, 'agent-ready.yaml', { family: 'mono', size: compact ? 8 : 8.6, weight: 500, fill: sc.brand.violetSoft }))
      for (let l = 0; l < 5; l++) {
        a.node(`<rect x="${ox + 12}" y="${oy + 34 + l * 9}" width="${cardW * (l % 2 ? 0.5 : 0.72)}" height="2.5" rx="1.25" fill="${sc.brand.violetSoft}" opacity="${0.5 - l * 0.06}"/>`)
      }
    }
  }

  // fan-out arrow
  const ax = stackX + cardW + 14
  const ax2 = x + w * (compact ? 0.4 : 0.3)
  a.node(`<path d="M${ax} ${cy}C${(ax + ax2) / 2} ${cy} ${(ax + ax2) / 2} ${cy} ${ax2 - 4} ${cy}" stroke="${sc.brand.teal}" stroke-width="1.1" opacity=".6"/>`)
  a.node(`<path d="M${ax2 - 10} ${cy - 4}L${ax2 - 4} ${cy}L${ax2 - 10} ${cy + 4}" stroke="${sc.brand.teal}" stroke-width="1.1" fill="none" opacity=".7" stroke-linecap="round"/>`)

  // five adapter targets
  const chips = ['AGENTS.md', 'CLAUDE.md', '.cursorrules', 'COPILOT', 'GEMINI']
  const chipX = x + w * (compact ? 0.42 : 0.32)
  const chipW = w * (compact ? 0.42 : 0.2)
  const chipH = compact ? 24 : 26
  const gap = compact ? 9 : 8
  const totalH = chips.length * chipH + (chips.length - 1) * gap
  const top = cy - totalH / 2
  chips.forEach((name, i) => {
    const cyy = top + i * (chipH + gap)
    const verified = i === 0
    a.node(`<rect x="${chipX}" y="${cyy}" width="${chipW}" height="${chipH}" rx="5" fill="${sc.surface}" stroke="${verified ? sc.brand.teal : sc.border}" stroke-opacity="${verified ? 0.7 : 1}"/>`)
    a.node(text(chipX + 10, cyy + chipH / 2 + 3.2, name, {
      family: 'mono', size: compact ? 9.4 : 9.5, weight: 500,
      fill: verified ? sc.brand.teal : sc.textMuted,
    }))
    if (!compact) {
      a.node(icon(verified ? 'link' : 'doc', chipX + chipW - 22, cyy + 7, 12, verified ? sc.brand.teal : sc.textFaint, { opacity: 0.75 }))
    }
  })

  if (!compact) {
    // verification pipeline along the plate floor
    const steps = ['VALIDATE', 'GENERATE', 'CHECK', 'VERIFY']
    const py = y + h - 20
    const sx = x + w * 0.08
    steps.forEach((step, i) => {
      const px = sx + i * (w * 0.2)
      a.node(`<circle cx="${px}" cy="${py}" r="3" fill="${i === 3 ? sc.brand.copper : sc.brand.teal}" opacity=".85"/>`)
      a.node(label(px + 12, py + 3.4, step, { size: 8, tracking: 1.6, fill: sc.textFaint }))
      if (i < steps.length - 1) {
        a.node(rule(px + 12 + step.length * 7.2 + 8, py, px + w * 0.2 - 12, py, sc.borderStrong, 0.55))
      }
    })
  }
}

function screenerArt(a, sc, x, y, w, h, compact) {
  const baseY = y + h - (compact ? 26 : 34)
  const topY = y + (compact ? 16 : 20)
  const left = x + (compact ? 6 : 10)
  const right = x + w - (compact ? 6 : 10)

  // horizontal grid
  for (let i = 1; i <= 3; i++) {
    a.node(rule(left, baseY - ((baseY - topY) / 4) * i, right, baseY - ((baseY - topY) / 4) * i, sc.grid, 0.9))
  }
  a.node(rule(left, baseY, right, baseY, sc.borderStrong, 0.7))

  const n = compact ? 18 : 34
  const slot = (right - left) / n
  const bw = slot * 0.52

  for (let i = 0; i < n; i++) {
    const t = i / n
    const raw = 0.28 + 0.5 * Math.abs(Math.sin(i * 1.31 + 0.7)) + 0.14 * Math.sin(i * 0.47 + 1.9)
    const bh = Math.max(6, (baseY - topY) * Math.min(0.92, raw))
    const x0 = left + i * slot + (slot - bw) / 2
    const inconclusive = i % 9 === 4
    const highlight = i === Math.floor(n * 0.62)

    if (inconclusive) {
      a.node(`<rect x="${x0}" y="${baseY - bh}" width="${bw}" height="${bh}" rx="2" fill="none" stroke="${sc.evidence.inconclusive}" stroke-width=".9" stroke-dasharray="2 3" opacity=".8"/>`)
    } else {
      const color = highlight ? sc.brand.copper : sc.brand.teal
      a.node(`<rect x="${x0}" y="${baseY - bh}" width="${bw}" height="${bh}" rx="2" fill="${color}" fill-opacity="${highlight ? 0.9 : 0.5}"/>`)
    }
  }

  // threshold reference: a rule, not a fabricated reading
  const thresholdY = topY + (baseY - topY) * 0.34
  a.node(`<line x1="${left}" y1="${thresholdY}" x2="${right}" y2="${thresholdY}" stroke="${sc.brand.copper}" stroke-width=".9" stroke-dasharray="5 5" opacity=".55"/>`)
  if (!compact) {
    a.node(label(right, thresholdY - 8, 'SCREEN THRESHOLD', { size: 8, tracking: 1.5, fill: sc.brand.copper, anchor: 'end' }))
    a.node(label(left, baseY + 22, 'CANDIDATES →', { size: 8, tracking: 1.5, fill: sc.textFaint }))
    a.node(label(right, baseY + 22, 'INCONCLUSIVE = DASHED', { size: 8, tracking: 1.4, fill: sc.textFaint, anchor: 'end' }))
  }
}

const ART = { evidence: evidenceArt, contract: contractArt, screener: screenerArt }

// ---------------------------------------------------------------------------
// plate
// ---------------------------------------------------------------------------

async function render(project, scheme, layout) {
  const sc = schemeOf(scheme)
  const mobile = layout === 'mobile'
  const L = mobile ? MOBILE : DESKTOP
  const { w, h, pad } = L
  const accent = sc.brand[project.accent]

  const a = asset({
    w, h, scheme,
    path: `assets/work/${project.id}-${layout}-${scheme}.svg`,
    title: `${project.name} — conceptual diagram`,
    desc:
      `${project.kicker.toLowerCase()}. Conceptual technical diagram, not a screenshot. ` +
      `${project.summary}`,
    defs: `${dotField('workDots', sc, 32, 1)}${plateClip('workPlate', w, h)}`,
  })

  a.node(plateRect(w, h, sc.surface, sc.border))
  a.node(`<g clip-path="url(#workPlate)">`)
  a.node(dotFill(0, 0, w, h, 'workDots', scheme === 'dark' ? 0.4 : 0.5))

  // meta row
  const metaY = mobile ? 34 : 38
  a.node(label(pad, metaY, project.index, {
    size: mobile ? 10 : 10.5, tracking: 2.2, fill: accent,
  }))
  a.node(label(pad + (mobile ? 28 : 34), metaY, project.category, {
    size: mobile ? 8.6 : 10, tracking: mobile ? 1.4 : 2.2, fill: sc.textFaint,
  }))
  if (!mobile) {
    a.node(label(w - pad, metaY, 'CONCEPTUAL DIAGRAM', {
      size: 8.4, tracking: 1.8, fill: sc.textFaint, anchor: 'end',
    }))
  }
  a.node(rule(pad, metaY + 16, w - pad, metaY + 16, sc.border, 0.85))

  // artwork
  const artY = mobile ? 66 : 74
  const artH = h - artY - (mobile ? 62 : 74)
  a.node(`<g class="fade d2">`)
  ART[project.art](a, sc, pad, artY, w - pad * 2, artH, mobile)
  a.node(`</g>`)

  // foot
  const footY = h - (mobile ? 26 : 28)
  a.node(text(pad, footY - 6, project.kicker, {
    family: 'mono', size: mobile ? 8.4 : 9, weight: 500, tracking: mobile ? 1.2 : 1.8, fill: sc.textFaint,
  }))
  a.node(text(w - pad, footY - 6, `FIG. ${project.index}`, {
    family: 'mono', size: mobile ? 8.4 : 9, weight: 400, tracking: 1.4, fill: sc.textFaint, anchor: 'end',
  }))

  a.node(bracketFrame(w - pad - 34, footY - 30, 34, 24, sc.borderStrong, { len: 8, opacity: 0.5 }))
  a.node(grain(sc, w, h))
  a.node(`</g>`)
  await a.commit()
}

for (const layout of ['desktop', 'mobile']) {
  for (const scheme of ['dark', 'light']) {
    for (const project of data.featured) await render(project, scheme, layout)
  }
}
console.log('work done')
