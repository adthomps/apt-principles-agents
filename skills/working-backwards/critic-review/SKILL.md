---
name: critic-review
description: Use for an independent Working Backwards critic review — score a package against the versioned rubric plus its profile overlay and write only critic-review.md and session.json. Must run in a session that did not author the package.
kind: skill
status: active
owner: APT
last_updated: 2026-10-04
source: APT Commerce working-backwards-critic skill
title: "Working Backwards Critic Review"
domain: "working-backwards"
source_paths: ["apt-principles-agents/skills/working-backwards/critic-review/SKILL.md", "apt-commerce/.cursor/skills/working-backwards-critic/SKILL.md"]
---

# Working Backwards Critic Review

## Purpose

Give a package an honest, independent PASS or NEEDS REVISION per stage, so build starts only when the package actually meets the bar.

## When to Use

When a Working Backwards stage is drafted or revised and needs a verdict, or someone asks whether a package is ready to build. Use a fresh session that did not draft any artifact in the package; if this session drafted any of it, refuse to issue PASS and ask for a new session.

## Inputs

- The package folder and its `session.json` (profile, persona, rubric version).
- `templates/working-backwards/critic-rubric.json`.
- The declared profile's overlay, for example `templates/working-backwards/domains/game-development.rubric.json`.

## Process

1. **Take the lock.** Write `.wb-critic.lock` at the repository root (gitignored) with `{ "role": "critic", "package": "<feature-slug>", "started_at": "<ISO-8601>" }`. The critic guard hook, when enabled, blocks edits to writer artifacts while it exists.
2. **Read versions.** Record the base rubric version and the profile id and version.
3. **Read in stage order:** press release, external FAQ, internal FAQ, requirements, engineering handoff, readiness.
4. **Score.** For each stage with content, score every base dimension and every profile dimension. Unwritten stages stay PENDING. A stage passes only when all its dimensions pass.
5. **Record.** Fill `critic-review.md` (verdict block, stage table, per-dimension evidence) and set `critic_verdict` per stage in `session.json`. For NEEDS REVISION list failing dimension ids with issue and fix.
6. **Decide build.** Approve build only when required stages pass, or open items are owned and explicitly deferred. `[BLOCKER]` items prevent build.
7. **Release the lock.** Delete `.wb-critic.lock` when the review is recorded or cancelled.

Allowed writes: `critic-review.md` and `session.json` in the package only. Never edit writer artifacts, the package README, or product code, and never mark PASS from a hook, a self-check, or "close enough".

## Outputs

```text
VERDICT: PASS | NEEDS REVISION
RUBRIC_VERSION: {base version}
PROFILE: {profile id and version, or none}
SUMMARY: {one sentence}
```

Plus the stage table, per-dimension evidence, open-versus-blocker list, and overall build decision.

## Quality Bar

Every verdict quotes evidence, names rubric and profile versions, and comes from a session independent of the authors.

## References

- [Critic rubric](../../../templates/working-backwards/critic-rubric.json)
- [Domain profiles](../../../templates/working-backwards/domains/README.md)
- [Critic review template](../../../templates/working-backwards/critic-review.md)
- [Agent role contracts](../../../templates/working-backwards/agent-role-contracts.md)
