---
title: Plan Gates Block
kind: guide
domain: documentation
status: active
owner: APT
last_updated: 2026-08-30
source_paths: ["apt-principles-agents/docs/plan-gates.md"]
---

# Plan Gates Block

A machine-readable block a plan file carries so review orchestration is
deterministic instead of inferred. Both `/edi` and `scripts/run-council.mjs`
read it.

## Shape

````markdown
## Gates

```yaml
required_agents: [apt-security-reviewer, glyph, apt-verifier]
acceptance:
  - npm run apt:validate
  - npm test
rollback: "revert <commit>; redeploy the previous worker version"
```
````

- `required_agents` — agent ids (as in `references/agent-catalog.json`) that must
  review the change before it is considered done. The orchestrator may add more
  from the diff; it may not drop these.
- `acceptance` — commands that must pass during the Verify stage. Prefer the
  target repo's own `validation` entries from `workspace-consumers.json`.
- `rollback` — a real, executable path back to the prior state. "Not applicable"
  is only valid for changes that cannot affect a running system.

## Rules

- Every id in `required_agents` must resolve in `agent-catalog.json`.
- A change that touches an enforceable domain (security-risk, payments, api,
  architecture, ai, ecommerce) with no matching `required_agents` entry is a gap
  the orchestrator flags, not a pass.
- The block is advisory context for a human; it does not itself approve anything.
