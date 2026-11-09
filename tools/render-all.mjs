/**
 * Rebuild every generated asset, then run the quality gates.
 *
 *   node tools/render-all.mjs
 *
 * Fonts and icon paths are cached in tools/lib, so after the first run this is
 * offline and deterministic. Run tools/fetch-repo-data.mjs first to refresh
 * the contribution counts.
 */

import { spawnSync } from 'node:child_process'
import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { ROOT } from './lib/svg.mjs'

const GENERATORS = [
  'generate-hero.mjs',
  'generate-glance.mjs',
  'generate-work.mjs',
  'generate-evidence.mjs',
  'generate-activity.mjs',
  'generate-ui.mjs',
]

for (const step of GENERATORS) {
  console.log(`\n── ${step}`)
  const r = spawnSync(process.execPath, [`tools/${step}`], { stdio: 'inherit' })
  if (r.status !== 0) {
    console.error(`\n${step} failed; the previously generated assets were left untouched.`)
    process.exit(r.status ?? 1)
  }
}

// Asset manifest: every generated file with its byte size, so growth is visible
// in review instead of being discovered by readers.
function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (name.endsWith('.svg')) out.push(full)
  }
  return out
}

// Only this pipeline's outputs belong in the manifest. Legacy artwork from the
// previous profile is still committed but is not generated here, so counting it
// would overstate both the asset count and the page weight.
const GENERATED = [
  /^assets\/hero\/hero-(desktop|mobile)-(dark|light)\.svg$/,
  /^assets\/glance\/glance-(desktop|mobile)-(dark|light)\.svg$/,
  /^assets\/work\/[a-z0-9-]+-(desktop|mobile)-(dark|light)\.svg$/,
  /^assets\/evidence\/pipeline-(desktop|mobile)-(dark|light)\.svg$/,
  /^assets\/activity\/activity-(desktop|mobile)-(dark|light)\.svg$/,
  /^assets\/ui\/button-[a-z]+\.svg$/,
]
const files = walk(join(ROOT, 'assets'))
  .map((f) => relative(ROOT, f))
  .filter((rel) => GENERATED.some((re) => re.test(rel)))
  .sort()
  .map((rel) => join(ROOT, rel))
const manifest = {
  generated: new Date().toISOString().slice(0, 10),
  count: files.length,
  totalBytes: files.reduce((s, f) => s + statSync(f).size, 0),
  files: files.map((f) => ({
    path: relative(ROOT, f),
    bytes: statSync(f).size,
  })),
}
writeFileSync(join(ROOT, 'tools', 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n')
const mb = (manifest.totalBytes / 1024 / 1024).toFixed(2)
console.log(`\nmanifest: ${manifest.count} assets, ${mb} MB total`)

for (const gate of ['check-contrast.mjs', 'check-markdown.mjs']) {
  console.log(`\n── ${gate}`)
  const r = spawnSync(process.execPath, [`tools/${gate}`], { stdio: 'inherit' })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

console.log('\n── preview.mjs')
const p = spawnSync(process.execPath, ['tools/preview.mjs'], { stdio: 'inherit' })
process.exit(p.status ?? 0)
