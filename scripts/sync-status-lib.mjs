// Shared sync status for a target repository, used by the SessionStart notice
// (session-sync-check.mjs) and the pre-push gate (push-sync-check.mjs).
// It runs `apt-assets.mjs scan`, which hashes managed files against the source, so a
// repository counts as behind only when a sync would actually change something.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

export const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BEHIND = new Set(["outdated", "new", "missing-target"]);

/**
 * Returns { installed, designFrom, designTo, design: string[], guidance: string[], drifted: string[] }.
 * design / guidance list managed targets a sync would update; drifted lists targets edited locally,
 * which sync leaves alone. Throws when the scan cannot run.
 */
export function syncStatus(repoRoot) {
  const record = path.join(repoRoot, ".apt", "installation.json");
  if (!existsSync(record)) return { installed: false };
  const output = execFileSync(
    process.execPath,
    [path.join(sourceRoot, "scripts", "apt-assets.mjs"), "scan", "--target", repoRoot],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  const scan = JSON.parse(output);
  const versionFile = path.join(sourceRoot, "design", "VERSION");
  const designTo = existsSync(versionFile) ? readFileSync(versionFile, "utf8").trim() : null;
  const designFrom = scan.designVersion || null;
  const behind = scan.files.filter((item) => BEHIND.has(item.status)).map((item) => item.target);
  const isDesign = (target) => target.startsWith(".apt/design/");
  return {
    installed: true,
    designFrom,
    designTo,
    designVersionBehind: Boolean(designFrom && designTo && designFrom !== designTo),
    design: behind.filter(isDesign),
    guidance: behind.filter((target) => !isDesign(target)),
    drifted: scan.files.filter((item) => item.status === "drifted").map((item) => item.target),
  };
}

export const syncCommand = "node ../apt-principles-agents/scripts/apt-assets.mjs sync --target . --apply";
