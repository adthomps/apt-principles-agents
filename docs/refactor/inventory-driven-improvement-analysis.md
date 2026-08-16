---
title: Inventory-Driven Improvement Analysis
kind: assessment
domain: architecture
status: active
owner: APT
last_updated: 2026-08-16
source_paths: ["apt-principles-agents/docs/apt/references/project-profile.json", "apt-principles-agents/docs/project-context.md"]
---

# Inventory-Driven Improvement Analysis

## Purpose

This assessment uses the verified version-2 project profile and generated project context as its baseline. It recommends follow-up work but does not change the repository architecture, asset taxonomy, runtime requirements, distribution behavior, or adapter ownership model.

## Baseline Verdict

`apt-principles-agents` is correctly classified as a documentation and reusable-asset toolkit with on-demand Node.js governance and distribution tooling. Its canonical-versus-supporting taxonomy is substantially documented, its lifecycle tooling is tested, and its cross-platform completion gate is explicit. The main improvement opportunities are consistency and maintainability rather than a new application architecture.

## Findings

### Documentation completeness

The generated `docs/project-context.md` now supplies the purpose, architecture, structure, command matrix, validation, distribution, and source-boundary information required for reliable repository orientation. The root `README.md` remains an effective conceptual entry point but does not itself provide the quick-start, structure, and validation summary required by `standards/documentation/documentation-standards.md`.

Recommendation: add a compact operational section to the README that links to the generated context rather than duplicating the full inventory.

### Profile contract and validator drift

The version-2 schema and validator now support a structured operational inventory while accepting legacy profiles. Validation is implemented without a JSON Schema dependency, so the JSON schema and custom validation code express the same contract in two places. Existing sibling profiles also use at least two legacy shapes, including profiles that do not match the original snake-case v1 contract.

Recommendation: keep the current dependency-free validator for this rollout, add contract parity tests whenever fields change, and decide later whether adopting a JSON Schema validator produces enough value to justify the dependency. Migrate sibling profiles one at a time instead of weakening version-2 validation.

### Runtime-version consistency

Three supported-runtime signals differ: `package.json` declares Node.js 18 or newer, operator setup guidance recommends Node.js 20 or newer, and GitHub Actions verifies Node.js 22. This does not prove Node 18 is broken, but it means the declared minimum is not continuously tested.

Recommendation: either add a Node 18 compatibility job or raise the declared engine to the oldest version the maintainers intend to support. Treat Node 22 as the CI observation, not automatically as the minimum.

### Canonical and generated boundaries

The repository distinguishes canonical doctrine, reusable operational assets, adapters, generated catalogs, and archives. Catalog freshness is validated, but catalog generation is not exposed through the root package command interface. Graph and local analysis outputs were also not ignored before this inventory pass.

Recommendation: add one documented catalog-generation command and a generated-output index when the next catalog change is made. Keep graph output ignored and non-authoritative.

### Directory clarity

The top-level structure is broad but intentional. Existing refactor assessments correctly recommend retaining it until a validated consumer justifies a new directory or package boundary. The main navigation challenge is that `docs/` mixes operations, diagrams, generated catalogs, active refactor assessments, migration records, and a large archive.

Recommendation: improve `docs/README.md` with grouped navigation and explicit authored/generated/archived labels. Do not move directories solely for symmetry.

### Distribution tooling

`scripts/apt-assets.mjs` provides the lifecycle core, while PowerShell and Bash installers provide platform UX. The safe loop—detect, preview, apply, verify—is consistently documented, and forced repair is backup-oriented. This is a strong boundary and should remain the operational center.

Recommendation: publish one generated command reference from the CLI help or command definitions so package scripts, runbooks, and examples can be checked for drift.

### Adapter duplication

Root instructions, shared platform source, platform-specific source, and distribution copies intentionally overlap but remain partly handwritten. Existing refactor evidence identifies generation and parity as the unresolved strategy rather than recommending immediate deletion.

Recommendation: pilot generated shared-core content for one adapter pair, preserve tool-specific handwritten extensions, and require source hashes plus parity tests before expanding the model.

### CI coverage

CI runs the completion gate on Linux and Windows with Node.js 22 and exercises the native shell wrappers. Repo inventory validation and stale generated-context checks now belong to the completion gate. Workspace rollup generation correctly remains outside CI because a standalone checkout does not contain sibling repositories.

Recommendation: add fixture-based workspace generation tests—which now exist—as the portable CI substitute. Avoid making CI depend on a particular local workspace layout.

### Profile maintainability

The JSON profile is intentionally detailed enough to support analysis, but command and structure descriptions can become stale if ownership is passive. Deterministic generated Markdown makes drift observable only when the JSON changes; it cannot detect an undocumented runtime or command change by itself.

Recommendation: make profile review part of command, architecture, deployment, and top-level directory change checklists. Keep `last_verified` evidence-based and do not update it merely to silence freshness concerns.

## Prioritized Recommendations

| Priority | Recommendation | Impact | Effort | Risk | Dependencies | Evidence |
|---|---|---|---|---|---|---|
| P1 | Resolve the Node 18/20/22 support statement by testing the declared minimum or raising it. | High | Low | Low | Maintainer support decision | `package.json`, `docs/operations/setup.md`, `.github/workflows/ci.yml` |
| P1 | Add a compact README operations section linking to generated project context. | High | Low | Low | Keep generated context stable | `README.md`, documentation standard, generated context |
| P1 | Require project-profile review when commands, architecture, deployment, or top-level structure changes. | High | Low | Low | Contributor/checklist update | Version-2 profile and stale-output check |
| P2 | Add contract-parity tests for every future schema change and evaluate a standards-compliant schema validator. | Medium | Medium | Low | Dependency policy decision | Schema and custom validator |
| P2 | Group `docs/README.md` navigation by active authored, generated, migration, refactor, and archive content. | Medium | Low | Low | None | `docs/` inventory and current index |
| P2 | Expose catalog generation through a documented package command and check its output deterministically. | Medium | Medium | Low | Confirm generator source/output contract | `scripts/generate-catalogs.mjs`, catalog validation |
| P2 | Generate a command reference from lifecycle command definitions to reduce runbook drift. | Medium | Medium | Medium | Stable CLI metadata source | `scripts/apt-assets.mjs`, operations docs |
| P3 | Pilot generated shared-core content for one platform adapter pair. | Medium | High | Medium | Source hash, parity, rollback, handwritten-extension contract | `platforms/`, cross-agent instruction model |
| P3 | Migrate sibling repositories from legacy profiles to version 2 one verified project at a time. | High workspace value | High cumulative | Medium | Per-project evidence review | Workspace inventory coverage |

## Non-Recommendations

- Do not turn the repository into a runtime service or package monorepo.
- Do not create new top-level directories only to make the taxonomy visually symmetrical.
- Do not treat generated catalogs, project context, workspace inventory, or graph output as canonical source.
- Do not normalize legacy sibling profiles without inspecting their owning repositories.
- Do not remove adapter duplication until a generated-core pilot proves parity and preserves platform-specific behavior.

## Reassessment Triggers

Re-run this analysis after any of the following:

- Node.js support policy changes.
- A new top-level directory or independently versioned package is proposed.
- Adapter generation or schema-validation dependencies are introduced.
- The asset lifecycle CLI changes its public commands or safety behavior.
- Several sibling projects complete version-2 inventory migration and expose portfolio-wide patterns.
