---
title: Working Backwards Profile — Integration Toolbox
kind: template
domain: execution
status: active
owner: APT
last_updated: 2026-10-05
source_paths: ["apt-principles-agents/templates/working-backwards/domains/integration-toolbox.md"]
---

# Working Backwards Profile: Integration Toolbox

For developer reference toolboxes that explain, demonstrate, and compare payment integration methods: method pages, guides, sandbox demos, API examples, and migration maps between gateways. Shared by the Authorize.Net and VAS SMB integration toolboxes.

## When a full package is required

A new method page or demo; a change to guidance that changes what a developer builds or which method they choose; a change to counterpart or migration mappings between toolboxes; a new developer tool (simulator, AI prompt set, comparison view). Copy edits, typo fixes, refactors, and dependency updates need a short note.

## Stage guidance

**Press release.** Name the developer persona and the concrete job, for example "a merchant developer replaces an Accept Hosted checkout with Unified Checkout in the sandbox". Evidence is developer questions, support or community threads, documentation gaps, or the migration catalog's status; otherwise label it a hypothesis.

**External FAQ.** Cover PCI scope (SAQ type), sandbox setup and credentials, time to the first successful sandbox transaction, error handling and webhooks, the migration path and counterparts, and what the demo deliberately does not do.

**Internal FAQ.** Every provider claim has an authoritative source or is labelled to verify. Demos are sandbox only and never handle plaintext card data; secrets stay in Worker secrets. Cover Cloudflare cost and limits, keeping counterpart links and the migration catalog consistent across toolboxes, and upkeep when provider documentation changes.

**Requirements.** Claims cite sources; counterpart links exist in both toolboxes; statuses agree with the migration catalog; the method's guide set is complete; demos never show a success the provider did not return.

**Engineering handoff.** Each slice names its validation (typecheck, tests, smoke suite, or a demo run as the persona) and a stop condition.

**Readiness.** Shipped pages have no unlabelled unverified claims; demos are smoke-tested against the sandbox; docs and counterpart links are updated; outcome signals for developers (for example time to a first sandbox transaction, or guide and demo use) are named or explicitly deferred.

## Personas and reviewer lenses

Developer personas from the owning toolbox, indexed under `developer`, `isv`, and `tech-partner` in `references/persona-register.json`. Lenses: developer integrator reviewer, new developer reviewer, ISV and tech partner reviewer (for partner or platform methods), gateway migration reviewer (for migration content), and security reviewer (for anything touching credentials or card data).

## Rubric overlay

[integration-toolbox.rubric.json](integration-toolbox.rubric.json)
