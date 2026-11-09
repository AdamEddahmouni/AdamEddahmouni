# Content sources and verification

Every public claim on the profile is traceable to one of these sources. Verified
2026-11-09. If a fact cannot be re-verified, it is removed from the README rather
than left in place.

## Identity

| Claim | Source | Status |
| --- | --- | --- |
| GitHub login `AdamEddahmouni` | GitHub API `/user` | verified |
| Name “Adam Eddahmouni” | GitHub API `/user` (`name`), repository history | verified |
| “Penn State student” | GitHub profile bio: “Full-stack and quantitative systems developer … // Penn State Student” | verified from bio; degree subject deliberately not stated |
| “Pennsylvania, United States” | GitHub API `/user` `location` | verified |
| Public repositories | GitHub API: 5 public repositories, of which 3 are featured projects | verified |
| “open-source research software, developer tooling, and market-data systems” | The three featured public repositories: NosoGraph, Agent-Ready, Short Squeeze Screener | verified from repository descriptions and code |
| LinkedIn URL | Previous profile README in this repository (owner-supplied) | unverified externally; kept because the owner published it |
| Email `adameddahmouni@gmail.com` | Previous profile README in this repository (owner-supplied); commit emails are GitHub noreply | unverified externally; kept because the owner published it |

## Featured projects

### NosoGraph — `AdamEddahmouni/nosograph`

| Claim | Source |
| --- | --- |
| “Open-source research software for connecting disease knowledge, evidence, and provenance across biomedical sources” | Repository description + `README.md` |
| 25 registered pipeline adapters | `README.md` status table |
| 2,445 offline tests selected in the v0.2.1 suite (repository-reported, not rerun here) | `README.md` status table + `docs/generated/public-status.yaml` |
| v0.2.1, Public Alpha | `README.md` status section |
| Apache-2.0 | GitHub API license metadata |
| DOI 10.5281/zenodo.22055279 | `README.md` citation block |
| Docs at `adameddahmouni.github.io/nosograph/` | GitHub API `homepage` |
| Sources MONDO, HPO, PubMed, ClinicalTrials.gov, Open Targets, GWAS | `README.md` body (“complements upstream resources such as …”) |
| Evidence states supporting / contradictory / inconclusive / unasserted, missing metadata stays `unknown` | `README.md` “Evidence, provenance, and limits” |
| Evidence chain: disease → typed claim → evidence relationship → study/source → provenance/snapshot | `README.md` code block and architecture docs link |

Deliberately not claimed: clinical validity, diagnosis, treatment guidance,
hosted demo availability, or that the graph proves anything.

### Agent-Ready — `AdamEddahmouni/agent-ready`

| Claim | Source |
| --- | --- |
| “The missing contract between repositories and coding agents” | Repository description |
| 11 CLI commands | `README.md` command table and project status |
| Five generated adapter targets: `AGENTS.md`, `CLAUDE.md`, `.cursorrules`, Copilot, Gemini | `README.md` “Vendor-Neutral” |
| No API keys, no LLM calls, no network access | `README.md` “Deterministic by Design” |
| 557 tests across 41 test files on Ubuntu, Windows, and macOS (a repository-reported CI count, not a run executed here) | `README.md` project status |
| v0.6.1, pre-1.0, Apache-2.0 | `README.md` project status + GitHub API license |

Deliberately not claimed: external adoption. The project README itself states
there is no external adoption claimed.

### Short Squeeze Screener — `AdamEddahmouni/short-squeeze-screener-internship`

| Claim | Source |
| --- | --- |
| Read-only research screener; no orders, brokerage account, recommendations, or predictive validation | Repository `README.md` |
| v0.16.0 | `README.md` version table + `pyproject.toml` pointer |
| Python 3.12 | `README.md` quick start |
| `FROZEN_DEMO` reproducible mode | `README.md` quick start |
| MIT | GitHub API license metadata |

Deliberately not claimed: returns, accuracy, profitability, live data.

## Projects excluded from the profile

| Item | Why |
| --- | --- |
| `market-trading-platform` | Private repository (not in the public repository list). Linking it publicly would produce a 404 and imply public access. Excluded from README and from the public project manifest. |
| ModelMarks, Cedar Almanac / Cedar Creek Farms, SalvageSyndicate, “Product Suite” | Named in the supplied design references as illustrative examples. No matching public repository or documentation was found, so they are not presented as Adam's work. |
| Reference mockup metrics (“30+ projects”, “1,402 contributions”, “+2.34%”, LAT/LON/ELEV) | Invented in the design mockups. Removed. The only activity figure used is the captured contribution total, labelled with its capture date. |

## Contribution data

`tools/repo-data.json` is captured by `tools/fetch-repo-data.mjs` from the public
commit history of the three featured repositories over the trailing 371 days —
**not** GitHub's contribution graph, which includes private activity that a
repository-scoped token cannot read. The current capture is dated 2026-11-08 and
reports 451 public commits. The activity plate says `PUBLIC COMMITS` and prints
the capture date, so the figure is never mistaken for live data or for the
private-aware contribution total on the GitHub profile. If a later API call
fails, the committed file is left untouched and the last valid plate survives.

## Evidence links in the README

All four were fetched on 2026-11-09 and return HTTP 200:

| Link | Source |
| --- | --- |
| NosoGraph evidence model | `nosograph/docs/architecture/evidence-model.md` |
| Agent-Ready CLI reference | `agent-ready/docs/specification/cli-reference.md` |
| Agent-Ready recorded adapter outputs | `agent-ready/compatibility/adapter-output/v2` |
| Screener CLI documentation | `short-squeeze-screener-internship/short-squeeze-core/docs/CLI.md` |
| Evidence Explorer capture | `nosograph/docs/assets/product/evidence-explorer.webp` (1440×900; published by the project's own README) |

The capture is a real interface image from the public repository. The README
labels it as a capture, not a hosted demo, and keeps the research-software
caveat. It is stored in this repository at
`assets/evidence/authentic/evidence-explorer.webp` so the profile does not depend
on another repository's file layout; the source path is recorded above.

## Artwork provenance

All artwork is original and generated by the scripts in `tools/`. The surface is
a parametric height field projected in code, not a stock image or an
image-generator output. Project plates are explicitly labelled “CONCEPTUAL
DIAGRAM” in the artwork and in the README alt text; none is presented as a
screenshot. No third-party logos or fonts beyond the licensed OFL faces
(Playfair Display, Inter, IBM Plex Mono) are embedded.
