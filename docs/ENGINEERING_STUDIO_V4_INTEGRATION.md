# Engineering Studio V4 — integrated artwork

V4 is committed to the `profile/engineering-studio` feature branch. `main` is
unchanged; this remains a draft for owner review.

## What changed

- Cinematic teal/copper hero with desktop and phone compositions in both themes.
- A four-domain capability band.
- **Three independently linked project cards**, cropped from the approved
  three-up gallery by `tools/build-v4-cards.mjs`. Each card is wrapped in a real
  repository link and has desktop, phone, dark and light variants.
- **Light-theme navigation buttons** derived from the approved dark artwork, so
  the pills no longer sit as dark objects on a cream page.
- A real Evidence Explorer capture from the public NosoGraph repository, behind a
  disclosure and explicitly labelled as a capture, not a hosted demo.
- The existing generated research-pipeline and public-activity graphics.

## Implementation notes

The cards are crops of the approved gallery, not new illustrations. The gallery
plates remain in the repository as the source for those crops; they are not
referenced by the README. The buttons keep the dark art's exact alpha silhouette,
type and iconography; only the palette roles change, using the same tokens as the
rest of the system.

`<a><picture><source media="(prefers-color-scheme: …)"><img></picture></a>` is
used for both cards and buttons. GitHub's Markdown pipeline preserves the
`<source>` elements inside the anchor (verified against the Markdown API and the
rendered branch page), so the artwork is both clickable and theme-aware. Fallback
`<img>` sources are the desktop dark variants, which means an environment that
ignores `<picture>` still shows finished artwork.

V4 assets under `assets/studio-v4/` are intentionally committed to the public
profile repository. The large master-art archive and unused decorative extras are
**not** committed. Legacy SVG assets and generators remain available for the
research pipeline, activity chart and future iterations.

## Validation and release

- `node tools/check-v4-assets.mjs` checks every referenced WebP: signature,
  exact dimensions, complete families, budgets and the four source plates.
- `node tools/check-markdown.mjs` checks responsive variants, the light button
  variants, alt text, real anchor wrappers and card destinations.
- `node tools/check-assets.mjs` checks the generated SVG manifest and budgets.
- The GitHub `Check README` workflow also checks contrast, XML, external links and
  Markdown lint.

Local GitHub-like captures at 1440/1280/1024/768/390/360 px in both themes live
in `docs/previews/` as JPEGs. Browser checks assert image loading, no horizontal
overflow, the selected theme/layout source, real link destinations, navigation
wrapping and rendered button/card luminance. Review the feature branch on GitHub,
including mobile and theme switching, before merging. No merge or automatic
publication has been authorized.
