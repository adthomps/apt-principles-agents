#!/usr/bin/env node
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const packageJson = JSON.parse(readFileSync(path.join(sourceRoot, "package.json"), "utf8"));
const sections = ["principles", "standards", "checklists", "context", "skills", "agents", "templates", "prompts", "knowledge", "platforms"];
const manifestKeys = new Set(["name", "description", "extends", ...sections]);
const args = parseArgs(process.argv.slice(2));
const command = args._[0] || "help";

function parseArgs(values) {
  const result = { _: [] };
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) {
      result._.push(value);
      continue;
    }
    const key = value.slice(2);
    if (["dry-run", "force", "apply", "json", "summary", "check"].includes(key)) result[key] = true;
    else result[key] = values[++index];
  }
  return result;
}

function normalize(value) {
  return value.replaceAll("\\", "/");
}

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function exists(file) {
  return existsSync(file);
}

function ensureParent(file) {
  mkdirSync(path.dirname(file), { recursive: true });
}

function timestamp() {
  return new Date().toISOString().replaceAll(/[-:.TZ]/g, "");
}

function gitCommit() {
  try {
    return execFileSync("git", ["-C", sourceRoot, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

function parseManifest(name) {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) throw new Error(`Invalid manifest name: ${name}`);
  const file = path.join(sourceRoot, "manifests", `${name}.yaml`);
  if (!exists(file)) throw new Error(`Unknown manifest: ${name}`);
  const result = { name, extends: [] };
  for (const section of sections) result[section] = [];
  let current = null;
  for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
    const scalar = raw.match(/^([a-z-]+):\s+(.+)$/);
    if (scalar) {
      if (!manifestKeys.has(scalar[1])) throw new Error(`Unknown manifest field ${scalar[1]}: ${name}`);
      result[scalar[1]] = scalar[2].trim();
      current = null;
      continue;
    }
    const heading = raw.match(/^([a-z-]+):\s*$/);
    if (heading) {
      current = heading[1];
      if (!manifestKeys.has(current)) throw new Error(`Unknown manifest section ${current}: ${name}`);
      if (!Array.isArray(result[current])) result[current] = [];
      continue;
    }
    const item = raw.match(/^\s+-\s+(.+)$/);
    if (item && current) {
      const value = item[1].trim();
      if (result[current].includes(value)) throw new Error(`Duplicate manifest entry ${value}: ${name}`);
      result[current].push(value);
    }
  }
  if (result.name !== name) throw new Error(`Manifest name must match filename: ${name}`);
  if (!result.description) throw new Error(`Manifest description is required: ${name}`);
  return result;
}

function resolveManifests(names) {
  const ordered = [];
  const seen = new Set();
  const visiting = new Set();
  function visit(name) {
    if (seen.has(name)) return;
    if (visiting.has(name)) throw new Error(`Manifest extension cycle: ${[...visiting, name].join(" -> ")}`);
    visiting.add(name);
    const manifest = parseManifest(name);
    for (const parent of manifest.extends || []) visit(parent);
    visiting.delete(name);
    seen.add(name);
    ordered.push(manifest);
  }
  for (const name of names) visit(name);
  return ordered;
}

function expandPath(relative) {
  if (!relative || path.isAbsolute(relative) || normalize(relative).split("/").includes("..")) {
    throw new Error(`Unsafe manifest path: ${relative}`);
  }
  const absolute = path.resolve(sourceRoot, relative);
  if (absolute !== sourceRoot && !absolute.startsWith(`${sourceRoot}${path.sep}`)) throw new Error(`Manifest path escapes repository: ${relative}`);
  if (!exists(absolute)) throw new Error(`Manifest path missing: ${relative}`);
  if (!statSync(absolute).isDirectory()) return [relative];
  function walk(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const child = path.join(directory, entry.name);
      return entry.isDirectory() ? walk(child) : [normalize(path.relative(sourceRoot, child))];
    });
  }
  return walk(absolute);
}

