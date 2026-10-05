---
title: Working Backwards Profile — Game Development
kind: template
domain: execution
status: active
owner: APT
last_updated: 2026-10-04
source_paths: ["apt-principles-agents/templates/working-backwards/domains/game-development.md", "apt-principles-agents/principles/game-development/README.md"]
---

# Working Backwards Profile: Game Development

For video games and interactive experiences. Game projects usually fail the same way: systems are built before anything is playable, the core loop is never proven fun, scope grows without a cut list, and "fun" is asserted instead of playtested. This profile turns each Working Backwards stage against those failures.

## When a full package is required

Any change a player would notice: core loop, mechanics, progression, combat, economy, AI behavior or AI-driven narration, save data, controls, UI and HUD, onboarding, multiplayer, and anything shown in a playtest or demo. Content-only additions inside an approved system (another level using existing mechanics) need a short note, not a full package.

## Stage guidance

**Press release → player announcement.** Write it like a store-page or patch-note announcement. Name the player (from the persona register or the game's own player profiles), the player fantasy, and the core loop in one sentence: what the player does every 30 seconds. Evidence is playtest notes, prototype observations, or comparable games; anything else is a labelled hypothesis. The quote comes from a playtester or is marked as a placeholder.

**External FAQ → player FAQ.** Session length, difficulty and failure, controls and accessibility, losing progress, replay value, time or price cost, multiplayer and hot-seat behavior, and what the game deliberately does not do.

**Internal FAQ → developer FAQ.** Does a playable prototype of the core loop exist? What is on the cut list? Engine, performance, and save-data risks. For AI features (such as an AI dungeon master): cost per session, latency, content safety, and behavior when the model is unavailable. Art and audio pipeline, platform targets, playtest plan, and team capacity.

**Requirements.** Core-loop acceptance criteria tied to a playtest measure (for example "4 of 5 playtesters choose to play a second encounter"), game-feel criteria (input response, feedback), save and state compatibility, and performance budgets.

**Engineering handoff → playable increments.** Every slice ends playable and playtestable: greybox prototype, then vertical slice, then content. Each slice names its playtest question, how it will be measured, and what gets cut if it fails.

**Readiness.** Playtest results against the core-loop criteria, performance on target hardware, save compatibility with earlier builds, accessibility checks, and, for AI features, content-safety and cost results.

## Personas and reviewer lenses

Use the `player` persona from `references/persona-register.json` and the game's own player profiles. Reviewer lenses: gameplay reviewer, game UI reviewer, game testing reviewer, and the scope guardian, who must name removable work at every stage. For beginner-run projects, add the beginner game-dev reviewer.

## Rubric overlay

[game-development.rubric.json](game-development.rubric.json)
