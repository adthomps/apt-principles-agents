---
title: "Docs Instructions"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/instructions/docs.instructions.md"]
---

# Docs Instructions

Keep documentation close to real project behavior.

## Update Docs When

- Setup, install, build, test, lint, deploy, or smoke-test commands change.
- Architecture, runtime, bindings, APIs, data flow, or integrations change.
- User workflows, UI states, or operational procedures change.
- Known risks, assumptions, or migration status changes.

## Documentation Rules

- Keep project-specific context in `docs/project-context.md`.
- Do not replace local project notes with generic standards language.
- Prefer verified facts from code/config over guesses.
- Remove stale instructions when replacing them.
- Link to canonical docs rather than duplicating large content.

## Output Expectations

Summarize what changed, what source verified it, and what still needs owner review.
