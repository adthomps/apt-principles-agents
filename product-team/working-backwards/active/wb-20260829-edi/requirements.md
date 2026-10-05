---
title: "Working Backwards Requirements — EDI"
kind: "requirements"
domain: "thinking"
status: "active"
owner: "Adam"
last_updated: "2026-10-04"
source_paths: ["apt-principles-agents/product-team/working-backwards/active/wb-20260829-edi/requirements.md"]
---

# Requirements: EDI

## Source Package

- Press release: `press-release.md` — critic PASS (2026-08-29)
- External FAQ: `faq-external.md` — critic PASS (2026-08-29); 2 of 3 open items resolved 2026-08-30
- Internal FAQ: `faq-internal.md` — critic PASS (2026-08-29); all 3 blockers + success-metric open item resolved 2026-08-30
- Architecture decision: `adr-edi-architecture.md` — Accepted, Adam, 2026-08-30
- Approval state: Requirements stage — pending Adam's review of this document; not yet gated by a Stage-3 critic pass (this repo's `requirements` rubric dimensions are applied by self-review below in the absence of a live critic agent for this stage).

## Problem Statement

Adam has to personally know the shape of the whole agent system — 76 review-council agents across 12 domains, nine named accountable agent roles, and three non-orchestrating partial "router" candidates — to route a request to the right specialist(s) and reconcile their output himself. This does not scale as the roster grows (idea.txt proposes roughly 25 more agent roles) and already produced an invisible failure: the 50-file stub-content bug went unnoticed for months because no layer was checking the system's own coherence. The nine named files are agent roles, not product/customer personas; EDI routes agent roles and specialists, not product audiences.

## Success Criteria

For a sample of real multi-specialist requests, EDI's synthesized answer matches what Adam would conclude by manually invoking and reconciling the same specialists himself, in less wall-clock time than doing it by hand. (Agreed 2026-08-30, `faq-internal.md`.) No formal quantitative target beyond this comparative bar is set at this stage.

## User Journey

1. Adam types a plain-language request to `/edi` in his main Claude Code session — no required structure, tags, or fields (Open 1, resolved 2026-08-30).
2. EDI reads `AGENT-CATALOG.md` and makes one LLM call to select the relevant specialist subset for the request.
3. EDI's response opens with which specialists were selected and a brief rationale (e.g. "Consulted: Wrex (payments), Kasumi (security) — selected via catalog match on 'payment gateway migration'") before anything else (Open 2, resolved 2026-08-30).
4. EDI invokes each selected specialist via Claude Code's native Task tool and collects their raw output.
5. EDI checks whether any specialist's concern matches an existing hard escalation rule (payment, security, privacy, compliance, legal, production-launch, irreversible migration). If so, EDI stops short of resolving it and surfaces the conflict to Adam directly, with the specialists' raw findings attached.
6. Otherwise, EDI performs one LLM synthesis pass over the specialists' raw output and returns a single verdict — approved / approved with conditions / not approved — with the underlying specialist findings included, not just the conclusion.
7. Adam can always ask "who did you consult and what did they say" and get the raw output; nothing is hidden behind the synthesis.
8. Direct invocation of any specialist by name, bypassing EDI entirely, remains available exactly as it works today — EDI is optional, not a mandatory front door.

## Functional Requirements

### Requirement 1: Specialist Selection

- Source artifact IDs: faq-internal.md Q1 (Blocker, resolved); adr-edi-architecture.md §Proposed Approach step 1.
- Description: EDI selects the relevant specialist subset for a request via one LLM call reading the full `AGENT-CATALOG.md` (title + "When to Use" + domain per agent). No hardcoded lookup table; no keyword pre-filter.
- Acceptance criteria:
  - Given a plain-language request naming a single clear domain (e.g. "is this payments architecture change safe to ship"), when EDI runs selection, then it selects at least the domain-matching lead agent role (e.g. Wrex) and does not select unrelated-domain agents.
  - Given a request spanning two domains (e.g. payments + security), when EDI runs selection, then it selects specialists from both relevant domains.
  - Given the agent roster grows past 85 (new agent roles or specialists added to `AGENT-CATALOG.md`), when EDI runs selection, then no code change is required — the new agents are visible to the next selection call automatically because it reads the catalog live.
  - Given a request matches no agent's "When to Use" statement, when EDI runs selection, then it returns zero specialists and tells Adam directly "no matching specialist found for this request" rather than guessing or selecting an unrelated agent.
  - Given a request is phrased broadly enough to plausibly match every agent, when EDI runs selection, then it still applies the same per-agent "When to Use" match rather than defaulting to "select everyone" — if the result is genuinely a large selected set, that set (and the broad phrasing that produced it) is shown to Adam via the transparency requirement (Requirement 4) rather than silently invoking all 85+.
