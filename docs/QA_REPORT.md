# QA report

Branch reviewed: `profile/engineering-studio`.
Tested commits: `774926a` (baseline) and `90b614a` (remediation).
Date: 2026-11-09. Nothing was merged into `main`.

## 1. CI status

| Run | Commit | Result |
| --- | --- | --- |
| [`42544861673`](https://github.com/AdamEddahmouni/AdamEddahmouni/actions/runs/42544861673) | `774926a` | **failure** — asset size budgets |
| [`42549471766`](https://github.com/AdamEddahmouni/AdamEddahmouni/actions/runs/42549471766) | `90b614a` | **success** — all steps |

The failure was structural, not cosmetic: the workflow divided bytes by 1024,
compared the truncated integer against one flat default, and had no `activity`
category. The hero (91 KB) exceeded a 70 KB hero limit and both activity plates
(59/51 KB) fell through to the 45 KB default. The pipeline stopped there, so
XML, asset-existence, link and lint steps never ran.

## 2. P0 repairs

### 2.1 Asset size

Optimisation came before any budget change:

- **Hero** — the surface now writes integer coordinates instead of tenths and
  samples 52×28 instead of 58×32 (desktop), 30×18 instead of 34×20 (mobile).
  Visual comparison shows the same silhouette, crest and instrumentation.
  Desktop fell from 93,577 B to 70,110 B; mobile from 58,086 B to 48,064 B.
- **Activity** — 365 individual `<rect>` elements became five `<g fill>` groups
  containing `<use href="#acell">` references. 61,372 B → 33,792 B. The grid,
  intensity ramp and day-level data are unchanged.
- Total generated artwork: **32 files, 905,240 B (884 KB)**, down from 1,059 KB.

Budgets now live in `tools/check-assets.mjs`, shared by local builds and CI, and
are exact bytes per component:

| Component | Limit | Largest measured |
| --- | ---: | ---: |
| Hero desktop | 72,000 | 70,110 |
| Hero mobile | 52,000 | 48,064 |
| Activity | 38,000 | 33,792 |
| Evidence | 36,000 | 33,805 |
| Work | 28,000 | 25,696 |
| At a glance | 26,000 | 23,883 |
| UI buttons | 15,000 | 11,448 |

The hero keeps a larger allowance deliberately: the surface is the profile's
signature, while every word beside it stays real Markdown. The check also
verifies the manifest count, total and membership, so an unreferenced asset
cannot silently re-enter the page.

### 2.2 Link validation

`tools/check-links.mjs` now classifies results instead of collapsing them:

- **7 verified** — both project repositories, the getting-started document, the
  NosoGraph documentation site, GitHub profile, DOI (redirects to the Zenodo
  record) and the research repository.
- **1 gated** — LinkedIn answers HTTP 999 to automated clients. It is reported as
  gated and never as independently verified.
- **0 dead**.

The README contains no reference to the private `market-trading-platform`
repository, and the checker fails hard if that name appears. A 404 is a failure,
not a skip.

## 3. P1 mobile legibility

At GitHub's phone column (~330 CSS px) a 480-unit artboard scales by ≈0.69, so
the previous 6–10 unit labels measured 4–7 CSS px. Type that cannot reach the
floor was removed rather than shrunk, and the meaning moved to alt text or
Markdown:

| Plate | Change |
| --- | --- |
| Activity | 16-unit title/total labels; month ticks and weekday labels removed; the title shortens to `GITHUB ACTIVITY` so it cannot collide with the capture date |
| Hero | Two-line 16-unit descriptor; masthead and availability raised; the redundant phone footer location removed |
| At a glance | Titles at 24 units; qualifier notes desktop-only |
| Evidence | 16-unit stage names and detail text, vertical flow preserved; state colour bar removed where it collided with text |
| Work | Phone plates keep the project name at 22 units and drop diagram micro-text; index raised to 14 units |

Captured at 390 and 360 px in both schemes. No horizontal overflow. Desktop
labels were raised too: masthead 12.5, descriptor 13, footers 11.5.

A conflict found and fixed during this pass: the evidence alt text and generator
description said "six-stage"; the chain has seven stages. Corrected.

## 4. Data accuracy

- The activity window now derives from `tools/repo-data.json.generated`; the
  hardcoded end date is gone.
- The plate previously read `PUBLIC + PRIVATE, AS REPORTED`, but the data is
  public commit history, not GitHub's private-aware contribution graph. It now
  reads `PUBLIC COMMITS` and `THREE FEATURED REPOSITORIES`, and the alt text
  says public commit activity. `docs/CONTENT_SOURCES.md` records the distinction.
- Claims re-read from each repository on 2026-11-09:
  - NosoGraph v0.2.1, 25 registered adapters, 2,445 offline tests selected in the
    v0.2.1 suite, Apache-2.0, concept DOI. The repository states the snapshot
    date, not a fresh test run; the profile does not imply otherwise.
  - Agent-Ready 0.6.1 pre-1.0, eleven commands, five adapters, 557 tests across
    41 files on Ubuntu/Windows/macOS (repository-reported CI).
  - Short Squeeze Screener 0.16.0, MIT, read-only, `FROZEN_DEMO`.
- No trading performance, predictive accuracy or clinical claim appears.

## 5. Verification executed

| Check | Command | Result |
| --- | --- | --- |
| Build + gates | `node tools/render-all.mjs` | exit 0 |
| Contrast | `node tools/check-contrast.mjs` | **38/38** pairs pass |
| README structure | `node tools/check-markdown.mjs` | **17/17** |
| Asset budgets | `node tools/check-assets.mjs` | **32/32** referenced, manifest consistent |
| SVG well-formedness | Python `ElementTree` over `assets/**` | **58/58** valid |
| External links | `node tools/check-links.mjs` | 7 verified, 1 gated, 0 dead |
| Markdown lint | `markdownlint-cli2@0.13.0` | **0 errors** |
| Determinism | two renders, `sha256sum` over `assets/**/*.svg` | **byte-identical** |
| CI | GitHub Actions run `42549471766` | **success** |

Screenshots: 1440/1280/1024/768/390/360 px in dark and light, 14 detail crops,
two reduced-motion captures, plus plate close-ups used during the fixes
(`docs/previews/`).

## 6. Real GitHub rendering

The branch README was loaded as a GitHub page, not just raw Markdown:

- 7 `<picture>` elements and **11 images** loaded (`complete = true`) at their
  full natural sizes (1200×430 hero, 1200×380 plates, 1200×300 activity).
- Heading structure intact: Selected work, three project headings, evidence,
  capabilities, activity, contact.
- 4 button images resolve to their destinations; internal anchors resolve on the
  branch page; `mailto:` is intact.
- No missing image, no camo/proxy failure.

Limitation: the scripted browser-resize step failed with a platform tool error,
so GitHub's phone breakpoint was **not** directly emulated on github.com. The
`<picture>` sources and local 390/360 px captures are the evidence for mobile;
the live profile page itself still renders the old README until this branch is
merged into `main`.

## 7. Reference images

The two approved Engineering Studio references
(`01-original-engineering-studio-reference.jpg`,
`02-refined-hero-featured-work-study.png`) are **not present in this workspace**;
they were supplied as attachments in the earlier session. Composition decisions
were made against the established system and the prior render, not against a
fresh pixel comparison in this run. This is a real limitation, not a claimed
comparison.

## 8. Remaining limitations

1. The public profile page (`main`) is unchanged; branch rendering is verified,
   merge is not performed.
2. Firefox and WebKit were not available; Chromium is the only browser tested.
3. LinkedIn is gated (999) and could not be content-verified.
4. Reference images unavailable for pixel comparison (see §7).
5. Legacy artwork (28 files) is preserved but unreferenced; see
   `docs/ASSET_INVENTORY.md`. It is excluded from the manifest and budgets.
6. The render workflow remains manual-only; scheduled publishing is still
   commented out.
7. A docs-only commit follows this report and does not re-trigger the workflow
   (its paths cover code, assets and README, not `docs/`). The recorded CI run is
   the one for `90b614a`, which is the commit that contains all functional
   changes.

## 9. Security and privacy

- No secrets, tokens or credentials in the repository or generated files.
- The private repository is excluded everywhere and blocked by two checks.
- The check workflow is `contents: read`; only the manual render workflow has
  write permission, and it commits only after every generator and gate passes.
- No third-party badge services or runtime requests; fonts are OFL subsets.

## 10. Recommendation

**Ready for owner visual review.** Not ready to merge without that review, and
the branch should not be merged by an agent: the profile page changes only when
`main` is updated.
