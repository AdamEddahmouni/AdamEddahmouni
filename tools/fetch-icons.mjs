/**
 * Pulls the Simple Icons paths used by the stack chips.
 *
 * Simple Icons is CC0 1.0, so the paths can be reused with no attribution
 * requirement - which matters for a profile that leans on licensing
 * discipline. Output is committed, so builds do not depend on the network.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, tokens } from './lib/svg.mjs'

const UA = 'profile-readme-assets (build script)'

const out = {}
const missing = []

for (const { slug } of tokens.icons.list) {
  const url = `https://raw.githubusercontent.com/simple-icons/simple-icons/develop/icons/${slug}.svg`
  try {
    const res = await fetch(url, { headers: { 'user-agent': UA } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const svg = await res.text()
    const d = svg.match(/ d="([^"]+)"/)
    if (!d) throw new Error('no path')
    out[slug] = d[1]
    console.log(`  + ${slug}`)
  } catch (err) {
    missing.push(slug)
    console.log(`  - ${slug}  (${err.message})`)
  }
}

mkdirSync(join(ROOT, 'tools', 'lib'), { recursive: true })
writeFileSync(join(ROOT, 'tools', 'lib', 'icons.json'), JSON.stringify(out, null, 0), 'utf8')
console.log(`\n${Object.keys(out).length} icons written${missing.length ? `, missing: ${missing.join(', ')}` : ''}`)
