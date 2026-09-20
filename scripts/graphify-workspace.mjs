#!/usr/bin/env node
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const operatorRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.dirname(operatorRoot);
const manifestPath = path.join(operatorRoot, "references", "graphify-portfolio.json");

function normalize(value) { return value.replaceAll("\\", "/"); }
function inside(parent, candidate) {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}
function loadManifest() { return JSON.parse(readFileSync(manifestPath, "utf8")); }
function projectByName(manifest, name) {
  const project = manifest.projects.find((item) => item.name === name);
  if (!project) throw new Error(`Unknown project: ${name}`);
  return project;
}
function packById(manifest, id) {
  const pack = manifest.investigation_packs.find((item) => item.id === id);
  if (!pack) throw new Error(`Unknown investigation pack: ${id}`);
  return pack;
}
function isPack(manifest, target) { return manifest.investigation_packs.some((item) => item.id === target); }

function parseArgs(argv) {
  if (!argv.length || argv.includes("--help") || argv.includes("-h")) return { command: "help", target: null, help: true, run: false, promote: false, runId: null, fallback: null, deep: false };
  const args = { command: argv[0], target: null, help: false, run: false, promote: false, runId: null, fallback: null, deep: false };
  let index = 1;
  if (argv[index] && !argv[index].startsWith("--")) args.target = argv[index++];
  while (index < argv.length) {
    const arg = argv[index++];
    if (arg === "--run") args.run = true;
    else if (arg === "--promote") args.promote = true;
    else if (arg === "--run-id") args.runId = argv[index++] || null;
    else if (arg === "--fallback") args.fallback = argv[index++] || null;
    else if (arg === "--deep") args.deep = true;
    else throw new Error(`Unknown option: ${arg}`);
  }
  return args;
}

function usage() {
  process.stdout.write([
    "Usage: node scripts/graphify-workspace.mjs <command> [target] [options]",
    "", "Question-first document workflow:",
    "  packs                                  list small curated investigation packs",
    "  stage <pack>                           copy 3-8 allowlisted files into an immutable candidate",
    "  investigate <pack> [--deep]            run local Ollama semantics; never auto-promotes",
    "  investigate <pack> --fallback codex    prepare an explicit non-local extraction handoff",
    "  queries <pack> [--run]                 print or run the pack's focused questions",
    "", "Deterministic architecture workflow:",
    "  code <deep-repo> [--promote]           build a local AST-only candidate",
    "  build <deep-repo> [--promote]          compatibility alias for code",
    "", "Safety and review:",
    "  audit                                  validate manifest, sources, exclusions, and policy",
    "  validate <pack-or-repo> --run-id ID    validate a candidate; add --promote explicitly",
    "  status <pack-or-repo>                  show current and latest candidate state",
    "  views <pack-or-repo>                   regenerate views for current",
    "  quarantine <repo>                      copy a legacy root graph into ignored evidence",
    "", "Full portfolio semantic builds, automatic promotion, MCP registration, hooks, and schedules are disabled.",
  ].join("\n") + "\n");
}

function newRunId() { return new Date().toISOString().replaceAll(":", "-"); }
function assertRunId(runId) {
  if (!runId || !/^[A-Za-z0-9._-]+$/.test(runId) || runId === "." || runId === "..") throw new Error(`Invalid run id: ${runId}`);
}
function outputRoot(manifest) { return path.join(operatorRoot, manifest.output_policy.root); }
function runRoot(manifest, target, runId) {
  assertRunId(runId);
  if (isPack(manifest, target)) return path.join(outputRoot(manifest), "investigations", target, "runs", runId);
  projectByName(manifest, target);
  return path.join(workspaceRoot, target, manifest.output_policy.root, manifest.output_policy.runs_directory, runId);
}
function currentGraphRoot(manifest, target) {
  if (isPack(manifest, target)) return path.join(outputRoot(manifest), "investigations", target, manifest.output_policy.current_directory);
  projectByName(manifest, target);
  return path.join(workspaceRoot, target, manifest.output_policy.root, manifest.output_policy.current_directory);
}
function candidateGraphRoot(candidateRoot) {
  const nested = path.join(candidateRoot, "graphify-out");
  return existsSync(path.join(nested, "graph.json")) ? nested : candidateRoot;
}
function writeJson(file, value) { writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, "utf8"); }
function writeStatus(root, status, details = {}) {
  mkdirSync(root, { recursive: true });
  const file = path.join(root, "BUILD_STATUS.json");
  const previous = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
  writeJson(file, { ...previous, ...details, status, updated_at: new Date().toISOString() });
}
function commandResult(command, args, options = {}) {
  return spawnSync(command, args, { encoding: "utf8", stdio: options.capture ? "pipe" : "inherit", ...options });
}
function toolAvailable(command, args = ["--help"]) {
  const result = spawnSync(command, args, { encoding: "utf8", stdio: "ignore" });
  return !result.error && result.status === 0;
}
function semanticArgs(manifest, deepMode = false) {
  const policy = manifest.semantic_policy;
  const args = ["--backend", policy.backend, "--model", policy.model, "--max-concurrency", String(policy.max_concurrency), "--token-budget", String(policy.token_budget)];
  if (deepMode) args.push("--mode", "deep");
  return args;
}

