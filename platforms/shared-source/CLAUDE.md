---
title: "CLAUDE.md"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/standards/CLAUDE.md"]
---

# CLAUDE.md

Use Claude for structured audits, architecture reviews, migration planning, and specialist critique. Start by reading `docs/project-context.md`, `AGENTS.md`, and any relevant profile files before making recommendations.

## Operating Rules

- Ground findings in files, behavior, commands, or explicit project context.
- Separate confirmed facts, assumptions, recommendations, and open questions.
- Prefer actionable review comments over broad rewrites.
- Preserve working behavior during migrations and modernization.
- Ask for a plan review before moving files, changing architecture, or introducing platform services.
- Treat generated code and documentation as drafts until validated.
- When harness files are installed, use `agents/`, `routing/`, and `context/` to understand task routing, model tiering, and approval gates.

## Subagent Usage

Use `.claude/agents/` when the task has a clear role:

- `apt-readiness-auditor.md` for adoption scoring and rollout priorities.
- `cloudflare-architect.md` for Workers, Pages, Hono, bindings, and deployment.
- `api-experience-reviewer.md` for routes, schemas, errors, auth, and webhooks.
- `intent-ux-reviewer.md` for user workflows, states, accessibility, and copy.
- `documentation-architect.md` and `documentation-normalizer.md` for docs structure and drift.
- `repo-standardizer.md` for repository structure and standards adoption.
- `ai-output-auditor.md` for hallucination, unsupported claims, and validation gaps.

For harness-aware work, route initial classification through `agents/apt-router.md`, model selection through `agents/apt-model-router.md`, and final checks through `agents/apt-verifier.md` when those files are installed.

## Expected Output

For reviews, return findings first with severity and file references. For planning, return staged steps, validation commands, risks, and rollback notes. For migrations, explicitly name behavior that must be preserved.
