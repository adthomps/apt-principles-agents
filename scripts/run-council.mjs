#!/usr/bin/env node
// Headless equivalent of /edi. Reads the "## Gates" block of a plan file
// (see docs/plan-gates.md), resolves the required agents against
// references/agent-catalog.json, and either prints the review plan (default) or
// invokes each agent as its own top-level `claude -p` call (--run).
//
//   node scripts/run-council.mjs <plan-file>            # print the plan
//   node scripts/run-council.mjs <plan-file> --run      # invoke each agent
//   node scripts/run-council.mjs --self-test            # CI sanity check
//
// Delegation stays one level deep: each agent is a separate top-level
// invocation, aggregated here — this script is the orchestrator, not a role.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(path.join(root, "references", "agent-catalog.json"), "utf8")).agents;
const byId = new Map(catalog.map((a) => [a.id, a]));
const args = process.argv.slice(2);
const run = args.includes("--run");
const selfTest = args.includes("--self-test");
const planPath = args.find((a) => !a.startsWith("--"));

function parseGates(text) {
  const m = text.match(/##\s+Gates\s*\r?\n+```(?:ya?ml)?\r?\n([\s\S]*?)\r?\n```/i);
  if (!m) return null;
  const gates = { required_agents: [], acceptance: [], rollback: "" };
  let key = null;
  for (const raw of m[1].split(/\r?\n/)) {
    const line = raw.replace(/\s+$/, "");
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kv) {
      key = kv[1];
      const v = kv[2].trim();
      if (v.startsWith("[") && v.endsWith("]")) gates[key] = v.slice(1, -1).split(",").map((s) => s.trim()).filter(Boolean);
      else if (v) gates[key] = v.replace(/^["']|["']$/g, "");
      continue;
    }
    const item = line.match(/^\s*-\s+(.*)$/);
    if (item && key && Array.isArray(gates[key])) gates[key].push(item[1].trim().replace(/^["']|["']$/g, ""));
  }
  return gates;
}

function resolve(ids) {
  const missing = ids.filter((id) => !byId.has(id));
  if (missing.length) throw new Error(`Unknown agent id(s) in required_agents: ${missing.join(", ")}`);
  return ids.map((id) => byId.get(id));
}

if (selfTest) {
  const sample = "## Gates\n```yaml\nrequired_agents: [" + catalog.slice(0, 3).map((a) => a.id).join(", ") + "]\nacceptance:\n  - npm run check\nrollback: \"revert\"\n```\n";
  const g = parseGates(sample);
  resolve(g.required_agents);
  if (g.acceptance.length !== 1 || !g.rollback) throw new Error("self-test: gates parse incomplete");
  process.stdout.write(`run-council self-test: PASS (${catalog.length} agents in catalog)\n`);
  process.exit(0);
}

if (!planPath || !existsSync(planPath)) {
  process.stderr.write("usage: node scripts/run-council.mjs <plan-file> [--run] | --self-test\n");
  process.exit(2);
}

const gates = parseGates(readFileSync(planPath, "utf8"));
if (!gates) {
  process.stderr.write(`no "## Gates" block in ${planPath} (see docs/plan-gates.md)\n`);
  process.exit(2);
}
const council = resolve(gates.required_agents);

process.stdout.write(`Council for ${path.basename(planPath)} — ${council.length} agent(s)\n\n`);
for (const a of council) {
  process.stdout.write(`- ${a.id} (${a.domain}, ${a.model_tier})\n  ${a.canonical_path}\n  enforces: ${a.applies_principles.join(", ") || "—"}\n`);
}
process.stdout.write(`\nacceptance: ${gates.acceptance.join(" && ") || "(none)"}\n`);
process.stdout.write(`rollback:   ${gates.rollback || "(none)"}\n`);

if (!run) process.exit(0);

let failed = 0;
for (const a of council) {
  const prompt = `@${a.id} Review the current change against the principles you enforce (${a.applies_principles.join(", ")}). Return Perspective, Concerns, Recommended changes, Risks, Questions, Approval status.`;
  process.stdout.write(`\n--- ${a.id} ---\n`);
  try {
    process.stdout.write(execFileSync("claude", ["-p", prompt], { cwd: path.dirname(path.resolve(planPath)), encoding: "utf8" }));
  } catch (error) {
    failed += 1;
    process.stdout.write(`invocation failed: ${error.message}\n`);
  }
}
process.exit(failed ? 1 : 0);
