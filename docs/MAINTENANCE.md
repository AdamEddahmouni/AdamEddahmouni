# Maintaining the profile

The README is hand-written. Only the artwork is built: generated SVG for the
evidence and activity plates, and V4 derivatives (cards and light buttons) from
the approved presentation plates.

## Commands

```bash
node tools/render-all.mjs        # rebuild SVG assets + run every local gate + preview
node tools/preview.mjs           # rebuild tools/.preview/index.html only
node tools/build-v4-cards.mjs    # recrop the 12 cards and recolour the 4 light buttons
node tools/screenshots.mjs       # capture QA JPEGs (needs Playwright + Chromium)
node tools/check-contrast.mjs    # WCAG gate for both schemes
node tools/check-markdown.mjs    # structure, linked pictures, links, alt, forbidden claims
node tools/check-links.mjs       # classify every external link (ok/gated/dead)
node tools/check-assets.mjs      # exact-byte SVG budgets + manifest integrity
node tools/check-v4-assets.mjs   # WebP dimensions, families, budgets, source plates
node tools/fetch-repo-data.mjs   # refresh contributions/languages (needs GITHUB_TOKEN)
```

`render-all.mjs` uses Node built-ins plus the cached font subsets; it needs no
install. The two optional tools need local packages:

```bash
npm install --no-save sharp       # build-v4-cards.mjs
npm install --no-save playwright  # screenshots.mjs
npx playwright install chromium
```

Those packages are deliberately not committed or used by CI. The committed
outputs are the source of truth; the checks validate them without either library.

## Rebuild the V4 derivatives

`tools/build-v4-cards.mjs` is deterministic: fixed crop rectangles, fixed sharp
settings, no network. It reads the four approved plates under
`assets/studio-v4/presentation/gallery/featured-*`, crops three cards per layout
and recolours the four dark buttons into the light scheme by mapping the studio
palette roles in CIE Lab. The alpha silhouette is unchanged, so the light buttons
keep the exact geometry, iconography and typography of the approved dark art.

Run it only when the source plates or the crop geometry change, then run
`node tools/render-all.mjs`. Do not hand-edit the WebP outputs. If a project is
added to the approved plate, add its crop rectangle to `DESKTOP_CROPS` and
`MOBILE_CROPS` in the script.

## Change personal copy

1. Edit `data/profile.json` (name, descriptor, statement, location, links).
2. Edit the prose in `README.md`.
3. If the statement changes, update the first Markdown paragraph; the V4 hero
   carries rasterised type and must be regenerated from its composition.
4. Run `node tools/render-all.mjs`.

The generated SVG hero is no longer referenced, but it remains in the manifest
as a fallback. The V4 hero name is baked into the WebP: changing the name is a
design change, not a text edit.

## Add or remove a project

1. Add an entry to `data/projects.json` → `featured` with `id`, `index`, `name`,
   `category`, `kicker`, `summary`, `facts`, `links`, `accent`, `art`.
2. If the project is in the approved V4 plate, add its crop rectangle to
   `tools/build-v4-cards.mjs` and run it. Otherwise create a card derivative from
   the approved artwork; do not substitute a generic gradient or a fake
   screenshot.
3. Add the Markdown block to `README.md`: linked card, heading, description,
   facts and real links. Every card must sit inside an anchor to its repository.
4. Run `node tools/render-all.mjs`; the manifest, budgets and Markdown checks
   update automatically.

Removing a project means removing its README block, its `data/projects.json`
entry, and its crop entry, then rebuilding the cards. Delete orphaned card files
deliberately rather than leaving dead weight.

## Project evidence

The profile may show real evidence only when it is public and correctly
labelled. The NosoGraph Evidence Explorer capture comes from
`docs/assets/product/evidence-explorer.webp` in the public repository and is
labelled as an interface capture, not a hosted demo. Keep the disclosure in
`README.md` intact.

Do not add personal, clinical or financial records. Do not use concept art as a
product screenshot. Do not imply predictive accuracy, live trading or clinical
validation. If a screenshot is added, store a 2× WebP under
`assets/evidence/authentic/`, record its source in `docs/CONTENT_SOURCES.md`, and
check that it is readable at GitHub's phone column.

