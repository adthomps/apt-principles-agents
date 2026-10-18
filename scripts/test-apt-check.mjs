#!/usr/bin/env node
// Tests for apt-check (DR-017): architecture rules and ignore marker, warn-first ratchet,
// profile command matrix and stale context, sync design-behind gate, and the installed shim.

import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { renderProjectContext } from "./project-inventory-lib.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempRoot = path.join(root, ".tmp", "apt-check-tests");
const runner = path.join(root, "bin", "apt-check.mjs");
let assertions = 0;

function write(file, content) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, typeof content === "string" ? content : `${JSON.stringify(content, null, 2)}\n`);
}

function check(repo, args = [], env = {}) {
  const run = spawnSync(process.execPath, [runner, "--repo-root", repo, "--json", ...args], {
    encoding: "utf8",
    env: { ...process.env, CI: "", ...env },
  });
  return { status: run.status, report: JSON.parse(run.stdout) };
}

function expect(condition, message) {
  assertions += 1;
  if (!condition) throw new Error(message);
}

const moduleOf = (report, name) => report.results.find((result) => result.module === name);

rmSync(tempRoot, { recursive: true, force: true });

// ── architecture ────────────────────────────────────────────────────────────
const arch = path.join(tempRoot, "arch");
write(path.join(arch, "apps", "web", "package.json"), { name: "@demo/web" });
write(path.join(arch, "apps", "api", "package.json"), { name: "@demo/api" });
write(path.join(arch, "apps", "api", "src", "handler.ts"), "export const handler = () => 1;\n");
write(path.join(arch, "apps", "web", "src", "page.ts"), [
  'import { handler } from "../../api/src/handler";',
  'import type { Api } from "@demo/api"; // apt-check-ignore',
  'import { ok } from "@demo/ui";',
  "",
].join("\n"));
write(path.join(arch, "apps", "web", "src", "components", "Card.tsx"), "export const load = () => fetch('/api/cards');\n");
write(path.join(arch, "apps", "web", "test", "contract.test.ts"), 'import { handler } from "../../api/src/handler";\n');
write(path.join(arch, "packages", "ui", "package.json"), { name: "@demo/ui" });
write(path.join(arch, "packages", "ui", "src", "index.ts"), 'export { x } from "@demo/web/src/page";\nexport const ok = 1;\n');

let result = check(arch, ["--only", "architecture"]);
const archWarnings = moduleOf(result.report, "architecture").warnings;
expect(result.status === 0, "architecture findings must warn, not fail, by default");
expect(archWarnings.length === 3, `expected 3 architecture findings, got ${archWarnings.length}: ${archWarnings.join(" | ")}`);
expect(archWarnings.some((item) => item.includes("page.ts:1 boundary: web imports api")), "web -> api relative import not reported");
expect(archWarnings.some((item) => item.includes("index.ts:1 boundary: packages imports web")), "packages -> web alias import not reported");
expect(archWarnings.some((item) => item.includes("Card.tsx:1 no-fetch-in-presentational")), "fetch in component not reported");
expect(!archWarnings.some((item) => item.includes("page.ts:2")), "apt-check-ignore was not honored");
expect(!archWarnings.some((item) => item.includes("contract.test.ts")), "test files must not be checked");

// Ratchet: level error fails above the baseline, passes at it, and asks to lower it below.
write(path.join(arch, "apt.json"), { architecture: { level: "error", baseline: 2 } });
result = check(arch, ["--only", "architecture"]);
expect(result.status === 1 && moduleOf(result.report, "architecture").status === "fail", "error level must fail above baseline");
write(path.join(arch, "apt.json"), { architecture: { level: "error", baseline: 3 } });
result = check(arch, ["--only", "architecture"]);
expect(result.status === 0, "error level must pass at the baseline");
write(path.join(arch, "apt.json"), { architecture: { level: "error", baseline: 5 } });
result = check(arch, ["--only", "architecture"]);
expect(moduleOf(result.report, "architecture").summary.includes("lower architecture.baseline to 3"), "ratchet must ask to lower the baseline");

// Explicit forbid rules replace the defaults.
write(path.join(arch, "apt.json"), { architecture: { forbid: [{ from: "packages", to: "web" }] } });
result = check(arch, ["--only", "architecture"]);
expect(moduleOf(result.report, "architecture").warnings.length === 2, "configured forbid list must replace the defaults");

