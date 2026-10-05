# External FAQ: EDI

**Session:** wb-20260829-edi
**Stage:** External FAQ
**Press Release:** working-backwards/wb-20260829-edi/press-release.md

---

## Q: If I already know exactly which agent I want, doesn't going through EDI just add a routing hop?

No — EDI is meant to be optional at the point of use. Adam can still invoke any agent directly by name, exactly as he does today; nothing about EDI removes that path. EDI exists for the case where Adam knows the problem but not which of 85+ agents should own it, or where more than one specialist needs to weigh in and someone needs to reconcile them. If it's slower or more awkward than direct invocation for the cases Adam already knows how to route himself, that's a real risk to the design — see the Internal FAQ's cost/latency question.

---

## Q: Does EDI see every request I make, even ones I intended for one specific specialist?

Only requests actually routed through EDI. A direct invocation of, say, Wrex or Kasumi bypasses EDI entirely — it isn't a mandatory front door, it's an additional way in for requests that don't have an obvious single owner.

---

## Q: Do I have to phrase requests differently to use EDI?

**Resolved 2026-08-30 — owner: Adam.** No — fully unstructured. Adam types plain language exactly as he would to a person ("is this payments architecture change safe to ship"), with no required fields, tags, or format. This matches the Press Release's promise, and the LLM-catalog selection mechanism decided in the Internal FAQ already takes free text as its input, so unstructured phrasing adds no new constraint on the design.

---

## Q: What happens if EDI picks the wrong specialist, or misses one that should have weighed in?

Today, if Adam picks the wrong agent himself, he finds out because the answer looks off-topic and he tries a different one — the failure is visible immediately. **Resolved 2026-08-30 — owner: Adam.** EDI's answer now always opens with which specialists it selected and briefly why (e.g. "Consulted: Wrex (payments), Kasumi (security) — selected via catalog match on 'payment gateway migration'"), before the synthesized answer itself. Adam sees the selection every time, at no extra step, so a wrong or incomplete selection is visible rather than hidden behind a confident-looking answer.

---

## Q: Doesn't invoking EDI plus multiple specialists cost more time and tokens than just calling one agent directly?

Yes, when EDI is used for a request that only needed one specialist anyway — that's pure overhead. The value case is specifically the requests that today require Adam to invoke 2+ agents himself and reconcile them by hand (the payments-architecture example in the Press Release). [OPEN — owner: Adam] — there's no measurement yet of how often real requests are actually single-specialist versus multi-specialist, so it isn't yet known whether EDI's overhead is worth it on average. Not yet worked through as of 2026-08-30; deferred rather than blocking Requirements.

---

## Q: Why isn't this just `agents/harness/apt-router.md`, which already does something similar?

Because it's scoped to a different lifecycle. `apt-router` (harness) turns a request into a task packet for the install/discover/classify/validate/remediate/verify/approve workflow — it's about managing this repo's own distribution tooling, not about picking which review-council agent role or specialist should answer a question and reconciling their output. EDI would need to either extend that router's scope significantly or be a genuinely new, fourth thing. **Resolved 2026-08-30:** EDI is that fourth thing — a Skill/slash-command running in Adam's main session, per the Internal FAQ's runtime-architecture decision — not an extension of the harness router.

---

## Q: If EDI's synthesis is wrong, how would I notice, compared to reading each specialist's raw output myself?

**Resolved 2026-08-30 — owner: Adam.** This was the sharpest risk in the whole proposal. It's addressed by the same transparency decision as the selection question above: EDI's output always includes which specialists were consulted and their underlying findings, not just the reconciled conclusion — so Adam can spot-check the synthesis against the raw specialist output any time he doesn't trust it, the same way he does today, just with the reconciliation already done for him as a starting point rather than a replacement for his own read.

---

<!-- 7 questions covering displacement, workflow change, data/scope, failure modes, cost/value, competition/differentiation, and trust — all genuine, none softballs. 3 of 4 open items and the trust blocker resolved 2026-08-30; cost/value measurement (single- vs multi-specialist request mix) remains open and deferred, not blocking. -->
