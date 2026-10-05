---
title: Audience Layered Documentation
kind: guide
status: active
owner: APT
last_updated: 2026-10-04
source: APT consolidation
domain: "documentation"
source_paths: ["apt-principles-agents/docs/audience-layered-documentation.md"]
---

# Audience Layered Documentation

Maintain one canonical truth and distinct product-owned layers for merchant, partner, developer, support, internal, and automation audiences. Product/customer personas describe people and organizations served by a product; keep their evidence, goals, constraints, and journeys in the product repository that owns them.

Keep product/customer personas distinct from accountable agent roles, optional agent persona lenses, authorization roles, and procedural/platform mechanisms. See the [agent authoring guide](./agent-authoring-guide.md) for those definitions and when to use each.

For each product persona, record an owner, goals and context, evidence and confidence, constraints, affected journeys, current versus intended behavior, open questions, and links to relevant tests. Label direction that has not been validated as such; do not infer shipped behavior or permissions from a persona label. Product repositories own their persona records.

Graphify may connect personas to journeys, evidence, roles, skills, and tests for discovery. It is an index for navigation, not the authoritative source for those definitions. Use [APT principles](../principles/README.md) for decisions and [skills](../skills/README.md) for procedures.
