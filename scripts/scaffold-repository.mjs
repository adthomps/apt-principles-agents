#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspace = path.resolve(root, "..");
const today = "2026-06-27";

const title = (slug) => slug.split(/[-/]/).map((word) => {
  const fixed = { ai: "AI", api: "API", ui: "UI", json: "JSON", rpc: "RPC", http: "HTTP", graphql: "GraphQL", avs: "AVS", cvv: "CVV", prd: "PRD", brd: "BRD", srd: "SRD", kb: "KB", llm: "LLM", nvp: "NVP", soap: "SOAP", xml: "XML", hono: "Hono", cloudflare: "Cloudflare" };
  return fixed[word] || word.charAt(0).toUpperCase() + word.slice(1);
}).join(" ");

function write(relative, content, { overwrite = true } = {}) {
  const destination = path.join(root, relative);
  if (!overwrite && existsSync(destination)) return;
  mkdirSync(path.dirname(destination), { recursive: true });
  writeFileSync(destination, `${content.trim()}\n`, "utf8");
}

function frontmatter(name, kind, source = "APT consolidation") {
  return `---
title: ${name}
kind: ${kind}
status: active
owner: APT
last_updated: ${today}
source: ${source}
---`;
}

const domainGuidance = {
  thinking: {
    focus: "frame the real problem, expose assumptions, compare meaningful options, and explain decisions in beginner-clear language",
    evidence: "problem statement, desired outcome, constraints, assumptions, options, tradeoffs, decision, and unresolved questions",
    risks: "solution-first framing, false certainty, hidden constraints, and decisions without measurable outcomes"
  },
  design: {
    focus: "start from user intent and align journeys, roles, permissions, states, accessibility, UI, API, documentation, and demos",
    evidence: "audience and intent map, journey, state model, permission matrix, UI/API alignment, accessibility checks, and demo flow",
    risks: "screen-first design, missing states, inaccessible interactions, role leakage, and demos that hide operational reality"
  },
  architecture: {
    focus: "define boundaries, contracts, ownership, failure modes, deployment, observability, modernization paths, and reversibility",
    evidence: "context and boundary diagrams, responsibility matrix, contracts, data flow, failure handling, rollout, rollback, and operations",
    risks: "unclear ownership, accidental coupling, irreversible migrations, provider leakage, and architecture without operational evidence"
  },
  execution: {
    focus: "turn approved intent and architecture into small coherent increments with validation, release, support, and learning loops",
    evidence: "implementation plan, acceptance criteria, validation matrix, release record, runbook, support handoff, and captured learning",
    risks: "large unreviewable changes, untested assumptions, missing rollback, documentation drift, and support arriving after launch"
  },
  api: {
    focus: "select API styles from audience and behavior, then make contracts predictable, secure, observable, evolvable, and usable by humans and agents",
    evidence: "audience, use cases, protocol decision, schema, auth, errors, idempotency, pagination, webhooks, examples, tests, and deprecation policy",
    risks: "fashion-driven protocol choices, ambiguous errors, unsafe retries, undocumented permissions, weak compatibility, and examples that do not execute"
  },
  payments: {
    focus: "model the complete transaction lifecycle and explicitly address money movement, tokenization, risk, reconciliation, funding, support, and provider differences",
    evidence: "lifecycle states, amount and currency rules, idempotency, provider mapping, token boundaries, settlement/funding flow, reconciliation, disputes, and support identifiers",
    risks: "invented provider behavior, double processing, confused authorization and settlement, sensitive-data exposure, incomplete reversals, and weak reconciliation"
  },
  ecommerce: {
    focus: "design the customer-to-merchant journey from discovery through checkout, payment, fulfillment signals, returns, support, and partner operations",
    evidence: "journey and state map, checkout options, payment lifecycle, merchant and partner onboarding, failure recovery, accessibility, analytics, and support flow",
    risks: "conversion-only design, hidden fees or states, brittle checkout recovery, unclear merchant operations, and payment behavior detached from customer intent"
  },
  modernization: {
    focus: "inventory legacy behavior before designing a facade, adapter, bridge, parity plan, dual run, deprecation path, and rollback",
    evidence: "legacy inventory, field/error/auth mappings, parity matrix, contract and replay tests, observability, dual-run metrics, communications, and rollback plan",
    risks: "forced big-bang migration, silent parity loss, incorrect error translation, token incompatibility, and deprecation without customer evidence"
  },
  documentation: {
    focus: "publish one canonical truth through audience-specific layers, executable examples, diagrams, troubleshooting, and implementation blueprints",
    evidence: "audience map, canonical source, business and partner guides, developer contract, support runbook, AI examples, diagrams, demos, and freshness owner",
    risks: "one guide for every audience, copied truths, non-runnable examples, missing support identifiers, and docs that describe intent instead of behavior"
  },
  "service-readiness": {
    focus: "prove the service can launch, operate, degrade safely, be supported, be troubleshot, and communicate change",
    evidence: "readiness checklist, SLOs and telemetry, runbook, known issues, escalation paths, knowledge articles, release communications, and rollback",
    risks: "launch without ownership, alerts without action, missing customer-safe explanations, unclear escalation, and undocumented operational dependencies"
  },
  "security-risk": {
    focus: "identify trust boundaries, permissions, sensitive data, abuse paths, privacy impact, compliance dependencies, and required human approvals",
    evidence: "threat and data-flow review, role-permission matrix, secret handling, retention, abuse controls, audit trail, residual risk, and approval owner",
    risks: "implicit authorization, excessive data collection, sensitive logs, unsupported compliance claims, and AI-generated security conclusions without review"
  },
  "stablecoin-crypto": {
    focus: "separate mature capability from emerging or future-looking options and require legal, compliance, custody, counterparty, settlement, and risk review",
    evidence: "maturity label, asset and network assumptions, custody model, on/off-chain flow, finality, refunds, payout, reconciliation, volatility, compliance, and human approval",
    risks: "hype, uncertain finality, unsupported reversals, custody ambiguity, counterparty exposure, regulatory assumptions, and card-like dispute expectations"
  },
  ai: {
    focus: "route work by risk and capability, constrain tools, ground claims in sources, preserve human approval, and evaluate outputs",
    evidence: "task packet, selected sources, model rationale, tool boundaries, evaluation cases, reviewer outcome, residual risk, and approval record",
    risks: "unsupported claims, overpowered tools, weak-model routing for high-stakes work, hidden delegation, prompt drift, and unreviewed production action"
  },
  "ai-agents": {
    focus: "route work by risk and capability, constrain tools, ground claims in sources, preserve human approval, and evaluate outputs",
    evidence: "task packet, routing decision, selected skills and agents, source evidence, evaluation, review outcome, and approval record",
    risks: "unsupported claims, excessive context, weak-model routing, unclear handoffs, and automation without approval"
  },
  product: {
    focus: "connect customer evidence and business outcomes to scope, prioritization, requirements, roadmap, metrics, and launch decisions",
    evidence: "audience and problem, outcome measures, requirements, alternatives, dependencies, risks, roadmap, readiness, and decision record",
    risks: "feature-first planning, roadmap certainty without evidence, missing support impact, and requirements detached from delivery constraints"
  },
  engineering: {
    focus: "implement maintainable changes that preserve contracts, limit blast radius, validate behavior, and update operational knowledge",
    evidence: "change boundary, contract impact, tests, security review, performance evidence, rollout, rollback, and documentation updates",
    risks: "broad rewrites, implicit behavior changes, insufficient tests, unsafe migrations, and code/docs drift"
  }
};

function guide(domain) {
  return domainGuidance[domain] || domainGuidance.execution;
}

const principleDomains = {
  thinking: ["practical-thinking", "decision-framing", "tradeoff-analysis", "assumption-checking", "beginner-clarity"],
  design: ["intent-based-design", "role-based-experience", "customer-journey-design", "ui-api-alignment", "accessibility", "demo-first-design"],
  architecture: ["system-architecture", "api-architecture", "payment-architecture", "integration-architecture", "cloudflare-hono-architecture", "modernization-architecture", "event-driven-architecture"],
  execution: ["delivery-increments", "quality-and-testing", "release-and-change-management", "operations-and-support", "knowledge-and-learning"],
  api: ["modern-api-design", "json-first-design", "rest-api-design", "json-rpc-design", "graphql-review", "webhook-design", "http-query-method-review", "api-versioning", "api-errors", "api-auth", "api-idempotency", "api-observability", "ai-consumable-apis", "human-consumable-apis"],
  payments: ["payment-lifecycle", "authorization-capture-settlement", "refunds-voids-disputes", "tokenization", "recurring-and-subscriptions", "hosted-payments", "embedded-payments", "gateway-abstraction", "transaction-intelligence", "fraud-risk", "reconciliation-funding"],
  ecommerce: ["checkout-design", "cart-to-payment-flow", "merchant-onboarding", "marketplace-payments", "payment-links", "invoice-payments", "customer-payment-experience"],
  modernization: ["legacy-api-inventory", "api-facade-design", "soap-to-rest", "xml-to-rest", "nvp-to-rest", "backward-compatibility", "parity-matrix", "dual-run-migration", "deprecation-planning"],
  documentation: ["audience-layered-docs", "product-hub-standard", "implementation-blueprints", "api-examples", "ai-usage-examples", "diagrams-and-demos", "migration-guides", "support-ready-docs"],
  "service-readiness": ["launch-readiness", "operational-readiness", "support-readiness", "troubleshooting-readiness", "knowledge-base-readiness", "escalation-paths", "release-communications"],
  "security-risk": ["security-review", "privacy-review", "compliance-awareness", "fraud-risk-review", "permission-design", "data-handling"],
  "stablecoin-crypto": ["stablecoin-readiness", "crypto-payment-review", "wallet-payment-design", "on-chain-off-chain-design", "digital-asset-risk", "settlement-and-reconciliation"],
  ai: ["agent-design", "skill-design", "model-routing", "local-llm-routing", "prompt-engineering", "swarm-review", "ai-safety-and-evaluation"]
};

