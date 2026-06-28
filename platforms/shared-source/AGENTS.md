---
title: "AGENTS.md"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/standards/AGENTS.md"]
---

# AGENTS.md

## Project Agent Standards

- Read `docs/project-context.md` before making architectural changes.
- Preserve existing behavior unless a requested change says otherwise.
- Keep generated work specific to this repository.
- Use installed profiles as capabilities that can be combined.
- For harness-aware installs, route work through the installed agent catalog, routing docs, and task-packet guidance before material changes.
- Document commands used for validation.

## Managed Standards

This file may be managed by `apt-principles-agents`. Local project-specific notes belong in `docs/project-context.md`.

Harness-aware installs may also include `.apt/installation.json/manifest.json` and `.apt/installation.json/local-overrides.md`. Treat `local-overrides.md` as project-owned local guidance.
