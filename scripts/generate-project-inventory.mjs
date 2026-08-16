#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CONTEXT_RELATIVE_PATH,
  discoverWorkspaceProjects,
  loadProfile,
  renderProjectContext,
  renderWorkspaceInventory,
  validateProjectProfile,
  writeOrCheck,
} from "./project-inventory-lib.mjs";

function parseArgs(argv) {
  const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const args = { repoRoot: scriptRoot, workspaceRoot: path.resolve(scriptRoot, ".."), mode: "repo", check: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--repo-root") args.repoRoot = path.resolve(argv[++index]);
    else if (arg === "--workspace-root") args.workspaceRoot = path.resolve(argv[++index]);
    else if (arg === "--mode") args.mode = argv[++index];
    else if (arg === "--check") args.check = true;
    else if (arg === "--help" || arg === "-h") args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!["repo", "workspace", "all"].includes(args.mode)) throw new Error(`Invalid mode: ${args.mode}`);
  return args;
}

function help() {
  process.stdout.write([
    "Usage: node scripts/generate-project-inventory.mjs [options]",
    "",
    "--mode repo|workspace|all  Output scope (default: repo)",
    "--repo-root <path>         Repository containing the source profile",
    "--workspace-root <path>    Parent folder containing child projects",
    "--check                    Fail when generated content is stale",
  ].join("\n") + "\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return help();
  const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const schema = JSON.parse(fs.readFileSync(path.join(scriptRoot, "references", "project-profile.schema.json"), "utf8"));

  if (args.mode === "repo" || args.mode === "all") {
    const { profilePath, profile, error } = loadProfile(args.repoRoot);
    if (!profile) throw new Error(error ? `Invalid profile JSON ${profilePath}: ${error}` : `Project profile not found: ${profilePath}`);
    const errors = validateProjectProfile(schema, profile);
    if (errors.length) throw new Error(errors.join("\n"));
    if (profile.inventory_version !== 2) throw new Error(`Repo rendering requires an inventory_version 2 profile: ${profilePath}`);
    const contextPath = path.join(args.repoRoot, CONTEXT_RELATIVE_PATH);
    const action = writeOrCheck(contextPath, renderProjectContext(profile), args.check);
    process.stdout.write(`${action === "checked" ? "Current" : "Wrote"}: ${contextPath}\n`);
  }

  if (args.mode === "workspace" || args.mode === "all") {
    const projectNames = discoverWorkspaceProjects(args.workspaceRoot);
    if (!projectNames.length) throw new Error(`No projects discovered under ${args.workspaceRoot}`);
    const outputPath = path.join(args.workspaceRoot, "WORKSPACE_PROJECT_INVENTORY.md");
    const content = renderWorkspaceInventory({ workspaceRoot: args.workspaceRoot, schema, projectNames });
    const action = writeOrCheck(outputPath, content, args.check);
    process.stdout.write(`${action === "checked" ? "Current" : "Wrote"}: ${outputPath}\n`);
  }
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