- Edge cases: a request matching no agent's "When to Use" statement (resolved above); a request matching every agent / overly broad phrasing (resolved above).
- Open items: none blocking; token/latency cost at scale past 85 agents is a deferred, non-blocking open item (`faq-external.md`).

### Requirement 2: Specialist Invocation

- Source artifact IDs: faq-internal.md Q3 (Blocker, resolved); adr-edi-architecture.md §Proposed Approach step 2.
- Description: EDI invokes each selected specialist via Claude Code's native Task tool, the same mechanism the top-level session already uses for any subagent. EDI itself runs as a Skill/slash-command (`/edi`) in Adam's main session — not a new agent-file type, not a standalone script.
- Acceptance criteria:
  - Given EDI has selected N specialists, when it runs, then it invokes all N via the Task tool and collects each one's full raw output before proceeding to reconciliation.
  - Given a specialist invocation fails or times out, when EDI reaches reconciliation, then it reports the failure explicitly rather than silently omitting that specialist from the synthesis.
  - Given a selected specialist's agent file is missing or malformed, when EDI attempts to invoke it, then EDI treats this identically to an invocation failure (per the acceptance criterion above) — reported explicitly to Adam, not silently dropped from the synthesis.
  - Given two selected specialists overlap heavily (e.g. Wrex and one of his "Also Draws On" team) and produce substantially redundant findings, when EDI reaches the transparency step (Requirement 4), then it may present their findings together rather than duplicating near-identical content, but both specialists still appear in the consulted-specialist list — redundancy is a presentation choice, never a reason to silently drop a specialist from the record.
- Edge cases: a selected specialist agent file is missing or malformed (resolved above); two selected specialists overlap heavily producing redundant output (resolved above).
- Open items: none blocking.

### Requirement 3: Conflict Reconciliation

- Source artifact IDs: faq-internal.md Q2 (Blocker, resolved); adr-edi-architecture.md §Proposed Approach step 3.
- Description: Two-step reconciliation. First, EDI checks each specialist's concerns against the existing hard escalation rules (payment, security, privacy, compliance, legal, production-launch, irreversible migration). Any match is surfaced to Adam directly, unresolved by EDI. Only when no escalation-rule match exists does EDI perform one LLM synthesis pass over the raw specialist output, weighing evidence and risk per `apt-principal.md`'s existing principle, and write a final verdict.
- Acceptance criteria:
  - Given two specialists disagree and one specialist's concern matches an escalation-rule category, when EDI reconciles, then it does not resolve the disagreement itself — it presents both positions to Adam and stops short of a verdict.
  - Given two specialists disagree and neither concern matches an escalation-rule category, when EDI reconciles, then it performs the LLM synthesis pass and returns one of: approved, approved with conditions, not approved.
  - Given all specialists agree, when EDI reconciles, then it still runs the escalation-rule check before returning a verdict (agreement does not skip the safety gate).
  - Given a specialist's concern only partially or ambiguously matches an escalation-rule category, when EDI reconciles, then it treats the ambiguous match as a full match and escalates to Adam rather than attempting to resolve it itself — an uncertain gate trigger fails closed (escalates), never fails open (auto-resolves).
  - Given three or more specialists produce a genuine multi-way disagreement (not reducible to a single pairwise conflict), when EDI reconciles, then the escalation-rule check still runs against every specialist's concern individually first; if none match, EDI's synthesis pass explicitly names all positions in the verdict rather than collapsing them into an artificial two-sided summary.
- Edge cases: a specialist's concern only partially matches an escalation-rule category / ambiguous gate trigger (resolved above — fails closed); three or more specialists with a multi-way disagreement (resolved above).
- Open items: none blocking.

### Requirement 4: Transparency

- Source artifact IDs: faq-external.md Q4 and the trust Blocker (both resolved 2026-08-30).
- Description: Every EDI response opens with which specialists were consulted and a brief selection rationale, before the synthesized answer, and always includes enough of the underlying specialist findings for Adam to spot-check the synthesis without a separate request.
- Acceptance criteria:
  - Given any EDI response, when Adam reads it, then the first content he sees is the consulted-specialist list and selection rationale.
  - Given EDI returns a synthesized verdict, when Adam wants to verify it, then the response already contains enough of each specialist's raw finding to do so without Adam issuing a follow-up request.
