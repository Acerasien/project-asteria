---
doc_id: "18"
title: "Testing Standard"
owner: "QA"
applies_to: "Yes"
last_updated: "{{DATE}}"
---

# 18 — Testing Standard

## Test types required
| Type | Required for | Tooling |
|---|---|---|
| Unit | {{PROJECT_SPECIFIC}} | {{PROJECT_SPECIFIC}} |
| Integration | {{PROJECT_SPECIFIC}} | {{PROJECT_SPECIFIC}} |
| End-to-end | {{PROJECT_SPECIFIC}} | {{PROJECT_SPECIFIC}} |

## Coverage expectations
{{PROJECT_SPECIFIC: minimum coverage or "critical paths must be covered" style rule}}

## What QA checks before sign-off
- [ ] Acceptance criteria met
- [ ] No regression in existing tests
- [ ] Edge cases from `14-project-memory.md` re-verified
- [ ] Security-sensitive changes reviewed by Security agent (if applicable)

## Defect report format
{{PROJECT_SPECIFIC: what a bug report needs to include for Debug agent to act on it}}