function audit(manifest, quiet = false) {
  const errors = [];
  const warnings = [];
  const workflow = manifest.workflow || {};
  const semantic = manifest.semantic_policy || {};
  const acceptance = manifest.acceptance_policy || {};
  if (manifest.projects.length !== 18) errors.push(`expected 18 projects, found ${manifest.projects.length}`);
  if (workflow.full_portfolio_build_enabled !== false) errors.push("full portfolio builds must remain disabled");
  if (workflow.default_repository_mode !== "code-only") errors.push("default repository mode must be code-only");
  if (workflow.automatic_promotion !== false) errors.push("automatic promotion must remain disabled");
  if (workflow.mcp_hooks_and_schedules_enabled !== false) errors.push("MCP, hooks, and schedules must remain disabled during the pivot");
  if (semantic.mode !== "local-only" || semantic.backend !== "ollama" || semantic.hosted_backends_allowed !== false) errors.push("semantic policy must pin local-only Ollama");
  if (!semantic.model || semantic.max_concurrency !== 1) errors.push("semantic model is required and concurrency must equal 1");
  for (const field of ["token_budget", "context_window", "max_output_tokens"]) if (!Number.isInteger(semantic[field]) || semantic[field] < 1) errors.push(`semantic_policy.${field} must be a positive integer`);
  if (semantic.disable_thinking !== true) errors.push("semantic thinking must remain disabled");
  for (const mode of ["code_only", "semantic_pack"]) if (!acceptance[mode]) errors.push(`acceptance_policy.${mode} is required`);
  const packIds = new Set();
  for (const pack of manifest.investigation_packs || []) {
    if (!pack.id || packIds.has(pack.id)) errors.push(`duplicate or missing pack id: ${pack.id}`);
    packIds.add(pack.id);
    const count = pack.sources?.length || 0;
    if (count < workflow.semantic_pack_min_files || count > workflow.semantic_pack_max_files) errors.push(`${pack.id} must contain ${workflow.semantic_pack_min_files}-${workflow.semantic_pack_max_files} sources`);
    if (!Array.isArray(pack.questions) || pack.questions.length < 1 || pack.questions.length > 5) errors.push(`${pack.id} must define 1-5 questions`);
    for (const relative of pack.sources || []) {
      const source = path.resolve(workspaceRoot, relative);
      if (!inside(workspaceRoot, source) || !existsSync(source) || !statSync(source).isFile()) errors.push(`pack source missing or outside workspace: ${relative}`);
    }
  }
  for (const project of manifest.projects) {
    const repoRoot = path.join(workspaceRoot, project.name);
    if (!existsSync(repoRoot)) errors.push(`project missing: ${project.name}`);
    for (const relative of project.portfolio_paths || []) {
      const source = path.resolve(repoRoot, relative);
      if (!inside(repoRoot, source) || !existsSync(source)) errors.push(`portfolio inventory source missing: ${project.name}/${relative}`);
    }
    if (project.graphify_guide) {
      const guide = path.resolve(repoRoot, project.graphify_guide);
      if (!inside(repoRoot, guide) || !existsSync(guide) || !statSync(guide).isFile()) errors.push(`Graphify guide missing: ${project.name}/${project.graphify_guide}`);
    }
    if (project.participation === "deep") {
      if (!existsSync(path.join(repoRoot, ".graphifyignore"))) errors.push(`${project.name} lacks .graphifyignore`);
      const gitignore = existsSync(path.join(repoRoot, ".gitignore")) ? readFileSync(path.join(repoRoot, ".gitignore"), "utf8") : "";
      if (!gitignore.includes("graphify-out/")) errors.push(`${project.name} lacks graphify-out/ in .gitignore`);
    }
  }
  if (!existsSync(path.join(operatorRoot, manifest.portfolio.diagram_document))) errors.push("portfolio diagram document is missing");
  if (!toolAvailable("ollama", ["list"])) warnings.push("Ollama is not reachable on PATH; semantic investigations are unavailable, but code-only graphs still work");
  if (!quiet) {
    process.stdout.write(`Graphify audit: ${manifest.investigation_packs.length} focused packs; full portfolio build disabled; ${manifest.projects.filter((item) => item.participation === "deep").length} code-only repositories; ${manifest.projects.filter((item) => item.graphify_guide).length} repo guides\n`);
    for (const warning of warnings) process.stdout.write(`WARN: ${warning}\n`);
    for (const error of errors) process.stderr.write(`ERROR: ${error}\n`);
  }
  if (errors.length) throw new Error(`Graphify audit failed with ${errors.length} error(s)`);
  return { errors, warnings };
}

