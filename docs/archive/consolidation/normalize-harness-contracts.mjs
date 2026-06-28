#!/usr/bin/env node
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function appendMissing(file, sections) {
  let text = readFileSync(file, "utf8");
  const missing = sections.filter(([heading]) => !text.includes(heading));
  if (!missing.length) return 0;
  text = `${text.trim()}\n\n${missing.map(([heading, body]) => `${heading}\n\n${body}`).join("\n\n")}\n`;
  writeFileSync(file, text, "utf8");
  return 1;
}

let changed = 0;
const harness = path.join(root, "agents", "harness");
for (const entry of readdirSync(harness, { withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
  const role = entry.name.replace(/\.md$/, "").replaceAll("-", " ");
  changed += appendMissing(path.join(harness, entry.name), [
    ["## Role", `Act as the ${role} within the APT discover, classify, validate, remediate, verify, and approve lifecycle.`],
    ["## When to Use", "Use when the task matches this harness responsibility or the APT router selects it based on risk and evidence needs."],
    ["## Required Skills", "Use the closest canonical APT skill, the relevant context pack, and exact target-repository instructions."],
    ["## Inputs", "Task packet, selected context, target evidence, installed manifest, constraints, validation commands, and approval boundaries."],
    ["## Process", "Inspect evidence, apply the defined responsibility, record decisions and handoffs, then route the result to verification and accountable approval."],
    ["## Outputs", "Return findings or actions, evidence, validation status, residual risk, next owner, and approval state."],
    ["## Escalation Rules", "Escalate unsupported, high-impact, security, privacy, payment, compliance, destructive, or production decisions to the relevant specialist and accountable human."],
    ["## Quality Bar", "The result is source-backed, scoped, reproducible, safe by default, explicit about uncertainty, and suitable for independent verification."],
  ]);
}

const tokenSkill = path.join(root, "skills", "source-backed", "token-efficiency", "SKILL.md");
changed += appendMissing(tokenSkill, [
  ["## When to Use", "Use when context size, repeated source loading, model cost, or long-running agent work needs a deliberate evidence-preserving context strategy."],
  ["## Inputs", "Task, authoritative sources, context budget, risk classification, expected output, and verification requirements."],
  ["## Outputs", "A compact context packet, omitted-source record, token/risk tradeoff, and verification plan."],
  ["## Quality Bar", "Compression preserves decisive evidence, names omissions, and never substitutes for exact-source review in high-accuracy work."],
  ["## References", "See the AI principles, token-efficiency standard, context-pack guidance, and model-routing policy."],
]);

console.log(`Normalized ${changed} source-backed harness contract(s).`);
