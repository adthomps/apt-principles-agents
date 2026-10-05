---
title: "Internal FAQ: EDI"
kind: "working-backwards-record"
domain: "product-planning"
status: "active"
owner: "APT"
last_updated: "2026-10-04"
source_paths: ["apt-principles-agents/product-team/working-backwards/active/wb-20260829-edi/faq-internal.md"]
---

# Internal FAQ: EDI

**Session:** wb-20260829-edi
**Stage:** Internal FAQ
**Press Release:** working-backwards/wb-20260829-edi/press-release.md

---

## Q: What's the actual selection mechanism — hardcoded rules, embeddings, an LLM call reading agent descriptions? How does it hold up as the roster grows past 85?

**Resolved 2026-08-30 — owner: Adam.** EDI makes one LLM call per request, feeding it the full `AGENT-CATALOG.md` (title + "When to Use" + domain for every agent) and asking it to select the relevant subset. This scales to any roster size purely by scaling catalog text — no code changes are needed as agent roles or specialists are added, since the 50-file fix earlier in this engagement means every agent now has a real "When to Use" statement to select against. EDI routes accountable agent roles and specialists, not product/customer personas. Tradeoff accepted: every request pays one classification call, and a bad classification is a real failure mode — mitigated by the transparency decision below (EDI always lists who it consulted), so a bad selection is visible to Adam rather than silent.

---

## Q: How does EDI "reconcile conflicting recommendations" concretely — is that a real algorithm, or another judgment call, and who reviews that judgment?

**Resolved 2026-08-30 — owner: Adam.** Two-step process. First, EDI checks whether any specialist's concern matches one of the existing hard escalation rules (payment, security, privacy, compliance, legal, production-launch, or irreversible-migration decisions) — if so, EDI does *not* attempt to resolve the disagreement itself; it surfaces the conflict to Adam directly, per the existing "escalate to the accountable human" pattern every agent already follows. If no escalation-rule match, EDI does one more LLM synthesis pass over the specialists' raw output, weighing evidence and risk per `apt-principal.md`'s existing principle, and writes the final verdict. The review of that judgment is Adam himself — the transparency decision below means the synthesis always ships with the underlying specialist findings, not just the conclusion, so Adam can spot-check it.

---

## Q: Where does EDI actually run — is it a Claude Code subagent, a skill, a script, or something new? None of the 3 existing router candidates are structured to do this.

**Resolved 2026-08-30 — owner: Adam.** EDI is a Skill/slash-command (e.g. `/edi`) that runs in Adam's main Claude Code session — not a new agent-file type, and not a standalone script. It reads the AGENT-CATALOG.md, invokes the relevant specialists via Claude Code's native Task tool (the same mechanism the top-level session already uses to invoke any subagent), collects their output, and performs the reconciliation/synthesis pass itself. This required no new capability to be invented: a grep across all `platforms/claude/source/agents/*.md` frontmatter confirmed no agent declares any capability to invoke another agent (only two `tools:` sets exist workspace-wide), so orchestration has to happen at the session/Skill level, not agent-to-agent. Per the original question, this is an architecture decision — an ADR for EDI should be written before Stage 3 Requirements, capturing this choice and the two mechanisms above.

---

## Q: Why now — what changed that makes this worth building today instead of continuing to route manually?

Nine named accountable agent roles (Miranda, Javik, Wrex, Kaidan, Suvi, Drack, Glyph, Kasumi, Samara) sit alongside the existing 76-agent council, and idea.txt proposes roughly 25 more agent roles. These are not customer-research personas. Manual routing was already imperfect at 76 agents (evidenced by the 50-file stub bug going unnoticed until this session went looking); it gets strictly harder, not easier, as the roster keeps growing. The cost of building EDI later only goes up.

---

## Q: What does success look like — how would Adam know EDI is working versus just adding a layer of indirection?

**Resolved 2026-08-30 — owner: Adam.** For a sample of real multi-specialist requests, EDI's synthesized answer matches what Adam would have concluded by manually invoking and reconciling the same specialists himself, in less wall-clock time than doing it by hand. This was the candidate metric drafted at Stage 2 and Adam has now agreed it as the bar, rather than defining a more formal quantitative target up front.

---

## Q: Does EDI get authority to approve or reject decisions on Adam's behalf, or does it only ever recommend?

Only recommend. This matches every existing agent's Escalation Rules verbatim: "Escalate unsupported payment, security, privacy, compliance, legal, production-launch, or irreversible migration decisions to the accountable human." EDI inherits that boundary — it can synthesize and recommend, but the Press Release is explicit that ADAM remains the approval authority. This is not open; it's a hard constraint carried over from the existing system, and any design that has EDI auto-approving should be treated as a bug, not a feature.

---

<!-- Covers engineering (selection mechanism, reconciliation mechanism, runtime architecture), business/leadership (why now, success metric), and governance/authority. No legal/compliance stakeholder beyond the inherited escalation-rules constraint — this is a single-owner internal tool, not a product with external regulatory exposure, so that category is addressed rather than omitted. All 3 blockers and the success-metric open item resolved 2026-08-30; see AGENT_CHARTER_MATRIX / session.json for the decision log. -->
