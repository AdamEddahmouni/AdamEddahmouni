/**
 * Link buttons.
 *
 * GitHub strips CSS from READMEs, so a real button has to be an image wrapped
 * in a link: `[![label](button.svg)](href)`. Each pill is drawn once in the
 * studio palette and is deliberately theme-neutral — dark ink on either theme —
 * because a <picture> inside an <a> loses its <source> elements on GitHub and
 * could never switch variants.
 *
 * These are the *only* images that are interactive, and every one of them is a
 * genuine link defined in README.md.
 */

import { text, mix } from './lib/svg.mjs'
import { asset } from './lib/asset.mjs'
import { icon } from './lib/marks.mjs'

const W = 300
const H = 88
const INK = '#0F1B24'
const IVORY = '#F5F1E8'
const BORDER = '#344650'
const TEAL = '#22D3C5'
const COPPER = '#FF8A5B'
const MUTED = '#A8B7BE'

const BUTTONS = [
  { id: 'linkedin', label: 'LinkedIn', icon: 'link', accent: TEAL },
  { id: 'projects', label: 'Projects', icon: 'doc', accent: TEAL },
  { id: 'research', label: 'Research', icon: 'research', accent: TEAL },
  { id: 'contact', label: 'Contact', icon: 'mail', accent: COPPER },
]

for (const button of BUTTONS) {
  const a = asset({
    w: W, h: H, scheme: 'dark',
    path: `assets/ui/button-${button.id}.svg`,
    title: `${button.label} link`,
    desc: `Button linking to ${button.label}.`,
  })

  a.node(`<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="44" fill="${INK}" stroke="${BORDER}"/>`)
  a.node(`<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="44" fill="${button.accent}" fill-opacity=".06"/>`)

  const labelWidth = button.label.length * 21 * 0.53
  const groupWidth = 26 + 12 + labelWidth
  const startX = (W - groupWidth) / 2
  a.node(icon(button.icon, startX, H / 2 - 13, 26, button.accent))
  a.node(text(startX + 38, H / 2 + 7.5, button.label, {
    family: 'sans', size: 21, weight: 500, fill: IVORY, tracking: 0.2,
  }))

  await a.commit()
}

console.log('ui done')
