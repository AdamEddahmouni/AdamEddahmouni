# QA report

Branch reviewed: `profile/engineering-studio`.
Tested commits: `774926a` (baseline), `90b614a` (CI and legibility remediation) and `ceac9f7` (featured gallery).
Date: 2026-11-09. Nothing was merged into `main`.

## 1. CI status

| Run | Commit | Result |
| --- | --- | --- |
| [`42544861673`](https://github.com/AdamEddahmouni/AdamEddahmouni/actions/runs/42544861673) | `774926a` | **failure** — asset size budgets |
| [`42549471766`](https://github.com/AdamEddahmouni/AdamEddahmouni/actions/runs/42549471766) | `90b614a` | **success** — all steps |
| [`42552600066`](https://github.com/AdamEddahmouni/AdamEddahmouni/actions/runs/42552600066) | `ceac9f7` | **success** — featured gallery |

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
- Total generated artwork: **24 files, 756 KB**, down from 1,059 KB. One three-card gallery replaced the three stacked project plates; the 12 retired SVGs were deleted.

Budgets now live in `tools/check-assets.mjs`, shared by local builds and CI, and
are exact bytes per component:

| Component | Limit | Largest measured |
| --- | ---: | ---: |
| Hero desktop | 72,000 | 70,110 |
| Hero mobile | 52,000 | 48,064 |
| Activity | 38,000 | 33,792 |
| Evidence | 36,000 | 33,805 |
| Featured gallery desktop | 60,000 | 35,281 |
| Featured gallery mobile | 55,000 | 33,215 |
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
| Featured work | Three cards on desktop; stacked on phones; names at 24 units, fact pills at 16 units, diagrams keep only their structure |

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
| Asset budgets | `node tools/check-assets.mjs` | **24/24** referenced, manifest consistent |
| SVG well-formedness | Python `ElementTree` over `assets/**` | **50/50** valid |
| External links | `node tools/check-links.mjs` | 7 verified, 1 gated, 0 dead |
| Markdown lint | `markdownlint-cli2@0.13.0` | **0 errors** |
| Determinism | two renders, `sha256sum` over `assets/**/*.svg` | **byte-identical** |
| CI | Actions run `42552600066` (gallery), `42549471766` (remediation) | **success** |

Screenshots: 1440/1280/1024/768/390/360 px in dark and light, 5 picture crops,
two reduced-motion captures, plus plate close-ups used during the fixes
(`docs/previews/`).

## 6. Real GitHub rendering

The branch README was loaded as a GitHub page, not just raw Markdown, and re-checked after the gallery push on `ceac9f7`:

- 5 `<picture>` elements and **9 images** loaded (`complete = true`) at their
  full natural sizes (1200×430 hero, 1200×382 gallery, 1200×300 activity).
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

## 7. Reference alignment

Both references were supplied after the first remediation pass. The study keeps
a dark card on a white page, uses a three-up featured-work gallery, and renders
project facts as visible pills. This pass rebuilt featured work as that gallery
and raised phone fact pills from 13 to 16 units. It did **not** turn the light
scheme into a dark plate: the cream palette is an intentional theme variant, not
an attempt to reproduce the mock's white canvas. No pixel-overlay comparison was
performed; the match is compositional, judged from the captures in
`docs/previews/`.

## 8. Remaining limitations

1. The public profile page (`main`) is unchanged; branch rendering is verified,
   merge is not performed.
2. Firefox and WebKit were not available; Chromium is the only browser tested.
3. LinkedIn is gated (999) and could not be content-verified.
4. Reference alignment is compositional; no pixel-overlay comparison was done
   (see §7). The hero's wireframe surface is flatter than the study's rendered
   surface.
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

**Ready for owner visual review.** The featured-work gallery now follows the
approved study's three-card composition. Not ready to merge without that review,
and the branch should not be merged by an agent: the profile page changes only
when `main` is updated.

---

## 11. V4 cinematic artwork integration — 2026-11-09

> **Superseded in part by §12.** The composite gallery and dark-only buttons
> described here were replaced by three independently linked cards and
> theme-aware buttons. The rest of this section remains the record of the first
> V4 integration.

V4 is now committed to the `profile/engineering-studio` branch, replacing the earlier flat hero and diagram-only featured gallery with the approved cinematic visual system. `main` remains unchanged.

- **Commit:** `a0be8dd` introduced 16 WebP assets, responsive hero/glance/gallery composition, concise project copy and a dedicated image-integrity check.
- **Follow-up commits:** corrected Markdown formatting and removed an unused local variable without changing rendered art.
- **Latest successful CI:** [Run 42628614803](https://github.com/AdamEddahmouni/AdamEddahmouni/actions/runs/42628614803), commit `66df87e`. All substantive checks passed: contrast, README structure, SVG budgets/manifest, V4 WebP integrity/budgets, SVG XML, outbound links and Markdown lint.
- **Binary integrity:** each of the 20 committed files (including 16 WebP images) was verified against the local Git blob SHA before the atomic feature-branch commit.
- **Local preview:** desktop 1280 px and mobile 390 px in dark and light color schemes. Seven images loaded per preview without horizontal overflow. Previews omit two inherited SVGs and show placeholders for those elements; the GitHub branch retains the actual evidence/activity images.
- **Visual tradeoff (superseded by §12):** the featured-gallery composite was not three separately clickable cards. Genuine repository links appeared in Markdown directly below the gallery.
- **Reproducibility:** V4 artwork is intentionally rasterized for cinematic quality. The existing SVG generators remain for evidence and activity. Do not claim that re-running the SVG generators recreates the V4 hero.
- **Remaining acceptance:** direct human review of the GitHub feature-branch rendering in both themes and on a narrow phone viewport. The `main` profile is not yet published with V4.

**Draft PR for owner approval:** [Engineering Studio V4](https://github.com/AdamEddahmouni/AdamEddahmouni/pull/2). No merge or automatic publication was performed.

---

## 12. Final polish — linked cards, light buttons, evidence — 2026-11-09

Base: `44cac97`. This pass did not touch `main`, did not rewrite history, and did
not merge PR #2.

### 12.1 What changed

- **Light-theme navigation.** Four light button WebP files were derived from the
  approved dark art by mapping the studio palette roles in CIE Lab. Alpha
  silhouettes are byte-identical, so geometry, icons and type are unchanged.
  Each button is now `<a><picture>` with a light `<source>` and a dark fallback.
- **Independently linked project cards.** The approved 2000×855 desktop plate
  and 748×2360 phone plate were cropped into three cards per layout, in both
  schemes (`tools/build-v4-cards.mjs`). Each card is wrapped in a real repository
  link and displayed at 480 CSS px on desktop, filling the phone column. The four
  source plates remain committed for reproducibility but are not served.
- **Authentic evidence.** A real Evidence Explorer capture from the public
  NosoGraph repository is stored locally, disclosed in a `<details>` block and
  labelled as an interface capture, not a hosted demo. Five verified links to
  public evidence artifacts were added.
- **Rhythm and copy.** Added `What I build` as an explicit section, moved the
  Penn State line into Contact so it appears once, tightened the opening, and
  removed the stray closing paragraph. 6 sections, 3 projects.
- **Verification.** `check-markdown.mjs` now validates linked theme-aware
  pictures, all four responsive variants, light button variants, card-to-repo
  destinations and widths. `check-v4-assets.mjs` now validates dimensions,
  complete families, budgets and source plates. `render-all.mjs` runs that gate.
  The render workflow refuses to commit if a generator changes `assets/studio-v4`.
- **Previews.** JPEG captures at 84% replace the stale PNGs; named detail crops
  now cover the hero, glance, three cards, pipeline, real capture and activity.

### 12.2 Commands and results

| Check | Command | Result |
| --- | --- | --- |
| Build + local gates | `node tools/render-all.mjs` | **exit 0** |
| Contrast | `node tools/check-contrast.mjs` | **38/38** pairs pass |
| README structure | `node tools/check-markdown.mjs` | **19 passes, 0 failures** |
| SVG budgets | `node tools/check-assets.mjs` | 8 referenced, 24 generated, 756 KB |
| V4 assets | `node tools/check-v4-assets.mjs` | **29 referenced, 2.16 MB, 4 source plates, 0 problems** |
| SVG XML | Python `ElementTree` over `assets/**` | **50/50 valid** |
| External links | `node tools/check-links.mjs` | **11 verified, 1 gated, 0 dead** |
| Markdown lint | `markdownlint-cli2@0.13.0` | **0 errors** |
| Layout matrix | Playwright at 360/390/768/1024/1280/1440 × dark/light | **layout ok** |
| GitHub renderer | `gh api /markdown` with the README | 11 themed pictures, **29 sources preserved**, 1 details |

The browser matrix asserted, for all 12 combinations: no horizontal overflow;
12 images loaded per page; the correct mobile/desktop and dark/light source was
selected; three cards linked to the correct repositories; the navigation wrapped
to two rows at 360 and 390 px and stayed on one row above that; and the rendered
button/card regions measured light in light mode and dark in dark mode. Page
heights: 4,253 px at 1024–1440, 4,078 px at 768, 4,905 px at 390, 4,819 px at 360.

### 12.3 Visual evidence

`docs/previews/` now contains:

- `readme-{dark,light}-{1440,1280,1024,768,390,360}.jpg` — full page.
- `detail-{hero,glance,card-nosograph,card-agent-ready,card-screener,pipeline,evidence-capture,activity}-{dark,light}.jpg`.
- `readme-{dark,light}-reduced-motion.jpg`.

Card detail crops are 960×980 (2× of the 480×490 display box). Full-page heights
match the browser measurement above. Totals: 7.9 MB for the preview directory,
including the historical `qa*.png` captures.

### 12.4 GitHub compatibility

GitHub's Markdown API preserves `<source>` inside `<a><picture>` and wraps it in
`<themed-picture>`. The rendered output contained 11 pictures, 29 sources, 21
anchors and the disclosure; nothing was stripped. Relative `./assets/...` paths
are unchanged by the API, so the branch page is the final check for camo
resolution and layout.

### 12.5 Security and privacy

- No secrets, tokens or credentials are added. No runtime third-party service or
  badge is introduced.
- The private `market-trading-platform` repository is still excluded; the README
  checker fails on its name.
- The new screenshot is already published in the public NosoGraph repository,
  contains no personal records, and is explicitly labelled as research software
  and not clinical guidance.
- All five new evidence destinations return HTTP 200. LinkedIn remains gated
  (999) and is reported as gated, not verified.

### 12.6 Limitations

1. The captures were produced and measured programmatically; this environment
   could not display the rendered images for a human aesthetic review, so the
   visual sign-off still belongs to the owner.
2. Chromium is the only browser tested; Firefox and WebKit were not available.
3. The GitHub branch page itself still needs a post-push check for camo image
   loading and theme switching, which the Markdown API cannot simulate.
4. `main` is unchanged and PR #2 is still draft; no merge was performed.
