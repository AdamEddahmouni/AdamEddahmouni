/**
 * Geometry audit driver.
 *
 * Walks the generated assets and writes the list to tools/manifest.json for
 * the audit page to fetch. Measuring happens in the browser, because getBBox
 * is only meaningful once a real engine has laid the SVG out - which is the
 * point: it catches text that overruns the canvas or collides with other
 * text, the two failures that are invisible in the markup itself.
 */

import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { ROOT } from './lib/svg.mjs'

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) walk(full, out)
    else if (name.endsWith('.svg')) out.push(full)
  }
  return out
}

const files = walk(join(ROOT, 'assets'))
  .map((f) => '/' + relative(ROOT, f).split(sep).join('/'))
  .sort()

writeFileSync(join(ROOT, 'tools', 'manifest.json'), JSON.stringify(files, null, 2), 'utf8')
console.log(`${files.length} assets written to tools/manifest.json`)
for (const f of files) console.log('  ' + f)