function listPacks(manifest) {
  for (const pack of manifest.investigation_packs) {
    process.stdout.write(`${pack.id} (${pack.sources.length} files) — ${pack.title}\n`);
    for (const question of pack.questions) process.stdout.write(`  - ${question}\n`);
  }
}

function stagePack(manifest, packId, provenance = "local-ollama") {
  const pack = packById(manifest, packId);
  const runId = newRunId();
  const candidateRoot = runRoot(manifest, packId, runId);
  const corpusRoot = path.join(candidateRoot, "corpus");
  mkdirSync(corpusRoot, { recursive: true });
  for (const relative of pack.sources) {
    const source = path.resolve(workspaceRoot, relative);
    const destination = path.join(corpusRoot, relative);
    if (!inside(corpusRoot, destination)) throw new Error(`Pack source escapes corpus: ${relative}`);
    mkdirSync(path.dirname(destination), { recursive: true });
    copyFileSync(source, destination);
  }
  writeJson(path.join(candidateRoot, "CORPUS_INDEX.json"), { pack: pack.id, title: pack.title, sources: pack.sources, questions: pack.questions, created_at: new Date().toISOString(), semantic_provenance: provenance });
  writeStatus(candidateRoot, "staged", { target: pack.id, mode: "semantic-pack", semantic_provenance: provenance });
  process.stdout.write(`Staged ${pack.sources.length}-file pack at ${candidateRoot}\n`);
  return { candidateRoot, corpusRoot, runId };
}

function ensureOllama(manifest) {
  const result = spawnSync("ollama", ["list"], { encoding: "utf8" });
  if (result.error || result.status !== 0) throw new Error("Local semantic investigation requires Ollama on PATH; no hosted fallback will be used.");
  if (!`${result.stdout || ""}${result.stderr || ""}`.includes(manifest.semantic_policy.model)) throw new Error(`Required local model is not installed: ${manifest.semantic_policy.model}`);
}

function investigate(manifest, packId, options) {
  audit(manifest, true);
  if (packId === "portfolio") throw new Error("Full portfolio semantic builds are disabled; select a named investigation pack with `packs`.");
  if (options.fallback && options.fallback !== "codex") throw new Error(`Unsupported fallback: ${options.fallback}`);
  const provenance = options.fallback === "codex" ? "non-local-codex" : "local-ollama";
  const staged = stagePack(manifest, packId, provenance);
  if (options.fallback === "codex") {
    writeJson(path.join(staged.candidateRoot, "CODEX_FALLBACK_REQUEST.json"), { pack: packId, corpus: staged.corpusRoot, output: staged.candidateRoot, provenance, instruction: "Use Codex semantic extraction only for this staged corpus, then validate. Do not promote without --promote." });
    writeStatus(staged.candidateRoot, "awaiting-explicit-codex-extraction", { fallback_authorized: true });
    process.stdout.write("Prepared an explicit non-local handoff; no extraction or promotion was performed.\n");
    return staged;
  }
  ensureOllama(manifest);
  writeStatus(staged.candidateRoot, "running");
  const result = commandResult("graphify", ["extract", staged.corpusRoot, ...semanticArgs(manifest, options.deep), "--out", staged.candidateRoot], { cwd: operatorRoot });
  if (result.error || result.status !== 0) {
    writeStatus(staged.candidateRoot, "failed", { exit_code: result.status ?? null });
    throw new Error(`Semantic investigation failed; candidate retained at ${staged.candidateRoot}`);
  }
  writeStatus(staged.candidateRoot, "built-awaiting-review");
  validateCandidate(manifest, packId, staged.candidateRoot, false);
  return staged;
}

