---
title: Commands
kind: command
domain: ai
status: active
owner: APT
last_updated: 2026-08-30
source_paths: ["apt-principles-agents/commands/README.md"]
---

# Commands

Canonical slash-command prompts. Unlike agents, a command is not a delegated
perspective — it is a top-level workflow the main session runs. Commands may
orchestrate agents; agents cannot.

`apt-assets.mjs` installs each `commands/<name>.md` into a claude-platform
target's `.claude/commands/<name>.md`, drift-safe like every other managed file.

| Command | Purpose |
| --- | --- |
| [edi.md](edi.md) | Review-council orchestrator: classify, assemble the minimal agent set, brief each, collect verdicts, synthesise, hand to the human. |
