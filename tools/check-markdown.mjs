/**
 * Structural and content checks for README.md.
 *
 * GitHub's README renderer is the only real acceptance test, but these catch
 * the failures that are invisible until someone loads the profile: a missing
 * responsive source, a dangling asset path, a card or button that is not a real
 * link, a theme variant that never loads, or unverified sample data in the copy.
 *
 * GitHub now preserves <source> elements inside <a><picture>…</picture></a>, so
 * the project cards and buttons are both linked and theme-aware. That is
 * asserted here rather than assumed.
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from './lib/svg.mjs'

const readme = readFileSync(join(ROOT, 'README.md'), 'utf8')
let failures = 0
let passes = 0

const fail = (msg) => { console.log(`  FAIL  ${msg}`); failures++ }
const pass = (msg) => { console.log(`  pass  ${msg}`); passes++ }

// 1. balanced HTML -----------------------------------------------------------
console.log('\ntag balance')
for (const tag of ['div', 'picture', 'a', 'p', 'sub', 'strong', 'details', 'summary']) {
  const open = (readme.match(new RegExp(`<${tag}[\\s>]`, 'g')) ?? []).length
  const close = (readme.match(new RegExp(`</${tag}>`, 'g')) ?? []).length
  if (open === close) pass(`<${tag}> ${open}/${close}`)
  else fail(`<${tag}> ${open} open / ${close} close`)
}

// 2. pictures ----------------------------------------------------------------
console.log('\npicture elements')
const pictureBlocks = [...readme.matchAll(/<picture>[\s\S]*?<\/picture>/g)].map((m) => ({
  markup: m[0],
  index: m.index,
}))
if (!pictureBlocks.length) fail('no <picture> elements found')

const linkedHref = (index) => {
  const before = readme.slice(0, index)
  const open = before.lastIndexOf('<a ')
  const close = before.lastIndexOf('</a>')
  if (open < 0 || open < close) return null
  return before.slice(open).match(/href="([^"]+)"/)?.[1] ?? null
}

const sourcesOf = (markup) => [...markup.matchAll(/<source\b[^>]*>/g)].map((m) => ({
  srcset: (m[0].match(/srcset="([^"]+)"/) ?? [])[1] ?? '',
  media: (m[0].match(/media="([^"]+)"/) ?? [])[1] ?? '',
}))

let responsive = 0
let buttons = 0
let brokenPicture = 0
for (const [i, picture] of pictureBlocks.entries()) {
  const sources = sourcesOf(picture.markup)
  const srcsets = sources.map((s) => s.srcset).filter(Boolean)
  const media = sources.map((s) => s.media)
  const img = picture.markup.match(/<img[^>]*>/)
  const isButton = srcsets.some((s) => s.includes('/presentation/buttons/'))
  const isResponsive = media.some((m) => m.includes('max-width'))

  if (!img) { fail(`picture ${i + 1}: no fallback <img>`); brokenPicture++; continue }
  const alt = img[0].match(/\balt="([^"]*)"/)?.[1]?.trim() ?? ''
  if (alt.length < (isButton ? 10 : 40)) {
    fail(`picture ${i + 1}: missing or too-short alt text`); brokenPicture++
  }
  const fallbackSrc = img[0].match(/\bsrc="([^"]+)"/)?.[1] ?? ''
  if (!fallbackSrc) { fail(`picture ${i + 1}: fallback <img> has no src`); brokenPicture++ }
  if (!sources.length) { fail(`picture ${i + 1}: no <source> elements`); brokenPicture++ }

  for (const source of sources) {
    if (!source.srcset) { fail(`picture ${i + 1}: <source> without srcset`); brokenPicture++ }
    if (!source.media) { fail(`picture ${i + 1}: <source> without media`); brokenPicture++ }
  }
  for (const src of [...srcsets, fallbackSrc]) {
    if (!existsSync(join(ROOT, src.replace(/^\.\//, '')))) {
      fail(`picture ${i + 1}: targets missing ${src}`); brokenPicture++
    }
  }

  if (isResponsive) {
    responsive++
    if (!media.some((m) => m.includes('max-width') && m.includes('prefers-color-scheme: dark'))) {
      fail(`picture ${i + 1}: no mobile dark source`); brokenPicture++
    }
    if (!media.some((m) => m.includes('max-width') && m.includes('prefers-color-scheme: light'))) {
      fail(`picture ${i + 1}: no mobile light source`); brokenPicture++
    }
    // The fallback <img> is the desktop dark artwork on the project cards, so
    // it satisfies the dark desktop variant without a duplicate <source>.
    if (!media.some((m) => !m.includes('max-width') && m.includes('prefers-color-scheme: dark')) &&
        !/-desktop-dark\.webp$/.test(fallbackSrc)) {
      fail(`picture ${i + 1}: no desktop dark source`); brokenPicture++
    }
    if (!media.some((m) => !m.includes('max-width') && m.includes('prefers-color-scheme: light'))) {
      fail(`picture ${i + 1}: no desktop light source`); brokenPicture++
    }
  } else if (isButton) {
    buttons++
    if (!media.some((m) => m.includes('prefers-color-scheme: light'))) {
      fail(`picture ${i + 1}: button has no light-theme source`); brokenPicture++
    }
    if (!/presentation\/buttons\/[a-z]+-dark\.webp/.test(fallbackSrc)) {
      fail(`picture ${i + 1}: button fallback is not the dark artwork`); brokenPicture++
    }
    if (!/\bwidth="145"/.test(img[0])) {
      fail(`picture ${i + 1}: button width drifted from 145`); brokenPicture++
    }
  } else {
    fail(`picture ${i + 1}: neither responsive plate nor themed button`)
    brokenPicture++
  }
}
if (!brokenPicture) {
  pass(`${pictureBlocks.length} pictures: ${responsive} responsive plates, ${buttons} themed buttons, all files present`)
}

// 3. linked artwork -----------------------------------------------------------
console.log('\nlinked artwork')
const PROJECT_LINKS = {
  nosograph: 'https://github.com/AdamEddahmouni/nosograph',
  'agent-ready': 'https://github.com/AdamEddahmouni/agent-ready',
  'short-squeeze-screener': 'https://github.com/AdamEddahmouni/short-squeeze-screener-internship',
}
const cardIds = new Set()
for (const picture of pictureBlocks) {
  const match = picture.markup.match(/gallery\/([a-z-]+)-desktop-dark\.webp/)
  if (!match) continue
  const id = match[1]
  cardIds.add(id)
  const href = linkedHref(picture.index)
  if (!href) fail(`project card ${id} is not inside a link`)
  else if (href !== PROJECT_LINKS[id]) fail(`project card ${id} links to ${href}`)
  const img = picture.markup.match(/<img[^>]*>/)?.[0] ?? ''
  if (!/\bwidth="480"/.test(img)) fail(`project card ${id} width drifted from 480`)
}
for (const id of Object.keys(PROJECT_LINKS)) {
  if (!cardIds.has(id)) fail(`no independently linked card for ${id}`)
}
if (cardIds.size === Object.keys(PROJECT_LINKS).length) {
  pass(`${cardIds.size} project cards are genuine links to their repositories`)
}

const buttonIds = new Set()
for (const picture of pictureBlocks) {
  const match = picture.markup.match(/buttons\/([a-z]+)-dark\.webp/)
  if (!match) continue
  buttonIds.add(match[1])
  const href = linkedHref(picture.index)
  if (!href) fail(`button ${match[1]} is not a real link`)
}
if (buttonIds.size === 4) pass(`4 navigation buttons are genuine links`)
else fail(`expected 4 linked buttons, found ${buttonIds.size}`)

// 4. asset references --------------------------------------------------------
console.log('\nasset references')
const refs = [...new Set(readme.match(/\.\/assets\/[A-Za-z0-9._/-]+\.svg/g) ?? [])]
let missing = 0
for (const r of refs) {
  if (!existsSync(join(ROOT, r.replace(/^\.\//, '')))) { fail(`missing asset ${r}`); missing++ }
}
if (!missing) pass(`${refs.length} SVG references resolve`)

// 5. links -------------------------------------------------------------------
console.log('\nlinks')
const anchors = [...readme.matchAll(/<a\s[^>]*href="([^"]+)"/g)].map((m) => m[1])
const mdLinks = [...readme.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1])
if (!anchors.length) fail('no HTML anchors found')
for (const href of anchors) {
  if (!/^(https?:\/\/|mailto:|#)/.test(href)) fail(`anchor with unsupported href: ${href}`)
}
pass(`${anchors.length} HTML anchors + ${mdLinks.length} markdown links`)

const internal = [...anchors, ...mdLinks].filter((h) => h.startsWith('#'))
for (const id of internal) {
  const slug = id.slice(1)
  const headings = [...readme.matchAll(/^#{1,6}\s+(.*)$/gm)].map((m) =>
    m[1].toLowerCase().replace(/[^a-z0-9 -]/g, '').trim().replace(/\s+/g, '-'),
  )
  if (!headings.includes(slug)) fail(`internal link #${slug} has no matching heading`)
}
if (internal.length) pass(`${internal.length} internal anchors resolve`)

// 6. content restrictions ----------------------------------------------------
console.log('\ncontent restrictions')
const forbidden = [
  ['shields.io', 'third-party badge service'],
  ['img.shields', 'third-party badge service'],
  ['30+', 'unverified project count'],
  ['1,402', 'unverified contribution count from the reference mockup'],
  ['+2.34', 'fabricated market return'],
  ['LAT ', 'invented coordinates'],
  ['LON ', 'invented coordinates'],
  ['live trading', 'unverified live-trading claim'],
  ['profitable', 'unverified profitability claim'],
  ['ModelMarks', 'unverified project from the reference mockup'],
  ['SalvageSyndicate', 'unverified project from the reference mockup'],
  ['Cedar', 'unverified business project'],
  ['market-trading-platform', 'private repository, must not be linked publicly'],
]
let bad = 0
for (const [needle, why] of forbidden) {
  if (readme.includes(needle)) { fail(`README contains ${needle} (${why})`); bad++ }
}
if (!bad) pass('no unverified sample data, private links or badge services')

// 7. structure ---------------------------------------------------------------
console.log('\nstructure')
const h2 = [...readme.matchAll(/^##\s+(.*)$/gm)].map((m) => m[1])
const h3 = [...readme.matchAll(/^###\s+(.*)$/gm)].map((m) => m[1])
if (h2.length < 6) fail(`only ${h2.length} h2 sections; expected a complete profile`)
else pass(`${h2.length} sections: ${h2.join(' · ')}`)
if (!h2.includes('What I build')) fail('missing the "What I build" section')
if (!h2.includes('Selected work')) fail('missing the "Selected work" section')
if (h3.length < 3) fail(`only ${h3.length} featured projects`)
else pass(`${h3.length} featured projects`)
const email = readme.match(/mailto:([^)"\s]+)/)
if (!email) fail('no contact email')
else pass(`contact email present (${email[1].replace(/(.).*(@.*)/, '$1…$2')})`)

// 8. size --------------------------------------------------------------------
const kb = (Buffer.byteLength(readme, 'utf8') / 1024).toFixed(1)
pass(`README.md is ${kb} KB`)

console.log(`\n${failures ? `${failures} problem(s)` : `README checks ok (${passes} passed)`}`)
process.exit(failures ? 1 : 0)
