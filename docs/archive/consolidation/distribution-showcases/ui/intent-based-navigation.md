---
title: Archived Intent-Based UI Navigation Distribution Showcase
kind: archived-example
domain: distribution-showcases
status: archived
owner: APT
last_updated: 2026-08-16
source_paths: ["apt-agent-standards/showcases/ui/intent-based-navigation.md"]
absorbed_into: "examples/showcases/intent-based-ui-navigation.md"
---

# Intent-Based UI Navigation

> Archived on 2026-08-16 after its unique guidance and source provenance were absorbed into `examples/showcases/intent-based-ui-navigation.md`. This file is historical evidence, not active guidance.

## Principle

Navigation should reflect what users are trying to accomplish, not the internal implementation or database model.

## Use When

Use this pattern for apps with dashboards, repeated workflows, operational tools, onboarding flows, or multi-step tasks.

## Avoid When

Avoid it when the UI is a simple static page or when a technical navigation label is required for an expert-only tool.

## Bad Example

Navigation labels mirror implementation details:

```text
Tables
Records
Sync Jobs
Payloads
```

## Better Example

Navigation labels mirror user intent:

```text
Customers
Orders
Reviews
Imports
```

## Implementation Notes

Start with the top user tasks. Group related screens by workflow, keep repeated actions reachable, and make empty, loading, error, and success states part of the navigation review.

## Related Packs

Use `context/ui/README.md`, `checklists/ui-checklist.md`, and the `ux-review` profile.
