---
title: "Working Backwards Templates"
kind: "template"
domain: "thinking"
status: "active"
owner: "APT"
last_updated: "2026-08-16"
source_paths: ["apt-principles-agents/templates/working-backwards/README.md", "apt-principles-agents/product-team/templates/session.json.template", "apt-principles-agents/product-team/templates/output-formats/press-release.md.template", "apt-principles-agents/product-team/templates/output-formats/faq.md.template"]
---

# Working Backwards Templates

Use these templates when turning an idea into a staged product package before backlog generation or implementation handoff.

## Package Order

1. Press release
2. External FAQ
3. Internal FAQ
4. Requirements
5. Engineering handoff (stored under the `engineering-prompt` stage key in `session.json`)
6. Readiness

The method itself is defined in [principles/execution/working-backwards.md](../../principles/execution/working-backwards.md). Domain profiles in [domains/](domains/README.md) add stage guidance and rubric dimensions for payments and game development.

Each stage should preserve open items with an owner. Blockers must remain visible until resolved and should prevent build handoff.

## Templates

- [Session](session.json)
- [Press Release](press-release.md)
- [FAQ](faq.md)
- [Requirements](requirements.md)
- [Engineering Handoff](engineering-handoff.md)
- [Readiness](readiness.md)
- [Critic Review](critic-review.md)
- [Domain Profiles](domains/README.md)
- [Repository Profile](repo-profile.md) and [rubric overlay](repo-profile.rubric.json): the repository's own layer
- [Package Index](package-index.md): the repository's `docs/apt/working-backwards/README.md`
- [Critic Rubric v1.1.0](critic-rubric-1.1.0.json) (current; scores all six stages) and [v1.0.0](critic-rubric.json) (frozen for packages that declared it)
- [Agent Role Contracts](agent-role-contracts.md)
- [Stage Gate Status](stage-gate-status.md)
- [AI Task Contract](ai-task-contract.json)

## Use In Target Repos

Target repos can copy these templates into their local planning area, `.apt/` package, or product workspace. Claude Code-specific commands, slash commands, GitHub commits, Cursor skills/hooks, and session mechanics belong in platform adapters, internal planning repos, or product implementations; these templates are provider-neutral. Do not fork `critic-rubric.json` into `apps/` or other runtime source.

## Role Boundary

Working Backwards implementations should keep authoring and review separate. Writer roles draft or revise artifacts. Critic roles evaluate against versioned rubrics and do not edit artifacts directly. Orchestrators preserve stage state, source lineage, open items, blockers, and approval history. Independent critic review uses a fresh session. Editor hooks may guard edits; they must not issue `PASS`.
