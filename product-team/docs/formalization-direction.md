---
title: APT Product Team Formalization Direction
kind: decision-direction
status: active
owner: APT
last_updated: 2026-08-03
domain: product-planning
source_paths: ["apt-principles-agents/product-team/docs/formalization-direction.md", "apt-principles-agents/product-team/docs/project-context.md", "apt-principles-agents/product-team/docs/operating-model.md"]
---

# Formalization Direction

## Current Decision

Keep `product-team/` as the internal APT product-thinking cockpit subsystem within `apt-principles-agents`. Its planning and evidence boundary is distinct from canonical doctrine, operational intake, product delivery, and public proof.

## Direction

- Treat the folder as internal planning infrastructure.
- Keep Claude Code workflows as the primary implementation surface.
- Keep future runtime support provider-neutral so Codex, Copilot, Gemini, or app-backed systems can be added later from canonical APT assets.
- Use `working-backwards/` as organized local evidence, not approved product truth.
- Promote reusable rules and templates into the parent `apt-principles-agents` repository.
- Promote polished app behavior into `../../apt-dream-to-reality`.
- Route live ambiguous operational work through `../../apt-intake`.
- Use `../../applied-practical-thinking` only for public proof or narrative after claims are cleaned up.

## Decisions

### Repository Ownership

This subsystem is versioned with the parent repository. Do not create nested Git metadata or add it as an independent workspace consumer. Shared version control does not make planning records canonical doctrine, operational intake, or product behavior.

### Persistence

Persistence means where session history and stage artifacts are durably stored.

- Current: files under `working-backwards/`, reviewed and versioned through the parent repository.
- Productized later: `../../apt-dream-to-reality` owns app/database persistence for polished Working Backwards and delivery behavior.

Do not automatically publish session content or create issues in other repositories. Make promotions and live issue creation explicit, reviewed, and owner-scoped.

### Runtime

Claude Code is the current workflow surface. Any additional platform adapters should follow the canonical provider-neutral contracts and preserve writer/critic separation, source lineage, open/blocker semantics, and promotion routing.

### Session Retention

Keep the folder clean:

- `working-backwards/active/` for current sessions.
- `working-backwards/promotion-candidates/` for reviewed sessions that may move to another repo.
- `working-backwards/archive/` for historical evidence.

Historical sessions should be archived unless actively being reviewed. Scratch sessions should be removed only after review confirms they have no useful evidence.

### Issues

The cockpit should support both issue drafts and eventual issue creation.

Near-term decision: draft issues only. Later, when GitHub access and owner boundaries are explicit, it may create GitHub issues in owning repositories. Live operational intake still belongs in `../../apt-intake`, and product delivery issues still belong in the repo that owns delivery.

## Completion Criteria For This Pass

- Local agent instructions exist.
- Project context exists.
- Operating model exists.
- README and Claude guidance describe shared parent-repository version control without making planning records canonical.
- Intake planning direction links to concrete local templates.
- Formalization questions are resolved into current decisions and future options.
- Local validation exists via `scripts/validate-local.ps1`.
- No nested Git repository or separate consumer registration is required.
