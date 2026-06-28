---
title: "AI Output Review"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/prompts/ai-output-review.prompt.md"]
---

# AI Output Review

Audit generated code, docs, plans, or agent output for unsupported claims and unsafe assumptions.

Use this prompt in GitHub Copilot Chat when a task refers to the Codex
`ai-output-review` skill. Copilot Chat may not discover
`.codex/skills/ai-output-review/SKILL.md` as an installed skill, so this
prompt carries the equivalent operating instructions.

## Instructions

1. Identify claims, recommendations, generated edits, commands, and assumptions in the supplied output or current diff.
2. Check each important claim against repository files, documented behavior, tests, or explicit user input.
3. Flag unsupported claims, risky shortcuts, stale guidance, secret exposure, and unverified commands.
4. Separate confirmed issues from assumptions and owner-review items.
5. Prefer small corrective edits or clearer caveats over broad rewrites.

## Output

Return findings first, ordered by severity. Include the claim or file, evidence checked, risk, recommended correction, and any validation command or owner-review item.
