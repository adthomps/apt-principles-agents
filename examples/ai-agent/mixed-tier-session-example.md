---
title: Mixed-Tier Session Example
version: v1
last_updated: 2026-09-06
owner: APT
status: draft
kind: "example"
domain: "ai-agent"
source_paths: ["apt-principles-agents/examples/ai-agent/mixed-tier-session-example.md"]
---

# Mixed-Tier Session Example

## Context

A maintainer asks an agent to find how checkout errors are handled, propose a safer design, then implement a small fix and add a test. The workspace has several child repositories.

## Problem

Using one frontier model for search, design, edits, and tests wastes cost and hides missing direction. Using one small model for the whole path under-reasons the design and still may invent a target repo.

## APT Principles Applied

- Thinking: clarify the owning repository and plan-versus-implement before acting.
- AI: route by task class and smallest sufficient capability.
- Quality: verification is a command or review, not model confidence.

## Solution

```text
Clarify:
  If the owning repo or implement-versus-plan choice is missing, ask one or two
  questions and stop.

Read:
  Deterministic search and Tier 1 capability. Inventory files. Do not escalate
  because later design work will be harder.

Design:
  Tier 2 for a bounded change. Tier 3 only if audiences, payments, or security
  tradeoffs collide.

Implement:
  Tier 2 edits against the approved design. Do not keep the frontier model
  attached just because design used it.

Test:
  Tier 2 targeted verification. Treat command output as evidence.

Review:
  Independent Tier 3 or human review for payment or security impact.
```

## Example Structure

```text
Intent:
Fix checkout error handling in one named repository.

Owner:
Target-repo maintainer.

Inputs:
User request, AGENTS.md, project context, existing tests.

Flow:
Clarify -> Read (Tier 1) -> Design (Tier 2 or 3) -> Implement (Tier 2) -> Test (Tier 2).

Artifacts:
Task packet, routing record per task class, validation command output.

Validation:
Target-repo check or test command. Model confidence is not a pass.

Risks:
One-model-for-everything, invented repo, implementing from an unapproved Working Backwards gap.

Related APT docs:
routing/model-capability-matrix.md, skills/thinking/clarify-before-acting/SKILL.md.
```

## Tradeoffs

Splitting tiers adds a short routing step. The benefit is cheaper reads and an explicit stop when direction is missing.

## Common Mistakes

- Asking a frontier model to grep the tree.
- Drafting requirements because the press release is vague.
- Treating a green explanation as a passing test.

## Related Documents

- `model-routing-decision-example.md`
- `../../routing/model-capability-matrix.md`
- `../../standards/ai/model-routing-standard.md`
- `../../skills/thinking/clarify-before-acting/SKILL.md`
