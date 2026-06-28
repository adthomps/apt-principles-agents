---
title: "API Review"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/prompts/api-review.prompt.md"]
---

# API Review

Review the scoped API change or API surface.

Use this prompt in GitHub Copilot Chat when a task refers to the Codex
`api-review` skill. Copilot Chat may not discover
`.codex/skills/api-review/SKILL.md` as an installed skill, so this prompt
carries the equivalent operating instructions.

## Instructions

1. Inspect route handlers, schemas, tests, docs, and configuration related to the requested scope.
2. Check contract consistency, auth boundaries, validation, status codes, error shape, idempotency, webhook safety, observability, and documentation drift.
3. Treat security, secret handling, payment data, webhook verification, and production behavior as high priority.
4. Do not suggest broad refactors unless they are required to fix a concrete risk.

## Output

Return findings first, ordered by severity. For each finding include file or route, problem, risk, suggested fix, and test or validation command. Then list open questions and documentation gaps.
