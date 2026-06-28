---
title: "Lovable To Cloudflare"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/prompts/lovable-to-cloudflare.prompt.md"]
---

# Lovable To Cloudflare

Plan a Lovable-to-Cloudflare conversion.

Use this prompt in GitHub Copilot Chat when a task refers to the Codex
`lovable-to-cloudflare` skill. Copilot Chat may not discover
`.codex/skills/lovable-to-cloudflare/SKILL.md` as an installed skill, so this
prompt carries the equivalent operating instructions.

## Instructions

1. Identify frontend, API, auth, data, environment, and deployment patterns.
2. Map static frontend behavior toward React/Vite on Cloudflare Pages.
3. Map dynamic behavior toward Hono Worker `/api` routes.
4. Recommend D1, KV, or R2 only when the current behavior justifies them.
5. Document migration risks before editing.
6. Preserve current routes, working demos, and user-visible behavior unless a reviewed migration step changes them.
7. Name validation commands for each stage.

## Output

Return current architecture, target Cloudflare architecture, staged migration plan, storage recommendations with justification, validation commands, and rollback notes.
