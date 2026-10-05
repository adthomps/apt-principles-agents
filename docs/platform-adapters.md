---
title: Platform Adapters
kind: guide
status: active
owner: APT
last_updated: 2026-06-27
source: APT consolidation
domain: "documentation"
source_paths: ["apt-principles-agents/docs/platform-adapters.md"]
---

# Platform Adapters

Install only the platform surfaces a target project uses. Preserve local instructions, preview changes, and avoid copying canonical doctrine into multiple tool-specific files.

Record owners, source links, assumptions, validation, and freshness. Use [APT principles](../principles/README.md) for decisions and [skills](../skills/README.md) for procedures.

## Agent adapter support

`references/agent-platform-capabilities.json` is the source of truth for generated agent adapters, their source directories, install targets, execution surfaces, tool mappings, and limitations. The adapter builder and installer read this same map.

| Platform | Agent adapter status | Surface and limitation |
| --- | --- | --- |
| Claude Code | Generated | Native agent definitions; installed to `.claude/agents`. |
| Codex | Generated | Role prompt blocks; not a Codex-specific native agent configuration. |
| Cursor | Generated | Rule files; not platform-native subagent definitions. |
| GitHub Copilot | Generated | Custom agent definitions; APT abstract capabilities map to Copilot tool identifiers. |
| Gemini CLI | Not generated | APT command surface is available under `.gemini/commands`; no agent adapter is generated. |

Agent `handoffs` are optional JSON-encoded frontmatter routing contracts. The adapter generator includes their trigger, target, required evidence, and expected output in generated prompts. `npm run validate:agents` checks their shape and target IDs and requires every `## Enforces` bullet to link the exact principle path and state an actionable check.

Run `npm run agent-coverage` to regenerate `graphify-out/agent-coverage/graph.json` and `GRAPH_REPORT.md`. The report traces canonical agents through declared consumer manifests and platform capabilities to installation records and SHA-256 target evidence. It predicts target paths using the installer's selection and filename-collision rules, distinguishes missing adapter sources from missing installation records, stale installations, local drift, and unavailable evidence, and reports unsupported platform surfaces separately as capability limitations rather than distribution defects.

## Keep local context local

Generated adapters translate canonical agent definitions; they are not per-project agent copies. Put repository-specific scope, commands, evidence, security and privacy constraints, and exceptions in the target's `AGENTS.md`, project context, architecture decisions, and domain documentation. Routers should read that context before selecting global agents, subagents, or persona lenses. Personas describe affected users and audiences; they inform perspective selection but do not replace accountable specialist agents or canonical doctrine.

Add a local agent only for a durable, project-specific responsibility with distinct inputs, an escalation boundary, an output contract, and an owner. Otherwise, use canonical roles with local project context. To resolve stale installed adapters, inspect the target's `.apt/installation.json` and local drift, preview an exact-target `sync`, then apply only the reviewed targets without `--force`. Preserve and document intentional local changes rather than overwriting them.
