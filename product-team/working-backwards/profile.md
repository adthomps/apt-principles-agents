---
title: Working Backwards Profile — APT Product Team
kind: guide
domain: product-planning
status: active
owner: APT Product Team
last_updated: 2026-10-05
source_paths: ["apt-principles-agents/product-team/working-backwards/profile.md"]
---

# Working Backwards Profile: APT Product Team

The Product Team's own layer on the canonical APT Working Backwards system. It extends the method with no domain profile, and only adds rules.

```text
EXTENDS:  APT method + critic-rubric@1.x (sessions use 1.1.0)
DOMAIN:   none
OWNER:    APT Product Team
VERSION:  1.0.0
```

## What runs here

- **Method:** [principles/execution/working-backwards.md](../../principles/execution/working-backwards.md).
- **Agents:** the canonical `apt-wb-*` agents, generated into `.claude/agents/` by `npm run build:agents` from [agents/working-backwards/](../../agents/working-backwards/README.md). Never edit them here.
- **Rubric:** [critic-rubric-1.1.0.json](../../templates/working-backwards/critic-rubric-1.1.0.json).
- **Pipeline:** the local `/working-backwards` skill orchestrates and the local `/wb-status` skill reports; both are Product Team mechanics around the canonical agents.

## When a package is required

Any idea the Product Team plans before handing it to a product repository: new products, workflows, doctrine proposals, and intake-driven ideas. Small clarifications to an existing session need a revision, not a new session.

## Product Team specifics

- **Sessions** live in `working-backwards/active/<session-id>/`, move to `promotion-candidates/` when reviewed, and to `archive/` when historical. Session outputs are planning evidence, not doctrine or product behavior, until promoted to the owning repository.
- **Stages run here:** press release, external FAQ, internal FAQ, and requirements. The engineering handoff and readiness are written in the destination repository after promotion, against that repository's own profile.
- **Critic** runs as a sub-agent in return-only mode: it returns the verdict and the orchestrator records it in `session.json` and commits it.
- **Commits:** the orchestrator commits each stage verdict to GitHub (`Working Backwards [<session-id>]: Stage N ... - Critic PASS`), using the `github-operations` skill.
- **Revisions:** at most three per stage; then the draft is saved and the PM is asked for more evidence.

## Personas

Name the customer from the destination product's personas, indexed in [references/persona-register.json](../../references/persona-register.json). If the destination has none yet, mark the persona as a hypothesis and carry it as an `[OPEN]` item.

## Promotion

A promotion note names the destination repository, owner, evidence, and remaining risks. The destination re-runs or continues the package under its own profile.
