---
name: release-communication-writer
description: Use when work must prove the service can launch, operate, degrade safely, be supported, be troubleshot, and communicate change.
kind: skill
status: active
owner: APT
last_updated: 2026-08-16
source: consolidated APT guidance
title: "Release Communication Writer"
domain: "service-readiness"
source_paths: ["apt-principles-agents/skills/service-readiness/release-communication-writer/SKILL.md"]
---

# Release Communication Writer

## Purpose

Produce evidence-backed, audience-specific release communications that remain consistent across planned launch, delay, incident, rollback, recovery, and completion states.

## When to Use

Use for planning, design, implementation review, migration, troubleshooting, or documentation where the task must prove the service can launch, operate, degrade safely, be supported, be troubleshot, and communicate change.

## Inputs

- Goal, audience, scope, constraints, and success criteria.
- Relevant source files, contracts, examples, logs, and decisions.
- Known risks, assumptions, dependencies, and approval boundaries.

## Process

1. Build one approved fact set from release scope, validation evidence, rollout plan, compatibility decisions, known issues, runbooks, and support ownership.
2. Segment audiences by impact, access, knowledge, channel, locale, and required action; identify audiences that should not receive internal details.
3. Draft the minimum useful message for each audience: change, reason, effective time/time zone, availability, prerequisites, action, validation, limitations, recovery, support, and next update.
4. Prepare coordinated variants for preview, launch, delay, partial rollout, incident, rollback, recovery, and completion while preserving canonical facts.
5. Verify links, commands, dates, permissions, accessibility, translations, security redaction, status alignment, and support readiness.
6. Route messages through named technical, product, support, security/legal, and publication approvals; record update and retirement ownership.

## Outputs

An approved release fact sheet, audience/impact matrix, channel-ready message set, action/recovery instructions, variant matrix, approval record, and update/retirement schedule.

## Quality Bar

The output is practical, source-backed, audience-aware, testable, reversible where possible, and does not state assumptions as facts.

## Domain Checklist

- Trace every material claim to approved scope, test/readiness evidence, a known-issue record, or an accountable owner.
- Give each audience exact impact, timing/time zone, required action, validation, recovery, support, and next-update expectations.
- Keep preview, launch, delay, partial-rollout, incident, rollback, recovery, and completion messages mutually consistent.
- Verify links, commands, prerequisites, permissions, dates, channels, accessibility, localization, and status-page alignment.
- Remove secrets, customer data, exploitable detail, internal speculation, and unsupported availability or performance guarantees.
- Record technical, product, support, security/legal, publication, update, correction, and retirement ownership.

## Required Reading

Read the canonical Service Readiness principle hub, the closest enforceable standard, the applicable checklist, and exact target-repository evidence.
## References

- [Service Readiness principles](../../../principles/service-readiness/README.md)
- [Templates](../../../templates/README.md)
- [Agents](../../../agents/README.md)
