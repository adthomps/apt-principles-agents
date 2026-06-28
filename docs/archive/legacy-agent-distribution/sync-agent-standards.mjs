#!/usr/bin/env node
import { copyFile, mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { toSourcePath } from "./path-mapping.mjs";

function parseArgs(argv = process.argv.slice(2)) {
  const args = { target: undefined, dryRun: false, force: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--target") args.target = argv[++index];
    else if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--force") args.force = true;
    else if (arg === "--help" || arg === "-h") args.help = true;
  }
  return args;
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function sync(args) {
  if (!args.target) throw new Error("--target <path> is required");
  const target = path.resolve(args.target);
  const manifestPath = path.join(target, ".agent-standards.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const sourceRoot = path.resolve(manifest.source);
  const updated = [];
  const skipped = [];

  for (const file of manifest.managedFiles || []) {
    if (file === manifest.localContext || file === "docs/project-context.md") {
      skipped.push({ file, reason: "local context is preserved" });
      continue;
    }
    const sourceFile = manifest.managedFileSources?.[file] || toSourcePath(file);
    const source = path.join(sourceRoot, sourceFile);
    const destination = path.join(target, file);
    if (!(await exists(source))) {
      skipped.push({ file, source: sourceFile, reason: "missing source" });
      continue;
    }
    if (!(await exists(destination)) && !args.force) {
      skipped.push({ file, reason: "missing target; use --force to recreate" });
      continue;
    }
    updated.push(file);
    if (!args.dryRun) {
      await mkdir(path.dirname(destination), { recursive: true });
      await copyFile(source, destination);
    }
  }

  console.log(JSON.stringify({
    target,
    dryRun: args.dryRun,
    force: args.force,
    updated,
    skipped
  }, null, 2));
}

function printHelp() {
  console.log("Usage: node scripts/sync-agent-standards.mjs --target <path> [--dry-run] [--force]");
}

const args = parseArgs();
if (args.help) {
  printHelp();
  process.exit(0);
}

sync(args).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
