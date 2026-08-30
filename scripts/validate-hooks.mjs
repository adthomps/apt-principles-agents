#!/usr/bin/env node
// Syntax-check every hooks/*.mjs and confirm the hook table in
// standards/ai/hook-enforcement-standard.md references only files that exist.

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hooksDir = path.join(root, "hooks");
const errors = [];

const scripts = readdirSync(hooksDir).filter((f) => f.endsWith(".mjs"));
for (const f of scripts) {
  try {
    execFileSync(process.execPath, ["--check", path.join(hooksDir, f)], { stdio: "pipe" });
  } catch (error) {
    errors.push(`${f}: syntax error — ${String(error.stderr || error.message).split("\n")[0]}`);
  }
}

const standard = readFileSync(path.join(root, "standards", "ai", "hook-enforcement-standard.md"), "utf8");
for (const m of standard.matchAll(/\.claude\/hooks\/([\w-]+\.mjs)/g)) {
  if (!scripts.includes(m[1])) errors.push(`hook-enforcement-standard.md references missing hook: ${m[1]}`);
}

if (errors.length) {
  process.stdout.write(errors.map((e) => `- ${e}`).join("\n") + "\n");
  process.stdout.write(`hooks validation: FAIL (${errors.length})\n`);
  process.exit(1);
}
process.stdout.write(`hooks validation: PASS (${scripts.length} hook scripts)\n`);
