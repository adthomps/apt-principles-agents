---
title: APT Product Team Next-Level Decision
kind: decision
status: active
owner: APT
last_updated: 2026-08-03
domain: product-planning
source_paths: ["apt-principles-agents/product-team/docs/next-level-decision.md", "apt-principles-agents/product-team/docs/formalization-direction.md", "apt-principles-agents/product-team/docs/session-retention-policy.md"]
---

# Next-Level Decision

## Decision

Keep the Product Team workflow as an internal subsystem at `apt-principles-agents/product-team/`, versioned with the canonical repository.

Do not treat it as a separate top-level workspace project or agent-platform consumer. Shared repository history does not turn this subsystem into canonical doctrine, live intake, public proof, or the polished Dream to Reality product.

## Why

- The folder is an internal planning cockpit, not a product runtime.
- Current value comes from fast Claude Code sessions, templates, rubrics, and promotion
  decisions.
- Canonical reusable material and the subsystem share `apt-principles-agents`; productized behavior belongs to `../../apt-dream-to-reality`.
- The former standalone Git history is preserved separately; the files in this subsystem are versioned by the parent repository.

## Current Next Level

- Keep repeatable subsystem validation with `scripts/validate-local.ps1`.
- Keep active sessions empty unless a session is actually in progress.
- Keep useful historical examples in `working-backwards/archive/`.
- Promote only reviewed, owner-scoped material through `working-backwards/promotion-candidates/`.

## Session Review

| Session | Decision | Rationale |
| --- | --- | --- |
| `wb-20260308-220005` | Delete | Incomplete scratch session with no artifact value and a risky payment-network-rule premise. |
| `wb-20260308-222110` | Keep archived | Useful Working Backwards example, but not promotion-ready because it contains Visa/VAP-specific claims and placeholders requiring source review. |

## Validation

Run from the parent repository:

```powershell
.\product-team\scripts\validate-local.ps1
```

Use `-Strict` when the cockpit should have no active sessions.
