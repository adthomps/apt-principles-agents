#!/usr/bin/env node
// Drafts an inventory_version 2 project profile (docs/apt/references/project-profile.json) from
// facts a repository already holds: docs/project-identity.md, package.json scripts, lockfiles,
// engines, apps/ and packages/ folders, wrangler and workflow files, the "Local Cloudflare"
// section of an existing docs/project-context.md, and the fields of a version 1 profile.
// Everything that needs judgment is left as a "TODO:" string, which apt-check reports until a
// person or agent fills it in.
//
//   node scripts/scaffold-project-profile.mjs --target <repo> [--write]
//
// Without --write it prints the draft. It never replaces an existing version 2 profile.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { PROFILE_RELATIVE_PATH, validateProjectProfile } from "./project-inventory-lib.mjs";

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TODO = (what) => `TODO: ${what}`;
const readJson = (file) => (existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null);
const readText = (file) => (existsSync(file) ? readFileSync(file, "utf8").replace(/\r\n/g, "\n") : "");

const CATEGORY_RULES = [
  [/^(test|e2e)\b|^test[:-]/, "test"],
  [/^(check|lint|typecheck|validate|verify|audit|format:check)\b|^(check|lint|typecheck|validate|verify)[:-]/, "validate"],
  [/^build\b|^build[:-]/, "build"],
  [/^(dev|start|preview|serve|sandbox)\b|^(dev|start|preview)[:-]/, "run"],
  [/^deploy\b|^deploy[:-]|^publish\b|^release\b/, "deploy"],
  [/^(db|d1|migrate|migration)\b|^(db|d1)[:-]|migrat/, "maintenance"],
  [/^(generate|gen|codegen)\b|^(generate|gen)[:-]|^inventory:generate/, "generate"],
  [/^(setup|prepare|postinstall|install)\b/, "setup"],
];
const OPTIONAL_V2_FIELDS = [
  "architecture_pattern", "command_matrix", "validation_evidence", "release_model", "operations_model",
  "ai_agent_usage", "security_model", "learning_value", "reusable_artifacts",
];
const MUTATING =/deploy|publish|release|migrat|generate|gen:|format(?!:check)|fix|seed|sync|write/;

function categoryOf(name) {
  for (const [pattern, category] of CATEGORY_RULES) if (pattern.test(name)) return category;
  return "maintenance";
}

function packageManager(repo, pkg) {
  if (existsSync(path.join(repo, "pnpm-lock.yaml"))) return "pnpm";
  if (existsSync(path.join(repo, "bun.lock")) || existsSync(path.join(repo, "bun.lockb"))) return "bun";
  if (existsSync(path.join(repo, "yarn.lock"))) return "yarn";
  if (existsSync(path.join(repo, "package-lock.json")) || pkg) return "npm";
  return null;
}

function identity(repo) {
  const text = readText(path.join(repo, "docs", "project-identity.md"));
  const name = /^name:\s*"?(.+?)"?\s*$/m.exec(text)?.[1];
  const body = text.replace(/^---[\s\S]*?---\n/, "").split("\n").filter((line) => line.trim() && !line.startsWith("#"));
  return { name, description: body.join(" ").trim() || null };
}

