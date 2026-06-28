---
title: "Cloudflare React Hono"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/prompts/cloudflare-react-hono.prompt.md"]
---

# Cloudflare React Hono

Review or implement React, Vite, Hono, and Cloudflare Pages/Workers architecture.

Use this prompt in GitHub Copilot Chat when a task refers to the Codex
`cloudflare-react-hono` skill. Copilot Chat may not discover
`.codex/skills/cloudflare-react-hono/SKILL.md` as an installed skill, so this
prompt carries the equivalent operating instructions.

## Instructions

1. Inspect React/Vite entry points, Worker entry points, Hono routes, middleware, package scripts, and `wrangler.toml`.
2. Map static frontend responsibilities to Pages or static hosting.
3. Map dynamic behavior to Worker routes, preferably `/api` routes where appropriate.
4. Check Hono error handling, request validation, response shapes, CORS, and tests.
5. Keep bindings explicit and secrets out of source code.
6. Recommend D1, KV, or R2 only when the data model requires them.

## Output

Return implementation notes, architecture findings, changed files or proposed files, preserved behavior, validation commands, deployment risks, and docs updates.
