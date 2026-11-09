/**
 * Contribution field.
 *
 * A restrained custom calendar drawn from the contribution counts captured by
 * tools/fetch-repo-data.mjs (tools/repo-data.json), not a third-party stats
 * card. Colour carries intensity on a teal ramp; the total is labelled with
 * its capture date so it is never mistaken for a live figure.
 *
 * The window ends on the data's own capture date rather than a hardcoded day,
 * so the plate cannot silently describe a stale period. Month ticks and weekday
 * labels are omitted: at the size this plate is displayed they measured below
 * four CSS pixels, which is decoration pretending to be information. The grid,
 * the total and the capture date carry the meaning, and the alt text states the
 * period in words.
 *
 * Cells are emitted as <use> references to one rounded rect per layout. The
 * earlier per-cell <rect> markup was the main reason this asset needed 51-59 KB.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  ROOT, schemeOf, text, label, rule, grain, plateRect, plateClip,
} from './lib/svg.mjs'
import { asset } from './lib/asset.mjs'
import { bracketFrame } from './lib/marks.mjs'

const raw = JSON.parse(readFileSync(join(ROOT, 'tools', 'repo-data.json'), 'utf8'))
const byDay = raw.activity?.byDay ?? {}
const captured = raw.generated
if (!captured) throw new Error('repo-data.json has no capture date; run tools/fetch-repo-data.mjs')

const END = new Date(`${captured}T00:00:00Z`)
if (Number.isNaN(END.valueOf())) throw new Error(`repo-data capture date is invalid: ${captured}`)
const WEEKS = 53
const start = new Date(END)
start.setUTCDate(start.getUTCDate() - (WEEKS * 7 - 1))
// Align to Sunday so the grid reads like a calendar.
while (start.getUTCDay() !== 0) start.setUTCDate(start.getUTCDate() - 1)

const days = []
for (let i = 0; i < WEEKS * 7; i++) {
  const d = new Date(start)
  d.setUTCDate(d.getUTCDate() + i)
  const key = d.toISOString().slice(0, 10)
  const count = d > END ? null : (byDay[key] ?? 0)
  days.push({ date: d, key, count })
}

const counted = days.filter((d) => d.count !== null)
const total = counted.reduce((sum, d) => sum + d.count, 0)
const max = Math.max(1, ...counted.map((d) => d.count))

const level = (count) => {
  if (count === null) return -1
  if (count === 0) return 0
  const ratio = count / max
  if (ratio < 0.08) return 1
  if (ratio < 0.2) return 2
  if (ratio < 0.45) return 3
  return 4
}

const RAMPS = {
  dark: ['#16222B', '#0E3B3A', '#0F6E68', '#19A79E', '#22D3C5'],
  light: ['#EDE7DA', '#CDE7E3', '#8ACFC8', '#2E9A92', '#0B6E6A'],
}

async function render(scheme, layout) {
  const sc = schemeOf(scheme)
  const mobile = layout === 'mobile'
  const w = mobile ? 480 : 1200
  const h = mobile ? 340 : 300
  const pad = mobile ? 24 : 44

  const cell = mobile ? 5 : 13
  const gap = mobile ? 1.3 : 3.5
  const gridW = WEEKS * (cell + gap)

  const a = asset({
    w, h, scheme,
    path: `assets/activity/activity-${layout}-${scheme}.svg`,
    title: `Public commit activity, ${total} commits in the last year`,
    desc:
      `A ${WEEKS}-week calendar of ${total} public commits captured from the GitHub API on ${captured}. ` +
      'Each square is one day; teal intensity indicates more commits. Public repositories only.',
    defs:
      plateClip('actPlate', w, h) +
      `<rect id="acell" width="${cell}" height="${cell}" rx="${mobile ? 1.4 : 2.4}"/>`,
  })

  a.node(plateRect(w, h, sc.surface, sc.border))
  a.node(`<g clip-path="url(#actPlate)">`)

  // On the phone plate the full title and the capture date together exceed
  // the plate width at a legible size, so the eyebrow shortens and the
  // twelve-month period stays in the alt text and the Markdown caption.
  a.node(label(pad, mobile ? 34 : 36, mobile ? 'GITHUB ACTIVITY' : 'GITHUB ACTIVITY / LAST 12 MONTHS', {
    size: mobile ? 16 : 12, tracking: mobile ? 1.4 : 1.9, fill: sc.textFaint,
  }))
  a.node(label(w - pad, mobile ? 34 : 36, `CAPTURED ${captured.toUpperCase()}`, {
    size: mobile ? 13 : 10.5, tracking: 1.2, fill: sc.textFaint, anchor: 'end',
  }))
  a.node(rule(pad, mobile ? 50 : 52, w - pad, mobile ? 50 : 52, sc.border, 0.85))

  const gridX = mobile ? pad : w - pad - gridW
  const gridY = mobile ? 194 : 112

  // Cells grouped by intensity: five <g> elements instead of 365 <rect>.
  for (let lv = 0; lv <= 4; lv++) {
    const uses = []
    days.forEach((d, i) => {
      if (d.count === null) return
      if (level(d.count) !== lv) return
      const week = Math.floor(i / 7)
      const weekday = i % 7
      uses.push(
        `<use href="#acell" x="${(gridX + week * (cell + gap)).toFixed(1)}" y="${(gridY + weekday * (cell + gap)).toFixed(1)}"/>`,
      )
    })
    if (!uses.length) continue
    const ramp = RAMPS[scheme]
    a.node(`<g fill="${ramp[lv]}"${lv === 0 ? ' opacity=".75"' : ''}>${uses.join('')}</g>`)
  }

  // headline figure
  a.node(text(pad, mobile ? 122 : 142, String(total), {
    family: 'serif', size: mobile ? 54 : 62, weight: 500, fill: sc.text, tracking: -1,
  }))
  a.node(label(pad, mobile ? 148 : 166, 'PUBLIC COMMITS', {
    size: mobile ? 17 : 13, tracking: mobile ? 1.2 : 1.8, fill: sc.textMuted,
  }))
  a.node(label(pad, mobile ? 168 : 184, 'THREE FEATURED REPOSITORIES', {
    size: mobile ? 12 : 10.5, tracking: mobile ? 0.8 : 1.1, fill: sc.textFaint,
  }))

  // legend
  const legendY = h - (mobile ? 30 : 30)
  const step = mobile ? 16 : 18
  const legendX = w - pad - step * 5 - (mobile ? 44 : 38)
  a.node(label(legendX - 12, legendY + 6, 'LESS', {
    size: mobile ? 16 : 11, tracking: 1, fill: sc.textFaint, anchor: 'end',
  }))
  for (let i = 0; i < 5; i++) {
    a.node(`<rect x="${legendX + i * step}" y="${legendY - 3}" width="${mobile ? 10 : 11}" height="${mobile ? 10 : 11}" rx="2" fill="${RAMPS[scheme][i]}"/>`)
  }
  a.node(label(legendX + 5 * step + 8, legendY + 6, 'MORE', {
    size: mobile ? 16 : 11, tracking: 1, fill: sc.textFaint,
  }))

  a.node(bracketFrame(w - pad - 30, h - 26, 30, 16, sc.borderStrong, { len: 6, opacity: 0.4 }))
  a.node(grain(sc, w, h))
  a.node(`</g>`)
  await a.commit()
}

for (const layout of ['desktop', 'mobile']) {
  for (const scheme of ['dark', 'light']) await render(scheme, layout)
}
console.log(`activity done — ${total} contributions, window ending ${captured}`)
