/**
 * Bespoke motifs.
 *
 * Each project gets a diagram of the thing it actually is, drawn from the
 * concepts its own code and docs are built around, rather than a generic
 * decoration. Motifs are drawn in normalised coordinates and mapped into the
 * box they are given, so the same code serves the hero thumbnail and the
 * full-size project card.
 */

import { schemeOf, tokens, mono, body } from './svg.mjs'

/** Normalised (0..1) drawing space mapped into a box. */
function mapper(x, y, w, h) {
  return {
    X: (u) => +(x + u * w).toFixed(2),
    Y: (v) => +(y + v * h).toFixed(2),
    /** Radius/length relative to the box's short side so shapes stay round. */
    L: (n) => +(n * Math.min(w, h)).toFixed(2),
  }
}

const fade = (i, step = 0.45) => `animation:rise ${step * 2}s cubic-bezier(.4,0,.2,1) both;animation-delay:${(i * step).toFixed(2)}s`

// ---------------------------------------------------------------------------
// NosoGraph - typed evidence graph
// ---------------------------------------------------------------------------

/**
 * Disease -> claim -> evidence -> study -> provenance, with the four evidence
 * directions the evidence model actually distinguishes: supporting,
 * contradictory, inconclusive and unasserted. Each direction gets its own
 * stroke treatment, because collapsing them into one arrow is exactly the
 * loss of information the project exists to prevent.
 */
export function knowledgeGraph(s, x, y, w, h, { compact = false } = {}) {
  const sc = schemeOf(s)
  const m = mapper(x, y, w, h)
  const ev = sc.evidence

  // Node placement is driven by label collision, not aesthetics: labels sit
  // beside their node, so two nodes at similar heights need enough horizontal
  // separation for their captions not to touch.
  const nodes = [
    { u: 0.10, v: 0.56, r: 0.085, key: 'disease' },
    { u: 0.31, v: 0.20, r: 0.075, key: 'claim' },
    { u: 0.53, v: 0.48, r: 0.070, key: 'evidence' },
    { u: 0.78, v: 0.16, r: 0.062, key: 'study' },
    { u: 0.90, v: 0.84, r: 0.058, key: 'provenance' },
  ].map((n) => ({ ...n, X: m.X(n.u), Y: m.Y(n.v), r: m.L(n.r) }))

  const edges = [
    { a: 0, b: 1, dir: 'supporting' },
    { a: 1, b: 2, dir: 'supporting' },
    { a: 2, b: 3, dir: 'contradictory' },
    { a: 3, b: 4, dir: 'inconclusive' },
    { a: 1, b: 4, dir: 'unasserted' },
  ]

  const strokeFor = {
    supporting: { dash: '', w: 1.8 },
    contradictory: { dash: '5 3', w: 1.6 },
    inconclusive: { dash: '1 4', w: 2, cap: 'round' },
    unasserted: { dash: '3 3', w: 1.3 },
  }

  const parts = []

  edges.forEach((e, i) => {
    const A = nodes[e.a]
    const B = nodes[e.b]
    const st = strokeFor[e.dir]
    const col = ev[e.dir]
    const path = `M ${A.X} ${A.Y} L ${B.X} ${B.Y}`
    parts.push(
      `<path d="${path}" stroke="${col}" stroke-width="${st.w}" ${st.dash ? `stroke-dasharray="${st.dash}"` : ''} ${st.cap ? `stroke-linecap="${st.cap}"` : ''} opacity=".62" fill="none"/>`,
    )
    // A token travelling each edge: the evidence moving, not the conclusion.
    parts.push(
      `<circle r="${m.L(0.014)}" fill="${col}" opacity="0"><animate attributeName="opacity" values="0;0;1;1;0" dur="${tokens.motion.secondary}" begin="${(i * 0.62).toFixed(2)}s" repeatCount="indefinite"/><animateMotion dur="${tokens.motion.secondary}" begin="${(i * 0.62).toFixed(2)}s" repeatCount="indefinite" path="${path}"/></circle>`,
    )
  })

  nodes.forEach((n, i) => {
    const keyColor = n.key === 'provenance' ? sc.brand.violet
      : n.key === 'evidence' ? sc.brand.teal
      : n.key === 'claim' ? sc.brand.blue
      : sc.textMuted
    parts.push(
      `<g style="${fade(i, 0.35)}">` +
        `<circle cx="${n.X}" cy="${n.Y}" r="${n.r * 2.1}" fill="${keyColor}" opacity=".12"/>` +
        `<circle cx="${n.X}" cy="${n.Y}" r="${n.r}" fill="${sc.surfaceAlt}" stroke="${keyColor}" stroke-width="1.5"/>` +
      `</g>`,
    )
  })

  if (!compact) {
    const labels = ['disease', 'claim', 'evidence', 'study', 'provenance']
    nodes.forEach((n, i) => {
      const anchor = n.u > 0.7 ? 'end' : n.u > 0.4 ? 'middle' : 'start'
      const dx = n.u > 0.7 ? -n.r - 4 : n.u > 0.4 ? 0 : n.r + 4
      parts.push(
        `<text x="${+(n.X + dx).toFixed(2)}" y="${+(n.Y + 3.4).toFixed(2)}" font-family="${body(9.5)}" fill="${sc.textMuted}" text-anchor="${anchor}">${labels[i]}</text>`,
      )
    })
  }

  return parts.join('')
}

