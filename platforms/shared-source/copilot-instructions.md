---
title: "GitHub Copilot Instructions"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/standards/copilot-instructions.md"]
---

# GitHub Copilot Instructions

Follow APT Core principles for every suggestion: preserve behavior, make intent visible, keep changes reviewable, and validate generated output.

## Default Behavior

- Prefer existing project patterns over new abstractions.
- Read nearby code before suggesting a new helper, component, route, or convention.
- Do not overwrite project-specific context, especially `docs/project-context.md`.
- Generate or update tests when behavior changes or is clarified.
- Keep suggestions small, reviewable, and grounded in existing code.
- Avoid broad rewrites unless the prompt explicitly asks for a migration plan.
- When harness files are installed, use `agents/`, `routing/`, and `context/` guidance to classify the task and choose the smallest sufficient workflow before suggesting material changes.

## When Editing

- Name the behavior being preserved.
- Update docs when commands, setup, API contracts, deployment, or workflows change.
- Keep secrets out of source code and examples.
- Prefer focused validation commands over vague "run tests" advice.

## When Reviewing

Return findings first. Prioritize correctness, security, data handling, missing tests, documentation drift, and maintainability. Separate confirmed facts from assumptions.

## Harness Awareness

If `.apt/installation.json/manifest.json` exists, treat it as the installed harness manifest. Preserve `docs/project-context.md` and `.apt/installation.json/local-overrides.md`. Use `.github/prompts/*.prompt.md` for Copilot-native workflows when a matching Codex skill exists.
