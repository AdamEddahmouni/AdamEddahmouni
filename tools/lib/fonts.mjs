/**
 * Per-asset font subsetting.
 *
 * An SVG served through <img> cannot fetch a webfont, so the typeface has to
 * be embedded. Embedding a full face would cost ~48 KB of base64 per asset,
 * which is unacceptable across fourteen files. Instead every asset declares
 * the glyphs it actually draws and we ask Google Fonts for a subset of exactly
 * those, which lands in the low single-digit KB.
 *
 * Results are cached on disk and committed, so a build - including CI - is
 * reproducible and needs no network once the cache is warm.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { ROOT, tokens } from './svg.mjs'

const CACHE_FILE = join(ROOT, 'tools', 'lib', 'font-cache.json')
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0 Safari/537.36'

let cache = existsSync(CACHE_FILE)
  ? JSON.parse(readFileSync(CACHE_FILE, 'utf8'))
  : {}

export function saveFontCache() {
  mkdirSync(join(ROOT, 'tools', 'lib'), { recursive: true })
  writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 0), 'utf8')
}

export const cacheStats = () => Object.keys(cache).length

const key = (family, weight, glyphs) =>
  `${family}-${weight}-${createHash('sha1').update(glyphs).digest('hex').slice(0, 10)}`

/**
 * The only characters assumed present without being declared. Assets record
 * every glyph they actually draw, so this just needs to cover digits and the
 * marks that appear in generated numerals and separators. Keeping it small is
 * what makes the subsets small: forcing all of ASCII costs ~3x the bytes.
 */
export const CORE_GLYPHS = ' 0123456789.,:-+/()%·×→∞…—'

async function fetchSubset(family, weight, glyphs) {
  const spec = family.replace(/ /g, '+')
  const url =
    `https://fonts.googleapis.com/css2?family=${spec}:wght@${weight}` +
    `&text=${encodeURIComponent(glyphs)}`
  const css = await (await fetch(url, { headers: { 'user-agent': UA } })).text()
  const m = css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/)
  if (!m) throw new Error(`no subset for ${family} ${weight}: ${css.slice(0, 120)}`)
  const buf = Buffer.from(await (await fetch(m[0])).arrayBuffer())
  return buf.toString('base64')
}

/**
 * Ensure a base64 woff2 exists for this exact (family, weight, glyphs) triple.
 * Returns null when the family is unknown, so the caller can fall back to the
 * system stack rather than failing the build.
 */
export async function subset(family, weight, glyphs) {
  const set = new Set([...CORE_GLYPHS, ...glyphs].filter((c) => c && c !== '\n' && c !== '\r'))
  const text = [...set].sort().join('')
  const k = key(family, weight, text)
  if (cache[k]) return cache[k]
  try {
    cache[k] = await fetchSubset(family, weight, text)
    return cache[k]
  } catch (err) {
    console.warn(`  ! font subset unavailable (${family} ${weight}): ${err.message}`)
    return null
  }
}

/** All faces declared in the token file, in render order. */
export const faces = [
  { family: tokens.type.display.family, weights: tokens.type.display.weights, roles: ['display'] },
  { family: tokens.type.mono.family, weights: tokens.type.mono.weights, roles: ['mono'] },
]
