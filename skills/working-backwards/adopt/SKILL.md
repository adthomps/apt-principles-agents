---
name: adopt
description: Use to set up Working Backwards in a repository — install the APT method, choose an optional domain profile, write the repository's own profile and personas, and create its package index and template — so the repository builds its own version without forking APT.
kind: skill
status: active
owner: APT
last_updated: 2026-10-04
source: APT Commerce and Grey Rain adoptions
title: "Adopt Working Backwards In A Repository"
domain: "working-backwards"
source_paths: ["apt-principles-agents/skills/working-backwards/adopt/SKILL.md"]
---

# Adopt Working Backwards In A Repository

## Purpose

Give a repository its own Working Backwards practice, built in layers on the general APT method: method (APT) → optional domain profile (APT) → repository profile (the repository).

## When to Use

A repository is starting product-facing work and has no Working Backwards setup, or it has an informal one that should reference APT instead of carrying its own copy.

## Inputs

- The repository's `README.md`, `AGENTS.md`, `docs/project-context.md`, and any existing planning docs.
- What its customers, partners, staff, or players would notice when it changes.
- Any existing personas and evidence.

## Process

1. **Check for an existing implementation.** If the repository already runs its own working packages, critic, or hooks, keep them. Record its owned paths in `.apt/installation.json` `localTargets`, and map its rules into a repository profile only when the owner agrees.
2. **Install the method.** `node scripts/apt-assets.mjs install --target <repo> --manifests working-backwards` from `apt-principles-agents`, then add `working-backwards` to the repository's entry in `references/workspace-consumers.json`.
3. **Choose a domain profile** from `.apt/templates/working-backwards/domains/`, or none. Do not create a domain profile for one repository; that is what the repository profile is for. Propose a new shared domain profile only when two or more repositories need it.
4. **Write the repository profile.** Copy `templates/working-backwards/repo-profile.md` and `repo-profile.rubric.json` to `docs/apt/working-backwards/profile.md` and `profile.rubric.json`. Fill in: when a package is required, personas and reviewer lenses, stage guidance, and only the rubric dimensions this repository needs.
5. **Personas.** Write or reuse personas in `docs/apt/personas/` with `templates/product/product-persona-profile.md`. Index each in `apt-principles-agents/references/persona-register.json` with its reviewer agents. Mark unvalidated personas as direction, not research.
6. **Create the package index and template.** Copy `templates/working-backwards/package-index.md` to `docs/apt/working-backwards/README.md`. Create `_template/` from the stage templates, with `session.json` preset to the repository, `profile`, and `repo_profile: "docs/apt/working-backwards/profile.md"`.
7. **Wire the gate.** Add a short Working Backwards rule to `AGENTS.md`, add `.wb-critic.lock` to `.gitignore`, and offer the hook snippet from the package index. Enabling the hook is the maintainer's choice.
8. **Verify.** Run `npm run knowledge:audit` in `apt-principles-agents` (personas resolve) and the repository's own checks. Do not write a first package without real evidence; leave the index empty until there is one.

## Outputs

`docs/apt/working-backwards/README.md`, `profile.md`, `profile.rubric.json`, `_template/`, persona entries, an `AGENTS.md` gate rule, and the registry update.

## Quality Bar

The repository references APT for the method, rubric, agents, and skills; owns only its profile, personas, and packages; and its profile adds to the method without weakening it.

## References

- [Working Backwards principle](../../../principles/execution/working-backwards.md)
- [Repository profile template](../../../templates/working-backwards/repo-profile.md)
- [Package index template](../../../templates/working-backwards/package-index.md)
- [Domain profiles](../../../templates/working-backwards/domains/README.md)
- [Product persona profile template](../../../templates/product/product-persona-profile.md)
- [Adoption examples](../../../examples/working-backwards/README.md)
