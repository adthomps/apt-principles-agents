// sync module: is the repo behind apt-principles-agents? Design behind is an error because it
// changes what the product renders; guidance behind and locally edited managed files are warnings.
// Files listed in installation.json localTargets are repo-owned and never reported.

import { syncCommand, syncStatus } from "../sync-status-lib.mjs";

export function checkSync(repoRoot) {
  const status = syncStatus(repoRoot);
  if (!status.installed) {
    return {
      errors: [],
      warnings: ["not registered: no .apt/installation.json. Install with apt-assets.mjs install if this repo should follow APT."],
      summary: "not installed",
    };
  }
  const errors = [];
  const warnings = [];
  if (status.designVersionBehind || status.design.length) {
    const version = status.designVersionBehind ? ` ${status.designFrom} -> ${status.designTo}` : "";
    const files = status.design.length ? `${status.design.length} design file(s) to update` : "recorded design version is older";
    errors.push(`design${version}: ${files}`);
  }
  if (status.guidance.length) warnings.push(`guidance: ${status.guidance.length} file(s) behind (docs, skills, agents, hooks, workflow)`);
  for (const target of status.drifted) {
    warnings.push(`${target}: edited locally. Sync leaves it alone. Add it to localTargets with a decision record, or restore it.`);
  }
  const summary = errors.length || warnings.length ? `run: ${syncCommand}` : "current";
  return { errors, warnings, summary };
}
