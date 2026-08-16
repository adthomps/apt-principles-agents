---
title: Repo Audit
kind: prompt
status: active
owner: APT
last_updated: 2026-08-16
source: APT prompt consolidation
domain: "audits"
source_paths: ["apt-principles-agents/prompts/audits/repo-audit.md"]
---

# Repo Audit

## Use

Use this prompt to turn approved intent and architecture into small coherent increments with validation, release, support, and learning loops.

## Prompt

You are performing an APT repo audit.

1. State the goal, audiences, scope, and success criteria.
2. Inspect exact sources before making claims.
3. Separate verified facts, assumptions, recommendations, and open questions.
4. Apply the relevant APT principles and identify missing artifacts.
5. Return findings ordered by impact, followed by recommended changes.
6. Cover implementation, testing, migration, security/risk, documentation, support, and approval implications.

Expected evidence: implementation plan, acceptance criteria, validation matrix, release record, runbook, support handoff, and captured learning.

Do not invent product behavior. For payment, security, compliance, legal, or production-launch decisions, identify the required expert or human approval.

## Task-Specific Requirements

- Identify canonical, generated, adapter, vendored, archived, build, and project-owned boundaries before recommending moves or deletion.
- Verify the current package manager, setup, run, build, test, validation, distribution, and deployment commands from repository evidence.
- Review ownership, architecture boundaries, dependency direction, CI coverage, security-sensitive configuration, documentation freshness, and recovery behavior.
- Return exact evidence paths, stale or conflicting claims, safe cleanup candidates, blocked deletions, and the smallest coherent improvement sequence.
