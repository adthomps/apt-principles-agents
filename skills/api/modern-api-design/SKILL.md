---
name: modern-api-design
description: Use when work must select API styles from audience and behavior, then make contracts predictable, secure, observable, evolvable, and usable by humans and agents.
kind: skill
status: active
owner: APT
last_updated: 2026-06-27
source: consolidated APT guidance
---

# Modern API Design

## Purpose

Produce a reviewable modern api design outcome that is grounded in repository evidence and explicit about uncertainty.

## When to Use

Use for planning, design, implementation review, migration, troubleshooting, or documentation where the task must select API styles from audience and behavior, then make contracts predictable, secure, observable, evolvable, and usable by humans and agents.

## Inputs

- Goal, audience, scope, constraints, and success criteria.
- Relevant source files, contracts, examples, logs, and decisions.
- Known risks, assumptions, dependencies, and approval boundaries.

## Process

1. Restate the intended outcome and affected audiences.
2. Inventory exact current behavior and source-backed constraints.
3. Apply the relevant APT principles and identify missing evidence.
4. Compare viable options, including compatibility and operational effects.
5. Produce the required artifacts: audience, use cases, protocol decision, schema, auth, errors, idempotency, pagination, webhooks, examples, tests, and deprecation policy.
6. Review fashion-driven protocol choices, ambiguous errors, unsafe retries, undocumented permissions, weak compatibility, and examples that do not execute; separate blockers, recommendations, and open questions.

## Outputs

A concise recommendation, evidence map, required changes, risks, validation plan, support/documentation impact, and approval status.

## Quality Bar

The output is practical, source-backed, audience-aware, testable, reversible where possible, and does not state assumptions as facts.

## References

- [API principles](../../../principles/api/README.md)
- [Templates](../../../templates/README.md)
- [Agents](../../../agents/README.md)
