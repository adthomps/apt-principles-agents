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

The git pre-push sync gate is a git hook, not a Claude hook: its source is
[`git-hooks/pre-push`](../git-hooks/pre-push), and every install puts it in `.apt/git-hooks/`
and turns it on with `core.hooksPath`. It runs [apt-check](../docs/apt-check.md), which
the managed CI workflow also runs.

Only the `SessionStart` notice is active by default. The blocking guards and the
`Stop` gate are opt-in — a maintainer adds the `hooks` entry to
`.claude/settings.json` once they accept the behavior. Every hook fails open on
its own error; it fails closed only on an actual policy match.
