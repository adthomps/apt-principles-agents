---
title: Working Backwards Package Index
kind: template
domain: execution
status: active
owner: APT
last_updated: 2026-10-04
source_paths: ["apt-principles-agents/templates/working-backwards/package-index.md", "apt-commerce/docs/apt/working-backwards/README.md"]
---

# Working Backwards

Copy to `docs/apt/working-backwards/README.md` in the repository. It is the repository's front door for Working Backwards: rules, layout, and every package's build decision.

[Repository] plans [customer | player | partner]-facing work with the APT Working Backwards method, installed under `.apt/`:

- Method: `.apt/principles/execution/working-backwards.md`
- Domain profile: [none | `.apt/templates/working-backwards/domains/<domain>.md`]
- Repository profile: `profile.md` and `profile.rubric.json`
- Agents: `apt-wb-orchestrator` with the writer sub-agents and the independent `apt-wb-critic`
- Skills: `working-backwards/run-session`, `critic-review`, `package-status`

Do not edit installed copies under `.apt/`; change them in `apt-principles-agents` and sync.

**Stage order:** press release → external FAQ → internal FAQ → requirements → engineering handoff + readiness → implementation.

## When a package is required

See `profile.md` (When a package is required).

## Folder layout

Copy `_template/` to `<feature-slug>/`.

```
docs/apt/working-backwards/<feature-slug>/
  README.md                 # stage-gate status
  session.json              # profile, repo_profile, persona, rubric_version
  press-release.md
  faq-external.md
  faq-internal.md
  requirements.md
  engineering-handoff.md
  readiness.md
  critic-review.md          # critic only
```

## Sessions

| Slug | Feature | Current stage | Build? |
|---|---|---|---|
| — | No packages yet | — | — |

## Independent critic

Run the critic in a new session that did not draft the package, using the `working-backwards/critic-review` skill or the `apt-wb-critic` agent. It writes only `critic-review.md` and `session.json` and scores the base rubric plus the domain and repository overlays.

To enforce independence, enable the installed hook in `.claude/settings.json` and add `.wb-critic.lock` to `.gitignore`:

```json
"hooks": { "PreToolUse": [{ "matcher": "Edit|Write|MultiEdit",
  "hooks": [{ "type": "command", "command": "node .claude/hooks/pretooluse-wb-critic-guard.mjs" }] }] }
```

## Agent rules

- Pause product-facing implementation when the matching package is missing, `NEEDS REVISION`, `BLOCKED`, or not yet `PASS`.
- Scope that does not trace to the press release or FAQ is out of scope until the package is revised.
