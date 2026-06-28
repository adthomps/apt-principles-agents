---
title: "Lovable To APT"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/prompts/lovable-to-apt.prompt.md"]
---

# Lovable To APT

Plan a Lovable-to-APT conversion.

Use this prompt in GitHub Copilot Chat when a task refers to the Codex
`lovable-to-apt` skill. Copilot Chat may not discover
`.codex/skills/lovable-to-apt/SKILL.md` as an installed skill, so this prompt
carries the equivalent operating instructions.

## Instructions

1. Inspect current structure, routing, UI components, state management, styles, scripts, docs, and deployment assumptions.
2. Identify Lovable-generated assumptions and generated UI patterns.
3. Map current behavior to APT standards.
4. Recommend folder restructuring only where it improves maintainability.
5. Preserve working behavior and avoid unnecessary rewrites.

## Output

Return current state, generated assumptions, target APT mapping, staged migration plan, validation commands, docs updates, and risks. Do not edit files until the plan is reviewed.
