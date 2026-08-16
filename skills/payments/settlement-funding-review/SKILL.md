---
name: settlement-funding-review
description: Use when work must model the complete transaction lifecycle and explicitly address money movement, tokenization, risk, reconciliation, funding, support, and provider differences.
kind: skill
status: active
owner: APT
last_updated: 2026-08-16
source: consolidated APT guidance
title: "Settlement Funding Review"
domain: "payments"
source_paths: ["apt-principles-agents/skills/payments/settlement-funding-review/SKILL.md"]
---

# Settlement Funding Review

## Purpose

Verify end-to-end settlement, reconciliation, exception handling, ledger treatment, and funding controls against provider, banking, and internal evidence.

## When to Use

Use for planning, design, implementation review, migration, troubleshooting, or documentation where the task must model the complete transaction lifecycle and explicitly address money movement, tokenization, risk, reconciliation, funding, support, and provider differences.

## Inputs

- Goal, audience, scope, constraints, and success criteria.
- Relevant source files, contracts, examples, logs, and decisions.
- Known risks, assumptions, dependencies, and approval boundaries.

## Process

1. Map expected transaction activity through provider batches, settlement reports, fees/reserves/adjustments, ledger postings, bank confirmations, and merchant funding.
2. Identify authoritative sources, immutable keys, equations, precision, currencies, signs, calendars, time zones, and cutoff rules at each boundary.
3. Replay normal, duplicate, missing, late, corrected, reversed, disputed, multi-currency, and partial-file scenarios through reconciliation.
4. Inspect exception classification, materiality, queues, ownership, aging, evidence, controlled correction, and escalation paths.
5. Verify funding/close gates plus least privilege, dual control, idempotency, audit logs, and recovery for manual actions and reruns.
6. Report unmatched or unsupported cases, financial exposure, evidence gaps, launch blockers, accepted exceptions, and follow-up owners.

## Outputs

A settlement/funding flow, source and key matrix, reconciliation equations, scenario results, exception/control findings, exposure summary, and readiness verdict.

## Quality Bar

The output is practical, source-backed, audience-aware, testable, reversible where possible, and does not state assumptions as facts.

## Domain Checklist

- Tie gross transactions to fees, reserves, adjustments, disputes, refunds, net settlement, ledger postings, bank movement, and funding.
- Verify immutable keys, source authority, currency/precision/sign rules, business dates, time zones, and cutoffs.
- Test missing, duplicate, late, corrected, partial, and replayed inputs without double posting or double funding.
- Inspect exception cause, materiality, owner, evidence, aging target, escalation, and controlled correction.
- Gate funding and close on completeness plus explicit material-exception thresholds.
- Require least privilege, dual control, idempotency, and auditability for adjustments, write-offs, reruns, and releases.

## Required Reading

Read the canonical Payments principle hub, the closest enforceable standard, the applicable checklist, and exact target-repository evidence.
## References

- [Payments principles](../../../principles/payments/README.md)
- [Templates](../../../templates/README.md)
- [Agents](../../../agents/README.md)
