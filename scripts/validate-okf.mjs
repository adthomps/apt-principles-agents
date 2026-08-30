#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const okfRoot = path.join(root, "knowledge", "okf");
const errors = [];
const allowedAuthorities = new Set(["canonical", "derived", "informational"]);
const allowedConceptTypes = new Set(["Principle", "Skill", "Workflow", "Decision"]);
const actorPattern = /^(human|agent|process):[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)?$/;
const timestampPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

function relative(file) {
  return path.relative(root, file).replaceAll("\\", "/");
}

function files(directory) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === ".git" || entry.name === "node_modules" || entry.name === ".tmp" || entry.name === ".wrangler" || entry.name === "graphify-out") return [];
    const child = path.join(directory, entry.name);
    return entry.isDirectory() ? files(child) : [child];
  });
}

function splitTopLevel(value, separator = ",") {
  const parts = [];
  let current = "";
  let depth = 0;
  let quote = null;
  for (let index = 0; index < value.length; index += 1) {
    const char = value[index];
    const previous = value[index - 1];
    if ((char === '"' || char === "'") && previous !== "\\") {
      quote = quote === char ? null : quote || char;
    }
    if (!quote) {
      if (char === "[" || char === "{") depth += 1;
      if (char === "]" || char === "}") depth -= 1;
      if (char === separator && depth === 0) {
        parts.push(current.trim());
        current = "";
        continue;
      }
    }
    current += char;
  }
  if (current.trim()) parts.push(current.trim());
  return parts;
}

function unquote(value) {
  const trimmed = String(value || "").trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseValue(value) {
  const trimmed = value.trim();
  if (trimmed === "true") return true;
  if (trimmed === "false") return false;
  if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
    const inner = trimmed.slice(1, -1).trim();
    return inner ? splitTopLevel(inner).map(parseValue) : [];
  }
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    const result = {};
    const inner = trimmed.slice(1, -1).trim();
    for (const pair of inner ? splitTopLevel(inner) : []) {
      const [key, ...rest] = splitTopLevel(pair, ":");
      if (!key || !rest.length) throw new Error(`Invalid inline object item: ${pair}`);
      result[unquote(key)] = parseValue(rest.join(":"));
    }
    return result;
  }
  return unquote(trimmed);
}

function parseFrontmatter(text, file) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) throw new Error(`Missing frontmatter: ${relative(file)}`);
  const data = {};
  const lines = match[1].split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trim() || line.trim().startsWith("#")) continue;
    const item = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!item) throw new Error(`Unsupported YAML frontmatter line: ${relative(file)}: ${line}`);
    const [, key, raw] = item;
    if (raw === "") {
      const values = [];
      while (lines[index + 1]?.match(/^\s+-\s+/)) {
        index += 1;
        values.push(parseValue(lines[index].replace(/^\s+-\s+/, "")));
      }
      data[key] = values;
      continue;
    }
    data[key] = parseValue(raw);
  }
  return data;
}

function assert(condition, message) {
  if (!condition) errors.push(message);
}

