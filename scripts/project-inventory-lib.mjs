import fs from "node:fs";
import path from "node:path";

export const PROFILE_RELATIVE_PATH = path.join("docs", "apt", "references", "project-profile.json");
export const CONTEXT_RELATIVE_PATH = path.join("docs", "project-context.md");

const COMMAND_CATEGORIES = new Set([
  "setup", "run", "build", "validate", "test", "generate", "distribute", "deploy", "audit", "maintenance",
]);
const COMMAND_APPLICABILITY = new Set(["applicable", "not-applicable"]);
const REPOSITORY_TYPES = new Set([
  "documentation-asset-toolkit", "application", "service", "library", "monorepo", "static-site", "workspace-tool", "other",
]);
const STRUCTURE_AUTHORITIES = new Set(["canonical", "operational", "adapter", "supporting", "generated", "archived", "local"]);
const STRUCTURE_MAINTENANCE = new Set(["authored", "generated", "mixed", "tool-managed"]);
const EXCLUDED_WORKSPACE_DIRECTORIES = new Set([
  "node_modules", "graphify-out", "dist", "build", "coverage", "tmp", ".tmp", ".git", ".agents", ".codex", ".claude", ".pnpm-store",
]);

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function requireString(errors, value, field) {
  if (!isNonEmptyString(value)) errors.push(`${field} must be a non-empty string`);
}

function requireStringArray(errors, value, field, allowEmpty = false) {
  if (!Array.isArray(value) || (!allowEmpty && value.length === 0) || value.some((item) => !isNonEmptyString(item))) {
    errors.push(`${field} must be ${allowEmpty ? "an" : "a non-empty"} array of strings`);
  }
}

export function validateProjectProfile(schema, profile) {
  const errors = [];
  const missing = (schema.required ?? []).filter((key) => !(key in profile));
  if (missing.length) errors.push(`Missing required keys: ${missing.join(", ")}`);

  if (schema.properties?.adoption_mode?.enum && !schema.properties.adoption_mode.enum.includes(profile.adoption_mode)) {
    errors.push(`Invalid adoption_mode: ${profile.adoption_mode}`);
  }
  if (profile.maturity && schema.properties?.maturity?.enum && !schema.properties.maturity.enum.includes(profile.maturity)) {
    errors.push(`Invalid maturity: ${profile.maturity}`);
  }
  if ("showcase" in profile) {
    const showcase = profile.showcase;
    if (typeof showcase !== "object" || showcase === null || typeof showcase.include !== "boolean" || typeof showcase.summary !== "string") {
      errors.push("Invalid showcase object: expected { include: boolean, summary: string }");
    }
  }

  if (profile.inventory_version === undefined) return errors;
  if (profile.inventory_version !== 2) {
    errors.push(`Unsupported inventory_version: ${profile.inventory_version}`);
    return errors;
  }

  const v2Required = [
    "description", "repository_type", "ownership", "architecture", "runtime", "commands", "structure", "integrations",
    "source_boundaries", "constraints", "evidence", "last_verified",
  ];
  const missingV2 = v2Required.filter((key) => !(key in profile));
  if (missingV2.length) errors.push(`Missing inventory v2 keys: ${missingV2.join(", ")}`);

  requireString(errors, profile.description, "description");
  if (!REPOSITORY_TYPES.has(profile.repository_type)) errors.push(`Invalid repository_type: ${profile.repository_type}`);
  requireString(errors, profile.ownership?.owner, "ownership.owner");
  requireString(errors, profile.ownership?.profile_maintainer, "ownership.profile_maintainer");
  requireString(errors, profile.architecture?.summary, "architecture.summary");
  requireStringArray(errors, profile.architecture?.components, "architecture.components");
  requireString(errors, profile.architecture?.runtime_model, "architecture.runtime_model");
  requireString(errors, profile.architecture?.deployment_model, "architecture.deployment_model");
  requireString(errors, profile.runtime?.summary, "runtime.summary");
  requireString(errors, profile.runtime?.package_manager, "runtime.package_manager");
  requireString(errors, profile.runtime?.local_server, "runtime.local_server");
  requireString(errors, profile.runtime?.build, "runtime.build");
  requireString(errors, profile.runtime?.deployment, "runtime.deployment");

  if (!Array.isArray(profile.runtime?.requirements) || profile.runtime.requirements.length === 0) {
    errors.push("runtime.requirements must be a non-empty array");
  } else {
    profile.runtime.requirements.forEach((requirement, index) => {
      for (const field of ["name", "declared", "recommended", "verified_by"]) {
        requireString(errors, requirement?.[field], `runtime.requirements[${index}].${field}`);
      }
    });
  }

  if (!Array.isArray(profile.commands) || profile.commands.length === 0) {
    errors.push("commands must be a non-empty array");
  } else {
    const names = new Set();
    profile.commands.forEach((command, index) => {
      requireString(errors, command?.name, `commands[${index}].name`);
      if (names.has(command?.name)) errors.push(`Duplicate command name: ${command.name}`);
      names.add(command?.name);
      if (!COMMAND_CATEGORIES.has(command?.category)) errors.push(`Invalid command category: ${command?.category}`);
      if (typeof command?.command !== "string") errors.push(`commands[${index}].command must be a string`);
      requireString(errors, command?.purpose, `commands[${index}].purpose`);
      if (typeof command?.mutates !== "boolean") errors.push(`commands[${index}].mutates must be a boolean`);
      if (!COMMAND_APPLICABILITY.has(command?.applicability)) errors.push(`Invalid command applicability: ${command?.applicability}`);
    });
  }

  if (!Array.isArray(profile.structure) || profile.structure.length === 0) {
    errors.push("structure must be a non-empty array");
  } else {
    const paths = new Set();
    profile.structure.forEach((entry, index) => {
      requireString(errors, entry?.path, `structure[${index}].path`);
      const normalizedPath = entry?.path?.replaceAll("\\", "/").replace(/\/$/, "");
      if (paths.has(normalizedPath)) errors.push(`Duplicate structure path: ${entry.path}`);
      paths.add(normalizedPath);
      requireString(errors, entry?.purpose, `structure[${index}].purpose`);
      if (!STRUCTURE_AUTHORITIES.has(entry?.authority)) errors.push(`Invalid structure authority: ${entry?.authority}`);
      if (!STRUCTURE_MAINTENANCE.has(entry?.maintenance)) errors.push(`Invalid structure maintenance: ${entry?.maintenance}`);
    });
  }

  requireStringArray(errors, profile.integrations, "integrations", true);
  requireStringArray(errors, profile.constraints, "constraints", true);
  for (const boundary of ["canonical", "generated", "archived"]) {
    requireStringArray(errors, profile.source_boundaries?.[boundary], `source_boundaries.${boundary}`, true);
  }
  if (!Array.isArray(profile.evidence) || profile.evidence.length === 0) {
    errors.push("evidence must be a non-empty array");
  } else {
    profile.evidence.forEach((entry, index) => {
      requireString(errors, entry?.path, `evidence[${index}].path`);
      requireString(errors, entry?.supports, `evidence[${index}].supports`);
    });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(profile.last_verified ?? "")) errors.push("last_verified must use YYYY-MM-DD");

  return errors;
}

