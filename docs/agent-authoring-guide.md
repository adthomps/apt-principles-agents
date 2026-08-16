---
title: Agent Authoring Guide
kind: guide
status: active
owner: APT
last_updated: 2026-08-16
source: APT consolidation
domain: "documentation"
source_paths: ["apt-principles-agents/docs/agent-authoring-guide.md"]
---

# Agent Authoring Guide

Create an agent only for a distinct accountable perspective. Define triggers, responsibilities, required skills, escalation, outputs, and approval semantics.

Shared review and escalation language may repeat because agents are consumed independently, but a distinct name is not a distinct perspective. Add perspective-specific checks that change what evidence the agent inspects, which risks it owns, how it evaluates the work, and when it withholds approval. Agents that cannot supply at least three such checks should normally be a skill invocation, routing alias, or documented review mode rather than a separate role.

Use `npm run validate:specialization` to prevent unreviewed growth in generic agent families. The baseline is a ratchet, not a target.

Record owners, source links, assumptions, validation, and freshness. Use [APT principles](../principles/README.md) for decisions and [skills](../skills/README.md) for procedures.

For game work, select focused player, beginner, design, engineering, UI/UX, scope, and testing perspectives. The Scope Guardian must identify removable work, while specialist agents preserve uncertainty and escalate payment, health, privacy, security, rights, platform, or production-service claims.
