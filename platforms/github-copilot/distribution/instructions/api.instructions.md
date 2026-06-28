---
title: "API Instructions"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/github-copilot/instructions/api.instructions.md"]
---

# API Instructions

Keep API contracts predictable, observable, and safe.

## Contract Rules

- Use consistent route naming, request schemas, response shapes, status codes, and error formats.
- Validate inputs at the boundary and return useful client-facing errors.
- Keep auth and authorization checks explicit.
- Consider idempotency, retries, and duplicate delivery for writes and webhooks.
- Document public or integration-facing behavior when it changes.

## Security And Operations

- Never log secrets, credentials, payment data, tokens, or full webhook payloads when sensitive.
- Verify webhook signatures when available.
- Include enough non-sensitive context to debug failures.
- Treat sandbox and production differences as explicit configuration, not hidden assumptions.

## Review Output

Return findings first, ordered by severity, with file references and suggested fixes.
