---
name: knowledge-graph-review
description: Use when reviewing or preparing a repo for Graphify or knowledge-graph participation, including graph hygiene, source-backed query use, and APT-wide drift review.
title: "Knowledge Graph Review"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/codex/skills/knowledge-graph-review/SKILL.md"]
---

# Knowledge Graph Review

Use this skill to decide whether a repo should participate in a Graphify/knowledge-graph workflow and to interpret graph evidence without replacing source review.

## Read First

1. Read the target repo `README.md`.
2. Read `AGENTS.md`, `.apt/installation.json`, and `docs/project-context.md` when present.
3. Read `apt-core/knowledge-graph-standards.md` when installed.
4. For APT-wide Graphify workflows, read `../apt-principles-agents/reports/GRAPHIFY_RUNBOOK.md` when available.

## Review Checklist

- Identify whether the repo is best handled by the APT-wide graph, a repo-local graph, or ordinary docs/search.
- List generated, dependency, runtime, cache, validation-output, public-copy, and sensitive paths that must be excluded.
- Confirm `graphify-out/`, staging folders, cost files, manifests, and HTML graph output are ignored unless the repo has an explicit storage exception.
- Check whether semantic extraction may send Markdown, PDFs, images, or other prose/media to an AI backend.
- Prefer graph queries for discovery and drift candidates; verify any finding by opening the source files.
- Record durable findings in the repo's project context, decision records, audit reports, or canonical doctrine owner.

## Output

Return:

1. Recommended graph participation mode.
2. Paths to include and exclude.
3. Useful starter graph queries.
4. Risks or privacy boundaries.
5. Source-backed follow-up actions.

Do not claim the graph proves completion, readiness, security, or correctness unless direct source evidence and local validation also support the claim.
