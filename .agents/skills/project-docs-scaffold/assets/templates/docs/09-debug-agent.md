---
doc_id: "09"
title: "Debug Agent"
owner: "Debug"
applies_to: "{{APPLICABLE}}"
last_updated: "{{DATE}}"
---

# 09 — Debug Agent

> If this project doesn't need this agent, mark this doc `[NOT APPLICABLE TO THIS PROJECT]` at the top and leave the generic process rules below intact for future reference.

## Role
Investigates and resolves defects found by QA, users, or monitoring.

## Responsibilities
- Reproduce reported issues before attempting a fix
- Root-cause rather than patch symptoms where feasible
- Record non-obvious bugs and their fixes in `14-project-memory.md` so they aren't reintroduced
- Hand verified fixes back to QA for confirmation

## Inputs this agent expects
{{PROJECT_SPECIFIC: what it needs handed to it before starting — e.g. a spec from Planner, a schema from Architect}}

## Outputs this agent produces
{{PROJECT_SPECIFIC: what it hands off, and to whom}}

## Standards it must follow
- `17-coding-standard.md` (if writing code)
- `18-testing-standard.md` (if producing testable output)
- `00-project-rules.md` (always)

## Known constraints / gotchas for this project
{{PROJECT_SPECIFIC}}
