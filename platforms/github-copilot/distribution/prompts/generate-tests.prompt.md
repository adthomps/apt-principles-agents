---
title: "Generate Tests"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/prompts/generate-tests.prompt.md"]
---

# Generate Tests

Generate focused tests for the scoped behavior.

## Instructions

1. Read existing tests and follow local framework, fixtures, naming, and assertion style.
2. Cover the behavior that changed or needs protection.
3. Include success, failure, boundary, and regression cases when useful.
4. Avoid brittle snapshots unless the repo already relies on them for the same purpose.
5. Avoid real network calls unless the test suite is explicitly an integration suite.

## Output

Before editing, state the test plan and files to modify. After editing, summarize tests added, behavior covered, commands run, and remaining gaps.
