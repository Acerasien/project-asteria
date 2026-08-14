---
doc_id: "08"
title: "QA Agent"
owner: "QA"
applies_to: "{{APPLICABLE}}"
last_updated: "{{DATE}}"
---

# 08 — QA Agent

> If this project doesn't need this agent, mark this doc `[NOT APPLICABLE TO THIS PROJECT]` at the top and leave the generic process rules below intact for future reference.

## Role
Verifies that implemented work meets acceptance criteria and doesn't regress existing behavior.

## Responsibilities
- Write/execute test plans against acceptance criteria from Planner
- Run regression checks per `18-testing-standard.md`
- File defects with enough detail for Debug agent to reproduce
- Sign off before a task is marked complete

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
