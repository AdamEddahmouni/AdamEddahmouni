/**
 * Instrumentation marks.
 *
 * The reference's technical character comes from small, precise furniture:
 * concentric arcs, radial ticks, hairline rules, bracket frames, and custom
 * icons drawn on the same 24-unit grid. Keeping it here means every asset
 * shares one vocabulary instead of each illustration inventing its own.
 */

import { tokens, text, label } from './svg.mjs'

/**
 * Circular instrumentation: arcs, ticks, crosshair, optional orbit node.
 * Deliberately abstract — no invented coordinates or readings.
 */
export function ring(cx, cy, r, sc, {
  arcs = [{ from: 200, to: 340, opacity: 0.5 }],
  ticks = 48,
  tickLength = 5,
  crosshair = true,
  opacity = 1,
  stroke = sc.borderStrong,
} = {}) {
  const parts = []
  const polar = (radius, deg) => {
    const a = ((deg - 90) * Math.PI) / 180
    return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)]
  }

  for (const arc of arcs) {
    const [x1, y1] = polar(r, arc.from)
    const [x2, y2] = polar(r, arc.to)
    const large = Math.abs(arc.to - arc.from) > 180 ? 1 : 0
    parts.push(
      `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}A${r} ${r} 0 ${large} 1 ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${arc.color ?? stroke}" stroke-width=".9" opacity="${(arc.opacity ?? 0.4) * opacity}"/>`,
    )
  }

  for (let i = 0; i < ticks; i++) {
    const deg = (360 / ticks) * i
    const major = i % 6 === 0
    const [x1, y1] = polar(r - (major ? tickLength * 1.6 : tickLength), deg)
    const [x2, y2] = polar(r, deg)
    parts.push(
      `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${stroke}" stroke-width=".75" opacity="${(major ? 0.55 : 0.3) * opacity}"/>`,
    )
  }

  if (crosshair) {
    parts.push(
      `<line x1="${cx - r}" y1="${cy}" x2="${cx + r}" y2="${cy}" stroke="${stroke}" stroke-width=".6" opacity="${0.28 * opacity}"/>`,
      `<line x1="${cx}" y1="${cy - r}" x2="${cx}" y2="${cy + r}" stroke="${stroke}" stroke-width=".6" opacity="${0.28 * opacity}"/>`,
      `<circle cx="${cx}" cy="${cy}" r="1.6" fill="${sc.brand.teal}" opacity="${0.75 * opacity}"/>`,
    )
  }

  return parts.join('')
}

/** Small tick ruler, used beneath section headers and at panel feet. */
export function ruler(x, y, width, sc, { count = 32, height = 4, opacity = 0.4 } = {}) {
  const parts = []
  for (let i = 0; i <= count; i++) {
    const px = x + (width / count) * i
    const h = i % 8 === 0 ? height * 2 : height
    parts.push(
      `<line x1="${px.toFixed(1)}" y1="${y}" x2="${px.toFixed(1)}" y2="${y + h}" stroke="${sc.borderStrong}" stroke-width=".75" opacity="${opacity}"/>`,
    )
  }
  return parts.join('')
}

/**
 * Section header: the copper tick and tracked label from the reference, with
 * an optional hairline that runs to the right margin.
 */
export function sectionHeader(x, y, title, sc, {
  ruleTo = null,
  tickWidth = 4,
  tickHeight = 13,
  size = tokens.type.scale.label,
  color = sc.text,
  ruleColor = sc.border,
  tracking = 2.6,
} = {}) {
  const parts = [
    `<rect x="${x}" y="${y - tickHeight + 2}" width="${tickWidth}" height="${tickHeight}" rx="1" fill="${sc.brand.copper}"/>`,
    label(x + tickWidth + 12, y, title, { size, tracking, fill: color }),
  ]
  if (ruleTo) {
    const start = x + tickWidth + 12 + title.length * (size * 0.78 + tracking) + 16
    parts.push(`<line x1="${start}" y1="${y - 4}" x2="${ruleTo}" y2="${y - 4}" stroke="${ruleColor}" stroke-width="1"/>`)
  }
  return parts.join('')
}

