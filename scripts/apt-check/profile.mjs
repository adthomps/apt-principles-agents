// profile module: docs/apt/references/project-profile.json is valid, docs/project-context.md is
// current, the repo names an owner, and its command matrix has runnable validation commands.
// Covers the architecture-map forbidden flow "Deployable surfaces have no named owner or
// validation command matrix".

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  CONTEXT_RELATIVE_PATH,
  PROFILE_RELATIVE_PATH,
  loadProfile,
  renderProjectContext,
  validateProjectProfile,
} from "../project-inventory-lib.mjs";
import { readJson } from "./common.mjs";

const BUILD_TYPES = new Set(["application", "service", "monorepo", "static-site"]);
// pnpm subcommands that are not package scripts.
const PNPM_BUILTINS = new Set([
  "install", "i", "add", "remove", "rm", "update", "up", "exec", "dlx", "create", "init", "publish", "pack",
  "store", "why", "list", "ls", "outdated", "audit", "rebuild", "prune", "link", "unlink", "import", "fetch",
  "deploy", "env", "setup", "config", "patch", "patch-commit", "licenses", "root", "bin", "server", "approve-builds",
]);

/** package.json scripts for the root and every workspace folder one or two levels down. */
function packageScripts(repoRoot) {
  const byDir = new Map();
  const read = (dir) => {
    const pkg = readJson(path.join(dir, "package.json"));
    if (pkg) byDir.set(path.resolve(dir), new Set(Object.keys(pkg.scripts || {})));
  };
  read(repoRoot);
  for (const group of ["apps", "packages", "services", "workers"]) {
    const base = path.join(repoRoot, group);
    if (!existsSync(base)) continue;
    for (const entry of readdirSync(base, { withFileTypes: true })) if (entry.isDirectory()) read(path.join(base, entry.name));
  }
  return byDir;
}

// Flags whose next word is a value, not a subcommand.
const VALUE_FLAGS = new Set(["--dir", "-C", "--prefix", "--filter", "-F", "--workspace", "-w"]);
const SCOPE_FLAGS = new Set(["--filter", "-F", "--workspace", "-w", "-r", "--recursive", "--workspaces", "-ws"]);

/**
 * Script names a shell command runs, with the folder whose package.json must define them
 * (null = any workspace package). Handles npm/pnpm/yarn/bun "run <x>", "test", "start", and
 * pnpm's "pnpm <script>" shorthand. Anything else (node, npx, wrangler, ...) is not checked.
 */
function scriptCalls(command, repoRoot) {
  const calls = [];
  let cwd = repoRoot;
  for (const part of command.split(/&&|\|\||;/)) {
    let words = part.trim().split(/\s+/).filter(Boolean);
    let dir = cwd;
    if (words[0] === "cd" && words[1]) {
      cwd = path.resolve(cwd, words[1]); // "cd x && pnpm y": later parts run in x
      continue;
    }
    if (words[0] === "corepack") words = words.slice(1);
    const tool = words[0];
    if (!["npm", "pnpm", "yarn", "bun"].includes(tool)) continue;
    let scoped = false;
    const rest = [];
    for (let i = 1; i < words.length; i += 1) {
      const word = words[i];
      if (SCOPE_FLAGS.has(word)) scoped = true;
      if (word === "--dir" || word === "-C" || word === "--prefix") dir = path.resolve(repoRoot, words[i + 1] || ".");
      if (VALUE_FLAGS.has(word)) {
        i += 1;
        continue;
      }
      if (word.startsWith("-")) continue;
      rest.push(word);
    }
    const [sub, name] = rest;
    let script = null;
    if (sub === "run" && name) script = name;
    else if (sub === "test" || sub === "start") script = sub;
    else if (tool === "pnpm" && sub && !PNPM_BUILTINS.has(sub)) script = sub;
    if (script) calls.push({ script, dir: scoped ? null : dir });
  }
  return calls;
}

const STALE_DAYS = 180;
// Root scripts a command matrix must cover: the repo's own quality gates, by their plain names.
// Sub-scripts (test:web, build:pages) are usually run through these, so they are not required.
const GATE_SCRIPT = /^(check|test|lint|typecheck|build)$/;

