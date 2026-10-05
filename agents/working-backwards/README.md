---
title: Working Backwards Agents
kind: index
domain: working-backwards
status: active
owner: APT
last_updated: 2026-10-04
source_paths: ["apt-principles-agents/agents/working-backwards/README.md"]
---

# Working Backwards Agents

The canonical Working Backwards system. The method is defined in [principles/execution/working-backwards.md](../../principles/execution/working-backwards.md); the role boundaries come from [agent-role-contracts.md](../../templates/working-backwards/agent-role-contracts.md).

| Agent | Role | Writes |
| --- | --- | --- |
| [apt-wb-orchestrator](apt-wb-orchestrator.md) | Owns the session: stage order, gates, profile, persona, and hand-offs | `session.json`, package `README.md` |
| [apt-wb-press-release-writer](apt-wb-press-release-writer.md) | Sub-agent: Stage 1 | `press-release.md` |
| [apt-wb-faq-writer](apt-wb-faq-writer.md) | Sub-agent: Stage 2, external and internal modes | `faq-external.md`, `faq-internal.md` |
| [apt-wb-requirements-writer](apt-wb-requirements-writer.md) | Sub-agent: Stages 3 and 4 | `requirements.md`, `engineering-handoff.md`, `readiness.md` |
| [apt-wb-critic](apt-wb-critic.md) | Independent gate; must run in a fresh session | `critic-review.md`, `session.json` only |

The writers and critic are sub-agents: the orchestrator invokes them, and they are not entry points on their own. Domain profiles (payments, game-development) live in [templates/working-backwards/domains/](../../templates/working-backwards/domains/README.md).

Installed only by the `working-backwards` manifest. Repositories with an established local implementation (such as APT Commerce) can keep it.
