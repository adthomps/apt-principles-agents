---
title: Working Backwards Domain Profiles
kind: template
domain: execution
status: active
owner: APT
last_updated: 2026-10-04
source_paths: ["apt-principles-agents/templates/working-backwards/domains/README.md"]
---

# Working Backwards Domain Profiles

A profile adapts the Working Backwards method to a domain without forking it. A package declares its profile in `session.json` (`"profile": "game-development"`). The critic then scores the base rubric (`../critic-rubric.json`) plus the profile's extra dimensions. A profile never removes or weakens a base dimension.

| Profile | Use for | Derived from |
| --- | --- | --- |
| [payments](payments.md) ([rubric](payments.rubric.json)) | Gateways, acquiring, merchant and partner portals, money paths | APT Commerce practice |
| [game-development](game-development.md) ([rubric](game-development.rubric.json)) | Video games and interactive experiences | APT game-development principles |

Each profile defines:

- **When a full package is required** in that domain.
- **Stage guidance:** extra intake questions, FAQ coverage, and requirement, handoff, and readiness expectations.
- **Personas and reviewer lenses** to use from `references/persona-register.json`.
- **Rubric overlay:** extra dimensions per stage, including the stage-4 artifacts (engineering handoff and readiness). Overlays extend any 1.x base rubric (`critic-rubric@1.x`) and must not reuse a base dimension id.

To add a profile, copy an existing pair, keep dimension ids unique within each stage, and have the agent and skill steward review it.
