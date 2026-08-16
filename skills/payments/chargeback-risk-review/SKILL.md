---
name: chargeback-risk-review
description: Use when reviewing chargeback exposure, reason categories, prevention, alerts, evidence, representment economics, deadlines, ownership, and customer remediation.
kind: skill
status: active
owner: APT
last_updated: 2026-08-16
source: consolidated APT guidance
title: "Chargeback Risk Review"
domain: "payments"
source_paths: ["apt-principles-agents/skills/payments/chargeback-risk-review/SKILL.md"]
---

# Chargeback Risk Review

## Purpose

Assess chargeback exposure and controls from transaction and fulfillment evidence through inquiry, alert, dispute, representment, loss, recovery, and prevention feedback.

## When to Use

Use for product launches, payment-flow changes, fraud/risk tuning, dispute-operation design, provider migration, merchant monitoring, or investigation of elevated chargebacks and avoidable customer disputes.

## Inputs

- Goal, audience, scope, constraints, and success criteria.
- Relevant source files, contracts, examples, logs, and decisions.
- Known risks, assumptions, dependencies, and approval boundaries.

## Process

1. Define merchant entities, products, channels, geographies, providers, networks, time window, dispute stages, and authoritative reason/deadline sources.
2. Reconcile transactions, authentication, authorization, fulfillment, delivery, cancellation/refund, support contact, alert, dispute, representment, and financial outcome.
3. Segment exposure by fraud, authorization, processing, consumer dispute, fulfillment, subscription, credit-not-processed, and evidence-quality drivers without assuming reason codes equal root cause.
4. Review prevention and remediation across descriptors, receipts, cancellation, refunds, customer service, authentication, fraud controls, alerts, evidence capture, and representment workflow.
5. Evaluate win rate together with amount, fees, labor, deadlines, customer harm, monitoring-program exposure, and prevention opportunity.
6. Produce root-cause hypotheses with confidence, control gaps, economic priorities, owners, deadlines, evidence retention, monitoring, and approval needs.

## Outputs

A chargeback lifecycle map, reconciled exposure analysis, reason/root-cause segmentation, prevention and evidence assessment, representment economics, action plan, and monitoring thresholds.

## Quality Bar

The output is practical, source-backed, audience-aware, testable, reversible where possible, and does not state assumptions as facts.

## Domain Checklist

- Reconcile transaction, authentication, fulfillment, refund, support, alert, dispute, representment, and financial outcome records.
- Use current provider/network reason categories and deadlines while distinguishing coded reason from verified root cause.
- Segment fraud, authorization, processing, fulfillment, subscription, customer-service, and credit-not-processed drivers.
- Assess descriptors, receipts, cancellation/refund paths, support responsiveness, authentication, fraud controls, and evidence capture.
- Evaluate representment by amount, fees, labor, deadline, evidence strength, customer impact, and expected recovery—not win rate alone.
- Assign prevention, operations, finance, support, compliance, monitoring, and evidence-retention ownership.

## Required Reading

Read the canonical Payments principle hub, the closest enforceable standard, the applicable checklist, and exact target-repository evidence.
## References

- [Payments principles](../../../principles/payments/README.md)
- [Templates](../../../templates/README.md)
- [Agents](../../../agents/README.md)
