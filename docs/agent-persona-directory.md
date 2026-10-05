---
title: APT Agent and Persona Directory
kind: directory
status: active
owner: APT
last_updated: 2026-10-04
source: APT consolidation
domain: governance
source_paths: ["apt-principles-agents/docs/agent-persona-directory.md"]
---

# APT Agent and Persona Directory

Use this directory to find accountable APT agent roles, intentional repository-local workers, platform packaging, and product-owned personas without treating them as interchangeable. This is a navigation index, not a replacement source of truth or a claim that every listed persona has been validated.

## Accountable APT Agent Roles

**Type:** Canonical agent roles  
**Owner:** APT  
**Source of truth:** [Canonical agent definitions](../agents/README.md)

The complete, generated [Agent Catalog](./distribution/AGENT-CATALOG.md) lists canonical roles and their purposes. The nine named cross-cutting roles — Miranda, Javik, Wrex, Kaidan, Suvi, Drack, Glyph, Kasumi, and Samara — are agent roles, not product-research personas. Use the catalog and each linked role definition for selection and authority boundaries; this directory does not copy their profiles.

## Repository-Local Agents and Subagents

**Type:** Product-specific pipeline workers  
**Owner:** APT Product Team  
**Source of truth:** [Local agent declaration](../product-team/.apt/local-agents.md)

APT Product Team declares **no local agents**. Its Working Backwards pipeline runs the canonical agents, generated into `product-team/.claude/agents/` as an internal mirror by `npm run build:agents` and checked by `validate:adapters`:

| Agent | Role in the Product Team pipeline |
| --- | --- |
| [apt-wb-press-release-writer](../agents/working-backwards/apt-wb-press-release-writer.md) | Stage 1 |
| [apt-wb-faq-writer](../agents/working-backwards/apt-wb-faq-writer.md) | Stage 2, external and internal modes |
| [apt-wb-requirements-writer](../agents/working-backwards/apt-wb-requirements-writer.md) | Stage 3 |
| [apt-wb-critic](../agents/working-backwards/apt-wb-critic.md) | Reviews each stage in return-only mode; the pipeline records and commits the verdict |

The Product Team is maintained as an internal subsystem of `apt-principles-agents`; its files share the parent repository's version history. Its own layer is [product-team/working-backwards/profile.md](../product-team/working-backwards/profile.md). The former local workers were retired on 2026-10-05 and their rules folded into the canonical agents, the critic-review skill, and rubric v1.1.0.

**Canonical Working Backwards agents.** Working Backwards is an APT-wide system: the [orchestrator, writer sub-agents, and independent critic](../agents/working-backwards/README.md), with the method in [principles/execution/working-backwards.md](../principles/execution/working-backwards.md), domain profiles for payments and game development, and repository profiles for each adopter. Repositories opt in through the `working-backwards` manifest. APT Commerce keeps its own local critic skill and hook, recorded as a repository-owned path (`localTargets`).

The active-source inventory found no other declared local-only agent bundle. Generated or installed copies of canonical roles belong in the platform-availability view below, not in this local-role list.

## Platform Availability

**Type:** Platform adapters and execution surfaces  
**Owner:** APT  
**Source of truth:** [Agent platform capability map](../references/agent-platform-capabilities.json) and [Platform Adapters guide](./platform-adapters.md)

Adapters package canonical roles for a platform; they do not create new roles. The generated capability map is authoritative for current support and limitations.

| Platform | Agent adapter status | Execution surface |
| --- | --- | --- |
| Claude Code | Generated | Native agent definitions in `.claude/agents/` |
| Codex | Generated | Role prompt blocks in `.codex/agents/`; not a Codex-native agent configuration |
| Cursor | Generated | Rule files in `.cursor/agents/`; not native subagent definitions |
| GitHub Copilot | Generated | Custom agent definitions in `.github/agents/` |
| Gemini CLI | No agent adapter | APT command surface is available under `.gemini/commands/` |

See the guide for adapter-generation details and the capability map for tool mappings and constraints. Repository installation records and local drift determine whether a particular project has a current adapter installed.

## Product Personas and Audiences

**Type:** Product-owned audience profiles  
**Owner:** APT Commerce  
**Source of truth:** [Commerce product personas](../../apt-commerce/docs/apt/personas/README.md) in the [APT Commerce repository](https://github.com/adthomps/apt-commerce)

The current Commerce pilot contains six audience profiles:

- Merchant
- Partner — Acquiring Partner
- Partner — ISO
- Partner — ISV
- Partner — Tech Partner
- Internal

The pilot status is **direction**: owner-provided framing, directional and unvalidated. It is not validated user research, evidence of shipped behavior, an authorization model, or build approval. The source document records goals, boundaries, open questions, current-versus-intended journey grounding, and related test navigation. Planned test sittings are not proof that a test or capability exists.

The Commerce persona source is committed in `apt-commerce`; its link above is workspace-relative.

**Separate transactional audience:** The Commerce source explicitly keeps Payer outside this account-persona pilot: payment by payer is a transactional journey, not a separate account persona in the current framing.

Keep any future personas and their evidence in the owning product repository; do not infer a persona from a passing mention in a journey, report, or test.

### Persona register

[`references/persona-register.json`](../references/persona-register.json) indexes the personas across the workspace without moving them. For each persona it records:

- the owning sources and the name each one uses: the Commerce persona file, and the `personas` tags (`merchant`, `partner`, `isv`, `developer`) in `apt-anet-training` and `apt-vas-smb-training`;
- the canonical reviewer agents that act as a lens for it, which gives them no extra authority;
- any coverage gap where no reviewer agent owns the persona's perspective.

`npm run knowledge:audit` (and `audit-workspace`) checks that every cited file and section exists and every reviewer agent is canonical, and reports the gaps as warnings. When you add or rename a persona in a product repository, update the register in the same change.

## Persona Lenses, Skills, and Routing

**Type:** Agent framing and execution mechanisms  
**Owner:** APT  
**Sources of truth:** [Agent Authoring Guide](./agent-authoring-guide.md), [Skills](../skills/README.md), [Platform Adapters](./platform-adapters.md), and the [APT Router](../agents/core/apt-router.md)

- An optional agent `persona` field identifies a documented **agent persona lens** only. A lens may shape framing or communication; it does not add role responsibility, authority, permission, or approval power.
- Skills, routers, handoffs, and subagent invocations describe procedures or execution mechanisms. They are not product personas or additional accountable roles.
- The workspace inventory found no separately maintained catalog of agent persona lenses. Use each agent's source or linked documentation if a lens is defined.
