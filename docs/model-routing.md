---
title: Model Routing
kind: guide
status: active
owner: APT
last_updated: 2026-06-27
source: APT consolidation
domain: "documentation"
source_paths: ["apt-principles-agents/docs/model-routing.md"]
---

# Model Routing

Classify the task first: read, design, implement, test, or review. Use cheap/local models for reads, classification, and summarization; mid-tier models for code changes and targeted tests; strong models for architecture, Working Backwards tradeoffs, payments, security, and major refactors; reviewers for final checks; humans for protected decisions. One session may use more than one tier.

Record owners, source links, assumptions, validation, and freshness. Use [APT principles](../principles/README.md) for decisions and [skills](../skills/README.md) for procedures.
