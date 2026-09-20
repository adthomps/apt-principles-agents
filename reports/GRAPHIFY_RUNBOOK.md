---
title: "APT Workspace Graphify Runbook"
kind: "runbook"
domain: "execution"
status: "active"
owner: "APT"
last_updated: "2026-09-05"
source_paths: ["apt-principles-agents/reports/GRAPHIFY_RUNBOOK.md", "apt-principles-agents/references/graphify-portfolio.json", "apt-principles-agents/standards/installable-summaries/knowledge-graph-standards.md"]
---

# APT Workspace Graphify Runbook

Graphify is an investigation and diagram-support tool for the APT workspace. It is not a requirement to build one semantic graph of every repository. Ordinary search remains the first tool for locating facts; Graphify is useful when a focused question requires tracing several relationships or when local code structure is hard to see linearly.

Generated graphs are ignored operational evidence, never canonical truth. Confirm useful paths against authored source before updating documentation or a curated Mermaid diagram.

## Supported Modes

### Focused document investigation

Use one named pack containing three to eight related, allowlisted files and one to three questions. This is the only supported semantic workflow. It preserves repository-relative paths and keeps unrelated material out of the model context.

```powershell
npm run graphify:packs
node scripts/graphify-workspace.mjs stage intake-delivery
node scripts/graphify-workspace.mjs investigate intake-delivery
node scripts/graphify-workspace.mjs queries intake-delivery
```

The available packs are:

- `intake-delivery`
- `doctrine-adoption-drift`
- `design-provenance`
- `security-review`
- `public-proof`

The manifest owns each pack's exact sources and questions. Add or change a pack only when a real investigation needs a different evidence boundary.

### Repository architecture

Use deterministic local AST extraction for a configured deep repository. It indexes code without sending prose to a model.

```powershell
node scripts/graphify-workspace.mjs code apt-knowledge-hub
node scripts/graphify-workspace.mjs code apt-security-harness --promote
```

The default creates and validates an immutable candidate but does not promote it. Add `--promote` only after reviewing its diagnostics and opening cited code.

The second-wave repositories with local usage guides are:

- `apt-intelligence-core` — evidence pipeline and domain framework;
- `apt-health` — web, Worker, D1, and health-domain contracts;
- `apt-anet-security-sdk` — orchestrator, SDK runners, TLS profiles, and observers;
- `apt-novel-reviewer` — Electron boundaries, review pipeline, and persistence;
- `crt-world` — publishing workflow across site, Worker, schemas, auth, and D1;
- `applied-practical-thinking` — public site, Worker, packages, and publication generators.

Each repository's `docs/graphify.md` records its included architecture, exclusions, questions, and interpretation boundaries.

### Ordinary search

Use `rg`, repository docs, and direct source inspection when the answer needs only one or two files. Small repositories do not need persistent graphs merely to participate in workspace understanding.

## Deliberately Disabled

- full portfolio semantic builds;
- automatic candidate promotion;
- automatic hosted-model fallback;
- MCP registration;
- commit hooks, watchers, CI graph builds, and weekly schedules.

The portfolio source list remains in the manifest as a curated ownership inventory and diagram reference. It is not a build corpus.

## Audit

```powershell
npm run graphify:audit
npm run test:graphify
```

The audit verifies the 18-project inventory, five focused packs, pack sizes and source existence, declared repository guides, local-only semantic settings, code-only defaults, `.graphifyignore` coverage, ignored output paths, and disabled automation.

Ollama is required only for a semantic investigation. The pinned settings are `qwen2.5-coder:14b`, concurrency `1`, token budget `2000`, context window `32768`, output ceiling `16384`, and thinking disabled. Code-only extraction remains available without Ollama.

## Candidate Lifecycle

Focused packs are staged beneath:

```text
graphify-out/investigations/<pack>/runs/<timestamp>/
```

Code-only candidates live beneath the target repository:

```text
graphify-out/runs/<timestamp>/
```

Every run is immutable and records `BUILD_STATUS.json`; packs also record `CORPUS_INDEX.json`. Failed and rejected runs stay available for diagnosis and never replace `current/`.

Validate or explicitly promote an existing run with:

```powershell
node scripts/graphify-workspace.mjs validate intake-delivery --run-id <timestamp>
node scripts/graphify-workspace.mjs validate intake-delivery --run-id <timestamp> --promote
node scripts/graphify-workspace.mjs status intake-delivery
```

Promotion copies the graph to `current/` and moves any prior current graph to `history/`. Structural validation checks nodes, edges, pack source coverage, dangling endpoints, self-loops, and same-endpoint edge-collapse risk. Passing structural validation does not make inferred relationships true.

## Review And Diagram Workflow

1. Start with a named question and the smallest relevant pack or code graph.
2. Use query, path, neighbors, explain, tree, and call-flow views to find candidate relationships.
3. Open every cited source and confirm direction, ownership, and current status.
4. Mark extracted, inferred, and ambiguous relationships distinctly.
5. Record durable knowledge in the owning source document.
6. Promote only stable, source-backed relationships to `docs/diagrams/apt-portfolio-knowledge-system.md`.

Graphify views include `graph.html`, `GRAPH_TREE.html`, and `CALLFLOW.html`. They remain ignored. Regenerate current views with:

```powershell
node scripts/graphify-workspace.mjs views intake-delivery
node scripts/graphify-workspace.mjs views apt-security-harness
```

Reject or retune a graph when framework utilities, generic imports, package metadata, archives, generated docs, dependencies, fixtures, or copied public assets dominate its hubs or communities.

## Explicit Codex Fallback

If local semantic extraction is not useful for a specific pack, an operator may explicitly prepare a non-local Codex handoff:

```powershell
node scripts/graphify-workspace.mjs investigate design-provenance --fallback codex
```

This stages only that pack, writes `CODEX_FALLBACK_REQUEST.json`, labels provenance `non-local-codex`, and performs no extraction or promotion. The fallback is never silent and is never available for the full portfolio inventory.

## Sensitive Data And Legacy Evidence

Do not graph secrets, environment files, certificates, private keys, databases, health imports, manuscripts, downloaded document corpora, security scan inputs, or generated reports. Repository `.graphifyignore` files remain authoritative.

Do not commit graphs, caches, staged corpora, HTML, costs, memory, or query evidence. Existing root-level graphs remain historical evidence. They can be copied into ignored quarantine without modifying the originals:

```powershell
node scripts/graphify-workspace.mjs quarantine apt-principles-agents
node scripts/graphify-workspace.mjs quarantine apt-dream-to-reality
```
