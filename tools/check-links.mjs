/**
 * External link check.
 *
 * Network-dependent, so it is not part of render-all.mjs. Run it before
 * publishing. Results are classified rather than collapsed into "ok":
 *
 *   ok         2xx/3xx after redirects
 *   gated      401/403/429/999 — reachable, but an automated client cannot
 *              verify the content (LinkedIn answers 999 to every bot)
 *   dead       4xx/5xx other than the gated set
 *   timeout    no response within 20s
 *
 * Gated links are reported separately and do not fail the run; dead links and
 * timeouts do. A private repository therefore cannot be hidden behind a generic
 * "skip", and a bot-blocked page is never reported as independently verified.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from './lib/svg.mjs'

const readme = readFileSync(join(ROOT, 'README.md'), 'utf8')
if (readme.includes('market-trading-platform')) {
  console.error('FAIL: README references the private market-trading-platform repository')
  process.exit(1)
}

const urls = [...new Set(
  [...readme.matchAll(/\]\((https?:[^)\s]+)\)/g)].map((m) => m[1])
    .concat([...readme.matchAll(/href="(https?:[^"]+)"/g)].map((m) => m[1])),
)]
  .map((u) => u.replace(/[.,;]$/, ''))
  .filter((u) => !u.startsWith('https://img.shields.io'))

console.log(`checking ${urls.length} external links\n`)

const GATED = new Set([401, 403, 429, 999])
const results = []
let index = 0

async function check(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
        accept: 'text/html,application/xhtml+xml',
        'accept-language': 'en',
      },
      signal: AbortSignal.timeout(20000),
    })
    const gated = GATED.has(res.status)
    return {
      url,
      status: res.status,
      kind: res.ok ? 'ok' : gated ? 'gated' : 'dead',
      final: res.url,
    }
  } catch (err) {
    const timeout = err?.name === 'TimeoutError' || /abort/i.test(err?.message ?? '')
    return { url, status: 0, kind: timeout ? 'timeout' : 'dead', error: err.message }
  }
}

async function worker() {
  while (index < urls.length) {
    const url = urls[index++]
    const r = await check(url)
    results.push(r)
    const tag = r.kind === 'ok' ? 'ok   ' : r.kind === 'gated' ? 'gated' : 'FAIL '
    console.log(`  ${tag} ${String(r.status).padStart(3)}  ${r.url}${r.final && r.final !== r.url ? `  -> ${r.final}` : ''}`)
  }
}

await Promise.all(Array.from({ length: 6 }, worker))

const ok = results.filter((r) => r.kind === 'ok')
const gated = results.filter((r) => r.kind === 'gated')
const failed = results.filter((r) => r.kind === 'dead' || r.kind === 'timeout')

console.log(`\n${ok.length} verified, ${gated.length} gated, ${failed.length} failed, ${results.length} total`)
for (const g of gated) console.log(`  gated: ${g.url} (HTTP ${g.status}; content not independently verified)`)

if (failed.length) {
  console.log('\nFailed:')
  for (const f of failed) console.log(`  ${f.status}  ${f.url}  ${f.error ?? ''}`)
  process.exit(1)
}