function codeGraph(manifest, repoName, promote = false) {
  audit(manifest, true);
  const project = projectByName(manifest, repoName);
  if (project.participation !== "deep") throw new Error(`${repoName} is not configured for a repo-local graph`);
  const runId = newRunId();
  const candidateRoot = runRoot(manifest, repoName, runId);
  mkdirSync(candidateRoot, { recursive: true });
  writeStatus(candidateRoot, "running", { target: repoName, mode: "code-only", semantic_provenance: "none-local-ast" });
  const repoRoot = path.join(workspaceRoot, repoName);
  const result = commandResult("graphify", ["extract", repoRoot, "--code-only", "--out", candidateRoot], { cwd: repoRoot });
  if (result.error || result.status !== 0) {
    writeStatus(candidateRoot, "failed", { exit_code: result.status ?? null });
    throw new Error(`Code-only extraction failed; candidate retained at ${candidateRoot}`);
  }
  writeStatus(candidateRoot, "built-awaiting-review");
  validateCandidate(manifest, repoName, candidateRoot, promote);
  return { candidateRoot, runId };
}

function graphEdges(graph) { return Array.isArray(graph.links) ? graph.links : Array.isArray(graph.edges) ? graph.edges : []; }
function endpointId(value) { return typeof value === "object" && value ? value.id ?? value.name ?? value.label : value; }

function validateCandidate(manifest, target, candidateRoot, promote = false) {
  const graphRoot = candidateGraphRoot(candidateRoot);
  const graphPath = path.join(graphRoot, "graph.json");
  const failures = [];
  if (!existsSync(graphPath)) failures.push("graph.json is missing");
  let graph = { nodes: [], links: [] };
  if (!failures.length) graph = JSON.parse(readFileSync(graphPath, "utf8"));
  const nodes = Array.isArray(graph.nodes) ? graph.nodes : [];
  const edges = graphEdges(graph);
  const mode = isPack(manifest, target) ? "semantic_pack" : "code_only";
  const threshold = manifest.acceptance_policy[mode];
  if (nodes.length < threshold.minimum_nodes) failures.push(`node count ${nodes.length} is below ${threshold.minimum_nodes}`);
  if (edges.length < threshold.minimum_edges) failures.push(`edge count ${edges.length} is below ${threshold.minimum_edges}`);
  const ids = new Set(nodes.map((node) => String(node.id ?? node.name ?? node.label)));
  const degrees = new Map([...ids].map((id) => [id, 0]));
  let dangling = 0;
  let selfLoops = 0;
  const pairs = new Map();
  for (const edge of edges) {
    const source = String(endpointId(edge.source));
    const destination = String(endpointId(edge.target));
    if (!ids.has(source) || !ids.has(destination)) dangling += 1;
    if (source === destination) selfLoops += 1;
    if (degrees.has(source)) degrees.set(source, degrees.get(source) + 1);
    if (degrees.has(destination)) degrees.set(destination, degrees.get(destination) + 1);
    const pair = `${source}\u0000${destination}`;
    pairs.set(pair, (pairs.get(pair) || 0) + 1);
  }
  const collapsedPairs = [...pairs.values()].filter((count) => count > 1).length;
  const nodeById = new Map(nodes.map((node) => [String(node.id ?? node.name ?? node.label), node]));
  const topHubs = [...degrees.entries()].sort((left, right) => right[1] - left[1]).slice(0, 10).map(([id, degree]) => ({
    id,
    label: String(nodeById.get(id)?.label ?? nodeById.get(id)?.name ?? id),
    source_file: nodeById.get(id)?.source_file ?? null,
    degree,
  }));
  const noiseLabels = manifest.acceptance_policy.noise_labels.map((label) => label.toLowerCase());
  const noisyHubs = topHubs.filter((hub) => {
    const label = hub.label.toLowerCase().replace(/\(\)$/, "");
    return noiseLabels.some((noise) => label === noise || label.startsWith(`${noise} `));
  });
  if (dangling) failures.push(`${dangling} edges have missing endpoints`);
  if (selfLoops) failures.push(`${selfLoops} self-loops require review`);
  if (noisyHubs.length > manifest.acceptance_policy.maximum_noisy_god_nodes) failures.push(`${noisyHubs.length} generic utilities dominate the top ten hubs`);
  let sourceCoverage = null;
  if (isPack(manifest, target)) {
    const indexPath = path.join(candidateRoot, "CORPUS_INDEX.json");
    const expected = existsSync(indexPath) ? JSON.parse(readFileSync(indexPath, "utf8")).sources : packById(manifest, target).sources;
    const searchable = normalize(JSON.stringify(graph)).toLowerCase();
    const represented = expected.filter((source) => searchable.includes(normalize(source).toLowerCase()) || searchable.includes(path.basename(source).toLowerCase()));
    sourceCoverage = expected.length ? represented.length / expected.length : 0;
    if (sourceCoverage < manifest.acceptance_policy.minimum_source_coverage) failures.push(`source coverage ${(sourceCoverage * 100).toFixed(1)}% is below ${(manifest.acceptance_policy.minimum_source_coverage * 100).toFixed(0)}%`);
  }
  const report = { target, mode, passed: failures.length === 0, generated_at: new Date().toISOString(), graph: normalize(path.relative(candidateRoot, graphPath)), nodes: nodes.length, edges: edges.length, source_coverage: sourceCoverage, dangling_endpoints: dangling, self_loops: selfLoops, same_endpoint_pairs: collapsedPairs, top_hubs: topHubs, noisy_hubs: noisyHubs, failures, note: "Passing structure does not validate semantic claims. Confirm every promoted relationship against source files." };
  writeJson(path.join(candidateRoot, "VALIDATION_REPORT.json"), report);
  writeFileSync(path.join(candidateRoot, "DIAGNOSTICS.txt"), `nodes=${nodes.length}\nedges=${edges.length}\ndangling_endpoints=${dangling}\nself_loops=${selfLoops}\nsame_endpoint_pairs=${collapsedPairs}\n`, "utf8");
  writeStatus(candidateRoot, report.passed ? "validated-awaiting-review" : "rejected", { validation_passed: report.passed });
  if (report.passed) generateViews(graphRoot, target);
  if (report.passed && promote) promoteCandidate(manifest, target, candidateRoot);
  process.stdout.write(`Validation ${report.passed ? "PASS" : "FAIL"}: ${nodes.length} nodes, ${edges.length} edges; ${candidateRoot}\n`);
  if (!report.passed) throw new Error(`Candidate failed validation and was not promoted: ${failures.join("; ")}`);
  return report;
}

