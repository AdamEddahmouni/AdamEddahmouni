/**
 * Asset budgets and manifest integrity.
 *
 * The CI failure this replaces compared truncated integer KB against one flat
 * default and had no activity category, so a 59 KB plate was judged by the same
 * default as a 12 KB button. Here every referenced asset is checked against an
 * exact-byte budget for its own component, with the headroom printed, and the
 * manifest must describe exactly the artwork the README uses.
 *
 * Budgets are deliberate: the hero is allowed 72 KB because the surface is the
 * profile's signature and the text beside it stays HTML-crisp; small components
 * are held far tighter. Raising a limit requires changing the number here and
 * saying why in docs/QA_REPORT.md.
 */

import { readFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from './lib/svg.mjs'

const LIMITS = {
  'hero/hero-desktop': 72_000,
  'hero/hero-mobile': 52_000,
  activity: 38_000,
  evidence: 36_000,
  'featured/featured-desktop': 60_000,
  'featured/featured-mobile': 55_000,
  glance: 26_000,
  ui: 15_000,
}

const readme = readFileSync(join(ROOT, 'README.md'), 'utf8')
const refs = [...new Set(readme.match(/\.\/assets\/[A-Za-z0-9._/-]+\.svg/g) ?? [])]
  .map((r) => r.replace(/^\.\//, ''))
  .sort()

let failures = 0
const rows = []

for (const rel of refs) {
  const full = join(ROOT, rel)
  if (!existsSync(full)) {
    console.log(`  FAIL  missing ${rel}`)
    failures++
    continue
  }
  const bytes = statSync(full).size
  const parts = rel.split('/')
  const group = parts[1]
  const key = group === 'hero' || group === 'featured'
    ? `${group}/${parts[2].replace(/-(dark|light)\.svg$/, '')}`
    : group
  const limit = LIMITS[key]
  if (!limit) {
    console.log(`  FAIL  no budget category for ${rel} (${key})`)
    failures++
    continue
  }
  const pct = ((bytes / limit - 1) * 100).toFixed(1)
  rows.push({ rel, bytes, limit, pct })
  if (bytes > limit) {
    console.log(`  FAIL  ${rel} ${bytes}B > ${limit}B (${pct}%)`)
    failures++
  }
}

console.log('\n  component                          bytes    limit   headroom')
for (const r of rows) {
  console.log(`  ${r.rel.padEnd(34)} ${String(r.bytes).padStart(7)} ${String(r.limit).padStart(7)} ${r.pct.padStart(8)}%`)
}

const manifestPath = join(ROOT, 'tools', 'manifest.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const listed = new Set(manifest.files.map((f) => f.path))
const unlisted = refs.filter((r) => !listed.has(r))
if (unlisted.length) {
  console.log(`\n  FAIL  manifest is missing ${unlisted.length} referenced asset(s): ${unlisted.join(', ')}`)
  failures++
}
if (manifest.count !== manifest.files.length) {
  console.log(`  FAIL  manifest count ${manifest.count} != ${manifest.files.length} entries`)
  failures++
}
const total = manifest.files.reduce((s, f) => s + f.bytes, 0)
if (total !== manifest.totalBytes) {
  console.log(`  FAIL  manifest totalBytes ${manifest.totalBytes} != summed ${total}`)
  failures++
}

console.log(
  failures
    ? `\n${failures} asset problem(s)`
    : `\nasset checks ok — ${refs.length} referenced assets, ${manifest.count} generated, ${Math.round(manifest.totalBytes / 1024)} KB total`,
)
process.exit(failures ? 1 : 0)
