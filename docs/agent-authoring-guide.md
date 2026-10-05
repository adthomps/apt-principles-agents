---
title: Agent Authoring Guide
kind: guide
status: active
owner: APT
last_updated: 2026-10-04
source: APT consolidation
domain: "documentation"
source_paths: ["apt-principles-agents/docs/agent-authoring-guide.md"]
---

# Agent Authoring Guide

Create an agent only for a distinct accountable perspective. Define triggers, responsibilities, required skills, escalation, outputs, and approval semantics.

## Keep These Concepts Distinct

- A **product/customer persona** describes an audience a product serves: its context, goals, constraints, evidence, and journeys. Product personas belong in the product repository that owns the evidence and behavior; they are not agent roles or authorization roles.
- An **agent role** owns a distinct perspective and accountable review or work. The nine named canonical files (Miranda, Javik, Wrex, Kaidan, Suvi, Drack, Glyph, Kasumi, and Samara) are agent roles, not customer-research personas. Keep their responsibilities, escalation, autonomy, tools, and approval semantics in the role definition.
- An optional **agent persona lens** is a documented framing or communication lens used by an agent role. It may shape how the role considers or explains a problem, but it does not add responsibilities, capabilities, authority, permissions, or approval power. Use the optional `persona` frontmatter field only to identify a lens documented in that agent's source or a linked source; do not use it for a product/customer persona or as a substitute for the role definition.
- A **skill, subagent invocation, router, or platform adapter** describes a procedure, execution mechanism, or platform-specific packaging. It is not a product persona; an adapter does not create a new role.

Create or revise an agent role when the perspective changes what evidence is inspected, which risks or outcomes it owns, how it evaluates the work, or when it withholds approval. Use a documented persona lens only when the same accountable role needs a distinct, reusable framing. Keep product audiences and their evidence in the product's own documentation; do not add them to the global agent roster.

Shared review and escalation language may repeat because agents are consumed independently, but a distinct name is not a distinct perspective. Add perspective-specific checks that change what evidence the agent inspects, which risks it owns, how it evaluates the work, and when it withholds approval. Agents that cannot supply at least three such checks should normally be a skill invocation, routing alias, or documented review mode rather than a separate role.

Use `npm run validate:specialization` to prevent unreviewed growth in generic agent families. The baseline is a ratchet, not a target.

Record owners, source links, assumptions, validation, and freshness. Use [APT principles](../principles/README.md) for decisions and [skills](../skills/README.md) for procedures.

For game work, select focused player, beginner, design, engineering, UI/UX, scope, and testing perspectives. The Scope Guardian must identify removable work, while specialist agents preserve uncertainty and escalate payment, health, privacy, security, rights, platform, or production-service claims.
