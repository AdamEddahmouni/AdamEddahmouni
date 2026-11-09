# QA report

Run: 2026-11-09 · repository `AdamEddahmouni/AdamEddahmouni`, branch
`freebuff/b7188e78c6350d4b9c0443bf` · nothing pushed.

## 1. Environment

| Item | Value |
| --- | --- |
| Node | v26.13.0 |
| Renderer | Playwright 1.56.0, Chromium headless shell build 1194 |
| OS | Ubuntu 24.04 userland, no root |
| Browser deps | X/NSS/ASound `.deb`s extracted to a local sysroot, `LD_LIBRARY_PATH` |
| Fonts for QA | Playfair Display 400/500, Inter 400/500, IBM Plex Mono 400/500 |
| Repository deps | none at render time; Playwright/sharp are local QA-only |

The container initially had **no system fonts**, which made Chromium draw no
text at all. That is an environment limitation, not a profile bug: with one
neutral font (DejaVu) present and none of the three design faces installed, the
plates still render in Playfair Display and IBM Plex Mono, proving the
base64 WOFF2 subsets embedded in each SVG are honoured (see
`previews/qa-font-embedding.png`).

## 2. Build results

| Check | Result |
| --- | --- |
| `node tools/render-all.mjs` | exit 0 |
| Generated assets | **32 SVGs, 1,059 KB** total (legacy artwork excluded) |
| Hero desktop | 91–93 KB per theme |
| Hero mobile | 56.6–56.7 KB per theme |
| Work/evidence/activity plates | 23–62 KB |
| Buttons | ~11 KB each |
| Asset references in README | 32/32 resolve |
| Manifest | `tools/manifest.json`, 32 entries, 2026-11-09 |

A generator failure aborts the build and leaves the previous assets in place
(`render-all.mjs` reported this correctly during development), so a broken run
cannot publish a half-drawn profile.

## 3. Automated gates

| Gate | Command | Result |
| --- | --- | --- |
| Contrast | `node tools/check-contrast.mjs` | **38/38 resolved pairs pass** AA body threshold |
| Markdown/structure | `node tools/check-markdown.mjs` | **17/17 checks pass** |
| External links | `node tools/check-links.mjs` | **8/8 reachable** (LinkedIn answers 999 to bots → reported gated) |

Markdown gate covers: 7 `<picture>` blocks with mobile and desktop sources in
both schemes, descriptive alt text, file existence, no `<picture>` nested in an
anchor, 4 HTML anchors + 10 Markdown links, internal anchors, all four buttons
as real links, and forbidden content (sample metrics, private repository name,
badge services, fake coordinates).

## 4. Visual QA

Captured with `node tools/screenshots.mjs` after each iteration:

- Full page: **1440, 1280, 1024, 768, 390, 360 px**, dark and light (12 images)
- Detail crops: hero, six plates, evidence, activity — both schemes (14 images)
- Reduced-motion capture for both schemes
- Standalone plate captures at native size for typography inspection

The GitHub README column is ~1012 px at 1280 and ~330 px at 390, so the
screenshots evaluate the content column, not the viewport.

### Defects found and fixed

