# Engineering Studio V4 — Integration Notes

This is a non-destructive patch for the existing `profile/engineering-studio` branch. It replaces the hero, at-a-glance, navigation and featured-gallery image references with V4 premium assets, while keeping the existing SVG research pipeline and contribution activity components. Do not delete the repository's existing scripts or assets.

## Verification before publishing
- Copy `repo_patch/` into the feature-branch checkout, preserving other files.
- Update `tools/check-markdown.mjs` and `tools/check-assets.mjs` to validate `.webp` alongside `.svg`; their current regexes only inspect SVG.
- Update documentation and preview tooling to recognize changed images and the shorter `Engineering evidence` heading.
- Test GitHub's `<picture>` light/dark + mobile switching on the actual branch.
- Confirm all external project links and claims with their current public sources.
- Check the four linked nav images, the three featured project links, and the mobile gallery.
- Run all existing CI checks; keep scheduled publication disabled.
- Do not merge into `main` without final owner visual approval.

## Graphic design tradeoffs
The complete V4 hero and gallery are raster compositions for better cinematic visual fidelity. The images include editorial headings, so changes to baked-in text must be made by regenerating the art using the source compositor. Descriptions, links, and evidence remain selectable Markdown. The three-card gallery is a single image and is not three independently clickable cards; each project has explicit direct text links immediately below.
