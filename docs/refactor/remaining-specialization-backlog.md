---
title: Remaining Specialization Backlog
kind: analysis
status: active
owner: APT
last_updated: 2026-08-16
source: repository specialization validator and distribution evidence
domain: "governance"
source_paths: ["apt-principles-agents/docs/refactor/remaining-specialization-backlog.md"]
---

# Remaining Specialization Backlog

## Purpose

This record describes what remains after all thin principles and the modernization/payment skill batch were specialized. It is a decision aid, not authorization to delete, merge, archive, or generate assets. Structured counts come from `references/content-specialization-baseline.json`; asset decisions still require consumer, manifest, adapter, installation, and public-example evidence.

## Current Coverage

| Family | Total files | Shared-core files | Thin specialization | Remaining concentration |
|---|---:|---:|---:|---|
| Skills | 142 | 84 | 21 | Documentation 7, product 7, AI review 3, engineering 3, service readiness 1 |
| Agents | 75 | 52 | 50 | API 3, architecture 4, beginner 4, core 6, customer 5, docs 6, ecommerce 4, engineering 3, payments 8, product 4, risk 3 |
| Principles | 123 | 85 | 0 | Complete |
| Prompts | 74 | 38 | 36 | Audits 2, migration 4, modernization 5, planning 4, product hubs 4, reviews 5, swarm reviews 7, troubleshooting 5 |

Exact normalized-body duplicate groups remain zero. “Thin” means an asset still uses the measured shared core without the minimum substantive specialization section; it does not by itself prove that the asset is useless or duplicative.

## Remaining Skill Decisions

### Enrich as distinct procedures

- AI review: hallucination review, micro-group review, and red-team review need different evidence selection, adversarial methods, stopping rules, human gates, and outputs.
- Engineering: contract-change review, implementation review, and refactor safety need distinct change surfaces, invariants, test strategies, and rollback evidence.
- Service readiness: the knowledge-base article writer needs diagnosis, symptoms, safe steps, escalation, validation, feedback, and freshness controls.
- Diagram generation should remain distinct from prose-guide writing because source authority, notation, semantic validation, accessibility, and generated-output handling differ materially.

### Review as governed families before consolidation

- Documentation writers: API, business, developer, operations, partner/acquirer, and troubleshooting guides can share a guide-quality contract, but their audience questions, evidence, task flows, safety boundaries, and validation differ. Preserve standalone installation until manifests and platform adapters can reference a shared contract safely.
- Product writers/planners: BRD, PRD, SRD, roadmap, prioritization, competitive analysis, and voice-of-customer assets can share evidence and decision-record conventions, but should not be merged until output consumers and approval roles are mapped.
- Provider-specific payment reviews: CyberSource and Visa Acceptance now contain provider-review discipline. A future parameterized provider-review contract is plausible, but retirement of named entry points requires catalog, manifest, user-discovery, adapter, and backward-compatibility evidence.

## Agent Review Strategy

The 50 thin agents are not a bulk-deletion queue. Agents should exist only where they contribute a distinct accountable perspective, decision authority, evidence focus, or review method.

Priority order:

1. Core and architecture roles: clarify routing, synthesis, decision ownership, escalation, and non-overlap.
2. Customer and beginner reviewers: preserve genuinely different lived-context questions; consolidate title-only variants only after perspective tests show no material delta.
3. API, engineering, payments, and risk specialists: connect each role to domain-specific checks, failure modes, and required evidence.
4. Documentation and product roles: distinguish authoring responsibility from review, audience translation, launch readiness, and portfolio/publication responsibility.
5. Ecommerce roles: verify checkout, merchant onboarding, partner/acquirer, and broader commerce-experience perspectives remain operationally distinct.

Each retained agent should have at least three perspective-specific checks that another role would not own, plus explicit handoff and human-approval boundaries.

## Prompt Review Strategy

Prompts are the strongest consolidation candidates because many represent task variants rather than accountable identities.

- Enrich first where safety or troubleshooting behavior is materially different: payment decline, settlement/funding, webhook, API error, customer confusion, security/risk review, and decision/red-team prompts.
- Evaluate parameterized prompt families for NVP/SOAP/XML modernization, migration planning, product-hub creation/review, general planning, and recurring review structures.
- Preserve named wrapper prompts when they improve discovery or manifest compatibility, but make the wrapper reference or generate from one canonical task contract.
- Require stable rendered output, source attribution, adapter compatibility, standalone installation, validation, and rollback before replacing authored prompts with generated views.

## Archive and Deletion Position

Nothing in the remaining active specialization queue is currently safe to archive or delete solely because it is thin.

An active asset becomes an archive candidate only when:

1. a canonical replacement contains all useful instructions, evidence boundaries, examples, and decisions;
2. repository search and manifest inspection identify every consumer and adapter;
3. compatibility aliases or migration instructions cover supported entry points;
4. installation, synchronization, catalog generation, and platform parity tests pass;
5. historical provenance has value but the asset no longer participates in active workflows.

Deletion is appropriate only when the content is exact generated output, cache/build material, or a proven redundant copy whose useful information and provenance are preserved elsewhere. Otherwise prefer a documented archive with replacement and recovery links.

## Next Bounded Sequence

1. Enrich the seven documentation skills, starting with troubleshooting, operations, developer, and API guides, then business, partner/acquirer, and diagrams.
2. Enrich the three AI-review, three engineering-review, and one knowledge-base skill.
3. Review the seven product skills as an evidence/decision family and decide which remain distinct entry points.
4. Run an agent perspective matrix before editing or consolidating the 50-agent queue.
5. Map prompt consumers and pilot one parameterized modernization prompt family before broader prompt consolidation.

## Evidence

- `references/content-specialization-baseline.json`
- `scripts/validate-content-specialization.mjs`
- `docs/refactor/boilerplate-and-specialization-review.md`
- `docs/refactor/content-lifecycle-and-publication-plan.md`
- `docs/skill-authoring-guide.md`
- `docs/agent-authoring-guide.md`
- `docs/distribution/SKILL-CATALOG.md`
- `docs/distribution/AGENT-CATALOG.md`
- `docs/distribution/PROMPT-CATALOG.md`
- `manifests/`