function principleDoc(domain, slug) {
  const g = guide(domain);
  const maturity = domain === "stablecoin-crypto" ? "\n## Maturity Labels\n\nEvery decision must state one: **Mature today**, **Emerging**, **Future-looking**, or **Requires legal/compliance/risk review**.\n" : "";
  return `${frontmatter(title(slug), "principle", `apt-principles and apt-agent-standards`)}

# ${title(slug)}

## Purpose

This principle helps APT teams ${g.focus}. It is guidance for decisions and required evidence, not a claim about any specific vendor or product.

## Principles

- Begin with the intended outcome and affected audiences.
- Separate verified facts, assumptions, recommendations, and open questions.
- Prefer explicit contracts, reversible steps, and supportable behavior.
- Preserve compatibility when it materially reduces customer or partner disruption.
- Record the evidence needed for another person or agent to review the decision.

## Required Artifacts

At minimum, produce: ${g.evidence}.

## Tradeoffs And Failure Modes

Review for ${g.risks}. When evidence is incomplete, mark the gap rather than inventing certainty.
${maturity}
## Review Questions

1. What outcome and audience does this serve?
2. Which source-backed facts constrain the decision?
3. What alternatives and migration effects were considered?
4. How will engineering, security, documentation, and support verify readiness?
5. What remains uncertain and who must approve it?

## Related

- [APT Principles](../README.md)
- [Skills](../../skills/README.md)
- [Templates](../../templates/README.md)`;
}

const skillDomains = {
  thinking: ["problem-framing", "decision-rationalization", "tradeoff-analysis", "assumption-check", "beginner-clarity-review"],
  design: ["intent-based-ui-design", "role-permission-flow-design", "customer-journey-mapping", "ui-api-alignment-review", "demo-flow-design"],
  architecture: ["system-architecture-review", "api-architecture-review", "payment-architecture-review", "integration-architecture-review", "bridge-architecture-review", "cloudflare-hono-architecture"],
  api: ["modern-api-design", "json-first-design", "rest-api-design", "json-rpc-design", "graphql-review", "webhook-design", "http-query-method-review", "api-error-design", "api-auth-design", "api-idempotency-review", "intent-based-api-design", "ai-consumable-api-design"],
  modernization: ["api-modernization-planner", "legacy-api-inventory", "api-bridge-architect", "soap-to-rest-mapper", "xml-to-rest-mapper", "nvp-to-rest-mapper", "legacy-api-parity-reviewer", "api-contract-test-generator", "api-deprecation-planner", "dual-run-migration-planner"],
  payments: ["payment-lifecycle-analysis", "gateway-design", "gateway-abstraction", "authorize-net-review", "cybersource-review", "visa-acceptance-review", "accept-suite-review", "tokenization-review", "authorization-capture-settlement-review", "refund-void-dispute-review", "settlement-funding-review", "transaction-intelligence-analysis", "response-code-analysis", "chargeback-risk-review", "fraud-rule-review", "avs-cvv-analysis", "decline-analysis", "retry-strategy-review"],
  ecommerce: ["checkout-experience-review", "hosted-payment-design", "embedded-payment-design", "subscription-payment-review", "recurring-payments-review", "merchant-onboarding-review", "partner-acquirer-onboarding-review", "payment-links-review", "invoice-payments-review", "marketplace-payments-review"],
  documentation: ["product-hub-builder", "audience-layered-docs", "business-guide-writer", "partner-acquirer-guide-writer", "developer-guide-writer", "api-guide-writer", "api-example-builder", "ai-example-builder", "implementation-blueprint-writer", "diagram-generator", "demo-plan-writer", "migration-guide-writer", "operations-guide-writer", "troubleshooting-guide-writer"],
  product: ["prd-writer", "brd-writer", "srd-writer", "roadmap-planner", "feature-prioritization", "voice-of-customer", "competitive-analysis"],
  engineering: ["implementation-review", "refactor-safety", "contract-change-review"],
  "service-readiness": ["launch-readiness-review", "support-readiness-review", "operational-runbook-writer", "kb-article-writer", "escalation-path-review", "release-communication-writer"],
  "security-risk": ["security-review", "privacy-review", "permission-review", "data-handling-review"],
  "stablecoin-crypto": ["stablecoin-readiness-review", "crypto-payment-risk-review", "wallet-checkout-review", "digital-asset-settlement-review", "on-chain-off-chain-payment-design", "custody-risk-review"],
  "ai-agents": ["agent-routing", "model-selection", "local-llm-routing", "prompt-engineering", "skill-authoring", "micro-group-review", "swarm-review", "red-team-review", "troubleshooting-swarm", "hallucination-review"]
};

function skillDoc(domain, slug) {
  const g = guide(domain);
  const principleDomain = domain === "ai-agents" ? "ai" : domain === "product" ? "thinking" : domain === "engineering" ? "execution" : domain;
  const emerging = domain === "stablecoin-crypto" ? "\n## TODO\n\nReplace assumptions with jurisdiction-, provider-, asset-, and custody-specific evidence before production use.\n" : "";
  return `---
name: ${slug}
description: Use when work must ${g.focus}.
kind: skill
status: active
owner: APT
last_updated: ${today}
source: consolidated APT guidance
---

# ${title(slug)}

## Purpose

Produce a reviewable ${title(slug).toLowerCase()} outcome that is grounded in repository evidence and explicit about uncertainty.

## When to Use

Use for planning, design, implementation review, migration, troubleshooting, or documentation where the task must ${g.focus}.

## Inputs

- Goal, audience, scope, constraints, and success criteria.
- Relevant source files, contracts, examples, logs, and decisions.
- Known risks, assumptions, dependencies, and approval boundaries.

## Process

1. Restate the intended outcome and affected audiences.
2. Inventory exact current behavior and source-backed constraints.
3. Apply the relevant APT principles and identify missing evidence.
4. Compare viable options, including compatibility and operational effects.
5. Produce the required artifacts: ${g.evidence}.
6. Review ${g.risks}; separate blockers, recommendations, and open questions.

## Outputs

A concise recommendation, evidence map, required changes, risks, validation plan, support/documentation impact, and approval status.

## Quality Bar

The output is practical, source-backed, audience-aware, testable, reversible where possible, and does not state assumptions as facts.

## References

- [${title(principleDomain)} principles](../../../principles/${principleDomain}/README.md)
- [Templates](../../../templates/README.md)
- [Agents](../../../agents/README.md)
${emerging}`;
}

const agentDomains = {
  core: ["apt-router", "apt-principal", "apt-thinking-lead", "apt-design-lead", "apt-architecture-lead", "apt-execution-lead"],
  product: ["apt-product-manager", "apt-prd-writer", "apt-launch-readiness-lead", "apt-voice-of-customer-analyst"],
  architecture: ["apt-principal-architect", "apt-api-architect", "apt-integration-architect", "apt-modernization-architect"],
  engineering: ["apt-engineering-reviewer", "apt-cloudflare-hono-engineer", "apt-refactor-agent"],
  api: ["apt-api-reviewer", "apt-modern-api-designer", "apt-api-migration-planner", "apt-api-bridge-reviewer", "apt-ai-consumable-api-reviewer"],
  payments: ["apt-payment-architect", "apt-principal-payment-consultant", "apt-transaction-intelligence-analyst", "apt-chargeback-risk-reviewer", "apt-fraud-risk-reviewer", "apt-gateway-migration-reviewer", "apt-stablecoin-readiness-reviewer", "apt-crypto-payment-risk-reviewer"],
  ecommerce: ["apt-commerce-experience-reviewer", "apt-checkout-reviewer", "apt-merchant-onboarding-reviewer", "apt-partner-acquirer-reviewer"],
  docs: ["apt-docs-reviewer", "apt-product-hub-builder", "apt-audience-docs-reviewer", "apt-api-docs-writer", "apt-implementation-blueprint-writer", "apt-demo-and-diagram-planner"],
  customer: ["apt-business-user-reviewer", "apt-bank-acquirer-reviewer", "apt-developer-integrator-reviewer", "apt-support-operations-reviewer", "apt-ai-agent-user-reviewer"],
  "beginner-reviewers": ["apt-beginner-user-reviewer", "apt-new-merchant-reviewer", "apt-new-developer-reviewer", "apt-new-support-agent-reviewer"],
  risk: ["apt-security-risk-reviewer", "apt-permissions-reviewer", "apt-compliance-awareness-reviewer"]
};

function agentSkillDomain(domain, slug) {
  if (domain === "docs") return "documentation";
  if (domain === "customer" || domain === "beginner-reviewers") return "thinking";
  if (domain === "risk") return "security-risk";
  if (slug.includes("stablecoin") || slug.includes("crypto")) return "stablecoin-crypto";
  return skillDomains[domain] ? domain : domain === "core" ? "thinking" : "execution";
}