/** Legend for the four evidence directions, stacked two-up for a card column. */
export function evidenceLegend(s, x, y, { colGap = 136, rowGap = 15 } = {}) {
  const sc = schemeOf(s)
  const items = [
    ['supporting', 'supporting'],
    ['contradictory', 'contradictory'],
    ['inconclusive', 'inconclusive'],
    ['unasserted', 'unasserted'],
  ]
  return items
    .map(([k, label], i) => {
      const cx = x + (i % 2) * colGap
      const cy = y + Math.floor(i / 2) * rowGap
      const col = sc.evidence[k]
      const dash = k === 'contradictory' ? 'stroke-dasharray="5 3"'
        : k === 'inconclusive' ? 'stroke-dasharray="1 4" stroke-linecap="round"'
        : k === 'unasserted' ? 'stroke-dasharray="3 3"' : ''
      return (
        `<line x1="${cx}" y1="${cy}" x2="${cx + 16}" y2="${cy}" stroke="${col}" stroke-width="2" ${dash}/>` +
        `<text x="${cx + 22}" y="${cy + 3.4}" font-family="${mono(9)}" fill="${sc.textFaint}">${label}</text>`
      )
    })
    .join('')
}

// ---------------------------------------------------------------------------
// Agent-Ready - the contract fanning out to its adapters
// ---------------------------------------------------------------------------

/**
 * One agent-ready.yaml contract generating the five agent instruction files
 * the project actually emits: AGENTS.md, CLAUDE.md, .cursorrules, Copilot and
 * Gemini. The verification gates animate through underneath.
 */
