---
title: Archived Cloudflare Worker Hono Structure Distribution Showcase
kind: archived-example
domain: distribution-showcases
status: archived
owner: APT
last_updated: 2026-08-16
source_paths: ["apt-agent-standards/showcases/cloudflare/worker-hono-structure.md"]
absorbed_into: "examples/showcases/cloudflare-worker-hono-structure.md"
---

# Cloudflare Worker Hono Structure

> Archived on 2026-08-16 after its unique guidance and source provenance were absorbed into `examples/showcases/cloudflare-worker-hono-structure.md`. This file is historical evidence, not active guidance.

## Principle

Cloudflare Worker and Hono projects should keep runtime boundaries, bindings, routes, and deployment assumptions visible.

## Use When

Use this pattern for Workers, Pages Functions, Hono APIs, React/Vite on Cloudflare, and Cloudflare modernization reviews.

## Avoid When

Avoid it when a project only has static hosting and no Worker, API, binding, or edge-runtime behavior.

## Bad Example

```text
src/index.ts contains bindings, route definitions, auth checks, service logic, and response shaping in one long file.
```

## Better Example

```text
src/index.ts wires the Worker and Hono app.
src/routes/ owns route modules.
src/services/ owns domain behavior.
wrangler.toml documents bindings and environments.
docs/project-context.md records deployment assumptions.
```

## Implementation Notes

Review `wrangler.toml`, package scripts, environment bindings, route handlers, secrets assumptions, and deployment docs together. Add D1, KV, R2, Queues, or Durable Objects only when the product need is clear.

## Related Packs

Use `context/cloudflare/README.md`, `checklists/api-checklist.md`, `checklists/security-checklist.md`, and the `cloudflare` profile.
