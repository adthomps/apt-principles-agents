---
title: "Docs Sync"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/prompts/docs-sync.prompt.md"]
---

# Docs Sync

Sync documentation with code, setup, deployment, or API behavior.

Use this prompt in GitHub Copilot Chat when a task refers to the Codex
`docs-sync` skill. Copilot Chat may not discover
`.codex/skills/docs-sync/SKILL.md` as an installed skill, so this prompt
carries the equivalent operating instructions.

## Instructions

1. Compare code, config, scripts, tests, and current docs for the requested scope.
2. Update docs only where behavior, setup, commands, API contracts, deployment, integrations, or user workflows are stale.
3. Preserve project-specific context in `docs/project-context.md`.
4. Remove or correct stale instructions rather than duplicating them.
5. Mark unverified commands for owner review instead of presenting them as fact.

## Output

Summarize docs changed, source evidence used, commands verified, and remaining owner-review items.
