#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), ".."), "product-hubs", "examples", "generic-payment-product");
const docs = {
"README.md": `# ExamplePay Product Hub

ExamplePay is a **hypothetical** payment-orchestration product used only to demonstrate a complete Product Hub. It is not a vendor claim, production design, compliance opinion, or recommendation.

## Canonical Scenario

ExamplePay lets a merchant submit a tokenized payment, receive an immediate processing result, capture an authorized payment, and reconcile settlement events. It never accepts raw card data in this example. All amounts are integer minor units and all mutating requests require idempotency keys.

## Navigation

- [Overview](overview.md) and [audience map](audience-map.md)
- [Business](business-guide.md), [partner](bank-acquirer-partner-guide.md), and [developer](developer-integrator-guide.md) guidance
- [API guide](api-guide.md), [examples](api-examples.md), and [AI-safe usage](ai-usage-examples.md)
- [Implementation blueprint](implementation-blueprint.md), [migration](migration-guide.md), and [operations](operations-guide.md)
- [Troubleshooting](troubleshooting-guide.md), [demo](demos/demo-plan.md), and [launch gate](launch-readiness-checklist.md)

## Shared Truth

The lifecycle is \`created → authorized → captured → submitted_for_settlement → settled\`, with \`declined\`, \`voided\`, \`refunded\`, and \`failed\` terminal or compensating outcomes. Canonical identifiers are \`payment_id\`, \`merchant_reference\`, \`request_id\`, and \`processor_reference\`.
`,
"overview.md": `# Overview

## Customer Problem

Merchants need one predictable contract for payment submission, lifecycle visibility, recovery, and reconciliation while processor-specific behavior remains behind an adapter boundary.

## Proposed Capability

ExamplePay accepts a previously created payment-method token, amount, currency, merchant reference, and idempotency key. It returns a payment resource with explicit status and safe next actions. Capture, void, and refund are separate permissioned operations.

## Explicit Exclusions

Raw payment credentials, recurring billing schedules, marketplace fund splitting, chargeback adjudication, stablecoin settlement, and cross-border compliance are outside this example.

## Success Evidence

- Duplicate requests do not create duplicate financial effects.
- Every response and webhook carries supportable identifiers.
- State transitions reconcile against settlement input.
- Declines are customer-safe while internal diagnostics remain restricted.
- Rollback can route traffic back to the legacy path without losing reconciliation records.

All capability and performance statements are assumptions until supported by implementation and test evidence.
`,
"audience-map.md": `# Audience Map

| Audience | Primary question | Required artifact | Decision owner |
| --- | --- | --- | --- |
| Merchant/business | What outcome and cost does this enable? | Business guide and launch measures | Product |
| Bank/acquirer/partner | Which messages, controls, and settlement records cross the boundary? | Partner guide and certification evidence | Partnerships |
| Developer/integrator | How do I authenticate, retry, test, and migrate? | API guide and executable examples | Engineering |
| Support/operations | How do I locate, explain, and recover a payment? | Runbook and troubleshooting guide | Operations |
| Security/risk | Where are credentials, permissions, fraud signals, and audit records controlled? | Threat/risk review | Security/risk |
| AI agent | Which facts may be used and which actions require approval? | AI-safe examples and tool boundaries | Product + security |

Every audience uses the same lifecycle and identifiers. Audience layers may simplify language but cannot invent behavior.
`,
"business-guide.md": `# Business Guide

## Intended Outcome

Reduce integration variance and support investigation time by presenting one payment lifecycle across processor adapters.

## Merchant Journey

Configure credentials and permissions, create a token outside ExamplePay, submit a payment, present the returned outcome, capture when fulfillment permits, and reconcile settlement reports.

## Measures

Track authorization outcome by reason family, duplicate-effect prevention, capture completion, settlement match rate, time to identify a payment, and migration rollback rate. Targets must be approved from baseline evidence; this example supplies no performance claims.

## Business Risks

Processor feature differences may leak through the abstraction; generic decline messages can hide actionable configuration issues; delayed settlement can be mistaken for failed capture; and unclear refund timing can create customer-service promises the system cannot support.

Launch requires product, finance, operations, security, legal/compliance, and partner approval where applicable.
`,
"bank-acquirer-partner-guide.md": `# Bank, Acquirer, and Partner Guide

## Boundary Contract

The partner adapter translates ExamplePay requests into an approved processor contract and maps responses into canonical status and reason families without discarding the original processor reference.

## Certification Evidence

- Supported transaction types, currencies, amount limits, and credential scopes.
- Field mapping for authorization, capture, void, refund, settlement, and error responses.
- Duplicate/replay behavior and timeout recovery.
- Webhook authenticity, ordering, retry, and replay procedure.
- Settlement file delivery, timezone, fee, and exception semantics.

## Ownership

ExamplePay owns canonical contract behavior and audit correlation. The partner owns processor availability and authoritative processor codes. Finance owns settlement acceptance. Unsupported behavior stays explicit rather than being approximated.
`,
"developer-integrator-guide.md": `# Developer and Integrator Guide

## Integration Sequence

1. Obtain a scoped server credential and a sandbox payment-method token.
2. Generate a unique merchant reference and idempotency key.
3. Create a payment and persist the returned \`payment_id\`.
4. Treat timeout as unknown; retrieve by ID or retry with the same idempotency key.
5. Capture only an \`authorized\` payment.
6. Verify signed webhooks, deduplicate event IDs, and fetch current state before side effects.
7. Reconcile settled payments independently of webhook delivery.

## Non-negotiable Rules

Never log credentials or tokens, never infer success from an HTTP status alone, never retry a mutation with a new idempotency key after an unknown result, and never expose processor diagnostics directly to customers.

Use [API examples](api-examples.md) as illustrative fixtures; hostnames and credentials are placeholders.
`,
"api-guide.md": `# API Guide

## Contract

\`POST /v1/payments\` creates an authorization. Required fields are \`amount\`, \`currency\`, \`payment_method_token\`, and \`merchant_reference\`; the \`Idempotency-Key\` header is mandatory. \`POST /v1/payments/{id}/capture\`, \`/void\`, and \`/refunds\` enforce state and permission checks. \`GET /v1/payments/{id}\` returns canonical state.

## Response and Errors

Success returns the payment resource plus \`request_id\`. Errors use \`code\`, customer-safe \`message\`, \`request_id\`, optional \`field_errors\`, and \`retryable\`. Authentication failures reveal no credential detail. A conflict identifies invalid state or idempotency payload mismatch.

## Webhooks

Events contain \`event_id\`, \`type\`, \`occurred_at\`, and the canonical payment ID. Verify the signature against the raw body, enforce timestamp tolerance, store event IDs, and tolerate duplicates and reordering.

Versioning is additive within v1; breaking contract changes require a new version and migration evidence.
`,
"api-examples.md": `# API Examples

All values are fictional.

## Authorize

\`\`\`bash
curl -X POST https://sandbox.example.invalid/v1/payments \\
  -H "Authorization: Bearer $EXAMPLEPAY_KEY" \\
  -H "Idempotency-Key: order-1042-attempt-1" \\
  -H "Content-Type: application/json" \\
  -d '{"amount":2599,"currency":"USD","payment_method_token":"pm_test_123","merchant_reference":"order-1042"}'
\`\`\`

\`\`\`json
{"payment_id":"pay_01","status":"authorized","amount":2599,"currency":"USD","merchant_reference":"order-1042","request_id":"req_01"}
\`\`\`

## Decline

\`\`\`json
{"payment_id":"pay_02","status":"declined","reason":{"family":"payment_method_declined","customer_message":"The payment could not be approved."},"request_id":"req_02"}
\`\`\`

## Error

\`\`\`json
{"code":"idempotency_conflict","message":"The key was already used with different request data.","request_id":"req_03","retryable":false}
\`\`\`
`,
"ai-usage-examples.md": `# AI Usage Examples

## Allowed Assistance

An AI agent may explain canonical states, draft sandbox code using placeholders, group sanitized error families, summarize reconciliation mismatches, and propose test cases.

## Prohibited Without Human Approval

The agent must not use live credentials, initiate or retry a real payment, change routing or fraud controls, promise settlement timing, interpret legal obligations, or expose restricted processor diagnostics.

## Safe Prompt

“Using the ExamplePay v1 contract and these redacted sandbox responses, identify the lifecycle state, cite the request IDs, distinguish retryable from non-retryable outcomes, and propose tests. Do not execute requests or infer facts absent from evidence.”

Outputs must label verified facts, assumptions, recommended actions, and the accountable approver.
`,
"implementation-blueprint.md": `# Implementation Blueprint

## Components

- API boundary: authentication, schema validation, idempotency, and canonical errors.
- Payment service: state-transition rules and command authorization.
- Adapter: processor mapping, timeouts, and original reference retention.
- Event service: transactional event creation, signature, retry, and replay.
- Ledger/reconciliation store: immutable financial events and settlement matching.
- Operations surface: lookup by canonical and partner identifiers with restricted diagnostics.

## Data and Security

Store tokens rather than raw credentials, encrypt secrets, separate capture/refund permissions, redact logs, and audit every mutation. Persist idempotency request hashes and results. State changes and outbound events must share a recoverable transaction/outbox boundary.

## Delivery

Build contract fixtures, adapter simulators, state tests, webhook replay tests, reconciliation fixtures, operational dashboards, and rollback controls before production traffic.
`,
"migration-guide.md": `# Migration Guide

## Phases

Inventory legacy operations and processor codes; create field and status mappings; run contract fixtures; introduce a facade in shadow-read mode; dual-write only where reconciliation proves safety; canary merchants; then expand by evidence.

## Parity Gate

Authorization, capture, void, refund, timeout recovery, duplicate prevention, webhooks, settlement, reporting identifiers, permissions, and support lookup require explicit parity or an approved exclusion.

## Rollback

Keep legacy routing available per merchant, preserve both identifiers, stop new traffic without deleting events, and reconcile in-flight transactions before changing the system of record. Deprecation requires usage evidence, communications, support preparation, dates, and exception ownership.
`,
"operations-guide.md": `# Operations Guide

## Observe

Monitor request rate, latency, canonical outcomes, unknown timeouts, adapter health, webhook backlog, duplicate suppression, capture age, and settlement mismatches. Alert on customer impact and reconciliation risk, not raw volume alone.

## Investigate

Start with \`payment_id\` or \`request_id\`; confirm canonical state; correlate the processor reference; inspect adapter attempts and event delivery; then compare settlement records. Never ask support users for raw payment credentials.

## Recover

Retry only operations explicitly marked safe and with the original idempotency key. Replay signed events from the event store, not handcrafted payloads. Escalate unknown financial state, reconciliation imbalance, credential compromise, or repeated processor inconsistency.
`,
"troubleshooting-guide.md": `# Troubleshooting Guide

| Symptom | Verify | Safe action | Escalate when |
| --- | --- | --- | --- |
| Customer saw a timeout | Request ID, payment lookup, idempotency record | Retrieve state or retry same key | State remains unknown |
| Payment declined | Canonical reason family and configuration | Customer-safe retry guidance | Processor mapping looks wrong |
| Capture rejected | Current state, amount, permission | Correct request or void if valid | State conflicts with processor |
| Webhook missing | Event store, signature failures, delivery backlog | Replay stored event | Backlog or authenticity failure persists |
| Settlement mismatch | Payment, capture, fees, settlement reference | Open reconciliation exception | Financial totals do not balance |

Record evidence, actions, owner, and customer communication for every material incident.
`,
"launch-readiness-checklist.md": `# Launch Readiness Checklist

- [ ] Product scope, exclusions, audiences, owners, and success measures are approved.
- [ ] API schema, authentication, permissions, errors, idempotency, and versioning pass contract tests.
- [ ] Processor mappings and unsupported capabilities have partner approval.
- [ ] State transitions, timeout recovery, webhook replay, and duplicate handling pass failure tests.
- [ ] Security, privacy, fraud, legal/compliance, and data-handling reviews are complete.
- [ ] Settlement fixtures reconcile and finance accepts the exception process.
- [ ] Dashboards, alerts, runbooks, support lookup, and escalation paths are exercised.
- [ ] Migration canary, stop conditions, rollback, and in-flight ownership are documented.
- [ ] Customer, partner, developer, support, and incident communications are ready.
- [ ] Final approval records evidence and names accountable owners.
`,
"demos/demo-plan.md": `# Demo Plan

## Goal

Demonstrate the same ExamplePay truth to business, developer, partner, support, and risk audiences without implying production readiness.

## Script

Create a sandbox authorization with an idempotency key; repeat it to prove one effect; capture it; receive and verify a duplicate webhook; locate it using the request and processor references; match a settlement fixture; then show a decline and an unknown-timeout recovery.

## Evidence

Record request/response fixtures, state transitions, signature verification, duplicate suppression, operations lookup, reconciliation result, and rollback control. Use only synthetic tokens and amounts.

## Failure Branches

Show idempotency payload conflict, invalid capture state, bad webhook signature, delayed settlement, and customer-safe decline messaging.

## Exit Criteria

Each audience can state its next action, no live credential or claim appears, and every result maps to an acceptance test or open question.
`
};

for (const [relative, body] of Object.entries(docs)) {
  const file = path.join(root, ...relative.split("/"));
  const original = readFileSync(file, "utf8");
  const frontmatter = original.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/)?.[0] || "";
  writeFileSync(file, `${frontmatter.replace(/domain:\s*["']?repository["']?/, 'domain: "payments"')}\n${body.trim()}\n`, "utf8");
}
console.log(`Completed ${Object.keys(docs).length} payment Product Hub documents.`);
