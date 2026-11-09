# Engineering Studio V4 — Integrated artwork

V4 was committed directly to the `profile/engineering-studio` feature branch in commit `a0be8dd`. This remains a review branch; `main` is unchanged.

## What changed

- Replaced the old hero with the V4 cinematic teal/copper terrain composition.
- Added desktop and mobile compositions in both light and dark themes.
- Replaced the flat featured-work graphic with the three-project V4 gallery.
- Preserved verified Markdown descriptions and direct links for all three projects.
- Kept the original SVG research pipeline and GitHub activity graphics.
- Added `tools/check-v4-assets.mjs` to validate the new WebP artwork in CI.

## Implementation notes

The featured gallery is a single composited image, **not three independent clickable cards**. Direct project repository links appear below it. The four navigation buttons are separate images nested inside genuine anchor links.

The V4 hero and gallery include rasterized editorial text; regenerate source compositions when that wording changes. Essential project descriptions, caveats, contact details and destination links remain real, selectable Markdown.

V4 assets under `assets/studio-v4/` are intentionally committed to the public profile repository. The large master-art archive and unused decorative extras are **not** committed. Legacy SVG assets and generator scripts remain available for the research pipeline, activity chart and future iterations.

## Validation and release

- `node tools/check-v4-assets.mjs` checks all referenced V4 WebP files, format signatures and component-size budgets.
- `node tools/check-markdown.mjs` checks responsive picture variants, link structure and existing SVG references.
- `node tools/check-assets.mjs` checks the existing SVG asset manifest and budgets.
- The GitHub `Check README` workflow also checks contrast, XML, external links and Markdown lint.

Local GitHub-like desktop/mobile previews were created at 1280 and 390 px in both themes. They intentionally use placeholders for existing evidence/activity SVGs because this patch was composited independently; the **actual feature branch retains those real SVG files**.

Review the feature branch visually on GitHub, including mobile and theme switching, before merging it into `main`. No merge or automatic publication has been authorized.
