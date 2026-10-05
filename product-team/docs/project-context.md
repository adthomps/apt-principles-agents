---
title: APT Product Team Project Context
kind: project-context
status: active
owner: APT
last_updated: 2026-08-03
domain: product-planning
source_paths: ["apt-principles-agents/product-team/docs/project-context.md", "apt-principles-agents/product-team/README.md"]
---

# Project Context

## Purpose

`product-team/` is the internal APT product-thinking cockpit subsystem. It supports Working Backwards sessions, intake-style analysis, product framing, critic review, and promotion decisions before material is made canonical, productized, operational, or public.

It is intentionally closer to a lab notebook and planning cockpit than a shipped product.

## Current Shape

This subsystem is part of the `apt-principles-agents` repository and shares its Git history and review process. It is not an independently versioned workspace project, consumer, or runtime product. Its planning content remains distinct from canonical doctrine, live intake, product delivery, and public proof.

The current implementation surface is Claude Code-oriented:

- `.claude/agents/` contains writer and critic roles.
- `.claude/rubrics/` contains stage-specific critic criteria.
- `.claude/skills/` contains command workflows and methodology guidance.
- `templates/` contains session and output formats.
- `working-backwards/` contains organized local session evidence.

## Boundary

This folder owns:

- internal product planning sessions;
- rough or experimental Working Backwards workflows;
- intake-like evidence analysis;
- draft routing and owner decisions;
- reusable-rule discovery before promotion;
- examples of planning artifacts that may inform canonical templates.

This folder does not own:

- canonical APT doctrine or reusable standards;
- polished external/demo product behavior;
- live operational intake records;
- final delivery status for product repositories;
- public proof or publication surfaces.

## Promotion Paths

| Material | Destination |
| --- | --- |
| Reusable doctrine, templates, prompts, rubrics, contracts, or canonical agent role definitions | Parent `apt-principles-agents` repository |
| Productized Working Backwards or intake-to-delivery behavior | `../../apt-dream-to-reality` |
| Live ambiguous/cross-product/support intake context | `../../apt-intake` |
| Public examples, proof, and narrative | `../../applied-practical-thinking` |

## Success Criteria

- Sessions clarify customer, problem, outcome, evidence, assumptions, and constraints before requirements.
- Every open item or blocker has a named owner.
- Multi-owner work is split into repo-scoped recommendations.
- Promotion candidates are explicit and routed to the right destination.
- Local evidence stays useful without becoming a hidden canonical source.

## Current Decisions

- Maintained within `apt-principles-agents`; no nested repository or separate workspace-consumer registration.
- Use the parent repository's review and persistence workflow; do not automatically publish planning evidence to other repositories.
- Claude Code remains the primary runtime; future adapters should come from canonical APT assets.
- Session history should stay clean with active, promotion-candidate, and archive folders.
- Issue drafting is supported now; issue creation can be added later when GitHub access and owner boundaries are explicit.
- `scripts/validate-local.ps1` is the current repeatable local check.
