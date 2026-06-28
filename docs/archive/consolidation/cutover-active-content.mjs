#!/usr/bin/env node
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const excluded = new Set([".git", "node_modules", "archive", ".apt", ".apt-backups"]);
const extensions = new Set([".md", ".json", ".mjs", ".js", ".cjs", ".yml", ".yaml"]);
const self = "scripts/cutover-active-content.mjs";

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (excluded.has(entry.name)) return [];
    const fullPath = path.join(directory, entry.name);
    const relative = path.relative(root, fullPath).replaceAll("\\", "/");
    if (relative.startsWith("docs/migration/") || relative === "docs/migration-from-old-repos.md") return [];
    if (entry.isDirectory()) return files(fullPath);
    return extensions.has(path.extname(entry.name)) && relative !== self ? [fullPath] : [];
  });
}

function rewriteBody(body) {
  return body
    .replaceAll(".agent-standards.json", ".apt/installation.json")
    .replaceAll(".agent-repo", ".apt/installation.json")
    .replace(/apt-agent-standards/g, "apt-principles-agents")
    .replace(/apt-principles(?!-agents)/g, "apt-principles-agents")
    .replaceAll("APT_PRINCIPLES_ROOT", "APT_PRINCIPLES_AGENTS_ROOT")
    .replaceAll("APT_PRINCIPLES_DIR", "APT_PRINCIPLES_AGENTS_DIR")
    .replace(/node\s+(?:\.\.\/)?apt-principles-agents\/scripts\/install-agent-standards\.mjs/g, "node ../apt-principles-agents/scripts/apt-assets.mjs install")
    .replace(/node\s+(?:\.\.\/)?apt-principles-agents\/scripts\/sync-agent-standards\.mjs/g, "node ../apt-principles-agents/scripts/apt-assets.mjs sync")
    .replace(/scripts\/install-agent-standards\.mjs/g, "scripts/apt-assets.mjs install")
    .replace(/scripts\/sync-agent-standards\.mjs/g, "scripts/apt-assets.mjs sync")
    .replace(/scripts\/audit-workspace-agent-standards\.mjs/g, "scripts/apt-assets.mjs audit-workspace");
}

let changed = 0;
for (const file of files(root)) {
  const original = readFileSync(file, "utf8");
  let prefix = "";
  let body = original;
  if (path.extname(file) === ".md") {
    const frontmatter = original.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
    if (frontmatter) {
      prefix = frontmatter[0];
      body = original.slice(prefix.length);
    }
  }
  const updated = `${prefix}${rewriteBody(body)}`;
  if (updated !== original) {
    writeFileSync(file, updated, "utf8");
    changed += 1;
  }
}

console.log(`Cut over active content in ${changed} file(s); provenance frontmatter was preserved.`);
