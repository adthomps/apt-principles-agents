---
name: lovable-to-apt
description: Use when converting or standardizing a Lovable-generated project toward APT conventions without unnecessary rewrites.
title: "Lovable To APT"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/codex/skills/lovable-to-apt/SKILL.md"]
---

# Lovable To APT

## Purpose
Move a Lovable-generated or Lovable-influenced project toward APT standards while preserving behavior.

## When To Use
Use when the repo includes Lovable references, generated UI assumptions, unusual generated structure, or a request to convert Lovable work to APT.

## When Not To Use
Do not use for normal greenfield app work or cosmetic refactors.

## Required Reading
Read `docs/project-context.md`, package scripts, app routes, component structure, generated config, and `.apt/standards/installable-summaries/migration-standards.md`.

## Process
Inspect current project structure. Identify Lovable-generated assumptions. Map current state to APT standards. Recommend folder restructuring only where it improves maintainability. Create a migration plan before editing. Preserve working behavior and avoid unnecessary rewrites.

## Output Format
Return current-state findings, generated assumptions, APT target mapping, migration plan, validation plan, and risks.

## Validation Checklist
- Project structure was inspected.
- Lovable assumptions are named.
- Migration plan exists before edits.
- Working behavior is preserved.
