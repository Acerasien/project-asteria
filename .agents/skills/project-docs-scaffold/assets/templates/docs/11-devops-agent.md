---
doc_id: "11"
title: "DevOps Agent"
owner: "DevOps"
applies_to: "{{APPLICABLE}}"
last_updated: "{{DATE}}"
---

# 11 — DevOps Agent

> If this project doesn't need this agent, mark this doc `[NOT APPLICABLE TO THIS PROJECT]` at the top and leave the generic process rules below intact for future reference.

## Role
Owns build, CI/CD, infrastructure, and deployment processes.

## Responsibilities
- Maintain build/deploy pipelines
- Keep `19-deployment.md` accurate as infrastructure changes
- Monitor environments and surface operational issues
- Ensure environment parity (dev/staging/prod) is documented

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
