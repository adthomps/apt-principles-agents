---
title: Local Agents
kind: agent
domain: product
status: active
owner: APT
last_updated: 2026-10-05
source_paths: ["apt-principles-agents/product-team/.apt/local-agents.md"]
---

# Local Agents

`product-team/` is the Working Backwards pipeline subsystem. It declares **no local agents** any more.

Since 2026-10-05 it runs the canonical APT Working Backwards agents. `npm run build:agents` generates them into `product-team/.claude/agents/` from `apt-principles-agents/agents/working-backwards/`, as an internal mirror; `npm run validate:adapters` fails if the mirror drifts. Do not edit them here.

| Generated agent | Role in this pipeline |
| --- | --- |
| `apt-wb-press-release-writer` | Stage 1 |
| `apt-wb-faq-writer` | Stage 2, external and internal modes |
| `apt-wb-requirements-writer` | Stage 3 |
| `apt-wb-critic` | Reviews each stage in return-only mode; the orchestrator records and commits the verdict |
| `apt-wb-orchestrator` | Canonical role; this pipeline's orchestration is the local `/working-backwards` skill |

The rubric is `templates/working-backwards/critic-rubric-1.1.0.json`. Product Team specifics (session folders, commits, promotion) are in `working-backwards/profile.md`.

The former local workers (`critic`, `press-release-writer`, `faq-writer`, `requirements-writer`), their `.claude/rubrics/`, and the `working-backwards-methodology` skill were retired; their rules were folded into the canonical agents, the critic-review skill, and rubric v1.1.0.

This subsystem is maintained inside `apt-principles-agents`; do not add it as a separate workspace consumer or install canonical assets into it as if it were an independent project.
