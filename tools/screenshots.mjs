/**
 * README screenshots for visual QA and delivery.
 *
 * Renders tools/.preview/index.html at the widths GitHub READMEs are actually
 * read at, in both colour schemes, and saves full-page captures plus detail
 * crops. Run tools/preview.mjs first (render-all.mjs does both).
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { ROOT } from './lib/svg.mjs'

const WIDTHS = [1440, 1280, 1024, 768, 390, 360]
const SCHEMES = ['dark', 'light']
const OUT = join(ROOT, 'docs', 'previews')

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()

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
    const dest = join(OUT, `readme-${scheme}-${width}.png`)
    await page.screenshot({ path: dest, fullPage: true })
    console.log(`  ${scheme} ${width}px -> docs/previews/readme-${scheme}-${width}.png`)
    await page.close()
  }

  // Detail crops at GitHub's desktop column width.
  const page = await browser.newPage({
    viewport: { width: 1280, height: 1000 },
    colorScheme: scheme,
    deviceScaleFactor: 2,
  })
  await page.goto(pathToFileURL(join(ROOT, 'tools', '.preview', 'index.html')).href)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1900)

  const pictures = page.locator('main picture')
  const count = await pictures.count()
  for (let i = 0; i < count; i++) {
    const name = i === 0 ? 'hero' : `plate-${i}`
    await pictures.nth(i).screenshot({ path: join(OUT, `detail-${name}-${scheme}.png`) })
  }
  console.log(`  ${scheme} detail crops -> ${count} pictures`)
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
  await rm.screenshot({ path: join(OUT, `readme-${scheme}-reduced-motion.png`), fullPage: true })
  console.log(`  ${scheme} reduced-motion capture`)
  await rm.close()
}

await browser.close()
console.log('screenshots done')
