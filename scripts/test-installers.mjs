#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempRoot = path.join(root, ".tmp", "installer-tests");
const target = path.join(tempRoot, "target");
const legacyTarget = path.join(tempRoot, "legacy-target");
const malformedTarget = path.join(tempRoot, "malformed-target");
const cli = path.join(root, "scripts", "apt-assets.mjs");

function run(command, options = {}) {
  return execFileSync("node", [cli, ...command], { cwd: root, encoding: "utf8", ...options });
}

rmSync(tempRoot, { recursive: true, force: true });
mkdirSync(target, { recursive: true });
mkdirSync(legacyTarget, { recursive: true });
mkdirSync(path.join(malformedTarget, ".apt"), { recursive: true });

const parity = JSON.parse(run(["check-parity"]));
if (parity.status !== "passed") throw new Error(`Manifest parity failed: ${parity.issues.join(", ")}`);

const detected = JSON.parse(run(["detect", "--target", target]));
if (!detected.manifests.includes("core")) throw new Error("Detection did not include core");

run(["install", "--target", target, "--manifests", "core", "--platforms", "none", "--dry-run"]);
const unsafe = spawnSync("node", [cli, "install", "--target", target, "--manifests", "../outside", "--dry-run"], { cwd: root });
if (unsafe.status === 0) throw new Error("Unsafe manifest name was accepted");
run(["install", "--target", target, "--manifests", "core", "--platforms", "none"]);
const recordPath = path.join(target, ".apt", "installation.json");
if (!existsSync(recordPath)) throw new Error("Installation record was not created");
const record = JSON.parse(readFileSync(recordPath, "utf8"));
if (!record.schemaVersion || !record.source?.commit || !record.managedFiles?.length) throw new Error("Installation record is incomplete");

const managed = record.managedFiles[0];
const managedPath = path.join(target, managed.target);
writeFileSync(managedPath, `${readFileSync(managedPath, "utf8")}\nlocal drift\n`, "utf8");
let scan = JSON.parse(run(["scan", "--target", target]));
if (!scan.files.some((item) => item.status === "drifted")) throw new Error("Scan did not detect drift");

const safeSync = JSON.parse(run(["sync", "--target", target, "--apply"]));
if (!safeSync.actions.some((item) => item.action === "skipped-local-drift")) throw new Error("Sync did not preserve local drift");
run(["repair", "--target", target, "--apply", "--force"]);
scan = JSON.parse(run(["scan", "--target", target]));
if (scan.status !== "current") throw new Error("Forced repair did not restore current state");
if (!existsSync(path.join(target, ".apt-backups"))) throw new Error("Forced repair did not create a backup");

const uninstallPreview = JSON.parse(run(["uninstall", "--target", target]));
if (!uninstallPreview.actions.some((item) => item.action === "would-remove")) throw new Error("Uninstall preview is incomplete");
run(["uninstall", "--target", target, "--apply"]);
if (existsSync(recordPath)) throw new Error("Applied uninstall retained the installation record");

writeFileSync(path.join(legacyTarget, ".agent-standards.json"), `${JSON.stringify({
  source: "legacy",
  profiles: ["apt-core", "documentation", "api-review"],
  managedFiles: [],
}, null, 2)}\n`, "utf8");
run(["migrate-legacy", "--target", legacyTarget, "--apply", "--platforms", "none"]);
if (existsSync(path.join(legacyTarget, ".agent-standards.json"))) throw new Error("Legacy manifest was not removed");
if (!existsSync(path.join(legacyTarget, ".apt", "installation.json"))) throw new Error("Legacy migration did not create the new record");

writeFileSync(path.join(malformedTarget, ".apt", "installation.json"), "{\"schemaVersion\":1}\n");
const malformed = spawnSync("node", [cli, "scan", "--target", malformedTarget], { cwd: root });
if (malformed.status === 0) throw new Error("Malformed installation record was accepted");

const powershell = process.platform === "win32"
  ? (spawnSync("pwsh", ["-NoProfile", "-Command", "$PSVersionTable.PSVersion.ToString()"], { stdio: "ignore" }).status === 0 ? "pwsh" : "powershell")
  : null;
if (powershell) {
  execFileSync(powershell, [
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", path.join(root, "installers", "install-skills.ps1"),
    "-Target", target,
    "-Manifest", "core",
    "-DryRun",
  ], { stdio: "ignore" });
}

const bash = spawnSync("bash", ["--version"], { stdio: "ignore" });
let bashLifecycleTested = false;
if (bash.status === 0) {
  const toBashPath = (value) => {
    if (process.platform !== "win32") return value;
    const flavor = execFileSync("bash", [
      "-lc",
      "if command -v wslpath >/dev/null 2>&1; then printf wsl; elif command -v cygpath >/dev/null 2>&1; then printf msys; else printf unknown; fi",
    ], { encoding: "utf8" }).trim();
    const match = value.match(/^([A-Za-z]):[\\/](.*)$/);
    if (!match) return value.replaceAll("\\", "/");
    const drive = match[1].toLowerCase();
    const remainder = match[2].replaceAll("\\", "/");
    if (flavor === "wsl") return `/mnt/${drive}/${remainder}`;
    if (flavor === "msys") return `/${drive}/${remainder}`;
    return value.replaceAll("\\", "/");
  };
  const bashInstaller = toBashPath(path.join(root, "installers", "install-skills.sh"));
  const bashTarget = toBashPath(target);
  execFileSync("bash", ["-n", bashInstaller]);
  const bashNode = spawnSync("bash", ["-lc", "command -v node >/dev/null 2>&1"], { stdio: "ignore" });
  if (bashNode.status === 0) {
    execFileSync("bash", [bashInstaller, "--target", bashTarget, "--manifest", "core", "--dry-run"], { stdio: "ignore" });
    bashLifecycleTested = true;
  }
}

rmSync(tempRoot, { recursive: true, force: true });
console.log(`Installer lifecycle tests: PASS (${[
  powershell && "PowerShell",
  bashLifecycleTested ? "Bash" : bash.status === 0 ? "Bash syntax" : null,
].filter(Boolean).join(" + ") || "Node lifecycle"})`);
