---
name: apt-review
description: Use when reviewing code, docs, or plans for APT Core alignment, behavior preservation, and reviewability.
title: "APT Review"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/codex/skills/apt-review/SKILL.md"]
---

# APT Review

## Purpose
Review work against APT Core principles.

## When To Use
Use for diffs, implementation plans, generated docs, or repository changes that need standards review.

## When Not To Use
Do not use as a substitute for domain-specific API, UX, Cloudflare, or migration review when those profiles apply.

## Required Reading
Read `.apt/standards/installable-summaries/APT.md`, `.apt/standards/installable-summaries/principles.md`, and `docs/project-context.md` when present.

## Process
Inspect the changed files, identify preserved or changed behavior, check assumptions, and verify that validation evidence is named.

## Output Format
Return findings first, then assumptions, validation notes, and recommended next steps.

## Validation Checklist
- Behavior preservation is explicit.
- Scope is reviewable.
- Assumptions are named.
- Tests or checks are identified.
