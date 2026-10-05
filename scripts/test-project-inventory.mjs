#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  discoverWorkspaceProjects,
  inventoryStatus,
  renderProjectContext,
  renderWorkspaceInventory,
  validateProjectProfile,
  writeOrCheck,
} from "./project-inventory-lib.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const schema = JSON.parse(fs.readFileSync(path.join(repoRoot, "references", "project-profile.schema.json"), "utf8"));

function profile(overrides = {}) {
  return {
    inventory_version: 2,
    project: "example-project",
    purpose: "Verified example purpose.",
    description: "Verified example description.",
    audience: ["maintainers"],
    adoption_mode: "apply",
    principles_demonstrated: ["thinking"],
    repository_type: "application",
    ownership: { owner: "APT", profile_maintainer: "APT maintainers" },
    architecture: {
      summary: "A small example architecture.",
      components: ["One component."],
      runtime_model: "On-demand process.",
      deployment_model: "No deployment."
    },
    runtime: {
      summary: "Run commands on demand.",
      requirements: [{ name: "Node.js", declared: ">=18", recommended: "22", verified_by: "package.json" }],
      package_manager: "npm",
      local_server: "Not applicable.",
      build: "Not applicable.",
      deployment: "Not applicable."
    },
    commands: [{
      name: "Check",
      category: "validate",
      command: "npm test",
      purpose: "Validate behavior.",
      mutates: false,
      applicability: "applicable"
    }],
    structure: [{ path: "src/", purpose: "Source files.", authority: "canonical", maintenance: "authored" }],
    integrations: [],
    source_boundaries: { canonical: ["src/"], generated: [], archived: [] },
    constraints: [],
    evidence: [{ path: "README.md", supports: "Purpose." }],
    last_verified: "2026-08-16",
    maturity: "active",
    showcase: { include: false, summary: "Internal example." },
    ...overrides,
  };
}

assert.deepEqual(validateProjectProfile(schema, profile()), []);

const missingDescription = profile();
delete missingDescription.description;
assert(validateProjectProfile(schema, missingDescription).some((error) => error.includes("description")));

const invalidCategory = profile();
invalidCategory.commands[0].category = "compile";
assert(validateProjectProfile(schema, invalidCategory).includes("Invalid command category: compile"));

const duplicatePath = profile();
duplicatePath.structure.push({ path: "src", purpose: "Duplicate.", authority: "canonical", maintenance: "authored" });
assert(validateProjectProfile(schema, duplicatePath).includes("Duplicate structure path: src"));

const legacy = {
  project: "legacy",
  purpose: "Legacy purpose.",
  audience: ["maintainers"],
  adoption_mode: "apply",
  principles_demonstrated: [],
  maturity: "active",
  showcase: { include: false, summary: "Legacy." },
};
assert.deepEqual(validateProjectProfile(schema, legacy), []);
assert.equal(inventoryStatus(schema, legacy), "legacy profile");

const rendered = renderProjectContext(profile());
assert(rendered.includes("Generated from `docs/apt/references/project-profile.json`"));
assert(rendered.includes("## Build and Run"));
assert(rendered.includes("`npm test`"));

const workspaceRoot = fs.mkdtempSync(path.join(os.tmpdir(), "apt-project-inventory-"));
try {
  const verifiedRoot = path.join(workspaceRoot, "verified-project");
  fs.mkdirSync(path.join(verifiedRoot, "docs", "apt", "references"), { recursive: true });
  fs.writeFileSync(path.join(verifiedRoot, "README.md"), "# Verified\n", "utf8");
  fs.writeFileSync(path.join(verifiedRoot, "docs", "apt", "references", "project-profile.json"), `${JSON.stringify(profile({ project: "verified-project" }), null, 2)}\n`, "utf8");

  const legacyRoot = path.join(workspaceRoot, "legacy-project");
  fs.mkdirSync(path.join(legacyRoot, "docs", "apt", "references"), { recursive: true });
  fs.writeFileSync(path.join(legacyRoot, "package.json"), "{}\n", "utf8");
  fs.writeFileSync(path.join(legacyRoot, "docs", "apt", "references", "project-profile.json"), `${JSON.stringify(legacy, null, 2)}\n`, "utf8");

  const pendingRoot = path.join(workspaceRoot, "pending-project");
  fs.mkdirSync(pendingRoot);
  fs.writeFileSync(path.join(pendingRoot, "README.md"), "# Pending\n", "utf8");

  const parentRepository = path.join(workspaceRoot, "parent-repository");
  fs.mkdirSync(path.join(parentRepository, ".git"), { recursive: true });
  fs.writeFileSync(path.join(parentRepository, ".git", "HEAD"), "ref: refs/heads/main\n", "utf8");
  fs.writeFileSync(path.join(parentRepository, "README.md"), "# Parent repository\n", "utf8");
  const subsystem = path.join(parentRepository, "internal-subsystem");
  fs.mkdirSync(subsystem);
  fs.writeFileSync(path.join(subsystem, "README.md"), "# Internal subsystem\n", "utf8");

  const orphanedGitDirectory = path.join(workspaceRoot, "orphaned-git-directory");
  fs.mkdirSync(path.join(orphanedGitDirectory, ".git"), { recursive: true });

  fs.mkdirSync(path.join(workspaceRoot, ".hidden-project"));
  fs.writeFileSync(path.join(workspaceRoot, ".hidden-project", "README.md"), "# Hidden\n", "utf8");
  fs.mkdirSync(path.join(workspaceRoot, "not-a-project"));

  const projects = discoverWorkspaceProjects(workspaceRoot);
  assert.deepEqual(projects, ["legacy-project", "parent-repository", "pending-project", "verified-project"]);

  const workspace = renderWorkspaceInventory({ workspaceRoot, schema, projectNames: projects });
  assert(workspace.includes("| `verified-project` | verified | Verified example purpose."));
  assert(workspace.includes("| `legacy-project` | legacy profile | Not yet verified"));
  assert(workspace.includes("| `pending-project` | pending inventory | Not yet verified"));
  assert(!workspace.includes(".hidden-project"));

  const generatedPath = path.join(workspaceRoot, "generated.md");
  assert.equal(writeOrCheck(generatedPath, "current\n", false), "written");
  assert.equal(writeOrCheck(generatedPath, "current\n", true), "checked");
  assert.throws(() => writeOrCheck(generatedPath, "changed\n", true), /stale/);
} finally {
  fs.rmSync(workspaceRoot, { recursive: true, force: true });
}

process.stdout.write("Project inventory tests: PASS\n");
