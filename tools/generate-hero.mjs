/**
 * Hero — the profile's masthead.
 *
 * Desktop: editorial identity on the left, generated signal surface and its
 * instrumentation on the right — the approved reference composition. Mobile:
 * the same hierarchy recomposed at a type scale that survives GitHub's ~330px
 * content column instead of shrinking the desktop plate.
 *
 * The statement and the links are deliberately *not* baked into this plate.
 * They are real Markdown below it, so the essential content stays selectable,
 * translatable, screen-reader accessible and legible at every width.
 *
 * All facts come from data/profile.json.
 */

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  ROOT, tokens, schemeOf, text, label, rule, grain, dotField, dotFill,
  radialBloom, mix, plateRect, plateClip,
} from './lib/svg.mjs'
import { asset } from './lib/asset.mjs'
import { surface } from './lib/surface.mjs'
import { ring, bracketFrame } from './lib/marks.mjs'

const profile = JSON.parse(readFileSync(join(ROOT, 'data', 'profile.json'), 'utf8'))

const DESKTOP = { w: 1200, h: 430, pad: 48 }
const MOBILE = { w: 480, h: 540, pad: 26 }

function masthead(a, sc, L, mobile) {
  const { w, pad } = L
  const y = mobile ? 40 : 56
  a.node(label(pad, y, `${profile.monogram} / ENGINEERING STUDIO`, {
    size: mobile ? 8.6 : 11,
    tracking: mobile ? 1.8 : 3.2,
    fill: sc.textMuted,
  }))
  a.node(label(w - pad, y, profile.tagline, {
    size: mobile ? 8.6 : 11,
    tracking: mobile ? 1.8 : 3.2,
    fill: sc.textMuted,
    anchor: 'end',
  }))
  const lineY = y - 4
  const lineW = 96
  const lineX = 300
  // The rule sits between the two labels on desktop; the phone plate is too
  // narrow for it, and the full-width hairline below already does the job.
  if (!mobile) {
    a.node(`<rect x="${lineX}" y="${lineY}" width="${lineW}" height="1.5" fill="url(#topRule)"/>`)
  }
  a.node(rule(pad, y + 22, w - pad, y + 22, sc.border, 0.8))
}

