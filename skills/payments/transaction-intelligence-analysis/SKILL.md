---
name: transaction-intelligence-analysis
description: Use when work must model the complete transaction lifecycle and explicitly address money movement, tokenization, risk, reconciliation, funding, support, and provider differences.
kind: skill
status: active
owner: APT
last_updated: 2026-08-16
source: consolidated APT guidance
title: "Transaction Intelligence Analysis"
domain: "payments"
source_paths: ["apt-principles-agents/skills/payments/transaction-intelligence-analysis/SKILL.md"]
---

# Transaction Intelligence Analysis

## Purpose

Evaluate whether transaction-derived metrics, rules, models, and recommendations are decision-relevant, traceable, time-correct, appropriately governed, and operationally supportable.

## When to Use

Use for planning, design, implementation review, migration, troubleshooting, or documentation where the task must model the complete transaction lifecycle and explicitly address money movement, tokenization, risk, reconciliation, funding, support, and provider differences.

## Inputs

- Goal, audience, scope, constraints, and success criteria.
- Relevant source files, contracts, examples, logs, and decisions.
- Known risks, assumptions, dependencies, and approval boundaries.

## Process

1. Define the supported decision, audience, action, expected value, error costs, and required review or appeal path.
2. Trace transaction events and fields through normalization, enrichment, feature calculation, rules/models, aggregation, and presentation.
3. Test lifecycle semantics, point-in-time correctness, retries, reversals, refunds, disputes, currencies, missing data, late data, and provider differences.
4. Separate observed facts, provider signals, deterministic features, statistical estimates, and recommendations in outputs and explanations.
5. Evaluate completeness, freshness, drift, calibration or rule precision, false positives/negatives, segment performance, privacy, retention, access, and operational cost.
6. Produce a decision-readiness verdict with unsupported claims, material gaps, monitoring thresholds, review controls, owners, and retirement conditions.

## Outputs

A use-case contract, event/feature lineage, metric dictionary, quality and segment evaluation, explanation/control review, monitoring plan, and decision-readiness verdict.

## Quality Bar

The output is practical, source-backed, audience-aware, testable, reversible where possible, and does not state assumptions as facts.

## Domain Checklist

- Tie every metric, rule, score, or recommendation to a named decision, audience, action, benefit, and error cost.
- Verify lifecycle-aware counting for retries, partials, reversals, refunds, disputes, settlement, and multi-currency activity.
- Preserve point-in-time lineage from source event through features and output; detect leakage and stale enrichment.
- Distinguish facts, provider labels, deterministic derivations, estimates, and recommendations in both data and UI.
- Measure freshness, completeness, drift, false positives/negatives, and performance across relevant segments.
- Require proportional explanation, human review, override/appeal, access, retention, monitoring, and retirement controls.

## Required Reading

Read the canonical Payments principle hub, the closest enforceable standard, the applicable checklist, and exact target-repository evidence.
## References

- [Payments principles](../../../principles/payments/README.md)
- [Templates](../../../templates/README.md)
- [Agents](../../../agents/README.md)
