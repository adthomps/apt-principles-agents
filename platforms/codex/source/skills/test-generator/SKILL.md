---
name: test-generator
description: Use when generating focused regression tests for changed or clarified behavior.
title: "Test Generator"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/codex/skills/test-generator/SKILL.md"]
---

# Test Generator

## Purpose
Create focused tests that protect behavior.

## When To Use
Use after bug fixes, refactors, API changes, or migration steps.

## When Not To Use
Do not generate broad brittle snapshots without behavior value.

## Required Reading
Read changed code, existing tests, fixtures, mocks, package scripts, test config, and project context.

## Process
1. Identify the behavior to protect.
2. Find the closest existing test pattern.
3. Add focused tests for success, failure, boundary, and regression paths where useful.
4. Avoid real network calls unless the suite already supports integration tests.
5. Run the narrowest relevant test command first.
6. Run broader validation when risk or shared behavior warrants it.

## Output Format
Return test plan, tests added, behavior covered, commands run, failures encountered, and remaining risk.

## Validation Checklist
- Tests follow local style.
- Edge cases are covered.
- Commands are reported.
- Tests fail for the bug when feasible before the fix.
- Tests avoid secrets and external services by default.
