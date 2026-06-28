#!/usr/bin/env node
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const keywordRules = {
  auth: "Define identity, credential, token, authorization, expiry, revocation, and audit boundaries separately.",
  permission: "Model permissions by intent, resource, action, role, denial behavior, and escalation path.",
  error: "Specify stable codes, safe messages, correlation identifiers, retryability, and support interpretation.",
  idempotency: "Define key scope, replay window, payload mismatch behavior, stored result, and concurrent-request handling.",
  webhook: "Cover signatures, replay defense, duplicate delivery, ordering, retries, dead letters, and operator recovery.",
  version: "Name compatibility guarantees, additive-change rules, sunset evidence, communications, and client migration.",
  observability: "Connect logs, metrics, traces, business events, identifiers, alerts, runbooks, and retention.",
  graphql: "Justify graph traversal needs and address authorization depth, query cost, schema evolution, and caching.",
  rpc: "Distinguish commands from queries and define method discovery, envelopes, errors, batching, and idempotency.",
  rest: "Model stable resources, HTTP semantics, representations, state transitions, caching, and discoverable errors.",
  json: "Use explicit schemas, canonical field types, examples, nullability, extensibility, and deterministic validation.",
  query: "Document query safety, cache behavior, intermediary support, payload limits, authorization, and fallbacks.",
  payment: "Trace authorization, capture, settlement, funding, reconciliation, reversal, dispute, and support evidence.",
  token: "Keep raw credentials or account data outside application boundaries and document token scope and lifecycle.",
  fraud: "Separate detection signals, decision rules, explainability, false positives, overrides, and monitoring.",
  decline: "Separate issuer, processor, validation, risk, and configuration causes and provide safe next actions.",
  refund: "Define eligibility, amount rules, partial behavior, asynchronous outcomes, settlement effects, and reconciliation.",
  settlement: "Reconcile processor batches, fees, adjustments, funding dates, exceptions, and ledger ownership.",
  gateway: "Keep provider-specific fields behind explicit adapters and document parity, gaps, and escape hatches.",
  checkout: "Map customer intent through validation, payment, confirmation, recovery, accessibility, and support.",
  subscription: "Define consent, schedules, amount changes, retries, dunning, cancellation, and customer communication.",
  recurring: "Distinguish stored credentials, merchant-initiated use, schedules, retries, and lifecycle notifications.",
  onboarding: "Cover eligibility, identity, configuration, permissions, training, readiness, and support handoff.",
  marketplace: "Make platform, merchant, seller, funds-flow, fee, dispute, liability, and reporting roles explicit.",
  invoice: "Define invoice state, amount authority, partial payment, due dates, reconciliation, and customer receipts.",
  bridge: "Specify both contracts, transformations, parity gaps, observability, rollback, and bridge retirement criteria.",
  soap: "Map operations, XML schemas, faults, headers, security, and asynchronous behavior into explicit modern contracts.",
  xml: "Preserve namespaces, ordering assumptions, optionality, validation, faults, and canonical data types.",
  nvp: "Inventory casing, duplicate keys, encoding, implicit types, error fields, and ordering assumptions before mapping.",
  parity: "Classify every capability as full, partial, unsupported, changed, or deferred with evidence and owner.",
  dual: "Define traffic selection, comparison metrics, divergence handling, rollback, and exit thresholds.",
  deprecation: "Require usage evidence, replacement readiness, communications, support preparation, dates, and exception policy.",
  accessibility: "Test keyboard, focus, semantics, contrast, motion, errors, zoom, screen readers, and recovery.",
  journey: "Show actor intent, touchpoints, states, decisions, handoffs, failure recovery, and measurable outcome.",
  role: "Separate role labels from permissions and test cross-role visibility, delegation, denial, and audit behavior.",
  demo: "Demonstrate verified success, recoverable failure, permissions, support identifiers, and operational follow-through.",
  assumption: "Record evidence, confidence, impact if wrong, validation method, owner, and review date.",
  tradeoff: "Compare meaningful alternatives across outcomes, complexity, risk, support, migration, and reversibility.",
  beginner: "Remove unexplained terms, show the first action, provide a safe example, and test likely stopping points.",
  decision: "Record context, options, recommendation, rationale, consequences, owner, and revisit trigger.",
  architecture: "Define boundaries, ownership, contracts, failure modes, deployment, observability, and reversibility.",
  security: "Identify assets, trust boundaries, threats, controls, residual risk, evidence, and accountable approval.",
  privacy: "Document purpose, minimization, consent, access, retention, deletion, sharing, and data-subject impact.",
  compliance: "Name the obligation as an input requiring qualified review; never claim compliance from a checklist alone.",
  custody: "Identify who controls keys and assets, segregation, recovery, insolvency, counterparty, and operational controls.",
  wallet: "Define wallet connection, network, asset, address validation, signing, finality, refunds, and user recovery.",
  chain: "Separate on-chain finality and fees from off-chain ledger, custody, reconciliation, and counterparty behavior.",
  model: "Route by capability, context, sensitivity, cost, evaluation evidence, fallback, and human approval.",
  prompt: "Version the instruction, inputs, allowed tools, output contract, failure behavior, tests, and owner.",
  swarm: "Assign distinct perspectives, share evidence, avoid duplicated work, reconcile disagreements, and retain approval ownership.",
  readiness: "Require named owners, evidence, operational checks, support handoff, rollback, communications, and approval.",
  support: "Provide identifiers, safe explanations, diagnostic steps, known limits, escalation, and feedback capture.",
  runbook: "Make triggers, prerequisites, exact actions, expected evidence, rollback, escalation, and ownership executable.",
};

