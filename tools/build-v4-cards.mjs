/**
 * Derive the linked project cards and the light-theme buttons from the
 * approved V4 presentation plates.
 *
 * The V4 artwork is art-directed raster, not something the SVG generators can
 * recreate. These derivatives therefore crop the approved gallery plates into
 * one card per project and recolour the dark button art into the light scheme;
 * no artwork is redrawn and no copy is re-typeset.
 *
 *   npm install --no-save sharp
 *   node tools/build-v4-cards.mjs
 *
 * sharp is a local build tool, not a runtime dependency: the committed WebP
 * outputs are what the README references, and CI validates them without sharp.
 */

import { existsSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from './lib/svg.mjs'

let sharp
try {
  ;({ default: sharp } = await import('sharp'))
} catch {
  console.error('sharp is required: npm install --no-save sharp')
  process.exit(1)
}

const GALLERY = 'assets/studio-v4/presentation/gallery'
const BUTTONS = 'assets/studio-v4/presentation/buttons'

// Card rectangles measured from the approved plates. The desktop plate holds
// three 628x640 cards at x = 29 / 686 / 1343, y = 133. The mobile plate holds
// three 676x646 cards at x = 36, y = 159 / 879 / 1598. The plate header and
// inter-card gutters are deliberately excluded.
const DESKTOP_CROPS = {
  nosograph: { left: 29, top: 133 },
  'agent-ready': { left: 686, top: 133 },
  'short-squeeze-screener': { left: 1343, top: 133 },
}
const MOBILE_CROPS = {
  nosograph: { left: 36, top: 159 },
  'agent-ready': { left: 36, top: 879 },
  'short-squeeze-screener': { left: 36, top: 1598 },
}
const DESKTOP_SIZE = { width: 628, height: 640 }
const MOBILE_SIZE = { width: 676, height: 646 }

// Dark-scheme roles map to their light-scheme counterparts. A nearest-colour
// transfer keeps the anti-aliased type and icon edges smooth instead of
// posterising them with a hard palette swap.
const ROLE_MAP = [
  ['#080E14', '#F7F4EC'],
  ['#0F1B24', '#FDFBF5'],
  ['#14232D', '#F0EBDF'],
  ['#22333D', '#DDD6C7'],
  ['#344650', '#B9B0A0'],
  ['#F5F1E8', '#0A1117'],
  ['#A8B7BE', '#4B5A63'],
  ['#8C9DA6', '#5F6E77'],
  ['#22D3C5', '#0B6E6A'],
  ['#0B7A78', '#0B6E6A'],
  ['#FF8A5B', '#B2451F'],
  ['#746EF2', '#5646CE'],
  ['#9C97F5', '#6C5FE0'],
]
const BUTTONS_TO_LIGHTEN = ['linkedin', 'projects', 'research', 'contact']

const parse = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

// sRGB -> CIE Lab (D65), used only to pick palette neighbours.
function lab([r, g, b]) {
  const lin = [r, g, b].map((v) => {
    v /= 255
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  const x = (lin[0] * 0.4124 + lin[1] * 0.3576 + lin[2] * 0.1805) / 0.95047
  const y = lin[0] * 0.2126 + lin[1] * 0.7152 + lin[2] * 0.0722
  const z = (lin[0] * 0.0193 + lin[1] * 0.1192 + lin[2] * 0.9505) / 1.08883
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]
}

const ROLES = ROLE_MAP.map(([from, to]) => ({
  from: parse(from),
  to: parse(to),
  lab: lab(parse(from)),
}))

function transfer(pixel) {
  const p = lab(pixel)
  const scored = ROLES.map((role) => {
    const d = Math.hypot(p[0] - role.lab[0], p[1] - role.lab[1], p[2] - role.lab[2])
    return { role, w: 1 / (d ** 6 + 1e-6) }
  }).sort((a, b) => b.w - a.w)
  const top = scored.slice(0, 3)
  const total = top.reduce((s, x) => s + x.w, 0)
  return [0, 1, 2].map((i) =>
    Math.round(top.reduce((s, x) => s + x.role.to[i] * x.w, 0) / total),
  )
}

async function lightenButton(id) {
  const src = join(ROOT, BUTTONS, `${id}-dark.webp`)
  const out = join(ROOT, BUTTONS, `${id}-light.webp`)
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] === 0) continue
    const [r, g, b] = transfer([data[i], data[i + 1], data[i + 2]])
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .webp({ quality: 90, effort: 6, smartSubsample: true })
    .toFile(out)
  return out
}

async function cropCard(project, layout) {
  const scheme = layout.scheme
  const plate = join(ROOT, GALLERY, `featured-${layout.plate}-${scheme}.webp`)
  const box = layout.crops[project]
  const out = join(ROOT, GALLERY, `${project}-${layout.plate}-${scheme}.webp`)
  await sharp(plate)
    .extract({ left: box.left, top: box.top, ...layout.size })
    .webp({ quality: 90, effort: 6, smartSubsample: true })
    .toFile(out)
  return out
}

const LAYOUTS = [
  { plate: 'desktop', size: DESKTOP_SIZE, crops: DESKTOP_CROPS },
  { plate: 'mobile', size: MOBILE_SIZE, crops: MOBILE_CROPS },
]
const PROJECTS = Object.keys(DESKTOP_CROPS)

let failures = 0
const report = (file) => {
  if (!existsSync(file)) {
    console.error(`MISSING ${file}`)
    failures++
    return
  }
  const buf = readFileSync(file)
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') {
    console.error(`INVALID WebP ${file}`)
    failures++
    return
  }
  console.log(`${file.slice(ROOT.length + 1)}: ${statSync(file).size} bytes`)
}

for (const project of PROJECTS) {
  for (const layout of LAYOUTS) {
    for (const scheme of ['dark', 'light']) {
      report(await cropCard(project, { ...layout, scheme }))
    }
  }
}
for (const button of BUTTONS_TO_LIGHTEN) report(await lightenButton(button))

console.log(failures ? `${failures} problem(s)` : 'V4 derivatives built')
process.exit(failures ? 1 : 0)
