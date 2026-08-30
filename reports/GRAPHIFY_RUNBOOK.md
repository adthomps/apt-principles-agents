---
title: "APT Workspace Graphify Runbook"
kind: "runbook"
domain: "execution"
status: "active"
owner: "APT"
last_updated: "2026-08-29"
source_paths: ["apt-principles-agents/reports/GRAPHIFY_RUNBOOK.md", "apt-principles-agents/references/graphify-portfolio.json", "apt-principles-agents/standards/installable-summaries/knowledge-graph-standards.md"]
---

# APT Workspace Graphify Runbook

This runbook operates the layered APT knowledge-graph workflow. `apt-principles-agents` owns the portfolio configuration and operator commands; each target repository continues to own its product context, source, exclusions, and validation.

Graphify output is discovery evidence, not canonical truth. Confirm durable findings in source docs, code, schemas, decisions, profiles, or validation reports before promoting them.

## Prerequisites

- Graphify CLI matching the installed Codex skill.
- Ollama installed, running, and containing the locally approved model.
- Node.js 18 or newer.
- The sibling repositories listed in `references/graphify-portfolio.json` checked out beneath the same workspace root.

The build script always supplies the manifest's local settings: `--backend ollama --max-concurrency 1 --token-budget 2000`. The bounded chunk size fits the approved local model context and avoids hollow prose responses caused by oversized document batches. It does not fall back to hosted providers, even when hosted-model API keys exist in the shell.

## Participation Model

- **Portfolio graph:** selected READMEs, agent instructions, project contexts, ownership contracts, and promotion-path documents from the portfolio nucleus.
- **Deep graphs:** first-party code and authored documentation for complex repositories, filtered through repository-local `.graphifyignore` files.
- **Lightweight or metadata participation:** selected context enters the portfolio graph without creating a persistent repo-local graph.
- **Ordinary docs/search:** small repositories remain outside the persistent graph workflow.

The complete project matrix, five starter queries per deep graph, local semantic policy, and curated portfolio paths live in `references/graphify-portfolio.json`.

## Audit Before Building

```powershell
npm run graphify:audit
```

The audit verifies all 18 projects, selected portfolio files, five-query deep-graph sets, local-only backend policy, diagram presence, output location, `.graphifyignore`, and `graphify-out/` ignore rules. A missing Ollama runtime is reported as a warning so repository validation remains usable on machines that do not build semantic graphs.

## Build The Portfolio Graph

```powershell
npm run graphify:stage
npm run graphify:build:portfolio
```

Staging deletes and recreates only the resolved ignored directory `graphify-out/portfolio-corpus/`. It copies the allowlisted sources with repository-prefixed paths and records their provenance in `CORPUS_INDEX.json`.

The portfolio graph is written beneath:

```text
graphify-out/portfolio-corpus/graphify-out/
```

## Build A Deep Repository Graph

```powershell
node scripts/graphify-workspace.mjs build apt-knowledge-hub
node scripts/graphify-workspace.mjs build apt-dream-to-reality
```

Use `--deep` only for an explicit multi-pass review where additional inferred relationships are worth the extra local-model time. The default favors grounded extraction.

First-wave order:

1. `apt-principles-agents`
2. `apt-knowledge-hub`
3. `apt-dream-to-reality`
4. `apt-commerce`
5. `apt-anet-integration-toolbox`

Run second-wave graphs only after two first-wave build-and-review cycles demonstrate useful queries and acceptable graph hygiene.

## Generate Human Views

Every successful build generates or refreshes:

- `graph.html` — interactive graph exploration;
- `GRAPH_REPORT.md` — graph health, hubs, connections, gaps, and suggested questions;
- `graph.json` — machine-readable graph;
- `GRAPH_TREE.html` — repository and package hierarchy;
- `CALLFLOW.html` — Mermaid-based architecture and call-flow view.

Regenerate views from an existing graph with:

```powershell
node scripts/graphify-workspace.mjs views portfolio
node scripts/graphify-workspace.mjs views apt-dream-to-reality
```

Stable, reviewed knowledge belongs in `docs/diagrams/apt-portfolio-knowledge-system.md`, not in committed Graphify HTML or JSON.

## Validate Starter Queries

Print the configured query set:

```powershell
node scripts/graphify-workspace.mjs queries portfolio
node scripts/graphify-workspace.mjs queries apt-knowledge-hub
```

Run the set and save ignored traversal evidence:

```powershell
node scripts/graphify-workspace.mjs queries portfolio --run
```

For each question:

1. Require useful source locations from the traversal.
2. Open the cited source and confirm the claimed relationship.
3. Treat `INFERRED` and `AMBIGUOUS` edges as review candidates.
4. Record durable findings in the owning repository, not in graph memory alone.
5. Retune exclusions if utilities, package metadata, generated copies, fixtures, or archives dominate hubs and communities.

## Local-Only And Sensitive-Data Rules

- Do not configure a hosted semantic backend for this workflow.
- Do not graph secrets, environment files, certificates, private keys, SQLite databases, health imports, manuscripts, downloaded document corpora, security scan inputs, or generated reports.
- Code extraction remains local and deterministic; document semantics use the local Ollama model.
- `.graphifyignore` is authoritative for deep graphs and must retain the repository-specific sensitive and generated exclusions.
- Do not commit `graphify-out/`, caches, memory, costs, staged corpora, HTML, or query-validation output.

## Promotion Gate

Promote a relationship or diagram only when direct source inspection supports it. Use solid `EXTRACTED` edges for explicit source relationships. Dotted `INFERRED` edges remain candidates and require an owner and review before they can influence doctrine, remediation, readiness, security, or release claims.

Do not install commit hooks, CI rebuilds, or weekly automation until two curated on-demand cycles pass the query and hygiene checks.
