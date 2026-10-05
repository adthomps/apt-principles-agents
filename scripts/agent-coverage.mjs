#!/usr/bin/env node
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const workspaceRoot = path.dirname(root);
const outputRoot = path.join(root, "graphify-out", "agent-coverage");
const capabilityPath = "references/agent-platform-capabilities.json";
const registryPath = "references/workspace-consumers.json";
const catalogPath = "references/agent-catalog.json";

function normalize(value) {
  return value.replaceAll("\\", "/");
}

function hash(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function sourceLine(file, pattern) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  const index = lines.findIndex((line) => pattern.test(line));
  return index < 0 ? null : `L${index + 1}`;
}

function parseManifest(name) {
  const manifestFile = path.join(root, "manifests", `${name}.yaml`);
  if (!existsSync(manifestFile)) throw new Error(`Unknown manifest: ${name}`);
  const manifest = { name, extends: [], agents: [] };
  let section = null;
  for (const line of readFileSync(manifestFile, "utf8").split(/\r?\n/)) {
    const scalar = line.match(/^([a-z-]+):\s+(.+)$/);
    if (scalar) {
      if (scalar[1] === "name") manifest.name = scalar[2].trim();
      section = null;
      continue;
    }
    const heading = line.match(/^([a-z-]+):\s*$/);
    if (heading) {
      section = heading[1];
      continue;
    }
    const item = line.match(/^\s+-\s+(.+)$/);
    if (item && (section === "extends" || section === "agents")) manifest[section].push(item[1].trim());
  }
  if (manifest.name !== name) throw new Error(`Manifest name must match filename: ${name}`);
  return manifest;
}

function selectedAgentPaths(manifestNames) {
  const selected = new Set();
  const seen = new Set();
  const visiting = new Set();
  function visit(name) {
    if (seen.has(name)) return;
    if (visiting.has(name)) throw new Error(`Manifest extension cycle: ${[...visiting, name].join(" -> ")}`);
    visiting.add(name);
    const manifest = parseManifest(name);
    for (const parent of manifest.extends) visit(parent);
    for (const entry of manifest.agents) selected.add(normalize(entry));
    visiting.delete(name);
    seen.add(name);
  }
  for (const name of manifestNames) visit(name);
  return selected;
}

export function isSelected(agent, selected) {
  const canonicalPath = agent.canonical_path;
  return [...selected].some((entry) =>
    entry === canonicalPath ||
    (entry.endsWith("/") && canonicalPath.startsWith(entry)) ||
    (entry.startsWith("agents/") && !entry.endsWith("/") && entry === canonicalPath)
  );
}

export function classifyTarget({ recorded, sourceExists, targetExists, sourceHash, targetHash }) {
  if (!sourceExists) return "adapter_source_missing";
  if (!recorded) return "missing_recorded_target";
  if (!targetExists) return "missing_target";
  if (sourceHash === targetHash) return "current";
  return targetHash === recorded.sha256 ? "outdated" : "local_drift";
}

function readInstallation(repoPath) {
  const recordPath = path.join(repoPath, ".apt", "installation.json");
  if (!existsSync(recordPath)) return { status: "missing_record", record: null };
  try {
    const record = JSON.parse(readFileSync(recordPath, "utf8"));
    if (record.schemaVersion !== 1 || !Array.isArray(record.manifests) || !Array.isArray(record.platforms) || !Array.isArray(record.managedFiles)) {
      return { status: "unknown_record_invalid", record: null };
    }
    return { status: "available", record };
  } catch {
    return { status: "unknown_record_invalid", record: null };
  }
}

function expectedAdapterSource(agent, platform, capability) {
  const placement = agent.scope === "global" ? "" : `${agent.domain}/`;
  return `${capability.sourceDirectory}/${placement}${agent.id}${capability.extension}`;
}

function consumerAgentApplicability(agent, selected, platform, capabilities, scopedGlobalAdapters) {
  const adapter = capabilities.platforms[platform];
  if (!adapter || adapter.adapterStatus !== "generated") {
    return agent.scope === "global" || isSelected(agent, selected) ? "unsupported_surface" : "not_selected";
  }
  const adapterSource = expectedAdapterSource(agent, platform, adapter);
  if (agent.scope === "global") {
    return scopedGlobalAdapters.has(adapterSource) && !selected.has(adapterSource) ? "not_selected" : "selected";
  }
  return isSelected(agent, selected) ? "selected" : "not_selected";
}

