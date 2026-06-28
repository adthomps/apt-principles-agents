---
title: "APT Instructions"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/instructions/apt.instructions.md"]
---

# APT Instructions

Follow APT Core in every suggestion.

## Principles

- Preserve working behavior unless the requested change explicitly alters it.
- Make intent visible in naming, tests, docs, and review notes.
- Keep changes small enough to review and roll back.
- Prefer existing project patterns over new abstractions.
- Treat AI output as a draft until validated against files and commands.

## Before Suggesting Code

- Read `docs/project-context.md` when present.
- Check `AGENTS.md` and relevant `.codex/skills`, `.claude/agents`, and `.github/instructions`.
- Identify the behavior that must remain stable.
- Prefer the least invasive implementation that solves the request.

## Output Expectations

For implementation help, include changed behavior, validation commands, and doc impact. For reviews, return findings first with severity and file references.
