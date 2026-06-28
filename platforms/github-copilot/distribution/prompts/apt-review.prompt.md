---
title: "APT Review"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/prompts/apt-review.prompt.md"]
---

# APT Review

Review code, docs, or plans for APT Core alignment, behavior preservation, and reviewability.

Use this prompt in GitHub Copilot Chat when a task refers to the Codex
`apt-review` skill. Copilot Chat may not discover
`.codex/skills/apt-review/SKILL.md` as an installed skill, so this prompt
carries the equivalent operating instructions.

## Instructions

1. Read `apt-core/` guidance, `docs/project-context.md`, and the scoped files or diff.
2. Check whether the work preserves behavior, keeps scope clear, and documents material decisions.
3. Prefer concrete findings over style-only comments.
4. Flag missing tests, stale docs, unsafe assumptions, and unreviewable changes.
5. Recommend the smallest corrective path that restores alignment.

## Output

Return findings first, ordered by severity, followed by open questions, validation gaps, and a short APT alignment summary.
