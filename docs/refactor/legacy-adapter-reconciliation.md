---
title: Legacy Adapter Reconciliation
kind: guide
domain: governance
status: draft
owner: APT
last_updated: 2026-08-30
source_paths: ["apt-principles-agents/platforms/claude/source/agents"]
---

# Legacy Adapter Reconciliation

Fourteen files in `platforms/claude/source/agents/` have **no canonical
`agents/<domain>/<id>.md` source**, so `build-agent-adapters.mjs` does not own
them. Their frontmatter was normalized to Claude-native form on 2026-08-30, but
each still needs a promote / retire / keep decision, and none have codex or
cursor equivalents.

| Adapter | Recommendation | Rationale |
| --- | --- | --- |
| `ai-output-auditor` | **Promote** to `agents/engineering/` | Unique lens (unsupported-claim / invented-API audit of generated output); no canonical equivalent. |
| `apt-principles-reviewer` | **Promote** to `agents/core/` | The "does this diff match APT doctrine" meta-review; distinct from `apt-principal` (synthesis) and `apt-router` (selection). |
| `apt-readiness-auditor` | **Retire** | Overlaps `agents/harness/apt-repo-scanner` + `apt-verifier`; fold its scoring rubric into `apt-repo-scanner`. |
| `repo-standardizer` | **Retire** | Overlaps `agents/harness/apt-installer` + `apt-repair-agent`. |
| `cloudflare-architect` | **Retire** | Overlaps `agents/harness/apt-cloudflare-builder` + `agents/engineering/drack`. Update `manifests/cloudflare.yaml`. |
| `cloudflare-react-hono-architect` | **Retire** | Subsumed by `drack`. |
| `cloudflare-modernization-architect` | **Retire** | Overlaps `agents/architecture/apt-modernization-architect`. Update `manifests/cloudflare.yaml`. |
| `documentation-architect` | **Retire** | Overlaps `agents/docs/apt-docs-reviewer` + `apt-product-hub-builder`. |
| `documentation-normalizer` | **Promote** to `agents/docs/` | The consolidate-scattered-docs task is distinct from reviewing a single deliverable. |
| `intent-ux-reviewer` | **Promote** to `agents/design/` | `agents/design/` is an empty category; this is its first real agent. Update `manifests/ux-review.yaml`. |
| `api-experience-reviewer` | **Retire** | Overlaps `agents/api/glyph` + `apt-modern-api-designer`. |
| `service-readiness-reviewer` | **Retire** | Overlaps `agents/customer/apt-support-operations-reviewer` + the `service-readiness` skills. |
| `lovable-to-apt-architect` | **Keep as adapter-only** | Lovable-specific migration path; niche, not doctrine. Referenced by `manifests/lovable.yaml`. |
| `lovable-to-cloudflare-architect` | **Keep as adapter-only** | Same. |

## Next steps

1. Promote the four (`ai-output-auditor`, `apt-principles-reviewer`,
   `documentation-normalizer`, `intent-ux-reviewer`): write
   `agents/<domain>/<id>.md` in the `agentContract` format, run
   `npm run build:agents`, remove the hand-maintained adapter.
2. Retire the eight: delete the adapter, update any manifest that lists it, and
   note the replacement agent in the manifest comment.
3. Extend `build-agent-adapters.mjs` to also emit codex/cursor forms for the two
   kept adapter-only files, or accept them as Claude-only.
