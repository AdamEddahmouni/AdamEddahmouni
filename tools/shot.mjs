/**
 * Quick single-asset screenshot, for iterating on one plate without loading
 * the whole README. Development only.
 *
 *   node tools/shot.mjs assets/hero/hero-desktop-dark.svg docs/previews/hero-dark.png 1200
 */

import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { ROOT } from './lib/svg.mjs'

const [file, out, widthArg] = process.argv.slice(2)
if (!file || !out) {
  console.error('usage: node tools/shot.mjs <svg> <png> [width]')
  process.exit(1)
}

const width = Number(widthArg ?? 1200)
const target = resolve(ROOT, file)
const dest = join(ROOT, out)
mkdirSync(dirname(dest), { recursive: true })

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 2 })
await page.goto(`file://${target}`)
await page.waitForTimeout(1800)
await page.screenshot({ path: dest, fullPage: true })
await browser.close()
console.log(`wrote ${out}`)
