/**
 * V4 presentation asset gate.
 *
 * Validates every WebP the README actually references: WebP signature,
 * dimensions at the artboard size, complete project/button families, and exact
 * byte budgets. It also confirms the approved gallery plates that the card
 * crop tool depends on are still present, so the derivatives stay reproducible.
 *
 * No image library is required; the VP8/VP8L/VP8X headers carry the size.
 */

import { readFileSync, existsSync, statSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const readme = readFileSync(resolve(ROOT, 'README.md'), 'utf8')
const refs = [...new Set([...readme.matchAll(/\.\/assets\/[\w./-]+\.webp/g)].map((m) => m[0].slice(2)))].sort()

const PROJECTS = ['nosograph', 'agent-ready', 'short-squeeze-screener']
const BUTTONS = ['linkedin', 'projects', 'research', 'contact']

// Exact artboard sizes: a variant that silently changed shape would distort on
// GitHub's content column even if the file still loaded.
const expectedSize = (ref) => {
  if (ref.includes('/presentation/hero/')) {
    return ref.includes('-mobile-') ? [1408, 1584] : [2592, 960]
  }
  if (ref.includes('/presentation/glance/')) {
    return ref.includes('-mobile-') ? [840, 520] : [1120, 290]
  }
  if (ref.includes('/presentation/gallery/')) {
    return ref.includes('-mobile-') ? [676, 646] : [628, 640]
  }
  if (ref.includes('/presentation/buttons/')) return [440, 112]
  if (ref.includes('/evidence/authentic/')) return [1440, 900]
  return null
}

const budget = (ref) => {
  if (ref.includes('/presentation/hero/')) return 550000
  if (ref.includes('/presentation/glance/')) return 50000
  if (ref.includes('/presentation/gallery/')) return 120000
  if (ref.includes('/presentation/buttons/')) return 15000
  if (ref.includes('/evidence/authentic/')) return 90000
  return 0
}

function webpSize(buf) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') return null
  const fmt = buf.toString('ascii', 12, 16)
  if (fmt === 'VP8X') return [1 + buf.readUIntLE(24, 3), 1 + buf.readUIntLE(27, 3)]
  if (fmt === 'VP8 ') return [buf.readUInt16LE(26) & 0x3fff, buf.readUInt16LE(28) & 0x3fff]
  if (fmt === 'VP8L') {
    const bits = buf.readUInt32LE(21)
    return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1]
  }
  return null
}

let problems = 0
let total = 0
for (const ref of refs) {
  const file = resolve(ROOT, ref)
  if (!existsSync(file)) {
    console.error(`MISSING ${ref}`)
    problems++
    continue
  }
  const size = statSync(file).size
  const buf = readFileSync(file)
  const dimensions = webpSize(buf)
  if (!dimensions) {
    console.error(`INVALID WebP ${ref}`)
    problems++
    continue
  }
  const [width, height] = dimensions
  const expected = expectedSize(ref)
  if (!expected || width !== expected[0] || height !== expected[1]) {
    console.error(`WRONG SIZE ${ref}: ${width}x${height}, expected ${expected ? expected.join('x') : 'a known family'}`)
    problems++
  }
  const limit = budget(ref)
  if (!limit || size > limit) {
    console.error(`OVERSIZE ${ref} (${size} > ${limit})`)
    problems++
  }
  total += size
  console.log(`${ref}: ${width}x${height}, ${size} bytes`)
}

// Every family must be complete: a missing light button or mobile card is a
// broken theme or viewport, not a missing optional extra.
const required = [
  ...['desktop', 'mobile'].flatMap((layout) =>
    ['dark', 'light'].map((scheme) => `assets/studio-v4/presentation/hero/hero-${layout}-${scheme}.webp`)),
  ...['desktop', 'mobile'].flatMap((layout) =>
    ['dark', 'light'].map((scheme) => `assets/studio-v4/presentation/glance/glance-${layout}-${scheme}.webp`)),
  ...PROJECTS.flatMap((project) =>
    ['desktop', 'mobile'].flatMap((layout) =>
      ['dark', 'light'].map((scheme) => `assets/studio-v4/presentation/gallery/${project}-${layout}-${scheme}.webp`))),
  ...BUTTONS.flatMap((button) =>
    ['dark', 'light'].map((scheme) => `assets/studio-v4/presentation/buttons/${button}-${scheme}.webp`)),
  'assets/evidence/authentic/evidence-explorer.webp',
]
for (const ref of required) {
  if (!refs.includes(ref)) {
    console.error(`NOT REFERENCED ${ref}`)
    problems++
  }
}
const expectedRefCount = required.length
if (refs.length !== expectedRefCount) {
  console.error(`Expected ${expectedRefCount} referenced WebP assets, found ${refs.length}`)
  problems++
}

// Approved source plates. These are not served, but the card crops cannot be
// reproduced without them.
const plates = ['desktop', 'mobile'].flatMap((layout) =>
  ['dark', 'light'].map((scheme) => `assets/studio-v4/presentation/gallery/featured-${layout}-${scheme}.webp`))
for (const plate of plates) {
  const file = resolve(ROOT, plate)
  if (!existsSync(file) || !webpSize(readFileSync(file))) {
    console.error(`MISSING SOURCE PLATE ${plate}`)
    problems++
  }
}

const mb = (total / 1024 / 1024).toFixed(2)
console.log(`\nV4: ${refs.length} referenced assets, ${mb} MB, ${plates.length} source plates, ${problems} problem(s)`)
process.exit(problems ? 1 : 0)
