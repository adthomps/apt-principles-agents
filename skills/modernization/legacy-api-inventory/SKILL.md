---
name: legacy-api-inventory
description: Use when work must inventory legacy behavior before designing a facade, adapter, bridge, parity plan, dual run, deprecation path, and rollback.
kind: skill
status: active
owner: APT
last_updated: 2026-08-16
source: consolidated APT guidance
title: "Legacy API Inventory"
domain: "modernization"
source_paths: ["apt-principles-agents/skills/modernization/legacy-api-inventory/SKILL.md"]
---

# Legacy API Inventory

## Purpose

Produce a versioned, evidence-backed inventory of the legacy API's observable behavior, consumers, dependencies, ownership, and unresolved gaps without mixing current state with the proposed replacement.

## When to Use

Use for planning, design, implementation review, migration, troubleshooting, or documentation where the task must inventory legacy behavior before designing a facade, adapter, bridge, parity plan, dual run, deprecation path, and rollback.

## Inputs

- Goal, audience, scope, constraints, and success criteria.
- Relevant source files, contracts, examples, logs, and decisions.
- Known risks, assumptions, dependencies, and approval boundaries.

## Process

1. Define the inventory boundary: environments, versions, interfaces, privileged paths, time window, and excluded systems.
2. Enumerate HTTP/RPC operations, events, callbacks, files, batch jobs, scheduled work, and operator actions from code and configuration.
3. For each operation, capture schema, state transitions, errors, idempotency, authentication, authorization, limits, side effects, and data ownership.
4. Map known consumers, downstream dependencies, owners, and support commitments using code search, deployment configuration, telemetry, tests, and support evidence.
5. Reconcile documentation, implementation, traffic, logs, and owner testimony; label records verified, inferred, conflicting, unknown, or out of scope.
6. Publish the inventory snapshot with evidence paths, verification date, prioritized gaps, reviewers, and refresh triggers; do not add target-state recommendations to factual records.

## Outputs

A current-state operation catalog, consumer/dependency map, behavior tables, evidence index, uncertainty register, verification coverage, and prioritized follow-up list.

## Quality Bar

The output is practical, source-backed, audience-aware, testable, reversible where possible, and does not state assumptions as facts.

## Domain Checklist

- Cover non-HTTP, administrative, asynchronous, and undocumented-but-supported interfaces as well as public endpoints.
- Record positive, negative, retry, timeout, ordering, and partial-failure behavior at operation and version level.
- Link every material claim to repository, runtime, test, support, or accountable-owner evidence.
- Keep secrets, live credentials, and sensitive customer payloads out of captured evidence.
- Separate verified current behavior from target mappings, parity conclusions, and migration recommendations.
- Assign a verification date, owner, confidence state, and refresh trigger to the inventory.

## Required Reading

Read the canonical Modernization principle hub, the closest enforceable standard, the applicable checklist, and exact target-repository evidence.
## References

- [Modernization principles](../../../principles/modernization/README.md)
- [Templates](../../../templates/README.md)
- [Agents](../../../agents/README.md)