export function contractAdapters(s, x, y, w, h, { compact = false } = {}) {
  const sc = schemeOf(s)
  const m = mapper(x, y, w, h)
  const blue = sc.brand.blue
  const adapters = ['AGENTS.md', 'CLAUDE.md', '.cursorrules', 'Copilot', 'Gemini']
  const parts = []

  // The contract document.
  const dx = m.X(0.04)
  const dy = m.Y(0.16)
  const dw = m.L(0.30)
  const dh = m.Y(1) - dy
  const r = tokens.radius.chip
  parts.push(
    `<g style="${fade(0, 0.3)}">` +
      `<rect x="${dx}" y="${dy}" width="${dw}" height="${dh}" rx="${r}" fill="${sc.surfaceAlt}" stroke="${blue}" stroke-width="1.2" opacity=".95"/>` +
      `<rect x="${dx}" y="${dy}" width="${dw}" height="${m.L(0.09)}" rx="${r}" fill="${blue}" opacity=".22"/>` +
      // four contract fields, one of them sweeping
      [0.30, 0.46, 0.62, 0.78].map((v, i) => {
        const wfrac = [0.72, 0.55, 0.80, 0.42][i]
        return `<rect x="${dx + dw * 0.14}" y="${m.Y(v)}" width="${dw * wfrac}" height="${m.L(0.035)}" rx="${m.L(0.018)}" fill="${i === 1 ? blue : sc.textFaint}" opacity="${i === 1 ? '.9' : '.32'}"><animate attributeName="opacity" values="${i === 1 ? '.35;.9;.35' : '.32'}" dur="${tokens.motion.secondary}" begin="${(i * 0.3).toFixed(2)}s" repeatCount="indefinite"/></rect>`
      }).join('') +
    `</g>`,
  )

  // Bus + fan-out to each adapter.
  const busX = m.X(0.40)
  const top = m.Y(0.14)
  const bot = m.Y(0.86)
  parts.push(
    `<path d="M ${dx + dw} ${m.Y(0.5)} L ${busX} ${m.Y(0.5)} L ${busX} ${top} L ${busX} ${bot}" stroke="${blue}" stroke-width="1.1" opacity=".38" fill="none"/>`,
  )

  adapters.forEach((name, i) => {
    const ay = top + ((bot - top) / (adapters.length - 1)) * i
    const aw = m.X(1) - m.X(0.46)
    const ah = m.L(0.115)
    const active = i === Math.floor(tokens.motion.ambient ? 0 : 0)
    parts.push(
      `<path d="M ${busX} ${ay} L ${m.X(0.46)} ${ay}" stroke="${blue}" stroke-width="1.1" opacity=".3"/>` +
      `<g style="${fade(i + 1, 0.26)}">` +
        `<rect x="${m.X(0.46)}" y="${ay - ah / 2}" width="${aw}" height="${ah}" rx="${tokens.radius.chip}" fill="${sc.surfaceAlt}" stroke="${i === active ? blue : sc.border}" stroke-width="1"/>` +
        (compact ? '' : `<text x="${m.X(0.46) + 7}" y="${ay + 3.2}" font-family="${mono(9)}" fill="${i === active ? sc.text : sc.textMuted}">${name}</text>`) +
      `</g>`,
    )
  })

  // A token walking the bus: one contract, every adapter.
  parts.push(
    `<circle r="${m.L(0.017)}" fill="${blue}"><animate attributeName="opacity" values="0;1;1;0" dur="${tokens.motion.ambient}" repeatCount="indefinite"/><animateMotion dur="${tokens.motion.ambient}" repeatCount="indefinite" path="M ${dx + dw} ${m.Y(0.5)} L ${busX} ${m.Y(0.5)} L ${busX} ${top} L ${busX} ${bot}"/></circle>`,
  )

  return parts.join('')
}

// ---------------------------------------------------------------------------
// market-trading-platform - commit lineage and the guard
// ---------------------------------------------------------------------------

/**
 * Branches feeding snapshots, a protected main spine, and the manifest and
 * ledger the monorepo guard verifies. The shield marks the branch protection
 * the guard depends on.
 */
