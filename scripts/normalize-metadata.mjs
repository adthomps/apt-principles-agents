#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const apply = process.argv.includes("--apply");
const ledgerPath = path.join(root, "docs", "migration", "source-ledger.json");
const ledger = existsSync(ledgerPath) ? JSON.parse(readFileSync(ledgerPath, "utf8")).files : [];
const sourcesByDestination = new Map();
for (const item of ledger) {
  if (!item.destination || item.destination.startsWith("apt-design-reference")) continue;
  const key = item.destination.replaceAll("\\", "/");
  const values = sourcesByDestination.get(key) || [];
  values.push(item.source);
  sourcesByDestination.set(key, values);
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules") return [];
    const full = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

function inferKind(relative) {
  const [top] = relative.split("/");
  const map = {
    principles: "principle",
    standards: "standard",
    checklists: "checklist",
    governance: "governance",
    references: "reference",
    "context-packs": "context-pack",
    context: "context",
    skills: "skill",
    agents: "agent",
    prompts: "prompt",
    templates: "template",
    examples: "example",
    platforms: "platform-adapter",
    manifests: "manifest-guide",
    installers: "installer-guide",
    routing: "routing",
    docs: "guide",
  };
  return map[top] || "repository";
}

function inferDomain(relative) {
  const parts = relative.split("/");
  const top = parts[0];
  if (["principles", "skills", "agents", "prompts", "templates", "examples", "standards", "checklists"].includes(top)) {
    return parts[1]?.replace(/\.md$/, "") || top;
  }
  if (top === "platforms") return "platforms";
  if (top === "routing" || top === "context" || top === "context-packs") return "ai";
  if (top === "governance" || top === "references" || top === "manifests" || top === "installers") return "governance";
  if (top === "docs") return parts[1] === "migration" ? "governance" : "documentation";
  return "repository";
}

function firstHeading(text, fallback) {
  return text.match(/^#\s+(.+)$/m)?.[1]?.trim() || fallback;
}

function updateMetadata(relative, text) {
  const title = firstHeading(text, path.basename(relative, ".md"));
  const required = {
    title,
    kind: inferKind(relative),
    domain: inferDomain(relative),
    status: "active",
    owner: "APT",
    last_updated: "2026-06-28",
    source_paths: JSON.stringify(sourcesByDestination.get(relative) || [`apt-principles-agents/${relative}`]),
  };
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    const lines = Object.entries(required).map(([key, value]) => `${key}: ${JSON.stringify(value).startsWith('"') && key !== "source_paths" ? JSON.stringify(value) : value}`);
    return `---\n${lines.join("\n")}\n---\n\n${text.trim()}\n`;
  }
  const existing = new Set(
    match[1].split(/\r?\n/).map((line) => line.match(/^([A-Za-z0-9_-]+):/)?.[1]).filter(Boolean)
  );
  const additions = Object.entries(required)
    .filter(([key]) => !existing.has(key))
    .map(([key, value]) => `${key}: ${key === "source_paths" ? value : JSON.stringify(value)}`);
  if (!additions.length) return text;
  return text.replace(match[0], `---\n${match[1].trimEnd()}\n${additions.join("\n")}\n---\n`);
}

const issues = [];
for (const file of walk(root).filter((item) => item.endsWith(".md"))) {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  if (relative.startsWith("docs/archive/")) continue;
  const current = readFileSync(file, "utf8");
  const updated = updateMetadata(relative, current);
  if (updated !== current) {
    issues.push(relative);
    if (apply) writeFileSync(file, updated, "utf8");
  }
}

if (issues.length && !apply) {
  console.error(`Metadata normalization required for ${issues.length} file(s):`);
  console.error(issues.slice(0, 30).join("\n"));
  process.exit(1);
}
console.log(apply ? `Normalized metadata in ${issues.length} file(s).` : "Artifact metadata: PASS");
