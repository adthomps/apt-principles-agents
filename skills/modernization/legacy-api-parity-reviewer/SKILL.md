---
name: legacy-api-parity-reviewer
description: Use when work must inventory legacy behavior before designing a facade, adapter, bridge, parity plan, dual run, deprecation path, and rollback.
kind: skill
status: active
owner: APT
last_updated: 2026-08-16
source: consolidated APT guidance
title: "Legacy API Parity Reviewer"
domain: "modernization"
source_paths: ["apt-principles-agents/skills/modernization/legacy-api-parity-reviewer/SKILL.md"]
---

# Legacy API Parity Reviewer

## Purpose

Determine whether a proposed facade or replacement preserves the legacy behaviors that supported consumers actually need, and define explicit treatment for every difference.

## When to Use

Use for planning, design, implementation review, migration, troubleshooting, or documentation where the task must inventory legacy behavior before designing a facade, adapter, bridge, parity plan, dual run, deprecation path, and rollback.

## Inputs

- Goal, audience, scope, constraints, and success criteria.
- Relevant source files, contracts, examples, logs, and decisions.
- Known risks, assumptions, dependencies, and approval boundaries.

## Process

1. Freeze the evidence-backed legacy inventory and the proposed public contract for the review window.
2. Build an operation-by-operation mapping across fields, semantics, state, errors, authentication, authorization, limits, ordering, idempotency, and side effects.
3. Classify each capability as full, transformed, partial, unsupported, unsafe-to-preserve, deferred, or unknown; identify affected consumers and owners.
4. Test mappings with contract fixtures, recorded/replayed traffic, negative cases, fault injection, and security checks using sanitized data.
5. Compare dual-run outcomes and correlated telemetry, including retry amplification, latency, data divergence, and reconciliation exceptions.
6. Issue a readiness verdict with blockers, accepted exceptions, consumer migrations, rollout thresholds, rollback signals, and facade/compatibility retirement conditions.

## Outputs

A parity matrix, translation map, consumer-impact register, test and dual-run evidence, approved exceptions, readiness verdict, and rollout/rollback criteria.

## Quality Bar

The output is practical, source-backed, audience-aware, testable, reversible where possible, and does not state assumptions as facts.

## Domain Checklist

- Assess semantics, errors, side effects, timing, ordering, limits, identity, authorization, and audit behavior—not schema shape alone.
- Classify every capability as full, transformed, partial, unsupported, unsafe-to-preserve, deferred, or unknown.
- Bind each difference to affected consumers, evidence, owner, treatment, test, communication, and decision date.
- Refuse silent coercion and false-success responses; unsupported or lossy behavior must be explicit and observable.
- Require correlated legacy/new-path evidence and objective thresholds before traffic shifts or deprecation.
- Separate compatibility required for consumers from legacy defects or unsafe behavior that need governed migration.

## Required Reading

Read the canonical Modernization principle hub, the closest enforceable standard, the applicable checklist, and exact target-repository evidence.
## References

- [Modernization principles](../../../principles/modernization/README.md)
- [Templates](../../../templates/README.md)
- [Agents](../../../agents/README.md)
