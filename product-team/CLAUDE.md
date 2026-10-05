# APT Product Team

This folder is an internal APT product-thinking cockpit that uses Claude Code-oriented Working Backwards workflows.

## APT repository note

This folder is an internal planning subsystem inside `apt-principles-agents`, not a standalone repository. Use the parent repository for Git operations. Do not initialize nested Git metadata or register this folder as a separate workspace consumer.

Read `AGENTS.md`, `docs/project-context.md`, `docs/operating-model.md`, `docs/session-retention-policy.md`, and `INTAKE_APPLICATION_DIRECTION.md` before changing local workflow rules or templates.

## What this does

Running `/working-backwards` starts a strict, stage-gated pipeline:

1. **Stage 1 — Press Release**: Write a customer-centric Press Release before any requirements
2. **Stage 2 — External FAQ**: Stress-test the PR with hard customer questions
3. **Stage 2 — Internal FAQ**: Stress-test with hard engineering/leadership questions
4. **Stage 3 — Requirements**: Translate the validated PR + FAQ into engineer-ready specs

Each stage must pass a Critic review before the next stage unlocks. No skipping.

Session outputs are saved under `working-backwards/active/`, `working-backwards/promotion-candidates/`, or `working-backwards/archive/`. They are internal planning evidence until reviewed and promoted to the owning destination.

## Prerequisites

- Claude Code for the local workflow.
- `gh` CLI only when the user explicitly approves creating or updating a live GitHub issue or pull request.

## Available commands

- `/working-backwards [feature idea]` — Start a new Working Backwards session
- `/working-backwards resume [session-id]` — Resume an in-progress session
- `/wb-status [session-id]` — View current session state (read-only)

## Session output structure

```
working-backwards/
  {session-id}/
    press-release.md     ← committed on Stage 1 Critic PASS
    faq-external.md      ← committed on Stage 2 External Critic PASS
    faq-internal.md      ← committed on Stage 2 Internal Critic PASS
    requirements.md      ← committed on Stage 3 Critic PASS
    session.json         ← updated after every agent interaction
```

## Agents

- `press-release-writer` — Stage 1 worker
- `faq-writer` — Stage 2 worker (External and Internal modes)
- `requirements-writer` — Stage 3 worker
- `critic` — Reviews all stage outputs against versioned rubrics

## Rubrics

Stage-specific Critic rubrics live in `.claude/rubrics/`. They are versioned JSON files — update them without redeploying any agent.
