---
title: Migration From Old Repositories
kind: migration-record
status: active
owner: APT
last_updated: 2026-06-27
source: APT consolidation
---

# Migration From Old Repositories

## Sources

- **apt-principles** current working tree, base commit **0a9a46980c18476f1296610843ed1c1d83143994**.
- **apt-agent-standards** current working tree, base commit **7fc319e5a4892a6a04573748c94d43b256904bb9**.

## Moved And Rationalized

- Root doctrine and lifecycle material became domain principles, with Thinking, Design, Architecture, and Execution first-class.
- Standards, checklists, prompts, templates, and examples were decomposed into canonical principles and linked execution assets.
- Harness routing, model selection, verification, security review, and tool-parity ideas became AI principles, skills, agents, and adapters.
- Existing payment, API, Cloudflare, UI, security, and documentation guidance seeded deeper domain catalogs.

## Merged Duplicates

Deep **apt-principles** guidance wins over compact installable summaries. Repeated repo-alignment, documentation, context-pack, API, and Copilot guidance now has one canonical principle or workflow with adapter links.

## Renamed

- Lifecycle execution, quality, release, operations, and knowledge guidance is grouped under **principles/execution/**.
- Tool-native Codex skills and Claude/Copilot roles are represented by portable skills/agents plus platform adapters.
- Profiles are replaced by YAML manifests.

## Archived Or Retired

The old doctrine/distribution ownership split, **.agent-standards.json**, **.agent-repo**, profile detection, path mapping, Node lifecycle installers, transition assessments, and shallow tool-specific stubs are not active interfaces. Selected unique records are preserved under **docs/archive/**; complete historical sources remain in their original repositories.

Generated dated audits, Graphify traversals, and project-profile sweeps are inventoried with hashes but not copied as active content.

## Open Review

- Validate product-specific Authorize.net, Cybersource, Visa Acceptance, and Accept Suite behavior against current authoritative documentation before publishing concrete claims.
- Select jurisdiction-, asset-, network-, custody-, and provider-specific sources before operational stablecoin guidance.
- Revisit installer synchronization only after real downstream use establishes a stable need.