function agentDoc(domain, slug) {
  const skillDomain = agentSkillDomain(domain, slug);
  const g = guide(skillDomain);
  const skill = Object.entries(skillDomains).find(([key]) => key === skillDomain)?.[1]?.[0] || "problem-framing";
  return `${frontmatter(title(slug), "agent", "apt-agent-standards roles and APT doctrine")}

# ${title(slug)}

## Role

Provide the ${title(slug).replace(/^APT /, "")} perspective while keeping APT principles, evidence, and human accountability visible.

## When to Use

Use when a decision or deliverable must ${g.focus}, especially when it affects multiple audiences or high-accuracy domains.

## Responsibilities

- Establish scope, facts, assumptions, and affected audiences.
- Apply relevant principles and skills without redefining canonical doctrine.
- Identify blockers, risks, tradeoffs, and required approvals.
- Make recommendations concrete enough to validate.

## Required Skills

- [${title(skill)}](../../skills/${skillDomain}/${skill}/SKILL.md)
- Cross-audience review and source verification.

## Inputs

Goal, current-state evidence, constraints, contracts, decisions, examples, validation results, and known risks.

## Process

1. Confirm the review question and decision owner.
2. Inspect exact evidence and distinguish fact from assumption.
3. Evaluate the work from this role's perspective.
4. Return concerns, recommended changes, risks, and questions.
5. State approval as approved, approved with conditions, or not approved.

## Outputs

Perspective, concerns, recommended changes, risks, questions, evidence references, and approval status.

## Escalation Rules

Escalate unsupported payment, security, privacy, compliance, legal, production-launch, or irreversible migration decisions to the accountable human and relevant expert.

## Quality Bar

Advice is source-backed, specific, audience-aware, proportionate to risk, and clear about uncertainty and ownership.`;
}

const templates = `
product/product-overview.md
product/audience-map.md
product/product-hub-checklist.md
product/product-decision-record.md
prd/PRD.md
brd/BRD.md
srd/SRD.md
api/api-design-review.md
api/api-contract.md
api/api-error-model.md
api/api-example.md
api/webhook-design.md
api/openapi-review.md
api/ai-api-usage-example.md
payments/payment-lifecycle.md
payments/transaction-analysis.md
payments/payment-risk-review.md
payments/gateway-migration-map.md
payments/chargeback-risk-review.md
migration/legacy-api-inventory.md
migration/parity-matrix.md
migration/field-mapping.md
migration/bridge-design.md
migration/deprecation-plan.md
migration/dual-run-plan.md
docs/business-guide.md
docs/bank-acquirer-partner-guide.md
docs/developer-integrator-guide.md
docs/api-guide.md
docs/implementation-blueprint.md
docs/troubleshooting-guide.md
docs/demo-plan.md
docs/ai-usage-examples.md
launch-readiness/launch-readiness-checklist.md
support/support-runbook.md
support/kb-article.md
support/escalation-path.md
support/customer-safe-explanation.md
agent-reviews/micro-group-review.md
agent-reviews/beginner-user-review.md
agent-reviews/security-risk-review.md
agent-reviews/api-review.md
agent-reviews/payment-review.md
agent-reviews/product-hub-review.md
decision-records/ADR.md`.trim().split("\n");

const prompts = `
audits/repo-audit.md
audits/product-hub-audit.md
audits/api-audit.md
audits/payment-api-audit.md
planning/product-plan.md
planning/api-design-plan.md
planning/payment-product-plan.md
planning/implementation-blueprint-plan.md
reviews/api-design-review.md
reviews/payment-review.md
reviews/ui-api-alignment-review.md
reviews/docs-review.md
reviews/security-risk-review.md
modernization/api-modernization-plan.md
modernization/soap-to-rest-plan.md
modernization/xml-to-rest-plan.md
modernization/nvp-to-rest-plan.md
modernization/bridge-architecture-review.md
migration/migration-guide.md
migration/parity-matrix.md
migration/dual-run-migration.md
migration/deprecation-plan.md
troubleshooting/payment-decline.md
troubleshooting/api-error.md
troubleshooting/webhook-issue.md
troubleshooting/settlement-funding-issue.md
troubleshooting/customer-confusion.md
product-hubs/create-product-hub.md
product-hubs/review-product-hub.md
product-hubs/create-ai-examples.md
product-hubs/create-demo-plan.md
swarm-reviews/micro-group-review.md
swarm-reviews/beginner-user-review.md
swarm-reviews/expert-panel-review.md
swarm-reviews/red-team-review.md
swarm-reviews/design-rationalization.md
swarm-reviews/decision-review.md
swarm-reviews/troubleshooting-swarm.md`.trim().split("\n");

function artifactDomain(relative) {
  const first = relative.split("/")[0];
  return first === "docs" ? "documentation" : first === "migration" ? "modernization" : first === "agent-reviews" ? "ai-agents" : first === "launch-readiness" || first === "support" ? "service-readiness" : first === "prd" || first === "brd" || first === "srd" ? "product" : domainGuidance[first] ? first : "execution";
}

function templateDoc(relative) {
  const slug = path.basename(relative, ".md");
  const domain = artifactDomain(relative);
  const g = guide(domain);
  return `${frontmatter(title(slug), "template", "APT source templates")}

# ${title(slug)}

## Purpose And Decision

- Owner:
- Date:
- Status:
- Intended outcome:
- Audiences:
- Decision or deliverable:

## Current State And Evidence

- Verified facts:
- Source references:
- Constraints and dependencies:
- Assumptions requiring validation:

## Proposed Approach

Describe how the work will ${g.focus}.

## Required Detail

Capture ${g.evidence}.

## Risks And Alternatives

- Alternatives considered:
- Tradeoffs:
- Security/compliance considerations:
- Migration and support impact:
- Open questions:

## Validation And Approval

- Acceptance criteria:
- Tests or review evidence:
- Rollout and rollback:
- Approval owner and status:`;
}

function promptDoc(relative) {
  const slug = path.basename(relative, ".md");
  const domain = artifactDomain(relative);
  const g = guide(domain);
  return `${frontmatter(title(slug), "prompt", "APT prompt consolidation")}

# ${title(slug)}

## Use

Use this prompt to ${g.focus}.

## Prompt

You are performing an APT ${title(slug).toLowerCase()}.

1. State the goal, audiences, scope, and success criteria.
2. Inspect exact sources before making claims.
3. Separate verified facts, assumptions, recommendations, and open questions.
4. Apply the relevant APT principles and identify missing artifacts.
5. Return findings ordered by impact, followed by recommended changes.
6. Cover implementation, testing, migration, security/risk, documentation, support, and approval implications.

Expected evidence: ${g.evidence}.

Do not invent product behavior. For payment, security, compliance, legal, or production-launch decisions, identify the required expert or human approval.`;
}

const exampleNames = ["payment-api", "ecommerce-checkout", "transaction-intelligence", "api-bridge", "soap-to-rest", "xml-to-rest", "nvp-to-rest", "stablecoin-payment", "intent-based-ui", "intent-based-api", "beginner-user-review"];

function exampleDoc(slug) {
  const domain = slug.includes("stablecoin") ? "stablecoin-crypto" : slug.includes("checkout") ? "ecommerce" : slug.includes("payment") || slug.includes("transaction") ? "payments" : slug.includes("rest") || slug.includes("bridge") ? "modernization" : slug.includes("api") ? "api" : slug.includes("ui") ? "design" : "thinking";
  const g = guide(domain);
  const maturity = domain === "stablecoin-crypto" ? "\n**Maturity:** Emerging; requires legal, compliance, custody, counterparty, and risk review.\n" : "";
  return `${frontmatter(title(slug), "example", "APT consolidated examples")}

# ${title(slug)}

## Scenario

A team needs a reviewable starter pattern for ${title(slug).toLowerCase()} without assuming provider-specific behavior.
${maturity}
## Audience

Business/merchant, partner/acquirer, integrator/developer, support/operations, product/internal teams, and AI automation.

## Problem

The current journey, contracts, risks, and operational handoffs are incomplete or spread across multiple artifacts.

## Suggested Architecture

Start from intent; map UI, API, permissions, lifecycle states, data boundaries, observability, support identifiers, and a reversible rollout. The design should ${g.focus}.

## Relevant Principles

- [${title(domain)}](../../principles/${domain}/README.md)

## Relevant Skills And Agents

- Use the ${title(domain)} skill catalog and the closest specialist reviewer.

## Example Output Or Flow

Intent → validated request → explicit state transition → durable identifier → observable outcome → audience-specific response → reconciliation/support evidence.

## Open Questions

- Which behavior is verified versus assumed?
- What parity, security, compliance, or support evidence is missing?
- Who owns launch approval and rollback?`;
}

function indexDoc(name, kind, entries, intro) {
  return `${frontmatter(name, kind)}

# ${name}

${intro}

${entries.map((entry) => `- [${title(entry)}](${entry}${entry.endsWith(".md") ? "" : "/README.md"})`).join("\n")}`;
}

// Root files
write(".gitignore", `.DS_Store
node_modules/
.tmp/
*.log
`);
write("package.json", JSON.stringify({
  name: "apt-principles-agents",
  version: "0.1.0",
  private: true,
  type: "module",
  scripts: {
    validate: "node scripts/validate-repository.mjs",
    test: "node scripts/test-installers.mjs",
    check: "npm run validate && npm run test"
  },
  engines: { node: ">=18" }
}, null, 2));

