---
title: "Refactor Safety"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/prompts/refactor-safety.prompt.md"]
---

# Refactor Safety

Refactor code while preserving behavior and minimizing regression risk.

Use this prompt in GitHub Copilot Chat when a task refers to the Codex
`refactor-safety` skill. Copilot Chat may not discover
`.codex/skills/refactor-safety/SKILL.md` as an installed skill, so this prompt
carries the equivalent operating instructions.

## Instructions

1. Identify the behavior that must be preserved before editing.
2. Read existing tests, call sites, public contracts, configuration, and docs for the scoped area.
3. Prefer small mechanical changes with clear validation over broad redesigns.
4. Add or update focused regression tests when behavior is shared, subtle, or user-facing.
5. Document migration risks, rollback path, and validation commands.

## Output

Return preserved behavior, changed files, regression risks, tests added or needed, commands run, and remaining follow-up work.
