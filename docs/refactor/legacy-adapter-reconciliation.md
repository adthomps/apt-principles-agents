---
title: Legacy Adapter Reconciliation
kind: guide
domain: governance
status: active
owner: APT
last_updated: 2026-08-30
source_paths: ["apt-principles-agents/platforms/claude/source/agents"]
---

# Legacy Adapter Reconciliation

Fourteen files in `platforms/claude/source/agents/` had **no canonical
`agents/<domain>/<id>.md` source**. **Executed 2026-08-30**: 4 promoted to
canonical, 8 retired (adapter deleted, ledger entry → `retired`), 2 kept as
Claude-only adapter-only files. The table below records the outcome.

| Adapter | Outcome | Detail |
| --- | --- | --- |
| `ai-output-auditor` | **Promoted** | → `agents/engineering/ai-output-auditor.md` |
| `apt-principles-reviewer` | **Promoted** | → `agents/core/apt-principles-reviewer.md` |
| `documentation-normalizer` | **Promoted** | → `agents/docs/documentation-normalizer.md` |
| `intent-ux-reviewer` | **Promoted** | → `agents/design/intent-ux-reviewer.md` (first agent in `design`); `manifests/ux-review.yaml` repointed |
| `apt-readiness-auditor` | **Retired** | covered by `agents/harness/apt-repo-scanner` + `apt-verifier` |
| `repo-standardizer` | **Retired** | covered by `agents/harness/apt-installer` + `apt-repair-agent` |
| `cloudflare-architect` | **Retired** | covered by `agents/harness/apt-cloudflare-builder` + `agents/engineering/drack`; dropped from `manifests/cloudflare.yaml` |
| `cloudflare-react-hono-architect` | **Retired** | subsumed by `drack` |
| `cloudflare-modernization-architect` | **Retired** | covered by `agents/architecture/apt-modernization-architect` (added to `manifests/cloudflare.yaml`) |
| `documentation-architect` | **Retired** | covered by `agents/docs/apt-docs-reviewer` + `apt-product-hub-builder` |
| `api-experience-reviewer` | **Retired** | covered by `agents/api/glyph` + `apt-modern-api-designer` |
| `service-readiness-reviewer` | **Retired** | covered by `agents/customer/apt-support-operations-reviewer` + `service-readiness` skills |
| `lovable-to-apt-architect` | **Kept adapter-only** | Lovable-specific migration path; niche, not doctrine. `manifests/lovable.yaml`. |
| `lovable-to-cloudflare-architect` | **Kept adapter-only** | Same. |

## Remaining

The two kept adapter-only files are Claude-only (no codex/cursor form) and still
carry hand-maintained frontmatter. Either extend `build-agent-adapters.mjs` to
pass adapter-only Claude files through to codex/cursor, or accept them as
Claude-only. Retired adapters' `.claude/agents/<id>.md` copies in the consumers
are removed by the next `sync --force` (they show as `would-remove-retired`).
