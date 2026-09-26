/**
 * Shared UI assets: dividers, status pill, footer, brand badges, stack chips.
 *
 * These are the connective tissue. The badges in particular are local SVGs
 * rather than shields.io because shields cannot set text colour, and white
 * text on the brand teal measures 1.89:1 - a real WCAG failure. Here the value
 * chip fills with the brand colour and the label sits on it in the scheme's
 * on-brand colour, which passes AA in both schemes.
 */

import { tokens, schemeOf, accent, icons, statusDot, grain } from './lib/svg.mjs'
import { asset } from './lib/asset.mjs'

const disp = (s, w = 700) =>
  `${w} ${s}px '${tokens.type.display.family}', ${tokens.type.bodyStack}`
const mon = (s, w = 500) =>
  `${w} ${s}px '${tokens.type.mono.family}', ${tokens.type.monoStack}`

// ---------------------------------------------------------------------------
// divider - a hairline with a highlight travelling along it
// ---------------------------------------------------------------------------

async function divider(scheme) {
  const sc = schemeOf(scheme)
  const a = asset({
    w: 1200, h: 3, scheme,
    path: `assets/ui/divider-${scheme}.svg`,
    title: '',
    desc: '',
    defs: `<linearGradient id="d" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${sc.border}"/>
      <stop offset=".5" stop-color="${sc.borderStrong}"/>
      <stop offset="1" stop-color="${sc.border}"/></linearGradient>
<clipPath id="line"><rect width="1200" height="3"/></clipPath>`,
  })
  a.node(`<rect y="1" width="1200" height="1" fill="url(#d)"/>`)
  // the highlight starts off-canvas, so it is clipped rather than left to
  // paint outside the viewport
  a.node(
    `<g clip-path="url(#line)" opacity="${scheme === 'dark' ? '.9' : '.75'}"><rect x="-160" width="160" height="3" fill="${sc.brand.teal}" opacity=".22" style="animation:sweep 7s linear infinite"/></g>`,
  )
  await a.commit()
}

// ---------------------------------------------------------------------------
// status pill
// ---------------------------------------------------------------------------

async function status(scheme) {
  const sc = schemeOf(scheme)
  const label = 'open to collaborations'
  const W = Math.round(label.length * 6.6 + 46)
  const H = 32
  const a = asset({
    w: W, h: H, scheme,
    path: `assets/ui/status-${scheme}.svg`,
    title: `Status: ${label}`,
    desc: 'An availability indicator with a breathing status dot.',
  })
  const c = sc.brand.teal
  a.node(`<rect width="${W}" height="${H}" rx="${H / 2}" fill="${c}" fill-opacity=".12" stroke="${c}" stroke-opacity=".45"/>`)
  a.node(statusDot(18, H / 2, scheme, 3.6))
  a.text(30, H / 2 + 4, label, { size: 12, family: 'mono', weight: 500, fill: sc.text })
  await a.commit()
}

// ---------------------------------------------------------------------------
// footer band
// ---------------------------------------------------------------------------

async function footer(scheme) {
  const sc = schemeOf(scheme)
  const H = 104
  const a = asset({
    w: 1200, h: H, scheme,
    path: `assets/ui/footer-${scheme}.svg`,
    title: 'Contact and links',
    desc:
      'Contact details: GitHub github.com/AdamEddahmouni, email adameddahmouni@gmail.com, ' +
      'documentation at adameddahmouni.github.io/nosograph, based in Pennsylvania.',
    defs: `<linearGradient id="f" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${sc.brand.blue}" stop-opacity=".5"/>
      <stop offset=".5" stop-color="${sc.brand.teal}" stop-opacity=".5"/>
      <stop offset="1" stop-color="${sc.brand.violet}" stop-opacity=".5"/></linearGradient>`,
  })
  a.node(`<rect width="1200" height="2" fill="url(#f)"/>`)
  a.text(0, 44, 'github.com/AdamEddahmouni', { size: 15, family: 'mono', weight: 500, fill: sc.text })
  a.text(0, 68, 'adameddahmouni@gmail.com', { size: 13, family: 'mono', weight: 500, fill: sc.textMuted })
  a.text(1200, 44, 'adameddahmouni.github.io/nosograph', {
    size: 13, family: 'mono', weight: 500, fill: sc.textMuted, anchor: 'end',
  })
  a.text(1200, 68, 'Pennsylvania · Penn State', {
    size: 12, family: 'mono', weight: 500, fill: sc.textFaint, anchor: 'end',
  })
  a.text(0, 90, 'engineering · AI systems · open research', {
    size: 11, family: 'mono', weight: 500, fill: sc.textFaint,
  })
  a.node(grain(scheme))
  await a.commit()
}

