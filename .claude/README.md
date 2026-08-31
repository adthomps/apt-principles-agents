---
title: Claude Code Settings
kind: guide
domain: ai
status: active
owner: APT
last_updated: 2026-08-30
source_paths: ["apt-principles-agents/.claude/settings.json"]
---

# Claude Code Settings

`apt-principles-agents` dogfoods its own hook enforcement layer
([`standards/ai/hook-enforcement-standard.md`](../standards/ai/hook-enforcement-standard.md)).
`settings.json` here activates all four hooks from `hooks/`:

| Hook | Effect in this repo |
| --- | --- |
| `pretooluse-managed-file-guard.mjs` | Blocks `Edit`/`Write` to generated files — `platforms/*/source/agents/**`, `docs/distribution/AGENT-CATALOG.md`, `*-CROSSWALK.md`, `references/agent-catalog.json`. Edit the canonical source and run `npm run build:agents`. Generator output (`writeFileSync` inside a script) is unaffected. |
| `pretooluse-bash-guard.mjs` | Blocks `wrangler deploy`, `npm/pnpm/yarn publish`, `git push --force`, `git push … main`, `curl … \| sh`, and `.env` reads **unless `APT_APPROVED=1` is set in the shell**. For a real deploy or push: `APT_APPROVED=1 git push origin main`. |
| `stop-verify-gate.mjs` | Warn-only: at the end of a turn with a dirty tree touching an enforceable domain, prints which review agents the change implies. Set `APT_STOP_GATE=block` to make it blocking. |
| `subagentstop-evidence.mjs` | Appends each finished sub-agent's final message to `.apt/council-evidence/<session>.md` (git-ignored). |

To disable one, remove its block from `settings.json` or open `/hooks`.
