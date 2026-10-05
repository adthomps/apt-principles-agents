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

APT Product Team declares four active, Claude Code-oriented Working Backwards stage workers. They are local pipeline agents, not canonical review-council roles:

| Worker | Purpose | Definition |
| --- | --- | --- |
| Critic | Evaluates each stage artifact against its versioned rubric and returns PASS or NEEDS REVISION with feedback. | [critic.md](../product-team/.claude/agents/critic.md) |
| Press Release Writer | Drafts and refines the Stage 1 press release. | [press-release-writer.md](../product-team/.claude/agents/press-release-writer.md) |
| FAQ Writer | Generates and drafts the Stage 2 external and internal FAQs. | [faq-writer.md](../product-team/.claude/agents/faq-writer.md) |
| Requirements Writer | Converts the validated press release and FAQ package into Stage 3 requirements. | [requirements-writer.md](../product-team/.claude/agents/requirements-writer.md) |

The Product Team is maintained as an internal subsystem of `apt-principles-agents`; its files share the parent repository's version history. These are repository-relative links.

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

The Commerce persona source is currently an untracked workspace file, so its link above is workspace-relative and is not present in the published repository page. Use the repository link for published Commerce context; do not assume it contains the local pilot file.

**Separate transactional audience:** The Commerce source explicitly keeps Payer outside this account-persona pilot: payment by payer is a transactional journey, not a separate account persona in the current framing.

The active persona-document search found this explicit product-persona profile in the workspace. Keep any future personas and their evidence in the owning product repository; do not infer a persona from a passing mention in a journey, report, or test.

## Persona Lenses, Skills, and Routing

**Type:** Agent framing and execution mechanisms  
**Owner:** APT  
**Sources of truth:** [Agent Authoring Guide](./agent-authoring-guide.md), [Skills](../skills/README.md), [Platform Adapters](./platform-adapters.md), and the [APT Router](../agents/core/apt-router.md)

- An optional agent `persona` field identifies a documented **agent persona lens** only. A lens may shape framing or communication; it does not add role responsibility, authority, permission, or approval power.
- Skills, routers, handoffs, and subagent invocations describe procedures or execution mechanisms. They are not product personas or additional accountable roles.
- The workspace inventory found no separately maintained catalog of agent persona lenses. Use each agent's source or linked documentation if a lens is defined.
