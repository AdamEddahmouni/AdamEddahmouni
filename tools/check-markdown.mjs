/**
 * Structural and content checks for README.md.
 *
 * GitHub's README renderer is the only real acceptance test, but these catch
 * the failures that are invisible until someone loads the profile: a missing
 * responsive source, a dangling asset path, a picture nested in a link (which
 * loses its <source> elements), a button image that is not actually a link,
 * or unverified sample data left in the copy.
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
for (const tag of ['div', 'picture', 'a', 'p', 'sub', 'strong']) {
  const open = (readme.match(new RegExp(`<${tag}[\\s>]`, 'g')) ?? []).length
  const close = (readme.match(new RegExp(`</${tag}>`, 'g')) ?? []).length
  if (open === close) pass(`<${tag}> ${open}/${close}`)
  else fail(`<${tag}> ${open} open / ${close} close`)
}

// 2. pictures ----------------------------------------------------------------
console.log('\npicture elements')
const pictures = readme.match(/<picture>[\s\S]*?<\/picture>/g) ?? []
if (!pictures.length) fail('no <picture> elements found')
let badPicture = 0
for (const [i, p] of pictures.entries()) {
  const sources = [...p.matchAll(/<source\b[^>]*>/g)].map((m) => {
    const tag = m[0]
    return {
      srcset: (tag.match(/srcset="([^"]+)"/) ?? [])[1] ?? '',
      media: (tag.match(/media="([^"]+)"/) ?? [])[1] ?? '',
    }
  })
  const srcsets = sources.map((s) => s.srcset).filter(Boolean)
  const media = sources.map((s) => s.media)
  if (!media.some((m) => m.includes('max-width') && m.includes('prefers-color-scheme: dark'))) {
    fail(`picture ${i + 1}: no mobile dark source`); badPicture++
  }
  if (!media.some((m) => m.includes('max-width') && m.includes('prefers-color-scheme: light'))) {
    fail(`picture ${i + 1}: no mobile light source`); badPicture++
  }
  if (!media.some((m) => !m.includes('max-width') && m.includes('prefers-color-scheme: dark'))) {
    fail(`picture ${i + 1}: no desktop dark source`); badPicture++
  }
  if (!media.some((m) => !m.includes('max-width') && m.includes('prefers-color-scheme: light'))) {
    fail(`picture ${i + 1}: no desktop light source`); badPicture++
  }
  const img = p.match(/<img[^>]*>/)
  if (!img) { fail(`picture ${i + 1}: no fallback <img>`); badPicture++; continue }
  const alt = img[0].match(/\balt="([^"]*)"/)
  if (!alt || alt[1].trim().length < 24) {
    fail(`picture ${i + 1}: missing or too-short alt text`); badPicture++
  }
  for (const src of srcsets) {
    if (!existsSync(join(ROOT, src.replace(/^\.\//, '')))) {
      fail(`picture ${i + 1}: srcset targets missing ${src}`); badPicture++
    }
  }
}
if (!badPicture) pass(`${pictures.length} pictures: mobile + desktop sources, both schemes, descriptive alt, files present`)

// 3. pictures must not be nested in links ------------------------------------
console.log('\npicture inside a link')
const nested = readme.match(/<a[^>]*>(?:(?!<\/a>)[\s\S])*?<picture/g) ?? []
if (nested.length) {
  for (const n of nested) fail(`<picture> inside <a> loses its <source> elements: ${n.slice(0, 60)}...`)
} else {
  pass('no <picture> nested inside <a>')
}

// 4. asset references --------------------------------------------------------
console.log('\nasset references')
const refs = [...new Set(readme.match(/\.\/assets\/[A-Za-z0-9._/-]+\.svg/g) ?? [])]
let missing = 0
for (const r of refs) {
  if (!existsSync(join(ROOT, r.replace(/^\.\//, '')))) { fail(`missing asset ${r}`); missing++ }
}
if (!missing) pass(`${refs.length} asset references resolve`)

// 5. every image is either decorative artwork or a real linked button --------
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

const buttons = refs.filter((r) => r.includes('/ui/button-'))
let unlinked = 0
for (const button of buttons) {
  const line = readme.split('\n').find((l) => l.includes(button)) ?? ''
  if (!/<a\s[^>]*href="[^"]+"/.test(line) || !/<\/a>/.test(line)) {
    fail(`button image is not a real link: ${button}`); unlinked++
  }
}
if (buttons.length && !unlinked) pass(`${buttons.length} buttons are genuine links`)

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
if (h2.length < 5) fail(`only ${h2.length} h2 sections; expected a complete profile`)
else pass(`${h2.length} sections: ${h2.join(' · ')}`)
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