function generatedSourcePath(source) {
  return path.join(root, ...source.split("/"));
}

export function predictAdapterTargets(candidates, installTarget) {
  const byFilename = new Map();
  for (const candidate of candidates) {
    const group = byFilename.get(candidate.filename) || [];
    group.push(candidate);
    byFilename.set(candidate.filename, group);
  }
  return new Map(candidates.map((candidate) => {
    const group = byFilename.get(candidate.filename);
    const filename = group.length > 1 && candidate.domain
      ? `${candidate.domain}-${candidate.filename}`
      : candidate.filename;
    return [candidate.source, `${installTarget}/${filename}`];
  }));
}

function selectedAdapterCandidates(capability, selected, scopedGlobalAdapters) {
  const sourceRoot = generatedSourcePath(capability.sourceDirectory);
  if (!existsSync(sourceRoot) || !statSync(sourceRoot).isDirectory()) return [];
  const candidates = [];
  function collect(directory, domain = null) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const childPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        collect(childPath, entry.name);
        continue;
      }
      if (!entry.isFile() || !/\.(agent\.md|mdc|md)$/.test(entry.name)) continue;
      const source = normalize(path.relative(root, childPath));
      const canonicalName = entry.name.replace(/\.(agent\.md|mdc|md)$/, ".md");
      if (domain) {
        const canonicalEquivalent = `agents/${domain}/${canonicalName}`;
        if (!isSelected({ canonical_path: canonicalEquivalent }, selected) && !selected.has(source)) continue;
      } else if (scopedGlobalAdapters.has(source) && !selected.has(source)) {
        continue;
      }
      candidates.push({ source, filename: entry.name, domain });
    }
  }
  collect(sourceRoot);
  return candidates;
}

