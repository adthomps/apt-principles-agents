---
name: package-status
description: Use to report the state of one or all Working Backwards packages — stage verdicts, open items, blockers, and the build decision — without changing any file.
kind: skill
status: active
owner: APT
last_updated: 2026-10-04
source: product-team wb-status skill
title: "Working Backwards Package Status"
domain: "working-backwards"
source_paths: ["apt-principles-agents/skills/working-backwards/package-status/SKILL.md", "apt-principles-agents/product-team/.claude/skills/wb-status/SKILL.md"]
---

# Working Backwards Package Status

## Purpose

Show where a package stands and whether build may start, read-only.

## When to Use

Before starting implementation, when resuming a package, or when someone asks what is blocked or ready.

## Inputs

- A package slug, or the repository package root (default `docs/apt/working-backwards/`).

## Process

1. Read `session.json` and `critic-review.md` for the package (or for each package under the root).
2. Report each stage's status and critic verdict, the rubric and profile versions, the revision counts, open items, and blockers.
3. State the build decision: **build** only when required stages are PASS or open items are owned and explicitly deferred; otherwise **paused**, with the next action.
4. Flag inconsistencies: a PASS with no critic review, a `critic-review.md` that names no rubric version, a build decision recorded before PASS, or a package README that disagrees with `session.json`.

## Outputs

```text
WORKING BACKWARDS: <slug>   profile: <id or none>   persona: <id>
Press release   [PASS]      External FAQ  [PASS]
Internal FAQ    [PENDING]   Requirements  [PENDING]
Handoff         [PENDING]   Readiness     [PENDING]
Open: 2   Blockers: 0   Build: PAUSED — next: internal FAQ draft
```

## Quality Bar

Read-only, consistent with `session.json`, and never reports build as allowed without an independent PASS.

## References

- [Working Backwards principle](../../../principles/execution/working-backwards.md)
- [Run Working Backwards Session](../run-session/SKILL.md)