function localCloudflare(repo) {
  const text = readText(path.join(repo, "docs", "project-context.md"));
  const start = text.indexOf("## Local Cloudflare\n");
  if (start < 0) return null;
  const section = text.slice(start).split(/\n## /)[0];
  const paras = section.split(/\n\n+/).slice(1).map((para) => para.trim());
  const get = (label) => paras.find((para) => para.startsWith(`${label}: `))?.slice(label.length + 2) || null;
  const status = get("Status");
  const localCommand = get("Local command");
  const fix = get("Fix");
  return status && localCommand && fix ? { status, local_command: localCommand, fix } : null;
}

function runCommand(manager, script) {
  if (manager === "npm") return script === "test" || script === "start" ? `npm ${script}` : `npm run ${script}`;
  return `${manager} run ${script}`;
}

export function scaffold(repo, { today = new Date().toISOString().slice(0, 10) } = {}) {
  const project = path.basename(repo);
  const pkg = readJson(path.join(repo, "package.json"));
  const v1 = readJson(path.join(repo, PROFILE_RELATIVE_PATH));
  if (v1?.inventory_version === 2) throw new Error(`${project} already has a version 2 profile; edit it instead.`);
  const old = v1 || {};
  const id = identity(repo);
  const manager = packageManager(repo, pkg);
  const has = (relative) => existsSync(path.join(repo, relative));
  const topDirs = readdirSync(repo, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith(".") && !["node_modules", "dist", "build", "coverage", "_apt-principles-agents"].includes(entry.name))
    .map((entry) => entry.name)
    .sort();
  const wrangler = [repo, ...topDirs.filter((dir) => dir === "apps").flatMap(() => readdirSync(path.join(repo, "apps")).map((app) => path.join(repo, "apps", app)))]
    .flatMap((dir) => (existsSync(dir) ? readdirSync(dir).filter((file) => /^wrangler\.(toml|jsonc?)$/.test(file)).map((file) => path.relative(repo, path.join(dir, file)).split(path.sep).join("/")) : []))
    .concat(readdirSync(repo).filter((file) => /^wrangler\..+\.(toml|jsonc?)$/.test(file)));
  const workflows = has(".github/workflows") ? readdirSync(path.join(repo, ".github", "workflows")).map((file) => `.github/workflows/${file}`) : [];

  const repositoryType = has("apps") && has("packages") ? "monorepo" : wrangler.length ? "service" : pkg ? "application" : "other";

  const requirements = [];
  if (pkg?.engines?.node || has(".nvmrc")) {
    requirements.push({
      name: "Node.js",
      declared: pkg?.engines?.node ? `${pkg.engines.node} in package.json engines` : `${readText(path.join(repo, ".nvmrc")).trim()} in .nvmrc`,
      recommended: TODO("recommended or CI-verified Node.js version"),
      verified_by: [pkg?.engines?.node && "package.json", has(".nvmrc") && ".nvmrc", ...workflows].filter(Boolean).join("; "),
    });
  } else if (pkg) {
    requirements.push({ name: "Node.js", declared: "Not declared", recommended: TODO("Node.js version the repo is tested on"), verified_by: "package.json" });
  }
  if (pkg?.packageManager) requirements.push({ name: "Package manager", declared: `${pkg.packageManager} in package.json`, recommended: pkg.packageManager, verified_by: "package.json packageManager" });
  if (!requirements.length) requirements.push({ name: TODO("runtime or tool"), declared: TODO("declared version"), recommended: TODO("recommended version"), verified_by: TODO("file that proves it") });

  const scripts = Object.entries(pkg?.scripts || {});
  const commands = scripts.length
    ? scripts.map(([name, body]) => ({
        name,
        category: categoryOf(name),
        command: runCommand(manager, name),
        purpose: TODO(`what "${name}" does (${body.length > 80 ? `${body.slice(0, 77)}...` : body})`),
        mutates: MUTATING.test(name),
        applicability: "applicable",
      }))
    : [{ name: "Validate", category: "validate", command: TODO("command that validates this repository"), purpose: TODO("what the validation covers"), mutates: false, applicability: "applicable" }];

  const evidence = [
    has("README.md") && { path: "README.md", supports: "Repository purpose, setup and usage." },
    pkg && { path: "package.json", supports: "Scripts, package manager and declared runtime." },
    has("docs/project-identity.md") && { path: "docs/project-identity.md", supports: "Project name and description." },
    ...wrangler.map((file) => ({ path: file, supports: "Cloudflare Worker configuration and bindings." })),
    ...workflows.map((file) => ({ path: file, supports: "Continuous integration and deployment steps." })),
  ].filter(Boolean);

  const profile = {
    inventory_version: 2,
    project,
    purpose: old.purpose || id.description || TODO("one-sentence purpose"),
    description: old.description || TODO("what the repository contains and how it is built"),
    audience: Array.isArray(old.audience) && old.audience.length ? old.audience : [TODO("primary audience")],
    adoption_mode: old.adoption_mode || old.adoptionMode || "apply",
    principles_demonstrated: old.principles_demonstrated || (old.principles && typeof old.principles === "object" ? Object.keys(old.principles) : []),
    repository_type: repositoryType,
    ownership: { owner: old.ownership?.owner || "APT", profile_maintainer: old.ownership?.profile_maintainer || `${id.name || project} maintainers` },
    architecture: {
      summary: TODO("how the parts fit together"),
      components: topDirs.filter((dir) => ["apps", "packages", "src", "services", "workers"].includes(dir)).length
        ? topDirs.filter((dir) => ["apps", "packages", "services", "workers"].includes(dir)).flatMap((dir) => readdirSync(path.join(repo, dir), { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => TODO(`${dir}/${entry.name}: what it owns`))).concat(topDirs.includes("src") ? [TODO("src: what it owns")] : [])
        : [TODO("main component and what it owns")],
      runtime_model: TODO("where and how the code runs"),
      deployment_model: wrangler.length ? TODO("how the Worker and any frontend are deployed") : TODO("how this repository is deployed or distributed, or that it is not deployed"),
    },
    runtime: {
      summary: TODO("how to install, run and validate locally"),
      requirements,
      package_manager: manager || "None",
      local_server: TODO("local server command and port, or None"),
      build: scripts.some(([name]) => categoryOf(name) === "build") ? runCommand(manager, scripts.find(([name]) => categoryOf(name) === "build")[0]) : "None",
      deployment: TODO("deployment command or process, or None"),
    },
    ...(localCloudflare(repo) ? { local_cloudflare: localCloudflare(repo) } : {}),
    commands,
    structure: topDirs.length
      ? topDirs.map((dir) => ({ path: `${dir}/`, purpose: TODO(`what ${dir}/ holds`), authority: dir === "docs" ? "supporting" : "operational", maintenance: "authored" }))
      : [{ path: "./", purpose: TODO("what the repository root holds"), authority: "operational", maintenance: "authored" }],
    integrations: wrangler.length ? [TODO("Cloudflare services and bindings in use")] : [],
    source_boundaries: {
      canonical: [TODO("folders this repository owns as source of truth")],
      generated: [".apt/ and platform folders are installed by apt-principles-agents; do not edit them here.", "docs/project-context.md is generated from this profile."],
      archived: [],
    },
    constraints: [TODO("rules a contributor must not break")],
    evidence: evidence.length ? evidence : [{ path: TODO("file"), supports: TODO("what it proves") }],
    last_verified: today,
    maturity: ["concept", "prototype", "active", "production", "archived"].includes(old.maturity) ? old.maturity : old.status === "alpha" ? "prototype" : "active",
    showcase: old.showcase && typeof old.showcase.include === "boolean" ? old.showcase : { include: false, summary: TODO("one-line public summary") },
  };
  // Optional narrative fields that version 2 profiles also use (see apt-principles-agents' own profile).
  for (const key of OPTIONAL_V2_FIELDS) if (old[key] !== undefined) profile[key] = old[key];
  const carried = new Set(["inventory_version", "project", "purpose", "description", "audience", "adoption_mode", "adoptionMode", "principles_demonstrated", "principles", "ownership", "maturity", "status", "showcase", ...OPTIONAL_V2_FIELDS]);
  const dropped = Object.keys(old).filter((key) => !carried.has(key) && !key.startsWith("$"));
  return { profile, dropped };
}

function main() {
  const index = process.argv.indexOf("--target");
  if (index < 0) {
    console.error("Usage: node scripts/scaffold-project-profile.mjs --target <repo> [--write]");
    process.exit(2);
  }
  const repo = path.resolve(process.argv[index + 1]);
  const { profile, dropped } = scaffold(repo);
  const schema = JSON.parse(readFileSync(path.join(sourceRoot, "references", "project-profile.schema.json"), "utf8"));
  const errors = validateProjectProfile(schema, profile);
  if (errors.length) {
    console.error(`Draft profile for ${path.basename(repo)} is invalid:\n${errors.map((error) => `- ${error}`).join("\n")}`);
    process.exit(1);
  }
  const todos = JSON.stringify(profile).match(/TODO:/g)?.length || 0;
  const note = `${path.basename(repo)}: ${profile.commands.length} commands, ${profile.structure.length} structure entries, ${todos} TODOs${dropped.length ? `; version 1 fields to review by hand: ${dropped.join(", ")}` : ""}`;
  if (!process.argv.includes("--write")) {
    console.log(JSON.stringify(profile, null, 2));
    console.error(note);
    return;
  }
  const file = path.join(repo, PROFILE_RELATIVE_PATH);
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(profile, null, 2)}\n`);
  console.log(`Wrote ${file}\n${note}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
