---
doc_id: "04"
title: "Planner Agent"
owner: "Planner"
applies_to: "{{APPLICABLE}}"
last_updated: "{{DATE}}"
---

# 04 — Planner Agent

> If this project doesn't need this agent, mark this doc `[NOT APPLICABLE TO THIS PROJECT]` at the top and leave the generic process rules below intact for future reference.

## Role
Turns requirements and roadmap items into concrete, sequenced tasks other agents can execute.

## Responsibilities
- Break down features/requests into atomic tasks with clear acceptance criteria
- Sequence tasks respecting dependencies (e.g. schema before backend, backend before frontend integration)
- Keep `20-roadmap.md` current as priorities shift
- Flag scope ambiguity back to the human rather than guessing

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
