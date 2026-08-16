---
name: digital-asset-settlement-review
description: Use when work must separate mature capability from emerging or future-looking options and require legal, compliance, custody, counterparty, settlement, and risk review.
kind: skill
status: active
owner: APT
last_updated: 2026-08-16
source: consolidated APT guidance
title: "Digital Asset Settlement Review"
domain: "stablecoin-crypto"
source_paths: ["apt-principles-agents/skills/stablecoin-crypto/digital-asset-settlement-review/SKILL.md"]
---

# Digital Asset Settlement Review

## Purpose

Assess whether a specific digital-asset settlement design is permitted, controllable, reconcilable, recoverable, and supportable across asset, network, custody, counterparty, liquidity, and operational failure modes.

## When to Use

Use for planning, design, implementation review, migration, troubleshooting, or documentation where the task must separate mature capability from emerging or future-looking options and require legal, compliance, custody, counterparty, settlement, and risk review.

## Inputs

- Goal, audience, scope, constraints, and success criteria.
- Relevant source files, contracts, examples, logs, and decisions.
- Known risks, assumptions, dependencies, and approval boundaries.

## Process

1. Bound the exact asset, issuer, network, bridge, wallets, custodian, exchange/liquidity route, jurisdictions, users, value, and transaction purpose.
2. Trace the value flow and control plane from fiat/on-ramp through custody, signing, broadcast, confirmation/finality, accounting, reconciliation, payout/off-ramp, refund, and incident handling.
3. Verify provider/network support, contracts, legal/compliance opinions, screening, custody segregation, key recovery, limits, and operational ownership with current evidence.
4. Test address error, duplicate submission, fee spike, delayed confirmation, reorganization, fork, freeze/blacklist, depeg, illiquidity, bridge/oracle failure, custodian outage, compromise, and unsupported reversal scenarios.
5. Reconcile on-chain and off-chain identifiers, amounts, fees, asset units, timestamps, confirmations, ledger entries, fiat movement, and exceptions without treating an explorer as the accounting ledger.
6. Issue a maturity and risk verdict with exposure limits, monitoring, stop conditions, incident/recovery actions, evidence gaps, and named approvals.

## Outputs

A scoped settlement model, custody/control assessment, finality and failure matrix, reconciliation evidence, exposure/limit register, maturity classification, approval record, and readiness verdict.

## Quality Bar

The output is practical, source-backed, audience-aware, testable, reversible where possible, and does not state assumptions as facts.

## Domain Checklist

- Scope exact assets, issuers, networks, bridges, custody providers, liquidity routes, jurisdictions, users, value limits, and purposes.
- Verify key ownership, signing policy, segregation, recovery, address controls, screening, provider contracts, and incident authority.
- Define confirmation/finality, reorganization, fork, freeze, blacklist, depeg, fee, liquidity, and reversal/refund behavior.
- Reconcile on-chain transactions and fees to internal ledger, fiat settlement, payout, accounting, and exception records.
- Stress provider outage, compromised keys, wrong address, duplicate broadcast, network congestion, oracle/bridge failure, and illiquidity.
- Require current legal, compliance, treasury, security, risk, operations, and product evidence and named approval.

## Required Reading

Read the canonical Stablecoin Crypto principle hub, the closest enforceable standard, the applicable checklist, and exact target-repository evidence.
## References

- [Stablecoin Crypto principles](../../../principles/stablecoin-crypto/README.md)
- [Templates](../../../templates/README.md)
- [Agents](../../../agents/README.md)

## TODO

Replace assumptions with current jurisdiction-, provider-, asset-, network-, liquidity-, and custody-specific evidence before production use.
