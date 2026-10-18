---
title: "APT Check"
kind: guide
domain: governance
status: active
owner: APT
last_updated: 2026-10-18
source_paths: ["apt-principles-agents/bin/apt-check.mjs", "apt-principles-agents/scripts/apt-check/", "apt-principles-agents/references/apt.schema.json"]
---

# APT Check

`apt-check` checks an APT repository against apt-principles-agents (DR-017). It runs in two places:

- **Before a push.** The pre-push hook `.apt/git-hooks/pre-push` runs `--mode push`.
- **In CI.** The workflow `.github/workflows/apt-check.yml` runs `--mode ci` on pushes to `main` and on pull requests.

Every install and sync puts three files in the repository: the hook, the shim `.apt/bin/apt-check.mjs`, and the workflow. Sync also sets `git config core.hooksPath .apt/git-hooks`. The runner itself stays in apt-principles-agents at `bin/apt-check.mjs`. The shim looks for it in this order:

1. `APT_PRINCIPLES_AGENTS_ROOT`
2. `../apt-principles-agents`, the local workspace
3. `./_apt-principles-agents`, which the workflow checks out

If none is found, the shim skips locally and fails in CI.

```bash
node .apt/bin/apt-check.mjs --mode ci
```

## Modules

| Module | push | ci | Fails on |
|---|---|---|---|
| `sync` | yes | yes | APT design behind canonical. Guidance files behind, and managed files edited locally without a `localTargets` entry, are warnings. |
| `profile` | yes | yes | Nothing by default. It warns on a missing or invalid profile, a version 1 profile, a stale `docs/project-context.md`, an empty owner, a command matrix with no validate or test command, a missing build command for applications, and commands that run a `package.json` script that doesn't exist. |
| `architecture` | yes | yes | Nothing by default. It warns on imports that cross a forbidden zone boundary, and on `fetch()` in presentational components. |
| `design` | no | yes | The repository's installed `apt-design-check` failing. It only runs when `apt-design.json` exists. |

## Warn first, then ratchet

`profile` and `architecture` start as warnings. Once a repository is clean, or has accepted a count, raise the level in `apt.json`:

```json
{
  "$schema": "./.apt/references/apt.schema.json",
  "architecture": { "level": "error", "baseline": 2 },
  "profile": { "level": "error" }
}
```

At level `error`, a module fails when its findings exceed `baseline`. When findings drop below the baseline, it asks for the baseline to be lowered, so the count only goes down. New rules always arrive as warnings.

## Architecture zones

With no `apt.json` zones, each `apps/<name>` folder is a zone named `<name>`, and `packages/` is the zone `packages`. The default rules are:

- No app imports another app.
- Packages import no app.

Workspace `package.json` names count as aliases for their zone, so `@apt/api` resolves to the `api` zone. `apps/web/src/components` and `apps/web/components` are treated as presentational when they exist. Override any of these in `apt.json` with `zones`, `aliases`, `forbid` and `presentational`. Test files (`test/`, `tests/`, `__tests__/`, `e2e/`, `*.test.*`, `*.spec.*`) are not checked, because tests may reach across apps to exercise contracts. To accept a single finding, put `apt-check-ignore` on its line or on the line above.

## Skipping

- `git push --no-verify`, or `APT_SKIP_SYNC_CHECK=1`, skips the local hook. CI still runs.
- A locally edited workflow is left alone by sync and reported as drifted.
