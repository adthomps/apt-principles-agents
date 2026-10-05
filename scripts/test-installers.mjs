#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
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

const [managed, secondManaged] = record.managedFiles;
const managedPath = path.join(target, managed.target);
const secondManagedPath = path.join(target, secondManaged.target);
writeFileSync(managedPath, `${readFileSync(managedPath, "utf8")}\nlocal drift\n`, "utf8");
writeFileSync(secondManagedPath, `${readFileSync(secondManagedPath, "utf8")}\nsecond local drift\n`, "utf8");
let scan = JSON.parse(run(["scan", "--target", target]));
if (!scan.files.some((item) => item.status === "drifted")) throw new Error("Scan did not detect drift");

const safeSync = JSON.parse(run(["sync", "--target", target, "--apply"]));
if (!safeSync.actions.some((item) => item.action === "skipped-local-drift")) throw new Error("Sync did not preserve local drift");
const targetedPreview = JSON.parse(run(["repair", "--target", target, "--force", "--targets", managed.target]));
if (targetedPreview.actions.length !== 1 || targetedPreview.actions[0].target !== managed.target) throw new Error("Targeted repair preview exceeded its selected target");
run(["repair", "--target", target, "--apply", "--force", "--targets", managed.target]);
scan = JSON.parse(run(["scan", "--target", target]));
if (scan.files.find((item) => item.target === managed.target)?.status !== "current") throw new Error("Targeted repair did not restore the selected target");
if (scan.files.find((item) => item.target === secondManaged.target)?.status !== "drifted") throw new Error("Targeted repair changed an unselected target");
const unknownTarget = spawnSync("node", [cli, "repair", "--target", target, "--force", "--targets", "unknown/file.md"], { cwd: root });
if (unknownTarget.status === 0) throw new Error("Unknown managed target selector was accepted");
run(["repair", "--target", target, "--apply", "--force"]);
scan = JSON.parse(run(["scan", "--target", target]));
if (scan.status !== "current") throw new Error("Forced repair did not restore current state");
if (!existsSync(path.join(target, ".apt-backups"))) throw new Error("Forced repair did not create a backup");

// An unedited target installed from an older source must update without --force:
// simulate the older install by rewriting the target and recording that content's hash.
{
  const outdatedPath = path.join(target, managed.target);
  const olderContent = `${readFileSync(outdatedPath, "utf8")}\nolder source revision\n`;
  writeFileSync(outdatedPath, olderContent, "utf8");
  const recorded = JSON.parse(readFileSync(recordPath, "utf8"));
  const entry = recorded.managedFiles.find((item) => item.target === managed.target);
  entry.sha256 = createHash("sha256").update(readFileSync(outdatedPath)).digest("hex");
  writeFileSync(recordPath, `${JSON.stringify(recorded, null, 2)}\n`, "utf8");
  const outdatedScan = JSON.parse(run(["scan", "--target", target]));
  if (outdatedScan.files.find((item) => item.target === managed.target)?.status !== "outdated") throw new Error("Scan did not report an unedited, behind target as outdated");
  const outdatedSync = JSON.parse(run(["sync", "--target", target, "--apply", "--targets", managed.target]));
  if (outdatedSync.actions[0]?.action !== "updated") throw new Error("Sync did not update an unedited, outdated target");
  scan = JSON.parse(run(["scan", "--target", target]));
  if (scan.files.find((item) => item.target === managed.target)?.status !== "current") throw new Error("Outdated target is not current after sync");
}

// Design manifest (DR-015): installs generated tokens and the check, and records designVersion.
{
  const designTarget = path.join(tempRoot, "design-target");
  mkdirSync(designTarget, { recursive: true });
  run(["install", "--target", designTarget, "--manifests", "design", "--platforms", "none"]);
  const designRecord = JSON.parse(readFileSync(path.join(designTarget, ".apt", "installation.json"), "utf8"));
  const expectedVersion = readFileSync(path.join(root, "design", "VERSION"), "utf8").trim();
  if (designRecord.designVersion !== expectedVersion) throw new Error(`designVersion not recorded (got ${designRecord.designVersion})`);
  for (const file of ["generated/apt-tokens.css", "generated/apt-tokens.dark-first.css", "generated/tailwind-preset.cjs", "bin/apt-design-check.mjs"]) {
    if (!existsSync(path.join(designTarget, ".apt", "design", file))) throw new Error(`design manifest did not install ${file}`);
  }
  // A Tier 1 product that imports the generated tokens passes; one broken token fails.
  mkdirSync(path.join(designTarget, "src"), { recursive: true });
  const css = path.join(designTarget, "src", "index.css");
  writeFileSync(css, '@import "../.apt/design/generated/apt-tokens.dark-first.css";\n', "utf8");
  writeFileSync(path.join(designTarget, "apt-design.json"), JSON.stringify({ tier: 1, css: "src/index.css", lint: { roots: ["src"] } }), "utf8");
  const designCheck = path.join(designTarget, ".apt", "design", "bin", "apt-design-check.mjs");
  const passing = spawnSync("node", [designCheck], { cwd: designTarget, encoding: "utf8" });
  if (passing.status !== 0) throw new Error(`apt-design-check failed on generated tokens:\n${passing.stdout}${passing.stderr}`);
  writeFileSync(css, '@import "../.apt/design/generated/apt-tokens.dark-first.css";\n:root { --muted-foreground: 220 10% 55%; }\n', "utf8");
  const failing = spawnSync("node", [designCheck], { cwd: designTarget, encoding: "utf8" });
  if (failing.status === 0 || !failing.stdout.includes("muted-foreground")) throw new Error("apt-design-check did not fail on a drifted, low-contrast token");
  // Lint ratchet: findings at or under lint.baseline pass, findings above it fail.
  writeFileSync(css, '@import "../.apt/design/generated/apt-tokens.dark-first.css";\n', "utf8");
  writeFileSync(path.join(designTarget, "src", "view.tsx"), 'export const a = "bg-zinc-900";\nexport const b = "text-white";\n', "utf8");
  const ratchet = (baseline) => {
    writeFileSync(path.join(designTarget, "apt-design.json"), JSON.stringify({ tier: 1, css: "src/index.css", lint: { roots: ["src"], baseline } }), "utf8");
    return spawnSync("node", [designCheck, "--only", "lint"], { cwd: designTarget, encoding: "utf8" });
  };
  if (ratchet(2).status !== 0) throw new Error("apt-design-check failed lint findings within baseline");
  if (!ratchet(3).stdout.includes("lower lint.baseline to 2")) throw new Error("apt-design-check did not ask for the baseline to be lowered");
  if (ratchet(1).status === 0) throw new Error("apt-design-check passed lint findings above baseline");
}

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
