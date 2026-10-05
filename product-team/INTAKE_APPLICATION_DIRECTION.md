---
title: "Intake Application Direction"
kind: "guide"
domain: "product-planning"
status: "active"
owner: "APT"
last_updated: "2026-10-04"
source_paths: ["apt-principles-agents/product-team/INTAKE_APPLICATION_DIRECTION.md"]
---

# Intake Application Direction

## Goal

Use `../../apt-intake` as source material for the Product Team planning subsystem without making it the official intake queue.

The Product Team subsystem can help analyze ambiguous reports, prepare Working Backwards sessions, draft owner decisions, and identify what should be promoted within `apt-principles-agents` or productized in `apt-dream-to-reality`. Live operational intake remains in `apt-intake`.

## How To Apply Intake

- Treat intake reports as planning evidence, not as requirements.
- Preserve the original situation, affected audience, impact, signal, evidence, uncertainty, and desired outcome.
- Use Working Backwards to clarify customer/problem/outcome before writing requirements.
- Decide whether work has a known owner, unknown owner, multiple owners, or no required change.
- For multi-owner work, draft repo-scoped sub-issue recommendations instead of one blended implementation plan.
- Use the narrowest durable source of truth: known-owner work goes directly to the owning repo, unknown-owner work stays clarifying, multi-owner work keeps one parent context with native repo-scoped delivery items, and no-change work records the answer or decline reason.
- Preserve closure criteria that validate the original reported outcome, not only completion of planned tasks.
- Feed reusable routing rules, rubrics, prompts, and templates into `apt-principles-agents`.
- Feed productized intake-to-planning behavior into `apt-dream-to-reality`.

## Operating Boundary

The Product Team subsystem may:

- Run internal planning sessions from intake-like context.
- Draft Working Backwards packages for ambiguous ideas.
- Identify gaps in intake routing, evidence quality, or outcome validation.
- Prepare promotion candidates for doctrine, templates, agents, or product behavior.

The Product Team subsystem should not:

- Replace `apt-intake` as the durable issue front door.
- Own delivery status for product repositories.
- Close or validate live intake outcomes unless it is acting through the real intake record.
- Hide canonical routing rules that should live in `apt-principles-agents`.

## Promotion Paths

| Output | Destination |
| --- | --- |
| Reusable intake/routing rules, rubrics, prompts, or templates | Parent `apt-principles-agents` repository |
| Productized intake-to-planning or handoff behavior | `../../apt-dream-to-reality` |
| Live operational parent issue context | `../../apt-intake` |
| Public narrative or proof examples | `../../applied-practical-thinking` |

## Planning Output Contract

Every intake-style planning session should produce:

- Source context: report, audience, desired outcome, evidence, impact, signal, uncertainty, and sensitive-data note.
- Working Backwards framing: customer or operator, problem, current workaround, outcome, constraints, assumptions, and success signal.
- Routing decision draft: known owner, unknown owner, multiple owners, or no change required.
- Repo-scoped sub-issue drafts when multiple owners are involved.
- Open items and blockers with named owners.
- Promotion decision for doctrine, product behavior, live intake work, or public proof.
- Outcome validation method tied to the original reported situation.

Use [templates/output-formats/intake-planning-session.md.template](./templates/output-formats/intake-planning-session.md.template) for this output.

## Practical Session Checklist

- What was reported?
- Who is affected?
- What evidence exists?
- What is still uncertain?
- Is the owner known, unknown, or multi-owner?
- Is a no-change response more accurate than creating work?
- Which repo owns each delivery item?
- What outcome needs validation?
- What would prove the original outcome is validated?
- What should become doctrine, product behavior, live intake work, or public proof?
