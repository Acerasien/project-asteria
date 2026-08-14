---
doc_id: "15"
title: "Workflow"
owner: "All (maintained by Orchestrator)"
applies_to: "Yes"
last_updated: "{{DATE}}"
---

# 15 — Workflow

## Standard task lifecycle
1. Request enters via Orchestrator
2. Planner breaks it into tasks, updates `20-roadmap.md`
3. Architect reviews if design impact exists
4. Backend/Frontend implement per `17-coding-standard.md`
5. QA verifies per `18-testing-standard.md`
6. Security/DevOps review if applicable
7. Reporter logs completion, Orchestrator closes the task

## Doc sync pass
Run this periodically (define cadence below) or after any significant change:
1. Diff current code/system behavior against what each doc claims
2. Update stale docs — don't just note the drift, fix it
3. Update "Last updated" fields and the README doc index
4. Log anything notable in `14-project-memory.md`

**Cadence:** {{PROJECT_SPECIFIC: e.g. end of each sprint, after every major merge, weekly}}

## Definition of done
A task is not done until:
- Code is merged
- Tests pass per `18-testing-standard.md`
- Relevant docs are updated
- QA has signed off