function selectedFiles(manifests) {
  const bySection = new Map();
  for (const section of sections) bySection.set(section, []);
  for (const manifest of manifests) {
    for (const section of sections) {
      for (const item of manifest[section] || []) {
        for (const file of expandPath(item)) {
          const values = bySection.get(section);
          if (!values.includes(file)) values.push(file);
        }
      }
    }
  }
  return bySection;
}

function canonicalTarget(source) {
  return normalize(path.join(".apt", source));
}

function suffixAfter(source, marker) {
  const normalized = normalize(source);
  const position = normalized.lastIndexOf(marker);
  return position >= 0 ? normalized.slice(position + marker.length) : path.basename(normalized);
}

function mappingsFor(manifests, platforms) {
  const selected = selectedFiles(manifests);
  const mappings = [];
  const add = (source, target, kind = "canonical") => {
    if (!mappings.some((item) => item.target === target)) mappings.push({ source, target: normalize(target), kind });
  };
  for (const [section, files] of selected) {
    for (const source of files) add(source, canonicalTarget(source));
    if (section === "skills") {
      for (const source of files) {
        const suffix = suffixAfter(source, "skills/");
        if (platforms.includes("codex")) add(source, `.codex/skills/${suffix}`, "platform");
        if (platforms.includes("claude")) add(source, `.claude/skills/${suffix}`, "platform");
        if (platforms.includes("copilot")) add(source, `.github/skills/${suffix}`, "platform");
      }
    }
    if (section === "prompts") {
      for (const source of files) {
        const suffix = suffixAfter(source, "prompts/");
        if (platforms.includes("copilot")) add(source, `.github/prompts/${suffix}`, "platform");
        if (platforms.includes("gemini")) add(source, `.gemini/commands/${suffix}`, "platform");
      }
    }
  }
  const roots = {
    codex: ["CODEX.md", "CODEX.md"],
    claude: ["CLAUDE.md", "CLAUDE.md"],
    gemini: ["GEMINI.md", "GEMINI.md"],
    copilot: ["platforms/github-copilot/copilot-instructions.md", ".github/copilot-instructions.md"],
  };
  for (const platform of platforms) {
    const pair = roots[platform];
    if (pair) add(pair[0], pair[1], "instruction");
  }
  return mappings;
}

function readRecord(target) {
  const file = path.join(target, ".apt", "installation.json");
  if (!exists(file)) return null;
  const record = JSON.parse(readFileSync(file, "utf8"));
  validateRecord(record);
  return record;
}

function validateRecord(record) {
  if (!record || record.schemaVersion !== 1) throw new Error("Unsupported .apt/installation.json schemaVersion");
  if (record.source?.repository !== "apt-principles-agents" || !record.source.version || !record.source.commit) throw new Error("Installation source metadata is incomplete");
  if (!Array.isArray(record.manifests) || !Array.isArray(record.platforms) || !Array.isArray(record.managedFiles)) throw new Error("Installation arrays are incomplete");
  if (!record.localContext || !record.lastOperation?.type || !record.lastOperation?.at) throw new Error("Installation ownership or operation metadata is incomplete");
  const targets = new Set();
  for (const item of record.managedFiles) {
    if (!item.source || !item.target || !item.kind || !/^[a-f0-9]{64}$/.test(item.sha256 || "")) throw new Error("Installation managed-file entry is invalid");
    if (path.isAbsolute(item.source) || path.isAbsolute(item.target) || normalize(item.source).split("/").includes("..") || normalize(item.target).split("/").includes("..")) throw new Error("Installation managed-file path is unsafe");
    if (targets.has(item.target)) throw new Error(`Duplicate managed target: ${item.target}`);
    targets.add(item.target);
  }
  return record;
}

