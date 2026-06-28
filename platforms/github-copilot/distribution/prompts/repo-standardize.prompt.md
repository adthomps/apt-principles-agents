---
title: "Repo Standardize"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/prompts/repo-standardize.prompt.md"]
---

# Repo Standardize

Review the repository against APT standards and propose safe standardization steps.

## Instructions

1. Inspect repo layout, package scripts, docs, tests, `AGENTS.md`, `.claude`, `.codex`, `.github`, and `docs/project-context.md`.
2. Identify gaps in setup, run guide, validation, docs governance, AI tool files, and project context.
3. Preserve working behavior and avoid file moves until a plan is reviewed.
4. Recommend profile additions when useful.

## Output

Return current state, gaps, recommended target structure, staged plan, validation commands, and risks.
