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
- **In CI.** The workflow `.github/workflows/apt-check.yml` runs `--mode ci` on pushes to `main` or `master` and on pull requests.

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

## Keeping profiles current

Each repository describes itself in `docs/apt/references/project-profile.json` (inventory version 2). `docs/project-context.md` is generated from that profile, so edit the profile and never the context.

- **Start a profile:** `node ../apt-principles-agents/scripts/scaffold-project-profile.mjs --target . --write`. It drafts the profile from `package.json` scripts, the lockfile, the `apps/` and `packages/` folders, wrangler and workflow files, `docs/project-identity.md`, and the Local Cloudflare section of an existing context. It carries over the fields of a version 1 profile and leaves `TODO:` placeholders for anything that needs judgment. It never replaces a version 2 profile.
- **Regenerate the context:** `node .apt/bin/apt-check.mjs --only profile --fix`.
- **What the `profile` module reports:** a missing or invalid profile, a version 1 profile, a stale context, `TODO:` placeholders, `last_verified` older than 180 days, commands that run a script `package.json` doesn't define, and `check`, `test`, `lint`, `typecheck` or `build` scripts that the command matrix doesn't run.
- **Once the profile is clean,** set `"profile": { "level": "error" }` in `apt.json`. From then on, a profile that falls behind fails the push and CI. Do the same for `architecture` once it has no findings.

When a change adds a script, a folder, a service or a deployment step, update the profile in the same change, set `last_verified` to today, and run `--fix`.

## Skipping

- `git push --no-verify`, or `APT_SKIP_SYNC_CHECK=1`, skips the local hook. CI still runs.
- A locally edited workflow is left alone by sync and reported as drifted.
