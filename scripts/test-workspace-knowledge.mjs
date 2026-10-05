#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { auditKnowledge, loadKnowledge, readIdentity, renderProjects } from "./workspace-knowledge-lib.mjs";

// The real registry must be internally consistent; this runs without the sibling repos (as in CI).
const sourceRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const registry = loadKnowledge(sourceRoot);
const grouped = registry.groups.flatMap((group) => group.repositories);
assert.equal(new Set(grouped).size, grouped.length, "a repository is in more than one group");
for (const feed of registry.feeds) for (const repository of [feed.to, ...feed.from]) assert.ok(grouped.includes(repository), `feed repository ${repository} is not grouped`);
for (const entry of registry.copies) for (const file of [entry.source, entry.copy]) assert.ok(grouped.includes(file.split("/")[0]), `copy path ${file} is not in a grouped repository`);

// Fixture workspace.
const root = fs.mkdtempSync(path.join(os.tmpdir(), "apt-workspace-knowledge-"));
const write = (file, text) => { fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); fs.writeFileSync(path.join(root, file), text); };
const identity = (folder, name, description, status = "active") => write(`${folder}/docs/project-identity.md`, `---\r\nfolder: ${folder}\r\nname: ${name}\r\nstatus: ${status}\r\n---\r\n\r\n# ${name}\r\n\r\n${description}\r\n`);
const git = (folder, ...args) => execFileSync("git", ["-C", path.join(root, folder), ...args], { stdio: "ignore", env: { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@example.test", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@example.test" } });
const commitAt = (folder, iso) => { write(`${folder}/${iso.replace(/\W/g, "")}.txt`, iso); git(folder, "add", "-A"); execFileSync("git", ["-C", path.join(root, folder), "commit", "-q", "-m", iso], { stdio: "ignore", env: { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@example.test", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@example.test", GIT_AUTHOR_DATE: iso, GIT_COMMITTER_DATE: iso } }); };

identity("training", "Training", "Main knowledge | source.");
identity("toolbox", "Toolbox", "Feeds training.");
identity("move", "Move", "Source of truth.", "unconfirmed");
write("move/data/catalog.json", '{"a":1}\n');
write("tool/catalog.json", '{"a":1}\r\n');
identity("tool", "Tool", "Copies the catalog.");
for (const folder of ["training", "toolbox"]) git(folder, "init", "-q");
commitAt("training", "2026-01-01T00:00:00Z");
commitAt("toolbox", "2026-01-01T00:00:00Z");

const knowledge = {
  last_updated: "2026-10-04",
  groups: [
    { id: "a", title: "Group A", intro: "Intro for A.", repositories: ["training", "toolbox"] },
    { id: "b", title: "Group B", repositories: ["move", "tool"] },
  ],
  feeds: [{ to: "training", from: ["toolbox"] }],
  copies: [{ id: "catalog", source: "move/data/catalog.json", copy: "tool/catalog.json", refresh: "copy it" }],
};

assert.deepEqual(readIdentity(root, "training"), { folder: "training", name: "Training", status: "active", description: "Main knowledge | source." });
const rendered = renderProjects({ workspaceRoot: root, knowledge });
assert.match(rendered, /## Group A\n\nIntro for A\.\n\n\| Folder \| Name \| Description \|/);
assert.match(rendered, /\| \[training\]\(training\/docs\/project-identity\.md\) \| Training \| Main knowledge \\\| source\. \|/);
assert.match(rendered, /## Group B\n\n\| Folder/);

// Missing PROJECTS.md fails; a current one passes. CRLF differences in copies are ignored; same-second commits are not "newer".
let result = auditKnowledge({ workspaceRoot: root, knowledge });
assert.equal(result.projects, "missing");
write("PROJECTS.md", rendered);
result = auditKnowledge({ workspaceRoot: root, knowledge });
assert.equal(result.status, "passed", result.errors.join("; "));
assert.equal(result.copies[0].status, "current");
assert.ok(result.warnings.some((warning) => warning.startsWith("move: description not confirmed")));
assert.deepEqual(result.feeds[0].newerSources, []);

// A newer feeder commit warns; drift, a stale PROJECTS.md and an ungrouped identity fail.
commitAt("toolbox", "2026-02-01T00:00:00Z");
write("tool/catalog.json", '{"a":2}\n');
identity("stray", "Stray", "Not grouped.");
identity("training", "Training", "Changed description.");
result = auditKnowledge({ workspaceRoot: root, knowledge });
assert.equal(result.status, "failed");
assert.deepEqual(result.feeds[0].newerSources, [{ repository: "toolbox", commitsSince: 1 }]);
assert.equal(result.copies[0].status, "drifted");
assert.equal(result.projects, "stale");
assert.ok(result.errors.some((error) => error.startsWith("stray has an identity file but is not in any group")));

// Duplicate grouping and a folder mismatch fail.
identity("tool", "Tool", "Wrong folder.");
fs.writeFileSync(path.join(root, "tool/docs/project-identity.md"), fs.readFileSync(path.join(root, "tool/docs/project-identity.md"), "utf8").replace("folder: tool", "folder: other"));
result = auditKnowledge({ workspaceRoot: root, knowledge: { ...knowledge, groups: [...knowledge.groups, { id: "c", title: "C", repositories: ["toolbox"] }] } });
assert.ok(result.errors.some((error) => error === "toolbox is in groups a and c"));
assert.ok(result.errors.some((error) => error === 'tool: identity folder is "other"'));

fs.rmSync(root, { recursive: true, force: true });
console.log("Workspace knowledge tests passed.");