function promoteCandidate(manifest, target, candidateRoot) {
  const graphRoot = candidateGraphRoot(candidateRoot);
  const current = currentGraphRoot(manifest, target);
  const history = path.join(path.dirname(current), manifest.output_policy.history_directory, newRunId());
  mkdirSync(path.dirname(current), { recursive: true });
  if (existsSync(current)) { mkdirSync(path.dirname(history), { recursive: true }); renameSync(current, history); }
  cpSync(graphRoot, current, { recursive: true });
  writeJson(path.join(current, "PROMOTION.json"), { target, promoted_at: new Date().toISOString(), candidate: normalize(candidateRoot), evidence_status: "reviewed-operational-evidence-not-canonical-truth" });
  writeStatus(candidateRoot, "promoted");
  process.stdout.write(`Promoted candidate to ${current}; prior current was preserved when present.\n`);
}

function generateViews(graphRoot, label) {
  const graphPath = path.join(graphRoot, "graph.json");
  if (!existsSync(graphPath)) throw new Error(`No graph found at ${graphPath}`);
  commandResult("graphify", ["export", "html", "--graph", graphPath], { cwd: graphRoot });
  commandResult("graphify", ["tree", "--graph", graphPath, "--output", path.join(graphRoot, "GRAPH_TREE.html"), "--label", label], { cwd: graphRoot });
  commandResult("graphify", ["export", "callflow-html", "--graph", graphPath, "--output", path.join(graphRoot, "CALLFLOW.html")], { cwd: graphRoot });
}

