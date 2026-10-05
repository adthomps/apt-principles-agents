---
title: ADR — EDI Runtime Architecture and Reconciliation Mechanism
kind: decision-record
status: active
decision_status: accepted
owner: Adam
last_updated: 2026-08-30
source: apt-principles-agents/product-team working-backwards session wb-20260829-edi
domain: "decision-records"
source_paths: ["apt-principles-agents/product-team/working-backwards/active/wb-20260829-edi/adr-edi-architecture.md"]
---

# ADR — EDI Runtime Architecture and Reconciliation Mechanism

## Purpose And Decision

- Owner: Adam
- Date: 2026-08-30
- Status: Accepted
- Intended outcome: Resolve the 3 architecture BLOCKERs surfaced in `faq-internal.md` (runtime, reconciliation, selection) so Stage 3 (Requirements) can be written against a settled design rather than open questions.
- Audiences: Adam (sole owner/operator); any future contributor extending EDI or the persona/review-council system it orchestrates.
- Decision or deliverable: EDI ships as a Skill/slash-command (`/edi`) running in Adam's main Claude Code session, using Claude Code's native Task tool to invoke specialists, an LLM catalog-read for specialist selection, and a two-step escalation-gate-then-LLM-synthesis reconciliation mechanism, with mandatory transparency (consulted-specialist list + rationale) on every response.

## Current State And Evidence

- Verified facts: a grep across all `platforms/claude/source/agents/*.md` frontmatter found only two `tools:` value-sets workspace-wide (`[read, search, edit, execute, todo]` and `[read, search, execute, todo]`) — no agent declares any capability to invoke another agent. `agents/core/apt-router.md` and `apt-principal.md` are leaf review-council files (return Perspective/Concerns/Recommended changes/Risks/Questions/Approval status and stop); `agents/harness/apt-router.md` builds task packets scoped to the install/discover/classify/validate/remediate/verify/approve lifecycle, not specialist selection. The 50-file stub-content fix (2026-08-29) gave every agent a real "When to Use" statement, which is the raw material the selection mechanism reads.
- Source references: `apt-principles-agents/product-team/working-backwards/active/wb-20260829-edi/{press-release.md, faq-external.md, faq-internal.md}`; `apt-principles-agents/docs/distribution/AGENT-CATALOG.md`; `apt-principles-agents/agents/core/apt-principal.md`.
- Constraints and dependencies: every existing agent's Escalation Rules ("Escalate unsupported payment, security, privacy, compliance, legal, production-launch, or irreversible migration decisions to the accountable human") — EDI inherits this boundary unchanged; it recommends, it does not auto-approve.
- Assumptions requiring validation: that a single LLM catalog-read scales acceptably in latency/cost as the roster grows well past 85 agents (no measurement taken yet; flagged as a deferred open item in `faq-external.md`, not blocking).

## Proposed Approach

EDI is implemented as a Skill (`/edi`) rather than a new agent-file type or a standalone script, because orchestration (invoking other agents and synthesizing their output) is not a capability any current agent declares, and the only place that capability already exists is the top-level Claude Code session via its native Task tool. Concretely, per request:

1. **Selection** — EDI feeds the full `AGENT-CATALOG.md` (title + "When to Use" + domain per agent) to one LLM call, which selects the relevant specialist subset for the plain-language request. No structured input required from Adam.
2. **Invocation** — EDI invokes each selected specialist via the Task tool, exactly as Adam's main session already invokes any subagent today.
3. **Reconciliation** — EDI checks whether any specialist's concern matches an existing hard escalation rule. If so, EDI does not attempt to resolve it — it surfaces the conflict to Adam directly. Otherwise, EDI performs one LLM synthesis pass over the specialists' raw output, weighing evidence and risk per `apt-principal.md`'s existing principle, and writes the final verdict (approved / approved with conditions / not approved).
4. **Transparency** — every response opens with which specialists were consulted and why (brief selection rationale), followed by the synthesis, so Adam can spot-check against raw specialist output without a separate request.

## Required Detail

- Implementation plan: build `/edi` as a Skill under `apt-principles-agents`'s skill-authoring convention (see `docs/skill-authoring-guide.md`), reading `AGENT-CATALOG.md` at invocation time rather than embedding a static roster.
- Acceptance criteria: for a sample of real multi-specialist requests, EDI's synthesized answer matches what Adam would conclude by manually invoking and reconciling the same specialists himself, in less wall-clock time than doing it by hand (the agreed success metric from `faq-internal.md`).
- Validation matrix / release record / runbook / support handoff: not yet written — deferred to Stage 3 (Requirements), which this ADR unblocks.

## Risks And Alternatives

- Alternatives considered: (a) a deterministic Node script (`apt-assets.mjs`-style) doing keyword/domain matching plus headless `claude -p` invocations — rejected as more brittle to maintain than reading the catalog live, and still needs an LLM reconciliation step; (b) a single generalist agent reasoning over the whole 85+ catalog as context in one pass rather than literally invoking specialists — rejected because it would silently drop the actual specialist perspectives EDI exists to preserve and surface.
- Tradeoffs: an LLM call for both selection and (conditionally) reconciliation means added latency/cost per request, and a bad classification is a real failure mode — mitigated, not eliminated, by mandatory transparency.
- Security/compliance considerations: none beyond the inherited escalation-rule boundary; single-owner internal tool, no external regulatory exposure.
- Migration and support impact: none — no change to how the underlying 85+ agents work; only how Adam reaches them.
- Open questions (deferred, non-blocking): token/latency cost at scale past 85 agents; measured single- vs multi-specialist request mix (`faq-external.md` open item).

## Validation And Approval

- Acceptance criteria: see Required Detail above.
- Tests or review evidence: this ADR resolves all 3 BLOCKER items and the success-metric OPEN item from `faq-internal.md`, and 2 of 3 remaining OPEN items from `faq-external.md`, via `AskUserQuestion` decisions made directly by Adam on 2026-08-30.
- Rollout and rollback: N/A pre-implementation.
- Approval owner and status: Adam — Accepted, 2026-08-30.
