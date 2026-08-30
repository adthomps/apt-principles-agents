#!/usr/bin/env node
// Maintain the bidirectional principle <-> agent link:
//   - agents/<domain>/<id>.md gets a "## Enforces" section listing the principles
//     in its applies_principles frontmatter.
//   - each referenced principles/**/*.md gets a "## Applied by" section listing the
//     agents that enforce it.
//   - docs/distribution/PRINCIPLE-AGENT-HOOK-CROSSWALK.md is regenerated.
//
//   node scripts/build-principle-agent-links.mjs           # write
//   node scripts/build-principle-agent-links.mjs --check    # exit 1 if stale

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const check = process.argv.includes("--check");
const changed = [];

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p) : [p];
  });
}

function parse(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const fm = {};
  if (m) {
    const lines = m[1].split(/\r?\n/);
    for (let i = 0; i < lines.length; i += 1) {
      const kv = lines[i].match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
      if (!kv) continue;
      if (kv[2].trim() === "") {
        const list = [];
        while (i + 1 < lines.length && /^\s+-\s+/.test(lines[i + 1])) {
          list.push(lines[i + 1].replace(/^\s+-\s+/, "").trim().replace(/^["']|["']$/g, ""));
          i += 1;
        }
        fm[kv[1]] = list;
      } else if (kv[2].trim().startsWith("[") && kv[2].trim().endsWith("]")) {
        fm[kv[1]] = kv[2].trim().slice(1, -1).split(",").map((s) => s.trim().replace(/^["']|["']$/g, "")).filter(Boolean);
      } else {
        fm[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  }
  return { fm, body: m ? text.slice(m[0].length) : text, hasFm: Boolean(m) };
}

function titleOf(file) {
  const t = readFileSync(file, "utf8");
  const { fm } = parse(t);
  return fm.title || t.match(/^#\s+(.+)$/m)?.[1]?.trim() || path.basename(file, ".md");
}

// Replace an existing "## <Heading>" section (up to the next "## " or EOF) with
// new lines, or insert it before `beforeHeading` if absent.
function upsertSection(body, heading, lines, beforeHeading) {
  const block = [`## ${heading}`, "", ...lines, ""].join("\n");
  const re = new RegExp(`(^|\\n)## ${heading}\\r?\\n[\\s\\S]*?(?=\\n## |\\n?$)`);
  if (re.test(body)) return body.replace(re, `$1${block}`);
  const at = body.indexOf(`## ${beforeHeading}`);
  if (at >= 0) return body.slice(0, at) + block + "\n" + body.slice(at);
  return body.trimEnd() + "\n\n" + block + "\n";
}

function write(file, next) {
  const cur = existsSync(file) ? readFileSync(file, "utf8") : null;
  if (cur === next) return;
  changed.push(path.relative(root, file).replaceAll("\\", "/"));
  if (!check) writeFileSync(file, next, "utf8");
}

// --- gather ---
const agents = walk(path.join(root, "agents"))
  .filter((f) => f.endsWith(".md") && !f.endsWith("README.md"))
  .map((file) => {
    const { fm, body } = parse(readFileSync(file, "utf8"));
    return { file, fm, body, rel: path.relative(root, file).replaceAll("\\", "/") };
  });

const byPrinciple = new Map(); // principle rel path -> [agent, ...]
for (const a of agents) {
  for (const p of a.fm.applies_principles || []) {
    if (!byPrinciple.has(p)) byPrinciple.set(p, []);
    byPrinciple.get(p).push(a);
  }
}

// --- 1. "## Enforces" on each agent ---
for (const a of agents) {
  const principles = a.fm.applies_principles || [];
  const rows = principles.length
    ? principles.map((p) => {
        const abs = path.join(root, p);
        const title = existsSync(abs) ? titleOf(abs) : p;
        const relLink = path.relative(path.dirname(a.file), abs).replaceAll("\\", "/");
        return `- [${title}](${relLink}) — check the work against this principle and cite the clause any finding rests on.`;
      })
    : ["- No principle is enforced directly; this agent routes or classifies only."];
  const nextBody = upsertSection(a.body, "Enforces", rows, "Inputs");
  write(a.file, readFileSync(a.file, "utf8").replace(a.body, nextBody));
}

// --- 2. "## Applied by" on each referenced principle ---
for (const [p, list] of byPrinciple) {
  const abs = path.join(root, p);
  if (!existsSync(abs)) {
    changed.push(`MISSING PRINCIPLE ${p}`);
    continue;
  }
  const { body } = parse(readFileSync(abs, "utf8"));
  const rows = [...list]
    .sort((x, y) => x.fm.id.localeCompare(y.fm.id))
    .map((a) => {
      const relLink = path.relative(path.dirname(abs), a.file).replaceAll("\\", "/");
      return `- [${a.fm.id}](${relLink}) — ${a.fm.description}`;
    });
  const nextBody = upsertSection(body, "Applied by", rows, "Related");
  write(abs, readFileSync(abs, "utf8").replace(body, nextBody));
}

// --- 3. crosswalk (linked principles + unenforced doctrine in enforceable domains) ---
const ENFORCEABLE = ["security-risk", "payments", "api", "architecture", "ai", "ecommerce"];
const linkedRows = [...byPrinciple.entries()]
  .sort((a, b) => a[0].localeCompare(b[0]))
  .map(([p, list]) => {
    const ids = [...list].map((a) => a.fm.id).sort();
    const skills = [...new Set(list.flatMap((a) => a.fm.uses_skills || []))].sort();
    return `| \`${p}\` | ${ids.map((i) => `\`${i}\``).join(", ")} | ${skills.map((s) => `\`${s.split("/").pop()}\``).join(", ") || "—"} | agent |`;
  });
const linkedSet = new Set(byPrinciple.keys());
const unenforcedRows = walk(path.join(root, "principles"))
  .map((f) => path.relative(root, f).replaceAll("\\", "/"))
  .filter((p) => p.endsWith(".md") && !p.endsWith("README.md") && !p.includes("/quick-reference/"))
  .filter((p) => ENFORCEABLE.includes(p.split("/")[1]) && !linkedSet.has(p))
  .sort()
  .map((p) => `| \`${p}\` | — | — | **unenforced** |`);
const rows = [...linkedRows, ...unenforcedRows];
const crosswalk = `---
title: Principle / Agent / Hook Crosswalk
kind: catalog
domain: governance
status: active
owner: APT
last_updated: 2026-08-30
source_paths: ["apt-principles-agents/scripts/build-principle-agent-links.mjs"]
---

# Principle / Agent / Hook Crosswalk

Generated by \`scripts/build-principle-agent-links.mjs\` from every agent's
\`applies_principles\` frontmatter. Do not hand-edit. A principle in an
enforceable domain with no agent row is unenforced doctrine.

| Principle | Enforced by agents | Via skills | Enforcement |
| --- | --- | --- | --- |
${rows.join("\n")}

Hooks: \`SessionStart\` (\`session-sync-check.mjs\`) is repo-wide, not
principle-specific. Per-principle \`PreToolUse\` / \`Stop\` gates are tracked here
once added.
`;
write(path.join(root, "docs", "distribution", "PRINCIPLE-AGENT-HOOK-CROSSWALK.md"), crosswalk);

if (changed.length) process.stdout.write(changed.map((c) => `- ${c}`).join("\n") + "\n");
process.stdout.write(
  `${check ? "check" : "build"}-principle-agent-links: ${agents.length} agents, ${byPrinciple.size} principles linked, ${changed.length} ${check ? "stale" : "written"}\n`,
);
process.exit(check && changed.length ? 1 : 0);
