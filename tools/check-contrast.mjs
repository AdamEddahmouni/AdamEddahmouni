/**
 * Contrast gate.
 *
 * Asserts that every foreground/background pair the design system actually
 * draws with clears WCAG AA in the scheme it is used in. This exists because
 * the original badges were white-on-teal at 1.89:1 and nothing in a README
 * review would have caught it - a contrast failure is invisible until someone
 * with low vision tries to read the page.
 *
 * Runs in CI. Exits non-zero on any failure.
 */

import { tokens, contrast } from './lib/svg.mjs'

/** [foreground, background, label, minimum] - 4.5 is AA body, 3.0 is AA large. */
const PAIRS = [
  ['text', 'page', 'body text on page', 4.5],
  ['text', 'surface', 'body text on card', 4.5],
  ['text', 'surfaceAlt', 'body text on raised surface', 4.5],
  ['textMuted', 'page', 'secondary text on page', 4.5],
  ['textMuted', 'surface', 'secondary text on card', 4.5],
  ['textMuted', 'surfaceAlt', 'secondary text on raised surface', 4.5],
  ['textFaint', 'surface', 'faint label on card', 4.5],
  // Per-accent on-colours. A single on-brand value cannot serve all three:
  // white on teal measures 1.89:1 and dark text on violet measures 3.81:1,
  // so each fill carries the text colour that actually clears AA against it.
  ['on.teal', 'brand.teal', 'text on teal fill', 4.5],
  ['on.blue', 'brand.blue', 'text on blue fill', 4.5],
  ['on.violet', 'brand.violet', 'text on violet fill', 4.5],
]

const resolve = (scheme, path) =>
  path.split('.').reduce((o, k) => o?.[k], scheme)

let failures = 0
let checked = 0

for (const name of ['light', 'dark']) {
  const s = tokens.schemes[name]
  console.log(`\n${name}`)
  for (const [fg, bg, label, min] of PAIRS) {
    const a = resolve(s, fg)
    const b = resolve(s, bg)
    if (!a || !b) {
      console.log(`  ? ${label}: unresolved (${fg} / ${bg})`)
      continue
    }
    const r = contrast(a, b)
    checked++
    const ok = r >= min
    if (!ok) failures++
    console.log(
      `  ${ok ? 'pass' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${label}  ${a} on ${b}`,
    )
  }
}

// Brand fills are also used for large display text on the page background,
// which has a lower bar.
for (const name of ['light', 'dark']) {
  const s = tokens.schemes[name]
  for (const c of ['blue', 'teal', 'violet']) {
    const col = s.brand[c]
    const r = contrast(col, s.page)
    checked++
    const ok = r >= 3
    if (!ok) failures++
    console.log(`  ${ok ? 'pass' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (min 3)  ${name} brand.${c} on page  ${col}`)
  }
}

console.log(`\n${checked - failures}/${checked} pairs pass`)

// The specific regression this gate exists to prevent.
const whiteOnTeal = contrast('#ffffff', '#19d2c7')
console.log(
  `\nnote: white on brand teal measures ${whiteOnTeal.toFixed(2)}:1, which is why the ` +
    'badges render locally with explicit text colour rather than through shields.io.',
)

process.exit(failures ? 1 : 0)
