#!/usr/bin/env node
// apt-check (DR-017): one entry point for APT repository checks, run by the pre-push hook
// (--mode push) and the managed CI workflow (--mode ci). Products call it through the installed
// shim .apt/bin/apt-check.mjs, which finds this canonical copy.
//
//   node bin/apt-check.mjs --repo-root <repo> [--mode push|ci] [--only sync,profile,architecture,design] [--json] [--fix]
//
// Modules: sync (design behind = error), profile and architecture (level from apt.json, default
// warn, with a baseline ratchet), design (ci only; the repo's installed apt-design-check).
// Exit 1 only on error-level findings.

import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { checkArchitecture } from "../scripts/apt-check/architecture.mjs";
import { readJson } from "../scripts/apt-check/common.mjs";
import { checkDesign } from "../scripts/apt-check/design.mjs";
import { checkProfile } from "../scripts/apt-check/profile.mjs";
import { checkSync } from "../scripts/apt-check/sync.mjs";
import { syncCommand } from "../scripts/sync-status-lib.mjs";

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const arg = (name) => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
};
const repoRoot = path.resolve(arg("repo-root") || ".");
const mode = arg("mode") || "ci";
const only = arg("only") ? new Set(arg("only").split(",")) : null;
const asJson = process.argv.includes("--json");
const MODES = { push: ["sync", "profile", "architecture"], ci: ["sync", "profile", "architecture", "design"] };
if (!MODES[mode]) {
  console.error(`apt-check: unknown --mode ${mode} (push or ci)`);
  process.exit(2);
}

const config = readJson(path.join(repoRoot, "apt.json")) || {};
const profileSchema = JSON.parse(readFileSync(path.join(sourceRoot, "references", "project-profile.schema.json"), "utf8"));
const runners = {
  // apt-principles-agents is the source, so it has nothing to sync from.
  sync: () => (repoRoot === sourceRoot ? { skipped: "canonical source" } : checkSync(repoRoot)),
  profile: () => checkProfile(repoRoot, profileSchema, { fix: process.argv.includes("--fix") }),
  architecture: () => checkArchitecture(repoRoot, config.architecture || {}),
  design: () => checkDesign(repoRoot),
};

/**
 * Ratchet for warn-first modules: level "warn" never fails; level "error" fails when findings
 * exceed the baseline and asks for the baseline to come down when they fall below it.
 */
function applyLevel(name, outcome) {
  const settings = config[name] || {};
  if (!["profile", "architecture"].includes(name) || settings.level !== "error") return outcome;
  const findings = outcome.warnings || [];
  const baseline = Number.isInteger(settings.baseline) ? settings.baseline : 0;
  if (findings.length > baseline) {
    return { ...outcome, errors: findings, warnings: [], summary: `${outcome.summary}; ${findings.length} findings above baseline ${baseline}` };
  }
  const note = findings.length < baseline ? `; lower ${name}.baseline to ${findings.length}` : "";
  return { ...outcome, summary: `${outcome.summary}; ${findings.length} within baseline ${baseline}${note}` };
}

const results = [];
for (const name of MODES[mode]) {
  if (only && !only.has(name)) continue;
  let outcome;
  try {
    outcome = runners[name]();
  } catch (error) {
    // A module that cannot run is reported, not fatal: one broken check must not hide the others.
    outcome = { warnings: [`could not run: ${String(error.message).split("\n")[0]}`], summary: "error" };
  }
  if (outcome.skipped) {
    results.push({ module: name, status: "skip", summary: outcome.skipped, errors: [], warnings: [] });
    continue;
  }
  outcome = applyLevel(name, { errors: [], warnings: [], ...outcome });
  const status = outcome.errors.length ? "fail" : outcome.warnings.length ? "warn" : "pass";
  results.push({ module: name, status, summary: outcome.summary, errors: outcome.errors, warnings: outcome.warnings });
}

const failed = results.some((result) => result.status === "fail");
if (asJson) {
  console.log(JSON.stringify({ repo: path.basename(repoRoot), mode, status: failed ? "fail" : "pass", results }, null, 2));
} else {
  const out = failed ? process.stderr : process.stdout;
  const quiet = mode === "push" && results.every((result) => result.status === "pass" || result.status === "skip");
  if (!quiet) {
    out.write(`APT check (${mode}) for ${path.basename(repoRoot)}: ${failed ? "FAIL" : "PASS"}\n`);
    for (const result of results) {
      out.write(`- ${result.module}: ${result.status} (${result.summary})\n`);
      const lines = [...result.errors.map((item) => `error: ${item}`), ...result.warnings.map((item) => `warn: ${item}`)];
      for (const line of lines.slice(0, 50)) out.write(`    ${line}\n`);
      if (lines.length > 50) out.write(`    ... ${lines.length - 50} more\n`);
    }
    if (failed && results.some((result) => result.module === "sync" && result.status === "fail")) {
      out.write(`Sync: ${syncCommand}, then node .apt/design/bin/apt-design-check.mjs, commit, and push again.\n`);
    }
    if (failed && mode === "push") out.write("Push anyway: git push --no-verify (or APT_SKIP_SYNC_CHECK=1).\n");
  }
}
process.exit(failed ? 1 : 0);
