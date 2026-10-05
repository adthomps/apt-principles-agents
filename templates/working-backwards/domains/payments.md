---
title: Working Backwards Profile — Payments
kind: template
domain: execution
status: active
owner: APT
last_updated: 2026-10-04
source_paths: ["apt-principles-agents/templates/working-backwards/domains/payments.md", "apt-commerce/docs/apt/working-backwards/README.md"]
---

# Working Backwards Profile: Payments

For gateways, acquiring, merchant and partner portals, and anything on a money path. Derived from APT Commerce, which runs this method across more than fifty packages.

## When a full package is required

Merchant, partner, payer, or staff workflows; anything that authorizes, captures, refunds, charges, or settles money; stored payment data; data retention or erasure; permissions and roles; anything a design partner would demo.

## Stage guidance

**Press release.** Say exactly what moves money and what is sandbox, test, or simulated. Never imply a capability that does not run end to end.

**External FAQ.** Cover card and personal data handling, what the payer sees, failure and decline behavior, refunds and disputes, switching cost from the current gateway, and differences between partner types.

**Internal FAQ.** Cover PCI scope, PII and retention, processor or vendor agreements (for example a DPA), acquirer versus merchant versus partner authority, fraud and chargeback exposure, and idempotency of every money operation.

**Requirements.** Fail closed: no success state, toast, or status change without provider confirmation. Every money operation is idempotent. Separate "created" from "charged".

**Engineering handoff.** Each slice names its migration or schema change, its validation command, and a demo-honesty check run as the press-release persona.

**Readiness.** Audit logging for money and permission changes, rollback for each money operation, secrets fail closed when unset, and labelled sandbox surfaces.

## Personas and reviewer lenses

Merchant, acquiring partner, ISO, referral partner, ISV, tech partner, internal, and payer from `references/persona-register.json`. Use the payer reviewer for anything the payer sees after checkout.

## Rubric overlay

[payments.rubric.json](payments.rubric.json)
