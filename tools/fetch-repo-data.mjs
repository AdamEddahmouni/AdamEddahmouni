/**
 * Pulls live repository metadata for the project cards and stats.
 *
 * Output is committed, so rendering is offline and deterministic; this script
 * is what CI re-runs to keep the numbers honest. Uses an optional
 * GITHUB_TOKEN to lift the anonymous rate limit.
 */

import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, tokens } from './lib/svg.mjs'

const OWNER = 'AdamEddahmouni'
const REPOS = Object.keys(tokens.projects)
const HEAD = {
  accept: 'application/vnd.github+json',
  'user-agent': 'profile-readme-assets',
  ...(process.env.GITHUB_TOKEN ? { authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
}

const out = { generated: new Date().toISOString().slice(0, 10), repos: {} }

/** Public commit activity over the last 12 months.
 *
 * The contributions calendar needs a token with read:user, which a repo-scoped
 * CI token does not have. Commit timestamps on public repos are public data,
 * so the heatmap is built from those instead and labelled for what it is. */
async function fetchActivity() {
  const since = new Date(Date.now() - 371 * 864e5).toISOString()
  const byDay = new Map()
  let total = 0
  for (const repo of REPOS) {
    for (let page = 1; page <= 5; page++) {
      const url = `https://api.github.com/repos/${OWNER}/${repo}/commits?since=${since}&per_page=100&page=${page}`
      const r = await fetch(url, { headers: HEAD })
      if (!r.ok) break
      const batch = await r.json()
      if (!Array.isArray(batch) || batch.length === 0) break
      for (const c of batch) {
        const d = c.commit?.committer?.date?.slice(0, 10)
        if (!d) continue
        byDay.set(d, (byDay.get(d) ?? 0) + 1)
        total++
      }
      if (batch.length < 100) break
    }
  }
  return { byDay: Object.fromEntries(byDay), total }
}

for (const repo of REPOS) {
  try {
    const r = await fetch(`https://api.github.com/repos/${OWNER}/${repo}`, { headers: HEAD })
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const d = await r.json()
    const commit = await fetch(
      `https://api.github.com/repos/${OWNER}/${repo}/commits?per_page=1`,
      { headers: HEAD },
    )
    const c = commit.ok ? (await commit.json())[0] : null
    out.repos[repo] = {
      stars: d.stargazers_count,
      forks: d.forks_count,
      license: d.license?.spdx_id ?? null,
      language: d.language,
      lastCommit: c?.commit?.committer?.date?.slice(0, 10) ?? null,
      pushedAt: d.pushed_at?.slice(0, 10) ?? null,
      defaultBranch: d.default_branch,
    }
    console.log(
      `  ${repo.padEnd(36)} ${String(d.stargazers_count).padStart(3)}★  ` +
        `${(d.license?.spdx_id ?? 'no licence').padEnd(12)} last ${out.repos[repo].lastCommit}`,
    )
  } catch (err) {
    console.warn(`  ! ${repo}: ${err.message}`)
  }
}

// account-level figures
try {
  const u = await (await fetch(`https://api.github.com/users/${OWNER}`, { headers: HEAD })).json()
  out.account = {
    followers: u.followers, publicRepos: u.public_repos, location: u.location, bio: u.bio,
  }
} catch (err) { console.warn(`  ! account: ${err.message}`) }

// language composition across the project repos
{
  const langs = {}
  for (const repo of REPOS) {
    try {
      const l = await (await fetch(`https://api.github.com/repos/${OWNER}/${repo}/languages`, { headers: HEAD })).json()
      for (const [k, v] of Object.entries(l)) langs[k] = (langs[k] ?? 0) + v
    } catch { /* repo may have vanished; skip */ }
  }
  const total = Object.values(langs).reduce((a, b) => a + b, 0)
  out.languages = Object.entries(langs)
    .sort((a, b) => b[1] - a[1])
    .map(([name, bytes]) => ({ name, bytes, pct: +((bytes / total) * 100).toFixed(1) }))
  console.log(`
  languages: ${out.languages.slice(0, 6).map((l) => `${l.name} ${l.pct}%`).join(', ')}`)
}

out.activity = await fetchActivity()
const days = Object.keys(out.activity.byDay).length
console.log(`  activity: ${out.activity.total} public commits across ${days} active days`)

writeFileSync(join(ROOT, 'tools', 'repo-data.json'), JSON.stringify(out, null, 2), 'utf8')
console.log(`\nwrote tools/repo-data.json (${Object.keys(out.repos).length}/${REPOS.length} repos)`)