// ---------------------------------------------------------------------------
// brand badges
// ---------------------------------------------------------------------------

async function badges(scheme) {
  const sc = schemeOf(scheme)
  const H = 34
  const PAD = 14
  const a = asset({
    w: 1200, h: H, scheme,
    path: `assets/badges/badges-${scheme}.svg`,
    title: 'Profile badges',
    desc: 'Badges for open source, focus, location and availability.',
  })

  let x = 0
  for (const [key, b] of Object.entries(tokens.badges)) {
    const col = accent(scheme, b.accent)
    const lw = Math.round(b.label.length * 6.0) + PAD * 2
    const vw = Math.round(b.value.length * 6.0) + PAD * 2
    const bw = lw + vw

    // label sits on a neutral surface; the value sits on the brand colour in
    // that accent's on-colour, which is the combination that clears AA. A
    // single on-brand value does not work: white on teal is 1.89:1 while
    // dark text on violet is 3.81:1.
    a.node(
      `<rect x="${x}" y="0" width="${lw}" height="${H}" rx="${H / 2}" fill="${sc.surfaceAlt}" stroke="${sc.border}"/>` +
      `<rect x="${x + lw}" y="0" width="${vw}" height="${H}" rx="${H / 2}" fill="${col}"/>` +
      // square off the inner edge where the two chips meet
      `<rect x="${x + lw - H / 2}" y="0" width="${H / 2}" height="${H}" fill="${col}"/>`,
    )
    a.text(x + lw / 2, H / 2 + 4, b.label, { size: 11.5, family: 'mono', weight: 500, fill: sc.textMuted, anchor: 'middle' })
    a.text(x + lw + vw / 2, H / 2 + 4, b.value, { size: 11.5, family: 'mono', weight: 500, fill: sc.on[b.accent], anchor: 'middle' })
    x += bw + 8
  }
  await a.commit()
}

// ---------------------------------------------------------------------------
// stack chips, from Simple Icons paths
// ---------------------------------------------------------------------------

const LABELS = {
  python: 'Python',
  typescript: 'TypeScript',
  javascript: 'JavaScript',
  react: 'React',
  nextdotjs: 'Next.js',
  fastapi: 'FastAPI',
  mongodb: 'MongoDB',
  supabase: 'Supabase',
  docker: 'Docker',
  githubactions: 'Actions',
  redis: 'Redis',
  markdown: 'Markdown',
  git: 'Git',
}

async function stack(scheme) {
  const sc = schemeOf(scheme)
  const list = tokens.icons.list.filter((i) => icons[i.slug])
  const ROWS = 2
  const chipH = 34
  const gapX = 8
  const gapY = 8
  const maxW = 1200

  // measure first so the height can be exact rather than guessed
  const widths = list.map(({ slug }) => Math.round(LABELS[slug].length * 6.1) + 44)
  const rows = []
  let cur = []
  let used = 0
  widths.forEach((w, i) => {
    const add = cur.length ? w + gapX : w
    if (used + add > maxW && cur.length) {
      rows.push(cur)
      cur = [i]
      used = w
    } else {
      cur.push(i)
      used += add
    }
  })
  if (cur.length) rows.push(cur)

  const H = rows.length * chipH + (rows.length - 1) * gapY
  const a = asset({
    w: 1200, h: H, scheme,
    path: `assets/chips/stack-${scheme}.svg`,
    title: 'Technology stack',
    desc: 'Icon chips for the languages, frameworks and infrastructure used across the projects.',
  })

  rows.forEach((row, ri) => {
    let x = 0
    const y = ri * (chipH + gapY)
    row.forEach((i) => {
      const { slug, color } = list[i]
      const w = widths[i]
      a.node(
        `<rect x="${x}" y="${y}" width="${w}" height="${chipH}" rx="${tokens.radius.chip}" fill="${sc.surface}" stroke="${sc.border}"/>`,
      )
      // Simple Icons paths are authored on a 24x24 grid with a single fill
      a.node(
        `<g transform="translate(${x + 12} ${y + chipH / 2 - 8}) scale(0.6667)" fill="${color}">` +
          `<path d="${icons[slug]}"/></g>`,
      )
      a.text(x + 34, y + chipH / 2 + 4, LABELS[slug], { size: 11, family: 'mono', weight: 500, fill: sc.textMuted })
      x += w + gapX
    })
  })
  await a.commit()
}

for (const scheme of ['dark', 'light']) {
  await divider(scheme)
  await status(scheme)
  await footer(scheme)
  await badges(scheme)
  await stack(scheme)
}
console.log('ui done')
