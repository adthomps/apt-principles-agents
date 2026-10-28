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
// Today's date keeps the fixture clear of the 180-day staleness rule whenever the test runs.
const today = new Date().toISOString().slice(0, 10);
const profile = { ...JSON.parse(readFileSync(path.join(root, "docs", "apt", "references", "project-profile.json"), "utf8")), last_verified: today };
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

// --fix regenerates a stale context only when the profile itself is valid.
write(path.join(prof, "docs", "apt", "references", "project-profile.json"), profile);
write(path.join(prof, "docs", "project-context.md"), "hand edited\n");
result = check(prof, ["--only", "profile", "--fix"]);
expect(moduleOf(result.report, "profile").status === "pass" && readFileSync(path.join(prof, "docs", "project-context.md"), "utf8") === renderProjectContext(profile), "--fix must regenerate a stale context");

// TODO placeholders, an old last_verified date, and a gate script missing from the matrix.
const pkg = JSON.parse(readFileSync(path.join(prof, "package.json"), "utf8"));
write(path.join(prof, "package.json"), { scripts: { ...pkg.scripts, typecheck: "tsc --noEmit" } });
write(path.join(prof, "docs", "apt", "references", "project-profile.json"), { ...profile, purpose: "TODO: one-sentence purpose", last_verified: "2020-01-01" });
result = check(prof, ["--only", "profile", "--fix"]);
const upkeep = moduleOf(result.report, "profile").warnings;
expect(upkeep.some((item) => item.includes("1 TODO placeholder(s) to fill: purpose")), "TODO placeholder not reported");
expect(upkeep.some((item) => item.includes("last_verified 2020-01-01 is more than 180 days old")), "stale last_verified not reported");
expect(upkeep.some((item) => item.includes('script "typecheck" is not in the command matrix')), "matrix drift not reported");
expect(!upkeep.some((item) => item.includes('"test:agent-coverage"')), "sub-scripts must not count as matrix drift");
write(path.join(prof, "package.json"), pkg);

rmSync(path.join(prof, "docs", "apt"), { recursive: true });
result = check(prof, ["--only", "profile"]);
expect(moduleOf(result.report, "profile").warnings[0].includes("missing"), "missing profile not reported");

// ── scaffold ────────────────────────────────────────────────────────────────
const scaffoldCli = path.join(root, "scripts", "scaffold-project-profile.mjs");
const fresh = path.join(tempRoot, "fresh");
write(path.join(fresh, "package.json"), { engines: { node: ">=20" }, scripts: { dev: "vite", build: "vite build", test: "vitest run", "deploy:worker": "wrangler deploy" } });
write(path.join(fresh, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
write(path.join(fresh, "apps", "web", "package.json"), { name: "@fresh/web" });
write(path.join(fresh, "packages", "ui", "package.json"), { name: "@fresh/ui" });
write(path.join(fresh, "docs", "project-identity.md"), "---\nfolder: fresh\nname: Fresh App\nstatus: active\n---\n\n# Fresh App\n\nA fresh app for testing.\n");
write(path.join(fresh, "docs", "project-context.md"), "# Context\n\n## Local Cloudflare\n\nStatus: Ready.\n\nLocal command: `pnpm dev`.\n\nFix: none.\n");
const scaffoldRun = spawnSync(process.execPath, [scaffoldCli, "--target", fresh, "--write"], { encoding: "utf8" });
expect(scaffoldRun.status === 0, `scaffold failed: ${scaffoldRun.stderr}`);
const drafted = JSON.parse(readFileSync(path.join(fresh, "docs", "apt", "references", "project-profile.json"), "utf8"));
expect(drafted.inventory_version === 2 && drafted.repository_type === "monorepo" && drafted.runtime.package_manager === "pnpm", "scaffold must detect monorepo and pnpm");
expect(drafted.purpose === "A fresh app for testing." && drafted.local_cloudflare?.status === "Ready.", "scaffold must read identity and Local Cloudflare");
const categories = Object.fromEntries(drafted.commands.map((item) => [item.name, item.category]));
expect(categories.dev === "run" && categories.build === "build" && categories.test === "test" && categories["deploy:worker"] === "deploy", "scaffold must infer command categories");
expect(drafted.commands.find((item) => item.name === "deploy:worker").mutates === true, "deploy commands must be marked as mutating");
const refuse = spawnSync(process.execPath, [scaffoldCli, "--target", fresh, "--write"], { encoding: "utf8" });
expect(refuse.status === 1 && refuse.stderr.includes("already has a version 2 profile"), "scaffold must not replace a version 2 profile");

const legacy = path.join(tempRoot, "legacy");
write(path.join(legacy, "docs", "apt", "references", "project-profile.json"), { purpose: "Legacy purpose.", audience: ["operators"], adoptionMode: "sync", status: "alpha", security_model: "Keys stay server side.", links: { docs: "/docs" } });
const legacyRun = spawnSync(process.execPath, [scaffoldCli, "--target", legacy], { encoding: "utf8" });
const merged = JSON.parse(legacyRun.stdout);
expect(merged.purpose === "Legacy purpose." && merged.adoption_mode === "sync" && merged.maturity === "prototype" && merged.security_model === "Keys stay server side.", "scaffold must merge version 1 fields");
expect(legacyRun.stderr.includes("version 1 fields to review by hand: links"), "scaffold must list version 1 fields it did not carry");

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
