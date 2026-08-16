---
title: Skill Authoring Guide
kind: guide
status: active
owner: APT
last_updated: 2026-08-16
source: APT consolidation
domain: "documentation"
source_paths: ["apt-principles-agents/docs/skill-authoring-guide.md"]
---

# Skill Authoring Guide

Use the required skill contract. Give clear triggers, inputs, an executable process, outputs, a quality bar, and links to canonical principles.

Shared contract wording may repeat when a skill must remain self-contained after selective installation. That portability requirement is not permission to publish title-swapped copies. Every skill must add topic-specific decisions, evidence, failure modes, and output requirements that materially change how the procedure is performed. Put those deltas in the purpose, process, outputs, and domain checklist rather than only in frontmatter or the title.

Use `npm run validate:specialization` to detect changes to the reviewed thin-specialization baseline. Ratchet the baseline downward only after strengthening or retiring an asset; do not update it merely to accept new generic content.

Record owners, source links, assumptions, validation, and freshness. Use [APT principles](../principles/README.md) for decisions and [skills](../skills/README.md) for procedures.

Game-development skills follow the same contract. They should explain unfamiliar terms, produce a next playable increment and cut list, avoid choosing an engine by fashion, and include build/playtest evidence plus asset, documentation, support, rollout, and rollback effects where relevant.
