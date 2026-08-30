#!/usr/bin/env node
// One-shot migration: rewrite every agents/<domain>/<id>.md frontmatter to the
// agentContract shape defined in references/agent-standards-contract.json.
//
// Mechanical fields (id, kind, domain, scope, tools, model_tier, autonomy,
// last_updated) come from the filename + small classification maps. Prose
// fields (description, escalation) are lifted verbatim from the body's
// "## When to Use" and "## Escalation Rules" sections. uses_skills is parsed
// from the "## Required Skills" links. applies_principles is seeded from a
// domain map and is expected to be hand-refined afterwards.
//
// Re-runnable: it rebuilds frontmatter from the current body each time.
// Use --check to report what would change without writing.

import { existsSync, readFileSync, readdirSync, writeFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const TODAY = "2026-08-30";

const GLOBAL_IDS = new Set([
  "apt-router", "apt-principal", "apt-architecture-lead", "apt-design-lead",
  "apt-execution-lead", "apt-thinking-lead",
  "glyph", "javik", "kaidan", "kasumi", "samara", "miranda", "suvi", "wrex", "drack",
]);

// agents/harness/apt-router.md collides with agents/core/apt-router.md on id.
// The harness one is the task-packet router (Charter Matrix "third router");
// give it a distinct id pending a file rename.
const ID_OVERRIDE = {};

const EDIT_IDS = new Set(["apt-refactor-agent", "apt-repair-agent", "apt-cloudflare-builder", "apt-installer"]);
const NONE_IDS = new Set(["apt-router", "apt-task-router", "apt-model-router", "apt-repo-scanner"]);
const DEEP_IDS = new Set([
  "apt-router", "apt-principal", "apt-architecture-lead", "apt-design-lead",
  "apt-execution-lead", "apt-thinking-lead", "kasumi", "javik", "apt-architect",
]);

const DOMAIN_PRINCIPLES = {
  core: ["principles/framework.md", "principles/thinking/practical-thinking.md"],
  harness: ["principles/ai/agent-design.md"],
  api: ["principles/api/README.md", "principles/api/modern-api-design.md"],
  architecture: ["principles/architecture/README.md"],
  risk: ["principles/security-risk/security-review.md"],
  security: ["principles/security-risk/security-review.md"],
  payments: ["principles/payments/README.md"],
  ecommerce: ["principles/ecommerce/README.md"],
  docs: ["principles/documentation/README.md"],
  documentation: ["principles/documentation/README.md"],
  product: ["principles/execution/delivery-increments.md"],
  engineering: ["principles/execution/quality-and-testing.md"],
  "beginner-reviewers": ["principles/thinking/beginner-clarity.md"],
  customer: ["principles/design/role-based-experience.md"],
  "game-development": ["principles/game-development/README.md"],
  thinking: ["principles/thinking/practical-thinking.md"],
};

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

function splitFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { fm: {}, body: text };
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const item = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (item) fm[item[1]] = item[2].trim();
  }
  return { fm, body: text.slice(m[0].length) };
}

function unquote(v) {
  return (v || "").replace(/^["']|["']$/g, "").trim();
}

function section(body, heading) {
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex((l) => l.trim() === heading);
  if (start < 0) return [];
  const out = [];
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^##\s/.test(lines[i])) break;
    out.push(lines[i]);
  }
  return out;
}

function firstParagraph(sectionLines) {
  const text = sectionLines.map((l) => l.trim()).filter(Boolean);
  const para = [];
  for (const l of text) {
    if (l.startsWith("- ") || l.startsWith("* ") || /^\d+\./.test(l)) break;
    para.push(l);
  }
  return para.join(" ").trim();
}

function firstSentence(sectionLines) {
  const p = firstParagraph(sectionLines);
  const dot = p.indexOf(". ");
  return dot > 0 ? p.slice(0, dot + 1) : p;
}

function skillPaths(body) {
  const lines = section(body, "## Required Skills");
  const paths = [];
  for (const l of lines) {
    const m = l.match(/\]\(\.\.\/\.\.\/(skills\/[^)]+?)\/SKILL\.md\)/);
    if (m) paths.push(m[1]);
  }
  return paths;
}

