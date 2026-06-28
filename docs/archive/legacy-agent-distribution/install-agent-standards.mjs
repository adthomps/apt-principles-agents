#!/usr/bin/env node
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { detectProfiles } from "./detect-profiles.mjs";
import { toSourcePath, toTargetPath } from "./path-mapping.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseArgs(argv = process.argv.slice(2)) {
  const args = { target: undefined, profiles: [], auto: false, apply: false, dryRun: false, force: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--target") args.target = argv[++index];
    else if (arg === "--profiles") args.profiles = argv[++index].split(",").map((name) => name.trim()).filter(Boolean);
    else if (arg === "--auto") args.auto = true;
    else if (arg === "--apply") args.apply = true;
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

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(repoRoot, relativePath), "utf8"));
}

async function getVersion() {
  const pkg = await readJson("package.json");
  return pkg.version;
}

async function readExistingManifest(target) {
  try {
    return JSON.parse(await readFile(path.join(target, ".agent-standards.json"), "utf8"));
  } catch {
    return undefined;
  }
}

async function resolveProfiles(selected, seen = new Set(), ordered = []) {
  const names = ["apt-core", ...selected.filter((name) => name !== "apt-core")];
  for (const name of names) {
    if (seen.has(name)) continue;
    const profilePath = `profiles/${name}.json`;
    if (!(await exists(path.join(repoRoot, profilePath)))) throw new Error(`Unknown profile: ${name}`);
    const profile = await readJson(profilePath);
    seen.add(name);
    await resolveProfiles(profile.extends || [], seen, ordered);
    ordered.push(profile);
  }
  return ordered;
}

function uniqueFiles(profiles) {
  const seen = new Set();
  const files = [];
  for (const profile of profiles) {
    for (const file of profile.files || []) {
      if (!seen.has(file)) {
        seen.add(file);
        files.push(file);
      }
    }
  }
  return files;
}

function normalizeExistingManagedFiles(existingManifest) {
  const managedFiles = [];
  const managedFileSources = {};
  const existingSources = existingManifest?.managedFileSources || {};

  for (const existingFile of existingManifest?.managedFiles || []) {
    const sourceFile = existingSources[existingFile] || toSourcePath(existingFile);
    const targetFile = toTargetPath(sourceFile);
    if (!managedFiles.includes(targetFile)) managedFiles.push(targetFile);
    managedFileSources[targetFile] = sourceFile;
  }

  return { managedFiles, managedFileSources };
}

async function install(args) {
  if (!args.target) throw new Error("--target <path> is required");
  const target = path.resolve(args.target);
  let selectedProfiles = args.profiles;

  if (args.auto) {
    const detected = await detectProfiles(target);
    selectedProfiles = [...new Set([...selectedProfiles, ...detected.profiles])];
    if (!args.apply) {
      console.log(JSON.stringify({ target, profiles: ["apt-core", ...selectedProfiles], reasons: detected.reasons }, null, 2));
      return;
    }
  }

  const profiles = await resolveProfiles(selectedProfiles);
  const existingManifest = await readExistingManifest(target);
  const profileNames = [...new Set([...(existingManifest?.profiles || []), ...profiles.map((profile) => profile.name)])];
  const files = uniqueFiles(profiles);
  const copied = [];
  const skipped = [];
  const existingManaged = normalizeExistingManagedFiles(existingManifest);
  const managedFileSources = { ...existingManaged.managedFileSources };

  for (const file of files) {
    const targetFile = toTargetPath(file);
    const source = path.join(repoRoot, file);
    const destination = path.join(target, targetFile);
    if (!(await exists(source))) throw new Error(`Profile references missing source file: ${file}`);
    const destinationExists = await exists(destination);
    if (destinationExists && !args.force) {
      skipped.push({ file: targetFile, source: file, reason: "exists" });
      continue;
    }
    copied.push(targetFile);
    managedFileSources[targetFile] = file;
    if (!args.dryRun) {
      await mkdir(path.dirname(destination), { recursive: true });
      await copyFile(source, destination);
    }
  }

  const contextSource = path.join(repoRoot, "standards/project-context.template.md");
  const contextDestination = path.join(target, "docs/project-context.md");
  const createdContext = !(await exists(contextDestination));
  if (createdContext && !args.dryRun) {
    await mkdir(path.dirname(contextDestination), { recursive: true });
    await copyFile(contextSource, contextDestination);
  }

  const manifest = {
    source: repoRoot,
    version: await getVersion(),
    profiles: profileNames,
    installedAt: new Date().toISOString(),
    managedFiles: [...new Set([...existingManaged.managedFiles, ...copied])],
    managedFileSources,
    localContext: "docs/project-context.md"
  };

  if (!args.dryRun) {
    await writeFile(path.join(target, ".agent-standards.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  }

  console.log(JSON.stringify({
    target,
    dryRun: args.dryRun,
    force: args.force,
    profiles: profileNames,
    copied,
    skipped,
    createdContext,
    manifest: ".agent-standards.json"
  }, null, 2));
}

function printHelp() {
  console.log("Usage: node scripts/install-agent-standards.mjs --target <path> [--profiles a,b] [--auto] [--apply] [--dry-run] [--force]");
}

const args = parseArgs();
if (args.help) {
  printHelp();
  process.exit(0);
}

install(args).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
