// Shared helpers for apt-check modules (DR-017).

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export const IGNORE_MARKER = "apt-check-ignore";
export const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
// Same skip set as the design lint, plus the CI checkout of apt-principles-agents.
export const SKIP_DIRS = new Set([
  "node_modules", "dist", ".output", ".apt", ".apt-backups", "build", "coverage", "graphify-out",
  "_apt-principles-agents", ".wrangler", ".next", ".turbo", ".git",
]);

/** Source files under dir, skipping generated and vendored folders. */
export function walk(dir, files = []) {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (SOURCE_EXTENSIONS.has(path.extname(entry.name))) files.push(full);
  }
  return files;
}

export function readJson(file) {
  return existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : null;
}

/** 1-based line number of a string index. */
export function lineAt(content, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) if (content.charCodeAt(i) === 10) line += 1;
  return line;
}

/** True when the finding's line, or the line above it, carries the ignore marker. */
export function ignored(lines, line) {
  return Boolean(lines[line - 1]?.includes(IGNORE_MARKER) || lines[line - 2]?.includes(IGNORE_MARKER));
}

export const relative = (repoRoot, file) => path.relative(repoRoot, file).split(path.sep).join("/");
