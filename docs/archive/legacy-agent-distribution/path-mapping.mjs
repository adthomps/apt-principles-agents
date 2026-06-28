export function normalizePath(filePath) {
  return filePath.replaceAll("\\", "/");
}

export function toTargetPath(sourcePath) {
  const file = normalizePath(sourcePath);
  if (file === "standards/AGENTS.md") return "AGENTS.md";
  if (file === "standards/CLAUDE.md") return ".claude/CLAUDE.md";
  if (file === "standards/copilot-instructions.md") return ".github/copilot-instructions.md";
  if (file.startsWith("claude/agents/")) return file.replace("claude/agents/", ".claude/agents/");
  if (file.startsWith("codex/skills/")) return file.replace("codex/skills/", ".codex/skills/");
  if (file.startsWith("github-copilot/instructions/")) return file.replace("github-copilot/instructions/", ".github/instructions/");
  if (file.startsWith("github-copilot/prompts/")) return file.replace("github-copilot/prompts/", ".github/prompts/");
  return file;
}

export function toSourcePath(targetPath) {
  const file = normalizePath(targetPath);
  if (file === "AGENTS.md") return "standards/AGENTS.md";
  if (file === ".claude/CLAUDE.md") return "standards/CLAUDE.md";
  if (file === ".github/copilot-instructions.md") return "standards/copilot-instructions.md";
  if (file.startsWith(".claude/agents/")) return file.replace(".claude/agents/", "claude/agents/");
  if (file.startsWith(".codex/skills/")) return file.replace(".codex/skills/", "codex/skills/");
  if (file.startsWith(".github/instructions/")) return file.replace(".github/instructions/", "github-copilot/instructions/");
  if (file.startsWith(".github/prompts/")) return file.replace(".github/prompts/", "github-copilot/prompts/");
  return file;
}
