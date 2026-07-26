#!/usr/bin/env node
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(root, "docs", "distribution");

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === ".tmp" || entry.name === ".wrangler") return [];
    const child = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(child) : [child];
  });
}

function rel(file) {
  return path.relative(root, file).replaceAll("\\", "/");
}

function metadata(file) {
  const text = readFileSync(file, "utf8");
  const title = text.match(/^#\s+(.+)$/m)?.[1] || path.basename(file);
  const description = text.match(/^description:\s*["']?(.+?)["']?\s*$/m)?.[1]
    || text.match(/## Purpose\s+([\s\S]*?)(?:\n##|\n#|$)/)?.[1]?.trim().replace(/\s+/g, " ")
    || text.match(/\n\n([^#\n][^\n]+)/)?.[1]
    || "Active APT artifact.";
  return { title, description: description.slice(0, 180).replaceAll("|", "\\|") };
}

function writeCatalog(filename, title, kind, files) {
  const rows = files.sort((a, b) => rel(a).localeCompare(rel(b))).map((file) => {
    const item = metadata(file);
    const link = path.relative(outputRoot, file).replaceAll("\\", "/");
    return `| [${item.title}](${link}) | \`${rel(file)}\` | ${item.description} |`;
  });
  const content = `---
title: "${title}"
kind: "catalog"
domain: "documentation"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-principles-agents/${kind}/"]
---

# ${title}

Generated from active repository artifacts by \`scripts/generate-catalogs.mjs\`. Do not hand-edit catalog rows.

| Artifact | Path | Purpose |
| --- | --- | --- |
${rows.join("\n")}
`;
  writeFileSync(path.join(outputRoot, filename), content, "utf8");
}

writeCatalog("AGENT-CATALOG.md", "Agent Catalog", "agents", walk(path.join(root, "agents")).filter((file) => file.endsWith(".md") && !file.endsWith("README.md")));
writeCatalog("SKILL-CATALOG.md", "Skill Catalog", "skills", walk(path.join(root, "skills")).filter((file) => file.endsWith("SKILL.md")));
writeCatalog("PROMPT-CATALOG.md", "Prompt Catalog", "prompts", walk(path.join(root, "prompts")).filter((file) => file.endsWith(".md") && !file.endsWith("README.md")));
writeCatalog("TEMPLATE-CATALOG.md", "Template Catalog", "templates", walk(path.join(root, "templates")).filter((file) => [".md", ".json"].includes(path.extname(file)) && !file.endsWith("README.md")));
writeCatalog("OKF-CATALOG.md", "OKF Catalog", "knowledge/okf", walk(path.join(root, "knowledge", "okf")).filter((file) => file.endsWith(".md") && !file.endsWith("index.md") && !file.endsWith("log.md")));
writeCatalog("MANIFEST-CATALOG.md", "Manifest Catalog", "manifests", walk(path.join(root, "manifests")).filter((file) => file.endsWith(".yaml")));
console.log("Generated agent, skill, prompt, template, OKF, and manifest catalogs.");