| # | Defect | Fix |
| --- | --- | --- |
| 1 | Desktop hero had no masthead: `AE / ENGINEERING STUDIO` and `BUILD · RESEARCH · SHIP` were defined but never appended | call `masthead()` inside the plate clip |
| 2 | Project titles rendered GitHub link-blue, breaking the ivory hierarchy | headings are plain `### Name`; links moved to the metadata line |
| 3 | At-a-glance cells were left-aligned with tiny icons and short dividers | centred cells, 30 px marks, full-height separators |
| 4 | Mobile hero printed three footer labels into one line | phone plate shows location + availability only |
| 5 | Mobile masthead rule collided with the right label | decorative rule is desktop-only; the hairline remains |
| 6 | NosoGraph diagram too small and low-contrast on desktop | larger nodes, 62 px claim, 9.8 px state labels, snapshot chip |
| 7 | Mobile plates hid the evidence-state names, leaving four anonymous dots | compact plates now label every state |
| 8 | Mobile evidence type scaled to ~6.9 px on a phone | mobile type raised to 10.4–11.8 px |
| 9 | Mobile activity figure overlapped the contribution grid | phone plate stacks figure above a full-width grid |
| 10 | Activity legend clipped at the plate edge (`MOR`) | legend reserves trailing space; last month label dropped |
| 11 | Light-mode surface was washed out on paper ground | 1.4× stroke weight for the light scheme |
| 12 | README claimed a mechanical-engineering degree not present in the profile | corrected to “Penn State student”, source record updated |
| 13 | Evidence details overflowed their columns in an early raster pass | wrapping tightened (size 10.5 → 10, ratio corrected), verified in browser |

### Verified in the browser

- Hero name fits at 1200 px (measured: “Eddahmouni” at 92 px = 530 px, plate is
  1200 px) and at 480 px mobile (52 px = 300 px).
- No horizontal scroll at 360 px; images scale to the column.
- Both schemes are intentional: ink/ivory plates on GitHub light, paper plates
  on GitHub dark, driven by `prefers-color-scheme` sources.
- Motion: reveal starts complete, so a renderer that ignores CSS animation
  shows the finished frame; `prefers-reduced-motion` forces the final state.

## 5. Accessibility

- Contrast: 38/38 text pairs at AA; white on teal is excluded (1.88:1) and the
  gate documents why.
- Every plate has `<title>` + `<desc>`; every README image has descriptive alt
  text naming the information, not just the look.
- Essential copy (statement, descriptions, facts, links, contact) is real
  Markdown, selectable, translatable and screen-reader accessible.
- Semantic headings: 5 sections, 3 project headings; buttons are real anchors.
- No meaning is carried by colour alone: evidence states are labelled in the
  diagram and described in prose.
- No fake controls: four actions, four genuine destinations.

## 6. Performance

- 1.03 MB of generated SVG for the whole page, no external image requests, no badge
  services, no third-party stats endpoints.
- Fonts are subset per asset to the glyphs drawn; there are no duplicate webfont
  downloads at runtime.
- Soft target met for a media-heavy profile, though the hero is deliberately
  the largest asset (≈92 KB) because it carries the identity.

## 7. Limitations

1. **Not rendered on github.com.** Pushing was not authorised, so the page was
   validated in a GitHub-like preview and in Chromium against the same markup,
   `<picture>` and theme rules. GitHub's sanitizer and camo proxy are the final
   acceptance test; no claim is made that this was observed live.
2. **Chromium only.** Firefox and Safari were not available in this environment.
   The assets are plain SVG 1.1 + CSS with no script and no external references,
   which is the conservative subset, but cross-browser pixel equality was not
   measured.
3. **SVG CSS animation inside `<img>`** is not guaranteed by every client.
   Assets are authored so the static state is the finished frame.
4. **LinkedIn** returns HTTP 999 to automated clients; it is reachable for a
   browser but could not be content-verified here. It was supplied by the owner
   in the previous README.
5. **Legacy assets**: the previous profile's `assets/{cards,chips,stats,badges}`
   and old hero files remain in the repository, unreferenced, because deleting
   prior work was out of scope. They are safe to delete once the owner confirms.
6. Preview PNGs (31 files: 12 full page, 2 reduced motion, 14 details, 3 renderer checks) are QA evidence only and are not used by the README.

## 8. Commands

```bash
node tools/render-all.mjs      # build 58 assets, gates, preview
node tools/check-contrast.mjs  # 38/38
node tools/check-markdown.mjs  # 17/17
node tools/check-links.mjs     # network; 8/8 reachable
node tools/screenshots.mjs     # needs Playwright + Chromium
node tools/preview.mjs         # tools/.preview/index.html
```
