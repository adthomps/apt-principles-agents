---
title: "APT Readiness Audit"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/prompts/apt-readiness-audit.prompt.md"]
---

# APT Readiness Audit

Score a repository for readiness across APT alignment, architecture, documentation, UX, API, testing, Cloudflare, and maintainability.

Use this prompt in GitHub Copilot Chat when a task refers to the Codex
`apt-readiness-audit` skill. Copilot Chat may not discover
`.codex/skills/apt-readiness-audit/SKILL.md` as an installed skill, so this
prompt carries the equivalent operating instructions.

## Instructions

1. Read `docs/project-context.md`, `AGENTS.md`, setup docs, package scripts, tests, deployment files, and key app entry points.
2. Score readiness categories with evidence from files or commands.
3. Distinguish release-blocking issues from improvement opportunities.
4. Recommend profile additions or documentation updates when useful.
5. Do not assume a target architecture that is not supported by the current repo.

## Output

Return a scorecard, top risks, evidence, recommended fixes, validation commands, and follow-up documentation updates.
