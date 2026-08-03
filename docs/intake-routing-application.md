---
title: APT Intake Routing Application
kind: operating-guidance
status: draft
owner: APT
last_updated: 2026-08-03
domain: governance
source_paths: ["apt-principles-agents/docs/intake-routing-application.md", "apt-intake/README.md", "apt-intake/docs/operating-model.md"]
---

# APT Intake Routing Application

## Purpose

Use this guide when applying reusable direction from `../apt-intake` into APT doctrine, planning tools, and product workflows.

`apt-intake` owns the operational front door for unclear, cross-product, customer, partner, support, and operational reports. `apt-principles-agents` owns the reusable doctrine: how APT systems should capture ambiguity, decide ownership, split delivery work, validate outcomes, and avoid duplicate backlogs.

## Canonical Principle

Use the narrowest durable source of truth.

- Known owner: create work directly in the owning repository.
- Unknown owner: create an intake, clarify evidence, then route.
- Multiple owners: keep one intake parent and create native sub-issues in each owning repository.
- No change required: answer, record the decision, and close the intake.

This keeps intake from becoming a second backlog while preserving original context and outcome validation.

## What Belongs Here

Promote intake material into this repo when it becomes reusable across APT projects:

- Ownership decision rules and routing criteria.
- Parent/sub-issue responsibility boundaries.
- Intake lifecycle standards: New, Clarifying, Ready, In progress, Validating, Done.
- Outcome validation and closure criteria.
- Metadata guidance for structured fields vs labels.
- Templates, checklists, prompts, and agent instructions for triage, routing, and cross-repo coordination.
- Portfolio governance patterns that should apply beyond one GitHub project.

## What Stays In `apt-intake`

Keep operational intake material in `apt-intake`:

- Actual intake issues and reported situations.
- Customer, partner, support, or operational evidence for a specific report.
- Organization Project configuration details that are not reusable doctrine.
- Local issue forms, labels, and workflow implementation notes.
- Outcome validation records for specific intake parents.

## Application Targets

| Reusable intake pattern | Canonical destination |
| --- | --- |
| Narrowest durable source-of-truth rule | `principles/execution/` and repo alignment guidance |
| Parent vs delivery sub-issue boundaries | templates, checklists, and product planning guidance |
| Clarify-before-routing workflow | prompts, agents, and Working Backwards templates |
| Outcome validation before closure | release, support, and execution readiness checklists |
| Structured fields over label state machines | governance and repository review guidance |
| Cross-repo parent/sub-issue coordination | product hub, launch readiness, and operations guidance |

## Application Rules

1. Do not turn intake into product planning.
   - Intake decides ownership and captures the reported situation.
   - Product planning turns accepted work into customer problem, outcome, assumptions, constraints, artifacts, and delivery plans.

2. Preserve native ownership.
   - Delivery work belongs in the repo that owns the change.
   - The intake parent should link to native sub-issues instead of absorbing implementation detail.

3. Keep closure evidence-based.
   - Close only after the original outcome is validated, declined, or intentionally deferred with recorded reasoning.
   - Route reusable support or operational knowledge to its owning repository before closure.

4. Prefer structured metadata.
   - Use issue or project fields for type, product, impact, signal, priority, owner, and target date.
   - Reserve labels for exceptional combinable signals such as security review, needs info, partner blocked, or recurring.

5. Feed the planning system.
   - Accepted intake should provide evidence and ownership context to Working Backwards planning.
   - It should not skip customer/problem/outcome framing in `apt-dream-to-reality` or `apt-product-team`.

## Reusable Decision Contract

Every reusable intake routing flow should produce the same minimum decision packet:

- Source context: original report, affected audience, desired outcome, evidence, impact, signal, uncertainty, and sensitive-data note.
- Routing decision: known owner, unknown owner, multiple owners, or no change required.
- Owner boundary: what the intake parent owns, what each delivery repo owns, and what remains out of scope.
- Delivery split: one native sub-issue draft per owning repository, each with scope, acceptance criteria, validation evidence, and outcome relationship.
- Outcome validation: how the original outcome will be checked, who validates it, what evidence closes it, and what residual risk remains.
- Metadata recommendation: type, product, impact, signal, priority, owner, target date, project status, and exceptional labels only.

Use [Intake Routing Decision](../templates/product/intake-routing-decision.md) as the reusable output template.

## Lifecycle Contract

Use Project status or equivalent structured state for lifecycle:

| State | Meaning | Exit requirement |
| --- | --- | --- |
| New | Report captured. | Basic source context is recorded. |
| Clarifying | Evidence, owner, or desired outcome is unclear. | Missing information has an owner or the item is declined. |
| Ready | Owner decision and next action are clear. | Native issue, no-change response, or planning workspace is prepared. |
| In progress | At least one delivery owner is acting. | Delivery sub-issues are complete or explicitly deferred. |
| Validating | Delivery is complete and the original outcome is being checked. | Outcome validation evidence is recorded. |
| Done | Outcome is validated, declined, or deferred with reasoning. | Remaining risks and follow-up owners are recorded. |

Do not reproduce this lifecycle with `status:*` labels. Labels should remain sparse signals for exceptional review or automation.

## Related Repos

- `../apt-intake`: operational intake front door and live parent issue context.
- `../apt-dream-to-reality`: productized planning and delivery handoff flow that should consume accepted intake context.
- `../apt-product-team`: internal planning cockpit that can analyze ambiguous reports and prepare routing or Working Backwards packages.
- `../applied-practical-thinking`: public presentation surface for polished APT operating examples when appropriate.

## Validation

After canonical changes in this repo, run:

```bash
npm run check
```
