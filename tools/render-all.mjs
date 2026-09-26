/**
 * Rebuild every generated asset, then run the contrast gate.
 *
 *   node tools/render-all.mjs
 *
 * Fonts and icon paths are cached in tools/lib, so this is offline and
 * deterministic. Run tools/fetch-repo-data.mjs first to refresh the numbers.
 */

import { spawnSync } from 'node:child_process'

const STEPS = [
  'render-hero.mjs',
  'render-cards.mjs',
  'render-ui.mjs',
  'render-stats.mjs',
]

for (const step of STEPS) {
  console.log(`\n── ${step}`)
  const r = spawnSync(process.execPath, [`tools/${step}`], { stdio: 'inherit' })
  if (r.status !== 0) process.exit(r.status ?? 1)
}

console.log('\n── check-contrast.mjs')
const c = spawnSync(process.execPath, ['tools/check-contrast.mjs'], { stdio: 'inherit' })
process.exit(c.status ?? 0)
