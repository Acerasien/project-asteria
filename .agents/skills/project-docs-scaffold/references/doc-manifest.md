# Doc Manifest

Full reference for every doc in the scaffold: what it's for, who owns it, and when it should be fully active vs. stubbed.

## Always-active docs (generate in full regardless of project scale)

| Doc | Purpose |
|---|---|
| `00-project-rules.md` | The constitution — non-negotiable rules every agent follows |
| `01-system-overview.md` | What the system is, for someone with zero context |
| `02-architecture.md` | Components, data flow, key technical decisions |
| `03-orchestrator.md` | How work gets sequenced and routed across agents |
| `13-agent-communication.md` | Handoff format and routing table between agents |
| `14-project-memory.md` | Running log of decisions, gotchas, rejected approaches |
| `15-workflow.md` | Task lifecycle and doc-sync cadence |
| `16-repository-structure.md` | Where things live in the codebase |
| `17-coding-standard.md` | Style and pattern rules for code |
| `18-testing-standard.md` | What testing is required and how QA signs off |
| `19-deployment.md` | Environments, deploy process, rollback |
| `20-roadmap.md` | Current focus, backlog, explicit non-goals |

## Role docs (04–12) — conditionally active

These map to specific agent roles. Generate all of them always (for consistency), but mark inapplicable ones as stubs so the doc set doesn't imply agents that don't exist for this project.

| Doc | Role | Skip/stub when... |
|---|---|---|
| `04-planner-agent.md` | Breaks requirements into tasks | Almost never skip — even solo projects benefit from a planning doc |
| `05-architect-agent.md` | Owns system design | Trivial/small scripts with no real architecture |
| `06-backend-agent.md` | Server-side implementation | No backend component exists |
| `07-frontend-agent.md` | Client-side implementation | No UI component exists |
| `08-qa-agent.md` | Verification against acceptance criteria | Almost never skip |
| `09-debug-agent.md` | Investigates defects | Almost never skip |
| `10-security-agent.md` | Security review | Internal tooling with no external input/auth surface (still recommend keeping as a stub) |
| `11-devops-agent.md` | Build/deploy/infra | No deployment target (e.g. a local-only script) |
| `12-reporter-agent.md` | Status summaries | Solo projects where the human IS the reporter — still useful as a lightweight status template |

## Determining applicability

Ask (or infer from context):
1. **Project scale** — solo / small team / enterprise
2. **Does it have a backend? A frontend? Both? Neither?**
3. **Does it get deployed anywhere, or is it local-only?**
4. **Does it handle sensitive data, auth, or external input?**
5. **How many distinct "agents" (human or AI) will actually work on this?**

Mark a role doc as stub by putting `[NOT APPLICABLE TO THIS PROJECT]` right under the title, but leave the generic process content underneath intact — projects evolve, and it's cheaper to un-stub a doc than to regenerate it from scratch later.