function writeRecord(target, record) {
  const file = path.join(target, ".apt", "installation.json");
  ensureParent(file);
  writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`, "utf8");
}

function backup(target, relative, backupRoot) {
  const source = path.join(target, relative);
  if (!exists(source)) return null;
  const destination = path.join(backupRoot, relative);
  ensureParent(destination);
  copyFileSync(source, destination);
  return normalize(path.relative(target, destination));
}

function install(options = {}) {
  const target = path.resolve(options.target || args.target || "");
  if (!target || !exists(target)) throw new Error("--target must be an existing repository path");
  const manifestNames = options.manifests || String(args.manifests || args.manifest || "core").split(",").map((item) => item.trim()).filter(Boolean);
  const platforms = options.platforms || String(args.platforms || "codex,claude,copilot,gemini").split(",").map((item) => item.trim()).filter(Boolean);
  const dryRun = options.dryRun ?? Boolean(args["dry-run"]);
  const force = options.force ?? Boolean(args.force);
  const manifests = resolveManifests(manifestNames);
  const mappings = mappingsFor(manifests, platforms);
  const old = readRecord(target);
  const backupRoot = path.join(target, ".apt-backups", timestamp());
  const managed = new Map((old?.managedFiles || []).map((item) => [item.target, item]));
  const actions = [];
  for (const mapping of mappings) {
    const source = path.join(sourceRoot, mapping.source);
    const destination = path.join(target, mapping.target);
    const sourceHash = sha256(source);
    if (exists(destination)) {
      const targetHash = sha256(destination);
      if (targetHash === sourceHash) {
        managed.set(mapping.target, { ...mapping, sha256: sourceHash });
        actions.push({ action: "unchanged", ...mapping });
        continue;
      }
      if (!force) {
        actions.push({ action: "skipped-local", ...mapping });
        continue;
      }
      if (!dryRun) backup(target, mapping.target, backupRoot);
    }
    actions.push({ action: dryRun ? "would-install" : "installed", ...mapping });
    if (!dryRun) {
      ensureParent(destination);
      copyFileSync(source, destination);
      managed.set(mapping.target, { ...mapping, sha256: sourceHash });
    }
  }
  if (!dryRun) {
    writeRecord(target, {
      schemaVersion: 1,
      source: {
        repository: "apt-principles-agents",
        version: packageJson.version,
        commit: gitCommit(),
      },
      manifests: [...new Set([...(old?.manifests || []), ...manifests.map((item) => item.name)])],
      platforms: [...new Set([...(old?.platforms || []), ...platforms])],
      managedFiles: [...managed.values()].sort((a, b) => a.target.localeCompare(b.target)),
      localContext: old?.localContext || "docs/project-context.md",
      lastOperation: { type: "install", at: new Date().toISOString() },
    });
  }
  return { target, dryRun, force, manifests: manifests.map((item) => item.name), platforms, actions };
}

function scanTarget(target) {
  const record = readRecord(target);
  if (!record) return { target, status: "not-installed", files: [] };
  const files = record.managedFiles.map((item) => {
    const source = path.join(sourceRoot, item.source);
    const destination = path.join(target, item.target);
    if (!exists(source)) return { ...item, status: "missing-source" };
    if (!exists(destination)) return { ...item, status: "missing-target" };
    const sourceHash = sha256(source);
    const targetHash = sha256(destination);
    return { ...item, status: sourceHash === targetHash ? "current" : "drifted", sourceHash, targetHash };
  });
  const provenanceCurrent = record.source.version === packageJson.version && record.source.commit === gitCommit();
  return {
    target,
    status: files.every((item) => item.status === "current") && provenanceCurrent ? "current" : "drifted",
    provenanceCurrent,
    counts: files.reduce((result, item) => ({ ...result, [item.status]: (result[item.status] || 0) + 1 }), {}),
    files,
  };
}

function syncOrRepair(type) {
  const target = path.resolve(args.target || "");
  if (!target || !exists(target)) throw new Error("--target must be an existing repository path");
  const record = readRecord(target);
  if (!record) throw new Error("No .apt/installation.json found");
  const desiredMappings = mappingsFor(resolveManifests(record.manifests), record.platforms);
  const desiredTargets = new Set(desiredMappings.map((item) => item.target));
  const previous = new Map(record.managedFiles.map((item) => [item.target, item]));
  const apply = Boolean(args.apply);
  const force = Boolean(args.force);
  const backupRoot = path.join(target, ".apt-backups", timestamp());
  const actions = [];
  const retained = [];
  const skippedDesiredTargets = new Set();
  for (const item of record.managedFiles.filter((entry) => !desiredTargets.has(entry.target))) {
    const destination = path.join(target, item.target);
    const drifted = exists(destination) && sha256(destination) !== item.sha256;
    if (drifted && !force) {
      actions.push({ action: "skipped-retired-local-drift", target: item.target });
      retained.push(item);
      continue;
    }
    actions.push({ action: apply ? "removed-retired" : "would-remove-retired", target: item.target });
    if (apply && exists(destination)) {
      if (drifted) backup(target, item.target, backupRoot);
      rmSync(destination, { force: true });
    }
  }
  const nextManaged = [];
  for (const mapping of desiredMappings) {
    const source = path.join(sourceRoot, mapping.source);
    const destination = path.join(target, mapping.target);
    const old = previous.get(mapping.target);
    const sourceHash = sha256(source);
    const item = { ...mapping, sha256: old?.sha256 || sourceHash };
    item.status = !exists(destination) ? "missing-target" : sha256(destination) === sourceHash ? "current" : "drifted";
    if (item.status === "current") continue;
    if (item.status === "drifted" && !force) {
      actions.push({ action: "skipped-local-drift", target: item.target });
      skippedDesiredTargets.add(item.target);
      if (old) nextManaged.push(old);
      continue;
    }
    actions.push({ action: apply ? "updated" : "would-update", target: item.target });
    if (apply) {
      if (exists(path.join(target, item.target))) backup(target, item.target, backupRoot);
      const source = path.join(sourceRoot, item.source);
      const destination = path.join(target, item.target);
      ensureParent(destination);
      copyFileSync(source, destination);
      item.sha256 = sha256(source);
    }
    nextManaged.push(item);
  }
  for (const mapping of desiredMappings) {
    if (nextManaged.some((item) => item.target === mapping.target)) continue;
    if (skippedDesiredTargets.has(mapping.target)) continue;
    nextManaged.push({ ...mapping, sha256: sha256(path.join(sourceRoot, mapping.source)) });
  }
  if (apply) {
    record.managedFiles = [...retained, ...nextManaged].map(({ status, ...item }) => item).sort((a, b) => a.target.localeCompare(b.target));
    record.lastOperation = { type, at: new Date().toISOString() };
    record.source = { repository: "apt-principles-agents", version: packageJson.version, commit: gitCommit() };
    writeRecord(target, record);
  }
  return { target, type, apply, force, actions };
}

function uninstall() {
  const target = path.resolve(args.target || "");
  if (!target || !exists(target)) throw new Error("--target must be an existing repository path");
  const record = readRecord(target);
  if (!record) throw new Error("No .apt/installation.json found");
  const apply = Boolean(args.apply);
  const force = Boolean(args.force);
  const backupRoot = path.join(target, ".apt-backups", timestamp());
  const actions = [];
  for (const item of record.managedFiles) {
    const destination = path.join(target, item.target);
    if (!exists(destination)) continue;
    const drifted = sha256(destination) !== item.sha256;
    if (drifted && !force) {
      actions.push({ action: "skipped-local-drift", target: item.target });
      continue;
    }
    actions.push({ action: apply ? "removed" : "would-remove", target: item.target });
    if (apply) {
      if (drifted) backup(target, item.target, backupRoot);
      rmSync(destination, { force: true });
    }
  }
  if (apply && !actions.some((item) => item.action === "skipped-local-drift")) {
    rmSync(path.join(target, ".apt", "installation.json"), { force: true });
  }
  return { target, apply, force, actions };
}

function detect() {
  const target = path.resolve(args.target || "");
  if (!target || !exists(target)) throw new Error("--target must be an existing repository path");
  const files = new Set();
  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if ([".git", "node_modules", "dist", "build", "public"].includes(entry.name)) continue;
      const child = path.join(directory, entry.name);
      if (entry.isDirectory()) walk(child);
      else files.add(normalize(path.relative(target, child)).toLowerCase());
    }
  }
  walk(target);
  const text = [...files].join("\n");
  const recommendations = new Set(["core"]);
  const reasons = [];
  const add = (manifest, reason) => { recommendations.add(manifest); reasons.push({ manifest, reason }); };
  if (/wrangler|cloudflare|worker/.test(text)) add("cloudflare", "Cloudflare/Worker files detected");
  if (/openapi|routes|api/.test(text)) add("api-review", "API routes or contracts detected");
  if (/react|tsx|vite/.test(text)) add("ux-review", "Frontend application detected");
  if (/docs|content|markdown/.test(text)) add("documentation", "Documentation/content files detected");
  if (/payment|checkout|authorize|cybersource/.test(text)) add("payments", "Payment or checkout signals detected");
  if (/ollama|prompt|agents|\\.codex|\\.claude/.test(text)) add("ai-development", "AI/agent signals detected");
  if (/health|fitness|training/.test(text)) add("health", "Health or training signals detected");
  if (/lovable/.test(text)) add("lovable", "Lovable-generated project signals detected");
  return { target, manifests: [...recommendations], reasons };
}

function auditWorkspace() {
  const workspaceRoot = path.resolve(args["workspace-root"] || args.target || path.join(sourceRoot, ".."));
  const registryPath = path.join(sourceRoot, "references", "workspace-consumers.json");
  const registry = JSON.parse(readFileSync(registryPath, "utf8"));
  const canonicalRepository = path.basename(sourceRoot);
  const registeredNames = new Set(registry.consumers.map((consumer) => consumer.repository));
  const activeRepositories = readdirSync(workspaceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) => name !== canonicalRepository)
    .filter((name) => exists(path.join(workspaceRoot, name, ".git")) && exists(path.join(workspaceRoot, name, "README.md")))
    .sort((a, b) => a.localeCompare(b));
  const activeNames = new Set(activeRepositories);
  const activeInstalled = activeRepositories.filter((repository) => exists(path.join(workspaceRoot, repository, ".apt", "installation.json")));
  const installedUnregistered = activeInstalled.filter((repository) => !registeredNames.has(repository));
  const activeUninstalled = activeRepositories.filter((repository) => !registeredNames.has(repository) && !exists(path.join(workspaceRoot, repository, ".apt", "installation.json")));
  const missingRegistered = registry.consumers
    .filter((consumer) => !exists(path.join(workspaceRoot, consumer.repository)))
    .map((consumer) => consumer.repository);
  const repositories = registry.consumers.map((consumer) => {
      const target = path.join(workspaceRoot, consumer.repository);
      const targetExists = exists(target);
      const active = activeNames.has(consumer.repository);
      const legacy = targetExists && exists(path.join(target, ".agent-standards.json"));
      const scan = targetExists ? scanTarget(target) : { status: "missing-repository", counts: {}, provenanceCurrent: false };
      const record = targetExists ? readRecord(target) : null;
      const manifestsMatch = record ? consumer.manifests.every((item) => record.manifests.includes(item)) : false;
      const platformsMatch = record ? consumer.platforms.every((item) => record.platforms.includes(item)) : false;
      const missingProjectContext = targetExists && !exists(path.join(target, "docs", "project-context.md"));
      const missingAgents = targetExists && !exists(path.join(target, "AGENTS.md"));
      return {
        repository: consumer.repository,
        registered: true,
        active,
        legacyManifest: legacy,
        installation: scan.status,
        provenanceCurrent: Boolean(scan.provenanceCurrent),
        manifestsMatch,
        platformsMatch,
        missingProjectContext,
        missingAgents,
        counts: scan.counts || {},
      };
    });
  const status = repositories.every((item) => (
    item.active
    && !item.legacyManifest
    && item.installation === "current"
    && item.provenanceCurrent
    && item.manifestsMatch
    && item.platformsMatch
    && !item.missingProjectContext
    && !item.missingAgents
  )) && missingRegistered.length === 0 && installedUnregistered.length === 0 && activeUninstalled.length === 0 ? "passed" : "failed";
  return {
    workspaceRoot,
    status,
    registeredConsumers: registry.consumers.map((consumer) => consumer.repository),
    missingRegistered,
    installedUnregistered,
    activeUninstalled,
    activeRepositories,
    repositories,
  };
}

function migrateLegacy() {
  const target = path.resolve(args.target || "");
  const legacyPath = path.join(target, ".agent-standards.json");
  if (!exists(legacyPath)) throw new Error("No .agent-standards.json found");
  const legacy = JSON.parse(readFileSync(legacyPath, "utf8"));
  const aliases = { "apt-core": "core" };
  const manifests = [...new Set((legacy.profiles || []).map((item) => aliases[item] || item))];
  const result = install({ target, manifests, platforms: String(args.platforms || "codex,claude,copilot,gemini").split(","), force: true, dryRun: !args.apply });
  if (args.apply) {
    const backupRoot = path.join(target, ".apt-backups", timestamp());
    backup(target, ".agent-standards.json", backupRoot);
    rmSync(legacyPath, { force: true });
    const record = readRecord(target);
    record.lastOperation = { type: "migrate-legacy", at: new Date().toISOString(), legacyProfiles: legacy.profiles || [] };
    writeRecord(target, record);
  }
  return { ...result, legacyProfiles: legacy.profiles || [], apply: Boolean(args.apply) };
}

function checkParity() {
  const issues = [];
  const manifestFiles = readdirSync(path.join(sourceRoot, "manifests")).filter((file) => file.endsWith(".yaml"));
  for (const file of manifestFiles) {
    try {
      selectedFiles(resolveManifests([path.basename(file, ".yaml")]));
    } catch (error) {
      issues.push(error.message);
    }
  }
  const skillRoot = path.join(sourceRoot, "skills");
  function walkSkills(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const child = path.join(directory, entry.name);
      if (entry.isDirectory()) walkSkills(child);
      else if (entry.name === "SKILL.md") {
        const text = readFileSync(child, "utf8");
        if (!/^---\r?\n[\s\S]*?\bname:/m.test(text) || !text.includes("## Purpose")) {
          issues.push(`Invalid skill contract: ${normalize(path.relative(sourceRoot, child))}`);
        }
      }
    }
  }
  walkSkills(skillRoot);
  return { manifests: manifestFiles.length, issues, status: issues.length ? "failed" : "passed" };
}

function output(value) {
  if (args.summary && Array.isArray(value.actions)) {
    const actionCounts = value.actions.reduce((result, item) => {
      result[item.action] = (result[item.action] || 0) + 1;
      return result;
    }, {});
    console.log(JSON.stringify({
      target: value.target,
      manifests: value.manifests,
      platforms: value.platforms,
      apply: value.apply,
      dryRun: value.dryRun,
      actionCounts,
    }, null, 2));
    return;
  }
  console.log(JSON.stringify(value, null, 2));
  if (value.status === "failed" || value.issues?.length || (args.check && value.status !== "current" && value.status !== "passed")) process.exitCode = 1;
}

try {
  if (command === "install") output(install());
  else if (command === "scan") output(scanTarget(path.resolve(args.target || "")));
  else if (command === "sync") output(syncOrRepair("sync"));
  else if (command === "repair") output(syncOrRepair("repair"));
  else if (command === "uninstall") output(uninstall());
  else if (command === "detect") output(detect());
  else if (command === "audit-workspace") output(auditWorkspace());
  else if (command === "migrate-legacy") output(migrateLegacy());
  else if (command === "check-parity") output(checkParity());
  else {
    console.log(`Usage: node scripts/apt-assets.mjs <command> [options]

Commands:
  detect --target <repo>
  install --target <repo> --manifests core,documentation [--platforms codex,claude,copilot,gemini] [--dry-run] [--force]
  scan --target <repo>
  sync --target <repo> [--apply] [--force]
  repair --target <repo> [--apply] [--force]
  uninstall --target <repo> [--apply] [--force]
  migrate-legacy --target <repo> [--apply]
  audit-workspace --workspace-root <path>
  check-parity`);
  }
} catch (error) {
  console.error(error.stack || error.message);
  process.exit(1);
}
