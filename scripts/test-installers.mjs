#!/usr/bin/env node
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");const temp=path.join(root,".tmp","installer-test");rmSync(temp,{recursive:true,force:true});mkdirSync(temp,{recursive:true});
for(const manifest of ["core","payments","api-modernization","documentation","product-hub","game-development","full"])execFileSync("powershell",["-NoProfile","-ExecutionPolicy","Bypass","-File",path.join(root,"installers","install-skills.ps1"),"-Target",temp,"-Manifest",manifest,"-DryRun"],{stdio:"ignore"});
execFileSync("powershell",["-NoProfile","-ExecutionPolicy","Bypass","-File",path.join(root,"installers","install-skills.ps1"),"-Target",temp,"-Manifest","core"],{stdio:"ignore"});
if(!existsSync(path.join(temp,".apt","principles","thinking","README.md")))throw new Error("PowerShell asset install failed");
execFileSync("powershell",["-NoProfile","-ExecutionPolicy","Bypass","-File",path.join(root,"installers","install-skills.ps1"),"-Target",temp,"-Manifest","game-development"],{stdio:"ignore"});
for(const relative of [path.join("principles","game-development","README.md"),path.join("skills","game-development","prototype-planner","SKILL.md"),path.join("agents","game-development","apt-game-scope-guardian.md"),path.join("templates","game-development","prototype-plan.md"),path.join("prompts","game-development","create-prototype-plan.md"),path.join("examples","game-development","browser-mini-game","README.md")])if(!existsSync(path.join(temp,".apt",relative)))throw new Error("Game development install missing "+relative);
writeFileSync(path.join(temp,"AGENTS.md"),"local\n");execFileSync("powershell",["-NoProfile","-ExecutionPolicy","Bypass","-File",path.join(root,"installers","install-platform-adapters.ps1"),"-Target",temp,"-DryRun"],{stdio:"ignore"});
execFileSync("powershell",["-NoProfile","-ExecutionPolicy","Bypass","-File",path.join(root,"installers","install-platform-adapters.ps1"),"-Target",temp,"-Force"],{stdio:"ignore"});
if(!existsSync(path.join(temp,".apt-backups")))throw new Error("PowerShell backup behavior failed");
const bash=spawnSync("bash",["--version"],{stdio:"ignore"});if(bash.status===0){execFileSync("bash",["-n",path.join(root,"installers","install-skills.sh")]);execFileSync("bash",["-n",path.join(root,"installers","install-platform-adapters.sh")]);}
rmSync(path.join(root,".tmp"),{recursive:true,force:true});console.log("Installer tests: PASS"+(bash.status===0?" (PowerShell + Bash syntax)":" (PowerShell; Bash unavailable)"));
