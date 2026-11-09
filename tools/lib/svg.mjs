/**
 * Shared SVG primitives for the Engineering Studio design system.
 *
 * Every generated asset goes through this module so grid, type scale, radii,
 * palette and colour maths are applied identically across the profile. Nothing
 * here touches the network at render time: font subsets are resolved ahead of
 * time by tools/lib/fonts.mjs and cached in tools/lib/font-cache.json.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
export const ROOT = join(here, '..', '..')

export const tokens = JSON.parse(
  readFileSync(join(ROOT, 'tools', 'design-tokens.json'), 'utf8'),
)

export const esc = (s) =>
  String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

export const schemeOf = (s) => {
  const scheme = tokens.schemes[s]
  if (!scheme) throw new Error(`unknown scheme: ${s}`)
  return scheme
}

// ---------------------------------------------------------------------------
// colour maths
// ---------------------------------------------------------------------------

export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v))
export const lerp = (a, b, t) => a + (b - a) * t

export const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0 || 1e-9))
  return t * t * (3 - 2 * t)
}

const parseHex = (hex) => {
  let h = hex.replace('#', '').trim()
  if (h.length === 3) h = h.split('').map((c) => c + c).join('')
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}

export const mix = (a, b, t) => {
  const [r1, g1, b1] = parseHex(a)
  const [r2, g2, b2] = parseHex(b)
  const k = clamp(t)
  const to = (v) => Math.round(v).toString(16).padStart(2, '0')
  return `#${to(lerp(r1, r2, k))}${to(lerp(g1, g2, k))}${to(lerp(b1, b2, k))}`
}

export const withAlpha = (hex, a) => `${hex}${Math.round(clamp(a) * 255).toString(16).padStart(2, '0')}`

const srgb = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)

export function luminance(hex) {
  const [r, g, b] = parseHex(hex).map((v) => srgb(v / 255))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

export const aa = (a, b, large = false) => contrast(a, b) >= (large ? 3 : 4.5)

// ---------------------------------------------------------------------------
// typography
// ---------------------------------------------------------------------------

const stacks = () => tokens.type

export const serif = (size, weight = 400) =>
  `${weight} ${size}px '${stacks().serif.family}', Georgia, 'Times New Roman', serif`
export const sans = (size, weight = 400) =>
  `${weight} ${size}px ${stacks().sans.stack}`
export const mono = (size, weight = 400) =>
  `${weight} ${size}px '${stacks().mono.family}', ${stacks().mono.stack}`

const fontFor = (family, size, weight) =>
  family === 'serif' ? serif(size, weight)
    : family === 'mono' ? mono(size, weight)
      : sans(size, weight)

/** A <text> node with the system's typographic defaults applied. */
export function text(x, y, str, opts = {}) {
  const {
    size = tokens.type.scale.body,
    family = 'sans',
    weight = 400,
    fill = schemeOf('dark').text,
    anchor = 'start',
    tracking = 0,
    tabular = false,
    opacity,
    extra = '',
  } = opts

  if (/font-family|font:|style=/.test(extra)) {
    throw new Error('text(): pass family/size/weight/tracking, not style or font attributes')
  }

  const attrs = [
    `x="${x}"`, `y="${y}"`,
    `style="font:${esc(fontFor(family, size, weight))}${tabular ? ';font-variant-numeric:tabular-nums' : ''}"`,
    `fill="${fill}"`,
  ]
  if (anchor !== 'start') attrs.push(`text-anchor="${anchor}"`)
  if (tracking) attrs.push(`letter-spacing="${tracking}"`)
  if (opacity !== undefined) attrs.push(`opacity="${opacity}"`)
  if (extra) attrs.push(extra)
  return `<text ${attrs.join(' ')}>${esc(str)}</text>`
}

/** Uppercase technical label: the reference's widest-tracked type. */
export function label(x, y, str, opts = {}) {
  return text(x, y, str, {
    family: 'mono',
    size: tokens.type.scale.label,
    weight: 500,
    tracking: 2.4,
    ...opts,
  })
}

