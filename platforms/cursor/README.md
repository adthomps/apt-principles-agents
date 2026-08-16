---
title: Cursor Adapter
kind: platform-adapter
status: draft
owner: APT
last_updated: 2026-08-16
domain: platforms
source_paths: ["apt-principles-agents/platforms/cursor/README.md"]
---

# Cursor Adapter

Adapters expose canonical assets in tool-native locations; they do not fork doctrine. Preserve project-owned instructions and review collisions before installation.

Cursor project skills live under `.cursor/skills/`. Cursor hooks live under `.cursor/hooks.json`. Those files belong in the **product repo**, not as a second copy of Working Backwards templates.

## Working Backwards critic

Canonical sources:

- `templates/working-backwards/critic-rubric.json`
- `templates/working-backwards/agent-role-contracts.md`

A product may add:

1. A **critic skill** that loads those files, reads the package in stage order, and writes only `critic-review.md` and `session.json`.
2. An **edit-guard hook** that, while critic mode is on, denies edits to writer artifacts (press release, FAQs, requirements, handoff, readiness).

Rules:

- Independence is a **new session**, not a different model.
- Hooks may guard or remind. Hooks must **never** write `PASS`.
- Do not copy the rubric into `apps/` or other runtime source.

Reference implementation (product, not doctrine): `apt-commerce` `.cursor/skills/working-backwards-critic/` and `.cursor/hooks/wb-critic-guard.mjs`.

## Improvement notes

- Ship a copy-ready critic skill stub in this adapter once the lock-file mechanic is stable across products.
- Extend `critic-rubric.json` with engineering-handoff and readiness dimensions so product critics are not inventing those gates.
- Document how `sessionStart` / `stop` hooks should fail open so a stale lock cannot block writers after a crashed critic session.
