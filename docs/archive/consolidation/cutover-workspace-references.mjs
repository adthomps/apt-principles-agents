#!/usr/bin/env node
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspace = path.resolve(root, "..");
const apply = process.argv.includes("--apply");
const repositories = [
  "applied-practical-thinking",
  "apt-anet-integration-toolbox",
  "apt-coach",
  "apt-health",
  "apt-commerce",
  "apt-design-reference",
  "apt-dream-to-reality",
  "apt-novel-reviewer",
  "crt-world",
];
const allowed = new Set([".md", ".json", ".js", ".cjs", ".mjs", ".ts", ".tsx", ".toml", ".yml", ".yaml", ".css", ".html"]);
const excluded = new Set([".git", "node_modules", "dist", "build", "public", ".apt", ".apt-backups", ".wrangler", ".codex", ".claude", ".gemini"]);
const rootDocMap = {
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

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (excluded.has(entry.name)) return [];
    const child = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      const normalized = child.replaceAll("\\", "/");
      if (normalized.includes("/docs/apt/reports") || normalized.includes("/.github/skills") || normalized.includes("/.github/prompts")) return [];
      return walk(child);
    }
    return allowed.has(path.extname(entry.name).toLowerCase()) ? [child] : [];
  });
}

function rewrite(text) {
  let output = text;
  for (const [oldName, newPath] of Object.entries(rootDocMap)) {
    const escaped = oldName.replaceAll(".", "\\.");
    output = output.replace(new RegExp(`(\\.\\.\\/|_)?apt-principles-agents\\/${escaped}`, "g"), (match, prefix = "") => `${prefix}apt-principles-agents/${newPath}`);
    output = output.replace(new RegExp(`apt-principles-agents\\\\${escaped}`, "g"), `apt-principles-agents\\${newPath.replaceAll("/", "\\")}`);
  }
  output = output
    .replaceAll("APT_PRINCIPLES_AGENTS_ROOT", "APT_PRINCIPLES_AGENTS_ROOT")
    .replaceAll("APT_PRINCIPLES_AGENTS_DIR", "APT_PRINCIPLES_AGENTS_DIR")
    .replace(/_apt-principles-agents(?!-agents)/g, "_apt-principles-agents")
    .replace(/apt-principles-agents(?!-agents)/g, "apt-principles-agents")
    .replace(/apt-principles-agents/g, "apt-principles-agents")
    .replaceAll(".apt/installation.json", ".apt/installation.json");
  return output;
}

const changes = [];
for (const repository of repositories) {
  const repoRoot = path.join(workspace, repository);
  for (const file of walk(repoRoot)) {
    const current = readFileSync(file, "utf8");
    const updated = rewrite(current);
    if (updated === current) continue;
    changes.push(path.relative(workspace, file).replaceAll("\\", "/"));
    if (apply) writeFileSync(file, updated, "utf8");
  }
}
console.log(`${apply ? "Updated" : "Would update"} ${changes.length} active workspace file(s).`);
for (const item of changes) console.log(item);
