// profile module: docs/apt/references/project-profile.json is valid, docs/project-context.md is
// current, the repo names an owner, and its command matrix has runnable validation commands.
// Covers the architecture-map forbidden flow "Deployable surfaces have no named owner or
// validation command matrix".

import { existsSync, readdirSync, readFileSync } from "node:fs";
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

export function checkProfile(repoRoot, schema) {
  const warnings = [];
  const { profilePath, profile, error } = loadProfile(repoRoot);
  const rel = PROFILE_RELATIVE_PATH.split(path.sep).join("/");
  if (!profile) {
    warnings.push(error ? `${rel}: invalid JSON (${error})` : `${rel}: missing. Add a project profile so owner and commands are recorded.`);
    return { warnings, summary: "no profile" };
  }
  for (const problem of validateProjectProfile(schema, profile)) warnings.push(`${rel}: ${problem}`);
  if (profile.inventory_version !== 2) {
    warnings.push(`${rel}: inventory_version 1. Upgrade to version 2 to record owner, commands and structure.`);
    return { warnings, summary: `profile v1 (${path.basename(profilePath)})` };
  }

  const contextPath = path.join(repoRoot, CONTEXT_RELATIVE_PATH);
  const context = existsSync(contextPath) ? readFileSync(contextPath, "utf8").replace(/\r\n/g, "\n") : null;
  if (context !== renderProjectContext(profile)) {
    warnings.push("docs/project-context.md: stale or missing. Regenerate it from the profile (inventory:generate).");
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
    for (const item of commands) {
      for (const call of scriptCalls(item.command, repoRoot)) {
        const found = call.dir
          ? scripts.get(call.dir)?.has(call.script)
          : [...scripts.values()].some((names) => names.has(call.script));
        if (!found) warnings.push(`${rel}: command "${item.name}" runs script "${call.script}", which no package.json defines`);
      }
    }
  }
  return { warnings, summary: `profile v2, ${commands.length} commands` };
}
