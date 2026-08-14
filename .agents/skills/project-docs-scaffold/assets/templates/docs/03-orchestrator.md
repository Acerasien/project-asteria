---
doc_id: "03"
title: "Orchestrator"
owner: "Orchestrator"
applies_to: "Yes"
last_updated: "{{DATE}}"
---

# 03 — Orchestrator

## Role
The orchestrator sequences work across agents, resolves handoffs, and is the only agent allowed to invoke other agents directly.

## Responsibilities
- Break incoming requests into tasks and route them to the correct agent (see `13-agent-communication.md` for the routing table)
- Track task state across the doc set (do not let two agents work on conflicting parts of the codebase simultaneously)
- Enforce `00-project-rules.md` — reject/flag any agent action that skips required reading or bypasses escalation
- Trigger doc sync passes (see `15-workflow.md`) at defined checkpoints

## Routing logic
{{PROJECT_SPECIFIC: describe how the orchestrator decides which agent(s) handle a given request}}

## Failure handling
{{PROJECT_SPECIFIC: what happens when an agent fails or produces conflicting output}}
