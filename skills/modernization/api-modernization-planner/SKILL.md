---
name: api-modernization-planner
description: Use when planning an evidence-backed API modernization from verified current behavior through target contract, incremental migration, compatibility, rollout, rollback, and retirement.
kind: skill
status: active
owner: APT
last_updated: 2026-08-16
source: consolidated APT guidance
title: "API Modernization Planner"
domain: "modernization"
source_paths: ["apt-principles-agents/skills/modernization/api-modernization-planner/SKILL.md"]
---

# API Modernization Planner

## Purpose

Produce an incremental API modernization plan that connects consumer outcomes and verified current behavior to a target contract, safe migration slices, operational proof, and retirement criteria.

## When to Use

Use before or during facade, bridge, protocol, version, platform, provider, or implementation modernization where consumers and production behavior must remain supportable through change.

## Inputs

- Goal, audience, scope, constraints, and success criteria.
- Relevant source files, contracts, examples, logs, and decisions.
- Known risks, assumptions, dependencies, and approval boundaries.

## Process

1. State the consumer and business outcomes, non-goals, constraints, success measures, decision owners, and evidence gaps.
2. Baseline current operations, consumers, dependencies, data/policy ownership, support commitments, production signals, and unsafe or obsolete behavior.
3. Define the target contract and evaluate retain, wrap, adapt, replace, or retire options by value, compatibility, security, operability, cost, and reversibility.
4. Decompose the change into independently testable vertical slices with mappings, contract/replay tests, telemetry, documentation, support, and consumer migration work.
5. Specify shadow, dual-read/write, traffic-shift, reconciliation, rollback, and exception handling only where their consistency and failure behavior are explicit.
6. Set entry/exit gates, adoption evidence, communications, ownership, residual-risk approval, legacy shutdown, data retention, and post-cutover verification.

## Outputs

A modernization decision record, current/target maps, option assessment, dependency-aware slice roadmap, parity and validation plan, rollout/rollback gates, consumer migration plan, and retirement criteria.

## Quality Bar

The output is practical, source-backed, audience-aware, testable, reversible where possible, and does not state assumptions as facts.

## Domain Checklist

- Anchor the plan in verified operations, consumers, dependencies, production signals, support commitments, and source authority.
- Define an intentional target contract and ownership model rather than reproducing the legacy implementation by default.
- Compare retain, wrap, adapt, replace, and retire options with security, compatibility, operability, cost, and reversibility evidence.
- Build vertical slices with contract/replay tests, telemetry, documentation, support readiness, and independent rollback.
- Make shadowing, dual operation, reconciliation, traffic shifts, and failure recovery explicit where used.
- Require objective adoption, stability, consumer-notification, residual-risk, shutdown, and post-cutover gates.

## Required Reading

Read the canonical Modernization principle hub, the closest enforceable standard, the applicable checklist, and exact target-repository evidence.
## References

- [Modernization principles](../../../principles/modernization/README.md)
- [Templates](../../../templates/README.md)
- [Agents](../../../agents/README.md)
