---
title: "Model Capability Matrix"
kind: "routing"
domain: "ai"
status: "active"
owner: "APT"
last_updated: "2026-09-06"
source_paths: ["apt-agent-standards/routing/model-capability-matrix.md"]
---

# Model Capability Matrix

Capability tiers are vendor-neutral. Platform adapters may map tiers to current tools. Do not encode product-specific model names here.

| Capability | Tier 1 local | Tier 2 mid-tier | Tier 3 frontier |
| --- | --- | --- | --- |
| Request classification | Preferred | Allowed | Avoid unless bundled with complex work |
| Skill selection | Preferred | Allowed | Avoid unless bundled with complex work |
| Task packet building | Preferred | Allowed | Allowed for high-risk tasks |
| Read / search / inventory | Preferred; use deterministic search first | Allowed when synthesis is required | Avoid unless bundled with complex work |
| Markdown cleanup | Preferred | Allowed | Avoid |
| Inventory generation | Preferred | Allowed | Avoid |
| Design / Working Backwards | Framing and checklist fill | Limited drafting | Preferred when customer, multi-audience, or tradeoff work is ambiguous |
| Implementation / code changes | Limited boilerplate | Preferred | Use for complex or risky cross-cutting work |
| Documentation generation | Simple updates | Preferred | Use for architecture/security docs |
| Testing / verification | Simple assertions | Preferred for targeted cases | Use for complex regressions; never treat model confidence as a pass |
| Architecture review | Not sufficient | Limited | Preferred |
| Security review | Not sufficient | Limited | Preferred |
| Major migration | Not sufficient | Limited planning | Preferred |
| Final approval | Never | Never | Never; human approval required |

## Task classes

Classify work before choosing a tier. One session may use more than one class.

- **Read:** locate files, grep, summarize known sources, build inventories. Prefer deterministic tools and Tier 1.
- **Design:** Working Backwards, architecture, UX, or API shape. Tier 2 for bounded drafts; Tier 3 when audiences or tradeoffs collide.
- **Implement:** edit product or doctrine source. Tier 2 unless the change is high-risk or cross-cutting.
- **Test:** run or write verification. Tier 2 for targeted checks; Tier 3 only for flaky or cross-system failures.
- **Review:** security, architecture, or final independent review. Tier 3 preferred; humans still approve.
