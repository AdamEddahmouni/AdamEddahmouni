<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/hero/hero-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/hero/hero-light.svg">
  <img width="100%" alt="Index of four open-source systems by Adam Eddahmouni: NosoGraph for biomedical disease evidence, Agent-Ready for coding-agent repository contracts, a monorepo workspace with a lineage guard, and a read-only short-squeeze research screener" src="./assets/hero/hero-dark.svg">
</picture>

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/badges/badges-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/badges/badges-light.svg">
  <img width="620" alt="Badges: open source builder, focus on verifiable systems, Pennsylvania, open to collaborations" src="./assets/badges/badges-dark.svg">
</picture>

<br>

**Systems across biomedical research, AI agent tooling, and market systems.**
Four open-source projects, plus the verification tooling that keeps them honest.

[Repositories](#systems) · [Data & methodology](#data--methodology) · [Stack](#stack) · [Contact](#contact)

</div>

<br>

## Systems

<table>
<tr>
<td width="50%" valign="top">

<a href="https://github.com/AdamEddahmouni/nosograph"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/cards/nosograph-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/cards/nosograph-light.svg">
  <img width="100%" alt="NosoGraph — disease intelligence across biomedical sources, with a diagram of the evidence chain from disease through typed claims and evidence to provenance" src="./assets/cards/nosograph-dark.svg">
</picture></a>

<br>

**NosoGraph** — disease intelligence, connected.

Open-source research software for connecting disease knowledge, evidence, and provenance across biomedical sources.
Complements MONDO, HPO, PubMed, ClinicalTrials.gov, Open Targets and GWAS.

Evidence is typed by direction, and supporting, contradictory, inconclusive and unasserted records are allowed to coexist.
Missing metadata stays `unknown` rather than quietly becoming certainty.

Public Alpha · Apache-2.0 · not medical advice, not a diagnostic system, not clinical decision support.

[Repository](https://github.com/AdamEddahmouni/nosograph) · [Documentation](https://adameddahmouni.github.io/nosograph/) · [DOI](https://doi.org/10.5281/zenodo.22055279)

</td>
<td width="50%" valign="top">

<a href="https://github.com/AdamEddahmouni/agent-ready"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/cards/agent-ready-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/cards/agent-ready-light.svg">
  <img width="100%" alt="Agent-Ready — a repository contract for coding agents, with a diagram of one agent-ready.yaml file generating five agent instruction files" src="./assets/cards/agent-ready-dark.svg">
</picture></a>

<br>

**Agent-Ready** — the missing contract between repositories and coding agents.

A vendor-neutral specification and deterministic CLI for describing how AI coding agents should work inside a repository.
Like `package.json` for packages, `agent-ready.yaml` is the single schema-validated source of truth for commands, environment, instructions, restrictions, verification requirements and completion evidence.

No API keys. No LLM calls. No network access. Zero cost per run.

[Repository](https://github.com/AdamEddahmouni/agent-ready)

</td>
</tr>
<tr>
<td width="50%" valign="top">

<a href="https://github.com/AdamEddahmouni/market-trading-platform"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/cards/market-trading-platform-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/cards/market-trading-platform-light.svg">
  <img width="100%" alt="Market trading platform workspace — a diagram of branches feeding a protected main spine, then into a manifest and a lineage ledger" src="./assets/cards/market-trading-platform-dark.svg">
</picture></a>

<br>

**Market Trading Platform** — a monorepo workspace with a verification guard.

Integrated trading platform with governed snapshots, a source-to-snapshot manifest, and a lineage ledger recording every commit reachable from every captured child-repository ref.

`tools/monorepo_guard.py` refuses dirty parent trees, verifies child refs and visibility, rejects Gitlink snapshots, and confirms child repositories are unchanged.
`main` is protected and gated behind a required check.

[Repository](https://github.com/AdamEddahmouni/market-trading-platform) · [Monorepo workflow](https://github.com/AdamEddahmouni/market-trading-platform/blob/main/docs/MONOREPO_WORKFLOW.md)

</td>
<td width="50%" valign="top">

<a href="https://github.com/AdamEddahmouni/short-squeeze-screener-internship"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/cards/short-squeeze-screener-internship-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/cards/short-squeeze-screener-internship-light.svg">
  <img width="100%" alt="Short squeeze research screener — a chart of reported short-interest bars where inconclusive readings are drawn as dashed caps rather than filled in" src="./assets/cards/short-squeeze-screener-internship-dark.svg">
</picture></a>

<br>

**Short Squeeze Screener** — a read-only research screener.

Candidate analysis built around structured market data, quality checks and reproducibility, running entirely locally on `127.0.0.1`.

It does not place orders, access brokerage accounts, recommend trades, or claim predictive validation.
`FROZEN_DEMO` mode fixes the input set so a run is reproducible.

[Repository](https://github.com/AdamEddahmouni/short-squeeze-screener-internship) · [Getting started](https://github.com/AdamEddahmouni/short-squeeze-screener-internship/blob/main/short-squeeze-core/docs/getting-started.md)

</td>
</tr>
</table>

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./assets/ui/divider-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="./assets/ui/divider-light.svg">
    <img width="100%" alt="" src="./assets/ui/divider-dark.svg">
  </picture>
</p>

## What each one verifies

<table>
<tr>
<td width="25%" valign="top"><b>Declared scope</b><br><sub>Where each project stops.</sub></td>
<td width="25%" valign="top"><b>Evidence handling</b><br><sub>What counts as support.</sub></td>
<td width="25%" valign="top"><b>Reproducibility</b><br><sub>Same input, same result.</sub></td>
<td width="25%" valign="top"><b>Audit trail</b><br><sub>Where the record lives.</sub></td>
</tr>
<tr>
<td valign="top">NosoGraph is research software. Agent-Ready never calls a model. The screener never places a trade. The platform excludes credentials and unusable artifacts.</td>
<td valign="top">NosoGraph types evidence by direction and lets contradictions stand. The screener draws inconclusive readings as inconclusive rather than rounding them up.</td>
<td valign="top">Agent-Ready has no network dependency. The screener ships a frozen demo mode. NosoGraph regenerates its published counts from a script.</td>
<td valign="top">NosoGraph ships provenance and a Zenodo DOI. The platform keeps a JSONL commit ledger. Agent-Ready records completion evidence.</td>
</tr>
</table>

<br>

## Signal

<table>
<tr>
<td width="50%" valign="top">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/stats/stats-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/stats/stats-light.svg">
  <img width="100%" alt="Account and repository figures: public commits in the last twelve months, public repositories, active days and followers" src="./assets/stats/stats-dark.svg">
</picture>
</td>
<td width="50%" valign="top">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/stats/langs-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/stats/langs-light.svg">
  <img width="100%" alt="Repository language composition by bytes across the four project repositories" src="./assets/stats/langs-dark.svg">
</picture>
</td>
</tr>
</table>

<br>

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/stats/activity-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/stats/activity-light.svg">
  <img width="100%" alt="Calendar heatmap of public commit activity over the last twelve months" src="./assets/stats/activity-dark.svg">
</picture>

## Stack

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/chips/stack-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/chips/stack-light.svg">
  <img width="100%" alt="Technology stack: Python, TypeScript, JavaScript, React, Next.js, FastAPI, MongoDB, Supabase, Docker, GitHub Actions, Redis, Markdown and Git" src="./assets/chips/stack-dark.svg">
</picture>

<br>

## Data & methodology

Everything on this page is generated from public data, and it is worth being precise about what each number is:

| Figure | Source | What it is not |
|---|---|---|
| Public commits, active days | Commit timestamps on the four project repositories, last 12 months | The GitHub contributions calendar, which counts private activity and is not accessible to a repo-scoped token |
| Repository composition | `GET /repos/:owner/:repo/languages` byte totals | A measure of proficiency — these repositories contain large vendored datasets, which is why Python dominates |
| Public repositories, followers | `GET /users/:owner` | Account activity, since accounts created in 2024 |
| Project figures | Read from each project's own status files and manifests | Estimates; where a figure is sampled, the sample size is stated in the project README |

The artwork on this page is generated by the pipeline in [`tools/`](./tools) from [`tools/design-tokens.json`](./tools/design-tokens.json), which is the single source of truth for the grid, type scale, radii, motion and palette.
Typefaces are OFL (Space Grotesk, JetBrains Mono), subset per asset and embedded, because an SVG served through an image tag cannot fetch a webfont.
Icons are [Simple Icons](https://simpleicons.org) (CC0).

No third-party image or badge service is called at render time, so nothing on this page can break because someone else's deployment paused.

## Contact

<div align="center">

<a href="https://github.com/AdamEddahmouni"><picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/ui/status-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/ui/status-light.svg">
  <img alt="Open to collaborations" src="./assets/ui/status-dark.svg">
</picture></a>

<br>

**Pennsylvania · Penn State · engineering, AI systems, open research**

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./assets/ui/footer-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="./assets/ui/footer-light.svg">
  <img width="100%" alt="Contact details: GitHub github.com/AdamEddahmouni, email adameddahmouni@gmail.com, documentation at adameddahmouni.github.io/nosograph, based in Pennsylvania" src="./assets/ui/footer-dark.svg">
</picture>

[GitHub](https://github.com/AdamEddahmouni) ·
[Email](mailto:adameddahmouni@gmail.com) ·
[NosoGraph docs](https://adameddahmouni.github.io/nosograph/) ·
[Agent-Ready](https://github.com/AdamEddahmouni/agent-ready)

<br>

<details>
<summary><b>Frequently asked</b></summary>

<br>

**Is NosoGraph a diagnostic or clinical tool?**
No. It is research software for connecting evidence and provenance. It is a public alpha, it is not medical advice, and it is not clinical decision support.

**Does Agent-Ready send anything to a model?**
No. It has no API keys, makes no LLM calls, and needs no network access. It is a schema, a CLI, and a set of generated instruction files.

**Is the screener a trading system?**
No. It does not place orders, access brokerage accounts, recommend trades, or claim predictive validation. It runs read-only and locally.

**Are these projects affiliated with Penn State or any employer?**
No. They are personal open-source work.

**How is this README built?**
`node tools/render-all.mjs` regenerates every graphic from the design tokens and the live repository data, then asserts WCAG AA contrast. CI runs the same command plus an XML and geometry audit.

</details>

<br>

<sub>Repository text and code: MIT. Generated artwork: [CC0](https://creativecommons.org/publicdomain/zero/1.0/). Individual projects carry their own licences. Figures current as of the last automated run.</sub>

</div>
