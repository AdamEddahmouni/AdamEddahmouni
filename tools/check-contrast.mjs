/**
 * Contrast gate.
 *
 * Asserts that every foreground/background pair the design system actually
 * draws clears WCAG AA in the scheme it is used in. Several accent colours are
 * used as 9–10px mono labels inside artwork, so they are checked at body
 * threshold, not large-text threshold.
 *
 * Runs in CI. Exits non-zero on any failure or unresolved pair, because a
 * silently skipped pair is indistinguishable from a passing one.
 */

import { tokens, contrast } from './lib/svg.mjs'

/** [foreground, background, label, minimum] */
const PAIRS = [
  ['text', 'page', 'body text on page', 4.5],
  ['text', 'surface', 'body text on plate', 4.5],
  ['text', 'elevated', 'body text on raised surface', 4.5],
  ['textMuted', 'page', 'secondary text on page', 4.5],
  ['textMuted', 'surface', 'secondary text on plate', 4.5],
  ['textMuted', 'elevated', 'secondary text on raised surface', 4.5],
  ['textFaint', 'page', 'faint label on page', 4.5],
  ['textFaint', 'surface', 'faint label on plate', 4.5],

  // Accents drawn as small mono labels inside artwork.
  ['brand.teal', 'surface', 'teal label on plate', 4.5],
  ['brand.copper', 'surface', 'copper label on plate', 4.5],
  ['brand.violet', 'surface', 'violet accent on plate', 3],
  ['brand.violetSoft', 'surface', 'violet label on plate', 4.5],
  ['evidence.supporting', 'surface', 'supporting state label', 4.5],
  ['evidence.contradictory', 'surface', 'contradictory state label', 4.5],
  ['evidence.inconclusive', 'surface', 'inconclusive state label', 4.5],

  // Large display type and drawn strokes on the page ground.
  ['brand.teal', 'page', 'teal on page', 3],
  ['brand.copper', 'page', 'copper on page', 3],
  ['brand.violet', 'page', 'violet on page', 3],

  // Interactive button plate: ink fill on both GitHub themes.
  ['text', 'surface', 'button label on button ink', 4.5],
]

const resolve = (scheme, path) => path.split('.').reduce((o, k) => o?.[k], scheme)

let failures = 0
let checked = 0
let unresolved = 0

for (const name of ['light', 'dark']) {
  const s = tokens.schemes[name]
  console.log(`\n${name}`)
  for (const [fg, bg, label, min] of PAIRS) {
    const a = resolve(s, fg)
    const b = resolve(s, bg)
    if (!a || !b) {
      console.log(`  ??    unresolved (${fg} / ${bg}) — ${label}`)
      unresolved++
      failures++
      continue
    }
    const r = contrast(a, b)
    checked++
    const ok = r >= min
    if (!ok) failures++
    console.log(`  ${ok ? 'pass' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${label}  ${a} on ${b}`)
  }
}

console.log(
  `\n${checked - (failures - unresolved)}/${checked} resolved pairs pass` +
    (unresolved ? `, ${unresolved} unresolved` : ''),
)

if (failures) {
  console.log('\nContrast gate failed.')
  process.exit(1)
}

console.log('\nContrast gate passed. White on the teal accent would measure ' +
  `${contrast('#ffffff', tokens.schemes.dark.brand.teal).toFixed(2)}:1, which is why no plate uses white on teal.`)
