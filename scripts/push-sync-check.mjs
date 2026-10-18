#!/usr/bin/env node
// Compatibility entry point for pre-push hooks installed before apt-check (DR-017). Those hooks
// call this script directly; it now runs the apt-check sync module. Repos pick up the new hook,
// which runs the full push mode through .apt/bin/apt-check.mjs, on their next sync.
//
// Usage: node push-sync-check.mjs --repo-root <repo>

import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const index = process.argv.indexOf("--repo-root");
const repoRoot = path.resolve(index >= 0 ? process.argv[index + 1] : ".");
const runner = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "bin", "apt-check.mjs");
const result = spawnSync(process.execPath, [runner, "--repo-root", repoRoot, "--mode", "push", "--only", "sync"], { stdio: "inherit" });
process.exit(result.status === 1 ? 1 : 0);
