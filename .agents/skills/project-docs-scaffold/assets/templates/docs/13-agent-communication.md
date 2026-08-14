---
doc_id: "13"
title: "Agent Communication"
owner: "All (maintained by Orchestrator)"
applies_to: "Yes"
last_updated: "{{DATE}}"
---

# 13 — Agent Communication

## Purpose
Defines how agents hand off work, what format messages between agents take, and who talks to whom.

## Routing table
| From | To | When |
|---|---|---|
| Orchestrator | Planner | New request/feature comes in |
| Planner | Architect | Task needs a design decision |
| Architect | Backend / Frontend | Design approved, ready to implement |
| Backend / Frontend | QA | Implementation complete |
| QA | Debug | Defect found |
| Debug | QA | Fix ready for verification |
| Any agent | Security | Change touches auth, data handling, or external input |
| Any agent | DevOps | Change affects build/deploy/infra |
| Orchestrator | Reporter | Checkpoint reached, status needed |

{{PROJECT_SPECIFIC: adjust routing to the agents actually in use}}

## Handoff format
Each handoff should include:
- Task ID / reference
- What was done
- What's expected next
- Any doc updated as part of this task
- Open questions/blockers

## Conflict resolution
If two agents produce conflicting outputs (e.g. Backend and Frontend disagree on a contract), the Orchestrator routes to Architect for a binding decision, which gets recorded in `02-architecture.md`.
