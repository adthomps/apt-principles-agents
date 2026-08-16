---
name: response-code-analysis
description: Use when mapping payment transport, provider, processor, network, issuer, risk, and lifecycle results into safe actions, retry rules, customer messages, telemetry, and support guidance.
kind: skill
status: active
owner: APT
last_updated: 2026-08-16
source: consolidated APT guidance
title: "Response Code Analysis"
domain: "payments"
source_paths: ["apt-principles-agents/skills/payments/response-code-analysis/SKILL.md"]
---

# Response Code Analysis

## Purpose

Turn layered payment results into an evidence-backed outcome taxonomy without flattening transport failure, provider error, processor/network response, issuer decline, risk decision, and final transaction state into one ambiguous code.

## When to Use

Use for provider integrations, decline analysis, error normalization, retry design, customer/support messaging, migration parity, dashboards, or troubleshooting where response semantics drive action.

## Inputs

- Goal, audience, scope, constraints, and success criteria.
- Relevant source files, contracts, examples, logs, and decisions.
- Known risks, assumptions, dependencies, and approval boundaries.

## Process

1. Identify each result layer, source, API/version, merchant configuration, transaction type, lifecycle state, and current authoritative code reference.
2. Capture raw HTTP/transport, provider, processor/network, issuer, authentication, risk, validation, and internal orchestration results separately.
3. Normalize into explicit outcome, state certainty, retry class, customer action, merchant/support action, and observability categories while retaining raw values.
4. Validate mappings for success, partial/async acceptance, soft/hard decline, invalid request, authentication, risk review, timeout, duplicate, rate limit, outage, and unknown outcome.
5. Test UI/API messages, retry behavior, support playbooks, metrics, alerts, parity, and reconciliation against sanitized examples and production evidence.
6. Publish conflicts, unknown codes, version/configuration dependencies, safe fallback behavior, owners, review dates, and provider escalation needs.

## Outputs

A layered raw-code inventory, normalized outcome taxonomy, action/retry/message matrix, unknown/conflict register, test evidence, monitoring guidance, and ownership record.

## Quality Bar

The output is practical, source-backed, audience-aware, testable, reversible where possible, and does not state assumptions as facts.

## Domain Checklist

- Keep transport, API/provider, processor/network, issuer, authentication, risk, validation, and internal results distinct.
- Preserve raw codes and source/version/configuration context alongside normalized outcome and action categories.
- Distinguish final failure from asynchronous acceptance, timeout, unknown outcome, review, and follow-on-required states.
- Map each result to state certainty, safe retry class, customer action/message, merchant/support action, telemetry, and reconciliation.
- Validate mappings against current authoritative sources and observed evidence; do not generalize one provider's semantics.
- Give unknown/conflicting codes safe defaults, alerting, owners, review dates, and provider-escalation paths.

## Required Reading

Read the canonical Payments principle hub, the closest enforceable standard, the applicable checklist, and exact target-repository evidence.
## References

- [Payments principles](../../../principles/payments/README.md)
- [Templates](../../../templates/README.md)
- [Agents](../../../agents/README.md)
