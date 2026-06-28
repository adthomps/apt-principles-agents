---
title: "Update Docs"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/prompts/update-docs.prompt.md"]
---

# Update Docs

Update documentation for the scoped change.

## Instructions

1. Compare code, config, scripts, and current docs.
2. Update docs only where behavior, setup, commands, API contracts, deployment, integrations, or user workflows are stale.
3. Preserve project-specific context in `docs/project-context.md`.
4. Remove or correct stale instructions rather than duplicating them.
5. Do not invent behavior that is not supported by files or commands.
6. If a command cannot be verified, mark it for owner review instead of presenting it as fact.
7. Keep examples free of secrets, tokens, production credentials, or sensitive payloads.

## Output

Summarize docs changed, source evidence used, commands verified, and remaining owner-review items.
