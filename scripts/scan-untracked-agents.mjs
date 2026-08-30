#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const sourceRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CANONICAL_REPOSITORY = path.basename(sourceRoot);
const PLATFORM_AGENT_DIRS = [".claude/agents", ".codex/agents", ".cursor/agents"];

function parseArgs(argv) {
  const args = { workspaceRoot: null, json: false, help: false, repo: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--workspace-root") {
      args.workspaceRoot = argv[index + 1];
      index += 1;
    } else if (arg === "--repo") {
      args.repo = argv[index + 1];
      index += 1;
    } else if (arg === "--json") {
      args.json = true;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return args;
}

function printHelp() {
  process.stdout.write(
    [
      "Usage: node scripts/scan-untracked-agents.mjs [options]",
      "",
      "Finds .claude/agents, .codex/agents, and .cursor/agents files in every workspace",
      "repository that are NOT listed in that repository's .apt/installation.json",
      "managedFiles. These are agents the canonical sync system cannot see: hand-authored",
      "locally, copied in from elsewhere, or left behind by a removed manifest entry.",
      "audit-workspace reports drift in files it manages; this reports files it never",
      "knew existed. This is a read-only report. Nothing is modified.",
      "",
      "Options:",
      "  --workspace-root <path>   Workspace root to scan (default: parent of this repo)",
      "  --repo <name>             Scan only this one repository (fast path, for hooks)",
      "  --json                    Emit machine-readable JSON instead of a text report",
      "  --help, -h                Show this help",
    ].join("\n") + "\n",
  );
}

function listFilesRecursive(root) {
  const results = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        results.push(full);
      }
    }
  };
  if (existsSync(root) && statSync(root).isDirectory()) walk(root);
  return results;
}

function readTrackedTargets(repoRoot) {
  const file = path.join(repoRoot, ".apt", "installation.json");
  if (!existsSync(file)) return { exists: false, targets: new Set(), error: null };
  try {
    const record = JSON.parse(readFileSync(file, "utf8"));
    const targets = new Set(
      (record.managedFiles || []).map((entry) => String(entry.target).split(path.sep).join("/")),
    );
    return { exists: true, targets, error: null };
  } catch (error) {
    return { exists: true, targets: new Set(), error: error.message };
  }
}

function discoverCandidateRepos(workspaceRoot) {
  return readdirSync(workspaceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => name !== CANONICAL_REPOSITORY && !name.startsWith("."))
    .filter((name) => PLATFORM_AGENT_DIRS.some((rel) => existsSync(path.join(workspaceRoot, name, rel))))
    .sort((a, b) => a.localeCompare(b));
}

// A repo may declare intentionally-local, non-canonical agent files in
// .apt/local-agents.md as "- <repo-relative path>" bullets. Those are expected
// local content, not drift.
function readDeclaredLocal(repoRoot) {
  const file = path.join(repoRoot, ".apt", "local-agents.md");
  if (!existsSync(file)) return { exists: false, paths: new Set() };
  const paths = new Set();
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*-\s+`?([^`\s]+)`?/);
    if (m) paths.add(m[1].split(path.sep).join("/"));
  }
  return { exists: true, paths };
}

function scanRepo(workspaceRoot, repoName) {
  const repoRoot = path.join(workspaceRoot, repoName);
  const { exists: installed, targets: trackedTargets, error: installationError } = readTrackedTargets(repoRoot);
  const declared = readDeclaredLocal(repoRoot);

  const files = [];
  for (const relDir of PLATFORM_AGENT_DIRS) {
    for (const absolute of listFilesRecursive(path.join(repoRoot, relDir))) {
      files.push(path.relative(repoRoot, absolute).split(path.sep).join("/"));
    }
  }

  const untracked = files
    .filter((relative) => !trackedTargets.has(relative) && !declared.paths.has(relative))
    .sort((a, b) => a.localeCompare(b));

  return {
    repository: repoName,
    installed,
    declaredLocalOnly: !installed && declared.exists,
    declaredLocalCount: declared.paths.size,
    installationError,
    totalAgentFiles: files.length,
    untrackedFiles: untracked,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  const workspaceRoot = path.resolve(process.cwd(), args.workspaceRoot || path.join(sourceRoot, ".."));
  const repos = args.repo ? [args.repo] : discoverCandidateRepos(workspaceRoot);
  const results = repos.map((name) => scanRepo(workspaceRoot, name));

  const totalUntracked = results.reduce((sum, r) => sum + r.untrackedFiles.length, 0);
  const reposWithUntracked = results.filter((r) => r.untrackedFiles.length > 0);
  const notInstalled = results.filter((r) => !r.installed && !r.declaredLocalOnly);
  const declaredLocal = results.filter((r) => r.declaredLocalOnly);

  if (args.json) {
    process.stdout.write(
      JSON.stringify(
        { workspaceRoot, scannedRepositories: repos.length, totalUntrackedFiles: totalUntracked, results },
        null,
        2,
      ) + "\n",
    );
    return;
  }

  process.stdout.write(`Untracked agent scan - ${workspaceRoot}\n`);
  process.stdout.write(
    `Scanned ${repos.length} repositor${repos.length === 1 ? "y" : "ies"} with a .claude/.codex/.cursor agents directory.\n\n`,
  );

  if (repos.length === 0) {
    process.stdout.write("No repositories with a platform agents directory were found.\n");
    return;
  }

  for (const result of results) {
    if (result.untrackedFiles.length === 0 && (result.installed || result.declaredLocalOnly)) continue;
    const flag = result.installed
      ? ""
      : result.declaredLocalOnly
        ? `  [DECLARED LOCAL-ONLY - ${result.declaredLocalCount} agent(s) in .apt/local-agents.md]`
        : "  [NOT INSTALLED - no .apt/installation.json]";
    process.stdout.write(`## ${result.repository}${flag}\n`);
    if (result.installationError) {
      process.stdout.write(`  installation.json could not be parsed: ${result.installationError}\n`);
    }
    for (const file of result.untrackedFiles) {
      process.stdout.write(`  - ${file}\n`);
    }
    process.stdout.write("\n");
  }

  process.stdout.write("---\n");
  process.stdout.write(
    `${totalUntracked} untracked agent file(s) across ${reposWithUntracked.length} repositor${reposWithUntracked.length === 1 ? "y" : "ies"}.\n`,
  );
  if (notInstalled.length > 0) {
    process.stdout.write(
      `${notInstalled.length} repositor${notInstalled.length === 1 ? "y has" : "ies have"} a platform agents directory but no .apt/installation.json at all: ${notInstalled.map((r) => r.repository).join(", ")}\n`,
    );
  }
  if (declaredLocal.length > 0) {
    process.stdout.write(
      `${declaredLocal.length} repositor${declaredLocal.length === 1 ? "y is" : "ies are"} declared local-only via .apt/local-agents.md: ${declaredLocal.map((r) => r.repository).join(", ")}\n`,
    );
  }
}

main();
