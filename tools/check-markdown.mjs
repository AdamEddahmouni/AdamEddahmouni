/**
 * Structural check for README.md.
 *
 * The README is mostly raw HTML because GitHub only permits a limited subset,
 * and the themed graphics need <picture> and <table>. That means markdownlint
 * alone cannot tell whether it is well formed, so this checks the things that
 * actually break rendering: unbalanced tags, ragged markdown tables, asset
 * paths that no longer exist, and references to assets that were removed.
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from './lib/svg.mjs'

const readme = readFileSync(join(ROOT, 'README.md'), 'utf8')
const lines = readme.split('\n')
let failures = 0

const fail = (msg) => { console.log(`  FAIL  ${msg}`); failures++ }
const pass = (msg) => console.log(`  pass  ${msg}`)

// 1. balanced HTML tags
console.log('\ntag balance')
for (const tag of ['div', 'picture', 'table', 'tr', 'td', 'details', 'summary', 'a', 'p', 'sub', 'b']) {
  const open = (readme.match(new RegExp(`<${tag}[\\s>]`, 'g')) ?? []).length
  const close = (readme.match(new RegExp(`</${tag}>`, 'g')) ?? []).length
  if (open === close) pass(`<${tag}> ${open}/${close}`)
  else fail(`<${tag}> ${open} open / ${close} close`)
}

// 2. every <picture> has both sources and an img
console.log('\npicture completeness')
const pictures = readme.match(/<picture>[\s\S]*?<\/picture>/g) ?? []
let bad = 0
for (const p of pictures) {
  if (!/<source[^>]*prefers-color-scheme: dark/.test(p)) { fail('picture missing dark source'); bad++ }
  if (!/<source[^>]*prefers-color-scheme: light/.test(p)) { fail('picture missing light source'); bad++ }
  if (!/<img[^>]*\balt=/.test(p)) { fail('picture missing img alt'); bad++ }
}
if (!bad) pass(`${pictures.length} picture elements complete (dark + light + alt)`)

// 3. markdown tables are rectangular
console.log('\nmarkdown tables')
let tables = 0
for (let i = 0; i < lines.length; i++) {
  if (!/^\s*\|.*\|\s*$/.test(lines[i])) continue
  const group = []
  while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) group.push(lines[i++])
  i--
  if (group.length < 2) continue
  tables++
  const counts = new Set(group.map((r) => (r.match(/\|/g) ?? []).length))
  if (counts.size > 1) fail(`ragged markdown table at line ${i - group.length + 1}: ${[...counts].join('/')} pipes`)
}
pass(`${tables} markdown table(s) rectangular`)

// 4. referenced assets exist, and no reference is left dangling
console.log('\nasset references')
const refs = [...new Set(readme.match(/\.\/assets\/[A-Za-z0-9._/-]+\.svg/g) ?? [])]
let missing = 0
for (const r of refs) {
  if (!existsSync(join(ROOT, r.replace(/^\.\//, '')))) { fail(`README references missing asset ${r}`); missing++ }
}
if (!missing) pass(`${refs.length} asset references all resolve`)

// 5. no references to assets that were deleted
console.log('\nstale references')
const removed = ['project-nosograph', 'project-market', 'project-agent-ready', 'snake', 'shields.io']
let stale = 0
for (const r of removed) {
  if (readme.includes(r)) { fail(`README still references removed asset or service: ${r}`); stale++ }
}
if (!stale) pass('no references to removed assets or retired services')

// 6. every image has an alt attribute
console.log('\nimage alt text')
const imgs = readme.match(/<img[^>]*>/g) ?? []
let noAlt = 0
for (const t of imgs) if (!/\balt="/.test(t)) { fail(`img without alt: ${t.slice(0, 70)}`); noAlt++ }
if (!noAlt) pass(`${imgs.length} img elements all have alt`)

console.log(`\n${failures ? `${failures} problem(s)` : 'README structure ok'}`)
process.exit(failures ? 1 : 0)
