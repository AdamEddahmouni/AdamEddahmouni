/**
 * README screenshots for visual QA and delivery.
 *
 * Renders tools/.preview/index.html at the widths GitHub READMEs are actually
 * read at, in both colour schemes, and saves full-page captures plus named
 * detail crops. Run tools/preview.mjs first (render-all.mjs does both).
 *
 * Captures are JPEG, not PNG: a full 1440 px page with the cinematic hero is
 * nearly 2 MB as PNG, which is not a reasonable thing to commit for QA evidence.
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { ROOT } from './lib/svg.mjs'

const WIDTHS = [1440, 1280, 1024, 768, 390, 360]
const SCHEMES = ['dark', 'light']
const OUT = join(ROOT, 'docs', 'previews')
const QUALITY = 84
const CROPS = [
  ['hero', 'picture:has(img[src*="hero/"])'],
  ['glance', 'picture:has(img[src*="glance/"])'],
  ['card-nosograph', 'img[src*="gallery/nosograph-desktop-dark"]'],
  ['card-agent-ready', 'img[src*="gallery/agent-ready-desktop-dark"]'],
  ['card-screener', 'img[src*="gallery/short-squeeze-screener-desktop-dark"]'],
  ['pipeline', 'picture:has(img[src*="evidence/pipeline"])'],
  ['evidence-capture', 'details img'],
  ['activity', 'picture:has(img[src*="activity/activity"])'],
]

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()
const shot = (page, path) => page.screenshot({ path, type: 'jpeg', quality: QUALITY, fullPage: true })

for (const scheme of SCHEMES) {
  for (const width of WIDTHS) {
    const page = await browser.newPage({
      viewport: { width, height: 1000 },
      colorScheme: scheme,
      deviceScaleFactor: 1,
    })
    await page.goto(pathToFileURL(join(ROOT, 'tools', '.preview', 'index.html')).href)
    await page.waitForLoadState('networkidle')
    // Let the one-time reveals finish so captures show the settled state.
    await page.waitForTimeout(1900)
    const dest = join(OUT, `readme-${scheme}-${width}.jpg`)
    await shot(page, dest)
    console.log(`  ${scheme} ${width}px -> docs/previews/readme-${scheme}-${width}.jpg`)
    await page.close()
  }

  // Named detail crops at GitHub's desktop column width.
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1000 },
    colorScheme: scheme,
    deviceScaleFactor: 2,
  })
  await page.goto(pathToFileURL(join(ROOT, 'tools', '.preview', 'index.html')).href)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1900)
  // The real capture lives in a closed disclosure; open it only for its crop.
  await page.locator('details').evaluate((d) => { d.open = true })
  for (const [name, selector] of CROPS) {
    const target = page.locator(selector).first()
    await target.scrollIntoViewIfNeeded()
    await target.screenshot({ path: join(OUT, `detail-${name}-${scheme}.jpg`), type: 'jpeg', quality: QUALITY })
  }
  console.log(`  ${scheme} detail crops -> ${CROPS.length} named plates`)
  await page.close()

  // Reduced-motion state, to prove the profile reads without animation.
  const rm = await browser.newPage({
    viewport: { width: 1280, height: 1000 },
    colorScheme: scheme,
    reducedMotion: 'reduce',
    deviceScaleFactor: 1,
  })
  await rm.goto(pathToFileURL(join(ROOT, 'tools', '.preview', 'index.html')).href)
  await rm.waitForLoadState('networkidle')
  await shot(rm, join(OUT, `readme-${scheme}-reduced-motion.jpg`))
  console.log(`  ${scheme} reduced-motion capture`)
  await rm.close()
}

await browser.close()
console.log('screenshots done')
