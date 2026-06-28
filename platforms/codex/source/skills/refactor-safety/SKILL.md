---
name: refactor-safety
description: Use when refactoring code while preserving behavior and minimizing regression risk.
title: "Refactor Safety"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/codex/skills/refactor-safety/SKILL.md"]
---

# Refactor Safety

## Purpose
Refactor with explicit behavior preservation.

## When To Use
Use for restructuring, modernization, dependency replacement, or code cleanup.

## When Not To Use
Do not use when behavior intentionally changes and needs feature design first.

## Required Reading
Read affected code paths, callers, tests, docs, package scripts, and migration standards.

## Process
1. Characterize current behavior and invariants.
2. Identify the smallest safe refactor.
3. Name files and behavior that must not change.
4. Add or identify tests before editing when feasible.
5. Make one small change at a time.
6. Run focused validation and update docs if workflows or commands changed.
7. Avoid unrelated formatting, renames, or broad abstraction.

## Output Format
Return behavior preserved, changes made, tests or checks run, risks, and follow-ups.

## Validation Checklist
- Scope is narrow.
- Behavior is characterized.
- Tests or checks ran.
- Rollback is straightforward.
- No unrelated rewrites were introduced.
