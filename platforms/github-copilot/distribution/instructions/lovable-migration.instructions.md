---
title: "Lovable Migration Instructions"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/instructions/lovable-migration.instructions.md"]
---

# Lovable Migration Instructions

Move generated or Lovable-influenced projects toward APT standards without unnecessary rewrites.

## Migration Rules

- Inspect current structure before editing.
- Identify generated assumptions, hidden coupling, and framework conventions.
- Preserve working behavior and user-facing routes.
- Create a migration plan before moving files.
- Prefer small restructuring steps over full rewrites.

## Cloudflare Direction

When Cloudflare is the target, map static frontend behavior to Pages and dynamic behavior to Worker `/api` routes. Recommend D1, KV, or R2 only when the current data model requires them.

## Output Expectations

Return current-state findings, target structure, staged migration plan, risks, validation commands, and docs updates.
