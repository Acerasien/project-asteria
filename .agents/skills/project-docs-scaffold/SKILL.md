---
name: project-docs-scaffold
description: >-
  Generates and maintains a standardized 21-file project documentation set (00-project-rules through 20-roadmap, covering system overview, architecture, per-agent role docs, communication protocol, project memory, workflow, coding/testing standards, deployment, roadmap) as the single source of truth for a multi-agent or human+AI development project. Use whenever the user wants to "set up project docs," "scaffold documentation," "create a docs folder," start a new multi-agent coding project, define agent roles/rules before development begins, or wants a persistent reference doc set AI agents must consult before acting. Also use to sync an existing doc set with the actual codebase ("sync the docs," "update docs to match current state," "check if docs are stale"). Trigger proactively when the user plans a project with multiple specialized agents (planner, architect, backend, frontend, QA, debug, security, devops, reporter) even without explicitly mentioning "docs."
---

# Project Docs Scaffold

Generates a 21-file documentation set for a project and keeps it alive as the project's source of truth — not a one-time dump. Two modes: **init** (first-time generation) and **sync** (periodic drift correction).

## Why this exists
Agentic dev workflows fail quietly when there's no shared, authoritative reference: agents re-litigate settled decisions, drift from architecture, or silently take on/skip responsibilities. This doc set fixes that by giving every agent (human or AI) the same starting context and a place to record decisions as they happen.

## Mode: `init` — first-time generation

### Step 1 — Quick intake
Ask 2-3 short questions (don't over-interrogate):
1. What's the project, in one sentence?
2. Scale: solo / small team / full agent-team? (This determines doc depth — see `references/project-types.md`)
3. Backend, frontend, or both? Will it be deployed anywhere?

If the user just says "generate the docs, use sensible defaults," skip the questions and default to **small team** depth (see `references/project-types.md`).

### Step 2 — Determine applicability
Use `references/doc-manifest.md` to decide which of docs 04–12 (the role docs) get full content vs. get marked `[NOT APPLICABLE TO THIS PROJECT]`. Always generate all 21 files for structural consistency — never omit a file, only stub its content.

### Step 3 — Generate the files
Copy every file from `assets/templates/` (the `docs/` subfolder plus the top-level `README.md`) into the target project's `docs/` folder (and `README.md` at project root, or merge into an existing README if one exists — ask if unsure).

Then fill in the placeholders:
- `{{PROJECT_NAME}}`, `{{DATE}}` (today's date), `{{STAGE}}` → straightforward substitutions
- `{{APPLICABLE}}` → "Yes", "No — stubbed", based on Step 2
- `{{PROJECT_SPECIFIC: ...}}` blocks → draft real content using what the user told you in intake. If you genuinely don't have enough information for a block yet (e.g. deployment details before infra exists), leave the placeholder text in place rather than inventing specifics — a visible placeholder is better than a plausible-sounding fabrication that later gets trusted as fact.

Do NOT silently delete `{{PROJECT_SPECIFIC}}` markers you can't fill — leave them so it's obvious what still needs human/agent input.

### Step 4 — Confirm the source-of-truth rule is visible
Double check `00-project-rules.md` and the README both clearly state: docs are authoritative, every agent reads its role doc + `00-project-rules.md` + `14-project-memory.md` before acting, and conflicts get escalated rather than silently resolved. This is the load-bearing part of the whole scaffold — don't let it get diluted during customization.

### Step 5 — Present the result
Show the user the file tree that was created and briefly flag which role docs (04–12) were stubbed vs. fully activated, and any `{{PROJECT_SPECIFIC}}` blocks still needing input.

## Mode: `sync` — keep docs current

Triggered when the user asks to sync/update/check docs against reality, or periodically per `15-workflow.md`'s cadence.

1. Read the current `docs/` folder.
2. Compare each doc's claims against actual current state (codebase structure, package.json/dependencies, actual folder layout, recent significant changes the user describes).
3. For each doc that's drifted:
   - Propose the specific update (don't silently rewrite — show a diff-style summary)
   - On confirmation, apply it and update that doc's "Last updated" field
4. Update the doc index table in `README.md` (applicability + last-updated column) to match.
5. Log anything notable about the drift itself in `14-project-memory.md` (e.g. "docs said X but code did Y for 3 weeks — worth knowing why").
6. Summarize what changed for the user in a short list — don't dump every full file back into chat.

## Reference files
- `references/doc-manifest.md` — full purpose/ownership breakdown per doc, and rules for when to stub role docs 04–12
- `references/project-types.md` — how project scale maps to doc depth, plus the intake question list
- `assets/templates/` — the actual template files to copy (docs/00-project-rules.md ... docs/20-roadmap.md, plus README.md)

## Key principles to hold onto
- **Never skip generating a file** — stub content, don't omit files. Consistency across projects is part of the value.
- **Never fabricate `{{PROJECT_SPECIFIC}}` content you don't have grounds for** — leave the placeholder visible instead.
- **The source-of-truth rule in `00-project-rules.md` is the point of the whole skill** — protect it during any customization.
- **`sync` mode proposes changes, it doesn't silently overwrite** — the user or orchestrating agent confirms before docs change.
- **This is a living doc set, not a one-time deliverable** — always mention `15-workflow.md`'s sync cadence when presenting a freshly generated set, so the user knows this isn't "done" after init.
