// architecture module: enforces the machine-checkable parts of references/architecture-map.json
// and the architecture review checklist.
//   boundary                    an import crosses into a zone that apt.json `forbid` rules out
//                               (web -> api implementation; shared packages -> app code)
//   no-fetch-in-presentational  fetch() inside presentational component folders
// Default forbid rules: no app imports another app, and packages import no app.
// Generalizes apt-health/scripts/check-architecture-guardrails.mjs. Add `apt-check-ignore` on the
// line, or the line above, to accept one finding.

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { ignored, lineAt, readJson, relative, walk } from "./common.mjs";

const IMPORT_PATTERNS = [
  /\b(?:import|export)\s[^'"`;]*?\bfrom\s*['"]([^'"]+)['"]/g,
  /\bimport\s*['"]([^'"]+)['"]/g,
  /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
  /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
];
const RESOLVE_EXTENSIONS = ["", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", "/index.ts", "/index.tsx", "/index.js"];

const subdirs = (dir) => (existsSync(dir) ? readdirSync(dir, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name) : []);

/**
 * Zones, aliases, forbid rules and presentational folders, from apt.json or detected:
 * apps/<name>/src (or apps/<name>) is zone <name>, packages/* is zone "packages",
 * each workspace package.json name aliases its zone, and packages may not import any app.
 */
export function resolveArchitectureConfig(repoRoot, config = {}) {
  const zones = {};
  const aliases = {};
  for (const app of subdirs(path.join(repoRoot, "apps"))) {
    // The whole app folder, not just src/: some apps keep components and features beside src/.
    const base = path.join("apps", app);
    zones[app] = [base];
    const name = readJson(path.join(repoRoot, base, "package.json"))?.name;
    if (name) (aliases[app] ||= []).push(name);
  }
  if (existsSync(path.join(repoRoot, "packages"))) {
    zones.packages = ["packages"];
    for (const pkg of subdirs(path.join(repoRoot, "packages"))) {
      const name = readJson(path.join(repoRoot, "packages", pkg, "package.json"))?.name;
      if (name) (aliases.packages ||= []).push(name);
    }
  }
  // Apps share code through packages, never by importing each other (web -> api implementation is
  // the classic case), and packages never import app code.
  const appZones = Object.keys(zones).filter((zone) => zone !== "packages");
  const detectedForbid = [
    ...appZones.flatMap((from) => appZones.filter((to) => to !== from).map((to) => ({ from, to }))),
    ...(zones.packages ? appZones.map((zone) => ({ from: "packages", to: zone })) : []),
  ];
  const presentational = ["apps/web/src/components", "apps/web/components"].filter((dir) => existsSync(path.join(repoRoot, dir)));
  return {
    zones: config.zones || zones,
    aliases: { ...aliases, ...(config.aliases || {}) },
    forbid: config.forbid || detectedForbid,
    presentational: config.presentational || presentational,
  };
}

// Boundaries are about runtime code. Tests may reach across apps to exercise contracts.
// Matched on the repo-relative path, so a checkout under a folder named "test" is still scanned.
const isTest = (repoRoot, file) => /(?:^|\/)(?:test|tests|__tests__|e2e)\/|\.(?:test|spec)\.[cm]?[jt]sx?$/.test(relative(repoRoot, file));

function resolveRelative(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier);
  for (const ext of RESOLVE_EXTENSIONS) if (existsSync(base + ext)) return base + ext;
  return base;
}

export function checkArchitecture(repoRoot, config = {}) {
  const resolved = resolveArchitectureConfig(repoRoot, config);
  const zoneRoots = Object.entries(resolved.zones)
    .flatMap(([zone, dirs]) => dirs.map((dir) => ({ zone, root: path.resolve(repoRoot, dir) })))
    .sort((a, b) => b.root.length - a.root.length); // deepest root wins
  const zoneOf = (file) => zoneRoots.find(({ root }) => file === root || file.startsWith(root + path.sep))?.zone || null;
  const aliasZone = (specifier) => {
    for (const [zone, names] of Object.entries(resolved.aliases)) {
      if (names.some((name) => specifier === name || specifier.startsWith(`${name}/`))) return zone;
    }
    return null;
  };
  const forbidden = new Set(resolved.forbid.map((rule) => `${rule.from}->${rule.to}`));

  const warnings = [];
  let scanned = 0;
  const seen = new Set();
  for (const { root } of zoneRoots) {
    for (const file of walk(root)) {
      if (seen.has(file) || isTest(repoRoot, file)) continue;
      seen.add(file);
      scanned += 1;
      const fromZone = zoneOf(file);
      const content = readFileSync(file, "utf8");
      const lines = content.split(/\r?\n/);
      for (const pattern of IMPORT_PATTERNS) {
        pattern.lastIndex = 0;
        for (const match of content.matchAll(pattern)) {
          const specifier = match[1];
          const toZone = specifier.startsWith(".") ? zoneOf(resolveRelative(file, specifier)) : aliasZone(specifier);
          if (!toZone || toZone === fromZone || !forbidden.has(`${fromZone}->${toZone}`)) continue;
          const line = lineAt(content, match.index);
          if (ignored(lines, line)) continue;
          warnings.push(`${relative(repoRoot, file)}:${line} boundary: ${fromZone} imports ${toZone} code ("${specifier}"). Use a contract or client package instead.`);
        }
      }
    }
  }
  for (const dir of resolved.presentational) {
    for (const file of walk(path.resolve(repoRoot, dir))) {
      if (isTest(repoRoot, file)) continue;
      const content = readFileSync(file, "utf8");
      const lines = content.split(/\r?\n/);
      for (const match of content.matchAll(/\bfetch\s*\(/g)) {
        const line = lineAt(content, match.index);
        if (ignored(lines, line)) continue;
        warnings.push(`${relative(repoRoot, file)}:${line} no-fetch-in-presentational: move network calls to a service or hook.`);
      }
    }
  }
  const zoneList = Object.keys(resolved.zones);
  return { warnings, summary: `${scanned} files in ${zoneList.length ? zoneList.join(", ") : "no zones"}, ${resolved.forbid.length} forbid rule(s)` };
}
