#!/usr/bin/env node
// Cheap, fast SessionStart-hook check: is this repo behind apt-principles-agents,
// or does it have .claude/.codex/.cursor agent files the canonical system doesn't know
// about? Prints a short notice only when there's something worth looking at; silent
// otherwise. The behind check is `apt-assets.mjs scan` through sync-status-lib.mjs, the same
// one the pre-push gate uses; it takes well under a second per repo.

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { sourceRoot, syncCommand, syncStatus } from "./sync-status-lib.mjs";

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
      // Hash-based, shared with the pre-push gate: a repo counts as behind only when a sync
      // would change a managed file, not merely because apt-principles-agents has a newer commit.
      // Design is reported first (DR-015) because it changes what the product renders.
      const status = syncStatus(repoRoot);
      if (status.designVersionBehind || status.design.length) {
        const version = status.designVersionBehind ? ` (${status.designFrom} -> ${status.designTo})` : "";
        const files = status.design.length ? `${status.design.length} design file(s) to update` : "the recorded design version is older";
        notes.push(`APT design is behind${version}: ${files}, and pushes are blocked until it is synced. See apt-principles-agents/design/CHANGELOG.md, then run \`${syncCommand}\` and \`node .apt/design/bin/apt-design-check.mjs\`.`);
      }
      if (status.guidance.length) {
        notes.push(`${status.guidance.length} APT guidance file(s) (docs, skills, agents) are behind. Run \`${syncCommand}\` (it will not overwrite local changes without --force).`);
      }
      if (status.drifted.length) {
        notes.push(`${status.drifted.length} APT-managed file(s) were edited locally, so sync leaves them alone. Run \`node ../apt-principles-agents/scripts/apt-assets.mjs scan --target .\` to see which.`);
      }
    } catch (error) {
      notes.push(`Could not check this repo's APT sync status: ${String(error.message).split("\n")[0]}`);
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
