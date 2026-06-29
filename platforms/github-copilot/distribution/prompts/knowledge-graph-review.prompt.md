---
title: "Knowledge Graph Review"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/prompts/knowledge-graph-review.prompt.md"]
---

# Knowledge Graph Review

Use this prompt when reviewing whether a repo should participate in a Graphify or knowledge-graph workflow.

Read the repo `README.md`, `AGENTS.md`, `.apt/installation.json`, and `docs/project-context.md` when present. If available, also read `.apt/standards/installable-summaries/knowledge-graph-standards.md`.

Assess:

- whether the repo should use the APT-wide graph, a repo-local graph, or ordinary docs/search
- generated, dependency, runtime, cache, validation-output, public-copy, and sensitive paths to exclude
- whether graph outputs are ignored and treated as local operator artifacts
- whether semantic extraction may use an AI backend for prose/media
- starter graph queries that would help future maintainers
- source-backed findings that should become docs, decisions, project-profile updates, or explicit non-actions

Return a concise recommendation with evidence paths. Treat graph output as discovery evidence, not canonical truth.
