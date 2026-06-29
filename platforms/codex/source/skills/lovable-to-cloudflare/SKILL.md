---
name: lovable-to-cloudflare
description: Use when converting a Lovable or generated frontend project toward React, Vite, Hono, Cloudflare Pages, and Workers.
title: "Lovable To Cloudflare"
kind: "platform-adapter"
domain: "platforms"
status: "active"
owner: "APT"
last_updated: "2026-06-28"
source_paths: ["apt-agent-standards/codex/skills/lovable-to-cloudflare/SKILL.md"]
---

# Lovable To Cloudflare

## Purpose
Plan and implement safe migration toward Cloudflare-native frontend and API structure.

## When To Use
Use for Lovable-to-Cloudflare conversion, Pages/Workers adoption, or generated app modernization.

## When Not To Use
Do not use when the app has no Cloudflare deployment target.

## Required Reading
Read frontend entry points, API/auth/data code, deployment config, `.apt/standards/installable-summaries/cloudflare-standards.md`, and `docs/project-context.md`.

## Process
Identify frontend, API, auth, and data patterns. Convert toward React, Vite, Hono, Cloudflare Pages, and Workers. Prefer `/api` routes for dynamic behavior. Recommend D1, KV, and R2 only when appropriate. Avoid premature complexity and document migration risks.

## Output Format
Return architecture findings, target Cloudflare shape, staged migration plan, risks, and validation commands.

## Validation Checklist
- Frontend, API, auth, and data patterns are covered.
- Storage recommendations are justified.
- Dynamic behavior has a clear `/api` path.
- Risks are documented.
