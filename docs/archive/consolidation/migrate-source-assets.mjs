#!/usr/bin/env node
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspace = path.resolve(root, "..");
const sources = {
  principles: path.join(workspace, "apt-principles-agents"),
  agents: path.join(workspace, "apt-principles-agents"),
};
const records = new Map();

function posix(value) {
  return value.replaceAll("\\", "/");
}

function ensureParent(file) {
  mkdirSync(path.dirname(file), { recursive: true });
}

function sourceKey(repo, relative) {
  return `${repo}/${posix(relative)}`;
}

function record(repo, relative, classification, destination, rationale) {
  records.set(sourceKey(repo, relative), {
    source: sourceKey(repo, relative),
    classification,
    destination: destination ? posix(destination) : null,
    rationale,
  });
}

function copy(repo, sourceRelative, destinationRelative, classification = "migrated", rationale = "Preserved as active source-backed guidance.") {
  const source = path.join(workspace, repo, sourceRelative);
  const destination = path.join(root, destinationRelative);
  ensureParent(destination);
  copyFileSync(source, destination);
  record(repo, sourceRelative, classification, destinationRelative, rationale);
}

function walk(base, relative = "") {
  const current = path.join(base, relative);
  return readdirSync(current, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === "graphify-out") return [];
    const child = path.join(relative, entry.name);
    return entry.isDirectory() ? walk(base, child) : [child];
  });
}

function copyTree(repo, sourceRelative, destinationRelative, options = {}) {
  const sourceRoot = path.join(workspace, repo, sourceRelative);
  if (!existsSync(sourceRoot)) return;
  for (const relative of walk(sourceRoot)) {
    if (options.exclude?.some((pattern) => posix(relative).startsWith(pattern))) continue;
    const destination = path.join(destinationRelative, relative);
    const destinationPath = path.join(root, destination);
    if (existsSync(destinationPath) && !options.overwrite) {
      const collision = path.join("docs", "archive", "migration-collisions", repo, sourceRelative, relative);
      copy(repo, path.join(sourceRelative, relative), collision, "merged", `An active target already existed; the source version is preserved at ${posix(collision)} for reconciliation.`);
      continue;
    }
    copy(repo, path.join(sourceRelative, relative), destination, "migrated", options.rationale);
  }
}

function parseFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) return { body: text, data: {} };
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (item) data[item[1]] = item[2];
  }
  return { body: text.slice(match[0].length), data };
}

