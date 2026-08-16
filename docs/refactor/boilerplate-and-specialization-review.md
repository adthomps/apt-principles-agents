---
title: Boilerplate And Specialization Review
kind: assessment
domain: refactor
status: active
owner: APT
last_updated: 2026-08-16
visibility: internal
source_paths: ["apt-principles-agents/references/content-specialization-baseline.json", "apt-principles-agents/scripts/validate-content-specialization.mjs"]
---

# Boilerplate And Specialization Review

## Outcome

The repository has substantial repeated contract language, but the reviewed active corpus contains no exact normalized-body duplicates across canonical skills, agents, principles, and prompts. Deleting files by similarity would therefore remove distinct names, links, provenance, or domain deltas without first proving consumer parity.

The actionable problem is thin specialization: many independently consumable artifacts repeat a valid portable contract but provide too little guidance that changes the procedure, judgment, evidence, or approval behavior for their named topic.

## Verified Baseline

The audit covers 414 canonical assets. Platform adapters remain outside this baseline because their tool-native metadata, discovery rules, and distribution behavior require a separate parity test.

| Family | Files | Shared-core family | Thin specialization | Interpretation |
|---|---:|---:|---:|---|
| Skills | 142 | 93 | 30 | The final thin-principle batch replaced six generic skill procedures; 30 shared-core skills still lack a substantive topic-specific domain-checklist bullet. |
| Agents | 75 | 52 | 50 | Two API agents now have explicit perspective-specific checks; most shared-core roles still differ mainly through name, trigger, or required-skill link. |
| Principles | 123 | 85 | 0 | Every previously thin shared-core principle now has substantive topic guidance; the thin-principle queue is complete. |
| Prompts | 74 | 38 | 36 | The API and repository audit prompts now have task-specific requirements; most shared-core prompts remain title-swapped execution shells. |

Exact normalized-body duplicate groups: **0**.

The canonical baseline is `references/content-specialization-baseline.json`. `npm run validate:specialization` compares both counts and hashes of the reviewed thin-path sets, so additions, removals, or substitutions require an intentional baseline review rather than silently increasing generic content.

## Classification

### Required contract repetition

Headings, safety boundaries, evidence rules, output contracts, and escalation semantics often need to travel with an independently installed skill or agent. This repetition supports selective loading and must not be removed until downstream installation can reliably include a shared contract.

### Domain-family repetition

API, payments, modernization, documentation, and other families repeat common decision and evidence models. These blocks are candidates for authored family contracts or generation, but only after a pilot proves that installed assets remain self-contained and provider-compatible.

### Thin specialization

An artifact is thin when its shared contract is intact but its named topic does not materially change the checks, evidence, process, failure modes, output, or approval behavior. A changed title, frontmatter value, provenance path, or generic “treat this as a decision” bullet is not sufficient specialization.

### Adapter duplication

Platform source and distribution copies need source hashes, generated markers, parity checks, and handwritten-extension boundaries before consolidation. This review does not classify them as safe deletion candidates.

## Implemented Pilot

- Added perspective-specific checks to the API reviewer and API migration planner.
- Added task-specific requirements to the API audit and repository audit prompts.
- Replaced generic process/checklist guidance in practical thinking and problem framing, intent-based design and UI design, agent design and routing, and security data handling and review.
- Replaced generic or misplaced guidance in AI skill design/authoring, local-model routing, modern API design, and service escalation; the skill-authoring checklist no longer contains an unrelated API credential lifecycle rule.
- Strengthened human- and agent-consumable APIs, UI/API alignment, AI and API examples, audience-layered documentation, implementation blueprints, migration guides, and Product Hubs for public evidence and downstream adoption.
- Strengthened skill and agent authoring guidance so self-contained contracts must include material topic or perspective deltas.
- Added a specialization validator and included it in `npm run check`.
- Established a hash-backed ratchet baseline; it must move downward through reviewed enrichment or retirement, not upward to accommodate generic additions.

## Priority Sequence

1. Enrich the remaining 30 thin skills in bounded domain batches, beginning with modernization contract testing/planning and payment acceptance/risk procedures that have direct operational consequences.
2. Consolidate or enrich overlapping accountable agents, starting with core leadership, customer/audience reviewers, API, security, and documentation roles.
3. Replace title-swapped prompts with task-specific requirements or a smaller parameterized prompt family only after consumers and manifests are mapped.
4. Pilot shared-core generation across one canonical skill, one agent mapping, and one platform adapter; require byte-stable regeneration, source attribution, tool compatibility, and rollback evidence.

## Archive And Deletion Decision

No active canonical skill, agent, principle, or prompt is safe to delete solely from this review. There are no exact body duplicates, and the assets may be independently linked, installed, routed, or consumed. A future deletion requires consumer and manifest evidence, an authoritative replacement, migrated unique deltas and provenance, link updates, adapter parity, and a passing repository check.

Archived consolidation evidence should remain because it records original-source fidelity and migration decisions. Generated copies may be deleted only after their source and deterministic regeneration command are verified.
