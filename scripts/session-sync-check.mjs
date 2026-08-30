#!/usr/bin/env node
// Cheap, fast SessionStart-hook check: is this repo behind apt-principles-agents,
// or does it have .claude/.codex/.cursor agent files the canonical system doesn't know
// about? Prints a short notice only when there's something worth looking at; silent
// otherwise. Deliberately avoids hashing every managed file (that's what
// `npm run audit:workspace` / `apt-assets.mjs scan --target .` are for on demand) so it
// stays fast enough to run on every session start.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.resolve(scriptDir, "..");

function parseArgs(argv) {
  const args = { repoRoot: "." };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--repo-root") {
      args.repoRoot = argv[index + 1];
      index += 1;
    }
  }
  return args;
}

function gitHead(directory) {
  try {
    return execFileSync("git", ["-C", directory, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const repoRoot = path.resolve(process.cwd(), args.repoRoot);

  if (!existsSync(sourceRoot) || path.basename(sourceRoot) !== "apt-principles-agents") return;

  const installationFile = path.join(repoRoot, ".apt", "installation.json");
  const notes = [];

  if (!existsSync(installationFile)) {
    notes.push("This repo has no .apt/installation.json — it isn't registered with apt-principles-agents. Run `node ../apt-principles-agents/scripts/apt-assets.mjs install --target . --manifests core` if it should be.");
  } else {
    try {
      const record = JSON.parse(readFileSync(installationFile, "utf8"));
      const currentHead = gitHead(sourceRoot);
      if (currentHead && record.source?.commit && record.source.commit !== currentHead) {
        notes.push(`This repo's canonical content is behind apt-principles-agents (installed at ${record.source.commit.slice(0, 8)}, canonical is now at ${currentHead.slice(0, 8)}). Run \`node ../apt-principles-agents/scripts/apt-assets.mjs sync --target . --apply\` to check for updates (it will not overwrite local changes without --force).`);
      }
    } catch (error) {
      notes.push(`This repo's .apt/installation.json could not be read: ${error.message}`);
    }
  }

  try {
    const scannerPath = path.join(sourceRoot, "scripts", "scan-untracked-agents.mjs");
    if (existsSync(scannerPath)) {
      const repoName = path.basename(repoRoot);
      const workspaceRoot = path.dirname(repoRoot);
      const output = execFileSync(
        "node",
        [scannerPath, "--workspace-root", workspaceRoot, "--repo", repoName, "--json"],
        { encoding: "utf8" },
      );
      const data = JSON.parse(output);
      const untracked = data.results?.[0]?.untrackedFiles?.length || 0;
      if (untracked > 0) {
        notes.push(`${untracked} agent file(s) in .claude/agents (or .codex/.cursor) aren't tracked by apt-principles-agents. Run \`node ../apt-principles-agents/scripts/scan-untracked-agents.mjs --workspace-root .. --repo ${repoName}\` to see which.`);
      }
    }
  } catch {
    // Non-fatal — never block a session over a diagnostic failing.
  }

  if (notes.length > 0) {
    process.stdout.write(`[apt-principles-agents sync check]\n${notes.map((note) => `- ${note}`).join("\n")}\n`);
  }
}

main();