async function render(scheme, layout) {
  const sc = schemeOf(scheme)
  const mobile = layout === 'mobile'
  const L = mobile ? MOBILE : DESKTOP
  const { w, h, pad } = L
  const nameSize = mobile ? 52 : tokens.type.scale.display

  const surfaceBox = mobile
    ? { x: -60, y: 190, w: 600, h: 320 }
    : { x: 400, y: -10, w: 840, h: 450 }

  const surf = surface({
    scheme, sc,
    ...surfaceBox,
    id: 'heroSurf',
    seed: 187,
    cols: mobile ? 34 : 58,
    rows: mobile ? 20 : 32,
    crests: [
      { u: 0.64, v: 0.33, amp: 1.0, su: 0.17, sv: 0.2 },
      { u: 0.3, v: 0.62, amp: 0.56, su: 0.2, sv: 0.24 },
      { u: 0.87, v: 0.64, amp: 0.33, su: 0.14, sv: 0.18 },
    ],
    horizon: mobile ? 0.3 : 0.4,
    depth: mobile ? 0.56 : 0.5,
    elevation: mobile ? 0.3 : 0.46,
    spread: 1.04,
    glow: scheme === 'dark' ? 1 : 0.75,
  })

  const a = asset({
    w, h, scheme,
    path: `assets/hero/hero-${layout}-${scheme}.svg`,
    title: 'Adam Eddahmouni — engineering studio',
    desc:
      `Adam Eddahmouni, ${profile.descriptor.toLowerCase().replace(/ \/ /g, ', ')}. ` +
      'Generated parametric surface: teal low ridges rising to a copper crest, with abstract instrumentation arcs behind it.',
    defs: `
<linearGradient id="topRule" x1="0" y1="0" x2="1" y2="0">
  <stop offset="0" stop-color="${sc.brand.teal}"/>
  <stop offset=".75" stop-color="${sc.brand.teal}"/>
  <stop offset="1" stop-color="${sc.brand.copper}"/>
</linearGradient>
${dotField('heroDots', sc, 30, 1)}
${plateClip('heroPlate', w, h)}
${surf.defs}`,
  })

  a.node(plateRect(w, h, sc.page, sc.border))
  a.node(`<g clip-path="url(#heroPlate)">`)

  // masthead: monogram, tagline, dual-colour rule
  masthead(a, sc, L, mobile)

  // atmosphere
  a.node(radialBloom(mobile ? 340 : 880, mobile ? 380 : 200, mobile ? 260 : 420, sc.brand.teal, scheme === 'dark' ? 0.11 : 0.08))
  a.node(radialBloom(mobile ? 460 : 1120, mobile ? 300 : 130, 230, sc.brand.copper, scheme === 'dark' ? 0.07 : 0.05))
  a.node(dotFill(0, 0, w, h, 'heroDots', scheme === 'dark' ? 0.55 : 0.6))

  // instrumentation behind the surface
  const ringCx = mobile ? 360 : 830
  const ringCy = mobile ? 350 : 210
  const ringR = mobile ? 118 : 196
  a.node(`<g class="fade d1">${ring(ringCx, ringCy, ringR, sc, {
    arcs: [
      { from: 196, to: 330, opacity: 0.5 },
      { from: 20, to: 128, opacity: 0.34, color: sc.brand.copper },
    ],
    ticks: 60,
    tickLength: mobile ? 3 : 4,
    opacity: scheme === 'dark' ? 0.85 : 0.6,
  })}</g>`)

  a.node(surf.markup)

  // identity
  const firstY = mobile ? 132 : 200
  const secondY = mobile ? 186 : 306
  a.node(text(pad, firstY, profile.name.first, {
    family: 'serif', size: nameSize, weight: 400, fill: sc.text, tracking: -1.4,
  }))
  a.node(text(pad, secondY, profile.name.last, {
    family: 'serif', size: nameSize, weight: 400, fill: sc.text, tracking: -1.6,
  }))
  a.node(`<rect x="${mobile ? 336 : 588}" y="${secondY - (mobile ? 8 : 9)}" width="${mobile ? 28 : 50}" height="${mobile ? 5 : 8}" rx="1.5" fill="${sc.brand.copper}"/>`)
  a.node(label(pad, mobile ? 218 : 354, profile.descriptor, {
    size: mobile ? 10.2 : 11,
    tracking: mobile ? 1.2 : 2.5,
    fill: mix(sc.textMuted, sc.text, 0.25),
  }))

  // furniture
  const frame = mobile
    ? { x: w - 66, y: 438, w: 40, h: 34 }
    : { x: 1052, y: 300, w: 100, h: 54 }
  a.node(bracketFrame(frame.x, frame.y, frame.w, frame.h, sc.borderStrong, { len: 12, opacity: 0.7 }))

  const footY = mobile ? 506 : 400
  a.node(rule(pad, footY - 22, w - pad, footY - 22, sc.border, 0.9))
  a.node(text(pad, footY, mobile ? profile.location.toUpperCase() : `github.com/${profile.username}`, {
    family: 'mono', size: mobile ? 8.6 : 10, weight: 400, tracking: 1.1, fill: sc.textFaint,
  }))
  if (!mobile) {
    a.node(text(w / 2, footY, profile.location.toUpperCase(), {
      family: 'mono', size: 9.6, weight: 400, tracking: 1.8, fill: sc.textFaint, anchor: 'middle',
    }))
    a.node(text(w - pad, 344, 'SIGNAL SURFACE / GENERATED', {
      family: 'mono', size: 8.5, weight: 400, tracking: 1.8, fill: sc.textFaint, anchor: 'end',
    }))
  }
  a.node(text(w - pad, footY, profile.availability.toUpperCase(), {
    family: 'mono', size: mobile ? 8.6 : 10, weight: 500, tracking: 1.4, fill: sc.textFaint, anchor: 'end',
  }))

  a.node(grain(sc, w, h))
  a.node(`</g>`)
  await a.commit()
}

for (const layout of ['desktop', 'mobile']) {
  for (const scheme of ['dark', 'light']) await render(scheme, layout)
}
console.log('hero done')
