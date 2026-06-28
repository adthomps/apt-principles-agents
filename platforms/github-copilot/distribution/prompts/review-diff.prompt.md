---
title: "Review Diff"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/prompts/review-diff.prompt.md"]
---

# Review Diff

Review the current diff or supplied patch.

## Instructions

1. Prioritize bugs, regressions, security issues, data handling, missing tests, documentation drift, and maintainability.
2. Ground every finding in a changed file, nearby behavior, or documented project context.
3. Separate confirmed issues from assumptions.
4. Do not summarize before findings.

## Output

Return findings first, ordered by severity:

- `[P0]` blocks release or causes severe production/security risk.
- `[P1]` likely bug, regression, or important missing validation.
- `[P2]` maintainability, docs, or test gap that should be addressed.

Then include open questions, validation gaps, and a short change summary.
