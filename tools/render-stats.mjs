/**
 * Signal: account figures, language composition, and public commit activity.
 *
 * Two honesty constraints shape this. The language card covers the project
 * repos only, and those repos contain large vendored datasets - so the card
 * says what it measures instead of implying it measures skill. The activity
 * grid is built from public commit timestamps rather than the contributions
 * calendar, which needs a token CI does not have, and it is labelled as public
 * commits accordingly.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, tokens, schemeOf, accent, dotField, dotFill, grain } from './lib/svg.mjs'
import { asset } from './lib/asset.mjs'
import { heatGrid } from './lib/motifs.mjs'

const data = JSON.parse(readFileSync(join(ROOT, 'tools', 'repo-data.json'), 'utf8'))

// language brand colours, for the swatches only
const LANG_COLOR = {
  Python: '#3776AB', TypeScript: '#3178C6', JavaScript: '#F7DF1E', CSS: '#563D7C',
  HTML: '#E34C26', Shell: '#89E051', Dockerfile: '#2496ED', Makefile: '#427819',
  PowerShell: '#012456', MATLAB: '#E16737', Redis: '#DC382D', Markdown: '#083FA1',
  Batchfile: '#C1F12E', Jupyter: '#DA5B0B',
}

const fmt = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n))

// ---------------------------------------------------------------------------

async function stats(scheme) {
  const sc = schemeOf(scheme)
  const acc = data.account ?? {}
  const commits = data.activity?.total ?? 0
  const activeDays = Object.keys(data.activity?.byDay ?? {}).length
  const stars = Object.values(data.repos).reduce((a, r) => a + (r.stars ?? 0), 0)

  const tiles = [
    [fmt(commits), 'public commits · 12mo', sc.brand.teal],
    [String(acc.publicRepos ?? 0), 'public repositories', sc.brand.blue],
    [String(activeDays), 'active days', sc.brand.violet],
    [String(acc.followers ?? 0), 'followers', sc.brand.blue],
  ]

  const W = 600
  const H = 214
  const a = asset({
    w: W, h: H, scheme,
    path: `assets/stats/stats-${scheme}.svg`,
    title: 'Repository and account figures',
    desc:
      `Public commits in the last twelve months: ${commits}. ` +
      `Public repositories: ${acc.publicRepos ?? 0}. Active days: ${activeDays}. ` +
      `Followers: ${acc.followers ?? 0}. Stars across the project repositories: ${stars}.`,
    defs: dotField('dots', scheme, 18, 1),
  })

  a.node(`<rect width="${W}" height="${H}" rx="12" fill="${sc.surface}" stroke="${sc.border}"/>`)
  a.node(`<rect width="${W}" height="${H}" rx="12" fill="url(#dots)" opacity=".45"/>`)
  a.node(`<rect x="20" y="20" width="${W - 40}" height="2" rx="1" fill="${sc.brand.teal}" opacity=".7"/>`)
  a.text(20, 48, 'signal', { size: 15, family: 'display', weight: 700, fill: sc.text })
  a.text(W - 20, 48, 'public data only', { size: 10, family: 'mono', weight: 500, fill: sc.textFaint, anchor: 'end' })

  tiles.forEach(([value, label, col], i) => {
    const x = 20 + (i % 2) * ((W - 40) / 2)
    const y = 78 + Math.floor(i / 2) * 68
    a.node(
      `<g class="rise d${i + 2}">` +
        `<rect x="${x}" y="${y}" width="${(W - 40) / 2 - 8}" height="58" rx="8" fill="${sc.surfaceAlt}" stroke="${sc.border}"/>` +
        `<rect x="${x}" y="${y + 12}" width="2" height="34" rx="1" fill="${col}"/>` +
      `</g>`,
    )
    a.text(x + 14, y + 32, value, { size: 24, family: 'display', weight: 700, fill: sc.text, tabular: true })
    a.text(x + 14, y + 48, label, { size: 9.5, family: 'mono', weight: 500, fill: sc.textMuted })
  })

  a.node(grain(scheme))
  await a.commit()
}

// ---------------------------------------------------------------------------

async function langs(scheme) {
  const sc = schemeOf(scheme)
  const rows = (data.languages ?? []).filter((l) => l.pct >= 0.1).slice(0, 6)
  const W = 600
  const rowH = 26
  const H = 122 + rows.length * rowH
  const barX = 150
  const barW = 300

  const a = asset({
    w: W, h: H, scheme,
    path: `assets/stats/langs-${scheme}.svg`,
    title: 'Language composition',
    desc:
      'Byte composition across the project repositories, which include large ' +
      'vendored datasets, so it reflects repository contents rather than proficiency.',
    defs: dotField('dots', scheme, 18, 1),
  })

  a.node(`<rect width="${W}" height="${H}" rx="12" fill="${sc.surface}" stroke="${sc.border}"/>`)
  a.node(`<rect width="${W}" height="${H}" rx="12" fill="url(#dots)" opacity=".45"/>`)
  a.node(`<rect x="20" y="20" width="${W - 40}" height="2" rx="1" fill="${sc.brand.blue}" opacity=".7"/>`)
  a.text(20, 48, 'repository composition', { size: 15, family: 'display', weight: 700, fill: sc.text })

  rows.forEach((l, i) => {
    const y = 76 + i * rowH
    const col = LANG_COLOR[l.name] ?? sc.textFaint
    a.node(
      `<circle cx="26" cy="${y - 4}" r="4" fill="${col}"/>` +
      `<text x="38" y="${y}" font-family="${500} 11px ${tokens.type.mono.family}, ${tokens.type.monoStack}" fill="${sc.text}">${l.name}</text>`,
    )
    a.node(
      `<rect x="${barX}" y="${y - 11}" width="${barW}" height="8" rx="4" fill="${sc.surfaceAlt}"/>`,
    )
    a.node(
      `<rect x="${barX}" y="${y - 11}" width="${Math.max(6, (l.pct / 100) * barW).toFixed(1)}" height="8" rx="4" fill="${col}" opacity=".9" style="transform-origin:${barX}px ${y - 7}px;animation:grow .7s cubic-bezier(.4,0,.2,1) both;animation-delay:${(i * 0.06).toFixed(2)}s"/>`,
    )
    a.text(W - 20, y, `${l.pct}%`, { size: 10.5, family: 'mono', weight: 500, fill: sc.textMuted, anchor: 'end', tabular: true })
  })

  a.text(
    20, H - 16,
    'by bytes across project repos · includes vendored datasets',
    { size: 9.5, family: 'mono', weight: 500, fill: sc.textFaint },
  )
  a.node(grain(scheme))
  await a.commit()
}

// ---------------------------------------------------------------------------

function buildWeeks(byDay) {
  // 53 columns ending with the current week, each column Sunday..Saturday
  const today = new Date()
  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - 52 * 7 - end.getUTCDay())
  const weeks = []
  for (let w = 0; w < 53; w++) {
    const col = []
    for (let d = 0; d < 7; d++) {
      const day = new Date(start)
      day.setUTCDate(start.getUTCDate() + w * 7 + d)
      if (day > end) { col.push(undefined); continue }
      const key = day.toISOString().slice(0, 10)
      const n = byDay[key] ?? 0
      col.push(n === 0 ? 0 : n === 1 ? 1 : n <= 2 ? 2 : n <= 4 ? 3 : 4)
    }
    weeks.push(col)
  }
  return { weeks, start, end }
}

async function activity(scheme) {
  const sc = schemeOf(scheme)
  const { weeks, start, end } = buildWeeks(data.activity?.byDay ?? {})

  const cell = 13
  const gap = 4
  const gridW = 53 * (cell + gap) - gap
  const W = 1200
  const H = 236
  const gx = 28
  const gy = 74

  const a = asset({
    w: W, h: H, scheme,
    path: `assets/stats/activity-${scheme}.svg`,
    title: 'Public commit activity, last twelve months',
    desc:
      'A calendar heatmap of commit timestamps on public repositories over the last ' +
      'twelve months, built from the public API rather than the private contributions calendar.',
    defs: dotField('dots', scheme, 22, 1),
  })

  a.node(`<rect width="${W}" height="${H}" rx="12" fill="${sc.surface}" stroke="${sc.border}"/>`)
  a.node(`<rect width="${W}" height="${H}" rx="12" fill="url(#dots)" opacity=".4"/>`)
  a.node(`<rect x="28" y="20" width="${W - 56}" height="2" rx="1" fill="${sc.brand.violet}" opacity=".7"/>`)
  a.text(28, 50, 'public commit activity', { size: 15, family: 'display', weight: 700, fill: sc.text })
  a.text(
    W - 28, 50,
    `${start.toISOString().slice(0, 7)} → ${end.toISOString().slice(0, 7)} · ${data.activity?.total ?? 0} commits`,
    { size: 10, family: 'mono', weight: 500, fill: sc.textFaint, anchor: 'end' },
  )

  a.node(
    `<g class="rise d2" transform="translate(${gx} ${gy})">${heatGrid(scheme, 0, 0, cell, gap, weeks)}</g>`,
  )

  // month ticks along the top
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  let lastMonth = -1
  weeks.forEach((_, w) => {
    const day = new Date(start)
    day.setUTCDate(start.getUTCDate() + w * 7)
    if (day.getUTCMonth() !== lastMonth && w > 1) {
      lastMonth = day.getUTCMonth()
      a.text(gx + w * (cell + gap), gy - 8, MONTHS[lastMonth], {
        size: 9, family: 'mono', weight: 500, fill: sc.textFaint,
      })
    }
  })

  // weekday ticks on the left
  ;['Mon', 'Wed', 'Fri'].forEach((d, i) => {
    a.text(gx - 10, gy + (i * 2 + 1) * (cell + gap) - 3, d, {
      size: 9, family: 'mono', weight: 500, fill: sc.textFaint, anchor: 'end',
    })
  })

  // ramp legend
  const lx = gx
  const ly = gy + 7 * (cell + gap) + 26
  a.text(lx, ly, 'less', { size: 9, family: 'mono', weight: 500, fill: sc.textFaint })
  sc.heat.forEach((c, i) => {
    a.node(`<rect x="${lx + 32 + i * (cell + 4)}" y="${ly - 10}" width="${cell}" height="${cell}" rx="3" fill="${c}"/>`)
  })
  a.text(lx + 32 + sc.heat.length * (cell + 4) + 4, ly, 'more', {
    size: 9, family: 'mono', weight: 500, fill: sc.textFaint,
  })

  a.text(
    W - 28, ly,
    'built from public commit timestamps, not the private contributions calendar',
    { size: 9.5, family: 'mono', weight: 500, fill: sc.textFaint, anchor: 'end' },
  )
  a.node(grain(scheme))
  await a.commit()
}

for (const scheme of ['dark', 'light']) {
  await stats(scheme)
  await langs(scheme)
  await activity(scheme)
}
console.log('stats done')
