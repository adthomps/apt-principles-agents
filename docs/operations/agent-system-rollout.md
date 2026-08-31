---
title: Agent System Rollout
kind: runbook
domain: operations
status: active
owner: APT maintainers
last_updated: 2026-08-30
source_paths: ["apt-principles-agents/scripts/apt-assets.mjs"]
---

# Agent System Rollout

How to push the agent-contract / generated-adapter / commands / hooks work out
to the workspace consumers. Not started at time of writing — every consumer is a
live repo with its own branch and WIP, so this is a per-repo operation on a
clean tree, not a batch.

## Precondition

`apt-principles-agents` `main` is pushed to `origin`. Consumers pin
`installation.json` to a commit; syncing from an unpushed local `main` records a
commit no one else can fetch.

## What the sync brings

Per consumer, `sync --apply --force` updates ~300 managed files:

- `.claude/agents/**` — regenerated Claude-native adapters (correct `name`,
  real `tools`, `model`); old broken-format files replaced, renamed ones
  (`apt-router` -> `apt-task-router`, `apt-docs-reviewer` ->
  `apt-harness-docs-reviewer`) removed as retired.
- `.codex/agents/**`, `.cursor/agents/**` — new, for repos on those platforms.
- `.claude/commands/edi.md` — new.
- `.claude/hooks/*.mjs` — new (4 scripts; activation stays opt-in per repo).
- `.apt/**` canonical mirror refreshed; `installation.json` managed-file kinds
  updated (`platform` -> `platform-agent` for adapters).

`--force` writes a timestamped backup of every replaced file under
`.apt-backups/<timestamp>/` before overwriting.

## Per-repo procedure

```bash
cd ../<consumer>
git switch main && git pull            # or the repo's integration branch
git status   # must be clean

node ../apt-principles-agents/scripts/apt-assets.mjs sync --target . --force --dry-run
# review the action counts; expect ~300 would-update + a few would-remove-retired

node ../apt-principles-agents/scripts/apt-assets.mjs sync --target . --force --apply
git add .apt .claude .codex .cursor .github .gemini CLAUDE.md CODEX.md GEMINI.md AGENTS.md
git commit -m "Sync APT agent system: generated adapters, commands, hooks"

# verify
git -C ../apt-principles-agents rev-parse HEAD   # matches installation.json source.commit
node ../apt-principles-agents/scripts/apt-assets.mjs scan --target .   # all managed files current
```

## Live check (do once, in apt-commerce)

Open a Claude Code session rooted at the consumer and run `/agents`. Confirm the
APT agents list, then ask it to invoke one via Task (e.g. `apt-task-router` or
`glyph`) on a trivial prompt. The static equivalent — every generated adapter
parses as a valid subagent (`name` a slug, `tools` real, `model` set) — is
checked by `npm run check` in `apt-principles-agents` (`validate:adapters`) and
was 89/89 OK at rollout time.

## Order

`apt-commerce` first as the pilot; review its commit; then the rest.
`apt-security-harness` is `platforms: ["codex"]` only — it gets `.codex/agents`,
not `.claude/`. `apt-anet-hosted-toolbox` is registered but not checked out.
`apt-product-team` is declared local-only (`.apt/local-agents.md`); do not sync
it as a consumer unless it becomes its own repo.

## Consumer state at hand-off (2026-08-30)

Every consumer carries uncommitted changes — mostly the un-committed 2026-08-29
partial APT sync, which a fresh `sync --force` supersedes; a few carry real
application WIP that must be committed or stashed first. Resolve each repo's
own state before syncing.

| Repo | Branch | Dirty | Real app WIP | Note |
| --- | --- | --- | --- | --- |
| adthomps.github.io | main | 54 | ~2 | APT-sync dirt |
| applied-practical-thinking | preview | 103 | ~2 | on a feature branch |
| apt-anet-integration-toolbox | main | 125 | ~2 | large APT-sync dirt |
| apt-commerce | preview | 119 | **66** | active feature work — commit/stash first |
| apt-design-reference | main | 26 | 0 | APT-sync dirt only |
| apt-dream-to-reality | main | 36 | ~1 | APT-sync dirt |
| apt-health | main | 109 | ~2 | large APT-sync dirt |
| apt-intake | detached | — | — | different Windows owner; needs `safe.directory` + a branch |
| apt-intelligence-core | main | 34 | ~4 | APT-sync dirt |
| apt-knowledge-hub | master | 64 | ~4 | APT-sync dirt |
| apt-novel-reviewer | main | 30 | ~2 | APT-sync dirt |
| apt-security-harness | main | 35 | ~2 | codex-only target |
| crt-world | main | 86 | ~2 | APT-sync dirt |

All consumers pin `installation.json` to `620fc6a` (pre agent-system).

## Rollback

Per repo: `git reset --hard HEAD~1` (the sync commit), or restore individual
files from `.apt-backups/<timestamp>/`.
