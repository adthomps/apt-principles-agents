#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PROFILE_RELATIVE_PATH, validateProjectProfile } from "./project-inventory-lib.mjs";

function parseArgs() {
  const out = { repoRoot: process.cwd() };
  const argv = process.argv.slice(2);
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--repo-root" || argv[index] === "-r") out.repoRoot = path.resolve(argv[++index] ?? out.repoRoot);
    else throw new Error(`Unknown argument: ${argv[index]}`);
  }
  return out;
}

const { repoRoot } = parseArgs();
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.resolve(scriptDir, "..", "references", "project-profile.schema.json");
const profilePath = path.resolve(repoRoot, PROFILE_RELATIVE_PATH);

if (!fs.existsSync(schemaPath)) throw new Error(`Schema not found: ${schemaPath}`);
if (!fs.existsSync(profilePath)) throw new Error(`Project profile not found: ${profilePath}`);

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const profile = JSON.parse(fs.readFileSync(profilePath, "utf8"));
const errors = validateProjectProfile(schema, profile);
if (errors.length) {
  process.stderr.write(`${errors.join("\n")}\n`);
  process.exitCode = 1;
} else {
  process.stdout.write(`Project profile JSON passed validation: ${profilePath}\n`);
}