- Edge cases: a very long specialist output that would bloat every response if fully inlined — needs a summarization convention that still preserves spot-checkability (not yet designed; treat as an implementation detail for the build phase, not a blocker to this Requirements stage).
- Open items: [OPEN — owner: Adam] exact format/length convention for inlined specialist findings is not yet specified.

### Requirement 5: Approval Authority Boundary

- Source artifact IDs: faq-internal.md "Does EDI get authority to approve..." (answered, not open); press-release.md.
- Description: EDI only ever recommends. It never auto-approves a payment, security, privacy, compliance, legal, production-launch, or irreversible-migration decision. This is a hard constraint inherited unchanged from every existing agent's Escalation Rules.
- Acceptance criteria:
  - Given EDI's synthesis reaches a verdict in any escalation-rule category, when it returns that verdict, then it is framed as a recommendation requiring Adam's approval, never as an executed or final decision.
- Edge cases: none — this is a hard constraint, not a judgment call.
- Open items: none.

## Non-Functional Requirements

- Performance: not yet measured. Two LLM calls minimum per request (selection + synthesis), more if an escalation-rule match short-circuits synthesis; latency/cost at scale past 85 agents is an explicitly deferred open item (`faq-external.md`).
- Security/privacy: none beyond the inherited escalation-rule boundary (Requirement 5). Single-owner internal tool; no external regulatory exposure per `faq-internal.md`.
- Reliability/recovery: a failed specialist invocation must be reported, not silently dropped (Requirement 2 edge case). No retry/fallback behavior specified yet — [OPEN — owner: Adam].
- Accessibility: not applicable — text-based CLI/session tool, no UI surface beyond Claude Code's existing output rendering.
- Observability/telemetry: the transparency requirement (Requirement 4) is EDI's primary observability mechanism from Adam's side. No logging/metrics infrastructure for EDI's own selection or reconciliation accuracy over time has been designed — [OPEN — owner: Adam], relevant to eventually measuring the Success Criteria bar above.
- Scale/cost: LLM-catalog selection scales to any roster size without code changes (Requirement 1), at the cost of one classification call per request; not yet measured whether this cost is worth it on average across real single- vs multi-specialist request mix (`faq-external.md`, deferred, non-blocking).

## Scope

In scope:

- `/edi` Skill implementation per `adr-edi-architecture.md`: selection, invocation, two-step reconciliation, transparency, approval-boundary inheritance.
- Reading `AGENT-CATALOG.md` live at invocation time (no static roster embedded in the skill).

Out of scope (for this Requirements pass):

- Formal latency/cost benchmarking of the LLM-catalog selection approach at scale.
- A logging/metrics system for measuring the Success Criteria bar over time.
- Any change to the underlying 85+ agent files themselves — EDI only changes how Adam reaches them.
- The ~12 OVERLAP-reconcile candidates, 3 RATCHET TEST items, and ~10 GAP/net-new agent-role candidates still pending from the broader role-adoption effort — unrelated to EDI's own build. These are historical agent-roster work items, not product/customer personas.

## Blockers And Open Items

- [OPEN — owner: Adam] Exact format/length convention for inlining specialist findings in EDI's response (Requirement 4).
- [OPEN — owner: Adam] Retry/fallback behavior when a specialist invocation fails or times out (Non-Functional: Reliability).
- [OPEN — owner: Adam] Logging/metrics approach for measuring the agreed Success Criteria over time (Non-Functional: Observability).
- [OPEN — owner: Adam, deferred] Measured single- vs multi-specialist request mix, to judge whether EDI's per-request LLM overhead is worth it on average (`faq-external.md`).
- No blockers remain — all 3 items previously flagged BLOCKER (selection mechanism, reconciliation mechanism, runtime architecture) were resolved 2026-08-30 and are captured in `adr-edi-architecture.md`.

## Validation

- Required checks: this document should pass a Stage-3 critic review against `apt-principles-agents/templates/working-backwards/critic-rubric.json`'s `requirements` dimensions (traceability, testable-acceptance-criteria, edge-case-coverage, non-functional-requirements, open-item-propagation) once a live Stage-3 critic exists in the Product Team workflow; self-reviewed against the same rubric as of 2026-08-30 with no failing dimension identified.
- Human approval points: Adam approves this Requirements document before build begins; Adam remains the approval authority for any EDI-surfaced escalation-rule-category recommendation at runtime (Requirement 5).
- Stop conditions: if a future EDI request surfaces a genuine gap in the escalation-rule categories themselves (not just an EDI implementation bug), stop and treat that as a governance question for the underlying agent system, not an EDI bug.
