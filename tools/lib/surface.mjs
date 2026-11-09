/**
 * The signature surface: a parametric wireframe landscape.
 *
 * This is the profile's visual signature, so it is generated rather than
 * drawn. A deterministic height field (Gaussian crests plus low-amplitude
 * interference) is sampled on a regular grid, projected through a simple
 * one-point perspective, and stroked as two families of polylines. Colour
 * follows elevation: teal along the low ridges, copper on the crest, which is
 * the reference's defining gradient. Everything is parameterised so the
 * silhouette, density, perspective and palette can be retuned without
 * touching the drawing code.
 */

import { clamp, lerp, mix, smoothstep } from './svg.mjs'

const TAU = Math.PI * 2

/** Deterministic PRNG (mulberry32) so builds never drift. */
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Height field. `crests` places each Gaussian in normalised (u, v) space:
 * u runs left to right, v runs back to front.
 */
function heightField({ crests, phase }) {
  return (u, v) => {
    let h = 0
    for (const c of crests) {
      const du = (u - c.u) / c.su
      const dv = (v - c.v) / c.sv
      h += c.amp * Math.exp(-0.5 * (du * du + dv * dv))
    }
    // Low-amplitude interference keeps the mesh from looking moulded.
    h += 0.055 * Math.sin(7.1 * u + phase) * Math.cos(5.3 * v + phase * 0.7)
    h += 0.03 * Math.sin(13.7 * u + 2.1 * v + phase * 1.3)
    h += 0.018 * Math.sin(21.0 * u - 3.7 * v)
    // Settle to the baseline at the edges so the surface never clips a frame.
    const edge = smoothstep(0, 0.1, u) * smoothstep(1, 0.9, u)
    return Math.max(-0.05, h * (0.35 + 0.65 * edge))
  }
}

export const DEFAULT_CRESTS = [
  { u: 0.64, v: 0.33, amp: 1.0, su: 0.17, sv: 0.2 },
  { u: 0.29, v: 0.6, amp: 0.56, su: 0.2, sv: 0.24 },
  { u: 0.87, v: 0.62, amp: 0.34, su: 0.14, sv: 0.18 },
  { u: 0.1, v: 0.28, amp: 0.22, su: 0.18, sv: 0.2 },
]

/**
 * Build the projected mesh once, then reuse it for both line families, the
 * crest highlight and the signal nodes.
 */
function project(opts) {
  const {
    x, y, w, h, seed = 187,
    cols = 54, rows = 30,
    crests = DEFAULT_CRESTS,
    horizon = 0.36, depth = 0.62, elevation = 0.46, spread = 0.94,
  } = opts

  const phase = (seed % 97) / 9.7
  const field = heightField({ crests, phase })
  const points = []

  for (let r = 0; r <= rows; r++) {
    const v = r / rows
    const persp = 1 / (1 + (1 - v) * 0.92)
    const row = []
    for (let c = 0; c <= cols; c++) {
      const u = c / cols
      const hv = field(u, v)
      const sx = x + w / 2 + (u - 0.5) * w * spread * persp
      const sy = y + h * horizon + (1 - v) * h * depth * persp - hv * h * elevation * (0.55 + 0.45 * persp)
      row.push({ x: sx, y: sy, h: hv, u, v })
    }
    points.push(row)
  }

  // Normalise elevation for colour mapping.
  const hs = points.flat().map((p) => p.h)
  const maxH = Math.max(...hs)
  const minH = Math.min(...hs)
  for (const row of points) {
    for (const p of row) p.n = (p.h - minH) / (maxH - minH || 1)
  }
  return { points, cols, rows }
}

const polyline = (pts, precision = 1) =>
  `M${pts.map((p) => `${p.x.toFixed(precision)} ${p.y.toFixed(precision)}`).join('L')}`

/**
 * Render the surface.
 *
 * Returns SVG markup only. The group is masked by a wipe that is authored at
 * full size, so a renderer without CSS animation still shows the completed
 * illustration.
 */