/** Greedy word wrap for SVG, which has no automatic wrapping. */
export function wrapText(str, maxWidth, { size = 12, ratio = 0.53, maxLines = 99 } = {}) {
  const perLine = Math.max(8, Math.floor(maxWidth / (size * ratio)))
  const words = String(str).split(/\s+/)
  const lines = []
  let line = ''
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word
    if (candidate.length > perLine && line) {
      lines.push(line)
      line = word
    } else {
      line = candidate
    }
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines)
    kept[maxLines - 1] = kept[maxLines - 1].replace(/.{0,3}$/, '') + '…'
    return kept
  }
  return lines
}

// ---------------------------------------------------------------------------
// surfaces and rules
// ---------------------------------------------------------------------------

/** Hairline rule. */
export const rule = (x1, y1, x2, y2, stroke, opacity = 1) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1" opacity="${opacity}"/>`

/**
 * A framed plate: every asset is a rounded panel inset by one unit so the
 * page behind it shows at the corners. This is what lets one dark plate sit on
 * GitHub's light theme (and a paper plate on the dark theme) without the
 * artwork needing to know the page colour.
 */
export const plateRect = (w, h, fill, stroke, radius = 16) =>
  `<rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${radius}" fill="${fill}" stroke="${stroke}"/>`

export const plateClip = (id, w, h, radius = 16) =>
  `<clipPath id="${id}"><rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="${radius}"/></clipPath>`

/** Thin panel used by every framed component. */
export function panel(x, y, w, h, sc, {
  radius = tokens.radius.panel,
  fill = sc.surface,
  stroke = sc.border,
  strokeWidth = 1,
  className = '',
} = {}) {
  return `<rect ${className ? `class="${className}" ` : ''}x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`
}

export function chip(x, y, textStr, sc, {
  accent = sc.brand.teal,
  size = tokens.type.scale.micro,
  padX = 10,
  h = 22,
} = {}) {
  const w = Math.round(textStr.length * size * 0.62 + padX * 2)
  return {
    w,
    markup:
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${tokens.radius.chip}" fill="${accent}" fill-opacity=".10" stroke="${accent}" stroke-opacity=".38"/>` +
      text(x + w / 2, y + h / 2 + size * 0.36, textStr, {
        size, family: 'mono', weight: 500, fill: accent, anchor: 'middle',
      }),
  }
}

/** Ambient dot grid emitted as a pattern, not one element per dot. */
export function dotField(id, sc, step = 28, r = 1) {
  return `<pattern id="${id}" width="${step}" height="${step}" patternUnits="userSpaceOnUse"><circle cx="${r}" cy="${r}" r="${r}" fill="${sc.grid}"/></pattern>`
}

export const dotFill = (x, y, w, h, id, opacity = 0.5) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id})" opacity="${opacity}"/>`

/** Grain: prevents large flat gradients from banding. */
export const grain = (sc, w, h) =>
  `<rect width="${w}" height="${h}" filter="url(#grainF)" opacity="${sc.grain}" style="mix-blend-mode:overlay"/>`

export const radialBloom = (cx, cy, r, colorHex, opacity) =>
  `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${colorHex}" opacity="${opacity}" filter="url(#bloom)"/>`

export const vline = (x, y1, y2, stroke, opacity = 1) =>
  `<line x1="${x}" y1="${y1}" x2="${x}" y2="${y2}" stroke="${stroke}" stroke-width="1" opacity="${opacity}"/>`

/** Small alignment bracket used at panel corners. */
export function cornerMarks(x, y, w, h, stroke, { len = 16, opacity = 0.55, inset = 0 } = {}) {
  const x0 = x + inset, y0 = y + inset, x1 = x + w - inset, y1 = y + h - inset
  const d = [
    `M${x0} ${y0 + len}V${y0}H${x0 + len}`,
    `M${x1 - len} ${y0}H${x1}V${y0 + len}`,
    `M${x1} ${y1 - len}V${y1}H${x1 - len}`,
    `M${x0 + len} ${y1}H${x0}V${y1 - len}`,
  ].join(' ')
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="1" opacity="${opacity}"/>`
}
