# Changelog

## Unreleased

- Added the APT Agent Harness layer with canonical harness agents, routing docs, context packs, token-efficiency guidance, catalogs, governance architecture, risk assessment, and migration roadmap.
- Added `agent-repo.manifest.json` and new harness profiles: `minimal`, `standard`, `security`, `full`, and `custom`.
- Added Node.js built-in-only lifecycle scripts for harness install, scan, repair, sync, local model detection, model registry updates, and model-routing validation.
- Updated README, setup, operating, action, AI tool layout, profile reference, workspace rollout, post-operation checks, and installed tool instructions for `.agent-repo/` manifests and reports.
- Preserved legacy `.agent-standards.json`, `install-agent-standards.mjs`, and `sync-agent-standards.mjs` compatibility.

## 0.1.0

- Initial APT Agent Standards repository scaffold.
- Added APT Core standards, agent instructions, Claude agents, Codex skills, Copilot instructions, and prompt packs.
- Added composable profile manifests with APT Core installed by default.
- Added Node.js built-in-only install, sync, and profile detection scripts.
- Added operating guide and profile reference documentation for install, auto-detect, sync, manifest review, recovery, and release checks.
- Added setup and action playbook documentation for local preparation, command usage, onboarding, profile additions, sync, review, release, and recovery.
- Updated installer manifest handling so adding profiles preserves existing managed files and profile history.
- Added a worked operating example for `apt-anet-accept-suite-toolbox`.
- Improved auto-detection for monorepos with nested `package.json`, nested `wrangler.toml`, and Vite config files.
- Added source-to-target AI tool path mapping so installs land in `AGENTS.md`, `.claude/`, `.codex/`, and `.github/` locations.
- Added post-operation checks covering commands and inspections to run after install, profile additions, and sync.
- Added guidance for using installed prompts, skills, agents, and instructions to audit, fix, test, document, standardize, and modernize target repositories.
- Added guidance for choosing the right AI mode, including Chat, Review, Agent/Edit, Copilot Chat prompt files, Claude subagents, and Codex skills.
- Clarified that prompts should reference literal installed file paths and tell AI tools to open files directly when local skills or agents are not auto-discovered.
- Expanded Claude agents, GitHub Copilot instructions/prompts, and high-value Codex skills with required reading, process, safety rules, output expectations, and validation guidance.
- Added cross-tool Cloudflare modernization and React/Hono artifacts so Copilot Chat has same-name `.github/prompts/` equivalents for Codex skills.
- Added same-name GitHub Copilot prompt equivalents for Codex skills and a parity check script to keep profile manifests in sync.