export function surface(opts) {
  const {
    scheme, sc,
    x, y, w, h,
    seed = 187,
    cols = 54,
    rows = 30,
    crests = DEFAULT_CRESTS,
    horizon = 0.36,
    depth = 0.62,
    elevation = 0.46,
    spread = 0.94,
    id = 'surf',
    animate = true,
    glow = 1,
    lineOpacity = 1,
    precision = 1,
    highlight = true,
    nodes = true,
  } = opts

  const { points } = project({ x, y, w, h, seed, cols, rows, crests, horizon, depth, elevation, spread })
  const teal = sc.brand.teal
  const copper = sc.brand.copper
  const deep = sc.brand.tealDeep

  // A paper ground swallows thin pale lines, so the light scheme is drawn
  // slightly heavier to keep the mesh legible without changing its colour.
  const weight = scheme === 'light' ? 1.4 : 1

  const rowPaths = []
  // Far rows first so near geometry sits on top.
  for (let r = 0; r <= rows; r++) {
    const row = points[r]
    const v = r / rows
    const n = row.reduce((a, p) => a + p.n, 0) / row.length
    const stroke = mix(mix(deep, teal, clamp(n * 1.5)), copper, smoothstep(0.42, 0.95, n))
    const opacity = Math.min(0.92, lerp(0.16, 0.62, v) * lineOpacity * weight)
    rowPaths.push(
      `<path d="${polyline(row, precision)}" stroke="${stroke}" stroke-width="${lerp(0.65, 1.05, v).toFixed(2)}" opacity="${opacity.toFixed(2)}" stroke-linecap="round"/>`,
    )
  }

  const colPaths = []
  for (let c = 0; c <= cols; c += 1) {
    const pts = points.map((row) => row[c])
    const n = pts.reduce((a, p) => a + p.n, 0) / pts.length
    const stroke = mix(mix(deep, teal, clamp(n * 1.6)), copper, smoothstep(0.45, 0.95, n))
    colPaths.push(
      `<path d="${polyline(pts, precision)}" stroke="${stroke}" stroke-width=".7" opacity="${Math.min(0.7, 0.2 * lineOpacity * weight).toFixed(2)}"/>`,
    )
  }

  // Crest: the brightest sample per row, chained into a single ridgeline.
  const crestPts = points.map((row) => row.reduce((best, p) => (p.n > best.n ? p : best), row[0]))
  const crestD = polyline(crestPts, precision)

  const signalNodes = []
  if (nodes) {
    const candidates = []
    for (let r = 2; r < rows - 1; r += 4) {
      for (let c = 3; c < cols - 2; c += 7) {
        const p = points[r][c]
        if (p.n > 0.55) candidates.push(p)
      }
    }
    const rand = rng(seed)
    for (const p of candidates.slice(0, 5)) {
      const r = lerp(2.1, 3.4, rand())
      signalNodes.push(
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}" fill="${mix(teal, copper, p.n)}"/>` +
          `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(r * 3.4).toFixed(1)}" fill="${mix(teal, copper, p.n)}" opacity=".18"/>`,
      )
    }
  }

  return {
    defs: `
<linearGradient id="${id}-crest" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${teal}" stop-opacity=".9"/>
  <stop offset=".45" stop-color="${teal}"/>
  <stop offset=".78" stop-color="${copper}"/>
  <stop offset="1" stop-color="${copper}" stop-opacity=".85"/>
</linearGradient>
<linearGradient id="${id}-fade" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0" stop-color="#fff" stop-opacity=".35"/>
  <stop offset=".28" stop-color="#fff" stop-opacity="1"/>
  <stop offset="1" stop-color="#fff" stop-opacity="1"/>
</linearGradient>
<mask id="${id}-mask">
  <rect x="${x - w * 0.1}" y="${y - h * 0.15}" width="${w * 1.2}" height="${h * 1.3}" fill="url(#${id}-fade)"/>
</mask>`,
    markup:
      `<g mask="url(#${id}-mask)">` +
      `<g${animate ? ' class="wipe d2"' : ''}>` +
      // soft glow under the crest only
      (highlight && glow
        ? `<path d="${crestD}" stroke="${copper}" stroke-width="7" opacity="${(0.12 * glow).toFixed(2)}" filter="url(#soft)" fill="none"/>`
        : '') +
      colPaths.join('') +
      rowPaths.join('') +
      (highlight
        ? `<path d="${crestD}" stroke="url(#${id}-crest)" stroke-width="1.5" opacity="${(0.92 * glow).toFixed(2)}" stroke-linecap="round"/>` +
          `<path d="${crestD}" stroke="${copper}" stroke-width="2.6" opacity="${(0.16 * glow).toFixed(2)}" filter="url(#soft)"/>`
        : '') +
      signalNodes.join('') +
      `</g></g>`,
  }
}