export function commitLineage(s, x, y, w, h, { compact = false } = {}) {
  const sc = schemeOf(s)
  const m = mapper(x, y, w, h)
  const violet = sc.brand.violet
  const parts = []

  const branchX = [0.06, 0.18, 0.30]
  const bTop = m.Y(0.06)
  const bBot = m.Y(0.60)
  const spineX = m.X(0.47)

  branchX.forEach((u, i) => {
    const bx = m.X(u)
    parts.push(
      `<path d="M ${bx} ${bTop} L ${bx} ${bBot} L ${spineX} ${bBot}" stroke="${sc.borderStrong}" stroke-width="1.2" fill="none"/>`,
    )
    // commits down each branch
    for (let k = 0; k < 3; k++) {
      const cy = bTop + ((bBot - bTop) / 3) * (k + 0.5)
      parts.push(
        `<circle cx="${bx}" cy="${cy}" r="${m.L(0.021)}" fill="${sc.surfaceAlt}" stroke="${violet}" stroke-width="1.2" opacity=".9"><animate attributeName="opacity" values=".35;1;.35" dur="${tokens.motion.secondary}" begin="${(i * 0.4 + k * 0.28).toFixed(2)}s" repeatCount="indefinite"/></circle>`,
      )
    }
  })

  // protected main spine
  const sTop = m.Y(0.10)
  const sBot = m.Y(0.92)
  parts.push(
    `<path d="M ${spineX} ${bBot} L ${spineX} ${sTop}" stroke="${violet}" stroke-width="1.6" opacity=".55"/>` +
    `<path d="M ${spineX} ${bBot} L ${spineX} ${sBot}" stroke="${violet}" stroke-width="1.6" opacity=".85"/>`,
  )

  // shield on main
  const sy = m.Y(0.30)
  const sw = m.L(0.075)
  const sh = m.L(0.095)
  const shield =
    `M ${spineX} ${sy - sh} L ${spineX + sw} ${sy - sh * 0.72} L ${spineX + sw} ${sy + sh * 0.1}` +
    ` Q ${spineX + sw} ${sy + sh * 0.78} ${spineX} ${sy + sh}` +
    ` Q ${spineX - sw} ${sy + sh * 0.78} ${spineX - sw} ${sy + sh * 0.1} L ${spineX - sw} ${sy - sh * 0.72} Z`
  parts.push(
    `<path d="${shield}" fill="${violet}" fill-opacity=".14" stroke="${violet}" stroke-width="1.3"/>` +
    // the check that the guard's required check actually passed
    `<path d="M ${spineX - sw * 0.42} ${sy - sh * 0.02} l ${sw * 0.30} ${sh * 0.30} l ${sw * 0.56} -${sh * 0.58}" stroke="${violet}" stroke-width="1.7" fill="none" stroke-linecap="round" stroke-linejoin="round"><animate attributeName="stroke-dasharray" values="0 60;60 0" dur="${tokens.motion.secondary}" begin=".4s" repeatCount="indefinite"/><animate attributeName="stroke-dashoffset" values="0" dur="${tokens.motion.secondary}" begin=".4s" repeatCount="indefinite"/></path>`,
  )

  // manifest + ledger
  const blocks = [
    { u: 0.55, label: 'manifest', tint: violet },
    { u: 0.85, label: 'ledger', tint: sc.brand.blue },
  ]
  const blocksX0 = m.X(0.55)
  const blocksX1 = m.X(1)
  const bw = (blocksX1 - blocksX0 - m.L(0.06)) / 2
  blocks.forEach((b, i) => {
    const bx = blocksX0 + i * (bw + m.L(0.06))
    const bh = m.L(0.20)
    const by = m.Y(0.62) - bh / 2
    parts.push(
      `<g style="${fade(i + 3, 0.3)}">` +
        `<rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${tokens.radius.chip}" fill="${sc.surfaceAlt}" stroke="${b.tint}" stroke-opacity=".55"/>` +
        [0.28, 0.5, 0.72].map((v, k) =>
          `<rect x="${bx + bw * 0.16}" y="${by + bh * v}" width="${bw * [0.6, 0.45, 0.7][k]}" height="${m.L(0.014)}" rx="${m.L(0.007)}" fill="${b.tint}" opacity=".45"/>`,
        ).join('') +
        (compact ? '' : `<text x="${bx + bw / 2}" y="${by + bh + 12}" font-family="${mono(8.5)}" fill="${sc.textFaint}" text-anchor="middle">${b.label}</text>`) +
      `</g>`,
    )
  })

  // a token descending the spine into the ledger
  parts.push(
    `<circle r="${m.L(0.019)}" fill="${violet}"><animate attributeName="opacity" values="0;1;1;0" dur="${tokens.motion.ambient}" repeatCount="indefinite"/><animateMotion dur="${tokens.motion.ambient}" repeatCount="indefinite" path="M ${spineX} ${bBot} L ${spineX} ${sBot} L ${blocksX0 + 20} ${m.Y(0.62)}"/></circle>`,
  )

  return parts.join('')
}

// ---------------------------------------------------------------------------
// short-squeeze-screener - data quality, including what it cannot know
// ---------------------------------------------------------------------------

/**
 * Short-interest bars where the inconclusive readings are drawn as dashed
 * caps rather than being rounded up into a number. The screener makes no
 * predictive claim, so the visual shows its missingness instead of hiding it.
 */
