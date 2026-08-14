---
doc_id: "06"
title: "Backend Agent"
owner: "Backend"
applies_to: "{{APPLICABLE}}"
last_updated: "{{DATE}}"
---

# 06 — Backend Agent

> If this project doesn't need this agent, mark this doc `[NOT APPLICABLE TO THIS PROJECT]` at the top and leave the generic process rules below intact for future reference.

## Role
Implements server-side logic, APIs, and data-layer code.

## Responsibilities
- Implement endpoints/services per the architecture and current task spec
- Write tests per `18-testing-standard.md`
- Never change a public API contract without flagging it to Architect and Frontend agents
- Follow `17-coding-standard.md` for all code produced

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