// ── profile ─────────────────────────────────────────────────────────────────
const prof = path.join(tempRoot, "profile");
const profile = JSON.parse(readFileSync(path.join(root, "docs", "apt", "references", "project-profile.json"), "utf8"));
write(path.join(prof, "package.json"), { scripts: JSON.parse(readFileSync(path.join(root, "package.json"), "utf8")).scripts });
write(path.join(prof, "docs", "apt", "references", "project-profile.json"), profile);
write(path.join(prof, "docs", "project-context.md"), renderProjectContext(profile));
result = check(prof, ["--only", "profile"]);
expect(moduleOf(result.report, "profile").status === "pass", `valid profile must pass: ${moduleOf(result.report, "profile").warnings.join(" | ")}`);

const broken = { ...profile, commands: [...profile.commands, { ...profile.commands[0], name: "Ghost", command: "corepack pnpm --dir . run ghost-script" }] };
write(path.join(prof, "docs", "apt", "references", "project-profile.json"), broken);
result = check(prof, ["--only", "profile"]);
const profileWarnings = moduleOf(result.report, "profile").warnings;
expect(profileWarnings.some((item) => item.includes('"ghost-script"')), "missing script not reported");
expect(profileWarnings.some((item) => item.includes("project-context.md: stale")), "stale project-context.md not reported");
expect(result.status === 0, "profile findings must warn by default");

rmSync(path.join(prof, "docs", "apt"), { recursive: true });
result = check(prof, ["--only", "profile"]);
expect(moduleOf(result.report, "profile").warnings[0].includes("missing"), "missing profile not reported");

// ── sync and shim ───────────────────────────────────────────────────────────
const synced = path.join(tempRoot, "synced");
mkdirSync(synced, { recursive: true });
const install = spawnSync(process.execPath, [path.join(root, "scripts", "apt-assets.mjs"), "install", "--target", synced, "--manifests", "core,design", "--platforms", "claude"], { encoding: "utf8" });
expect(install.status === 0, `install failed: ${install.stderr}`);
result = check(synced, ["--mode", "push", "--only", "sync"]);
expect(result.status === 0 && moduleOf(result.report, "sync").status === "pass", "fresh install must be current");

const recordFile = path.join(synced, ".apt", "installation.json");
const record = JSON.parse(readFileSync(recordFile, "utf8"));
write(recordFile, { ...record, designVersion: "0.0.1" });
result = check(synced, ["--mode", "push", "--only", "sync"]);
expect(result.status === 1 && moduleOf(result.report, "sync").errors[0].startsWith("design 0.0.1 ->"), "design behind must fail the push");
write(recordFile, record);

// Guidance behind (an outdated, unedited managed file) warns but passes.
const managed = record.managedFiles.find((item) => item.target.startsWith(".apt/principles/"));
const recordOld = { ...record, managedFiles: record.managedFiles.map((item) => (item === managed ? { ...item, sha256: "0".repeat(64) } : item)) };
write(path.join(synced, managed.target), "older text\n");
write(recordFile, { ...recordOld, managedFiles: recordOld.managedFiles.map((item) => (item.target === managed.target ? { ...item, sha256: hash(path.join(synced, managed.target)) } : item)) });
result = check(synced, ["--mode", "push", "--only", "sync"]);
expect(result.status === 0 && moduleOf(result.report, "sync").warnings.some((item) => item.startsWith("guidance: 1")), "guidance behind must warn and pass");

// The installed shim skips without a canonical checkout locally, fails in CI, and runs with one.
const shim = path.join(synced, ".apt", "bin", "apt-check.mjs");
const shimRun = (env) => spawnSync(process.execPath, [shim, "--only", "sync"], { encoding: "utf8", env: { ...process.env, APT_PRINCIPLES_AGENTS_ROOT: "", CI: "", ...env } });
expect(shimRun({}).status === 0 && shimRun({}).stdout.includes("Skipped"), "shim must skip locally without apt-principles-agents");
expect(shimRun({ CI: "true" }).status === 1, "shim must fail in CI without apt-principles-agents");
expect(shimRun({ APT_PRINCIPLES_AGENTS_ROOT: root }).stdout.includes("APT check (ci)"), "shim must run the canonical runner");

function hash(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

rmSync(tempRoot, { recursive: true, force: true });
console.log(`apt-check tests passed (${assertions} assertions).`);