write("README.md", `${frontmatter("APT Principles + Agents", "repository")}

# APT Principles + Agents

**apt-principles-agents** is the canonical operating system for APT thinking, design, architecture, and execution. It consolidates the doctrine from **apt-principles** with the reusable agent workflows from **apt-agent-standards** while keeping principles distinct from procedures and platform adapters.

## Four Pillars

1. **Thinking** frames the real problem, assumptions, outcomes, and tradeoffs.
2. **Design** aligns intent, audiences, journeys, roles, permissions, UI, and API.
3. **Architecture** defines boundaries, contracts, data, integration, modernization, deployment, and failure handling.
4. **Execution** turns decisions into validated increments, releases, operations, support, and learning.

## Use It As A Human

Start in [principles](principles/README.md), choose a [template](templates/README.md), use a [skill](skills/README.md) for the workflow, and ask the relevant [agent perspective](agents/README.md) to review the result. Product-facing work should use a [Product Hub](product-hubs/README.md).

## Use It With AI Tools

- **Codex:** read **AGENTS.md** and **CODEX.md**; install selected skills under **.codex/skills/**.
- **GitHub Copilot:** use **.github/copilot-instructions.md**, **.github/skills/**, and **.github/prompts/** mappings described in [the adapter](platforms/github-copilot/README.md).
- **Claude:** read **AGENTS.md** and **CLAUDE.md**; expose selected skills under **.claude/skills/**.
- **Gemini:** read **AGENTS.md** and **GEMINI.md**; map workflows into **.gemini/commands/**.
- **Local models:** use them for low-risk classification, triage, summarization, and routing; escalate complex architecture, payment, security, and major-refactor work.

## Install Selected Assets

Choose a manifest such as **core**, **payments**, **api-modernization**, **documentation**, **product-hub**, or **full**, then run:

\`\`\`powershell
./installers/install-skills.ps1 -Target ../my-project -Manifest core -DryRun
\`\`\`

\`\`\`bash
./installers/install-skills.sh --target ../my-project --manifest core --dry-run
\`\`\`

Existing files are skipped by default. The force option creates timestamped backups before replacement.

## Product Hubs And Audience Layers

A Product Hub is the canonical product-facing package for business/merchant, bank/acquirer/partner, integrator/developer, support/operations, product/internal, and AI-agent audiences. Each layer shares one verified product truth but answers the questions and operational needs of its audience.

## Domain Coverage

The repository includes API design and modernization; payments and ecommerce; service readiness; security and risk; cautious stablecoin/crypto readiness; documentation; product planning; model routing; and compatibility bridge patterns for SOAP, XML, NVP, legacy JSON, provider-specific APIs, checkout forms, and callback-to-webhook migrations.

## Reviews

Use micro-group review for focused cross-functional decisions and swarm review for broad, high-risk work. Every reviewer returns perspective, concerns, recommended changes, risks, questions, and approval status. Always include a beginner reviewer for onboarding, APIs, guides, UI journeys, migrations, troubleshooting, and Product Hubs.

## Contribute

Put durable decision guidance in **principles/**, procedures in **skills/**, accountable perspectives in **agents/**, reusable inputs in **templates/** or **prompts/**, and concrete demonstrations in **examples/**. Add cross-links, provenance, tests, and audience impact; run **npm run check**.

## Provenance

See [migration from the old repositories](docs/migration-from-old-repos.md) and [source provenance](docs/archive/source-provenance/README.md).`);

write("AGENTS.md", `${frontmatter("APT Agent Instructions", "instruction")}

# AGENTS

1. Start from the relevant APT principles: Thinking, Design, Architecture, then Execution.
2. Inspect exact sources before proposing or changing behavior.
3. Produce practical outputs with owners, evidence, validation, rollout, rollback, documentation, and support impact.
4. Use Product Hubs and audience-layered documentation for product-facing work.
5. Consider business/merchant, bank/acquirer/partner, integrator/developer, support/operations, product/internal, and AI-agent audiences.
6. Prefer JSON-first APIs when the audience and behavior support it; choose REST, JSON-RPC, GraphQL, webhooks, events, or other patterns from evidence rather than fashion.
7. Modernize legacy systems through bridge, facade, adapter, parity, dual-run, and deprecation patterns when they reduce disruption.
8. Include operational and service readiness in architecture and launch recommendations.
9. Use micro-group or swarm review when decisions affect several audiences; include a beginner reviewer.
10. Treat payment, ecommerce, API, security, privacy, compliance, and migration work as high-accuracy domains.
11. Do not invent product behavior or unsupported claims. Preserve uncertainty as an open question with an owner.
12. Keep canonical principles separate from skills, prompts, examples, adapters, and archived history.
13. Never edit generated outputs as source; update the authored artifact and rerun its generator or validator.
14. Run **npm run check** before claiming completion.`);

write("CODEX.md", `${frontmatter("Codex Guidance", "instruction")}

# CODEX

Inspect repository instructions and relevant principles first. Plan coherent changes before editing; use the smallest applicable skills and agent perspectives. Preserve source material and provenance, update documentation/examples with behavior, and validate in proportion to risk. Final summaries must separate created, modified, archived, validation, residual risk, and open items.`);

write("CLAUDE.md", `${frontmatter("Claude Guidance", "instruction")}

# CLAUDE

Load **AGENTS.md** and relevant APT principles before role-specific work. Use skills for repeatable procedures, Product Hubs for product documentation, and audience layers for business, partner, developer, support, internal, and automation needs. Apply beginner and micro-group review to major changes, and keep assumptions distinct from verified facts.`);

write("GEMINI.md", `${frontmatter("Gemini Guidance", "instruction")}

# GEMINI

Treat **AGENTS.md** as the main source of truth and this file as Gemini project context. Reuse the same principles and skills as other assistants. Map repeatable workflows into **.gemini/commands/**, keep configuration in **.gemini/config.yaml**, record style in **.gemini/styleguide.md**, and require expert/human review for high-accuracy decisions.`);

// Principles
for (const [domain, slugs] of Object.entries(principleDomains)) {
  for (const slug of slugs) write(`principles/${domain}/${slug}.md`, principleDoc(domain, slug));
  write(`principles/${domain}/README.md`, indexDoc(`${title(domain)} Principles`, "index", slugs.map((s) => `${s}.md`), `Canonical guidance for ${guide(domain).focus}.`));
}
write("principles/stablecoin-crypto/README.md", `${indexDoc("Stablecoin Crypto Principles", "index", principleDomains["stablecoin-crypto"].map((s) => `${s}.md`), `Canonical guidance for ${guide("stablecoin-crypto").focus}.`)}

## Required Maturity Labels

Every active artifact must state one or more of: **Mature today**, **Emerging**, **Future-looking**, or **Requires legal/compliance/risk review**.`);
write("principles/README.md", indexDoc("APT Principles", "index", Object.keys(principleDomains), "Durable guidance organized around the four pillars and cross-cutting product, API, payment, documentation, readiness, risk, and AI domains."));

// Skills
for (const [domain, slugs] of Object.entries(skillDomains)) {
  for (const slug of slugs) write(`skills/${domain}/${slug}/SKILL.md`, skillDoc(domain, slug));
}
write("skills/README.md", `${frontmatter("APT Skills", "index")}

# APT Skills

Skills are repeatable procedures. Each skill defines purpose, triggers, inputs, process, outputs, quality bar, and references. Select the smallest skill set that covers the task; principles remain authoritative when a procedure and doctrine appear to conflict.

${Object.keys(skillDomains).map((d) => `- **${title(d)}:** \`skills/${d}/\``).join("\n")}`);

// Agents
for (const [domain, slugs] of Object.entries(agentDomains)) {
  for (const slug of slugs) write(`agents/${domain}/${slug}.md`, agentDoc(domain, slug));
}
for (const emptyDomain of ["thinking", "design", "support"]) {
  write(`agents/${emptyDomain}/README.md`, `${frontmatter(`${title(emptyDomain)} Agents`, "index")}

# ${title(emptyDomain)} Agents

Use the corresponding core lead and specialist/customer reviewers. Add a new agent here only when it owns a distinct perspective, inputs, escalation boundary, and output contract.`);
}
write("agents/README.md", `${frontmatter("APT Agents", "index")}

# APT Agents

Agents are accountable perspectives, not alternate doctrine. For important reviews return: **Perspective, Concerns, Recommended changes, Risks, Questions, Approval status**. The router selects the smallest useful group; a human retains approval for protected decisions.

${Object.keys(agentDomains).map((d) => `- **${title(d)}:** \`agents/${d}/\``).join("\n")}`);

// Templates and prompts
for (const relative of templates) write(`templates/${relative}`, templateDoc(relative));
for (const directory of [...new Set(templates.map((t) => t.split("/")[0]))]) {
  const entries = templates.filter((t) => t.startsWith(`${directory}/`)).map((t) => path.basename(t));
  write(`templates/${directory}/README.md`, indexDoc(`${title(directory)} Templates`, "index", entries, `Templates for ${guide(artifactDomain(`${directory}/item.md`)).focus}.`));
}
write("templates/README.md", indexDoc("APT Templates", "index", [...new Set(templates.map((t) => t.split("/")[0]))], "Starter structures that make evidence, tradeoffs, validation, and approval visible."));
for (const relative of prompts) write(`prompts/${relative}`, promptDoc(relative));
for (const directory of [...new Set(prompts.map((p) => p.split("/")[0]))]) {
  const entries = prompts.filter((p) => p.startsWith(`${directory}/`)).map((p) => path.basename(p));
  write(`prompts/${directory}/README.md`, indexDoc(`${title(directory)} Prompts`, "index", entries, "Reusable prompts for evidence-first APT work."));
}
write("prompts/README.md", indexDoc("APT Prompts", "index", [...new Set(prompts.map((p) => p.split("/")[0]))], "Reusable, tool-neutral workflows grounded in APT principles."));

// Examples
for (const slug of exampleNames) write(`examples/${slug}/README.md`, exampleDoc(slug));
write("examples/README.md", indexDoc("APT Examples", "index", exampleNames, "Practical starter scenarios. Examples illustrate principles; they do not override them or claim provider-specific behavior."));

// Product hubs
const hubFiles = ["overview.md", "audience-map.md", "business-guide.md", "bank-acquirer-partner-guide.md", "developer-integrator-guide.md", "api-guide.md", "api-examples.md", "ai-usage-examples.md", "implementation-blueprint.md", "migration-guide.md", "operations-guide.md", "troubleshooting-guide.md", "launch-readiness-checklist.md"];
function hubFileDoc(file, example = false) {
  const name = title(path.basename(file, ".md"));
  return `${frontmatter(name, example ? "product-hub-example" : "product-hub-template")}

