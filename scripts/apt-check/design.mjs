// design module: runs the repository's installed apt-design-check (the version it synced),
// so CI enforces the same contrast, drift and lint checks the repo runs locally.

import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

export function checkDesign(repoRoot) {
  if (!existsSync(path.join(repoRoot, "apt-design.json"))) return { skipped: "no apt-design.json" };
  const bin = path.join(repoRoot, ".apt", "design", "bin", "apt-design-check.mjs");
  if (!existsSync(bin)) return { errors: [".apt/design/bin/apt-design-check.mjs missing. Sync the design manifest."], summary: "not installed" };
  const run = spawnSync(process.execPath, [bin, "--json"], { cwd: repoRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  let report;
  try {
    report = JSON.parse(run.stdout);
  } catch {
    return { errors: [`apt-design-check did not report: ${(run.stderr || run.stdout || "").trim().split("\n")[0]}`], summary: "error" };
  }
  const errors = report.results
    .filter((result) => result.status === "fail")
    .flatMap((result) => (result.failures.length ? result.failures : [result.summary]).map((failure) => `${result.check}: ${failure}`));
  return { errors, summary: `design v${report.designVersion}, tier ${report.tier}` };
}
