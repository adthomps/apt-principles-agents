#!/usr/bin/env node
// Pre-push sync gate, run by .apt/git-hooks/pre-push in each target repository.
// Blocks (exit 1) when the repository's APT design is behind, because that changes what the
// product renders. Warns (exit 0) when only guidance files (docs, skills, agents) are behind.
// Locally edited files never block. Fails open on its own errors.
//
// Usage: node push-sync-check.mjs --repo-root <repo>

import path from "node:path";
import process from "node:process";
import { syncCommand, syncStatus } from "./sync-status-lib.mjs";

const index = process.argv.indexOf("--repo-root");
const repoRoot = path.resolve(index >= 0 ? process.argv[index + 1] : ".");
const name = path.basename(repoRoot);

let status;
try {
  status = syncStatus(repoRoot);
} catch (error) {
  process.stderr.write(`[APT sync check] skipped: ${String(error.message).split("\n")[0]}\n`);
  process.exit(0);
}
if (!status.installed) process.exit(0);

const designBehind = status.designVersionBehind || status.design.length > 0;
const lines = [];
if (designBehind) {
  const version = status.designVersionBehind ? ` ${status.designFrom} -> ${status.designTo}` : "";
  const files = status.design.length ? `${status.design.length} design file(s) to update` : "recorded design version is older";
  lines.push(`- Design${version}: ${files}. This blocks the push.`);
}
if (status.guidance.length) lines.push(`- Guidance: ${status.guidance.length} file(s) behind (docs, skills, agents). Warning only.`);
if (status.drifted.length) lines.push(`- ${status.drifted.length} managed file(s) edited locally. Sync leaves them alone.`);
if (!lines.length) process.exit(0);

const out = designBehind ? process.stderr : process.stdout;
out.write(`[APT sync check] ${name} is behind apt-principles-agents.\n${lines.join("\n")}\n`);
if (designBehind || status.guidance.length) {
  out.write(`Sync: ${syncCommand}\n`);
}
if (designBehind) {
  out.write("Then: node .apt/design/bin/apt-design-check.mjs, commit, and push again.\n");
  out.write("Push anyway: git push --no-verify (or APT_SKIP_SYNC_CHECK=1).\n");
  process.exit(1);
}
