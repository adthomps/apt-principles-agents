#!/usr/bin/env node
import assert from "node:assert/strict";
import path from "node:path";
import { currentGraphRoot, graphEdges, inside, loadManifest, packById, parseArgs, runRoot, semanticArgs } from "./graphify-workspace.mjs";

const manifest = loadManifest();
assert.equal(parseArgs(["--help"]).help, true);
assert.equal(parseArgs(["investigate", "intake-delivery"]).promote, false);
assert.equal(parseArgs(["code", "apt-knowledge-hub", "--promote"]).promote, true);
assert.equal(parseArgs(["validate", "intake-delivery", "--run-id", "candidate-1"]).runId, "candidate-1");
assert.equal(parseArgs(["investigate", "design-provenance", "--fallback", "codex"]).fallback, "codex");
assert.equal(graphEdges({ links: [{ source: "a", target: "b" }] }).length, 1);
assert.equal(graphEdges({ edges: [{ source: "a", target: "b" }] }).length, 1);

const pack = packById(manifest, "intake-delivery");
assert.equal(pack.sources.length >= manifest.workflow.semantic_pack_min_files, true);
assert.equal(pack.sources.length <= manifest.workflow.semantic_pack_max_files, true);
assert.equal(manifest.workflow.full_portfolio_build_enabled, false);
assert.equal(manifest.workflow.default_repository_mode, "code-only");
assert.equal(manifest.workflow.automatic_promotion, false);

const packCurrent = currentGraphRoot(manifest, "intake-delivery");
const packCandidate = runRoot(manifest, "intake-delivery", "candidate-1");
const repoCandidate = runRoot(manifest, "apt-knowledge-hub", "candidate-1");
assert.equal(inside(path.dirname(packCurrent), packCurrent), true);
assert.equal(packCandidate.includes(`${path.sep}investigations${path.sep}intake-delivery${path.sep}runs${path.sep}`), true);
assert.equal(repoCandidate.includes(`${path.sep}apt-knowledge-hub${path.sep}graphify-out${path.sep}runs${path.sep}`), true);
assert.throws(() => runRoot(manifest, "intake-delivery", ".."), /Invalid run id/);

assert.deepEqual(semanticArgs(manifest), ["--backend", "ollama", "--model", "qwen2.5-coder:14b", "--max-concurrency", "1", "--token-budget", "2000"]);
assert.deepEqual(semanticArgs(manifest, true).slice(-2), ["--mode", "deep"]);

process.stdout.write("Graphify question-first operator safety tests passed\n");
