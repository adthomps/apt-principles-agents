# EDI Lets Adam Ask One Question and Get One Accountable Answer From the Right APT Specialists

**Adam no longer has to know which of 85+ APT agents to invoke, in what order, or how to reconcile them when they disagree — EDI does that, then hands him one synthesized, approval-stamped answer.**

Applied Practical Thinking Workspace, August 2026 — EDI is a new orchestrator role in `apt-principles-agents` that sits between Adam and the review-council agent system. Adam states a problem in plain language; EDI classifies it, selects the right lead(s) and specialist(s), runs them, reconciles any disagreement between their recommendations, and returns a single answer with a clear approval status — instead of Adam manually deciding which of dozens of similarly-named agent files applies.

## The Problem

Today Adam has to personally know the shape of the whole agent system to get an answer. As of August 2026 that system has 76 review-council perspective agents across 12 domains and nine named accountable agent roles (Miranda, Javik, Wrex, Kaidan, Suvi, Drack, Glyph, Kasumi, Samara), alongside three different partial "router" candidates (`apt-router` and `apt-principal` in `agents/core/`, plus a separately-scoped `apt-router` in `agents/harness/`) — none of which actually delegates work or synthesizes a final answer. The nine named files are agent roles, not customer-research personas. A single payments-architecture question, for example, could plausibly go to Wrex, `apt-payment-architect.md`, or the harness's `apt-architect.md`, and Adam has had to work that out himself each time, then read each agent's output separately and reconcile any disagreement in his own head. This session alone spent hours discovering that 50 of those 76 agent files were undifferentiated stub templates — a problem invisible to Adam until someone went looking, precisely because no orchestrating layer was checking the system's own coherence on his behalf.

## The Solution

EDI takes one plain-language request from Adam, classifies its domain(s) and risk level, selects only the specialist perspectives actually relevant (not all 85+), invokes them, and reconciles any conflicting recommendations into one accountable response — approved, approved with conditions, or not approved — with the underlying evidence cited. When a decision requires Adam's own judgment (payment, security, privacy, compliance, legal, production-launch, or irreversible-migration calls, per the existing escalation rules every agent already follows), EDI surfaces it to him directly rather than deciding on his behalf. EDI is not a new AI capability — it is the missing coordination layer over agents that already exist and already work; it earns its own file entirely because none of the three current router candidates actually do this job today.

**"I don't want to become the router. I built 76 specialists so I wouldn't have to be the expert in everything myself — but right now I still have to be the dispatcher, and I'm the one who has to notice when the dispatcher itself is broken. EDI is what closes that loop."** — Adam, Owner, Applied Practical Thinking Workspace

## Getting Started

Adam asks EDI a question the way he'd ask a capable chief of staff — "is this payments architecture change safe to ship," "who should review this UI change," "is our risk agent coverage actually correct" — and EDI returns which specialists it consulted, what each found, how it reconciled disagreement, and its recommendation. No change to how the underlying 85+ agents work; EDI only changes how Adam reaches them.

**"[placeholder — replace with real customer quote once EDI has been used for a handful of real requests]"** — Adam, Owner, Applied Practical Thinking Workspace
