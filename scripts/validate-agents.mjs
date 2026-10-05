#!/usr/bin/env node
// Enforce the agentContract block of references/agent-standards-contract.json
// against every agents/<domain>/<id>.md file. Runs in `npm run check`.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const contract = JSON.parse(readFileSync(path.join(root, "references", "agent-standards-contract.json"), "utf8")).agentContract;
const errors = [];

const SCOPES = new Set(contract.fields.scope.values);
const TIERS = new Set(contract.fields.model_tier.values);
const AUTONOMY = new Set(contract.fields.autonomy.values);
const TOOLS = new Set(contract.fields.tools.values);
const pendingHandoffs = [];

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

// Minimal frontmatter parser: scalars and "key:\n  - item" block lists.
function parse(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return null;
  const data = {};
  const lines = m[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const kv = lines[i].match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    const key = kv[1];
    let value = kv[2].trim();
    if (value === "" ) {
      const list = [];
      while (i + 1 < lines.length && /^\s+-\s+/.test(lines[i + 1])) {
        list.push(lines[i + 1].replace(/^\s+-\s+/, "").trim().replace(/^["']|["']$/g, ""));
        i += 1;
      }
      data[key] = list;
    } else if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    } else {
      data[key] = value.replace(/^["']|["']$/g, "");
    }
  }
  return data;
}

const agentsDir = path.join(root, "agents");
const filesList = walk(agentsDir).filter((f) => f.endsWith(".md") && !f.endsWith("README.md"));
const ids = new Map();

for (const file of filesList) {
  const rel = path.relative(root, file).replaceAll("\\", "/");
  const text = readFileSync(file, "utf8");
  const fm = parse(text);
  if (!fm) {
    errors.push(`${rel}: missing frontmatter`);
    continue;
  }

  for (const key of contract.requiredFrontmatter) {
    const v = fm[key];
    if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0 && key !== "applies_principles" && key !== "uses_skills")) {
      errors.push(`${rel}: missing or empty "${key}"`);
    }
  }

  const base = path.basename(file, ".md");
  if (fm.id && fm.id !== base) errors.push(`${rel}: id "${fm.id}" should equal the filename "${base}"`);
  if (fm.id) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(fm.id)) errors.push(`${rel}: id "${fm.id}" is not kebab-case`);
    if (ids.has(fm.id)) errors.push(`${rel}: duplicate id "${fm.id}" (also ${ids.get(fm.id)})`);
    ids.set(fm.id, rel);
  }

  if (fm.kind !== "agent") errors.push(`${rel}: kind must be "agent"`);
  const parentDomain = rel.split("/")[1];
  if (fm.domain !== parentDomain) errors.push(`${rel}: domain "${fm.domain}" != directory "${parentDomain}"`);
  if (fm.scope && !SCOPES.has(fm.scope)) errors.push(`${rel}: scope "${fm.scope}" not in ${[...SCOPES]}`);
  if (fm.model_tier && !TIERS.has(fm.model_tier)) errors.push(`${rel}: model_tier "${fm.model_tier}" not in ${[...TIERS]}`);
  if (fm.autonomy && !AUTONOMY.has(fm.autonomy)) errors.push(`${rel}: autonomy "${fm.autonomy}" not in ${[...AUTONOMY]}`);
  for (const t of fm.tools || []) if (!TOOLS.has(t)) errors.push(`${rel}: tool "${t}" not in ${[...TOOLS]}`);

  for (const heading of contract.body.requiredHeadings) {
    const present = heading === "# "
      ? /^#\s+\S/m.test(text)
      : new RegExp(`^${heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m").test(text);
    if (!present) errors.push(`${rel}: missing required heading "${heading}"`);
  }

  const enforceable = new Set(["security-risk", "risk", "security", "payments", "api", "architecture", "ai", "ecommerce", "harness"]);
  if (enforceable.has(fm.domain) && (fm.applies_principles || []).length === 0) {
    errors.push(`${rel}: domain "${fm.domain}" is enforceable but applies_principles is empty`);
  }
  const enforcesHeading = text.search(/^## Enforces\s*$/m);
  const enforcesBody = enforcesHeading < 0
    ? ""
    : text.slice(enforcesHeading).replace(/^## Enforces\s*\r?\n/, "").split(/^##\s/m, 1)[0];
  const enforcesBullets = [...enforcesBody.matchAll(/^\s*-\s+(.+)$/gm)].map((match) => match[1]);
  for (const p of fm.applies_principles || []) {
    const principlePath = path.resolve(root, p);
    if (!existsSync(principlePath)) {
      errors.push(`${rel}: applies_principles path missing: ${p}`);
      continue;
    }
    const hasActionableLink = enforcesBullets.some((bullet) => {
      const link = bullet.match(/\]\(([^)]+)\)\s*[—–-]\s*(.+)$/);
      if (!link || link[2].trim().length < 8 || /^[\s:.,;!?-]*$/.test(link[2])) return false;
      let linkedPath;
      try {
        linkedPath = decodeURIComponent(link[1].split(/[?#]/, 1)[0]);
      } catch {
        return false;
      }
      if (/^(?:https?:|mailto:|#)/i.test(linkedPath)) return false;
      return path.resolve(path.dirname(file), linkedPath) === principlePath;
    });
    if (!hasActionableLink) {
      errors.push(`${rel}: ## Enforces must link "${p}" and state an actionable check on the same bullet`);
    }
  }
  if (fm.handoffs !== undefined) {
    let handoffs;
    try {
      handoffs = JSON.parse(fm.handoffs);
    } catch {
      errors.push(`${rel}: handoffs must be a JSON-encoded array`);
      handoffs = [];
    }
    if (!Array.isArray(handoffs) || handoffs.length === 0) {
      errors.push(`${rel}: handoffs must be a non-empty array`);
    } else {
      handoffs.forEach((handoff, index) => {
        if (!handoff || typeof handoff !== "object" || Array.isArray(handoff)) {
          errors.push(`${rel}: handoffs[${index}] must be an object`);
          return;
        }
        if (typeof handoff.target !== "string" || !handoff.target.trim()) {
          errors.push(`${rel}: handoffs[${index}].target must be a non-empty agent id`);
        } else {
          pendingHandoffs.push({ rel, index, target: handoff.target.trim() });
        }
        if (typeof handoff.when !== "string" || !handoff.when.trim()) {
          errors.push(`${rel}: handoffs[${index}].when must be a non-empty trigger`);
        }
        if (!Array.isArray(handoff.required_evidence) || handoff.required_evidence.length === 0 ||
            handoff.required_evidence.some((item) => typeof item !== "string" || !item.trim())) {
          errors.push(`${rel}: handoffs[${index}].required_evidence must contain non-empty strings`);
        }
        if (typeof handoff.expected_output !== "string" || !handoff.expected_output.trim()) {
          errors.push(`${rel}: handoffs[${index}].expected_output must be a non-empty deliverable`);
        }
      });
    }
  }
  for (const s of fm.uses_skills || []) {
    const full = path.join(root, s);
    if (!existsSync(full) || !statSync(full).isDirectory()) errors.push(`${rel}: uses_skills path missing: ${s}`);
  }
}

for (const handoff of pendingHandoffs) {
  if (!ids.has(handoff.target)) {
    errors.push(`${handoff.rel}: handoffs[${handoff.index}] targets unknown agent "${handoff.target}"`);
  }
}

if (errors.length) {
  process.stdout.write(errors.map((e) => `- ${e}`).join("\n") + "\n");
  process.stdout.write(`\nagentContract validation: FAIL (${errors.length} issue(s))\n`);
  process.exit(1);
}
process.stdout.write(`agentContract validation: PASS\nAgents checked: ${filesList.length}\n`);