export function dataQuality(s, x, y, w, h, { compact = false } = {}) {
  const sc = schemeOf(s)
  const m = mapper(x, y, w, h)
  const blue = sc.brand.blue
  const grey = sc.textFaint
  const parts = []

  // Deterministic heights: the diagram must look the same on every render.
  const bars = [0.42, 0.68, 0.30, 0.85, 0.52, 0.74, 0.36, 0.60, 0.47, 0.78, 0.55, 0.66]
  const unknown = new Set([2, 5, 9]) // indices whose top is not established
  const base = m.Y(0.92)
  const bw = ((m.X(1) - m.X(0)) / bars.length) * 0.62
  const gap = (m.X(1) - m.X(0)) / bars.length

  bars.forEach((v, i) => {
    const bx = m.X(0) + gap * i + (gap - bw) / 2
    const known = (base - m.Y(v)) * 0.62
    const full = base - m.Y(v)
    parts.push(
      `<rect x="${bx}" y="${base - full}" width="${bw}" height="${full}" rx="${m.L(0.012)}" fill="${sc.surfaceAlt}" opacity=".55"/>`,
    )
    parts.push(
      `<rect x="${bx}" y="${base - known}" width="${bw}" height="${known}" rx="${m.L(0.012)}" fill="${unknown.has(i) ? grey : blue}" opacity="${unknown.has(i) ? '.55' : '.9'}" style="transform-origin:${bx + bw / 2}px ${base}px;animation:grow .8s cubic-bezier(.4,0,.2,1) both;animation-delay:${(i * 0.045).toFixed(2)}s"/>`,
    )
    if (unknown.has(i)) {
      // dashed cap: the part that is genuinely unknown
      parts.push(
        `<rect x="${bx}" y="${base - full}" width="${bw}" height="${full - known}" rx="${m.L(0.012)}" fill="none" stroke="${grey}" stroke-width="1" stroke-dasharray="2 2.5" opacity=".85"><animate attributeName="opacity" values=".35;.9;.35" dur="${tokens.motion.secondary}" begin="${(i * 0.3).toFixed(2)}s" repeatCount="indefinite"/></rect>`,
      )
    }
  })

  parts.push(`<path d="M ${m.X(0)} ${base} L ${m.X(1)} ${base}" stroke="${sc.borderStrong}" stroke-width="1"/>`)

  if (!compact) {
    parts.push(
      `<circle cx="${m.X(0.02) + 3}" cy="${m.Y(0.04)}" r="3" fill="${blue}"/>` +
      `<text x="${m.X(0.02) + 11}" y="${m.Y(0.04) + 3.2}" font-family="${mono(9.5)}" fill="${sc.textFaint}">reported</text>` +
      `<rect x="${m.X(0.30)}" y="${m.Y(0.04) - 3}" width="6" height="6" fill="none" stroke="${grey}" stroke-dasharray="2 2"/>` +
      `<text x="${m.X(0.30) + 11}" y="${m.Y(0.04) + 3.2}" font-family="${mono(9.5)}" fill="${sc.textFaint}">inconclusive</text>`,
    )
  }

  return parts.join('')
}

export const MOTIFS = {
  nosograph: knowledgeGraph,
  'agent-ready': contractAdapters,
  'market-trading-platform': commitLineage,
  'short-squeeze-screener-internship': dataQuality,
}

// ---------------------------------------------------------------------------
// small shared pieces
// ---------------------------------------------------------------------------

/** Commit-activity sparkline. Values are bytes-per-week, largest first. */
export function sparkline(s, x, y, w, h, values, { tint } = {}) {
  const sc = schemeOf(s)
  const col = tint ?? sc.brand.teal
  const max = Math.max(...values, 1)
  const step = w / (values.length - 1)
  const pts = values.map((v, i) => `${+(x + step * i).toFixed(2)},${+(y + h - (v / max) * h).toFixed(2)}`)
  const d = `M ${pts.join(' L ')}`
  return (
    `<path d="${d}" stroke="${col}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>` +
    `<circle cx="${pts[pts.length - 1].split(',')[0]}" cy="${pts[pts.length - 1].split(',')[1]}" r="2.4" fill="${col}"/>`
  )
}

/** Activity heatmap, GitHub's 53x7 grid, themed per colour scheme. */
export function heatGrid(s, x, y, cell, gap, weeks) {
  const sc = schemeOf(s)
  const ramp = sc.heat
  const out = []
  weeks.forEach((week, wi) => {
    week.forEach((level, di) => {
      if (level === undefined) return
      out.push(
        `<rect x="${+(x + wi * (cell + gap)).toFixed(2)}" y="${+(y + di * (cell + gap)).toFixed(2)}" ` +
          `width="${cell}" height="${cell}" rx="${Math.max(1, cell * 0.22)}" fill="${ramp[level]}"/>`,
      )
    })
  })
  return out.join('')
}
