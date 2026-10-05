#!/usr/bin/env node
import assert from "node:assert/strict";
import { classifyTarget, coverageReport, isSelected, predictAdapterTargets } from "./agent-coverage.mjs";

const recorded = { sha256: "installed" };
const cases = [
  [{ recorded: null, sourceExists: true, targetExists: false }, "missing_recorded_target"],
  [{ recorded: null, sourceExists: false, targetExists: false }, "adapter_source_missing"],
  [{ recorded, sourceExists: false, targetExists: true }, "adapter_source_missing"],
  [{ recorded, sourceExists: true, targetExists: false }, "missing_target"],
  [{ recorded, sourceExists: true, targetExists: true, sourceHash: "same", targetHash: "same" }, "current"],
  [{ recorded, sourceExists: true, targetExists: true, sourceHash: "new", targetHash: "installed" }, "outdated"],
  [{ recorded, sourceExists: true, targetExists: true, sourceHash: "new", targetHash: "edited" }, "local_drift"],
];
for (const [input, expected] of cases) assert.equal(classifyTarget(input), expected);

const domainAgent = { canonical_path: "agents/security/security-reviewer.md" };
assert.equal(isSelected(domainAgent, new Set(["agents/security/"])), true);
assert.equal(isSelected(domainAgent, new Set(["agents/core/"])), false);
assert.equal(isSelected(domainAgent, new Set(["agents/security/security-reviewer.md"])), true);

const targets = predictAdapterTargets([
  { source: "platforms/cursor/source/agents/apt-router.mdc", filename: "apt-router.mdc", domain: null },
  { source: "platforms/cursor/source/agents/harness/apt-router.mdc", filename: "apt-router.mdc", domain: "harness" },
  { source: "platforms/cursor/source/agents/security/security-reviewer.mdc", filename: "security-reviewer.mdc", domain: "security" },
], ".cursor/agents");
assert.equal(targets.get("platforms/cursor/source/agents/apt-router.mdc"), ".cursor/agents/apt-router.mdc");
assert.equal(targets.get("platforms/cursor/source/agents/harness/apt-router.mdc"), ".cursor/agents/harness-apt-router.mdc");
assert.equal(targets.get("platforms/cursor/source/agents/security/security-reviewer.mdc"), ".cursor/agents/security-reviewer.mdc");

const limitationReport = coverageReport({
  nodes: [],
  counts: { unsupported_surface: 1 },
  rows: [{ repository: "sample", agent_id: "apt-router", platform: "gemini", status: "unsupported_surface" }],
});
assert.match(limitationReport, /## Declared capability limitations/);
assert.match(limitationReport, /sample: gemini.*capability limitation/s);
assert.match(limitationReport, /No actionable discrepancies/);

process.stdout.write(`Agent coverage tests passed (${cases.length + 9} assertions).\n`);
