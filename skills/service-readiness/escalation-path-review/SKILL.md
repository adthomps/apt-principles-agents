---
name: escalation-path-review
description: Use when work must prove the service can launch, operate, degrade safely, be supported, be troubleshot, and communicate change.
kind: skill
status: active
owner: APT
last_updated: 2026-08-16
source: consolidated APT guidance
title: "Escalation Path Review"
domain: "service-readiness"
source_paths: ["apt-principles-agents/skills/service-readiness/escalation-path-review/SKILL.md"]
---

# Escalation Path Review

## Purpose

Produce a reviewable escalation path review outcome that is grounded in repository evidence and explicit about uncertainty.

## When to Use

Use for planning, design, implementation review, migration, troubleshooting, or documentation where the task must prove the service can launch, operate, degrade safely, be supported, be troubleshot, and communicate change.

## Inputs

- Goal, audience, scope, constraints, and success criteria.
- Relevant source files, contracts, examples, logs, and decisions.
- Known risks, assumptions, dependencies, and approval boundaries.

## Process

1. Inventory services, audiences, failure modes, dependencies, operating hours, telemetry, support channels, current owners, and protected decisions.
2. Define severity using measurable impact, urgency, duration, data or money risk, affected customers, and workaround availability rather than team-specific intuition.
3. Map each severity and failure class to a primary owner, backup, specialist, incident authority, acknowledgement target, update cadence, customer-communication owner, and rollback authority.
4. Define the handoff packet: timeline, symptoms, scope, customer impact, evidence, actions attempted, current state, risks, communication status, and next decision.
5. Run tabletop tests for business hours, out of hours, failed acknowledgement, cross-team dependency, security/payment/privacy involvement, rollback, and unresolved customer impact.
6. Record gaps, owners, due dates, drill evidence, residual risk, launch blockers, closure criteria, post-incident learning, and approval status.

## Outputs

A concise recommendation, evidence map, required changes, risks, validation plan, support/documentation impact, and approval status.

## Quality Bar

The output is practical, source-backed, audience-aware, testable, reversible where possible, and does not state assumptions as facts.

## Domain Checklist

- Treat **Escalation Path Review** as an explicit decision with defined scope, evidence, owner, and validation.
- Required evidence: owner, telemetry, runbook, knowledge, escalation, communication, rollback.
- Verify that every alert or support signal reaches someone empowered to act, with a backup and a tested failed-acknowledgement path.
- Require customer-safe communication, rollback authority, and closure/learning ownership in addition to technical paging details.
- State what is verified, what is assumed, and what requires specialist or human approval.

## Required Reading

Read the canonical Service Readiness principle hub, the closest enforceable standard, the applicable checklist, and exact target-repository evidence.
## References

- [Service Readiness principles](../../../principles/service-readiness/README.md)
- [Templates](../../../templates/README.md)
- [Agents](../../../agents/README.md)