# ${name}

## Audience And Intent

State who uses this artifact, what outcome they need, and what they should do next.

## Canonical Product Facts

- Product capability and exclusions:
- Verified source:
- Setup, roles, and permissions:
- Lifecycle and operational behavior:

## Guidance

Cover business value, partner enablement, developer integration, support identifiers, product decisions, and AI-safe examples as applicable. Link rather than duplicate shared facts.

## Risks, Questions, And Readiness

- Known limitations and assumptions:
- Security, compliance, payment, or migration review:
- Troubleshooting and escalation:
- Launch evidence and approval:`;
}
for (const base of ["product-hubs/product-hub-template", "product-hubs/examples/generic-payment-product"]) {
  const isExample = base.includes("examples");
  write(`${base}/README.md`, `${frontmatter(isExample ? "Generic Payment Product Hub" : "Product Hub Template", isExample ? "product-hub-example" : "product-hub-template")}

# ${isExample ? "Generic Payment Product Hub" : "Product Hub Template"}

This hub answers what the product is, who it serves, what problem it solves, what every audience needs, available APIs/examples/AI usage, implementation, diagrams, demos, migration, operations, troubleshooting, and launch readiness. Product-specific behavior must be verified before use.`);
  for (const file of hubFiles) write(`${base}/${file}`, hubFileDoc(file, isExample));
  write(`${base}/diagrams/payment-flow.mmd`, `flowchart LR
  A["Customer intent"] --> B["Checkout or API"]
  B --> C["Validate and authorize"]
  C --> D["Capture or complete"]
  D --> E["Settlement and funding"]
  E --> F["Reconciliation and support"]
  C --> G["Decline or review"]
  G --> H["Customer-safe recovery"]`);
  write(`${base}/diagrams/role-permission-flow.mmd`, `flowchart TD
  I["Intent"] --> R{"Role permitted?"}
  R -- Yes --> A["Authorized action"]
  R -- No --> D["Explain and deny"]
  A --> L["Audit and support evidence"]`);
  write(`${base}/diagrams/migration-flow.mmd`, `flowchart LR
  L["Legacy contract"] --> B["Bridge / facade"]
  B --> M["Modern contract"]
  L --> T["Parity and replay tests"]
  M --> T
  T --> D["Dual run"]
  D --> X["Measured deprecation"]`);
  write(`${base}/demos/README.md`, `${frontmatter("Demo Assets", "demo")}

# Demo Assets

Demonstrate the primary intent, expected success, recoverable failure, permissions, support identifiers, and operational follow-through. Never hide unsupported or simulated behavior.`);
  write(`${base}/demos/demo-plan.md`, templateDoc("docs/demo-plan.md"));
}
write("product-hubs/README.md", `${frontmatter("APT Product Hubs", "standard")}

# Product Hubs

A Product Hub is the canonical, audience-layered package for one product. It serves business/merchant, bank/acquirer/partner, integrator/developer, support/operations, product/internal, and AI-agent audiences from one verified truth. Use the template, keep audience needs distinct, and require beginner review before launch.`);

// Platforms
const platformDetails = {
  codex: "Read AGENTS.md and CODEX.md. Copy selected skills to .codex/skills and prompts to a project-owned prompt area. Keep repository facts in local project context.",
  "github-copilot": "Map AGENTS.md to repository context, install .github/copilot-instructions.md, selected skills under .github/skills, and prompts under .github/prompts.",
  claude: "Read AGENTS.md and CLAUDE.md. Install selected skills under .claude/skills and role guidance under .claude/agents when the project uses agents.",
  gemini: "Read AGENTS.md and GEMINI.md. Use .gemini/config.yaml, .gemini/styleguide.md, and .gemini/commands for project-specific mappings.",
  vscode: "Use the GitHub Copilot adapter when Copilot is active; keep editor settings separate from canonical APT guidance.",
  "local-llm": "Use local models for classification, triage, summarization, and routing. Escalate architecture, payments, security, major refactors, and final review."
};
for (const [platform, detail] of Object.entries(platformDetails)) {
  write(`platforms/${platform}/README.md`, `${frontmatter(`${title(platform)} Adapter`, "platform-adapter")}

# ${title(platform)} Adapter

${detail}

Adapters expose canonical assets in tool-native locations; they do not fork doctrine. Preserve project-owned instructions and review collisions before installation.`);
}
write("platforms/github-copilot/copilot-instructions.md", `# APT GitHub Copilot Instructions

Read AGENTS.md first. Apply the relevant APT principles, inspect exact repository sources, preserve local behavior, and return evidence-backed changes with tests, documentation, support impact, and open questions.`);
write("platforms/gemini/config.yaml", `context:
  files:
    - AGENTS.md
    - GEMINI.md
`);
write("platforms/gemini/styleguide.md", `# Gemini Style Guide

Prefer evidence-first, audience-aware, practical outputs. Separate facts, assumptions, recommendations, and questions.`);
for (const command of ["review", "plan", "beginner-test"]) write(`platforms/gemini/commands/${command}.md`, promptDoc(`reviews/${command}.md`));
write("platforms/README.md", indexDoc("Platform Adapters", "index", Object.keys(platformDetails), "Tool-native discovery and installation guidance. `AGENTS.md` remains authoritative."));

// Docs
const docPages = {
  "getting-started": "Start with the four pillars, select the relevant domain principles, choose a template and skill, then validate with the appropriate agent perspectives.",
  "repo-usage": "Principles explain why and what good means; skills explain process; agents provide perspectives; prompts and templates accelerate work; examples demonstrate; adapters expose assets.",
  "platform-adapters": "Install only the platform surfaces a target project uses. Preserve local instructions, preview changes, and avoid copying canonical doctrine into multiple tool-specific files.",
  "skill-authoring-guide": "Use the required skill contract. Give clear triggers, inputs, an executable process, outputs, a quality bar, and links to canonical principles.",
  "agent-authoring-guide": "Create an agent only for a distinct accountable perspective. Define triggers, responsibilities, required skills, escalation, outputs, and approval semantics.",
  "model-routing": "Use cheap/local models for low-risk classification and summarization; strong models for architecture, payments, security, and major refactors; reviewers for final checks; humans for protected decisions.",
  "installing-into-projects": "Choose a manifest, dry-run both asset and platform installation, review collisions, apply, then validate the target's local instructions and examples.",
  "audience-layered-documentation": "Maintain one canonical truth and distinct layers for merchant, partner, developer, support, internal, and automation audiences."
};
for (const [slug, body] of Object.entries(docPages)) write(`docs/${slug}.md`, `${frontmatter(title(slug), "guide")}

# ${title(slug)}

${body}

Record owners, source links, assumptions, validation, and freshness. Use [APT principles](../principles/README.md) for decisions and [skills](../skills/README.md) for procedures.`);
write("docs/README.md", indexDoc("APT Documentation", "index", Object.keys(docPages).map((d) => `${d}.md`), "Operator and contributor guidance for using this repository."));

write("docs/migration-from-old-repos.md", `${frontmatter("Migration From Old Repositories", "migration-record")}

# Migration From Old Repositories

## Sources

- **apt-principles** current working tree, base commit **0a9a46980c18476f1296610843ed1c1d83143994**.
- **apt-agent-standards** current working tree, base commit **7fc319e5a4892a6a04573748c94d43b256904bb9**.

## Moved And Rationalized

- Root doctrine and lifecycle material became domain principles, with Thinking, Design, Architecture, and Execution first-class.
- Standards, checklists, prompts, templates, and examples were decomposed into canonical principles and linked execution assets.
- Harness routing, model selection, verification, security review, and tool-parity ideas became AI principles, skills, agents, and adapters.
- Existing payment, API, Cloudflare, UI, security, and documentation guidance seeded deeper domain catalogs.

## Merged Duplicates

Deep **apt-principles** guidance wins over compact installable summaries. Repeated repo-alignment, documentation, context-pack, API, and Copilot guidance now has one canonical principle or workflow with adapter links.

## Renamed

