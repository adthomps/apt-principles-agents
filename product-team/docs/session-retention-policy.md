---
title: APT Product Team Session Retention Policy
kind: operating-guidance
status: active
owner: APT
last_updated: 2026-08-03
domain: product-planning
source_paths: ["apt-principles-agents/product-team/docs/session-retention-policy.md", "apt-principles-agents/product-team/docs/operating-model.md"]
---

# Session Retention Policy

## Purpose

Keep `working-backwards/` useful without turning it into a cluttered backlog, hidden source of truth, or unreviewed publication archive.

## Folder Layout

| Folder | Purpose | Rule |
| --- | --- | --- |
| `working-backwards/active/` | Current planning sessions. | Keep only sessions that are actively being worked. |
| `working-backwards/promotion-candidates/` | Reviewed sessions with reusable or productizable value. | Each session needs a promotion note naming destination and owner. |
| `working-backwards/archive/` | Historical evidence and examples. | Keep only if the session helps explain a decision, pattern, or future cleanup. |

## Retention Rules

- Do not keep abandoned scratch sessions in the root of `working-backwards/`.
- Move inactive sessions to `archive/` unless they are being reviewed for promotion.
- Move a session to `promotion-candidates/` only after unsupported claims, sensitive data, and ownership boundaries have been reviewed.
- Do not promote payment, legal, compliance, customer, partner, or brand-specific claims without source review.
- Delete scratch evidence only after review confirms it has no useful source value.

## Promotion Checklist

- [ ] Source record or origin is known.
- [ ] Customer/problem/outcome framing is clear.
- [ ] Open items and blockers have owners.
- [ ] Unsupported claims are removed or marked.
- [ ] Sensitive data is absent.
- [ ] Destination repo is named.
- [ ] Validation or follow-up owner is named.
