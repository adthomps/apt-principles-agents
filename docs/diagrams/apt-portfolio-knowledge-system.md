---
title: "APT Portfolio Knowledge System Diagrams"
kind: "diagram"
domain: "documentation"
status: "active"
owner: "APT"
last_updated: "2026-08-29"
source_paths: ["apt-principles-agents/AGENTS.md", "apt-principles-agents/docs/intake-routing-application.md", "apt-principles-agents/docs/working-backwards-product-team-application.md", "apt-principles-agents/docs/design-reference-intake.md", "apt-product-team/AGENTS.md", "apt-dream-to-reality/docs/INTAKE_TO_DELIVERY_CONTRACT.md", "applied-practical-thinking/docs/DESIGN_REFERENCE_MERGE_DIRECTION.md"]
---

# APT Portfolio Knowledge System Diagrams

These diagrams are curated navigation aids. Canonical truth remains in the cited repository sources. Solid arrows are `EXTRACTED`: the relationship is stated explicitly in source. Dotted arrows are reserved for `INFERRED` Graphify candidates and are not promoted here without source confirmation.

## Repository Ownership And Promotion

```mermaid
flowchart LR
    Intake[apt-intake<br/>operational intake] -->|EXTRACTED: accepted context| Product[apt-product-team<br/>planning cockpit]
    Intake -->|EXTRACTED: accepted context| Dream[apt-dream-to-reality<br/>productized planning and delivery]
    Product -->|EXTRACTED: reusable rules| Doctrine[apt-principles-agents<br/>canonical doctrine and assets]
    Product -->|EXTRACTED: polished behavior| Dream
    Product -->|EXTRACTED: sanitized proof| Public[applied-practical-thinking<br/>public proof and reference]
    Design[apt-design-reference<br/>frozen evidence] -->|EXTRACTED: reusable guidance| Doctrine
    Design -->|EXTRACTED: public visual direction| Public
    Doctrine -->|EXTRACTED: selected public projection| Public
```

Sources: `apt-product-team/AGENTS.md`, `apt-principles-agents/docs/intake-routing-application.md`, `apt-principles-agents/docs/working-backwards-product-team-application.md`, `apt-principles-agents/docs/design-reference-intake.md`, and `applied-practical-thinking/docs/DESIGN_REFERENCE_MERGE_DIRECTION.md`.

## Intake To Delivery And Learning

```mermaid
flowchart LR
    Report[Ambiguous or cross-product report] -->|EXTRACTED| Intake[Operational intake]
    Intake -->|EXTRACTED: route with evidence| Plan[Working Backwards planning]
    Plan -->|EXTRACTED: promotion candidate| Doctrine[Reusable doctrine, template, rubric, or contract]
    Plan -->|EXTRACTED: approved product behavior| Productized[Dream-to-Reality revisions and gates]
    Productized -->|EXTRACTED: explicit confirmation| Delivery[Engineering delivery handoff]
    Delivery -->|EXTRACTED: outcome evidence| Learning[Validation and learning]
    Learning -->|EXTRACTED: reusable lesson| Doctrine
```

Sources: `apt-intake/docs/operating-model.md`, `apt-product-team/docs/operating-model.md`, `apt-dream-to-reality/docs/INTAKE_TO_DELIVERY_CONTRACT.md`, and `apt-principles-agents/principles/execution/knowledge-and-learning.md`.

## Doctrine Distribution And Drift Review

```mermaid
flowchart TD
    Canonical[Canonical principles, standards, skills, prompts, templates] -->|EXTRACTED: selected by| Manifest[Capability manifests]
    Manifest -->|EXTRACTED: install or sync| Local[Target-repository managed assets]
    Local -->|EXTRACTED: constrained by| Context[Local project context and exceptions]
    Canonical -->|EXTRACTED: audit against| Audit[Workspace audit and managed-file scan]
    Local -->|EXTRACTED: evidence for| Audit
    Audit -->|EXTRACTED: source-backed finding| Owner[Canonical or target-repository owner]
    Owner -->|EXTRACTED: reviewed correction| Canonical
    Owner -->|EXTRACTED: reviewed correction| Local
```

Sources: `apt-principles-agents/README.md`, `apt-principles-agents/docs/operations/operating.md`, `apt-principles-agents/standards/installable-summaries/knowledge-graph-standards.md`, and target `.apt/installation.json` records.

## Project Families

```mermaid
flowchart TB
    subgraph Governance[Governance and product thinking]
      Principles[apt-principles-agents]
      IntakeRepo[apt-intake]
      Team[apt-product-team]
      DreamRepo[apt-dream-to-reality]
    end
    subgraph Knowledge[Knowledge and evidence]
      Hub[apt-knowledge-hub]
      Intelligence[apt-intelligence-core]
      Docs[apt-anet-doc-explorer]
    end
    subgraph Payments[Payments and commerce]
      Commerce[apt-commerce]
      Toolbox[apt-anet-integration-toolbox]
      Relay[apt-anet-relaytests]
    end
    subgraph Security[Security and compatibility]
      SDK[apt-anet-security-sdk]
      Harness[apt-security-harness]
    end
    subgraph Experiences[Public and domain experiences]
      PublicRepo[applied-practical-thinking]
      Health[apt-health]
      Novel[apt-novel-reviewer]
      Worlds[crt-world]
      Gateway[adthomps.github.io]
      DesignArchive[apt-design-reference]
    end
    Principles -->|EXTRACTED: reusable standards| Knowledge
    Principles -->|EXTRACTED: reusable standards| Payments
    Principles -->|EXTRACTED: reusable standards| Security
    Principles -->|EXTRACTED: reusable standards| Experiences
    IntakeRepo -->|EXTRACTED: route work| Team
    Team -->|EXTRACTED: productize| DreamRepo
    DesignArchive -->|EXTRACTED: promoted public direction| PublicRepo
    Gateway -->|EXTRACTED: points visitors to| PublicRepo
    Gateway -->|EXTRACTED: points integration traffic to| Toolbox
```

Sources: workspace project READMEs and `docs/project-context.md` files, plus `adthomps.github.io/PROJECT_RULES.md` for gateway destinations. Family grouping is navigational; it does not imply a runtime dependency.
