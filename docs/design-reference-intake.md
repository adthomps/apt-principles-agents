---
title: APT Design Reference Intake
kind: operating-guidance
status: active
owner: APT
last_updated: 2026-08-02
domain: design
source_paths: ["apt-principles-agents/docs/design-reference-intake.md", "apt-design-reference/README.md"]
---

# APT Design Reference Intake

## Purpose

Use this guide when applying reusable material from `../apt-design-reference` into `apt-principles-agents`.

`apt-design-reference` is evidence and source material for APT visual practice. `apt-principles-agents` is the canonical owner for reusable doctrine, standards, checklists, prompts, skills, agents, context packs, token references, and distribution assets. Public visual examples and showcase pages belong in `../applied-practical-thinking`.

## What Belongs Here

Promote design-reference material into this repo when it is reusable across APT projects:

- Design doctrine: principles for hierarchy, layout, complete states, data visualization, accessible interaction, imagery, and purposeful motion.
- Content rules: voice, naming, disclaimers, public-proof wording, demo-status language, and non-marketing copy standards.
- Review standards: pass/fail criteria, design lint failures, accessibility expectations, and evidence requirements.
- Agent guidance: instructions, skills, prompts, rubrics, and context-pack material that help AI tools produce or review APT-aligned interfaces.
- References: semantic token roles, lint gates, source-of-truth mappings, and portable contracts.
- Templates and examples: reusable docs, product hub, UI review, or pattern examples that are not specific to one public site page.

## What Does Not Belong Here

Do not promote these as canonical doctrine:

- Generated bundles such as `_ds_bundle.js`, `_ds_manifest.json`, standalone HTML exports, screenshots, and uploads.
- Public showcase pages or visual examples that are meant to be browsed as part of the APT public site.
- Runtime-only implementation files unless they become generalized templates, examples, or platform adapter guidance.
- Site-specific brand values, typography choices, component APIs, route shells, or literal token values.
- Product-specific assets such as profile photos or blog covers unless they illustrate a generalized standard.
- Duplicate token definitions that conflict with the canonical `references/design-tokens.json` contract.

## Intake Map

| Source material from `apt-design-reference` | Canonical destination in this repo |
| --- | --- |
| Portable visual semantics, content fundamentals, iconography rules, data visualization, surface-pattern criteria | `principles/design/README.md` or focused design principle docs |
| Pass/fail checks, lint failure descriptions, evidence requirements | `checklists/design-review-checklist.md`, `references/design-lint-gates.json` |
| Semantic token intent and role definitions | `references/design-tokens.json` plus related token docs |
| Agent-facing UI/design instructions | `context-packs/apt-ui-pack.md`, `prompts/design-review-prompt.md`, platform adapter assets |
| Reusable UI or docs patterns | `examples/ui/*`, `templates/DESIGN.md`, product hub templates |
| Design governance process | `governance/design-review.md`, scorecards, maturity guidance |

## Application Rules

1. Extract principle, not presentation.
   - Convert source examples into durable rules, checklists, references, prompts, or examples.
   - Do not copy a standalone UI kit wholesale into doctrine.

2. Keep canonical and public roles separate.
   - Canonical reusable rules live here.
   - Public visual reference and showcase pages live in `../applied-practical-thinking`.

3. Preserve source traceability.
   - Add or update frontmatter `source_paths` when a canonical artifact incorporates design-reference material.
   - Cite the original design-reference file in commit notes or migration records when useful.

4. Reconcile tokens before changing doctrine.
   - Confirm token claims against `references/design-tokens.json`, downstream runtime token contracts, and the public site source.
   - If a design-reference rule conflicts with runtime reality, record the decision before changing canonical wording.

5. Promote agent guidance deliberately.
   - Put reusable Codex/Claude/Gemini/Copilot guidance into platform adapters or context packs.
   - Keep tool-specific generated exports out of canonical source unless they are maintained adapter assets.

## First-Pass Result

The Design principle hub now keeps portable doctrine and explicitly delegates literal colors, typography, brand treatments, component APIs, shell layouts, and runtime implementation to target repositories. Its existing topic headings remain available so incoming section links continue to resolve, but their content now describes reusable intent and review criteria rather than one site's implementation.

The public site's authored design system, source map, tokens, and pattern documents under `../applied-practical-thinking/apps/web/docs/design/` already own the detailed dark-first, blue-led public implementation. No duplicate local design document was created during the split.

Next useful applications:

- Compare `colors_and_type.css` with `references/design-tokens.json` and reconcile any missing semantic roles.
- Review `SKILL.md` and tool-specific agent folders for reusable design-agent guidance that belongs in `context-packs/apt-ui-pack.md` or platform adapters.
- Convert durable kit guidance from `ui_kits/*/README.md` into focused `examples/ui/*` or checklist additions.
- Keep public visual examples in `../applied-practical-thinking/apps/web/docs/design/`.

## Validation

After canonical changes in this repo, run:

```bash
npm run check
```

After public design-reference changes in `../applied-practical-thinking`, run that repo's design-doc validation and build commands.
