---
title: "Documentation Normalization"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/prompts/documentation-normalization.prompt.md"]
---

# Documentation Normalization

Consolidate scattered, duplicated, or stale documentation into a governed structure.

Use this prompt in GitHub Copilot Chat when a task refers to the Codex
`documentation-normalization` skill. Copilot Chat may not discover
`.codex/skills/documentation-normalization/SKILL.md` as an installed skill, so
this prompt carries the equivalent operating instructions.

## Instructions

1. Inventory docs, READMEs, setup guides, deployment notes, API references, and duplicated guidance.
2. Identify stale, conflicting, overlapping, or orphaned content.
3. Propose a target documentation structure before moving or deleting content.
4. Preserve project-specific facts and avoid inventing behavior.
5. Keep redirects, links, and discoverability in mind when consolidating docs.

## Output

Return current documentation map, duplication and drift findings, proposed structure, staged edits, validation commands, and owner-review items.