function buildCoverage({ agents, consumers, capabilities, workspaceRoot: workspace = workspaceRoot }) {
  const nodes = [];
  const links = [];
  const rows = [];
  const counts = {};
  const scopedGlobalAdapters = new Set();
  for (const entry of readdirSync(path.join(root, "manifests"), { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".yaml")) continue;
    for (const candidate of parseManifest(entry.name.replace(/\.yaml$/, "")).agents) {
      if (candidate.startsWith("platforms/")) scopedGlobalAdapters.add(normalize(candidate));
    }
  }

  for (const agent of agents) {
    const canonicalFile = path.join(root, ...agent.canonical_path.split("/"));
    nodes.push({
      id: `agent:${agent.id}`,
      label: agent.title || agent.id,
      file_type: "document",
      source_file: agent.canonical_path,
      source_location: sourceLine(canonicalFile, new RegExp(`^id:\\s*${agent.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`)),
      scope: agent.scope,
    });
  }

  for (const consumer of consumers) {
    const repoPath = path.join(workspace, consumer.repository);
    const directoryExists = existsSync(repoPath) && statSync(repoPath).isDirectory();
    const installation = directoryExists ? readInstallation(repoPath) : { status: "unavailable", record: null };
    const selected = selectedAgentPaths(consumer.manifests);
    const adapterTargets = new Map();
    for (const platform of consumer.platforms) {
      const capability = capabilities.platforms[platform];
      if (!capability || capability.adapterStatus !== "generated") continue;
      const candidates = selectedAdapterCandidates(capability, selected, scopedGlobalAdapters);
      for (const [source, target] of predictAdapterTargets(candidates, capability.installTarget)) {
        adapterTargets.set(`${platform}:${source}`, target);
      }
    }
    const consumerCitation = `${registryPath}#/consumers/${consumer.repository}`;
    nodes.push({
      id: `consumer:${consumer.repository}`,
      label: consumer.repository,
      file_type: "document",
      source_file: registryPath,
      source_location: consumerCitation,
      directory_exists: directoryExists,
      installation_status: installation.status,
    });
    for (const platform of consumer.platforms) {
      const platformInfo = capabilities.platforms[platform];
      if (!platformInfo) throw new Error(`Consumer ${consumer.repository} declares unknown platform: ${platform}`);
      const platformNodeId = `platform:${platform}`;
      if (!nodes.some((node) => node.id === platformNodeId)) {
        nodes.push({
          id: platformNodeId,
          label: platformInfo.label,
          file_type: "document",
          source_file: capabilityPath,
          source_location: `/platforms/${platform}`,
          adapter_status: platformInfo.adapterStatus,
          execution_surface: platformInfo.executionSurface,
        });
      }
      links.push({
        source: `consumer:${consumer.repository}`,
        target: platformNodeId,
        relation: "declares_platform",
        confidence: "EXTRACTED",
        confidence_score: 1,
        source_file: registryPath,
        source_location: consumerCitation,
        status: "declared",
        weight: 1,
      });
    }

    for (const agent of agents) {
      for (const platform of consumer.platforms) {
        const applicability = consumerAgentApplicability(agent, selected, platform, capabilities, scopedGlobalAdapters);
        let status = applicability;
        let target = null;
        let adapterSource = null;
        if (applicability === "selected") {
          const capability = capabilities.platforms[platform];
          adapterSource = expectedAdapterSource(agent, platform, capability);
          const record = installation.record;
          const recorded = record?.managedFiles.find((item) => item.source === adapterSource && item.kind === "platform-agent");
          target = recorded?.target || adapterTargets.get(`${platform}:${adapterSource}`) || null;
          const targetPath = target ? path.join(repoPath, ...target.split("/")) : null;
          const sourcePath = generatedSourcePath(adapterSource);
          const sourceExists = existsSync(sourcePath);
          const targetExists = targetPath !== null && existsSync(targetPath);
          const sourceHash = sourceExists ? hash(sourcePath) : null;
          const targetHash = targetExists ? hash(targetPath) : null;
          status = installation.status === "unavailable"
            ? "unavailable"
            : installation.status.startsWith("unknown")
              ? installation.status
              : !sourceExists
                ? "adapter_source_missing"
                : installation.status === "missing_record"
                  ? "missing_record"
                  : classifyTarget({ recorded, sourceExists, targetExists, sourceHash, targetHash });
        }
        const citationFile = status === "current" || status === "outdated" || status === "local_drift" || status === "missing_target" || status === "missing_recorded_target"
          ? `${consumer.repository}/.apt/installation.json`
          : status === "adapter_source_missing"
            ? adapterSource
            : status === "unsupported_surface" || status === "not_selected"
              ? capabilityPath
              : registryPath;
        const citationLocation = citationFile === `${consumer.repository}/.apt/installation.json`
          ? "/managedFiles"
          : citationFile === capabilityPath
            ? `/platforms/${platform}`
            : consumerCitation;
        const row = {
          repository: consumer.repository,
          agent_id: agent.id,
          agent_path: agent.canonical_path,
          platform,
          status,
          target,
          adapter_source: adapterSource,
          evidence_file: citationFile,
          evidence_location: citationLocation,
        };
        rows.push(row);
        counts[status] = (counts[status] || 0) + 1;
        links.push({
          source: `agent:${agent.id}`,
          target: `consumer:${consumer.repository}`,
          relation: "distributed_to",
          confidence: "EXTRACTED",
          confidence_score: 1,
          source_file: citationFile,
          source_location: citationLocation,
          platform,
          status,
          adapter_source: adapterSource,
          target_path: target,
          weight: 1,
        });
      }
    }
  }
  return {
    directed: true,
    multigraph: false,
    graph: {
      name: "APT agent distribution coverage",
      source_files: [catalogPath, registryPath, capabilityPath, "manifests/*.yaml", "consumer .apt/installation.json records"],
      counts,
    },
    nodes,
    links,
    rows,
    counts,
  };
}

