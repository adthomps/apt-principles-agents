#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const errors = [];
const warnings = [];

function files(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules") return [];
    const child = path.join(directory, entry.name);
    return entry.isDirectory() ? files(child) : [child];
  });
}

function relative(file) {
  return path.relative(root, file).replaceAll("\\", "/");
}

function frontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (item) data[item[1]] = item[2].trim();
  }
  return data;
}

const requiredRoot = ["README.md", "AGENTS.md", "CODEX.md", "CLAUDE.md", "GEMINI.md", "CONTRIBUTING.md"];
for (const file of requiredRoot) if (!existsSync(path.join(root, file))) errors.push(`Missing ${file}`);
for (const directory of ["principles", "standards", "checklists", "governance", "references", "context-packs", "skills", "agents", "prompts", "templates", "examples", "platforms", "manifests", "installers", "routing"]) {
  if (!existsSync(path.join(root, directory))) errors.push(`Missing first-class directory ${directory}/`);
}

const active = files(root).filter((file) => !relative(file).startsWith("docs/archive/"));
for (const file of active) if (statSync(file).size === 0) errors.push(`Empty file ${relative(file)}`);

const metadataFields = ["kind", "domain", "status", "owner", "last_updated", "source_paths"];
const allowedStatuses = new Set(["active", "draft", "stable", "emerging", "future-looking", "deprecated"]);
for (const file of active.filter((item) => item.endsWith(".md"))) {
  const text = readFileSync(file, "utf8");
  const data = frontmatter(text);
  if (!data) {
    errors.push(`Missing frontmatter: ${relative(file)}`);
    continue;
  }
  if (!data.title && !data.name) errors.push(`Missing title/name metadata: ${relative(file)}`);
  for (const field of metadataFields) if (!data[field]) errors.push(`Missing ${field} metadata: ${relative(file)}`);
  const status = data.status?.replaceAll(/["']/g, "");
  const domain = data.domain?.replaceAll(/["']/g, "");
  if (status && !allowedStatuses.has(status)) errors.push(`Invalid active status ${status}: ${relative(file)}`);
  if (["README", "repository", "general"].includes(domain)) errors.push(`Non-specific active domain ${domain}: ${relative(file)}`);
}

const skillHeadings = ["# ", "## Purpose", "## When to Use", "## Inputs", "## Process", "## Outputs", "## Quality Bar", "## References"];
for (const file of files(path.join(root, "skills")).filter((item) => item.endsWith("SKILL.md"))) {
  const text = readFileSync(file, "utf8");
  for (const heading of skillHeadings) if (!text.includes(heading)) errors.push(`Skill missing ${heading}: ${relative(file)}`);
}

const agentHeadings = ["# ", "## Role", "## When to Use", "## Responsibilities", "## Required Skills", "## Inputs", "## Process", "## Outputs", "## Escalation Rules", "## Quality Bar"];
for (const file of files(path.join(root, "agents")).filter((item) => item.endsWith(".md") && !item.endsWith("README.md"))) {
  const text = readFileSync(file, "utf8");
  for (const heading of agentHeadings) if (!text.includes(heading)) errors.push(`Agent missing ${heading}: ${relative(file)}`);
}

for (const file of files(path.join(root, "principles", "stablecoin-crypto")).filter((item) => item.endsWith(".md"))) {
  const text = readFileSync(file, "utf8");
  for (const label of ["Mature today", "Emerging", "Future-looking", "Requires legal/compliance/risk review"]) {
    if (!text.includes(label)) errors.push(`Stablecoin label missing ${label}: ${relative(file)}`);
  }
}

const canonicalHubs = [
  "principles/framework.md",
  "principles/thinking/README.md",
  "principles/design/README.md",
  "principles/architecture/README.md",
  "principles/system-standards/README.md",
  "principles/security-risk/README.md",
  "principles/execution/delivery-increments.md",
  "principles/execution/quality-and-testing.md",
  "principles/execution/release-and-change-management.md",
  "principles/execution/operations-and-support.md",
  "principles/execution/knowledge-and-learning.md",
  "principles/ai/README.md",
];
for (const item of canonicalHubs) {
  const file = path.join(root, item);
  if (!existsSync(file)) {
    errors.push(`Missing canonical hub ${item}`);
    continue;
  }
  const text = readFileSync(file, "utf8");
  const wordCount = (text.match(/\b[\w'-]+\b/g) || []).length;
  if (wordCount < 350) errors.push(`Canonical hub is too shallow (${wordCount} words): ${item}`);
  if (!frontmatter(text)?.source_paths?.includes("apt-principles/")) errors.push(`Canonical hub lacks source provenance: ${item}`);
}

const principleBodies = new Map();
for (const file of files(path.join(root, "principles")).filter((item) => item.endsWith(".md") && !item.endsWith("README.md") && !relative(item).includes("/quick-reference/"))) {
  const text = readFileSync(file, "utf8")
    .replace(/^---[\s\S]*?---\r?\n?/, "")
    .replace(/^#\s+.*$/m, "")
    .replace(/\s+/g, " ")
    .trim();
  const values = principleBodies.get(text) || [];
  values.push(relative(file));
  principleBodies.set(text, values);
}
for (const duplicates of principleBodies.values()) {
  if (duplicates.length > 1) errors.push(`Boilerplate-identical principle bodies: ${duplicates.join(", ")}`);
}

const manifestSections = ["principles", "standards", "checklists", "context", "skills", "agents", "templates", "prompts", "platforms"];
for (const file of files(path.join(root, "manifests")).filter((item) => item.endsWith(".yaml"))) {
  const text = readFileSync(file, "utf8");
  for (const section of manifestSections) if (!text.includes(`${section}:`)) errors.push(`Manifest missing ${section}: ${relative(file)}`);
  let section = null;
  for (const line of text.split(/\r?\n/)) {
    const heading = line.match(/^([a-z-]+):\s*$/);
    if (heading) {
      section = heading[1];
      continue;
    }
    const item = line.match(/^\s+-\s+(.+)$/);
    if (!item) continue;
    if (section === "extends") {
      if (!existsSync(path.join(root, "manifests", `${item[1].trim()}.yaml`))) errors.push(`Manifest extends missing manifest ${item[1]}: ${relative(file)}`);
    } else if (manifestSections.includes(section) && !existsSync(path.join(root, item[1].trim()))) {
      errors.push(`Manifest path missing ${item[1]}: ${relative(file)}`);
    }
  }
}

const ledgerPath = path.join(root, "docs", "migration", "source-ledger.json");
if (!existsSync(ledgerPath)) {
  errors.push("Missing source migration ledger");
} else {
  const ledger = JSON.parse(readFileSync(ledgerPath, "utf8"));
  if (ledger.sourceFileCount !== 505 || ledger.files.length !== 505) errors.push(`Source ledger must classify 505 files; found ${ledger.files.length}`);
  if (new Set(ledger.files.map((item) => item.source)).size !== 505) errors.push("Source ledger contains duplicate source paths");
  const allowed = new Set(["migrated", "merged", "external", "historical", "historical_generated", "retired"]);
  for (const item of ledger.files) {
    if (!allowed.has(item.classification)) errors.push(`Unknown ledger classification ${item.classification}: ${item.source}`);
    if (["migrated", "merged"].includes(item.classification) && item.destination && !existsSync(path.join(root, item.destination))) {
      errors.push(`Ledger destination missing ${item.destination}: ${item.source}`);
    }
  }
}

const hubBase = path.join(root, "product-hubs", "examples", "generic-payment-product");
for (const file of ["README.md", "overview.md", "audience-map.md", "business-guide.md", "bank-acquirer-partner-guide.md", "developer-integrator-guide.md", "api-guide.md", "api-examples.md", "ai-usage-examples.md", "implementation-blueprint.md", "migration-guide.md", "operations-guide.md", "troubleshooting-guide.md", "launch-readiness-checklist.md", "diagrams/payment-flow.mmd", "demos/demo-plan.md"]) {
  if (!existsSync(path.join(hubBase, file))) errors.push(`Product Hub missing ${file}`);
}
for (const file of files(hubBase).filter((item) => item.endsWith(".md"))) {
  const text = readFileSync(file, "utf8");
  if (/State who uses this artifact|Product capability and exclusions|Describe how the work will/i.test(text)) errors.push(`Product Hub contains scaffold placeholder: ${relative(file)}`);
  if ((text.match(/\b[\w'-]+\b/g) || []).length < 60) errors.push(`Product Hub artifact is too shallow: ${relative(file)}`);
}
const catalogExpectations = [
  ["AGENT-CATALOG.md", files(path.join(root, "agents")).filter((item) => item.endsWith(".md") && !item.endsWith("README.md")).length],
  ["SKILL-CATALOG.md", files(path.join(root, "skills")).filter((item) => item.endsWith("SKILL.md")).length],
  ["PROMPT-CATALOG.md", files(path.join(root, "prompts")).filter((item) => item.endsWith(".md") && !item.endsWith("README.md")).length],
  ["TEMPLATE-CATALOG.md", files(path.join(root, "templates")).filter((item) => [".md", ".json"].includes(path.extname(item)) && !item.endsWith("README.md")).length],
  ["MANIFEST-CATALOG.md", files(path.join(root, "manifests")).filter((item) => item.endsWith(".yaml")).length],
];
for (const [catalog, expected] of catalogExpectations) {
  const text = readFileSync(path.join(root, "docs", "distribution", catalog), "utf8");
  const rows = (text.match(/^\| \[/gm) || []).length;
  if (rows !== expected) errors.push(`${catalog} is stale: expected ${expected} entries, found ${rows}`);
}

const bannedActiveTerms = [/apt-core\//, /profiles\//, /agent-repo\.manifest/, /install-agent-standards/, /sync-agent-standards/, /\.agent-repo/];
for (const file of active.filter((item) => item.endsWith(".md") && !relative(item).startsWith("docs/migration"))) {
  const body = readFileSync(file, "utf8").replace(/^---[\s\S]*?---\r?\n?/, "");
  for (const term of bannedActiveTerms) if (term.test(body)) errors.push(`Retired interface appears in active guidance (${term}): ${relative(file)}`);
}

const gamePrinciples = ["README.md", "beginner-game-development.md", "game-loop-design.md", "game-mechanics.md", "scope-control.md", "prototype-first-development.md", "player-experience.md", "level-and-scene-design.md", "game-architecture.md", "game-state-and-save-data.md", "input-and-controls.md", "game-ui-and-hud.md", "audio-and-feedback.md", "game-testing.md", "game-documentation.md", "ai-assisted-game-development.md"];
const gameSkills = ["game-idea-framing", "game-scope-review", "game-loop-designer", "mechanics-designer", "prototype-planner", "level-design-planner", "scene-flow-planner", "player-journey-mapping", "game-ui-hud-review", "input-control-design", "game-state-design", "save-system-design", "game-architecture-review", "game-engine-selection", "web-game-stack-review", "godot-beginner-review", "unity-beginner-review", "phaser-beginner-review", "threejs-beginner-review", "pixel-art-pipeline", "audio-feedback-review", "game-test-plan", "playtest-feedback-review", "game-dev-learning-plan", "ai-assisted-game-prototyping"];
const gameAgents = ["apt-game-development-coach.md", "apt-game-designer.md", "apt-game-architect.md", "apt-game-prototype-planner.md", "apt-gameplay-reviewer.md", "apt-beginner-game-dev-reviewer.md", "apt-game-ui-reviewer.md", "apt-game-testing-reviewer.md", "apt-game-docs-writer.md", "apt-game-scope-guardian.md"];
const gameTemplates = ["game-concept.md", "game-design-document.md", "game-loop.md", "mechanics-map.md", "prototype-plan.md", "scope-cut-list.md", "level-design.md", "scene-flow.md", "player-journey.md", "game-architecture.md", "game-state-model.md", "save-system.md", "input-controls.md", "ui-hud-plan.md", "asset-list.md", "audio-feedback-plan.md", "playtest-plan.md", "playtest-notes.md", "release-checklist.md", "learning-plan.md", "game-micro-group-review.md"];
const gamePrompts = ["create-game-concept.md", "reduce-game-scope.md", "create-game-loop.md", "create-prototype-plan.md", "choose-game-engine.md", "design-level.md", "review-game-architecture.md", "create-playtest-plan.md", "analyze-playtest-feedback.md", "create-game-dev-learning-plan.md", "create-ai-assisted-game-plan.md", "game-micro-group-review.md"];
const gameExamples = ["simple-2d-platformer", "top-down-collector", "card-game", "browser-mini-game", "payment-api-simulation-game", "fitness-habit-game"];
const requiredGameFiles = [
  ...gamePrinciples.map((file) => path.join("principles", "game-development", file)),
  ...gameSkills.map((file) => path.join("skills", "game-development", file, "SKILL.md")),
  ...gameAgents.map((file) => path.join("agents", "game-development", file)),
  ...gameTemplates.map((file) => path.join("templates", "game-development", file)),
  ...gamePrompts.map((file) => path.join("prompts", "game-development", file)),
  ...gameExamples.map((file) => path.join("examples", "game-development", file, "README.md")),
  path.join("docs", "game-development-glossary.md"),
  path.join("docs", "game-development-phase-1-readiness.md"),
  path.join("product-hubs", "product-hub-template", "game-extension.md"),
  path.join("manifests", "game-development.yaml"),
];
for (const file of requiredGameFiles) if (!existsSync(path.join(root, file))) errors.push(`Game development asset missing ${file}`);

const linkSkipPrefixes = [
  "docs/archive/",
];
for (const file of active.filter((item) => item.endsWith(".md") && !linkSkipPrefixes.some((prefix) => relative(item).startsWith(prefix)))) {
  const text = readFileSync(file, "utf8");
  for (const match of text.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)) {
    const link = match[1];
    if (/^(https?:|mailto:|#)/.test(link) || link.includes("*")) continue;
    const target = path.resolve(path.dirname(file), link.split("#")[0]);
    if (!existsSync(target)) errors.push(`Broken link ${link}: ${relative(file)}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\nValidation failed: ${errors.length} issue(s), ${warnings.length} warning(s)`);
  process.exit(1);
}
console.log("APT principles-agents validation: PASS");
console.log(`Active files checked: ${active.length}`);
console.log(`Skills: ${files(path.join(root, "skills")).filter((file) => file.endsWith("SKILL.md")).length}`);
console.log(`Agents: ${files(path.join(root, "agents")).filter((file) => file.endsWith(".md") && !file.endsWith("README.md")).length}`);
console.log(`Source ledger: 505/505 classified`);
console.log(`Warnings: ${warnings.length}`);
