# Maintaining the profile

The README is generated, but you never have to regenerate it to edit copy: the
Markdown is hand-written, and only the artwork is built.

## Commands

```bash
node tools/render-all.mjs       # rebuild every asset + run the gates + build preview
node tools/preview.mjs          # rebuild tools/.preview/index.html only
node tools/screenshots.mjs      # capture QA screenshots (needs Playwright + Chromium)
node tools/check-contrast.mjs   # WCAG gate for both schemes
node tools/check-markdown.mjs   # structure, links, alt text, forbidden claims
node tools/check-links.mjs      # classify every external link (ok/gated/dead)
node tools/check-assets.mjs     # exact-byte budgets + manifest integrity
node tools/fetch-repo-data.mjs  # refresh contributions/languages (needs GITHUB_TOKEN)
```

There are no runtime dependencies for rendering: `render-all.mjs` uses only Node
built-ins plus the cached font subsets. Playwright and sharp are only for local
visual QA and are deliberately not committed.

First run of a new clone may need the font cache filled; after that rendering is
offline and deterministic.

## Change personal copy

1. Edit `data/profile.json` (name, descriptor, statement, location, links).
2. Edit the prose in `README.md`.
3. If the statement changes, update the first Markdown paragraph and the hero
   `<desc>` is regenerated automatically.
4. Run `node tools/render-all.mjs`.

The hero name is drawn from `data/profile.json`, so changing it there updates all
four hero variants. Re-check the shop window: if the surname grows much longer
than “Eddahmouni”, measure it (see below) and adjust `nameSize` or the copper
bar position in `tools/generate-hero.mjs`.

## Add or remove a project

1. Add an entry to `data/projects.json` → `featured` with `id`, `index`, `name`,
   `category`, `kicker`, `summary`, `facts`, `links`, `accent`, `art`.
2. Add an artwork function in `tools/generate-work.mjs` and register it in `ART`.
3. Add the Markdown block to `README.md`: picture set (mobile/desktop × light/dark),
   heading, description, facts, links.
4. Run `node tools/render-all.mjs`; the manifest and checks update automatically.

Removing a project means removing its block from the README and its entry from
`data/projects.json`. Orphaned SVGs are reported by `tools/manifest.json` in
review; delete them deliberately.

## Update project images

Generated plates are the source of truth; there are no raster screenshots. If a
real screenshot is ever added, keep it under `assets/work/`, use a 2× capture,
compress to WebP, add a matching alt description, and label it as a screenshot
rather than a conceptual diagram. Do not use concept art as evidence of a
working product.

## Asset budgets

Budgets live in `tools/check-assets.mjs`, not in the workflow, so local builds
and CI use the same numbers. They are exact bytes per component: hero desktop
72,000; hero mobile 52,000; activity 38,000; evidence 36,000; work 28,000;
glance 26,000; ui 15,000. The hero is deliberately the exception: the surface is
the profile's signature, while its words stay HTML-crisp in Markdown.

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

Never hard-code a hex value inside a generator; if a new role is needed, add it
to the tokens and to the contrast pairs.

## Adjust the signature surface

`tools/lib/surface.mjs` exposes `crests`, `cols`, `rows`, `horizon`, `depth`,
`elevation`, `spread`, `glow` and `seed`. All plates pass these explicitly, so a
change to the silhouette is a two-line edit, not a redraw. The height field is
deterministic for a given seed.

## Motion

Durations live in `tokens.motion`; keyframes live in `tools/lib/asset.mjs`.
Every reveal must keep the invariant that **no animation is required to see the
final frame**. Reduced-motion is handled inside each SVG, so it also works when
GitHub serves the file through its image proxy.

## Publish safely

- Work on a branch; never push from an automated agent without the owner's say-so.
- Review `git diff --stat` and the generated `tools/manifest.json` (asset count
  and total bytes) before publishing.
- Open the README on GitHub itself, in both themes and on a phone-width window.
  The local preview is an approximation; GitHub is the acceptance test.
- The scheduled asset workflow is intentionally disabled. Enable the `schedule`
  block only after the workflow has run green via manual dispatch and the owner
  has authorised automatic commits.

## If a data fetch fails

`fetch-repo-data.mjs` must not clobber the last valid capture. Keep it that way:
write to a temporary object, validate the response shape, then replace
`tools/repo-data.json`. `render-all.mjs` aborts before committing if a generator
or gate fails, so the published artwork is never replaced with invented fallback
data.
