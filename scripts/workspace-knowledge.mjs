#!/usr/bin/env node
// Usage:
//   node scripts/workspace-knowledge.mjs projects [--check] [--workspace-root ..]   generate or check PROJECTS.md
//   node scripts/workspace-knowledge.mjs audit [--workspace-root ..]                report copies, feeds and identity problems
import path from "node:path";
import { fileURLToPath } from "node:url";
import { auditKnowledge, loadKnowledge, renderProjects } from "./workspace-knowledge-lib.mjs";
import { writeOrCheck } from "./project-inventory-lib.mjs";

const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [command, ...rest] = process.argv.slice(2);
const flag = (name) => rest.includes(name);
const option = (name) => { const index = rest.indexOf(name); return index >= 0 ? rest[index + 1] : undefined; };
const workspaceRoot = path.resolve(option("--workspace-root") ?? path.join(sourceRoot, ".."));
const knowledge = loadKnowledge(sourceRoot);

if (command === "projects") {
  const target = path.join(workspaceRoot, "PROJECTS.md");
  try {
    console.log(`PROJECTS.md ${writeOrCheck(target, renderProjects({ workspaceRoot, knowledge }), flag("--check"))}.`);
  } catch {
    console.error("PROJECTS.md is stale. Run npm run projects:generate in apt-principles-agents.");
    process.exitCode = 1;
  }
} else if (command === "audit") {
  const result = auditKnowledge({ workspaceRoot, knowledge });
  console.log(JSON.stringify(result, null, 2));
  if (result.status !== "passed") process.exitCode = 1;
} else {
  console.error("Usage: node scripts/workspace-knowledge.mjs <projects [--check] | audit> [--workspace-root <path>]");
  process.exitCode = 1;
}
