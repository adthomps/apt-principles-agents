---
name: critic-review
description: Use for an independent Working Backwards critic review — score a package against the versioned rubric plus its domain and repository profile overlays and write only critic-review.md and session.json. Must run in a session that did not author the package.
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
- The base rubric for the package's `rubric_version`: `templates/working-backwards/critic-rubric-<version>.json`, or `critic-rubric.json` for v1.0.0 (or when no version is recorded).
- The declared domain profile's overlay (`profile`), for example `.apt/templates/working-backwards/domains/game-development.rubric.json`.
- The repository profile overlay (`repo_profile`), usually `docs/apt/working-backwards/profile.rubric.json`.

## Process

1. **Take the lock.** Write `.wb-critic.lock` at the repository root (gitignored) with `{ "role": "critic", "package": "<feature-slug>", "started_at": "<ISO-8601>" }`. The critic guard hook, when enabled, blocks edits to writer artifacts while it exists.
2. **Read versions.** Record the base rubric version and the id and version of every declared profile (domain and repository).
3. **Read in stage order:** press release, external FAQ, internal FAQ, requirements, engineering handoff, readiness.
4. **Score.** For each stage with content, score every base dimension, every domain-profile dimension, and every repository-profile dimension. Unwritten stages stay PENDING. A stage passes only when all its dimensions pass.
5. **Record.** Fill `critic-review.md` (verdict block, stage table, per-dimension evidence) and set `critic_verdict` per stage in `session.json`. For NEEDS REVISION list failing dimension ids with issue and fix.
6. **Decide build.** Approve build only when required stages pass, or open items are owned and explicitly deferred. `[BLOCKER]` items prevent build.
7. **Release the lock.** Delete `.wb-critic.lock` when the review is recorded or cancelled.

### Stage tests

- **Press release:** could an engineer read it and know exactly who they are building for and why, and could a customer tell at once whether it is for them?
- **External FAQ:** would a skeptical target customer feel their main concerns were answered, without evasion ("we take privacy seriously" with no how is an evasion), from a genuinely hard question set?
- **Internal FAQ:** could an engineering lead know what they are committing to, the risks, and what must be resolved first? Relabel `[OPEN]` items that would stop a safe build as `[BLOCKER]`.
- **Requirements:** could an engineer start without asking a scope question? Every requirement traces to a specific sentence; every earlier open item is carried or marked resolved; criteria are given/when/then with edge cases; all six non-functional categories are present.
- **Engineering handoff and readiness (v1.1.0):** every increment traces, validates, and can stop; readiness covers every area with owners and names outcome signals.

**Feedback standard.** Name the exact text that fails and give a concrete fix. "The customer is described as enterprise teams — who within the enterprise has this problem?" not "be more specific".

**Return-only mode.** When the orchestrator records verdicts itself (for example the Product Team pipeline), skip the lock and file writes and return only the verdict block.

Allowed writes: `critic-review.md` and `session.json` in the package only. Never edit writer artifacts, the package README, or product code, and never mark PASS from a hook, a self-check, or "close enough".

## Outputs

```text
VERDICT: PASS | NEEDS REVISION
RUBRIC_VERSION: {base version}
PROFILES: {domain id@version, repo id@version, or none}
SUMMARY: {one sentence}
```

Plus the stage table, per-dimension evidence, open-versus-blocker list, and overall build decision.

## Quality Bar

Every verdict quotes evidence, names rubric and profile versions, and comes from a session independent of the authors.

## References

- [Critic rubric v1.1.0](../../../templates/working-backwards/critic-rubric-1.1.0.json) and [v1.0.0](../../../templates/working-backwards/critic-rubric.json)
- [Domain profiles](../../../templates/working-backwards/domains/README.md)
- [Critic review template](../../../templates/working-backwards/critic-review.md)
- [Agent role contracts](../../../templates/working-backwards/agent-role-contracts.md)
