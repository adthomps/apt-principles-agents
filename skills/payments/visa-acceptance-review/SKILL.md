---
name: visa-acceptance-review
description: Use when reviewing a Visa Acceptance integration against its exact products, APIs, versions, merchant/acquirer setup, regions, credentials, payment services, tokens, events, and current authoritative evidence.
kind: skill
status: active
owner: APT
last_updated: 2026-08-16
source: consolidated APT guidance
title: "Visa Acceptance Review"
domain: "payments"
source_paths: ["apt-principles-agents/skills/payments/visa-acceptance-review/SKILL.md"]
---

# Visa Acceptance Review

## Purpose

Review a Visa Acceptance integration without generalizing across Visa products, regions, processors, acquirers, merchant configuration, or API generations.

## When to Use

Use for integration design, implementation review, migration, incident analysis, or documentation involving Visa Acceptance payment, tokenization, authentication, fraud/risk, event, reporting, or related services.

## Inputs

- Goal, audience, scope, constraints, and success criteria.
- Relevant source files, contracts, examples, logs, and decisions.
- Known risks, assumptions, dependencies, and approval boundaries.

## Process

1. Inventory exact Visa Acceptance products/services, APIs, versions, environments, regions, merchant/acquirer/processor setup, credentials, enabled features, and authoritative documentation dates.
2. Trace supported payment, authentication, token, risk, follow-on, event/webhook, reporting, settlement, and reconciliation flows with identifiers and state transitions.
3. Verify authentication/signing, endpoint selection, permissions, token scope, sensitive-data boundaries, amount/currency handling, idempotency, merchant references, and redaction.
4. Map raw API, processor/network, issuer, authentication, and risk results while identifying region-, acquirer-, processor-, product-, and configuration-dependent behavior.
5. Test success, decline, challenge, review, timeout, duplicate, unknown outcome, delayed event, reversal/refund, outage, credential rotation, and reconciliation scenarios.
6. Report verified capability, enabled configuration, implementation evidence, gaps, operational readiness, support/escalation needs, and provider or specialist questions.

## Outputs

A product/configuration inventory, end-to-end flow map, field/status mapping, credential/token review, scenario evidence, readiness verdict, and provider questions.

## Quality Bar

The output is practical, source-backed, audience-aware, testable, reversible where possible, and does not state assumptions as facts.

## Domain Checklist

- Name exact products/services, APIs, versions, regions, environments, merchant/acquirer/processor setup, and documentation dates.
- Separate provider-documented capability, contracted/enabled service, configuration, repository implementation, and observed behavior.
- Verify credentials/signing, endpoints, permissions, token scope, sensitive-data boundaries, amount/currency, identifiers, idempotency, and redaction.
- Trace payment, authentication, risk, token, follow-on, event/webhook, reporting, settlement, and reconciliation states actually used.
- Preserve raw API/processor/network/issuer results and test decline, challenge, review, timeout, duplicate, unknown, delayed, reversal, outage, and rotation cases.
- Route unresolved behavior to current authoritative Visa Acceptance evidence or an accountable provider/acquirer specialist.

## Required Reading

Read the canonical Payments principle hub, the closest enforceable standard, the applicable checklist, and exact target-repository evidence.
## References

- [Payments principles](../../../principles/payments/README.md)
- [Templates](../../../templates/README.md)
- [Agents](../../../agents/README.md)