## Asset budgets

Budgets live in the checks, not in the workflow, so local builds and CI use the
same numbers.

| Component | Limit | Where |
| --- | ---: | --- |
| Hero | 550,000 B each | `tools/check-v4-assets.mjs` |
| Glance | 50,000 B each | `tools/check-v4-assets.mjs` |
| Project card | 120,000 B each | `tools/check-v4-assets.mjs` |
| Button | 15,000 B each | `tools/check-v4-assets.mjs` |
| Evidence capture | 90,000 B | `tools/check-v4-assets.mjs` |
| Hero SVG (fallback) | 72,000 B | `tools/check-assets.mjs` |
| Hero SVG mobile | 52,000 B | `tools/check-assets.mjs` |
| Activity / evidence SVG | 38,000 / 36,000 B | `tools/check-assets.mjs` |
| Glance / featured SVG | 26,000 / 60,000 B | `tools/check-assets.mjs` |
| UI SVG | 15,000 B | `tools/check-assets.mjs` |

Raising a limit is a design decision, not a way to make CI green: change the
number, say why in `docs/QA_REPORT.md`, and record the new measured size.

## Capture date and determinism

- `tools/fetch-repo-data.mjs` stamps `tools/repo-data.json` with the capture date.
- `tools/generate-activity.mjs` derives its 53-week window from that stamp; there
  is no hardcoded end date.
- `tools/render-all.mjs` uses the same stamp for the manifest, so two renders of
  unchanged inputs are byte-identical. Verify with a second run and compare
  `sha256sum` over `assets/**/*.svg`; nothing should change.
- The calendar is public commit activity across the featured repositories, not
  GitHub's private-aware contribution total. Keep the `PUBLIC COMMITS` label.

## Change theme colours

1. Edit `tools/design-tokens.json` → `schemes.dark` / `schemes.light`.
2. Run `node tools/check-contrast.mjs` first; it will refuse a palette that fails AA.
3. Run `node tools/render-all.mjs`.
4. If the light button palette changes, update `ROLE_MAP` in
   `tools/build-v4-cards.mjs` to the same tokens and rebuild the derivatives.

Never hard-code a hex value inside a generator; if a new role is needed, add it
to the tokens and to the contrast pairs.

## Adjust the signature surface

`tools/lib/surface.mjs` exposes `crests`, `cols`, `rows`, `horizon`, `depth`,
`elevation`, `spread`, `glow` and `seed`. All generated plates pass these
explicitly, so a change to the silhouette is a two-line edit, not a redraw. The
height field is deterministic for a given seed. The V4 raster hero is not
generated by this code; it is an approved composition.

## Motion

Durations live in `tokens.motion`; keyframes live in `tools/lib/asset.mjs`.
Every SVG reveal must keep the invariant that **no animation is required to see
the final frame**. Reduced-motion is handled inside each SVG, so it also works
when GitHub serves the file through its image proxy. The V4 WebP plates are
static by design.

## Publish safely

- Work on a branch; never push from an automated agent without the owner's say-so.
- Review `git diff --stat` and the generated `tools/manifest.json` (asset count
  and total bytes) before publishing.
- Open the README on GitHub itself, in both themes and on a phone-width window.
  Check that the four buttons select the light artwork in light mode, that each
  project card is a separate link, and that the Real capture disclosure opens.
  The local preview is an approximation; GitHub is the acceptance test.
- The scheduled asset workflow is intentionally disabled. Enable the `schedule`
  block only after the workflow has run green via manual dispatch and the owner
  has authorised automatic commits.
- The render workflow refuses to continue if a regeneration changes
  `assets/studio-v4/**`. Those are approved static plates; they are edited by
  hand, not by the renderer.

## If a data fetch fails

`fetch-repo-data.mjs` must not clobber the last valid capture. Keep it that way:
write to a temporary object, validate the response shape, then replace
`tools/repo-data.json`. `render-all.mjs` aborts before committing if a generator
or gate fails, so the published artwork is never replaced with invented fallback
data.
