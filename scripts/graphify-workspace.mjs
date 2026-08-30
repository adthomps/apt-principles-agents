#!/usr/bin/env node
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const operatorRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.resolve(operatorRoot, "..");
const manifestPath = path.join(operatorRoot, "references", "graphify-portfolio.json");
const allowedParticipation = new Set([
  "deep",
  "lightweight-on-demand",
  "portfolio-metadata",
  "selected-provenance",
  "ordinary-docs-search",
]);

function normalize(value) {
  return value.replaceAll("\\", "/");
}

function inside(parent, child) {
  const relative = path.relative(parent, child);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function loadManifest() {
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

function parseArgs(argv) {
  const args = { command: argv[0] || "audit", target: argv[1] || "portfolio", run: false, deep: false };
  for (const arg of argv.slice(2)) {
    if (arg === "--run") args.run = true;
    else if (arg === "--deep") args.deep = true;
    else if (arg === "--help" || arg === "-h") args.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return args;
}

function help() {
  process.stdout.write([
    "Usage: node scripts/graphify-workspace.mjs <command> [target] [options]",
    "",
    "Commands:",
    "  audit                    validate the manifest, paths, exclusions, and local-only policy",
    "  stage                    rebuild the ignored curated portfolio corpus",
    "  build portfolio          stage and build the curated portfolio graph with Ollama",
    "  build <repo>             build a configured deep repo graph with Ollama",
    "  views <target>           generate GRAPH_TREE.html and CALLFLOW.html from an existing graph",
    "  queries <target>         print the five starter graph queries",
    "  queries <target> --run   run queries and save ignored validation evidence",
    "",
    "Options:",
    "  --deep                   use Graphify semantic deep mode during build",
    "",
    "Set GRAPHIFY_OLLAMA_MODEL to override Graphify's Ollama model.",
  ].join("\n") + "\n");
}

function commandResult(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd || operatorRoot,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "inherit",
    shell: false,
    env: process.env,
  });
  if (result.error) throw new Error(`${command} is unavailable: ${result.error.message}`);
  if (result.status !== 0) {
    const detail = options.capture ? (result.stderr || result.stdout || "").trim() : "";
    throw new Error(`${command} exited with ${result.status}${detail ? `: ${detail}` : ""}`);
  }
  return result;
}

function toolAvailable(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8", stdio: "pipe", shell: false });
  return !result.error && result.status === 0;
}

function projectByName(manifest, name) {
  const project = manifest.projects.find((item) => item.name === name);
  if (!project) throw new Error(`Unknown Graphify target: ${name}`);
  return project;
}

function audit(manifest, { quiet = false } = {}) {
  const errors = [];
  const warnings = [];
  if (manifest.schema_version !== 1) errors.push("schema_version must be 1");
  if (manifest.operator_repository !== "apt-principles-agents") errors.push("operator_repository must be apt-principles-agents");
  if (manifest.semantic_policy?.mode !== "local-only") errors.push("semantic_policy.mode must be local-only");
  if (manifest.semantic_policy?.backend !== "ollama") errors.push("semantic_policy.backend must be ollama");
  if (manifest.semantic_policy?.max_concurrency !== 1) errors.push("semantic_policy.max_concurrency must be 1");
  if (manifest.semantic_policy?.hosted_backends_allowed !== false) errors.push("hosted_backends_allowed must be false");
  if (manifest.output_policy?.root !== "graphify-out") errors.push("all generated output must remain under graphify-out");
  if (manifest.output_policy?.commit_generated_outputs !== false) errors.push("generated Graphify output must remain uncommitted");

  const names = manifest.projects.map((item) => item.name);
  if (names.length !== 18 || new Set(names).size !== 18) errors.push("projects must list each of the 18 workspace projects exactly once");
  const requiredCommon = [".git/", "node_modules/", "graphify-out/", ".env", "*.key", "*.sqlite*", "apps/web/public/"];
  for (const item of requiredCommon) if (!manifest.common_exclusions.includes(item)) errors.push(`common_exclusions missing ${item}`);

  for (const project of manifest.projects) {
    const repoRoot = path.join(workspaceRoot, project.name);
    if (!existsSync(repoRoot) || !statSync(repoRoot).isDirectory()) errors.push(`project directory missing: ${project.name}`);
    if (!allowedParticipation.has(project.participation)) errors.push(`invalid participation mode for ${project.name}`);
    for (const relative of project.portfolio_paths || []) {
      const source = path.resolve(repoRoot, relative);
      if (!inside(repoRoot, source)) errors.push(`portfolio path escapes ${project.name}: ${relative}`);
      else if (!existsSync(source) || !statSync(source).isFile()) errors.push(`portfolio source missing: ${project.name}/${relative}`);
    }
    if (project.participation === "deep") {
      if (!Array.isArray(project.starter_queries) || project.starter_queries.length !== 5) errors.push(`${project.name} must define exactly five starter queries`);
      const graphifyIgnore = path.join(repoRoot, ".graphifyignore");
      const gitIgnore = path.join(repoRoot, ".gitignore");
      if (!existsSync(graphifyIgnore)) errors.push(`${project.name}/.graphifyignore is missing`);
      if (!existsSync(gitIgnore) || !readFileSync(gitIgnore, "utf8").split(/\r?\n/).includes("graphify-out/")) {
        errors.push(`${project.name}/.gitignore must contain graphify-out/`);
      }
    }
  }

  const diagram = path.resolve(operatorRoot, manifest.portfolio.diagram_document);
  if (!inside(operatorRoot, diagram) || !existsSync(diagram)) errors.push(`portfolio diagram document missing: ${manifest.portfolio.diagram_document}`);
  const stageRoot = path.resolve(operatorRoot, manifest.portfolio.stage_directory);
  if (!inside(path.join(operatorRoot, "graphify-out"), stageRoot)) errors.push("portfolio stage_directory must be below graphify-out/");
  if (!toolAvailable("graphify", ["--version"])) errors.push("Graphify CLI is not available");
  if (!toolAvailable("ollama", ["list"])) warnings.push("Ollama is not installed or not reachable; semantic builds remain disabled until it is available");

  const hostedKeys = ["GEMINI_API_KEY", "GOOGLE_API_KEY", "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "DEEPSEEK_API_KEY", "KIMI_API_KEY"]
    .filter((name) => Boolean(process.env[name]));
  if (hostedKeys.length) warnings.push(`Hosted-model environment variables are present (${hostedKeys.join(", ")}), but build commands explicitly pin --backend ollama`);

  if (!quiet) {
    process.stdout.write(`Graphify portfolio audit: ${manifest.projects.length} projects, ${manifest.projects.filter((item) => item.participation === "deep").length} deep graphs\n`);
    for (const warning of warnings) process.stdout.write(`WARN: ${warning}\n`);
    for (const error of errors) process.stderr.write(`ERROR: ${error}\n`);
  }
  if (errors.length) throw new Error(`Graphify portfolio audit failed with ${errors.length} error(s)`);
  return { warnings };
}

function copyPortfolioSource(source, destination, records) {
  mkdirSync(path.dirname(destination), { recursive: true });
  copyFileSync(source, destination);
  records.push(normalize(path.relative(workspaceRoot, source)));
}

function stagePortfolio(manifest) {
  audit(manifest, { quiet: true });
  const stageRoot = path.resolve(operatorRoot, manifest.portfolio.stage_directory);
  const generatedRoot = path.join(operatorRoot, "graphify-out");
  if (!inside(generatedRoot, stageRoot)) throw new Error(`Refusing to stage outside ${generatedRoot}`);
  if (existsSync(stageRoot)) rmSync(stageRoot, { recursive: true, force: true });
  mkdirSync(stageRoot, { recursive: true });
  const records = [];
  for (const project of manifest.projects) {
    for (const relative of project.portfolio_paths || []) {
      const source = path.resolve(workspaceRoot, project.name, relative);
      const destination = path.join(stageRoot, project.name, relative);
      copyPortfolioSource(source, destination, records);
    }
  }
  writeFileSync(path.join(stageRoot, "CORPUS_INDEX.json"), JSON.stringify({
    generated_at: new Date().toISOString(),
    policy: manifest.semantic_policy,
    source_files: records,
  }, null, 2) + "\n", "utf8");
  writeFileSync(path.join(stageRoot, ".graphifyignore"), "graphify-out/\nCORPUS_INDEX.json\n", "utf8");
  process.stdout.write(`Staged ${records.length} curated files in ${stageRoot}\n`);
  return stageRoot;
}

function requireLocalBackend() {
  if (!toolAvailable("ollama", ["list"])) {
    throw new Error("Local semantic extraction requires Ollama. Install/start Ollama and ensure `ollama list` succeeds; no hosted fallback will be used.");
  }
}

function graphLocation(manifest, target) {
  if (target === "portfolio") {
    const stageRoot = path.resolve(operatorRoot, manifest.portfolio.stage_directory);
    return {
      graphRoot: path.join(stageRoot, "graphify-out"),
      label: "APT Portfolio",
    };
  }
  const project = projectByName(manifest, target);
  if (project.participation !== "deep") throw new Error(`${target} is not configured for a persistent deep graph`);
  const repoRoot = path.join(workspaceRoot, project.name);
  return { graphRoot: path.join(repoRoot, "graphify-out"), label: project.name };
}

function build(manifest, target, deepMode) {
  audit(manifest, { quiet: true });
  requireLocalBackend();
  const semantic = [
    "--backend", "ollama",
    "--max-concurrency", String(manifest.semantic_policy.max_concurrency),
    "--token-budget", String(manifest.semantic_policy.token_budget),
  ];
  if (process.env.GRAPHIFY_OLLAMA_MODEL) semantic.push("--model", process.env.GRAPHIFY_OLLAMA_MODEL);
  if (deepMode) semantic.push("--mode", "deep");
  if (target === "portfolio") {
    const stageRoot = stagePortfolio(manifest);
    commandResult("graphify", ["extract", stageRoot, ...semantic, "--out", stageRoot], { cwd: operatorRoot });
  } else {
    const project = projectByName(manifest, target);
    if (project.participation !== "deep") throw new Error(`${target} is not configured for a persistent deep graph`);
    const repoRoot = path.join(workspaceRoot, project.name);
    commandResult("graphify", ["extract", repoRoot, ...semantic, "--out", repoRoot], { cwd: repoRoot });
  }
  views(manifest, target);
}

function views(manifest, target) {
  const location = graphLocation(manifest, target);
  const graphPath = path.join(location.graphRoot, "graph.json");
  if (!existsSync(graphPath)) throw new Error(`Graph not found: ${graphPath}`);
  commandResult("graphify", [
    "tree",
    "--graph", graphPath,
    "--output", path.join(location.graphRoot, "GRAPH_TREE.html"),
    "--label", location.label,
  ]);
  commandResult("graphify", [
    "export", "callflow-html",
    "--graph", graphPath,
    "--output", path.join(location.graphRoot, "CALLFLOW.html"),
  ]);
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 72);
}

function starterQueries(manifest, target) {
  if (target === "portfolio") return manifest.portfolio.starter_queries;
  return projectByName(manifest, target).starter_queries || [];
}

function queries(manifest, target, run) {
  const items = starterQueries(manifest, target);
  if (!items.length) throw new Error(`${target} has no configured starter queries`);
  const location = graphLocation(manifest, target);
  const graphPath = path.join(location.graphRoot, "graph.json");
  for (const [index, question] of items.entries()) {
    if (!run) {
      process.stdout.write(`${index + 1}. graphify query ${JSON.stringify(question)} --graph ${JSON.stringify(graphPath)} --budget 2400\n`);
      continue;
    }
    if (!existsSync(graphPath)) throw new Error(`Graph not found: ${graphPath}`);
    const result = commandResult("graphify", ["query", question, "--graph", graphPath, "--budget", "2400"], { capture: true });
    const output = `${result.stdout || ""}${result.stderr || ""}`;
    const validationRoot = path.join(location.graphRoot, "query-validation");
    mkdirSync(validationRoot, { recursive: true });
    writeFileSync(path.join(validationRoot, `${index + 1}-${slug(question)}.txt`), `Question: ${question}\n\n${output}`, "utf8");
    const hasSourceLocation = /\bsrc=|source_location|\b(?:README|AGENTS|docs|apps|packages|src)[\\/][^\s]+/i.test(output);
    process.stdout.write(`${hasSourceLocation ? "PASS" : "REVIEW"}: ${question}\n`);
  }
  if (run) process.stdout.write("Graph traversal is only the discovery gate; confirm each durable finding in the cited source before promotion.\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) return help();
  const manifest = loadManifest();
  if (args.command === "audit") audit(manifest);
  else if (args.command === "stage") stagePortfolio(manifest);
  else if (args.command === "build") build(manifest, args.target, args.deep);
  else if (args.command === "views") views(manifest, args.target);
  else if (args.command === "queries") queries(manifest, args.target, args.run);
  else throw new Error(`Unknown command: ${args.command}`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
