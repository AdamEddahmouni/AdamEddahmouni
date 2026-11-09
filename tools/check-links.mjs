/**
 * External link check.
 *
 * Network-dependent, so it is not part of render-all.mjs. Run it before
 * publishing. It follows redirects (DOI links redirect), treats 401/403/429 as
 * "reachable but gated" rather than broken, and reports every failure.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from './lib/svg.mjs'

const readme = readFileSync(join(ROOT, 'README.md'), 'utf8')
const urls = [...new Set(
  [...readme.matchAll(/\]\((https?:[^)\s]+)\)/g)].map((m) => m[1])
    .concat([...readme.matchAll(/href="(https?:[^"]+)"/g)].map((m) => m[1])),
)].filter((u) => !u.startsWith('https://img.shields.io'))

console.log(`checking ${urls.length} external links\n`)

const results = []
let index = 0

async function check(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { 'user-agent': 'Mozilla/5.0 (profile link check)' },
      signal: AbortSignal.timeout(20000),
    })
    // 999 is LinkedIn's anti-bot response: reachable, but not verifiable from
    // an automated client. Report it as gated rather than broken.
    const gated = [401, 403, 429, 999].includes(res.status)
    return { url, status: res.status, ok: res.ok || gated, gated, final: res.url }
  } catch (err) {
    return { url, status: 0, ok: false, error: err.message }
  }
}

async function worker() {
  while (index < urls.length) {
    const url = urls[index++]
    const r = await check(url)
    results.push(r)
    console.log(`  ${r.ok ? 'ok  ' : 'FAIL'}  ${String(r.status).padStart(3)}  ${r.url}${r.gated ? '  (gated)' : ''}`)
  }
}

await Promise.all(Array.from({ length: 6 }, worker))

const failed = results.filter((r) => !r.ok)
console.log(`\n${results.length - failed.length}/${results.length} reachable`)
if (failed.length) {
  console.log('\nFailed:')
  for (const f of failed) console.log(`  ${f.status}  ${f.url}  ${f.error ?? ''}`)
  process.exit(1)
}
