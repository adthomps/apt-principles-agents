#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rootDocs = {
  "apt-principles-agents.md": "principles/framework.md",
  "thinking.md": "principles/thinking/README.md",
  "design.md": "principles/design/README.md",
  "architecture.md": "principles/architecture/README.md",
  "system-standards.md": "principles/system-standards/README.md",
  "security.md": "principles/security-risk/README.md",
  "execution.md": "principles/execution/delivery-increments.md",
  "quality-testing.md": "principles/execution/quality-and-testing.md",
  "release-change-management.md": "principles/execution/release-and-change-management.md",
  "operations-support.md": "principles/execution/operations-and-support.md",
  "knowledge-system.md": "principles/execution/knowledge-and-learning.md",
  "ai-agent-framework.md": "principles/ai/README.md",
};
const rootFolders = ["checklists", "standards", "examples", "templates", "references", "governance", "context-packs", "prompts"];

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules") return [];
    const child = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(child) : [child];
  });
}

function relativeLink(fromFile, target) {
  const value = path.relative(path.dirname(fromFile), path.join(root, target)).replaceAll("\\", "/");
  return value.startsWith(".") ? value : `./${value}`;
}

function mapTarget(link, file) {
  const fragment = link.includes("#") ? `#${link.split("#").slice(1).join("#")}` : "";
  const clean = link.split("#")[0].replaceAll("\\", "/");
  const base = path.posix.basename(clean);
  if (rootDocs[base]) return `${relativeLink(file, rootDocs[base])}${fragment}`;
  if (clean.endsWith("scripts/validate-apt-principles-agents.mjs")) return `${relativeLink(file, "scripts/validate-repository.mjs")}${fragment}`;
  for (const folder of rootFolders) {
    const marker = `${folder}/`;
    const index = clean.indexOf(marker);
    if (index >= 0) {
      const target = clean.slice(index);
      if (existsSync(path.join(root, target))) return `${relativeLink(file, target)}${fragment}`;
    }
  }
  return link;
}

let changed = 0;
for (const file of walk(root).filter((item) => item.endsWith(".md"))) {
  const relative = path.relative(root, file).replaceAll("\\", "/");
  if (relative.startsWith("docs/archive/")) continue;
  const text = readFileSync(file, "utf8");
  const updated = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (whole, label, link) => {
    if (/^(https?:|mailto:|#)/.test(link)) return whole;
    return `[${label}](${mapTarget(link, file)})`;
  });
  if (updated !== text) {
    writeFileSync(file, updated, "utf8");
    changed += 1;
  }
}
console.log(`Rewrote links in ${changed} migrated file(s).`);