function escapeCell(value) {
  return String(value).replaceAll("|", "\\|").replace(/\s+/g, " ").trim();
}

function bullets(items) {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None recorded.";
}

export function renderProjectContext(profile) {
  const requirements = profile.runtime.requirements
    .map((item) => `| ${escapeCell(item.name)} | ${escapeCell(item.declared)} | ${escapeCell(item.recommended)} | \`${escapeCell(item.verified_by)}\` |`)
    .join("\n");
  const commands = profile.commands
    .map((item) => `| ${escapeCell(item.name)} | ${item.category} | ${item.command ? `\`${escapeCell(item.command)}\`` : "Not applicable"} | ${escapeCell(item.purpose)} | ${item.mutates ? "Yes" : "No"} |`)
    .join("\n");
  const structure = profile.structure
    .map((item) => `| \`${escapeCell(item.path)}\` | ${escapeCell(item.purpose)} | ${item.authority} | ${item.maintenance} |`)
    .join("\n");
  const evidence = profile.evidence.map((item) => `- \`${item.path}\` — ${item.supports}`).join("\n");

  return `---
title: ${profile.project} Project Context
kind: project-context
domain: governance
status: active
owner: ${profile.ownership.owner}
last_updated: ${profile.last_verified}
source: generated
source_paths: ["${profile.project}/docs/apt/references/project-profile.json"]
---

# Project Context

> Generated from \`docs/apt/references/project-profile.json\`. Do not edit this file directly; update the JSON profile and run \`npm run inventory:generate\`.

## Purpose

${profile.purpose}

${profile.description}

- Repository type: \`${profile.repository_type}\`
- Maturity: \`${profile.maturity}\`
- Owner: ${profile.ownership.owner}
- Profile maintainer: ${profile.ownership.profile_maintainer}
- Primary audiences: ${profile.audience.join(", ")}

## Architecture

${profile.architecture.summary}

${bullets(profile.architecture.components)}

- Runtime model: ${profile.architecture.runtime_model}
- Deployment model: ${profile.architecture.deployment_model}

## Structure

| Path | Purpose | Authority | Maintenance |
|---|---|---|---|
${structure}

## Build and Run

${profile.runtime.summary}

- Package manager: ${profile.runtime.package_manager}
- Local server: ${profile.runtime.local_server}
- Build: ${profile.runtime.build}
- Deployment: ${profile.runtime.deployment}

### Runtime Evidence

| Requirement | Declared | Recommended or observed | Evidence |
|---|---|---|---|
${requirements}

### Command Matrix

| Name | Category | Command | Purpose | Mutates files or targets |
|---|---|---|---|---|
${commands}

## Validation

Use \`npm run check\` as the repository completion gate. Individual validation and test commands are listed in the command matrix above.

## Distribution

${profile.architecture.deployment_model}

### Integrations

${bullets(profile.integrations)}

## Source Boundaries

### Canonical

${bullets(profile.source_boundaries.canonical)}

### Generated

${bullets(profile.source_boundaries.generated)}

### Archived

${bullets(profile.source_boundaries.archived)}

## Constraints

${bullets(profile.constraints)}

## Evidence

${evidence}
`;
}