const domainEvidence = {
  thinking: "problem statement, assumptions, alternatives, decision, measurable outcome",
  design: "intent, audience, journey, roles, states, accessibility, UI/API alignment",
  architecture: "boundaries, contracts, ownership, failures, observability, rollout, rollback",
  execution: "increment, acceptance criteria, tests, release, operations, support, learning",
  api: "audience, schema, auth, errors, idempotency, examples, compatibility, operations",
  payments: "transaction states, money movement, tokens, provider mapping, risk, funding, reconciliation",
  ecommerce: "customer journey, checkout states, merchant operations, recovery, accessibility, support",
  modernization: "legacy inventory, mappings, parity, tests, dual run, rollback, deprecation",
  documentation: "canonical source, audience layer, executable example, troubleshooting, freshness owner",
  "service-readiness": "owner, telemetry, runbook, knowledge, escalation, communication, rollback",
  "security-risk": "assets, trust boundaries, permissions, sensitive data, controls, residual risk, approval",
  "stablecoin-crypto": "maturity, network, asset, custody, finality, payout, reconciliation, legal/risk review",
  ai: "task packet, sources, routing, tool boundaries, evaluation, review, approval",
  "ai-agents": "task packet, context, routing, handoffs, evaluation, residual risk, approval",
  product: "customer evidence, outcome, requirements, alternatives, dependencies, metrics, readiness",
  engineering: "change boundary, contract impact, tests, security, rollout, rollback, documentation",
};

function title(slug) {
  return slug.split("-").map((part) => part.toUpperCase() === part && part.length < 5 ? part : part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function guidance(slug, domain) {
  const matched = Object.entries(keywordRules)
    .filter(([keyword]) => slug.includes(keyword))
    .map(([, rule]) => rule);
  return [
    `- Treat **${title(slug)}** as an explicit decision with defined scope, evidence, owner, and validation.`,
    matched[0] ? `- ${matched[0]}` : `- Required evidence: ${domainEvidence[domain] || domainEvidence.execution}.`,
    `- State what is verified, what is assumed, and what requires specialist or human approval.`,
  ].join("\n");
}

function enrich(file, marker, section) {
  const text = readFileSync(file, "utf8");
  const relative = path.relative(root, file).replaceAll("\\", "/");
  const parts = relative.split("/");
  const domain = parts[1];
  const slug = parts.at(-1) === "SKILL.md" ? parts.at(-2) : path.basename(file, ".md");
  const insertion = `\n${marker}\n\n${guidance(slug, domain)}\n\n${section}\n`;
  if (text.includes(marker)) {
    const start = text.indexOf(marker);
    const endMarker = marker === "## Domain Checklist" ? "\n## References" : "\n## Related";
    const end = text.indexOf(endMarker, start);
    if (end < 0) return false;
    const updated = `${text.slice(0, start).trimEnd()}\n${insertion}${text.slice(end).trimStart()}`;
    if (updated === text) return false;
    writeFileSync(file, updated, "utf8");
    return true;
  }
  const anchor = text.indexOf("\n## Related");
  const skillAnchor = text.indexOf("\n## References");
  const index = anchor >= 0 ? anchor : skillAnchor >= 0 ? skillAnchor : text.length;
  writeFileSync(file, `${text.slice(0, index).trimEnd()}\n${insertion}${text.slice(index).trimStart()}`, "utf8");
  return true;
}

let changed = 0;
for (const domain of readdirSync(path.join(root, "principles"), { withFileTypes: true }).filter((item) => item.isDirectory())) {
  if (["quick-reference", "game-development"].includes(domain.name)) continue;
  const directory = path.join(root, "principles", domain.name);
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isFile() || entry.name === "README.md" || !entry.name.endsWith(".md")) continue;
    changed += enrich(
      path.join(directory, entry.name),
      "## Topic-Specific Guidance",
      `See the [${title(domain.name)} canonical hub](README.md) and linked standards/checklists before making final claims.`
    ) ? 1 : 0;
  }
}

for (const domain of readdirSync(path.join(root, "skills"), { withFileTypes: true }).filter((item) => item.isDirectory())) {
  if (["source-backed", "game-development"].includes(domain.name)) continue;
  const directory = path.join(root, "skills", domain.name);
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name, "SKILL.md");
    try {
      changed += enrich(
        file,
        "## Domain Checklist",
        `## Required Reading\n\nRead the canonical ${title(domain.name)} principle hub, the closest enforceable standard, the applicable checklist, and exact target-repository evidence.`
      ) ? 1 : 0;
    } catch {
      // README files and non-skill entries are intentionally ignored.
    }
  }
}
console.log(`Enriched ${changed} topic and skill artifacts.`);
