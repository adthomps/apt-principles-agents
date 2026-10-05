---
name: run-session
description: Use to start or resume a Working Backwards package — create the package folder, record profile and persona, run each stage through its writer and an independent critic, and keep the build decision honest.
kind: skill
status: active
owner: APT
last_updated: 2026-10-04
source: product-team working-backwards skill; APT Commerce practice
title: "Run Working Backwards Session"
domain: "working-backwards"
source_paths: ["apt-principles-agents/skills/working-backwards/run-session/SKILL.md", "apt-principles-agents/product-team/.claude/skills/working-backwards/SKILL.md"]
---

# Run Working Backwards Session

## Purpose

Take a product idea through the Working Backwards stages to a build decision without skipping stages, inventing scope, or letting the author approve its own work.

## When to Use

Starting a new product-facing change, resuming a package, or when someone asks for requirements or code for something that has no passed package yet.

## Inputs

- The feature idea and any customer or player evidence.
- The repository's package root (default `docs/apt/working-backwards/`) and personas.
- A domain profile from `templates/working-backwards/domains/` (`payments`, `game-development`, or none).

## Process

1. **Check the gate.** Decide whether the change needs a full package or a short note (see the principle's "When a package is required" and the profile).
2. **Create the package.** Copy `templates/working-backwards/` stage templates to `<package-root>/<feature-slug>/`; fill `session.json` with `session_id`, `feature_idea`, `profile`, `persona`, and `rubric_version`.
3. **Stage 1.** Invoke the press release writer. Stop if the persona or evidence is missing.
4. **Critic.** Ask for the critic in a fresh session. Do not continue in the drafting session.
5. **Branch on the verdict.** PASS: advance. NEEDS REVISION: send only the failing dimensions back to the writer. Stop after three revisions of one stage and ask for more evidence.
6. **Stage 2.** FAQ writer, external then internal mode, each followed by the critic.
7. **Stages 3 and 4.** Requirements writer for requirements, engineering handoff, and readiness, followed by the critic.
8. **Decide.** Build only when required stages are PASS or open items are owned and explicitly deferred. Update the package `README.md` and the repository package index.

## Outputs

A package folder with stage artifacts, `session.json`, a package `README.md` showing stage status, and a build decision.

## Quality Bar

Every stage has an independent verdict with rubric and profile versions; every requirement traces to the press release or FAQ; no product-facing code starts before PASS.

## References

- [Working Backwards principle](../../../principles/execution/working-backwards.md)
- [Templates](../../../templates/working-backwards/README.md)
- [Domain profiles](../../../templates/working-backwards/domains/README.md)
- [Agent role contracts](../../../templates/working-backwards/agent-role-contracts.md)
