---
title: Content Lifecycle And Publication Plan
kind: assessment
domain: refactor
status: active
owner: APT
last_updated: 2026-08-16
visibility: internal
source_paths: ["apt-principles-agents/docs/refactor/content-lifecycle-and-publication-plan.md"]
---

# Content Lifecycle And Publication Plan

## Goal

Reduce maintenance and navigation cost without deleting unique doctrine, provenance, or reusable project guidance. Publication cleanup and canonical-source cleanup are separate decisions.

## Completed Safe Cleanup

| Area | Action | Recovery |
|---|---|---|
| Public APT docs | Replaced broad discovery with a canonical allowlist and regenerated the site from 203 selected artifacts. | Fully regenerable from canonical files. |
| Internal and tooling paths | Removed from generated public output by default. | Canonical sources remain unchanged. |
| Placeholder public demos | Marked four placeholder entries draft so they do not appear as live proof. | Change status after real walkthrough and validation evidence exist. |
| Public case studies | Enabled the authored `case-studies` content type and added the first evidence-backed baseline. | Source remains in `apps/web/content/case-studies/`. |
| Canonical Design ownership | Refocused `principles/design/README.md` on portable doctrine while preserving section anchors; confirmed the public repo already owns its brand, tokens, components, shells, and pattern implementations. | Prior wording remains recoverable in version control; detailed live implementation remains in `applied-practical-thinking/apps/web/docs/design/`. |
| API route showcase pair | Absorbed webhook, SDK, retry, stable-route, installed-path, and provenance guidance into `examples/showcases/api-route-design.md`; archived the superseded concise copy and updated the migration ledger. | Original source-backed wording remains in `docs/archive/consolidation/distribution-showcases/api/route-design.md`. |
| Cloudflare Worker/Hono showcase pair | Absorbed Pages Functions, React/Vite, modernization, runtime-evidence, need-driven platform-service, installed-path, and provenance guidance into `examples/showcases/cloudflare-worker-hono-structure.md`; archived the superseded concise copy and updated the migration ledger. | Original source-backed wording remains in `docs/archive/consolidation/distribution-showcases/cloudflare/worker-hono-structure.md`. |
| Security review expectations showcase pair | Absorbed health-data, MCP-permission, deployment-credential, external-integration, operational-evidence, validation-command, escalation, installed-path, and provenance guidance into `examples/showcases/security-review-expectations.md`; archived the superseded concise copy and updated the migration ledger. | Original source-backed wording remains in `docs/archive/consolidation/distribution-showcases/security/security-review-expectations.md`. |
| Agent instruction structure showcase pair | Absorbed cross-tool coverage, findings-first output, package/source-read, local-override, current adapter mapping, installed-path, and provenance guidance into `examples/showcases/agent-instruction-structure.md`; archived the superseded concise copy and updated the migration ledger. | Original source-backed wording remains in `docs/archive/consolidation/distribution-showcases/agents/instruction-structure.md`. |
| Documentation structure showcase pair | Absorbed current-versus-planned status, README-map, package-command accuracy, setup/operations/context ownership, maintenance-trigger, installed-path, and provenance guidance into `examples/showcases/documentation-structure.md`; archived the superseded concise copy and updated the migration ledger. | Original source-backed wording remains in `docs/archive/consolidation/distribution-showcases/docs/documentation-structure.md`. |
| Intent-based navigation showcase pair | Absorbed operational-workflow, expert-tool, intent-label, repeated-action, complete-state, installed-path, and provenance guidance into `examples/showcases/intent-based-ui-navigation.md`; archived the superseded concise copy and updated the migration ledger. | Original source-backed wording remains in `docs/archive/consolidation/distribution-showcases/ui/intent-based-navigation.md`. |

## Consolidation Queue

| Candidate | Current evidence | Decision gate | Intended result |
|---|---|---|---|
| Repeated skill, agent, prompt, and principle boilerplate | Baseline review found zero exact body duplicates and now records 21 thin shared-core skills, 50 agents, zero principles, and 36 prompts after the modernization/payment skill batch. | Ratchet specialization upward, map consumers, and prove generated or referenced shared contracts preserve standalone installation and tool compatibility. | Material topic deltas plus a smaller governed shared contract; no mass deletion. |
| Product-hub template and example diagrams | Two diagram pairs are byte-identical. | Confirm the example build does not require self-contained copies and define generation/derivation behavior. | One authored source or an explicitly generated copy. |
| Completed `docs/refactor/` plans | Several plans describe already completed consolidation phases. | Promote remaining decisions and evidence into live docs, migration ledger, or archive index. | Archive historical plans; delete only when provenance adds no value. |

## Deletion Standard

An authored artifact may be deleted only when:

1. its unique claims, decisions, examples, links, and provenance are inventoried;
2. durable information is present in a named live canonical file;
3. inbound references and distribution manifests are updated;
4. validation passes after removal;
5. the archive no longer provides useful audit, migration, or learning value; and
6. the deletion target is exact and recoverable through version control.

Generated public copies, caches, and build outputs do not require archival when their canonical source and regeneration command are verified.

## Next Consolidation Increment

The thin-principle queue and modernization/payment skill increment are complete. The remaining 21 thin skills are concentrated in documentation, product, AI review, engineering review, and knowledge-base authoring. The next bounded increment is the seven documentation skills; agent and prompt consolidation remains separate so accountable perspectives, task consumers, manifests, adapters, and standalone installation behavior can be reviewed first. See [Remaining Specialization Backlog](remaining-specialization-backlog.md) for the full sequence and archive/deletion gates.
