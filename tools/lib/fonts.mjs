/**
 * Per-asset font subsetting.
 *
 * An SVG served through <img> cannot fetch a webfont, so the typeface has to
 * be embedded. Embedding a whole face costs tens of KB per asset; instead each
 * asset declares the faces it uses and we ask Google Fonts for a subset of
 * exactly the glyphs it draws, which lands in the low single-digit KB.
 *
 * Results are cached in tools/lib/font-cache.json and committed, so a build is
 * reproducible and CI needs no network once the cache is warm.
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

const key = (family, weight, glyphs) =>
  `${family}-${weight}-${createHash('sha1').update(glyphs).digest('hex').slice(0, 10)}`

/**
 * Characters assumed present without being declared. Assets record every glyph
 * they actually draw; this only covers numerals and separators emitted by
 * generators. Keeping it small is what keeps the subsets small.
 */
export const CORE_GLYPHS = ' 0123456789.,:-+/()%·×→∞…—’'

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
 * Ensure a base64 woff2 exists for this (family, weight, glyphs) triple.
 * Returns null when the family is unavailable so the caller falls back to the
 * declared system stack rather than failing the build.
 */
export async function subset(family, weight, glyphs) {
  const set = new Set([...CORE_GLYPHS, ...glyphs].filter((c) => c && c !== '\n' && c !== '\r'))
  const textString = [...set].sort().join('')
  const k = key(family, weight, textString)
  if (cache[k]) return cache[k]
  try {
    cache[k] = await fetchSubset(family, weight, textString)
    return cache[k]
  } catch (err) {
    console.warn(`  ! font subset unavailable (${family} ${weight}): ${err.message}`)
    return null
  }
}

/** Declared faces, keyed by role. */
export const faces = {
  serif: { family: tokens.type.serif.family, weights: tokens.type.serif.weights },
  sans: { family: tokens.type.sans.family, weights: tokens.type.sans.weights },
  mono: { family: tokens.type.mono.family, weights: tokens.type.mono.weights },
}

/** Faces embedded by default. Artwork with no body copy skips Inter. */
export const DEFAULT_FACES = ['serif', 'mono']
