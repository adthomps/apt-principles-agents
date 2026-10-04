#!/usr/bin/env node
import assert from "node:assert/strict";
import path from "node:path";
import { currentGraphRoot, graphEdges, inside, loadManifest, localContentProject, localContentSources, packById, parseArgs, portfolioGraph, portfolioReport, readWorkspaceProjects, runRoot, semanticArgs } from "./graphify-workspace.mjs";

const manifest = loadManifest();
assert.equal(parseArgs(["--help"]).help, true);
assert.equal(parseArgs(["investigate", "intake-delivery"]).promote, false);
assert.equal(parseArgs(["code", "apt-commerce", "--promote"]).promote, true);
assert.equal(parseArgs(["validate", "intake-delivery", "--run-id", "candidate-1"]).runId, "candidate-1");
assert.equal(parseArgs(["investigate", "design-provenance", "--fallback", "codex"]).fallback, "codex");
assert.equal(parseArgs(["portfolio", "--check"]).check, true);
assert.equal(parseArgs(["content", "apt-vas-smb-training", "--deep", "--promote"]).deep, true);
assert.equal(parseArgs(["content", "apt-vas-smb-training", "--deep", "--promote"]).promote, true);
assert.equal(graphEdges({ links: [{ source: "a", target: "b" }] }).length, 1);
assert.equal(graphEdges({ edges: [{ source: "a", target: "b" }] }).length, 1);

const pack = packById(manifest, "intake-delivery");
assert.equal(pack.sources.length >= manifest.workflow.semantic_pack_min_files, true);
assert.equal(pack.sources.length <= manifest.workflow.semantic_pack_max_files, true);
assert.equal(manifest.workflow.full_portfolio_build_enabled, false);
assert.equal(manifest.workflow.default_repository_mode, "code-only");
assert.equal(manifest.workflow.automatic_promotion, false);

const codeRepositories = ["applied-practical-thinking", "apt-commerce", "apt-health", "apt-developer-mcp-payments", "apt-anet-vas-migration-acceptance"];
for (const name of codeRepositories) assert.equal(manifest.projects.find((project) => project.name === name)?.participation, "deep");
const contentRepositories = ["apt-anet-training", "apt-anet-vas-smb-move", "apt-vas-smb-training"];
for (const name of contentRepositories) {
  const project = localContentProject(manifest, name);
  assert.equal(project.local_graph.mode, "authored-markdown");
  const sources = localContentSources(project);
  assert(sources.length > 0, `${name} should have authored Markdown sources`);
  assert(sources.every((source) => source.endsWith(".md")));
  assert(sources.every((source) => (project.local_graph.source_roots || []).some((root) => source.startsWith(`${root}/`)) || (project.local_graph.source_files || []).includes(source)));
  assert(sources.every((source) => !(project.local_graph.excluded_paths || []).some((excluded) => source === excluded || source.startsWith(`${excluded}/`))));
}
const vasTraining = localContentProject(manifest, "apt-vas-smb-training");
assert.equal(vasTraining.local_graph.provisional, true);
assert.equal(manifest.projects.find((project) => project.name === "apt-anet-vas-smb-move").local_graph.provisional, false);
assert.equal(localContentSources(manifest.projects.find((project) => project.name === "apt-anet-training")).length, 8);
assert.equal(localContentSources(vasTraining).length, 8);
assert.deepEqual(localContentSources(manifest.projects.find((project) => project.name === "apt-anet-vas-smb-move")), [
  "README.md",
  "docs/integration-map.md",
  "docs/migrations/simple-checkout-to-pay-by-link.md",
]);

const workspaceProjects = readWorkspaceProjects();
const portfolio = portfolioGraph(manifest, workspaceProjects);
assert.equal(portfolio.directed, true);
assert.equal(portfolio.nodes.length, workspaceProjects.length);
assert(manifest.projects.every((project) => portfolio.nodes.some((node) => node.repo === project.name)));
assert(portfolio.nodes.some((node) => node.repo === "apt-anet-training" && node.project_status === "active"));
assert(portfolio.nodes.some((node) => node.repo === "apt-vas-integration-toolbox" && node.project_status === "planned"));
assert(portfolio.links.every((edge) => edge.confidence === "EXTRACTED" && edge.confidence_score === 1));
assert(portfolio.links.some((edge) => edge.relation === "provides_training_truth_for"));
assert(portfolio.links.some((edge) => edge.source === "project:apt-principles-agents" && edge.target === "project:apt-commerce" && edge.relation === "distributes_assets_to"));
assert(portfolio.links.some((edge) => edge.relation === "accepted_context_to_product_planning"));
assert(portfolioReport(portfolio).includes("| Workspace folder |"));
assert(portfolioReport(portfolio).includes("## Explicit relationships"));

const packCurrent = currentGraphRoot(manifest, "intake-delivery");
const portfolioCurrent = currentGraphRoot(manifest, "portfolio");
const packCandidate = runRoot(manifest, "intake-delivery", "candidate-1");
const repoCandidate = runRoot(manifest, "apt-commerce", "candidate-1");
assert.equal(inside(path.dirname(packCurrent), packCurrent), true);
assert.equal(portfolioCurrent.includes(`${path.sep}portfolio${path.sep}current`), true);
assert.equal(packCandidate.includes(`${path.sep}investigations${path.sep}intake-delivery${path.sep}runs${path.sep}`), true);
assert.equal(repoCandidate.includes(`${path.sep}apt-commerce${path.sep}graphify-out${path.sep}runs${path.sep}`), true);
assert.throws(() => runRoot(manifest, "intake-delivery", ".."), /Invalid run id/);

assert.deepEqual(semanticArgs(manifest), ["--backend", "ollama", "--model", "qwen2.5-coder:14b", "--max-concurrency", "1", "--token-budget", "2000"]);
assert.deepEqual(semanticArgs(manifest, true).slice(-2), ["--mode", "deep"]);

process.stdout.write("Graphify question-first operator safety tests passed\n");
