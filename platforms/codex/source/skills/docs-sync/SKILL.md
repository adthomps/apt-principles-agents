---
name: docs-sync
description: Use when syncing documentation with code, setup, deployment, or API behavior.
title: "Docs Sync"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/codex/skills/docs-sync/SKILL.md"]
---

# Docs Sync

## Purpose
Keep docs accurate after behavior, setup, API, or deployment changes.

## When To Use
Use after meaningful implementation changes or before release.

## When Not To Use
Do not rewrite docs for style only.

## Required Reading
Read changed files, README, `docs/project-context.md`, setup docs, deployment docs, API docs, package scripts, config files, and relevant standards.

## Process
1. Identify the code/config/script behavior that changed or needs verification.
2. Find docs that describe that behavior.
3. Update stale commands, paths, architecture notes, API contracts, deployment steps, and workflow docs.
4. Preserve local context and project-specific decisions.
5. Remove duplicated stale instructions instead of adding another copy.
6. Note anything that needs owner review.

## Output Format
Return docs changed, facts verified, source files used as evidence, validation commands, and remaining gaps.

## Validation Checklist
- Commands are current.
- Architecture notes match code.
- Project context is preserved.
- No unsupported claims were added.
- Stale docs are removed or redirected.
