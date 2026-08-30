---
title: Hooks
kind: hook
domain: ai
status: active
owner: APT
last_updated: 2026-08-30
source_paths: ["apt-principles-agents/hooks/README.md"]
---

# Hooks

Canonical Claude Code hook scripts. `apt-assets.mjs` installs each
`hooks/<name>.mjs` into a claude target's `.claude/hooks/<name>.mjs`.

Contract, hook table, and per-repo activation: see
[`standards/ai/hook-enforcement-standard.md`](../standards/ai/hook-enforcement-standard.md).

Only the `SessionStart` notice is active by default. The blocking guards and the
`Stop` gate are opt-in — a maintainer adds the `hooks` entry to
`.claude/settings.json` once they accept the behavior. Every hook fails open on
its own error; it fails closed only on an actual policy match.
