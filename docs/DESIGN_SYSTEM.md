# Engineering Studio — design system

The profile is one system, not a set of GitHub widgets. Every graphic is
generated from `tools/design-tokens.json` and shares a grid, a type scale, a
palette and a motion vocabulary.

## 1. Direction

| Layer | Contribution |
| --- | --- |
| **The Monograph** | Editorial serif display, generous margins, ruled sections, restrained copy |
| **Signal Observatory** | Generated parametric surfaces, instrumentation arcs, technical labels |
| **Product Foundry** | Three project plates, each with its own conceptual diagram |

Balance: editorial credibility first, technical character second, product
expression third. No cyberpunk, no neon glow, no badge walls, no fake terminals.

## 2. Palette

Tokens live in `tools/design-tokens.json` under `schemes.dark` and
`schemes.light`. Assets never hard-code a colour outside the surface generator's
teal→copper interpolation.

| Role | Dark | Light | Used for |
| --- | --- | --- | --- |
| Page ink | `#080E14` | `#F7F4EC` | Plate ground |
| Surface | `#0F1B24` | `#FDFBF5` | Cards, bands, diagram plates |
| Elevated | `#14232D` | `#F0EBDF` | Claim nodes, stacked cards |
| Border | `#22333D` | `#DDD6C7` | Hairlines, plate edges |
| Ivory | `#F5F1E8` | `#0A1117` | Display and body text |
| Muted | `#A8B7BE` | `#4B5A63` | Secondary copy |
| Faint | `#8C9DA6` | `#5F6E77` | Tracked labels, captions |
| Teal | `#22D3C5` | `#0B6E6A` | Technical accent, primary signal |
| Copper | `#FF8A5B` | `#B2451F` | Editorial accent, crest, mutation |
| Violet | `#746EF2` | `#5646CE` | Agent-Ready plate only |

Allocation rules: ink dominates; ivory carries contrast; teal is the technical
voice; copper is used sparingly and always for a specific point (the surname
underscore, section ticks, contradictions, the crest); violet never leaves the
Agent-Ready plate.

`tools/check-contrast.mjs` is the gate. It checks 38 pairs at AA body threshold,
including accent labels drawn at 9–10 px. It fails on unresolved tokens.

## 3. Typography

| Role | Face | Weights embedded | Use |
| --- | --- | --- | --- |
| Display | Playfair Display | 400, 500 | Name, plate headings, contribution total |
| Interface | Inter | 400, 500 | Statement, descriptions, labels |
| Technical | IBM Plex Mono | 400, 500 | Tracked labels, stage names, captions |

- Display sizes: 92 px desktop hero, 52 px mobile hero, 26–30 px section headings.
- Mono labels: 10–13 px desktop with 1.2–3.2 px tracking, always uppercase.
- **Mobile legibility floor:** a 480-unit artboard is displayed at roughly 330 CSS
  px on a phone, a scale of 0.69. Essential text is therefore set at **16 units
  minimum** (≈11 CSS px), secondary text at 13–15. Labels that cannot meet the
  floor are removed rather than shrunk, and the meaning moves to the alt text or
  the Markdown beside the plate.
- SVG served through `<img>` cannot fetch webfonts, so faces are subset to the
  glyphs each asset actually draws and embedded as base64 WOFF2
  (`tools/lib/fonts.mjs`, cache in `tools/lib/font-cache.json`).
- Essential copy is never only inside an image: the statement, project
  descriptions, capabilities and contact details are real Markdown.

## 4. Grid and geometry

- Desktop artboards: 1200 px wide, 48 px padding. Mobile: 480 px wide, 24–26 px padding.
- Radius: 16 px plate, 12 px card, 6 px chip, full pill for buttons.
- Rules are 1 px at 55–90% border opacity; no thick dividers.
- Plates are inset by 1 px and drawn with a rounded clip, so the page shows at
  the corners. This is why a dark plate works on GitHub's light theme without a
  second palette.
- Spacing rhythm: 8 / 12 / 16 / 24 / 32 / 48.

## 5. Components

| Component | Files | Notes |
| --- | --- | --- |
| Hero | `assets/hero/hero-{desktop,mobile}-{dark,light}.svg` | Name, descriptor, generated surface, instrumentation |
| At a glance | `assets/glance/glance-*` | Four domains, custom icons, hairline separators; qualifiers are desktop-only |
| Work plates | `assets/work/<project>-*` | One conceptual diagram per project, labelled; the phone plate carries its project name and drops diagram micro-text |
| Evidence diagram | `assets/evidence/pipeline-*` | NosoGraph's documented seven-stage evidence chain; vertical flow on phones |
| Activity | `assets/activity/activity-*` | Public commit calendar from captured API data; 53-week grid, total, capture date and legend, no month ticks |
| Buttons | `assets/ui/button-*.svg` | Real links, theme-neutral ink pills |

Each plate carries `<title>` and `<desc>`; the README carries descriptive alt
text; images are decorative or duplicated by Markdown, never the only copy.

## 6. Motion

- One reveal per plate: a left-to-right mask wipe on the surface, a 1.2 s fade on
  the rest, staggered 90 ms.
- No looping animation except a very slow ambient drift and the status dot.
- Authored so the *unsupported* state is the finished frame: the wipe mask starts
  full, fades start opaque. If CSS animation never runs, the plate is complete.
- `@media (prefers-reduced-motion: reduce)` disables animation and forces the
  finished state (`.wipe{transform:none}`, `.fade{opacity:1}`).

## 7. Accessibility

- Contrast gate at AA body threshold for every text pair, both schemes.
- Semantic headings in the README: 5 sections, 3 project headings.
- Descriptive link labels; no bare "here".
- Buttons are images inside real anchors, and equivalent text links exist in the
  Contact section.
- No meaning conveyed by colour alone: evidence states are labelled in the
  diagram and explained in the caption.
- Alt text describes the information in each plate, not just its appearance.
