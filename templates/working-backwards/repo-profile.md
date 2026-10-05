---
title: Working Backwards Repository Profile
kind: template
domain: execution
status: active
owner: APT
last_updated: 2026-10-04
source_paths: ["apt-principles-agents/templates/working-backwards/repo-profile.md"]
---

# Working Backwards Profile: [Repository]

Copy to `docs/apt/working-backwards/profile.md` in the repository, with `profile.rubric.json` beside it. This is the repository's own layer: it extends the APT method and, optionally, one domain profile. It may add rules; it never removes or weakens them.

```text
EXTENDS:  APT method + critic-rubric@1.x (new packages: 1.1.0)
DOMAIN:   [none | payments | game-development | ...] (templates/working-backwards/domains/)
OWNER:    [team or person]
VERSION:  1.0.0
```

## When a package is required

**Full package before code:** [the changes in this repository that a customer, partner, staff member, or player would notice].

**Short note instead:** [changes that only need a problem / outcome / out-of-scope note].

## Personas

| Persona | Source in this repository | APT register id | Reviewer lenses |
| --- | --- | --- | --- |
| [name] | `docs/apt/personas/README.md#...` | [register id or "add"] | [APT reviewer agents] |

Write personas with `templates/product/product-persona-profile.md`, then index them in `apt-principles-agents/references/persona-register.json`.

## Stage guidance

Add only what this repository needs beyond the method and domain profile.

- **Press release:** [extra intake questions or claims that must be stated honestly]
- **External FAQ:** [extra customer-side coverage]
- **Internal FAQ:** [extra team-side coverage: systems, compliance, costs specific to this repository]
- **Requirements:** [repository-specific non-functional requirements]
- **Engineering handoff:** [validation commands, test conventions, environments]
- **Readiness:** [repository-specific release and operations checks]

## Reviewer lenses

[Which canonical APT agents review packages here, beyond the persona lenses, and when.]

## Rubric overlay

`profile.rubric.json`: dimensions that only this repository needs. Keep ids unique within each stage and different from the base and domain dimensions.