- Lifecycle execution, quality, release, operations, and knowledge guidance is grouped under **principles/execution/**.
- Tool-native Codex skills and Claude/Copilot roles are represented by portable skills/agents plus platform adapters.
- Profiles are replaced by YAML manifests.

## Archived Or Retired

The old doctrine/distribution ownership split, **.agent-standards.json**, **.agent-repo**, profile detection, path mapping, Node lifecycle installers, transition assessments, and shallow tool-specific stubs are not active interfaces. Selected unique records are preserved under **docs/archive/**; complete historical sources remain in their original repositories.

Generated dated audits, Graphify traversals, and project-profile sweeps are inventoried with hashes but not copied as active content.

## Open Review

- Validate product-specific Authorize.net, Cybersource, Visa Acceptance, and Accept Suite behavior against current authoritative documentation before publishing concrete claims.
- Select jurisdiction-, asset-, network-, custody-, and provider-specific sources before operational stablecoin guidance.
- Revisit installer synchronization only after real downstream use establishes a stable need.`);

write("docs/completion-report.md", `${frontmatter("Initial Consolidation Completion Report", "completion-report")}

# Initial Consolidation Completion Report

## Summary

Created **apt-principles-agents** as a fresh, uncommitted Git repository and the canonical combined home for APT doctrine, workflows, agents, prompts, templates, examples, Product Hubs, manifests, and platform adapters.

## Files Created

- Root navigation and AI instructions.
- Canonical principles across the four pillars and cross-cutting domains.
- Complete skill and agent catalogs.
- Product, requirements, API, payment, migration, documentation, readiness, support, decision, and review templates.
- Audit, planning, review, modernization, migration, troubleshooting, Product Hub, and swarm prompts.
- Eleven starter examples and a generic payment Product Hub.
- Codex, Copilot, Claude, Gemini, VS Code, and local-model adapters.
- Six install manifests, four installers, validators, installer tests, provenance records, and archives.

## Files Modified

None outside this new repository. Both source repositories remain unchanged.

## Files Archived

Preserved source patches and SHA-256 inventories, the former ownership contract and manifest, transition assessments, path mapping, legacy install/sync scripts, and a hash inventory of generated reports.

## Major Design Decisions

- Thinking, Design, Architecture, and Execution are first-class.
- Deep doctrine wins over compact distribution summaries.
- Skills and agents link to principles instead of duplicating them.
- YAML manifests and native Bash/PowerShell installers replace legacy profiles and managed-install manifests.
- Payment and security claims require evidence; stablecoin guidance requires maturity and human-review labels.

## Old Repository Mapping

See [Migration From Old Repositories](migration-from-old-repos.md) for moved, renamed, merged, archived, and retired material.

## Open Questions

- Product-specific payment behavior needs current authoritative-source validation.
- Stablecoin guidance needs jurisdiction-, network-, provider-, and custody-specific review.
- Downstream usage should determine whether a future synchronization command is warranted.

## Recommended First Commit

**Initialize apt-principles-agents canonical standards repo**

## Recommended Review

Run **Get-ChildItem -Recurse -File | Sort-Object FullName** on Windows or **find apt-principles-agents -maxdepth 3 -type f | sort** in Bash. Then review root instructions, four-pillar indexes, one payment/API modernization path, the generic Product Hub, all manifests, installer collision behavior, stablecoin maturity labels, and the migration/provenance records.`);

write("docs/archive/README.md", `${frontmatter("Archive", "archive-index")}

# Archive

Historical material is preserved for provenance and migration analysis. It is not active APT guidance.`);

// Manifests
const manifests = {
  core: {
    description: "Four-pillar APT principles, core thinking/design/architecture/execution skills, agents, templates, prompts, and all adapters.",
    principles: ["principles/thinking/", "principles/design/", "principles/architecture/", "principles/execution/"],
    skills: ["skills/thinking/", "skills/design/", "skills/architecture/"],
    agents: ["agents/core/"],
    templates: ["templates/product/", "templates/decision-records/"],
    prompts: ["prompts/planning/", "prompts/reviews/"],
    platforms: ["platforms/"]
  },
  payments: {
    description: "Payment, ecommerce, API, transaction intelligence, risk, documentation, and readiness assets.",
    principles: ["principles/payments/", "principles/ecommerce/", "principles/api/", "principles/security-risk/"],
    skills: ["skills/payments/", "skills/ecommerce/", "skills/api/", "skills/service-readiness/"],
    agents: ["agents/payments/", "agents/ecommerce/", "agents/api/", "agents/risk/"],
    templates: ["templates/payments/", "templates/api/", "templates/support/"],
    prompts: ["prompts/reviews/payment-review.md", "prompts/troubleshooting/payment-decline.md"],
    platforms: ["platforms/codex/", "platforms/github-copilot/", "platforms/claude/", "platforms/gemini/"]
  },
  "api-modernization": {
    description: "Modern API design, compatibility bridges, parity, dual-run migration, and deprecation.",
    principles: ["principles/api/", "principles/modernization/"],
    skills: ["skills/api/", "skills/modernization/"],
    agents: ["agents/api/", "agents/architecture/"],
    templates: ["templates/api/", "templates/migration/"],
    prompts: ["prompts/modernization/", "prompts/migration/"],
    platforms: ["platforms/"]
  },
  documentation: {
    description: "Audience-layered documentation, implementation blueprints, examples, support, diagrams, and demos.",
    principles: ["principles/documentation/", "principles/service-readiness/"],
    skills: ["skills/documentation/", "skills/service-readiness/"],
    agents: ["agents/docs/", "agents/customer/", "agents/beginner-reviewers/"],
    templates: ["templates/docs/", "templates/support/"],
    prompts: ["prompts/reviews/docs-review.md", "prompts/troubleshooting/customer-confusion.md"],
    platforms: ["platforms/"]
  },
  "product-hub": {
    description: "Product Hub standards, templates, reviews, and generic payment example.",
    principles: ["principles/documentation/product-hub-standard.md", "principles/design/"],
    skills: ["skills/documentation/product-hub-builder/", "skills/documentation/audience-layered-docs/"],
    agents: ["agents/docs/apt-product-hub-builder.md", "agents/customer/", "agents/beginner-reviewers/"],
    templates: ["product-hubs/product-hub-template/", "templates/product/", "templates/docs/"],
    prompts: ["prompts/product-hubs/"],
    platforms: ["platforms/"]
  },
  full: {
    description: "All active APT principles, skills, agents, templates, prompts, Product Hubs, and adapters.",
    principles: ["principles/"],
    skills: ["skills/"],
    agents: ["agents/"],
    templates: ["templates/", "product-hubs/"],
    prompts: ["prompts/"],
    platforms: ["platforms/"]
  }
};
function yamlManifest(name, data) {
  const sections = ["principles", "skills", "agents", "templates", "prompts", "platforms"];
  return `name: ${name}
description: ${data.description}
${sections.map((section) => `${section}:\n${data[section].map((item) => `  - ${item}`).join("\n")}`).join("\n")}`;
}
for (const [name, data] of Object.entries(manifests)) write(`manifests/${name}.yaml`, yamlManifest(name, data));
write("manifests/README.md", `${frontmatter("APT Manifests", "manifest-guide")}

# Manifests

Manifests use a constrained YAML subset: scalar **name** and **description**, followed by path lists for **principles**, **skills**, **agents**, **templates**, **prompts**, and **platforms**. A path ending in a slash is copied recursively.`);

// Installers
write("installers/README.md", `${frontmatter("APT Installers", "installer-guide")}

# Installers

Both installers accept target and manifest plus dry-run and force flags. Asset installation writes under **.apt/**; platform installation maps content to tool-native locations. Existing files are skipped unless forced; forced replacements are backed up under **.apt-backups/&lt;timestamp&gt;/**.`);

write("installers/install-skills.ps1", `param(
  [Parameter(Mandatory=$true)][string]$Target,
  [string]$Manifest = "core",
  [switch]$DryRun,
  [switch]$Force
)
$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$ManifestPath = Join-Path $RepoRoot "manifests/$Manifest.yaml"
if (-not (Test-Path -LiteralPath $ManifestPath)) { throw "Unknown manifest: $Manifest" }
$TargetRoot = [IO.Path]::GetFullPath($Target)
$BackupRoot = Join-Path $TargetRoot (".apt-backups/" + (Get-Date -Format "yyyyMMdd-HHmmss"))
$Section = ""
$Entries = @()
foreach ($Line in Get-Content -LiteralPath $ManifestPath) {
  if ($Line -match '^(principles|skills|agents|templates|prompts):$') { $Section=$Matches[1]; continue }
  if ($Line -match '^[a-z-]+:$') { $Section=""; continue }
  if ($Section -and $Line -match '^\\s+-\\s+(.+)$') { $Entries += $Matches[1].Trim() }
}
function Install-File([string]$Source,[string]$Relative) {
  $Destination = Join-Path $TargetRoot (".apt/" + $Relative.Replace('\\','/'))
  if (Test-Path -LiteralPath $Destination) {
    if (-not $Force) { Write-Warning "Skipping existing $Destination"; return }
    $Backup = Join-Path $BackupRoot $Relative
    if (-not $DryRun) { New-Item -ItemType Directory -Force -Path (Split-Path $Backup) | Out-Null; Copy-Item -LiteralPath $Destination -Destination $Backup -Force }
  }
  $Verb = if ($DryRun) { "Would install " } else { "Installing " }
  Write-Output ($Verb + $Relative)
  if (-not $DryRun) { New-Item -ItemType Directory -Force -Path (Split-Path $Destination) | Out-Null; Copy-Item -LiteralPath $Source -Destination $Destination -Force }
}
foreach ($Entry in $Entries) {
  $Source = Join-Path $RepoRoot $Entry
  if (-not (Test-Path -LiteralPath $Source)) { throw "Manifest path missing: $Entry" }
  if ((Get-Item -LiteralPath $Source).PSIsContainer) {
    Get-ChildItem -LiteralPath $Source -Recurse -File | ForEach-Object {
      Install-File $_.FullName $_.FullName.Substring($RepoRoot.Length + 1)
    }
  } else { Install-File $Source $Entry }
}`);

write("installers/install-platform-adapters.ps1", `param(
  [Parameter(Mandatory=$true)][string]$Target,
  [string]$Manifest = "core",
  [switch]$DryRun,
  [switch]$Force
)
$ErrorActionPreference = "Stop"
$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$TargetRoot = [IO.Path]::GetFullPath($Target)
$BackupRoot = Join-Path $TargetRoot (".apt-backups/" + (Get-Date -Format "yyyyMMdd-HHmmss"))
$ManifestPath = Join-Path $RepoRoot "manifests/$Manifest.yaml"
if (-not (Test-Path -LiteralPath $ManifestPath)) { throw "Unknown manifest: $Manifest" }
$Mappings = @{
  "AGENTS.md"="AGENTS.md"; "CODEX.md"="CODEX.md"; "CLAUDE.md"="CLAUDE.md"; "GEMINI.md"="GEMINI.md";
  "platforms/gemini/config.yaml"=".gemini/config.yaml"; "platforms/gemini/styleguide.md"=".gemini/styleguide.md";
  "platforms/github-copilot/copilot-instructions.md"=".github/copilot-instructions.md"
}
function Install-MappedFile([string]$Source,[string]$Relative) {
  $Destination=Join-Path $TargetRoot $Relative
  if (Test-Path -LiteralPath $Destination) {
    if (-not $Force) { Write-Warning "Skipping existing $Destination"; return }
    $Backup=Join-Path $BackupRoot $Relative
    if (-not $DryRun) { New-Item -ItemType Directory -Force -Path (Split-Path $Backup) | Out-Null; Copy-Item $Destination $Backup -Force }
  }
  $Verb = if ($DryRun) { "Would install " } else { "Installing " }
  Write-Output ($Verb + $Relative)
  if (-not $DryRun) { New-Item -ItemType Directory -Force -Path (Split-Path $Destination) | Out-Null; Copy-Item $Source $Destination -Force }
}
foreach ($Pair in $Mappings.GetEnumerator()) { Install-MappedFile (Join-Path $RepoRoot $Pair.Key) $Pair.Value }
$Section=""
$Entries=@()
foreach($Line in Get-Content -LiteralPath $ManifestPath){
  if($Line -match '^(skills|prompts):$'){$Section=$Matches[1];continue}
  if($Line -match '^[a-z-]+:$'){$Section="";continue}
  if($Section -and $Line -match '^\\s+-\\s+(.+)$'){$Entries += [pscustomobject]@{Section=$Section;Path=$Matches[1].Trim()}}
}
foreach($Entry in $Entries){
  $Source=Join-Path $RepoRoot $Entry.Path
  $Files=if((Get-Item $Source).PSIsContainer){Get-ChildItem $Source -Recurse -File}else{Get-Item $Source}
  foreach($File in $Files){
    $RepoRelative=$File.FullName.Substring($RepoRoot.Length+1).Replace('\\','/')
    if($Entry.Section -eq "skills"){
      $Suffix=$RepoRelative.Substring("skills/".Length)
      foreach($Base in @(".codex/skills",".claude/skills",".github/skills")){Install-MappedFile $File.FullName ($Base+"/"+$Suffix)}
    } else {
      $Suffix=$RepoRelative.Substring("prompts/".Length)
      Install-MappedFile $File.FullName (".github/prompts/"+$Suffix)
      Install-MappedFile $File.FullName (".gemini/commands/"+$Suffix)
    }
  }
}`);

write("installers/install-skills.sh", `#!/usr/bin/env bash
set -euo pipefail
TARGET="" MANIFEST="core" DRY_RUN=0 FORCE=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) TARGET="$2"; shift 2;; --manifest) MANIFEST="$2"; shift 2;;
    --dry-run) DRY_RUN=1; shift;; --force) FORCE=1; shift;;
    *) echo "Unknown argument: $1" >&2; exit 2;;
  esac
done
[[ -n "$TARGET" ]] || { echo "--target is required" >&2; exit 2; }
ROOT="$(cd "$(dirname "\${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="$(cd "$TARGET" && pwd)"
FILE="$ROOT/manifests/$MANIFEST.yaml"
[[ -f "$FILE" ]] || { echo "Unknown manifest: $MANIFEST" >&2; exit 2; }
STAMP="$(date +%Y%m%d-%H%M%S)"
install_one() {
  local source="$1" relative="$2" destination="$TARGET/.apt/$relative"
  if [[ -e "$destination" ]]; then
    if [[ "$FORCE" -eq 0 ]]; then echo "WARNING: skipping existing $destination" >&2; return; fi
    if [[ "$DRY_RUN" -eq 0 ]]; then mkdir -p "$TARGET/.apt-backups/$STAMP/$(dirname "$relative")"; cp -R "$destination" "$TARGET/.apt-backups/$STAMP/$relative"; fi
  fi
  [[ "$DRY_RUN" -eq 1 ]] && { echo "Would install $relative"; return; }
  mkdir -p "$(dirname "$destination")"; cp "$source" "$destination"; echo "Installing $relative"
}
section=""
while IFS= read -r line; do
  case "$line" in principles:|skills:|agents:|templates:|prompts:) section="\${line%:}";; platforms:) section="";; "  - "*)
    [[ -n "$section" ]] || continue; entry="\${line#  - }"; source="$ROOT/$entry"
    [[ -e "$source" ]] || { echo "Manifest path missing: $entry" >&2; exit 1; }
    if [[ -d "$source" ]]; then while IFS= read -r -d '' file; do rel="\${file#"$ROOT/"}"; install_one "$file" "$rel"; done < <(find "$source" -type f -print0)
    else install_one "$source" "$entry"; fi;;
  esac
done < "$FILE"`);

write("installers/install-platform-adapters.sh", `#!/usr/bin/env bash
set -euo pipefail
TARGET="" MANIFEST="core" DRY_RUN=0 FORCE=0
while [[ $# -gt 0 ]]; do case "$1" in --target) TARGET="$2";shift 2;;--manifest) MANIFEST="$2";shift 2;;--dry-run) DRY_RUN=1;shift;;--force) FORCE=1;shift;;*) echo "Unknown argument: $1" >&2;exit 2;;esac;done
[[ -n "$TARGET" ]] || { echo "--target is required" >&2; exit 2; }
ROOT="$(cd "$(dirname "\${BASH_SOURCE[0]}")/.." && pwd)"; TARGET="$(cd "$TARGET" && pwd)"; STAMP="$(date +%Y%m%d-%H%M%S)"
FILE="$ROOT/manifests/$MANIFEST.yaml";[[ -f "$FILE" ]]||{ echo "Unknown manifest: $MANIFEST" >&2;exit 2;}
copy_one(){ local source="$1" relative="$2" destination="$TARGET/$relative";if [[ -e "$destination" ]];then if [[ "$FORCE" -eq 0 ]];then echo "WARNING: skipping existing $destination" >&2;return;fi;if [[ "$DRY_RUN" -eq 0 ]];then mkdir -p "$TARGET/.apt-backups/$STAMP/$(dirname "$relative")";cp -R "$destination" "$TARGET/.apt-backups/$STAMP/$relative";fi;fi;[[ "$DRY_RUN" -eq 1 ]]&&{ echo "Would install $relative";return;};mkdir -p "$(dirname "$destination")";cp -R "$source" "$destination";echo "Installing $relative";}
for file in AGENTS.md CODEX.md CLAUDE.md GEMINI.md;do copy_one "$ROOT/$file" "$file";done
copy_one "$ROOT/platforms/gemini/config.yaml" ".gemini/config.yaml";copy_one "$ROOT/platforms/gemini/styleguide.md" ".gemini/styleguide.md"
copy_one "$ROOT/platforms/github-copilot/copilot-instructions.md" ".github/copilot-instructions.md"
section=""
while IFS= read -r line;do
  case "$line" in skills:|prompts:)section="\${line%:}";;principles:|agents:|templates:|platforms:)section="";;"  - "*)
    [[ -n "$section" ]]||continue;entry="\${line#  - }";source="$ROOT/$entry"
    if [[ -d "$source" ]];then
      while IFS= read -r -d '' item;do rel="\${item#"$ROOT/$section/"}";if [[ "$section" == skills ]];then for base in .codex/skills .claude/skills .github/skills;do copy_one "$item" "$base/$rel";done;else copy_one "$item" ".github/prompts/$rel";copy_one "$item" ".gemini/commands/$rel";fi;done < <(find "$source" -type f -print0)
    else rel="\${source#"$ROOT/$section/"}";if [[ "$section" == skills ]];then for base in .codex/skills .claude/skills .github/skills;do copy_one "$source" "$base/$rel";done;else copy_one "$source" ".github/prompts/$rel";copy_one "$source" ".gemini/commands/$rel";fi;fi;;
  esac
done < "$FILE"`);

// Validation and test scripts
write("scripts/validate-repository.mjs", `#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const errors=[];const requiredRoot=["README.md","AGENTS.md","CODEX.md","CLAUDE.md","GEMINI.md"];
for(const file of requiredRoot)if(!existsSync(path.join(root,file)))errors.push("Missing "+file);
function files(dir){if(!existsSync(dir))return[];return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
const active=files(root).filter(f=>!f.includes(path.sep+".git"+path.sep)&&!f.includes(path.join("docs","archive"))&&path.basename(f)!=="scaffold-repository.mjs");
for(const file of active){if(statSync(file).size===0)errors.push("Empty file "+path.relative(root,file));}
const skillHeadings=["# ","## Purpose","## When to Use","## Inputs","## Process","## Outputs","## Quality Bar","## References"];
for(const file of files(path.join(root,"skills")).filter(f=>f.endsWith("SKILL.md"))){const text=readFileSync(file,"utf8");for(const h of skillHeadings)if(!text.includes(h))errors.push("Skill missing "+h+": "+path.relative(root,file));}
const agentHeadings=["# ","## Role","## When to Use","## Responsibilities","## Required Skills","## Inputs","## Process","## Outputs","## Escalation Rules","## Quality Bar"];
for(const file of files(path.join(root,"agents")).filter(f=>f.endsWith(".md")&&!f.endsWith("README.md"))){const text=readFileSync(file,"utf8");for(const h of agentHeadings)if(!text.includes(h))errors.push("Agent missing "+h+": "+path.relative(root,file));}
for(const file of files(path.join(root,"principles","stablecoin-crypto")).filter(f=>f.endsWith(".md"))){const text=readFileSync(file,"utf8");for(const label of ["Mature today","Emerging","Future-looking","Requires legal/compliance/risk review"])if(!text.includes(label))errors.push("Stablecoin label missing "+label+": "+path.relative(root,file));}
const sections=["principles","skills","agents","templates","prompts","platforms"];
for(const file of files(path.join(root,"manifests")).filter(f=>f.endsWith(".yaml"))){const text=readFileSync(file,"utf8");for(const section of sections)if(!text.includes(section+":"))errors.push("Manifest missing "+section+": "+path.relative(root,file));for(const match of text.matchAll(/^\\s+-\\s+(.+)$/gm)){if(!existsSync(path.join(root,match[1].trim())))errors.push("Manifest path missing "+match[1]+" in "+path.relative(root,file));}}
const hubBase=path.join(root,"product-hubs","examples","generic-payment-product");for(const file of ["README.md","overview.md","audience-map.md","business-guide.md","bank-acquirer-partner-guide.md","developer-integrator-guide.md","api-guide.md","api-examples.md","ai-usage-examples.md","implementation-blueprint.md","migration-guide.md","operations-guide.md","troubleshooting-guide.md","launch-readiness-checklist.md","diagrams/payment-flow.mmd","demos/demo-plan.md"])if(!existsSync(path.join(hubBase,file)))errors.push("Product Hub missing "+file);
for(const file of active.filter(f=>f.endsWith(".md"))){const text=readFileSync(file,"utf8");for(const match of text.matchAll(/\\[[^\\]]+\\]\\(([^)]+)\\)/g)){const link=match[1];if(link.startsWith("http")||link.startsWith("#")||link.includes("*"))continue;const target=path.resolve(path.dirname(file),link.split("#")[0]);if(!existsSync(target))errors.push("Broken link "+link+" in "+path.relative(root,file));}}
if(errors.length){console.error(errors.join("\\n"));console.error("\\nValidation failed: "+errors.length+" issue(s)");process.exit(1);}console.log("APT principles-agents validation: PASS");console.log("Active files checked: "+active.length);console.log("Skills: "+files(path.join(root,"skills")).filter(f=>f.endsWith("SKILL.md")).length);console.log("Agents: "+files(path.join(root,"agents")).filter(f=>f.endsWith(".md")&&!f.endsWith("README.md")).length);
`);
write("scripts/test-installers.mjs", `#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");const temp=path.join(root,".tmp","installer-test");rmSync(temp,{recursive:true,force:true});mkdirSync(temp,{recursive:true});
for(const manifest of ["core","payments","api-modernization","documentation","product-hub","full"])execFileSync("powershell",["-NoProfile","-ExecutionPolicy","Bypass","-File",path.join(root,"installers","install-skills.ps1"),"-Target",temp,"-Manifest",manifest,"-DryRun"],{stdio:"ignore"});
execFileSync("powershell",["-NoProfile","-ExecutionPolicy","Bypass","-File",path.join(root,"installers","install-skills.ps1"),"-Target",temp,"-Manifest","core"],{stdio:"ignore"});
if(!existsSync(path.join(temp,".apt","principles","thinking","README.md")))throw new Error("PowerShell asset install failed");
writeFileSync(path.join(temp,"AGENTS.md"),"local\\n");execFileSync("powershell",["-NoProfile","-ExecutionPolicy","Bypass","-File",path.join(root,"installers","install-platform-adapters.ps1"),"-Target",temp,"-DryRun"],{stdio:"ignore"});
execFileSync("powershell",["-NoProfile","-ExecutionPolicy","Bypass","-File",path.join(root,"installers","install-platform-adapters.ps1"),"-Target",temp,"-Force"],{stdio:"ignore"});
if(!existsSync(path.join(temp,".apt-backups")))throw new Error("PowerShell backup behavior failed");
const bash=spawnSync("bash",["--version"],{stdio:"ignore"});if(bash.status===0){execFileSync("bash",["-n",path.join(root,"installers","install-skills.sh")]);execFileSync("bash",["-n",path.join(root,"installers","install-platform-adapters.sh")]);}
rmSync(path.join(root,".tmp"),{recursive:true,force:true});console.log("Installer tests: PASS"+(bash.status===0?" (PowerShell + Bash syntax)":" (PowerShell; Bash unavailable)"));
`);

// Provenance and selective archive
function allFiles(base) {
  return readdirSync(base, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "graphify-out") return [];
    const full = path.join(base, entry.name);
    return entry.isDirectory() ? allFiles(full) : [full];
  });
}
const sources = [
  { name: "apt-principles", commit: "0a9a46980c18476f1296610843ed1c1d83143994" },
  { name: "apt-agent-standards", commit: "7fc319e5a4892a6a04573748c94d43b256904bb9" }
];
const provenance = [];
for (const source of sources) {
  const base = path.join(workspace, source.name);
  const safe = base.replaceAll("\\", "/");
  const status = execFileSync("git", ["-c", `safe.directory=${safe}`, "-C", base, "status", "--short"], { encoding: "utf8" });
  const patch = execFileSync("git", ["-c", `safe.directory=${safe}`, "-C", base, "diff", "--binary"], { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 });
  write(`docs/archive/source-provenance/${source.name}-working-tree.patch`, patch || `# No tracked changes at capture time.`);
  const inventory = allFiles(base).map((file) => ({
    path: path.relative(base, file).replaceAll("\\", "/"),
    bytes: statSync(file).size,
    sha256: createHash("sha256").update(readFileSync(file)).digest("hex")
  }));
  write(`docs/archive/source-provenance/${source.name}-inventory.json`, JSON.stringify({ capturedAt: today, baseCommit: source.commit, status: status.trim().split(/\r?\n/).filter(Boolean), files: inventory }, null, 2));
  provenance.push(`- **${source.name}:** base commit \`${source.commit}\`; ${inventory.length} files; working-tree status and hashes preserved.`);
}
write("docs/archive/source-provenance/README.md", `${frontmatter("Source Provenance", "archive-record")}

# Source Provenance

Captured from the current working trees on ${today}. Patch files preserve tracked changes; JSON inventories preserve status, untracked paths, sizes, and SHA-256 hashes.

${provenance.join("\n")}

The original repositories remain the complete historical record.`);

const archiveCopies = [
  ["apt-principles/references/agent-standards-contract.json", "docs/archive/legacy-agent-distribution/agent-standards-contract.json"],
  ["apt-agent-standards/agent-repo.manifest.json", "docs/archive/legacy-agent-distribution/agent-repo.manifest.json"],
  ["apt-agent-standards/docs/CURRENT-STATE-ASSESSMENT.md", "docs/archive/legacy-agent-distribution/CURRENT-STATE-ASSESSMENT.md"],
  ["apt-agent-standards/docs/MIGRATION-ROADMAP.md", "docs/archive/legacy-agent-distribution/MIGRATION-ROADMAP.md"],
  ["apt-agent-standards/docs/PROPOSED-FILE-CHANGES.md", "docs/archive/legacy-agent-distribution/PROPOSED-FILE-CHANGES.md"],
  ["apt-agent-standards/docs/RISK-ASSESSMENT.md", "docs/archive/legacy-agent-distribution/RISK-ASSESSMENT.md"],
  ["apt-agent-standards/scripts/path-mapping.mjs", "docs/archive/legacy-agent-distribution/path-mapping.mjs"],
  ["apt-agent-standards/scripts/install-agent-standards.mjs", "docs/archive/legacy-agent-distribution/install-agent-standards.mjs"],
  ["apt-agent-standards/scripts/sync-agent-standards.mjs", "docs/archive/legacy-agent-distribution/sync-agent-standards.mjs"]
];
for (const [source, destination] of archiveCopies) {
  const src = path.join(workspace, source);
  const dest = path.join(root, destination);
  mkdirSync(path.dirname(dest), { recursive: true });
  cpSync(src, dest);
}
const reportInventory = sources.flatMap((source) => {
  const reports = path.join(workspace, source.name, "reports");
  return existsSync(reports) ? allFiles(reports).map((file) => ({
    repository: source.name,
    path: path.relative(path.join(workspace, source.name), file).replaceAll("\\", "/"),
    sha256: createHash("sha256").update(readFileSync(file)).digest("hex")
  })) : [];
});
write("docs/archive/generated-report-inventory.json", JSON.stringify({ capturedAt: today, reports: reportInventory }, null, 2));

console.log("Scaffold complete.");
