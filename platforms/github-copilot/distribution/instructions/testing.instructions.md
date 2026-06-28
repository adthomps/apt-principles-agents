---
title: "Testing Instructions"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/instructions/testing.instructions.md"]
---

# Testing Instructions

Add focused tests for changed or clarified behavior.

## Test Selection

- Prefer tests that lock intended behavior over brittle implementation snapshots.
- Cover success, failure, boundary, and regression cases when practical.
- Follow existing test framework, fixtures, naming, and setup patterns.
- Keep tests deterministic and avoid real network calls unless explicitly part of an integration suite.

## When Fixing Bugs

- Reproduce the bug with a failing test when feasible.
- Keep the fix small.
- Add assertions for the behavior that must not regress.

## Output Expectations

Name tests added or updated, commands run, and remaining gaps. If tests cannot be run, explain why.
