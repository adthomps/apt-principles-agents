---
title: Archive
kind: archive-index
status: active
owner: APT
last_updated: 2026-08-16
source: APT consolidation
---

# Archive

Historical material is preserved for provenance and migration analysis. It is not active APT guidance.

## Contents

- `consolidation/` preserves the completed consolidation reports and the one-time scripts used to build and cut over the canonical repository.
- `consolidation/distribution-showcases/` preserves concise source-backed showcase versions after their unique guidance is absorbed into live canonical examples.
- `legacy-agent-distribution/` preserves exact source captures and unique records for retired distribution interfaces.
- `source-provenance/` preserves source inventories, hashes, and working-tree patches.
- `generated-report-inventory.json` records generated historical reports that were inventoried rather than promoted into active guidance.
- `apt-agent-standards-CHANGELOG.md` preserves the retired repository's changelog.

Completed consolidation records:

- [Initial Consolidation Completion Report](consolidation/completion-report.md)
- [Archive Readiness Report](consolidation/archive-readiness-report.md)
- [Archived API Route Design Distribution Showcase](consolidation/distribution-showcases/api/route-design.md)
- [Archived Cloudflare Worker Hono Structure Distribution Showcase](consolidation/distribution-showcases/cloudflare/worker-hono-structure.md)
- [Archived Security Review Expectations Distribution Showcase](consolidation/distribution-showcases/security/security-review-expectations.md)
- [Archived Agent Instruction Structure Distribution Showcase](consolidation/distribution-showcases/agents/instruction-structure.md)
- [Archived Documentation Structure Distribution Showcase](consolidation/distribution-showcases/docs/documentation-structure.md)
- [Archived Intent-Based UI Navigation Distribution Showcase](consolidation/distribution-showcases/ui/intent-based-navigation.md)

## Retention And Deletion

Archive content is retained when it supplies unique provenance, original-source fidelity, migration rationale, or reproducibility evidence. It must not be loaded as current operational guidance.

Delete an archived artifact only when all of the following are verified:

1. An authoritative replacement or exact source capture exists.
2. Source hashes or immutable repository history prove recoverability.
3. No active package command, manifest, validator, documentation link, or downstream consumer requires it.
4. The artifact contains no unique rationale, transformation behavior, or audit evidence.
5. Migration-ledger destinations and archive navigation are updated in the same change.
6. `npm run check` passes after the deletion.

Historical consolidation scripts are evidence and must not be rerun as current tooling.