/** JSON paths of every string that still starts with "TODO:". */
function todoPaths(value, at = "", found = []) {
  if (typeof value === "string") {
    if (value.startsWith("TODO:")) found.push(at || "(root)");
  } else if (Array.isArray(value)) {
    value.forEach((item, index) => todoPaths(item, `${at}[${index}]`, found));
  } else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) todoPaths(item, at ? `${at}.${key}` : key, found);
  }
  return found;
}

/**
 * --fix regenerates docs/project-context.md from a valid version 2 profile, so a repo without its
 * own inventory script can clear a stale context: node .apt/bin/apt-check.mjs --only profile --fix
 */
export function checkProfile(repoRoot, schema, { fix = false, today = new Date() } = {}) {
  const warnings = [];
  const { profilePath, profile, error } = loadProfile(repoRoot);
  const rel = PROFILE_RELATIVE_PATH.split(path.sep).join("/");
  if (!profile) {
    warnings.push(error ? `${rel}: invalid JSON (${error})` : `${rel}: missing. Add a project profile so owner and commands are recorded.`);
    return { warnings, summary: "no profile" };
  }
  const problems = validateProjectProfile(schema, profile);
  for (const problem of problems) warnings.push(`${rel}: ${problem}`);
  if (profile.inventory_version !== 2) {
    warnings.push(`${rel}: inventory_version 1. Upgrade to version 2 to record owner, commands and structure.`);
    return { warnings, summary: `profile v1 (${path.basename(profilePath)})` };
  }

  const contextPath = path.join(repoRoot, CONTEXT_RELATIVE_PATH);
  const context = existsSync(contextPath) ? readFileSync(contextPath, "utf8").replace(/\r\n/g, "\n") : null;
  const rendered = renderProjectContext(profile);
  let fixed = false;
  if (context !== rendered) {
    if (fix && !problems.length) {
      writeFileSync(contextPath, rendered);
      fixed = true;
    } else {
      warnings.push("docs/project-context.md: stale or missing. Regenerate it: node .apt/bin/apt-check.mjs --only profile --fix");
    }
  }
  const todos = todoPaths(profile);
  if (todos.length) warnings.push(`${rel}: ${todos.length} TODO placeholder(s) to fill: ${todos.slice(0, 8).join(", ")}${todos.length > 8 ? ", ..." : ""}`);
  const verified = Date.parse(profile.last_verified);
  if (!Number.isNaN(verified) && (today - verified) / 86400000 > STALE_DAYS) {
    warnings.push(`${rel}: last_verified ${profile.last_verified} is more than ${STALE_DAYS} days old. Re-check the profile against the repo and update the date.`);
  }
  if (!profile.ownership?.owner) warnings.push(`${rel}: ownership.owner is empty`);

  const commands = (profile.commands || []).filter((item) => item.applicability !== "not-applicable" && item.command);
  if (!commands.some((item) => ["validate", "test"].includes(item.category))) {
    warnings.push(`${rel}: command matrix has no applicable validate or test command`);
  }
  if (BUILD_TYPES.has(profile.repository_type) && !commands.some((item) => item.category === "build")) {
    warnings.push(`${rel}: ${profile.repository_type} has no applicable build command`);
  }

  const scripts = packageScripts(repoRoot);
  if (scripts.size) {
    const covered = new Set();
    for (const item of commands) {
      for (const call of scriptCalls(item.command, repoRoot)) {
        if (!call.dir || call.dir === path.resolve(repoRoot)) covered.add(call.script);
        const found = call.dir
          ? scripts.get(call.dir)?.has(call.script)
          : [...scripts.values()].some((names) => names.has(call.script));
        if (!found) warnings.push(`${rel}: command "${item.name}" runs script "${call.script}", which no package.json defines`);
      }
    }
    // Matrix drift: a quality gate added to package.json but never recorded in the profile.
    for (const name of scripts.get(path.resolve(repoRoot)) || []) {
      if (GATE_SCRIPT.test(name) && !covered.has(name)) warnings.push(`${rel}: package.json script "${name}" is not in the command matrix`);
    }
  }
  return { warnings, summary: `profile v2, ${commands.length} commands${fixed ? "; regenerated docs/project-context.md" : ""}` };
}