function yamlList(key, values) {
  if (values.length === 0) return `${key}: []`;
  return `${key}:\n${values.map((v) => `  - ${v}`).join("\n")}`;
}

function yamlScalar(v) {
  return /[:#\[\]{}]|^\s|\s$/.test(v) ? JSON.stringify(v) : v;
}

const agentsDir = path.join(root, "agents");
const filesList = walk(agentsDir).filter((f) => f.endsWith(".md") && !f.endsWith("README.md"));
const problems = [];
const seenIds = new Map();
let changed = 0;

for (const file of filesList) {
  const rel = path.relative(root, file).replaceAll("\\", "/");
  const raw = readFileSync(file, "utf8");
  const { fm, body } = splitFrontmatter(raw);
  const base = path.basename(file, ".md");
  const id = ID_OVERRIDE[rel] || base;
  const domain = unquote(fm.domain) || rel.split("/")[1];

  if (seenIds.has(id)) problems.push(`Duplicate id "${id}": ${rel} and ${seenIds.get(id)}`);
  seenIds.set(id, rel);

  const principles = DOMAIN_PRINCIPLES[domain];
  if (!principles) problems.push(`No principle mapping for domain "${domain}": ${rel}`);
  for (const p of principles || []) {
    if (!existsSync(path.join(root, p))) problems.push(`Mapped principle missing: ${p} (for ${rel})`);
  }

  const description = firstParagraph(section(body, "## When to Use")) || unquote(fm.title);
  const escalation =
    firstSentence(section(body, "## Escalation Rules")) ||
    "Escalate unsupported, high-impact, or irreversible decisions to the accountable human.";
  const uses = skillPaths(body);
  for (const s of uses) {
    if (!existsSync(path.join(root, s))) problems.push(`Referenced skill missing: ${s} (for ${rel})`);
  }

  const scope = GLOBAL_IDS.has(id) ? "global" : "domain";
  const tools = EDIT_IDS.has(id) ? ["read", "search", "edit"] : ["read", "search"];
  const autonomy = NONE_IDS.has(id) ? "none" : EDIT_IDS.has(id) ? "bounded-edit" : "advisory";
  const modelTier = DEEP_IDS.has(id) || /architect/.test(id) ? "deep" : "standard";

  const lines = [
    "---",
    `id: ${id}`,
    `title: ${yamlScalar(unquote(fm.title) || id)}`,
    "kind: agent",
    `domain: ${domain}`,
    `scope: ${scope}`,
    `description: ${yamlScalar(description)}`,
    yamlList("applies_principles", principles || []),
    yamlList("uses_skills", uses),
    yamlList("tools", tools),
    `model_tier: ${modelTier}`,
    `autonomy: ${autonomy}`,
    `escalation: ${yamlScalar(escalation)}`,
    `status: ${unquote(fm.status) || "active"}`,
    `owner: ${unquote(fm.owner) || "APT"}`,
    `last_updated: ${TODAY}`,
  ];
  if (fm.source) lines.push(`source: ${yamlScalar(unquote(fm.source))}`);
  lines.push(`source_paths: ["apt-principles-agents/${rel}"]`);
  lines.push("---");

  const next = lines.join("\n") + "\n" + body.replace(/^\n+/, "\n");
  if (next !== raw) {
    changed += 1;
    if (check) problems.push(`WOULD REWRITE: ${rel}`);
    else writeFileSync(file, next, "utf8");
  }
}

if (problems.length) {
  process.stdout.write(problems.join("\n") + "\n");
}
process.stdout.write(
  `${check ? "check" : "migrate"}: ${filesList.length} agent files, ${changed} ${check ? "would change" : "rewritten"}, ${problems.filter((p) => !p.startsWith("WOULD REWRITE")).length} problem(s)\n`,
);
process.exit(problems.some((p) => !p.startsWith("WOULD REWRITE")) ? 1 : 0);
