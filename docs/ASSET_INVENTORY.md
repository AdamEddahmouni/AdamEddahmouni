# Asset inventory

There are two deliberate pipelines:

1. **Generated SVG** — `tools/render-all.mjs` rebuilds the evidence and activity
   plates (and the preserved legacy plates) from `tools/design-tokens.json`,
   `data/*.json` and `tools/repo-data.json`.
2. **V4 derivatives** — `tools/build-v4-cards.mjs` crops the approved gallery
   plates into twelve linked project cards and recolours the four dark buttons
   into the light scheme. It is the only tool that writes those files.

The README references **2.16 MB of WebP** and **259 KB of SVG**, about 2.4 MB of
page weight. Only one theme/layout variant of each picture is fetched by a
reader; the totals describe the repository, not a single page load.

## Referenced — 29 WebP + 8 SVG

| Group | Files | Bytes | Purpose |
| --- | ---: | ---: | --- |
| `assets/studio-v4/presentation/hero` | 4 | 1,428 KB | Cinematic desktop/phone hero, dark/light |
| `assets/studio-v4/presentation/glance` | 4 | 107 KB | Four-domain capability band |
| `assets/studio-v4/presentation/gallery/<project>-*` | 12 | 570 KB | One independently linked card per project |
| `assets/studio-v4/presentation/buttons` | 8 | 35 KB | Four navigation buttons, dark/light |
| `assets/evidence/authentic/evidence-explorer.webp` | 1 | 55 KB | Real public Evidence Explorer capture |
| `assets/evidence/pipeline-*` | 4 | 130 KB | Generated seven-stage evidence chain |
| `assets/activity/activity-*` | 4 | 129 KB | Generated public commit calendar |

Each project has four card variants: desktop and phone artboards, in both
schemes. Each button has a dark and a light variant. The README selects theme
and layout with `<picture>`; cards and buttons sit inside real anchors.

## Source plates — 4 files, kept but not referenced

The approved V4 gallery plates are the source for the twelve card crops:

- `assets/studio-v4/presentation/gallery/featured-desktop-{dark,light}.webp`
- `assets/studio-v4/presentation/gallery/featured-mobile-{dark,light}.webp`

They are not served, but `tools/build-v4-cards.mjs` cannot reproduce the cards
without them, so `tools/check-v4-assets.mjs` fails if they are missing. They also
preserve the approved three-up composition for future use. Do not delete them
while the cards exist.

## Generated but unreferenced — part of the 24-file SVG manifest

`assets/hero`, `assets/glance`, `assets/featured` and `assets/ui` still contain
the earlier SVG plates. They are rebuilt by `render-all.mjs`, excluded from the
README, and excluded from the SVG size budget by design. They are the fallback
source system, not the current presentation.

## Legacy — 26 SVG files, kept but unreferenced

| Path | Files | Notes |
| --- | ---: | --- |
| `assets/cards` | 8 | Old project cards, including a private-repository card |
| `assets/stats` | 6 | Old stats panels, including an older activity chart |
| `assets/chips` | 2 | Stack chips |
| `assets/badges` | 2 | Old badges |
| `assets/hero/hero-{dark,light}.svg` | 2 | Superseded single-layout hero |
| `assets/ui/{divider,footer,status}-{dark,light}.svg` | 6 | Old interface furniture |

`assets/cards/market-trading-platform-*.svg` depicts a private project. It is
unreferenced and must never be wired into the README.

## What the checks enforce

- `tools/check-v4-assets.mjs` checks every referenced WebP: signature, exact
  artboard dimensions, complete project/button families, per-component budgets
  and the presence of the four source plates.
- `tools/check-markdown.mjs` checks all four responsive variants on plates, the
  light variant on buttons, alt text, real anchor wrappers and card-to-repository
  destinations.
- `tools/check-assets.mjs` checks every README-referenced SVG against its
  component budget and verifies the manifest describes exactly those files.
- The CI workflow parses every `.svg` in `assets/` as XML, including legacy
  files, so a corrupt archive is still caught.

## Removing legacy artwork safely

1. Confirm nothing references it: `grep -R "assets/cards" README.md tools docs`.
2. Confirm the README checks pass: `node tools/render-all.mjs`.
3. Remove the directory in a dedicated commit so it can be restored from
   history. No generator writes these paths, so the build cannot recreate them.
