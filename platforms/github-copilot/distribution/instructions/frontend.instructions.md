---
title: "Frontend Instructions"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/instructions/frontend.instructions.md"]
---

# Frontend Instructions

Design around user intent, workflow continuity, and accessibility.

## UI Rules

- Keep UI changes consistent with local components, spacing, typography, and state patterns.
- For React, TypeScript, and Tailwind projects, prefer shadcn/ui as the default repo-owned component foundation unless VPDS or another approved enterprise design system is required.
- Before adding shadcn components, inspect existing component folders, `components.json`, aliases, Tailwind config or global CSS, installed primitives, package manager, and local wrappers or blocks.
- Layer UI as `components/ui` for shadcn primitives, `components/apt` for reusable APT wrappers, and `components/blocks` for product workflow blocks.
- Reuse or adapt installed primitives before creating one-off styled markup.
- Account for loading, empty, error, disabled, success, and retry states.
- Ensure text fits across supported viewport sizes.
- Prefer clear controls over explanatory copy when the interaction is familiar.
- Do not hide critical workflow state in decorative UI.

## Accessibility

- Preserve keyboard navigation and focus states.
- Use semantic controls for buttons, links, forms, tabs, and dialogs.
- Keep labels and error messages tied to the relevant inputs.
- Preserve ARIA behavior and focus management when modifying shadcn/Radix primitives.

## Review Focus

Prioritize task blockers, confusing state transitions, inaccessible interactions, and responsive layout issues before polish.
