/**
 * Minimal static server for local preview of the generated assets.
 * Development only - not part of the published profile.
 *
 *   node tools/serve.mjs [port]
 */

import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, extname, normalize } from 'node:path'
import { ROOT } from './lib/svg.mjs'

const PORT = Number(process.argv[2] ?? 4173)
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.webp': 'image/webp',
}

createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname)
    if (p === '/') p = '/tools/preview.html'
    // contain everything under the workspace root
    const full = join(ROOT, normalize(p).replace(/^([/\\])+/, ''))
    if (!full.startsWith(ROOT)) throw new Error('escape')
    const s = await stat(full)
    if (s.isDirectory()) throw new Error('dir')
    const buf = await readFile(full)
    res.writeHead(200, {
      'content-type': TYPES[extname(full)] ?? 'application/octet-stream',
      'cache-control': 'no-store',
    })
    res.end(buf)
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' })
    res.end('404')
  }
}).listen(PORT, '127.0.0.1', () => console.log(`serving ${ROOT} on http://127.0.0.1:${PORT}/`))