function queries(manifest, target, run = false) {
  const questions = isPack(manifest, target) ? packById(manifest, target).questions : projectByName(manifest, target).starter_queries || [];
  for (const question of questions) process.stdout.write(`- ${question}\n`);
  if (!run) return;
  const graphPath = path.join(currentGraphRoot(manifest, target), "graph.json");
  if (!existsSync(graphPath)) throw new Error(`No promoted graph for ${target}; validate and promote a reviewed candidate explicitly.`);
  const results = [];
  for (const question of questions) {
    const result = commandResult("graphify", ["query", question, "--graph", graphPath, "--budget", "2000"], { capture: true });
    const answer = `${result.stdout || ""}${result.stderr || ""}`.trim();
    process.stdout.write(`\nQUESTION: ${question}\n${answer}\n`);
    results.push({ question, exit_code: result.status, answer });
  }
  const evidenceRoot = path.join(currentGraphRoot(manifest, target), "query-evidence");
  mkdirSync(evidenceRoot, { recursive: true });
  writeJson(path.join(evidenceRoot, `${newRunId()}.json`), { target, results });
}

function status(manifest, target) {
  if (!target) throw new Error("status requires a pack or repository name");
  const current = currentGraphRoot(manifest, target);
  const runs = isPack(manifest, target) ? path.join(outputRoot(manifest), "investigations", target, "runs") : path.join(workspaceRoot, target, manifest.output_policy.root, manifest.output_policy.runs_directory);
  const names = existsSync(runs) ? readdirSync(runs, { withFileTypes: true }).filter((item) => item.isDirectory()).map((item) => item.name).sort().reverse() : [];
  process.stdout.write(`Target: ${target}\nCurrent: ${existsSync(path.join(current, "graph.json")) ? current : "none"}\n`);
  if (!names.length) return process.stdout.write("Latest candidate: none\n");
  const latest = path.join(runs, names[0]);
  const statusPath = path.join(latest, "BUILD_STATUS.json");
  process.stdout.write(`Latest candidate: ${latest}\n${existsSync(statusPath) ? readFileSync(statusPath, "utf8") : "status unavailable\n"}`);
}

function quarantine(manifest, repoName) {
  projectByName(manifest, repoName);
  const repoRoot = path.join(workspaceRoot, repoName);
  const legacyGraph = path.join(repoRoot, manifest.output_policy.root, "graph.json");
  if (!existsSync(legacyGraph)) throw new Error(`No legacy root graph found for ${repoName}`);
  const destination = path.join(repoRoot, manifest.output_policy.root, manifest.output_policy.legacy_directory, newRunId());
  mkdirSync(destination, { recursive: true });
  for (const name of ["graph.json", "graph.html", "GRAPH_REPORT.md", "GRAPH_TREE.html", "CALLFLOW.html"]) {
    const source = path.join(repoRoot, manifest.output_policy.root, name);
    if (existsSync(source)) copyFileSync(source, path.join(destination, name));
  }
  writeJson(path.join(destination, "QUARANTINE.json"), { source: normalize(path.dirname(legacyGraph)), copied_at: new Date().toISOString(), reason: "historical unvalidated evidence" });
  process.stdout.write(`Copied legacy evidence to ${destination}; original files were not changed.\n`);
}

function main() {
  const manifest = loadManifest();
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.command === "help") usage();
  else if (args.command === "audit") audit(manifest);
  else if (args.command === "packs") listPacks(manifest);
  else if (args.command === "stage") stagePack(manifest, args.target);
  else if (args.command === "investigate") investigate(manifest, args.target, args);
  else if (args.command === "code" || args.command === "build") {
    if (args.target === "portfolio") throw new Error("Full portfolio builds are disabled; use `packs`, `investigate <pack>`, or `code <repo>`.");
    codeGraph(manifest, args.target, args.promote);
  } else if (args.command === "validate") {
    if (!args.runId) throw new Error("validate requires --run-id ID");
    validateCandidate(manifest, args.target, runRoot(manifest, args.target, args.runId), args.promote);
  } else if (args.command === "queries") queries(manifest, args.target, args.run);
  else if (args.command === "views") generateViews(currentGraphRoot(manifest, args.target), args.target);
  else if (args.command === "status") status(manifest, args.target);
  else if (args.command === "quarantine") quarantine(manifest, args.target);
  else throw new Error(`Unknown command: ${args.command}`);
}

const invokedAsScript = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedAsScript) {
  try { main(); }
  catch (error) { process.stderr.write(`ERROR: ${error.message}\n`); process.exitCode = 1; }
}

export { currentGraphRoot, graphEdges, inside, loadManifest, packById, parseArgs, runRoot, semanticArgs };
