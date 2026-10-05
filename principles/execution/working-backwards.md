---
title: Working Backwards
kind: principle
domain: execution
status: active
owner: APT
version: v1
last_updated: 2026-10-04
source_paths: ["apt-principles-agents/principles/execution/working-backwards.md", "apt-commerce/docs/apt/working-backwards/README.md", "apt-principles-agents/templates/working-backwards/agent-role-contracts.md"]
---

# Working Backwards

## Overview

Working Backwards is the APT method for deciding what to build. Work starts from the customer outcome, written as a press release for something that has already shipped, and moves backwards through hard questions to requirements and a build plan. Nothing product-facing is built until an independent critic passes the package.

It answers:

- Who exactly is this for, and what evidence shows they have the problem?
- What would they say once it exists?
- What are the hardest questions a skeptical customer and a skeptical team would ask?
- What, testably, must be true, and in what increments do we build it?

## Purpose

Working Backwards keeps product work customer-led, evidence-backed, and reviewable. It stops scope from being invented during implementation and makes "done" mean the press release came true, not that code shipped.

## Core Principles

- **Customer first, always.** Every package starts at the press release, even when someone asks for requirements first.
- **Evidence over assertion.** The problem paragraph uses real evidence (quotes, workarounds, frequency, cost). Unvalidated claims are marked as placeholders or open items.
- **One stage at a time.** Stages are never collapsed into one generated artifact.
- **Independent critic.** The critic scores against a versioned rubric and never edits writer artifacts. A session that drafted a package cannot pass it.
- **Traceability.** Every requirement and build increment traces to the press release or FAQ. Anything that does not is out of scope until the package is revised.
- **Honest gates.** Build starts only when required stages pass, or an open item is owned and explicitly deferred. Hooks and self-checks never write a pass.

## Standards / Rules

### Stage order

| Stage | Artifact | Author | Scored by rubric |
| --- | --- | --- | --- |
| 1 | `press-release.md` | Press release writer | Yes |
| 2 | `faq-external.md` | FAQ writer (external mode) | Yes |
| 2 | `faq-internal.md` | FAQ writer (internal mode) | Yes |
| 3 | `requirements.md` | Requirements writer | Yes |
| 4 | `engineering-handoff.md` | Requirements writer | Not in rubric v1.0.0 |
| 4 | `readiness.md` | Requirements writer | Not in rubric v1.0.0 |
| Gate | `critic-review.md`, `session.json` | Critic only | — |

The rubric is `templates/working-backwards/critic-rubric.json`. A domain profile may add dimensions; it never removes base dimensions.

### When a package is required

- **Full package before code:** anything a customer, partner, staff member, or player would notice: workflows, money paths, data retention, permissions, core gameplay, or anything that would be demoed.
- **Short note instead** (problem, outcome, out of scope, in the plan): copy-only changes, lint, generated files, docs sync, lockfiles, and tests that do not change behavior.
- Do not backfill packages for shipped work unless asked.

### Open items and blockers

- `[OPEN]`: visible and owned; does not prevent build when explicitly deferred.
- `[BLOCKER]`: prevents the build handoff until resolved.

### Personas

The press release names a specific customer. Choose it from the owning repository's personas, indexed in `references/persona-register.json`. The external FAQ uses that persona's reviewer agents as lenses. Do not invent a persona from a passing mention.

### Domain profiles

A profile adapts the method to a domain without forking it: extra intake questions, FAQ coverage, readiness checks, and rubric dimensions. Profiles live in `templates/working-backwards/domains/`. A package declares its profile in `session.json`.

## Required Artifacts

A package folder (by convention `docs/apt/working-backwards/<feature-slug>/`) holding the stage artifacts above, a stage-gate `README.md`, and `session.json`. A repository-level `README.md` lists packages, their stage, and build decision.

## Good Example

APT Commerce: more than fifty payment-platform packages, each with a named persona, an independent critic review with rubric version, owned open items, an engineering handoff with validation commands per slice, and a demo-honesty test per package. Build decisions are logged in one table.

## Bad Example

A requirements document written first, scored by the same session that wrote it, with the press release backfilled to match what was built.

## AI Prompt Example

```text
Start a Working Backwards package for <idea> using the <profile> profile.
Name the customer from the persona register. Draft only the press release.
Stop for an independent critic review before the FAQ.
```

## Applied by

- [apt-wb-critic](../../agents/working-backwards/apt-wb-critic.md) — Independent sub-agent that scores a Working Backwards package against the versioned rubric plus its declared profile overlay and returns PASS or NEEDS REVISION per stage; must run in a fresh session that authored nothing in the package and writes only critic-review.md and session.json.
- [apt-wb-faq-writer](../../agents/working-backwards/apt-wb-faq-writer.md) — Sub-agent invoked by the Working Backwards orchestrator to draft or revise Stage 2, the external FAQ (skeptical customer questions) and the internal FAQ (skeptical engineering, leadership, compliance, and operations questions), using the persona's reviewer agents as lenses.
- [apt-wb-orchestrator](../../agents/working-backwards/apt-wb-orchestrator.md) — Use to start, resume, or report on a Working Backwards package; it owns session state, stage order, the domain profile and persona, and invokes the writer sub-agents and the independent critic.
- [apt-wb-press-release-writer](../../agents/working-backwards/apt-wb-press-release-writer.md) — Sub-agent invoked by the Working Backwards orchestrator to draft or revise Stage 1, a customer-centered press release written as if the product has shipped, for the persona and profile recorded in the session.
- [apt-wb-requirements-writer](../../agents/working-backwards/apt-wb-requirements-writer.md) — Sub-agent invoked by the Working Backwards orchestrator to draft or revise Stages 3 and 4, traceable and testable requirements, an engineering handoff of validated increments, and a readiness checklist, all derived only from the passed press release and FAQs.

## Related Documents

- [Working Backwards templates](../../templates/working-backwards/README.md)
- [Agent role contracts](../../templates/working-backwards/agent-role-contracts.md)
- [Package readiness checklist](../../checklists/working-backwards-package-readiness-checklist.md)
- [Persona register](../../references/persona-register.json)

## Summary

Start from the customer, prove the problem, ask the hard questions, trace every requirement, and let an independent critic decide when the build can start.