const ICONS = {
  engineering: [
    'M9.2 7.4 4.6 12l4.6 4.6',
    'M14.8 7.4 19.4 12l-4.6 4.6',
    'M13.4 4.8 10.6 19.2',
  ],
  ai: [
    'M12 3.6 18.4 7.4 12 11.2 5.6 7.4Z',
    'M12 11.2 18.4 15 12 18.8 5.6 15Z',
    'M12 11.2v3.8',
    'M5.6 7.4v3.9',
    'M18.4 7.4v3.9',
  ],
  research: [
    'M12 4.2a7.2 7.2 0 1 0 0 14.4 7.2 7.2 0 0 0 0-14.4Z',
    'M12 4.2v3.1M12 15.5v3.1M4.8 11.4h3.1M15.9 11.4h3.1',
    'M16.6 4.4 19.8 4.4 19.8 7.6',
    'M12 11.4a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z',
  ],
  markets: [
    'M3.8 17.6 8.6 12.4l3.1 2.5 5.4-6.2 3 2.2',
    'M3.8 20.2h16.4',
    'M8.6 17.2v2.9M12.1 18v2.1M16.9 12.4v6',
  ],
  mail: [
    'M3.8 6.6h16.4v10.8H3.8Z',
    'm3.8 7.4 8.2 5.8 8.2-5.8',
  ],
  github: [
    'M12 3.4a8.6 8.6 0 0 0-2.7 16.8c.4.1.6-.2.6-.5v-1.8c-2.4.5-2.9-1.1-2.9-1.1-.4-1-1-1.3-1-1.3-.8-.6.1-.6.1-.6.9.1 1.3.9 1.3.9.8 1.4 2.1 1 2.6.8.1-.6.3-1 .6-1.3-1.9-.2-3.9-1-3.9-4.3 0-.9.3-1.7.9-2.3-.1-.2-.4-1.1.1-2.3 0 0 .7-.2 2.4.9a8.3 8.3 0 0 1 4.4 0c1.6-1.1 2.4-.9 2.4-.9.5 1.2.2 2.1.1 2.3.6.6.9 1.4.9 2.3 0 3.3-2 4-3.9 4.3.3.3.6.9.6 1.8v2.6c0 .3.2.6.6.5A8.6 8.6 0 0 0 12 3.4Z',
  ],
  arrow: ['M5 12h13.4', 'm13.6 7.2 4.8 4.8-4.8 4.8'],
  doc: [
    'M6.2 3.8h8l4 4v12.4H6.2Z',
    'M14.2 3.8v4h4',
    'M9 12.4h6M9 15.8h6',
  ],
  link: [
    'M10.2 13.8a3.4 3.4 0 0 0 4.9 0l2.8-2.8a3.5 3.5 0 0 0-4.9-4.9l-1.4 1.4',
    'M13.8 10.2a3.4 3.4 0 0 0-4.9 0l-2.8 2.8a3.5 3.5 0 0 0 4.9 4.9l1.4-1.4',
  ],
}

/**
 * Custom icon on a 24-unit grid. `size` is the drawn box; stroke weight scales
 * with it so a 20px glyph is not heavier than a 40px one.
 */
export function icon(name, x, y, size, color, { opacity = 1, strokeWidth = null, filled = false } = {}) {
  const paths = ICONS[name]
  if (!paths) throw new Error(`unknown icon: ${name}`)
  const scale = size / 24
  const sw = strokeWidth ?? (size > 30 ? 1.15 : 1.45)
  return `<g transform="translate(${x} ${y}) scale(${scale})" opacity="${opacity}" ${
    filled
      ? `fill="${color}"`
      : `fill="none" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`
  }>${paths.map((d) => `<path d="${d}"/>`).join('')}</g>`
}

/** Right-pointing connector with a small arrowhead, used by the pipeline diagram. */
export function connector(x1, y1, x2, y2, color, { opacity = 0.7, dash = null } = {}) {
  const mx = (x1 + x2) / 2
  return (
    `<path d="M${x1} ${y1}C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}" stroke="${color}" stroke-width="1.1" fill="none" opacity="${opacity}"${dash ? ` stroke-dasharray="${dash}"` : ''}/>` +
    `<path d="M${x2 - 6} ${y2 - 3.4}L${x2} ${y2}L${x2 - 6} ${y2 + 3.4}" stroke="${color}" stroke-width="1.1" fill="none" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>`
  )
}

/** Vertical variant for the mobile pipeline. */
export function connectorDown(x1, y1, x2, y2, color, { opacity = 0.7 } = {}) {
  const my = (y1 + y2) / 2
  return (
    `<path d="M${x1} ${y1}C${x1} ${my} ${x2} ${my} ${x2} ${y2}" stroke="${color}" stroke-width="1.1" fill="none" opacity="${opacity}"/>` +
    `<path d="M${x2 - 3.4} ${y2 - 6}L${x2} ${y2}L${x2 + 3.4} ${y2 - 6}" stroke="${color}" stroke-width="1.1" fill="none" opacity="${opacity}" stroke-linecap="round" stroke-linejoin="round"/>`
  )
}

/** Bracket frame for artwork plates. */
export function bracketFrame(x, y, w, h, stroke, { len = 18, opacity = 0.45 } = {}) {
  const d = [
    `M${x} ${y + len}V${y}H${x + len}`,
    `M${x + w - len} ${y}H${x + w}V${y + len}`,
    `M${x + w} ${y + h - len}V${y + h}H${x + w - len}`,
    `M${x + len} ${y + h}H${x}V${y + h - len}`,
  ].join(' ')
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="1" opacity="${opacity}"/>`
}

/** A labelled technical figure caption inside artwork. */
export function figure(x, y, no, caption, sc, { color = sc.textFaint } = {}) {
  return (
    text(x, y, no, { size: 9, family: 'mono', weight: 500, fill: color, tracking: 1.6 }) +
    text(x + 22, y, caption, { size: 9, family: 'mono', weight: 400, fill: color, tracking: 1.2 })
  )
}