function canonicalHub(sourceRelative, destinationRelative, domain, related = []) {
  const sourcePath = path.join(sources.principles, sourceRelative);
  const raw = readFileSync(sourcePath, "utf8");
  const { body, data } = parseFrontmatter(raw);
  const title = data.title || body.match(/^#\s+(.+)$/m)?.[1] || domain;
  const topicLinks = related.length
    ? `\n## Topic Guides\n\n${related.map((item) => `- [${item.label}](${item.path})`).join("\n")}\n`
    : "";
  const content = `---
title: ${title}
kind: principle-hub
domain: ${domain}
status: active
owner: APT
version: ${data.version || "v1"}
last_updated: 2026-06-28
source_paths: ["apt-principles-agents/${posix(sourceRelative)}"]
supersedes: ["apt-principles-agents/${posix(sourceRelative)}"]
---

${body.trim()}
${topicLinks}`;
  const destination = path.join(root, destinationRelative);
  ensureParent(destination);
  writeFileSync(destination, `${content.trim()}\n`, "utf8");
  record("apt-principles-agents", sourceRelative, "migrated", destinationRelative, "Promoted into the canonical APT principles hub.");
}

// Canonical doctrine hubs.
canonicalHub("apt-principles-agents.md", "principles/framework.md", "framework");
canonicalHub("thinking.md", "principles/thinking/README.md", "thinking", [
  { label: "Practical thinking", path: "practical-thinking.md" },
  { label: "Decision framing", path: "decision-framing.md" },
  { label: "Tradeoff analysis", path: "tradeoff-analysis.md" },
  { label: "Assumption checking", path: "assumption-checking.md" },
  { label: "Beginner clarity", path: "beginner-clarity.md" },
]);
canonicalHub("design.md", "principles/design/README.md", "design");
canonicalHub("architecture.md", "principles/architecture/README.md", "architecture");
canonicalHub("system-standards.md", "principles/system-standards/README.md", "system-standards");
canonicalHub("security.md", "principles/security-risk/README.md", "security-risk");
canonicalHub("execution.md", "principles/execution/delivery-increments.md", "execution");
canonicalHub("quality-testing.md", "principles/execution/quality-and-testing.md", "execution");
canonicalHub("release-change-management.md", "principles/execution/release-and-change-management.md", "execution");
canonicalHub("operations-support.md", "principles/execution/operations-and-support.md", "execution");
canonicalHub("knowledge-system.md", "principles/execution/knowledge-and-learning.md", "execution");
canonicalHub("ai-agent-framework.md", "principles/ai/README.md", "ai");

// First-class doctrine/build-kit layers.
for (const directory of ["checklists", "governance", "references", "context-packs", "standards"]) {
  copyTree("apt-principles-agents", directory, directory, { overwrite: true, rationale: "Moved from the canonical doctrine/build-kit source." });
}
copyTree("apt-principles-agents", path.join("docs", "diagrams"), path.join("docs", "diagrams"), { overwrite: true });
copyTree("apt-principles-agents", "principles", path.join("principles", "quick-reference"), { overwrite: true });

for (const directory of ["api", "architecture", "security", "thinking", "quality", "knowledge", "projects", "workflows", "showcases", "ai-agent"]) {
  copyTree("apt-principles-agents", path.join("examples", directory), path.join("examples", directory), { overwrite: false });
}
copyTree("apt-principles-agents", path.join("examples", "ui"), path.join("examples", "ui"), {
  overwrite: false,
  exclude: ["design-reference-kit/"],
});

for (const relative of walk(path.join(sources.principles, "prompts"))) {
  if (relative === "README.md") continue;
  const destination = existsSync(path.join(root, "prompts", relative))
    ? path.join("prompts", "source-backed", relative)
    : path.join("prompts", relative);
  copy("apt-principles-agents", path.join("prompts", relative), destination);
}
for (const relative of walk(path.join(sources.principles, "templates"))) {
  if (relative === "README.md") continue;
  const destination = existsSync(path.join(root, "templates", relative))
    ? path.join("templates", "source-backed", relative)
    : path.join("templates", relative);
  copy("apt-principles-agents", path.join("templates", relative), destination);
}
copyTree("apt-principles-agents", ".github", path.join("platforms", "github-copilot", "source"), { overwrite: true });

// Agent distribution and harness material.
copyTree("apt-principles-agents", "agents", path.join("agents", "harness"), { overwrite: true });
copyTree("apt-principles-agents", "apt-core", path.join("standards", "installable-summaries"), { overwrite: true });
copyTree("apt-principles-agents", "routing", "routing", { overwrite: true });
copyTree("apt-principles-agents", "context", "context", { overwrite: true });
copyTree("apt-principles-agents", "docs", path.join("docs", "distribution"), { overwrite: true });
copyTree("apt-principles-agents", "claude", path.join("platforms", "claude", "source"), { overwrite: true });
copyTree("apt-principles-agents", "codex", path.join("platforms", "codex", "source"), { overwrite: true });
copyTree("apt-principles-agents", "github-copilot", path.join("platforms", "github-copilot", "distribution"), { overwrite: true });
copyTree("apt-principles-agents", "showcases", path.join("examples", "distribution-showcases"), { overwrite: true });
copyTree("apt-principles-agents", "checklists", path.join("checklists", "distribution"), { overwrite: true });
copyTree("apt-principles-agents", "prompts", path.join("prompts", "distribution"), { overwrite: true });
copyTree("apt-principles-agents", "templates", path.join("templates", "distribution"), { overwrite: true });
copyTree("apt-principles-agents", "standards", path.join("platforms", "shared-source"), { overwrite: true });
copyTree("apt-principles-agents", "skills", path.join("skills", "source-backed"), { overwrite: true });
copy("apt-principles-agents", "CHANGELOG.md", path.join("docs", "archive", "apt-principles-agents-CHANGELOG.md"), "historical", "Preserved as distribution-system release history.");
copy("apt-principles-agents", "context-packs/README.md", "context-packs/agent-distribution.md");

// Generate exhaustive classification for anything not explicitly copied.
for (const [repo, base] of [["apt-principles-agents", sources.principles], ["apt-principles-agents", sources.agents]]) {
  for (const relative of walk(base)) {
    const key = sourceKey(repo, relative);
    if (records.has(key)) continue;
    const p = posix(relative);
    if (p.startsWith("examples/ui/design-reference-kit/")) {
      record(repo, relative, "external", "apt-design-reference", "The design reference repository already contains the reusable asset; unique README files are handled in its cutover.");
    } else if (p.startsWith("reports/")) {
      record(repo, relative, "historical_generated", null, "Historical audit or generated evidence remains in the archived source repository and provenance inventory.");
    } else if (p.startsWith("scripts/")) {
      record(repo, relative, "merged", "scripts/apt-assets.mjs", "Useful validation/distribution behavior is consolidated into the new lifecycle tooling.");
    } else if (p.startsWith("profiles/")) {
      const manifestName = path.basename(relative, ".json");
      record(repo, relative, "merged", `manifests/${manifestName === "apt-core" ? "core" : manifestName}.yaml`, "Profile capability is represented by a new manifest.");
    } else if (["README.md", "AGENTS.md", "package.json", "CONTRIBUTING.md", ".gitignore", ".gitattributes", ".graphifyignore", "agent-repo.manifest.json"].includes(p)) {
      record(repo, relative, "merged", p === "CONTRIBUTING.md" ? "CONTRIBUTING.md" : "docs/migration-from-old-repos.md", "Repository-level behavior is consolidated into the new canonical repository.");
    } else {
      record(repo, relative, "retired", null, "No active canonical or operational dependency remains; source history and hashes preserve the artifact.");
    }
  }
}

const ledger = [...records.values()].sort((a, b) => a.source.localeCompare(b.source));
const counts = ledger.reduce((result, item) => {
  result[item.classification] = (result[item.classification] || 0) + 1;
  return result;
}, {});
const digest = createHash("sha256").update(JSON.stringify(ledger)).digest("hex");
const ledgerPath = path.join(root, "docs", "migration", "source-ledger.json");
ensureParent(ledgerPath);
writeFileSync(ledgerPath, `${JSON.stringify({
  schemaVersion: 1,
  generatedAt: "2026-06-28",
  sourceFileCount: ledger.length,
  counts,
  sha256: digest,
  files: ledger,
}, null, 2)}\n`, "utf8");

const summary = `---
title: Source Migration Ledger
kind: migration-ledger
domain: governance
status: active
owner: APT
last_updated: 2026-06-28
source_paths: ["apt-principles-agents", "apt-principles-agents"]
---

# Source Migration Ledger

Every source file is classified in [source-ledger.json](source-ledger.json).

| Classification | Count |
| --- | ---: |
${Object.entries(counts).sort().map(([key, value]) => `| ${key} | ${value} |`).join("\n")}

Total source files: **${ledger.length}**  
Ledger SHA-256: \`${digest}\`
`;
writeFileSync(path.join(root, "docs", "migration", "README.md"), summary, "utf8");
console.log(`Migrated source assets and classified ${ledger.length} files.`);
