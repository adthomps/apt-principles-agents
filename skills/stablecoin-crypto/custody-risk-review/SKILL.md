---
name: custody-risk-review
description: Use when work must separate mature capability from emerging or future-looking options and require legal, compliance, custody, counterparty, settlement, and risk review.
kind: skill
status: active
owner: APT
last_updated: 2026-06-27
source: consolidated APT guidance
---

# Custody Risk Review

## Purpose

Produce a reviewable custody risk review outcome that is grounded in repository evidence and explicit about uncertainty.

## When to Use

Use for planning, design, implementation review, migration, troubleshooting, or documentation where the task must separate mature capability from emerging or future-looking options and require legal, compliance, custody, counterparty, settlement, and risk review.

## Inputs

- Goal, audience, scope, constraints, and success criteria.
- Relevant source files, contracts, examples, logs, and decisions.
- Known risks, assumptions, dependencies, and approval boundaries.

## Process

1. Restate the intended outcome and affected audiences.
2. Inventory exact current behavior and source-backed constraints.
3. Apply the relevant APT principles and identify missing evidence.
4. Compare viable options, including compatibility and operational effects.
5. Produce the required artifacts: maturity label, asset and network assumptions, custody model, on/off-chain flow, finality, refunds, payout, reconciliation, volatility, compliance, and human approval.
6. Review hype, uncertain finality, unsupported reversals, custody ambiguity, counterparty exposure, regulatory assumptions, and card-like dispute expectations; separate blockers, recommendations, and open questions.

## Outputs

A concise recommendation, evidence map, required changes, risks, validation plan, support/documentation impact, and approval status.

## Quality Bar

The output is practical, source-backed, audience-aware, testable, reversible where possible, and does not state assumptions as facts.

## References

- [Stablecoin Crypto principles](../../../principles/stablecoin-crypto/README.md)
- [Templates](../../../templates/README.md)
- [Agents](../../../agents/README.md)

## TODO

Replace assumptions with jurisdiction-, provider-, asset-, and custody-specific evidence before production use.
