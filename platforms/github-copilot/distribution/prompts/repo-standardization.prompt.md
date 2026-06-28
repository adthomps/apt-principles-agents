---
title: "Repo Standardization"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/prompts/repo-standardization.prompt.md"]
---

# Repo Standardization

Bring a repository into APT folder, docs, scripts, and agent instruction conventions.

Use this prompt in GitHub Copilot Chat when a task refers to the Codex
`repo-standardization` skill. Copilot Chat may not discover
`.codex/skills/repo-standardization/SKILL.md` as an installed skill, so this
prompt carries the equivalent operating instructions.

## Instructions

1. Inspect repo layout, package scripts, docs, tests, `AGENTS.md`, `.claude`, `.codex`, `.github`, and `docs/project-context.md`.
2. Identify gaps in setup, run guide, validation, docs governance, AI tool files, and project context.
3. Preserve working behavior and avoid file moves until a plan is reviewed.
4. Recommend profile additions when useful.
5. Keep unmanaged project-specific files distinct from synced standards files.

## Output

Return current state, gaps, recommended target structure, staged plan, validation commands, and risks.
