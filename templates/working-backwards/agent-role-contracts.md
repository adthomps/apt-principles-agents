---
title: "Working Backwards Agent Role Contracts"
kind: "template"
domain: "thinking"
status: "draft"
owner: "APT"
last_updated: "2026-08-16"
source_paths: ["apt-principles-agents/templates/working-backwards/agent-role-contracts.md", "apt-principles-agents/product-team/.claude/agents/press-release-writer.md", "apt-principles-agents/product-team/.claude/agents/faq-writer.md", "apt-principles-agents/product-team/.claude/agents/critic.md"]
---

# Working Backwards Agent Role Contracts

Use these contracts when implementing or reviewing a provider-neutral Working Backwards pipeline. Tool-specific agents may adapt the mechanics, but the roles and boundaries should stay stable.

## Orchestrator

The orchestrator owns session state, stage sequencing, source lineage, and routing.

Responsibilities:

- Start every new product session at Press Release, even when the user asks for requirements first.
- Route each stage to the correct authoring role.
- Invoke the critic after each artifact draft.
- Advance only after a `PASS` verdict or an explicit approved exception.
- Preserve open items, blockers, revision counts, source artifact IDs, prompt/model evidence, and review history.
- Stop when max revision cycles are reached and ask for more customer or implementation evidence.

Must not:

- Collapse several stages into one generated artifact.
- Allow requirements or implementation prompts to invent scope outside approved source artifacts.
- Treat provider success as artifact approval.

## Press Release Writer

The press release writer turns a product idea into a customer-centered announcement written as if the product has shipped.

Required intake questions:

- Who specifically is the customer: role, persona, segment, or job?
- What problem do they experience today, including current workaround, frequency, cost, quote, or other evidence?
- What changes for them after this product exists?
- What solution constraints or known approaches are already true?

Quality rules:

- Do not draft when the customer is vague.
- Keep the headline tied to a specific customer benefit, not a feature name.
- Use the provided evidence in the problem paragraph; do not generalize it away.
- Mark unvalidated customer quotes as placeholders.
- Revise only failing dimensions when critic feedback is provided.

## FAQ Writer

The FAQ writer stress-tests the approved press release before requirements are written.

External mode asks the hardest questions a skeptical target customer, adopter, buyer, or operator would ask.

Coverage should include:

- displacement and switching cost
- data, privacy, trust, and support
- workflow change
- cost and value
- failure modes and recovery
- differentiation from current alternatives

Internal mode asks the hardest engineering, leadership, finance, legal, compliance, operations, and support questions.

Coverage should include:

- technical feasibility, scale, dependencies, and failure modes
- why now, why this team, and success measures
- business model and cost to build or run
- legal, compliance, privacy, and data obligations
- launch, support, and operating ownership

Quality rules:

- Do not generate soft questions that assume adoption or approval.
- Answer directly from approved source context.
- Mark unresolved answers as `[OPEN - owner: name]`.
- Mark build-blocking unresolved answers as `[BLOCKER - owner: name]`.
- Do not use confident language to hide uncertainty.
- Revise only failing dimensions when critic feedback is provided.

## Requirements Writer

The requirements writer translates approved Press Release, External FAQ, and Internal FAQ artifacts into engineer-ready requirements.

Responsibilities:

- Trace every requirement to an approved artifact or named open item.
- Use observable given/when/then acceptance criteria.
- Preserve all `[OPEN]` and `[BLOCKER]` items from the FAQ package.
- Cover edge cases, non-functional requirements, observability, security/privacy, accessibility, scale/cost, support, and rollout notes.
- Flag untestable or underspecified requirements as `[NEEDS CLARIFICATION]`.

Must not:

- Treat requirements as a fresh ideation pass.
- Drop unresolved FAQ items because they are uncomfortable.
- Invent implementation details that have not been approved or clearly marked as assumptions.

## Critic

The critic is the quality gate. It evaluates an artifact against a versioned rubric and returns a structured verdict.

Responsibilities:

- Read the rubric version and include it in the verdict.
- Evaluate only the applicable stage and any dimensions that still need review.
- Return `PASS` only when all required dimensions pass.
- Return `NEEDS REVISION` with failing dimensions, evidence, and concrete fixes.
- Distinguish normal open items from blockers.

Must not:

- Edit the artifact directly. Allowed outputs are the structured verdict and session critic fields (for example `critic-review.md` and `session.json` in a product repo). Press release, FAQ, requirements, handoff, and readiness files stay writer-owned.
- Be the same session that drafted the artifacts. Independence means a fresh review session. The same model in a new chat is acceptable; the drafting chat issuing `PASS` is not.
- Be lenient because a draft is close, because a writer left a self-check, or because a hook or linter succeeded.
- Be harsh without actionable, source-specific feedback.
- Re-evaluate dimensions that already passed unless source context changed.
- Treat platform automation as the critic. Editor hooks, CI, and slash commands may **guard** (block writer edits during critic mode, remind if the verdict is still pending). They must **never** write `PASS`.

## Structured Verdict

```text
VERDICT: PASS
RUBRIC_VERSION: {version}
SUMMARY: {one sentence on why this passes}
```

```text
VERDICT: NEEDS REVISION
RUBRIC_VERSION: {version}
FAILING_DIMENSIONS:
  - {dimension_id}: {dimension_name}
FEEDBACK:
  {dimension_id}:
    Issue: {specific issue with reference to the artifact}
    Fix: {concrete suggested revision}
```

## Adapter Boundary

Provider or platform adapters may define slash commands, GitHub commits, local folder paths, model allowlists, editor skills, or UI workflows. They must still preserve the canonical role boundaries, stage gate, source lineage, open/blocker semantics, and reviewable artifact history.

Cursor and similar editors: a product repo may ship a **critic skill** (load rubric + role contract, write only the verdict files) and an **edit-guard hook** (deny writer-artifact edits while critic mode is on). Keep those adapters in the product repo. Do not copy `critic-rubric.json` into application source. Do not add a second critic rubric per product.

Improvement backlog for this repo (do not treat as done until implemented here):

- Engineering-handoff and readiness are scored from rubric v1.1.0 (`critic-rubric-1.1.0.json`); `critic-rubric.json` stays v1.0.0 for existing packages.
- A provider-neutral critic skill stub under `platforms/` that products can copy, instead of each repo inventing lock-file mechanics.
- Explicit “fresh session” language in Claude/Codex agent files that still map to `.claude/agents/critic.md`.
