/**
 * Featured work — the three-card gallery from the approved reference study.
 *
 * One plate holds three cards: a conceptual diagram, the project name and its
 * factual tags. The reference put full descriptions inside its cards; this
 * system keeps descriptions, links and the complete fact list as real Markdown
 * underneath, so the gallery stays scannable without turning essential copy
 * into pixels. On phones the same cards stack instead of shrinking to a
 * three-column strip.
 *
 * The diagrams are explicitly conceptual — none is a screenshot and none
 * contains invented data. They reuse the same drawing routines as the earlier
 * full-width plates, at a scale where only their structure survives.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  ROOT, schemeOf, text, label, rule, grain, dotField, dotFill, plateRect,
  plateClip, chip,
} from './lib/svg.mjs'
import { asset } from './lib/asset.mjs'

const data = JSON.parse(readFileSync(join(ROOT, 'data', 'projects.json'), 'utf8'))

const DESKTOP = {
  w: 1200, h: 382, pad: 44, gap: 20, cardH: 334, artH: 180,
  nameSize: 27, chipSize: 12, chipH: 23, top: 24,
}
const MOBILE = {
  w: 480, h: 1050, pad: 24, gap: 18, cardH: 322, artH: 160,
  nameSize: 24, chipSize: 16, chipH: 27, top: 24,
}

// ---------------------------------------------------------------------------
// artwork — compact versions of the three conceptual diagrams
// ---------------------------------------------------------------------------

function evidenceArt(a, sc, x, y, w, h, compact) {
  const cy = y + h / 2
  for (let i = 1; i < 4; i++) {
    a.node(rule(x, y + (h / 4) * i, x + w, y + (h / 4) * i, sc.grid, 0.9))
  }

  const dx = x + w * (compact ? 0.1 : 0.08)
  const dr = compact ? 18 : 34
  a.node(`<circle cx="${dx}" cy="${cy}" r="${dr}" fill="none" stroke="${sc.brand.teal}" stroke-width="1.1" opacity=".75"/>`)
  a.node(`<circle cx="${dx}" cy="${cy}" r="${dr + 7}" fill="none" stroke="${sc.borderStrong}" stroke-width=".7" opacity=".6" stroke-dasharray="2 4"/>`)
  if (!compact) {
    a.node(text(dx, cy + 3, 'DZ', { family: 'mono', size: 10, weight: 500, fill: sc.brand.teal, anchor: 'middle', tracking: 1.4 }))
    a.node(label(dx, cy + dr + 20, 'DISEASE', { size: 8.6, tracking: 1.6, fill: sc.textFaint, anchor: 'middle' }))
    a.node(text(dx, cy + dr + 36, 'record kept intact', { family: 'mono', size: 8, weight: 400, fill: sc.textFaint, anchor: 'middle' }))
  }

  const cw = w * (compact ? 0.3 : 0.23)
  const ch = compact ? 40 : 62
  const cxx = x + w * (compact ? 0.3 : 0.3)
  a.node(`<rect x="${cxx}" y="${cy - ch / 2}" width="${cw}" height="${ch}" rx="7" fill="${sc.elevated}" stroke="${sc.brand.teal}" stroke-opacity=".55"/>`)
  if (!compact) {
    a.node(text(cxx + cw / 2, cy - 2, 'TYPED CLAIM', { family: 'mono', size: 9.6, weight: 500, fill: sc.text, anchor: 'middle', tracking: 1.4 }))
    a.node(text(cxx + cw / 2, cy + 14, 'disease · relation · study', { family: 'mono', size: 7.6, weight: 400, fill: sc.textFaint, anchor: 'middle' }))
  }
  a.node(`<path d="M${dx + dr + 8} ${cy}C${cxx - 40} ${cy} ${cxx - 40} ${cy} ${cxx - 2} ${cy}" stroke="${sc.brand.teal}" stroke-width="1.1" opacity=".55"/>`)
  a.node(`<circle cx="${cxx - 2}" cy="${cy}" r="2.4" fill="${sc.brand.teal}" opacity=".8"/>`)

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
    if (!compact) {
      a.node(text(ex + 18, ny + 4, name, {
        family: 'mono', size: 9.8, weight: 400, fill: color, tracking: 0.6,
      }))
    }
  })

  if (!compact) {
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

  for (let i = 2; i >= 0; i--) {
    const ox = stackX + i * 5
    const oy = cy - cardH / 2 - i * 9
    a.node(
      `<rect x="${ox}" y="${oy}" width="${cardW}" height="${cardH}" rx="8" fill="${sc.elevated}" fill-opacity="${0.55 + i * 0.12}" stroke="${sc.brand.violet}" stroke-opacity="${0.3 + i * 0.16}"/>`,
    )
    if (i === 0) {
      if (!compact) a.node(text(ox + 12, oy + 22, 'agent-ready.yaml', { family: 'mono', size: 8.6, weight: 500, fill: sc.brand.violetSoft }))
      for (let l = 0; l < 5; l++) {
        a.node(`<rect x="${ox + 12}" y="${oy + 34 + l * 9}" width="${cardW * (l % 2 ? 0.5 : 0.72)}" height="2.5" rx="1.25" fill="${sc.brand.violetSoft}" opacity="${0.5 - l * 0.06}"/>`)
      }
    }
  }

  const ax = stackX + cardW + 14
  const ax2 = x + w * (compact ? 0.4 : 0.3)
  a.node(`<path d="M${ax} ${cy}C${(ax + ax2) / 2} ${cy} ${(ax + ax2) / 2} ${cy} ${ax2 - 4} ${cy}" stroke="${sc.brand.teal}" stroke-width="1.1" opacity=".6"/>`)
  a.node(`<path d="M${ax2 - 10} ${cy - 4}L${ax2 - 4} ${cy}L${ax2 - 10} ${cy + 4}" stroke="${sc.brand.teal}" stroke-width="1.1" fill="none" opacity=".7" stroke-linecap="round"/>`)

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
    if (!compact) {
      a.node(text(chipX + 10, cyy + chipH / 2 + 3.2, name, {
        family: 'mono', size: 9.5, weight: 500,
        fill: verified ? sc.brand.teal : sc.textMuted,
      }))
    }
  })
}

function screenerArt(a, sc, x, y, w, h, compact) {
  const baseY = y + h - (compact ? 26 : 34)
  const topY = y + (compact ? 16 : 20)
  const left = x + (compact ? 6 : 10)
  const right = x + w - (compact ? 6 : 10)

  for (let i = 1; i <= 3; i++) {
    a.node(rule(left, baseY - ((baseY - topY) / 4) * i, right, baseY - ((baseY - topY) / 4) * i, sc.grid, 0.9))
  }
  a.node(rule(left, baseY, right, baseY, sc.borderStrong, 0.7))

  const n = compact ? 18 : 34
  const slot = (right - left) / n
  const bw = slot * 0.52

  for (let i = 0; i < n; i++) {
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

  const thresholdY = topY + (baseY - topY) * 0.34
  a.node(`<line x1="${left}" y1="${thresholdY}" x2="${right}" y2="${thresholdY}" stroke="${sc.brand.copper}" stroke-width=".9" stroke-dasharray="5 5" opacity=".55"/>`)
}

const ART = { evidence: evidenceArt, contract: contractArt, screener: screenerArt }

// ---------------------------------------------------------------------------
// gallery
// ---------------------------------------------------------------------------

async function render(scheme, layout) {
  const mobile = layout === 'mobile'
  const sc = schemeOf(scheme)
  const L = mobile ? MOBILE : DESKTOP
  const { w, h, pad, gap, cardH, artH, nameSize, chipSize, chipH, top } = L
  const cardW = mobile ? w - pad * 2 : (w - pad * 2 - gap * 2) / 3

  const clips = data.featured.map((_, i) => {
    // Phone cards stack vertically and share one column origin; only the
    // desktop row shifts by the column stride. Using the stride here on mobile
    // clipped cards 1 and 2 off-canvas.
    const x = pad + (mobile ? 0 : i * (cardW + gap))
    const y = top + (mobile ? i * (cardH + gap) : 0)
    return `<clipPath id="card${i}"><rect x="${x + 12}" y="${y + 12}" width="${cardW - 24}" height="${artH}" rx="8"/></clipPath>`
  })

  const a = asset({
    w, h, scheme,
    path: `assets/featured/featured-${layout}-${scheme}.svg`,
    title: 'Featured work — three public systems',
    desc: 'Three cards: NosoGraph, a biomedical evidence graph; Agent-Ready, a repository contract for AI agents; and Short Squeeze Screener, a read-only market screener. Each card shows a conceptual diagram and its stack.',
    defs: `${dotField('featuredDots', sc, 32, 1)}${plateClip('featuredPlate', w, h)}${clips.join('')}`,
  })

  a.node(plateRect(w, h, sc.page, sc.border))
  a.node(`<g clip-path="url(#featuredPlate)">`)
  a.node(dotFill(0, 0, w, h, 'featuredDots', scheme === 'dark' ? 0.35 : 0.45))

  data.featured.forEach((project, i) => {
    const x = pad + (mobile ? 0 : i * (cardW + gap))
    const y = top + (mobile ? i * (cardH + gap) : 0)
    const accent = sc.brand[project.accent]

    a.node(`<g class="fade d${i + 1}">`)
    a.node(`<rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="12" fill="${sc.surface}" stroke="${sc.border}"/>`)
    a.node(`<rect x="${x + 12}" y="${y + 12}" width="${cardW - 24}" height="${artH}" rx="8" fill="${sc.page}" stroke="${sc.border}" stroke-opacity=".8"/>`)
    a.node(`<g clip-path="url(#card${i})">`)
    ART[project.art](a, sc, x + 12, y + 12, cardW - 24, artH, true)
    a.node(`</g>`)

    a.node(label(x + 14, y + artH + 34, project.index, {
      size: mobile ? 12 : 10.5, tracking: 2, fill: accent,
    }))
    if (!mobile) {
      a.node(label(x + cardW - 14, y + artH + 34, project.category, {
        size: 9.5, tracking: 1.5, fill: sc.textFaint, anchor: 'end',
      }))
    }

    a.node(text(x + 14, y + artH + (mobile ? 68 : 68), project.name, {
      family: 'serif', size: nameSize, weight: 500, fill: sc.text,
      tracking: -0.4,
    }))

    // Fact pills wrap to a second row when a card cannot hold them in one.
    let cx = x + 14
    let cy = y + artH + (mobile ? 84 : 82)
    for (const fact of project.facts) {
      const padX = mobile ? 10 : 8
      let pill = chip(cx, cy, fact, sc, {
        accent, size: chipSize, h: chipH, padX,
      })
      if (cx > x + 14 && cx + pill.w > x + cardW - 14) {
        cx = x + 14
        cy += chipH + 7
        pill = chip(cx, cy, fact, sc, {
          accent, size: chipSize, h: chipH, padX,
        })
      }
      a.node(pill.markup)
      cx += pill.w + 8
    }
    a.node(`</g>`)
  })

  a.node(grain(sc, w, h))
  a.node(`</g>`)
  await a.commit()
}

for (const layout of ['desktop', 'mobile']) {
  for (const scheme of ['dark', 'light']) await render(scheme, layout)
}
console.log('featured gallery done')
