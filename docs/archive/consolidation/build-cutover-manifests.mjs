#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sections = ["principles", "standards", "checklists", "context", "skills", "agents", "templates", "prompts", "platforms"];
const manifests = {
  core: {
    description: "APT framework, four pillars, baseline standards, checks, skills, agents, and adapters.",
    principles: ["principles/framework.md", "principles/thinking/", "principles/design/", "principles/architecture/", "principles/execution/"],
    standards: ["standards/README.md", "standards/coding/", "standards/documentation/", "standards/testing/"],
    checklists: ["checklists/thinking-review-checklist.md", "checklists/design-review-checklist.md", "checklists/architecture-review-checklist.md", "checklists/execution-readiness-checklist.md"],
    context: ["context-packs/apt-core-pack.md"],
    skills: ["skills/thinking/", "skills/design/", "skills/architecture/", "skills/engineering/"],
    agents: ["agents/core/"],
    templates: ["templates/product/", "templates/decision-records/"],
    prompts: ["prompts/planning/", "prompts/reviews/"],
    platforms: ["platforms/codex/README.md", "platforms/claude/README.md", "platforms/github-copilot/README.md", "platforms/gemini/README.md"],
  },
  minimal: { description: "Smallest supported APT installation.", extends: ["core"] },
  standard: { description: "Core APT plus documentation, governance, API, security, and UX review.", extends: ["core", "documentation", "governance", "api-review", "security", "ux-review"] },
  documentation: {
    description: "Audience-layered documentation, Product Hubs, knowledge, support, and examples.",
    principles: ["principles/documentation/", "principles/execution/knowledge-and-learning.md"],
    standards: ["standards/documentation/"],
    checklists: ["checklists/documentation-checklist.md", "checklists/knowledge-system-checklist.md"],
    context: ["context-packs/apt-docs-pack.md", "context/documentation/"],
    skills: ["skills/documentation/"],
    agents: ["agents/docs/", "agents/customer/", "agents/beginner-reviewers/"],
    templates: ["templates/docs/", "templates/support/"],
    prompts: ["prompts/product-hubs/", "prompts/troubleshooting/customer-confusion.md"],
  },
  cloudflare: {
    description: "Cloudflare Workers, Hono, Pages, bindings, deployment, and modernization.",
    principles: ["principles/architecture/cloudflare-hono-architecture.md"],
    standards: ["standards/installable-summaries/cloudflare-standards.md"],
    checklists: ["checklists/architecture-review-checklist.md", "checklists/security-review-checklist.md"],
    context: ["context-packs/apt-cloudflare-pack.md", "context/cloudflare/"],
    skills: ["skills/architecture/cloudflare-hono-architecture/", "platforms/codex/source/skills/cloudflare-react-hono/", "platforms/codex/source/skills/cloudflare-modernization/"],
    agents: ["agents/engineering/apt-cloudflare-hono-engineer.md", "platforms/claude/source/agents/cloudflare-architect.md", "platforms/claude/source/agents/cloudflare-modernization-architect.md"],
    platforms: ["platforms/github-copilot/distribution/instructions/cloudflare.instructions.md", "platforms/github-copilot/distribution/prompts/cloudflare-modernization.prompt.md"],
  },
  "api-review": {
    description: "API contracts, auth, errors, webhooks, idempotency, observability, and developer experience.",
    principles: ["principles/api/", "principles/architecture/api-architecture.md"],
    standards: ["standards/api/"],
    checklists: ["checklists/api-standards-checklist.md"],
    context: ["context-packs/apt-api-pack.md"],
    skills: ["skills/api/", "platforms/codex/source/skills/api-review/"],
    agents: ["agents/api/", "agents/architecture/apt-api-architect.md"],
    templates: ["templates/api/"],
    prompts: ["prompts/audits/api-audit.md", "prompts/reviews/api-design-review.md"],
  },
  "ux-review": {
    description: "Intent-based UI, accessibility, roles, journeys, responsive behavior, and design review.",
    principles: ["principles/design/"],
    standards: ["standards/installable-summaries/ux-standards.md"],
    checklists: ["checklists/design-review-checklist.md"],
    context: ["context-packs/apt-ui-pack.md", "context/ui/"],
    skills: ["skills/design/", "platforms/codex/source/skills/ux-review/"],
    agents: ["agents/core/apt-design-lead.md", "platforms/claude/source/agents/intent-ux-reviewer.md"],
    prompts: ["prompts/reviews/ui-api-alignment-review.md"],
  },
  migration: {
    description: "Behavior-preserving repository and product migration.",
    principles: ["principles/modernization/", "principles/execution/"],
    standards: ["standards/installable-summaries/migration-standards.md"],
    checklists: ["checklists/repo-alignment-checklist.md"],
    skills: ["skills/modernization/"],
    agents: ["agents/architecture/apt-modernization-architect.md"],
    templates: ["templates/migration/"],
    prompts: ["prompts/migration/"],
  },
  modernization: { description: "API bridges, legacy parity, dual-run migration, and deprecation.", extends: ["migration", "api-review"], skills: ["platforms/codex/source/skills/cloudflare-modernization/"], prompts: ["prompts/modernization/"] },
  governance: {
    description: "Repository adoption, maturity, scorecards, review gates, and source-of-truth governance.",
    principles: ["principles/framework.md"],
    standards: ["governance/", "references/"],
    checklists: ["checklists/repo-alignment-checklist.md", "checklists/project-adoption-checklist.md"],
    context: ["context-packs/apt-core-pack.md"],
    skills: ["platforms/codex/source/skills/apt-readiness-audit/", "platforms/codex/source/skills/repo-standardization/"],
    agents: ["agents/harness/apt-verifier.md", "agents/harness/apt-repo-scanner.md"],
    templates: ["templates/project-adoption-template.md", "templates/apt-audit-report-template.md"],
    prompts: ["prompts/repo-alignment-review.md", "prompts/apply-apt-principles-agents.md"],
  },
  security: {
    description: "Security, privacy, permissions, data handling, AI safety, and protected decisions.",
    principles: ["principles/security-risk/"],
    standards: ["standards/ai/security-harness-standard.md"],
    checklists: ["checklists/security-review-checklist.md"],
    context: ["context-packs/apt-security-pack.md", "context/security/"],
    skills: ["skills/security-risk/"],
    agents: ["agents/risk/", "agents/harness/apt-security-reviewer.md"],
    templates: ["templates/agent-reviews/security-risk-review.md"],
    prompts: ["prompts/reviews/security-risk-review.md"],
  },
  "knowledge-graph": {
    description: "Knowledge graph hygiene, graph-backed review, provenance, and evidence.",
    principles: ["principles/execution/knowledge-and-learning.md"],
    standards: ["standards/installable-summaries/knowledge-graph-standards.md"],
    context: ["context-packs/"],
    skills: ["platforms/codex/source/skills/knowledge-graph-review/"],
    prompts: ["platforms/github-copilot/distribution/prompts/knowledge-graph-review.prompt.md"],
  },
  lovable: {
    description: "Generated/Lovable project assessment and safe APT or Cloudflare migration.",
    extends: ["migration", "ux-review"],
    skills: ["platforms/codex/source/skills/lovable-to-apt/", "platforms/codex/source/skills/lovable-to-cloudflare/"],
    agents: ["platforms/claude/source/agents/lovable-to-apt-architect.md", "platforms/claude/source/agents/lovable-to-cloudflare-architect.md"],
  },
  payments: {
    description: "Payments, ecommerce, gateway lifecycle, transaction intelligence, risk, and readiness.",
    extends: ["api-review", "security"],
    principles: ["principles/payments/", "principles/ecommerce/"],
    skills: ["skills/payments/", "skills/ecommerce/", "skills/service-readiness/"],
    agents: ["agents/payments/", "agents/ecommerce/"],
    templates: ["templates/payments/", "templates/support/"],
    prompts: ["prompts/reviews/payment-review.md", "prompts/troubleshooting/payment-decline.md"],
  },
  health: {
    description: "High-accuracy health application review with privacy and human escalation.",
    extends: ["security", "documentation"],
    skills: ["platforms/github-copilot/source/skills/health-data-ingestion-designer/"],
  },
  training: {
    description: "Beginner clarity, learning plans, examples, and progressive enablement.",
    extends: ["documentation"],
    principles: ["principles/thinking/beginner-clarity.md"],
    skills: ["skills/thinking/beginner-clarity-review/"],
    agents: ["agents/beginner-reviewers/"],
  },
  "ai-development": {
    description: "Agent routing, model selection, prompt engineering, evaluation, and AI output review.",
    principles: ["principles/ai/"],
    standards: ["standards/ai/"],
    checklists: ["checklists/ai-agent-review-checklist.md"],
    context: ["context-packs/apt-agent-pack.md"],
    skills: ["skills/ai-agents/", "platforms/codex/source/skills/ai-output-review/"],
    agents: ["agents/harness/", "agents/core/apt-router.md"],
    prompts: ["prompts/swarm-reviews/", "prompts/agent-harness-review-prompt.md"],
  },
  "api-modernization": { description: "Modern API design plus bridge and migration execution.", extends: ["api-review", "modernization"] },
  "product-hub": {
    description: "Audience-layered Product Hub construction and review.",
    extends: ["documentation", "governance"],
    templates: ["product-hubs/product-hub-template/", "templates/product/"],
    prompts: ["prompts/product-hubs/"],
  },
  "game-development": {
    description: "Beginner-friendly game design, architecture, prototypes, playtests, and learning.",
    extends: ["core", "documentation"],
    principles: ["principles/game-development/"],
    skills: ["skills/game-development/"],
    agents: ["agents/game-development/"],
    templates: ["templates/game-development/"],
    prompts: ["prompts/game-development/"],
  },
  full: {
    description: "All supported APT capabilities.",
    extends: ["standard", "cloudflare", "migration", "modernization", "knowledge-graph", "lovable", "payments", "health", "training", "ai-development", "product-hub", "game-development"],
  },
  custom: {
    description: "Explicitly empty manifest for project-owned composition.",
  },
};

function render(name, manifest) {
  const lines = [`name: ${name}`, `description: ${manifest.description}`];
  if (manifest.extends?.length) {
    lines.push("extends:", ...manifest.extends.map((item) => `  - ${item}`));
  }
  for (const section of sections) {
    const values = manifest[section] || [];
    lines.push(`${section}:`, ...values.map((item) => `  - ${item}`));
  }
  return `${lines.join("\n")}\n`;
}

mkdirSync(path.join(root, "manifests"), { recursive: true });
for (const [name, manifest] of Object.entries(manifests)) {
  writeFileSync(path.join(root, "manifests", `${name}.yaml`), render(name, manifest), "utf8");
}
console.log(`Wrote ${Object.keys(manifests).length} cutover manifests.`);