function validateSources(file, data) {
  assert(Array.isArray(data.sources) && data.sources.length > 0, `OKF concept sources must be a non-empty array: ${relative(file)}`);
  if (!Array.isArray(data.sources)) return;
  for (const [index, source] of data.sources.entries()) {
    assert(source && typeof source === "object" && !Array.isArray(source), `OKF source must be an object: ${relative(file)} sources[${index}]`);
    if (!source || typeof source !== "object" || Array.isArray(source)) continue;
    for (const field of ["id", "resource", "title"]) assert(Boolean(source[field]), `OKF source missing ${field}: ${relative(file)} sources[${index}]`);
    if (source.resource && !/^https?:\/\//.test(source.resource)) {
      const sourcePath = source.resource.replace(/^apt-principles-agents\//, "");
      assert(existsSync(path.join(root, sourcePath)), `OKF source resource path missing: ${relative(file)} -> ${source.resource}`);
    }
  }
}

function validateReviewField(file, data, field) {
  if (!data[field]) return;
  const entries = Array.isArray(data[field]) ? data[field] : [data[field]];
  for (const [index, item] of entries.entries()) {
    assert(item && typeof item === "object" && !Array.isArray(item), `OKF ${field} entry must be an object: ${relative(file)} ${field}[${index}]`);
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    assert(actorPattern.test(item.by || ""), `OKF ${field}.by must use human:, agent:, or process: actor format: ${relative(file)} ${field}[${index}]`);
    assert(timestampPattern.test(item.at || ""), `OKF ${field}.at must be ISO 8601 with timezone: ${relative(file)} ${field}[${index}]`);
  }
}

function validateConcept(file) {
  let data;
  try {
    data = parseFrontmatter(readFileSync(file, "utf8"), file);
  } catch (error) {
    errors.push(error.message);
    return;
  }

  const rel = relative(file);
  for (const field of ["type", "title", "description", "status", "owner", "last_updated", "source_paths", "sources", "authority"]) {
    assert(data[field] !== undefined && data[field] !== "", `OKF concept missing ${field}: ${rel}`);
  }
  assert(allowedConceptTypes.has(data.type), `Unexpected OKF concept type ${data.type}: ${rel}`);
  assert(allowedAuthorities.has(data.authority), `Unexpected OKF authority ${data.authority}: ${rel}`);
  assert(Array.isArray(data.source_paths) && data.source_paths.length > 0, `OKF source_paths must be a non-empty array: ${rel}`);
  if (Array.isArray(data.source_paths)) {
    for (const sourcePath of data.source_paths) {
      assert(typeof sourcePath === "string", `OKF source_paths entries must be strings: ${rel}`);
      if (typeof sourcePath === "string" && !/^https?:\/\//.test(sourcePath)) {
        const localPath = sourcePath.replace(/^apt-principles-agents\//, "");
        assert(existsSync(path.join(root, localPath)), `OKF source_paths entry missing: ${rel} -> ${sourcePath}`);
      }
    }
  }
  assert(Array.isArray(data.tags) && data.tags.length > 0, `OKF concept tags must be a non-empty array: ${rel}`);
  assert(typeof data.resource === "string" && data.resource.length > 0, `OKF concept missing resource: ${rel}`);
  if (data.resource && !/^https?:\/\//.test(data.resource)) {
    const localResource = data.resource.replace(/^apt-principles-agents\//, "");
    assert(existsSync(path.join(root, localResource)), `OKF resource path missing: ${rel} -> ${data.resource}`);
  }
  assert(Boolean(data.verified) || Boolean(data.generated), `OKF concept must include verified or generated metadata: ${rel}`);
  validateReviewField(file, data, "verified");
  validateReviewField(file, data, "generated");
  validateSources(file, data);
  if (data.generated && data.authority === "canonical") errors.push(`Generated OKF concept cannot be canonical authority: ${rel}`);
}

if (!existsSync(okfRoot)) {
  errors.push("Missing OKF bundle root knowledge/okf");
} else {
  const indexFile = path.join(okfRoot, "index.md");
  if (!existsSync(indexFile)) {
    errors.push("OKF bundle missing knowledge/okf/index.md");
  } else {
    try {
      const index = parseFrontmatter(readFileSync(indexFile, "utf8"), indexFile);
      assert(index.okf_version === "0.2", "OKF root index must declare okf_version 0.2");
    } catch (error) {
      errors.push(error.message);
    }
  }
  for (const file of files(okfRoot).filter((item) => item.endsWith(".md"))) {
    const basename = path.basename(file);
    if (basename === "index.md" || basename === "log.md") continue;
    validateConcept(file);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  console.error(`\nOKF validation failed: ${errors.length} issue(s)`);
  process.exit(1);
}
console.log("OKF validation: PASS");
