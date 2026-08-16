import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baselinePath = path.join(root, "references", "content-specialization-baseline.json");

function normalize(value) {
  return value.split(path.sep).join("/");
}

function walk(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

function body(text) {
  return text.replace(/^---[\s\S]*?---\s*/, "").replace(/\r/g, "").trim();
}

function section(text, heading) {
  const start = text.indexOf(heading);
  if (start < 0) return "";
  const remainder = text.slice(start + heading.length);
  const next = remainder.search(/\n## /);
  return (next < 0 ? remainder : remainder.slice(0, next)).trim();
}

function bulletCount(text, heading) {
  return section(text, heading).split(/\r?\n/).filter((line) => line.trim().startsWith("- ")).length;
}

function topicSpecificBulletCount(text, heading) {
  return section(text, heading)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .filter((line) => !line.startsWith("- Treat **"))
    .filter((line) => !line.startsWith("- Required evidence:"))
    .filter((line) => !line.startsWith("- State what is verified"))
    .length;
}

function digest(paths) {
  return createHash("sha256").update(paths.join("\n")).digest("hex");
}

const families = {
  skills: walk(path.join(root, "skills")).filter((file) => file.endsWith("SKILL.md")),
  agents: walk(path.join(root, "agents")).filter((file) => file.endsWith(".md") && !file.endsWith("README.md")),
  principles: walk(path.join(root, "principles")).filter((file) => file.endsWith(".md") && !file.endsWith("README.md")),
  prompts: walk(path.join(root, "prompts")).filter((file) => file.endsWith(".md") && !file.endsWith("README.md")),
};

const records = Object.fromEntries(Object.entries(families).map(([name, files]) => [name, files.map((file) => ({
  path: normalize(path.relative(root, file)),
  text: readFileSync(file, "utf8"),
}))]));

const sharedCore = {
  skills: records.skills.filter(({ text }) => text.includes("1. Restate the intended outcome and affected audiences.")),
  agents: records.agents.filter(({ text }) => text.includes("- Establish scope, facts, assumptions, and affected audiences.")),
  principles: records.principles.filter(({ text }) => text.includes("- Begin with the intended outcome and affected audiences.")),
  prompts: records.prompts.filter(({ text }) => text.includes("1. State the goal, audiences, scope, and success criteria.")),
};

const thin = {
  skills: sharedCore.skills.filter(({ text }) => topicSpecificBulletCount(text, "## Domain Checklist") === 0).map(({ path: value }) => value).sort(),
  agents: sharedCore.agents.filter(({ text }) => bulletCount(text, "## Perspective-Specific Checks") < 3).map(({ path: value }) => value).sort(),
  principles: sharedCore.principles.filter(({ text }) => topicSpecificBulletCount(text, "## Topic-Specific Guidance") === 0).map(({ path: value }) => value).sort(),
  prompts: sharedCore.prompts.filter(({ text }) => bulletCount(text, "## Task-Specific Requirements") < 3).map(({ path: value }) => value).sort(),
};

const bodyGroups = new Map();
for (const item of Object.values(records).flat()) {
  const hash = createHash("sha256").update(body(item.text).replace(/[ \t]+/g, " ")).digest("hex");
  const group = bodyGroups.get(hash) || [];
  group.push(item.path);
  bodyGroups.set(hash, group);
}
const exactDuplicateGroups = [...bodyGroups.values()].filter((group) => group.length > 1);

const snapshot = {
  files: Object.fromEntries(Object.entries(records).map(([name, items]) => [name, items.length])),
  sharedCore: Object.fromEntries(Object.entries(sharedCore).map(([name, items]) => [name, items.length])),
  thinSpecialization: Object.fromEntries(Object.entries(thin).map(([name, paths]) => [name, { count: paths.length, sha256: digest(paths) }])),
  exactDuplicateBodyGroups: exactDuplicateGroups.length,
};

if (process.argv.includes("--print-baseline")) {
  console.log(JSON.stringify({ schemaVersion: 1, ...snapshot }, null, 2));
  process.exit(0);
}

if (process.argv.includes("--list-thin")) {
  for (const [family, paths] of Object.entries(thin)) {
    console.log(`${family} (${paths.length})`);
    for (const value of paths) console.log(`- ${value}`);
  }
  process.exit(0);
}

if (!existsSync(baselinePath)) {
  console.error(`Missing specialization baseline: ${normalize(path.relative(root, baselinePath))}`);
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
const errors = [];
for (const family of Object.keys(thin)) {
  const expected = baseline.thinSpecialization?.[family];
  const actual = snapshot.thinSpecialization[family];
  if (!expected || expected.count !== actual.count || expected.sha256 !== actual.sha256) {
    errors.push(`${family} thin-specialization baseline changed: expected ${expected?.count ?? "missing"}/${expected?.sha256 ?? "missing"}, received ${actual.count}/${actual.sha256}`);
  }
}
if (snapshot.exactDuplicateBodyGroups > baseline.exactDuplicateBodyGroups) {
  errors.push(`Exact duplicate body groups increased from ${baseline.exactDuplicateBodyGroups} to ${snapshot.exactDuplicateBodyGroups}`);
}
for (const pilot of baseline.pilots || []) {
  const target = path.join(root, pilot.path);
  if (!existsSync(target)) {
    errors.push(`Specialization pilot is missing: ${pilot.path}`);
    continue;
  }
  const text = readFileSync(target, "utf8");
  if (bulletCount(text, pilot.heading) < pilot.minimumBullets) {
    errors.push(`Specialization pilot needs at least ${pilot.minimumBullets} bullets under ${pilot.heading}: ${pilot.path}`);
  }
}

if (errors.length) {
  console.error("Content specialization validation: FAIL");
  for (const error of errors) console.error(`- ${error}`);
  console.error("Run `node scripts/validate-content-specialization.mjs --print-baseline` only after reviewing intentional specialization changes.");
  process.exit(1);
}

console.log("Content specialization validation: PASS");
for (const family of Object.keys(records)) {
  console.log(`${family}: ${records[family].length} files; ${sharedCore[family].length} shared-core; ${thin[family].length} thin-specialization`);
}
console.log(`Exact duplicate body groups: ${snapshot.exactDuplicateBodyGroups}`);
