---
title: Local Agents
kind: agent
domain: product
status: active
owner: APT
last_updated: 2026-08-30
source_paths: ["apt-principles-agents/product-team/.apt/local-agents.md"]
---

# Local Agents

`product-team/` is the Working Backwards pipeline subsystem. The workers below
are **intentional, repo-local pipeline workers** — not APT review-council
perspectives and not candidates for canonical `apt-principles-agents/agents/`.
They are stage workers invoked by the pipeline Orchestrator (the top-level
session), operate against the versioned rubrics in `.claude/rubrics/`, and use
the local `working-backwards-methodology` skill.

`scan-untracked-agents.mjs` and `audit-workspace` treat these as declared local,
not drift.

## Declared local agents

- `.claude/agents/critic.md` — evaluates each stage artifact against its
  versioned rubric; returns PASS / NEEDS REVISION with per-dimension feedback.
- `.claude/agents/press-release-writer.md` — drafts and refines the Stage 1
  Press Release.
- `.claude/agents/faq-writer.md` — generates hard External / Internal FAQ
  questions and drafts answers for Stage 2.
- `.claude/agents/requirements-writer.md` — translates the validated PR + FAQ
  package into an engineer-ready Requirements document for Stage 3.

This subsystem is maintained inside `apt-principles-agents`; do not add it as a
separate workspace consumer or install canonical assets into it as if it were an
independent project. Keep this declaration so the four pipeline workers remain
distinct from canonical review-council roles.
