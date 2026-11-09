/**
 * Contribution field.
 *
 * A restrained custom calendar drawn from the contribution counts captured by
 * tools/fetch-repo-data.mjs (tools/repo-data.json), not a third-party stats
 * card. Colour carries intensity on a teal ramp; the total is labelled with
 * its capture date so it is never mistaken for a live figure.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  ROOT, schemeOf, text, label, rule, grain, mix, plateRect, plateClip,
} from './lib/svg.mjs'
import { asset } from './lib/asset.mjs'
import { bracketFrame } from './lib/marks.mjs'

const raw = JSON.parse(readFileSync(join(ROOT, 'tools', 'repo-data.json'), 'utf8'))
const byDay = raw.activity?.byDay ?? {}
const captured = raw.generated ?? 'unknown'

const END = new Date('2026-11-09T00:00:00Z')
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

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

function monthMarks(cell, gap, x0, y) {
  const marks = []
  let last = -1
  days.forEach((d, i) => {
    const week = Math.floor(i / 7)
    if (d.date.getUTCDate() <= 7 && d.date.getUTCMonth() !== last) {
      last = d.date.getUTCMonth()
      marks.push({ x: x0 + week * (cell + gap), label: MONTHS[last] })
    }
  })
  return marks
}

async function render(scheme, layout) {
  const sc = schemeOf(scheme)
  const mobile = layout === 'mobile'
  const w = mobile ? 480 : 1200
  // The phone plate stacks the figure above the calendar; the desktop plate
  // sets them side by side. Same height keeps the README rhythm even.
  const h = 300
  const pad = mobile ? 24 : 44

  const a = asset({
    w, h, scheme,
    path: `assets/activity/activity-${layout}-${scheme}.svg`,
    title: `GitHub contribution calendar, ${total} contributions in the last year`,
    desc:
      `A ${WEEKS}-week contribution calendar with ${total} contributions, captured from the GitHub API on ${captured}. ` +
      'Darker cells indicate fewer contributions; teal intensity indicates more.',
    defs: plateClip('actPlate', w, h),
  })

  a.node(plateRect(w, h, sc.surface, sc.border))
  a.node(`<g clip-path="url(#actPlate)">`)

  a.node(label(pad, mobile ? 32 : 36, 'GITHUB ACTIVITY / LAST 12 MONTHS', {
    size: mobile ? 8.6 : 10, tracking: mobile ? 1.2 : 2.2, fill: sc.textFaint,
  }))
  a.node(label(w - pad, mobile ? 32 : 36, `CAPTURED ${captured.toUpperCase()}`, {
    size: mobile ? 8.2 : 8.6, tracking: 1.4, fill: sc.textFaint, anchor: 'end',
  }))
  a.node(rule(pad, mobile ? 46 : 52, w - pad, mobile ? 46 : 52, sc.border, 0.85))

  const cell = mobile ? 6 : 13
  const gap = mobile ? 2 : 3.5
  const gridW = WEEKS * (cell + gap)
  const gridX = mobile ? pad : w - pad - gridW
  const gridY = mobile ? 168 : 110

  // month ticks
  for (const m of monthMarks(cell, gap, gridX, gridY)) {
    if (m.x > w - pad - 22) continue
    a.node(text(m.x, gridY - 8, m.label, {
      family: 'mono', size: mobile ? 6.1 : 7.6, weight: 500, fill: sc.textFaint, tracking: 1,
    }))
  }

  const ramp = RAMPS[scheme]
  days.forEach((d, i) => {
    const week = Math.floor(i / 7)
    const weekday = i % 7
    if (d.count === null) return
    const lv = level(d.count)
    a.node(
      `<rect x="${(gridX + week * (cell + gap)).toFixed(1)}" y="${gridY + weekday * (cell + gap)}" width="${cell}" height="${cell}" rx="${mobile ? 1.4 : 2.4}" fill="${ramp[lv]}" opacity="${lv === 0 ? 0.75 : 1}"/>`,
    )
  })

  // weekday labels
  if (!mobile) {
    for (const [row, name] of [[1, 'MON'], [3, 'WED'], [5, 'FRI']]) {
      a.node(text(gridX - 12, gridY + row * (cell + gap) + 9, name, {
        family: 'mono', size: 7.2, weight: 400, tracking: 1, fill: sc.textFaint, anchor: 'end',
      }))
    }
  }

  // headline figure
  a.node(text(pad, mobile ? 112 : 142, String(total), {
    family: 'serif', size: mobile ? 44 : 62, weight: 500, fill: sc.text, tracking: -1,
  }))
  a.node(label(pad, mobile ? 134 : 166, 'CONTRIBUTIONS', {
    size: mobile ? 8.4 : 9, tracking: 1.8, fill: sc.textMuted,
  }))
  a.node(label(pad, mobile ? 150 : 184, 'PUBLIC + PRIVATE, AS REPORTED', {
    size: mobile ? 7.4 : 8, tracking: 1.1, fill: sc.textFaint,
  }))

  // legend
  const legendY = h - (mobile ? 24 : 30)
  const step = mobile ? 12 : 18
  const legendX = w - pad - step * 5 - (mobile ? 30 : 38)
  a.node(label(legendX - 12, legendY + 6, 'LESS', {
    size: mobile ? 7.2 : 7.4, tracking: 1.2, fill: sc.textFaint, anchor: 'end',
  }))
  for (let i = 0; i < 5; i++) {
    a.node(`<rect x="${legendX + i * step}" y="${legendY - 3}" width="${mobile ? 8 : 11}" height="${mobile ? 8 : 11}" rx="2" fill="${ramp[i]}"/>`)
  }
  a.node(label(legendX + 5 * step + 6, legendY + 6, 'MORE', {
    size: mobile ? 7.2 : 7.4, tracking: 1.2, fill: sc.textFaint,
  }))

  a.node(bracketFrame(w - pad - 30, h - 26, 30, 16, sc.borderStrong, { len: 6, opacity: 0.4 }))
  a.node(grain(sc, w, h))
  a.node(`</g>`)
  await a.commit()
}

for (const layout of ['desktop', 'mobile']) {
  for (const scheme of ['dark', 'light']) await render(scheme, layout)
}
console.log(`activity done — ${total} contributions`)
