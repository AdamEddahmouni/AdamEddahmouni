# Public profile — prioritised recommendations

Verified against the GitHub API on 2026-11-09. No account settings, repository
metadata, pinned items or other repositories were changed as part of this work.

## Current state

| Item | State |
| --- | --- |
| Public repositories | 5: profile repo, `nosograph`, `agent-ready`, `short-squeeze-screener-internship`, `skills-introduction-to-github` (tutorial clone) |
| Pinned repositories | **1** — only `nosograph` |
| Profile bio | “Full-stack and quantitative systems developer … // Penn State Student” |
| Profile blog | empty |
| `nosograph` | description, homepage and 20 topics set |
| `agent-ready` | description and 17 topics set; no homepage |
| `short-squeeze-screener-internship` | **no description, no topics, no homepage** |

## Required before calling the profile finished

1. **Pin all three featured projects.** Only NosoGraph is pinned, so the two
   other projects presented on the profile are missing from the repository list a
   visitor sees first. GitHub exposes this only through account settings.
2. **Add a description and topics to the screener repository.** It currently has
   neither, so a visitor arriving from the profile card gets no summary and no
   discovery metadata. A factual description can be taken from the project's own
   README; do not add performance claims.

## High value after publication

1. **Give `agent-ready` a homepage** only if a real documentation site is
   published. The in-repository CLI reference is the current source of truth;
   leaving the field empty is better than pointing at a placeholder.
2. **Add one real screenshot to the screener repository** from its existing
   `short-squeeze-core/apps/biya-validation-demo` build, labelled as a validation
   demo with frozen data. It is the only featured project without a public
   visual. Do not add returns, accuracy or live-trading claims.
3. **Consider a profile blog link.** The LinkedIn URL is already the contact
   action on the profile. A documentation site for Agent-Ready would be a better
   use of the field than a duplicate.

## Future repository work

1. `skills-introduction-to-github` is a tutorial clone. Keep it public only if it
   is intentional; otherwise archive it so the repository list stays focused.
2. NosoGraph already carries brand assets, product captures and diagrams. The
   profile capture is sourced from there; keep that source file stable.
3. If a fourth project is added to the profile, add its card crop to
   `tools/build-v4-cards.mjs`, its data entry, its README block and its facts —
   not just a new image.