export function loadProfile(repoRoot) {
  const profilePath = path.join(repoRoot, PROFILE_RELATIVE_PATH);
  if (!fs.existsSync(profilePath)) return { profilePath, profile: null };
  try {
    return { profilePath, profile: JSON.parse(fs.readFileSync(profilePath, "utf8")) };
  } catch (error) {
    return { profilePath, profile: null, error: error.message };
  }
}

export function discoverWorkspaceProjects(workspaceRoot) {
  return fs.readdirSync(workspaceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .filter((entry) => !entry.name.startsWith(".") && !EXCLUDED_WORKSPACE_DIRECTORIES.has(entry.name))
    .filter((entry) => {
      const root = path.join(workspaceRoot, entry.name);
      return fs.existsSync(path.join(root, "README.md")) || fs.existsSync(path.join(root, "package.json")) || fs.existsSync(path.join(root, ".git"));
    })
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

export function inventoryStatus(schema, profile) {
  if (!profile) return "pending inventory";
  if (profile.inventory_version !== 2) return "legacy profile";
  return validateProjectProfile(schema, profile).length ? "invalid v2 profile" : "verified";
}

export function renderWorkspaceInventory({ workspaceRoot, schema, projectNames }) {
  const rows = [];
  const verified = [];
  let lastVerified = "unknown";

  for (const name of projectNames) {
    const repoRoot = path.join(workspaceRoot, name);
    const { profile } = loadProfile(repoRoot);
    const status = inventoryStatus(schema, profile);
    if (status === "verified") {
      if (lastVerified === "unknown" || profile.last_verified > lastVerified) lastVerified = profile.last_verified;
      rows.push(`| \`${name}\` | verified | ${escapeCell(profile.purpose)} | ${escapeCell(profile.architecture.summary)} | [profile](${name}/docs/apt/references/project-profile.json) |`);
      verified.push(profile);
    } else {
      rows.push(`| \`${name}\` | ${status} | Not yet verified in this inventory. | Not yet verified in this inventory. | ${profile ? `[legacy profile](${name}/docs/apt/references/project-profile.json)` : "—"} |`);
    }
  }

  const detail = verified.map((profile) => {
    const applicable = profile.commands.filter((item) => item.applicability === "applicable");
    const commandRows = applicable.map((item) => `| ${item.category} | \`${escapeCell(item.command)}\` | ${escapeCell(item.purpose)} |`).join("\n");
    return `### ${profile.project}

${profile.purpose}

- Architecture: ${profile.architecture.summary}
- Runtime: ${profile.runtime.summary}
- Context: [generated project context](${profile.project}/docs/project-context.md)
- Source profile: [project-profile.json](${profile.project}/docs/apt/references/project-profile.json)

| Category | Command | Purpose |
|---|---|---|
${commandRows}`;
  }).join("\n\n");

  return `---
title: APT Workspace Project Inventory
version: v1
status: current
audience: humans-and-ai-agents
visibility: internal
source: generated
last_updated: ${lastVerified}
---

# APT Workspace Project Inventory

> Generated from child-repository project profiles by \`apt-principles-agents/scripts/generate-project-inventory.mjs\`. Do not add unverified project descriptions here.

## Coverage

- Workspace: \`${workspaceRoot.replaceAll("\\", "/")}\`
- Projects discovered: ${projectNames.length}
- Verified version-2 profiles: ${verified.length}
- Last verified profile date: ${lastVerified}

| Project | Inventory status | Verified purpose | Verified architecture | Profile |
|---|---|---|---|---|
${rows.join("\n")}

## Verified Projects

${detail || "No version-2 project inventories have been verified."}

## Status Meanings

- **verified** — version-2 profile passed the current validator.
- **legacy profile** — a profile exists but has not been migrated to the version-2 inventory contract.
- **pending inventory** — no structured profile exists; purpose and architecture are intentionally not inferred.
- **invalid v2 profile** — a version-2 profile exists but fails current validation.
`;
}

export function writeOrCheck(filePath, content, check) {
  if (check) {
    const current = fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : null;
    if (current !== content) throw new Error(`Generated inventory is stale: ${filePath}`);
    return "checked";
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
  return "written";
}
