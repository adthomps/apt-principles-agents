---
title: "UX Review"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/prompts/ux-review.prompt.md"]
---

# UX Review

Review user workflows, UI states, responsive behavior, accessibility, or product intent.

Use this prompt in GitHub Copilot Chat when a task refers to the Codex
`ux-review` skill. Copilot Chat may not discover
`.codex/skills/ux-review/SKILL.md` as an installed skill, so this prompt
carries the equivalent operating instructions.

## Instructions

1. Inspect the user flow, visible states, route structure, copy, accessibility affordances, and responsive behavior.
2. Evaluate whether the UI supports the user's intent with clear feedback, recoverability, and efficient workflows.
3. Check empty, loading, error, success, disabled, and permission states where relevant.
4. Avoid cosmetic-only recommendations unless they affect comprehension, trust, or task completion.
5. Tie findings to concrete UI files, routes, or screenshots when available.

## Output

Return findings first, ordered by user impact, followed by workflow risks, accessibility gaps, suggested fixes, and validation steps.
