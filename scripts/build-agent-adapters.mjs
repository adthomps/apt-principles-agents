#!/usr/bin/env node
// Generate platform-native agent adapters from the canonical agents/<domain>/<id>.md
// set. The canonical file is the single source; everything under
// platforms/<platform>/source/agents/** that has a canonical counterpart is
// reproducible from here. Adapter-only files (no canonical source) are left
// untouched and reported.
//
//   node scripts/build-agent-adapters.mjs            # write adapters
//   node scripts/build-agent-adapters.mjs --check    # exit 1 if any differ
//
// Currently emits the Claude adapter. Codex/Cursor/Copilot/generic emitters plug
// in the same way once their target format is settled.

import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync, statSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");

// abstract capability -> Claude Code tool identifiers
const CLAUDE_TOOLS = {
  read: ["Read"],
  search: ["Grep", "Glob"],
  edit: ["Edit", "Write", "MultiEdit"],
  execute: ["Bash"],
  web: ["WebFetch", "WebSearch"],
  todo: ["TodoWrite"],
};
const MODEL_FOR_TIER = { standard: "sonnet", deep: "opus" };

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { fm: {}, body: text };
  const fm = {};
  const lines = m[1].split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const kv = lines[i].match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (value === "") {
      const list = [];
      while (i + 1 < lines.length && /^\s+-\s+/.test(lines[i + 1])) {
        list.push(lines[i + 1].replace(/^\s+-\s+/, "").trim().replace(/^["']|["']$/g, ""));
        i += 1;
      }
      fm[kv[1]] = list;
    } else if (value.startsWith("[") && value.endsWith("]")) {
      fm[kv[1]] = value.slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
    } else {
      fm[kv[1]] = value.replace(/^["']|["']$/g, "");
    }
  }
  return { fm, body: text.slice(m[0].length) };
}

// Adapters are consumed inside a target repo where repo-relative links are
// meaningless. Replace the "## Required Skills" section with plain skill
// identifiers, and flatten any remaining [text](relative) links to text.
function adaptBody(body, usesSkills) {
  const lines = body.split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length; i += 1) {
    if (lines[i].trim() === "## Required Skills") {
      out.push(lines[i], "");
      if (usesSkills.length === 0) {
        out.push("- Use the closest canonical APT skill installed under `.claude/skills/`.");
      } else {
        for (const s of usesSkills) {
          const name = s.split("/").pop();
          out.push(`- \`${name}\` — installed under \`.claude/skills/${name}/\`.`);
        }
      }
      out.push("");
      while (i + 1 < lines.length && !/^##\s/.test(lines[i + 1])) i += 1;
      continue;
    }
    out.push(lines[i]);
  }
  return out
    .join("\n")
    .replace(/\[([^\]]+)\]\((?!https?:|mailto:|#)[^)]+\)/g, "$1")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd() + "\n";
}

function claudeAdapter(fm, body) {
  const tools = [...new Set((fm.tools || []).flatMap((cap) => CLAUDE_TOOLS[cap] || []))];
  const canonical = `apt-principles-agents/agents/${fm.domain}/${fm.canonicalBase}.md`;
  const front = ["---", `name: ${fm.id}`, `description: ${JSON.stringify(fm.description)}`];
  // Claude Code native keys first; APT provenance metadata after so validate-repository
  // still sees a well-formed artifact. Claude Code ignores keys it does not know.
  if (tools.length && tools.length < 12) front.push(`tools: ${tools.join(", ")}`);
  front.push(`model: ${MODEL_FOR_TIER[fm.model_tier] || "sonnet"}`);
  front.push(
    "kind: agent-adapter",
    `domain: ${fm.domain}`,
    `status: ${fm.status || "active"}`,
    `owner: ${fm.owner || "APT"}`,
    `last_updated: ${fm.last_updated}`,
    `source_paths: ["${canonical}"]`,
    `title: ${JSON.stringify(fm.title || fm.id)}`,
    "---",
    `<!-- Generated from ${canonical} by scripts/build-agent-adapters.mjs. Edit the canonical file, not this one. -->`,
    "",
  );
  return front.join("\n") + adaptBody(body, fm.uses_skills || []);
}

function aptMeta(fm, canonical, extra = []) {
  return [
    ...extra,
    "kind: agent-adapter",
    `domain: ${fm.domain}`,
    `status: ${fm.status || "active"}`,
    `owner: ${fm.owner || "APT"}`,
    `last_updated: ${fm.last_updated}`,
    `source_paths: ["${canonical}"]`,
    `title: ${JSON.stringify(fm.title || fm.id)}`,
    "---",
    `<!-- Generated from ${canonical} by scripts/build-agent-adapters.mjs. Edit the canonical file, not this one. -->`,
    "",
  ];
}

// Codex reads AGENTS.md; there is no sub-agent runtime, so the adapter is a
// titled prompt block a human or CI invokes by name.
function codexAdapter(fm, body) {
  const canonical = `apt-principles-agents/agents/${fm.domain}/${fm.canonicalBase}.md`;
  const front = ["---", `name: ${fm.id}`, `description: ${JSON.stringify(fm.description)}`, ...aptMeta(fm, canonical)];
  return front.join("\n") + adaptBody(body, fm.uses_skills || []);
}

// Cursor .mdc rule: description + globs steer when the rule attaches.
function cursorAdapter(fm, body) {
  const canonical = `apt-principles-agents/agents/${fm.domain}/${fm.canonicalBase}.md`;
  const front = [
    "---",
    `description: ${JSON.stringify(fm.description)}`,
    `globs: ["**/*"]`,
    "alwaysApply: false",
    ...aptMeta(fm, canonical, [`name: ${fm.id}`]),
  ];
  return front.join("\n") + adaptBody(body, fm.uses_skills || []);
}

// GitHub Copilot chat mode: description + a coarse tools list.
const COPILOT_TOOLS = { read: ["codebase", "search"], search: ["search"], edit: ["editFiles"], execute: ["runCommands"], web: ["fetch"], todo: [] };
function copilotAdapter(fm, body) {
  const canonical = `apt-principles-agents/agents/${fm.domain}/${fm.canonicalBase}.md`;
  const tools = [...new Set((fm.tools || []).flatMap((c) => COPILOT_TOOLS[c] || []))];
  const front = [
    "---",
    `description: ${JSON.stringify(fm.description)}`,
    `tools: [${tools.map((t) => JSON.stringify(t)).join(", ")}]`,
    ...aptMeta(fm, canonical, [`name: ${fm.id}`]),
  ];
  return front.join("\n") + adaptBody(body, fm.uses_skills || []);
}

const EMITTERS = {
  claude: { dir: path.join(root, "platforms", "claude", "source", "agents"), render: claudeAdapter, ext: ".md" },
  codex: { dir: path.join(root, "platforms", "codex", "source", "agents"), render: codexAdapter, ext: ".md" },
  cursor: { dir: path.join(root, "platforms", "cursor", "source", "agents"), render: cursorAdapter, ext: ".mdc" },
};
void copilotAdapter; // emitter drafted; not wired until .github/agents install lands

const canonical = walk(path.join(root, "agents")).filter((f) => f.endsWith(".md") && !f.endsWith("README.md"));
const diffs = [];
let written = 0;
const owned = Object.fromEntries(Object.keys(EMITTERS).map((p) => [p, new Set()]));
const catalog = [];

for (const file of canonical) {
  const { fm, body } = parseFrontmatter(readFileSync(file, "utf8"));
  fm.canonicalBase = path.basename(file, ".md");
  if (!fm.id) {
    diffs.push(`${path.relative(root, file)}: no id (run migrate-agent-frontmatter first)`);
    continue;
  }
  catalog.push({
    id: fm.id,
    title: fm.title,
    domain: fm.domain,
    scope: fm.scope,
    description: fm.description,
    applies_principles: fm.applies_principles || [],
    uses_skills: fm.uses_skills || [],
    tools: fm.tools || [],
    model_tier: fm.model_tier,
    autonomy: fm.autonomy,
    canonical_path: `agents/${fm.domain}/${fm.canonicalBase}.md`,
  });
  for (const [platform, emitter] of Object.entries(EMITTERS)) {
    const placement = fm.scope === "global" ? "" : `${fm.domain}/`;
    const outPath = path.join(emitter.dir, `${placement}${fm.id}${emitter.ext}`);
    owned[platform].add(path.relative(emitter.dir, outPath).replaceAll("\\", "/"));
    const next = emitter.render(fm, body);
    const current = existsSync(outPath) ? readFileSync(outPath, "utf8") : null;
    if (current === next) continue;
    if (check) {
      diffs.push(`${path.relative(root, outPath)}: ${current === null ? "missing" : "out of date"}`);
    } else {
      mkdirSync(path.dirname(outPath), { recursive: true });
      writeFileSync(outPath, next, "utf8");
      written += 1;
    }
  }
}

// Report generated files whose canonical source was deleted (stale adapters).
const adapterOnly = [];
for (const [platform, emitter] of Object.entries(EMITTERS)) {
  for (const f of walk(emitter.dir)) {
    const rel = path.relative(emitter.dir, f).replaceAll("\\", "/");
    if (!rel.endsWith(emitter.ext)) continue;
    if (owned[platform].has(rel)) continue;
    const looksGenerated = readFileSync(f, "utf8").includes("by scripts/build-agent-adapters.mjs");
    if (looksGenerated) {
      diffs.push(`${path.relative(root, f)}: generated adapter with no canonical source`);
      if (!check) rmSync(f);
    } else {
      adapterOnly.push(rel);
    }
  }
}

// Machine-readable index for non-Claude systems and CI.
catalog.sort((a, b) => a.id.localeCompare(b.id));
const catalogPath = path.join(root, "references", "agent-catalog.json");
const catalogJson = JSON.stringify(
  { generatedBy: "scripts/build-agent-adapters.mjs", count: catalog.length, agents: catalog },
  null,
  2,
) + "\n";
if (existsSync(catalogPath) && readFileSync(catalogPath, "utf8") === catalogJson) {
  // up to date
} else if (check) {
  diffs.push("references/agent-catalog.json: out of date");
} else {
  writeFileSync(catalogPath, catalogJson, "utf8");
}

if (diffs.length) process.stdout.write(diffs.map((d) => `- ${d}`).join("\n") + "\n");
process.stdout.write(
  `${check ? "check" : "build"}-agent-adapters: ${canonical.length} canonical, ` +
    `${check ? diffs.length + " out of sync" : written + " written"}, ` +
    `${adapterOnly.length} adapter-only file(s) left untouched\n`,
);
process.exit(check && diffs.length ? 1 : 0);
