---
name: api-contract-test-generator
description: Use when generating executable API contract tests for current, facade, replacement, or versioned interfaces, including errors, identity, idempotency, side effects, and compatibility behavior.
kind: skill
status: active
owner: APT
last_updated: 2026-08-16
source: consolidated APT guidance
title: "API Contract Test Generator"
domain: "modernization"
source_paths: ["apt-principles-agents/skills/modernization/api-contract-test-generator/SKILL.md"]
---

# API Contract Test Generator

## Purpose

Generate deterministic contract tests that prove observable API behavior at consumer and provider boundaries without encoding undocumented assumptions as expected truth.

## When to Use

Use when capturing an existing contract, testing a facade or replacement, protecting compatibility, comparing versions/providers, or turning a parity decision into executable evidence.

## Inputs

- Goal, audience, scope, constraints, and success criteria.
- Relevant source files, contracts, examples, logs, and decisions.
- Known risks, assumptions, dependencies, and approval boundaries.

## Process

1. Identify the authoritative contract, supported versions, consumers, environments, operations, and behavior dimensions in scope.
2. Convert verified request, response, state, error, authentication, authorization, idempotency, ordering, pagination, rate, and side-effect behavior into a test matrix.
3. Create minimal positive, negative, boundary, permission, retry, duplicate, timeout, and partial-failure fixtures using synthetic or sanitized data.
4. Normalize only declared nondeterminism such as timestamps and generated identifiers; keep semantic differences visible.
5. Run the suite against baselines and candidate implementations, preserving request/response correlation and classifying differences by consumer impact.
6. Publish executable tests, fixtures, environment requirements, evidence sources, unsupported cases, approval status, and version/retirement ownership.

## Outputs

An executable contract suite, behavior matrix, fixture set, normalization rules, environment instructions, difference report, evidence map, and ownership record.

## Quality Bar

The output is practical, source-backed, audience-aware, testable, reversible where possible, and does not state assumptions as facts.

## Domain Checklist

- Test observable semantics, errors, identity, permissions, limits, idempotency, ordering, state transitions, and side effects—not schema shape alone.
- Trace every expected behavior to a contract, implementation, captured interaction, support commitment, or approved decision.
- Cover positive, negative, boundary, duplicate, retry, timeout, permission, and partial-failure cases with safe fixtures.
- Normalize declared nondeterminism narrowly; never mask meaningful field, timing, ordering, or error differences.
- Keep secrets and customer data out of fixtures, logs, snapshots, and failure output.
- Version the suite with the protected contract and assign owners for exceptions, updates, environments, and retirement.

## Required Reading

Read the canonical Modernization principle hub, the closest enforceable standard, the applicable checklist, and exact target-repository evidence.
## References

- [Modernization principles](../../../principles/modernization/README.md)
- [Templates](../../../templates/README.md)
- [Agents](../../../agents/README.md)
