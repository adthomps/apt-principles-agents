---
title: APT Product Team Agent Instructions
kind: instruction
status: active
owner: APT
last_updated: 2026-08-03
domain: product-planning
source_paths: ["apt-principles-agents/product-team/AGENTS.md", "apt-principles-agents/product-team/README.md", "apt-principles-agents/product-team/INTAKE_APPLICATION_DIRECTION.md"]
---

# AGENTS

## Workspace Status

`product-team/` is an internal planning subsystem of `apt-principles-agents`, not a standalone repository. Use the parent repository's Git workflow for its files. Do not initialize nested Git metadata or treat it as a separate workspace consumer.

## Before Editing

1. Read `README.md`, `docs/project-context.md`, `docs/operating-model.md`, `docs/session-retention-policy.md`, and any task-specific direction document.
2. Use the parent `apt-principles-agents` repository for Git workflow commands; do not create nested Git metadata.
3. Treat `.claude/` as the current Claude Code implementation surface.
4. Treat `templates/` and `working-backwards/` as local planning assets unless the user explicitly asks to promote or publish them.

## Operating Rules

- Keep this folder an internal planning cockpit, not the canonical doctrine repo, public product, or operational intake queue.
- Use Working Backwards before requirements: customer, problem, current workaround, outcome, assumptions, constraints, success signal, press release, FAQ, then requirements.
- Preserve writer/critic separation. Writers draft; critics evaluate; orchestrators preserve state and lineage.
- Mark unresolved items as `[OPEN - owner: name]` and build-stopping items as `[BLOCKER - owner: name]`.
- Treat intake-like reports as planning evidence, not requirements.
- For multi-owner work, draft repo-scoped sub-issue recommendations instead of one blended implementation plan.
- Record what should be promoted within the parent `apt-principles-agents` repository, productized in `../../apt-dream-to-reality`, kept as live intake in `../../apt-intake`, or turned into public proof in `../../applied-practical-thinking`.
- Do not invent customer quotes, product behavior, metrics, legal/compliance facts, payment behavior, or brand claims. Use placeholders or open items when evidence is missing.
- Sensitive reports must not include secrets, credentials, payment card data, or unnecessary personal information.
- Keep `working-backwards/` clean: active sessions in `active/`, reviewed promotion candidates in `promotion-candidates/`, and historical evidence in `archive/`.
- Draft issues by default. Create live GitHub issues only after explicit user approval and a clear owning repository decision.

## Source Of Truth

- The parent `apt-principles-agents` repository owns reusable doctrine, provider-neutral templates, rubrics, prompts, contracts, standards, and canonical agent role definitions.
- `../../apt-dream-to-reality` owns polished productized Working Backwards and intake-to-delivery behavior.
- `../../apt-intake` owns live operational intake records and final outcome validation for actual intake issues.
- `../../applied-practical-thinking` owns public narrative, proof, and presentation.
- This folder owns internal experiments, fast planning sessions, Claude Code workflow evidence, and promotion candidates.

## Validation

This folder has no package manager script today. Run the local cockpit validator when changing rules, templates, sessions, or promotion paths:

```powershell
.\scripts\validate-local.ps1
```

Use `-Strict` when the cockpit should have no active sessions.

Also validate changes by:

- checking links and referenced local files;
- confirming templates are plain Markdown or JSON and remain readable;
- confirming session outputs preserve source, owner, status, and open/blocker state;
- checking that no local guidance contradicts canonical APT ownership boundaries.

Changes to this subsystem are versioned with the parent repository; keep its local validator scoped to the subsystem.
