---
title: APT Product Team Operating Model
kind: operating-guidance
status: active
owner: APT
last_updated: 2026-08-03
domain: product-planning
source_paths: ["apt-principles-agents/product-team/docs/operating-model.md", "apt-principles-agents/product-team/README.md", "apt-principles-agents/product-team/INTAKE_APPLICATION_DIRECTION.md"]
---

# Operating Model

## Core Rule

Use the Product Team subsystem to think before productizing, not to become another source of truth.

The folder may hold messy internal planning evidence, but durable doctrine, product behavior, operational intake, and public proof must be promoted to their owning repositories.

## Planning Flow

```text
Capture context -> Frame customer/problem/outcome -> Draft Working Backwards artifact
-> Critic review -> Revise or pause for evidence -> Decide promotion path
```

## Session Types

| Session type | Use when | Output |
| --- | --- | --- |
| Working Backwards | A product idea needs customer-first framing before requirements. | Press release, FAQ, requirements, open/blocker list. |
| Intake planning | A report is ambiguous, cross-product, support-driven, or owner-unclear. | Intake planning session, routing decision draft, repo-scoped sub-issue drafts. |
| Doctrine extraction | A repeated planning rule should become reusable. | Promotion note for the parent `apt-principles-agents` repository. |
| Productization planning | A cockpit behavior should become part of the app. | Issue or contract draft for `../../apt-dream-to-reality`. |

## Stage Gates

1. **Capture:** Source, audience, evidence, uncertainty, sensitive-data note, and desired outcome are recorded.
2. **Frame:** Customer or operator, problem, current workaround, constraints, assumptions, and success signal are clear.
3. **Draft:** Writer produces the stage artifact from evidence only.
4. **Critique:** Critic evaluates against a rubric and returns pass, revision, or blocked.
5. **Decide:** The session records whether the material stays local, becomes canonical doctrine, becomes product behavior, goes to live intake, or becomes public proof.

## Persistence Model

Persistence means where session history and stage artifacts are durably stored.

- Current persistence is local files under `working-backwards/`.
- This subsystem shares the parent `apt-principles-agents` repository history and review workflow.
- Productized persistence belongs in `../../apt-dream-to-reality`, where app-backed projects, revisions, approvals, and delivery handoffs live.

Do not automatically publish or create GitHub issues from planning sessions; live issues require explicit approval and an owning repository.

## Issue Model

This cockpit may draft issues for owning repositories. It should not create live issues by default.

Issue creation can be added later when:

- GitHub authentication is explicit;
- the owning repository is clear;
- the user approves live issue creation;
- intake parent vs delivery sub-issue boundaries are preserved.

## Local Session Records

Session folders under `working-backwards/` are internal evidence. They may include placeholders, unverified claims, draft product names, and incomplete stages.

Use the session retention policy:

- `working-backwards/active/` for current sessions.
- `working-backwards/promotion-candidates/` for reviewed sessions that may be promoted.
- `working-backwards/archive/` for historical evidence.

Before promotion:

- verify source evidence;
- remove or mark unsupported claims;
- preserve open items and blockers;
- confirm owner and destination;
- avoid copying payment, legal, compliance, customer, or brand claims without review.

## Completion Standard

A planning session is complete when it has one of these dispositions:

- promoted to canonical APT assets;
- productized as a Dream-to-Reality issue or contract;
- routed to live intake;
- archived locally as evidence;
- declined with rationale.

Completion is not the same as implementation. Delivery remains with the owning repository.