export function coverageReport(coverage) {
  const issues = coverage.rows.filter((row) =>
    row.status !== "current" && row.status !== "not_selected" && row.status !== "unsupported_surface"
  );
  const limitations = [...new Map(
    coverage.rows
      .filter((row) => row.status === "unsupported_surface")
      .map((row) => [`${row.repository}:${row.platform}`, row]),
  ).values()];
  const lines = [
    "# APT Agent Distribution Coverage",
    "",
    "Deterministic inventory of canonical agents, declared consumer manifests/platforms, generated adapter capability, and target installation records.",
    "",
    "> This report reflects declared scope and recorded filesystem/hash evidence. A missing installation record is not proof that an agent is absent; `not_selected` means the consumer's declared manifests do not select that agent. Gemini is reported according to its command-only capability, not as a native agent adapter.",
    "",
    "## Summary",
    "",
    `- Canonical agents: ${coverage.nodes.filter((node) => node.id.startsWith("agent:")).length}`,
    `- Registered consumers: ${coverage.nodes.filter((node) => node.id.startsWith("consumer:")).length}`,
    `- Distribution observations: ${coverage.rows.length}`,
    "",
    "| Status | Count |",
    "|---|---:|",
    ...Object.entries(coverage.counts).sort(([a], [b]) => a.localeCompare(b)).map(([status, count]) => `| ${status} | ${count} |`),
    "",
    "## Findings requiring attention",
    "",
    "| Repository | Agent | Platform | Status | Target / evidence | Source citation |",
    "|---|---|---|---|---|---|",
    ...(issues.length
      ? issues.map((row) => `| ${row.repository} | ${row.agent_id} | ${row.platform} | ${row.status} | ${row.target || "—"} | \`${row.evidence_file}#${row.evidence_location}\` |`)
      : ["| — | — | — | No actionable discrepancies | — | — |"]),
    "",
    "## Declared capability limitations",
    "",
    ...(limitations.length
      ? limitations.map((row) => `- ${row.repository}: ${row.platform} has no generated agent adapter; this is a platform capability limitation, not an installation defect.`)
      : ["- None declared."]),
    "",
    "## Evidence sources",
    "",
    `- Canonical agent inventory: \`${catalogPath}\` (each agent node cites its canonical Markdown source and line).`,
    `- Consumer manifest/platform declarations: \`${registryPath}\` (consumer nodes cite the matching JSON pointer).`,
    `- Platform adapter status and target: \`${capabilityPath}\` (platform nodes cite the matching JSON pointer).`,
    "- Installation state and file hashes: each consumer's `.apt/installation.json`, when present; source/target files are checked directly.",
    "- Manifest selection: canonical `manifests/*.yaml`, including recursive `extends` inheritance.",
    "",
    "## Status meanings",
    "",
    "- `current`: generated source and installed target have identical SHA-256 hashes.",
    "- `outdated`: installed target still matches its recorded installation hash, but the generated source has changed.",
    "- `local_drift`: installed target differs from both current source and its recorded installation hash.",
    "- `missing_target`: installation record names the adapter, but its target file is absent.",
    "- `missing_recorded_target`: declared manifests select an agent, but the installation record has no managed adapter entry.",
    "- `adapter_source_missing`: a selected canonical agent has no generated adapter source for this platform.",
    "- `missing_record`: consumer directory exists but no installation record is available.",
    "- `unavailable`: registered consumer directory is absent from the workspace.",
    "- `unknown_record_invalid`: available installation-record evidence is malformed; inspect before drawing conclusions.",
    "- `unsupported_surface`: the declared platform has no generated agent adapter in the capability map.",
    "- `not_selected`: the consumer's declared manifest set does not select this domain/project agent or a scoped global adapter.",
    "",
  ];
  return lines.join("\n");
}

export function writeCoverage(coverage, destination = outputRoot) {
  mkdirSync(destination, { recursive: true });
  writeFileSync(path.join(destination, "graph.json"), `${JSON.stringify({ directed: coverage.directed, multigraph: coverage.multigraph, graph: coverage.graph, nodes: coverage.nodes, links: coverage.links }, null, 2)}\n`);
  writeFileSync(path.join(destination, "GRAPH_REPORT.md"), coverageReport(coverage));
}

function main() {
  const agents = JSON.parse(readFileSync(path.join(root, catalogPath), "utf8")).agents;
  const consumers = JSON.parse(readFileSync(path.join(root, registryPath), "utf8")).consumers;
  const capabilities = JSON.parse(readFileSync(path.join(root, capabilityPath), "utf8"));
  const coverage = buildCoverage({ agents, consumers, capabilities });
  writeCoverage(coverage);
  process.stdout.write(`Agent coverage written: ${coverage.rows.length} observations across ${consumers.length} consumers and ${agents.length} canonical agents.\n`);
  process.stdout.write(`Statuses: ${Object.entries(coverage.counts).sort(([a], [b]) => a.localeCompare(b)).map(([name, count]) => `${name}=${count}`).join(", ")}\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) main();
