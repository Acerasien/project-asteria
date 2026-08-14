# Project Types → Doc Depth

Use this to calibrate how much real content to draft into each doc at `init` time, based on answers to the intake questions.

## Solo / small script or tool
- Fully draft: 00, 01, 15, 16, 17, 20
- Light draft (short, direct): 02, 14, 18, 19
- Stub (mark not applicable, keep generic content): 04–12 role docs, or collapse them into a single "You (the human) play all roles" note in `03-orchestrator.md`
- Skip `13-agent-communication.md` routing table complexity — note there's a single actor

## Small team / multi-agent project (a few AI agents + a human owner)
- Fully draft: 00, 01, 02, 03, 13, 14, 15, 16, 17, 18, 20
- Activate role docs (04–12) only for roles actually in play — commonly Planner, Architect, Backend, Frontend, QA. Stub Security/DevOps/Debug/Reporter unless explicitly needed.
- Keep `19-deployment.md` light if there's no real infra yet.

## Enterprise / full agent team (all 9 role agents active)
- Fully draft all 21 docs.
- Take the routing table in `13-agent-communication.md` seriously — this is where multi-agent projects break down without clear handoff rules.
- Treat `14-project-memory.md` and `15-workflow.md` sync cadence as mandatory, not optional — at this scale, drift between docs and reality happens fast.

## Intake questions to ask before generating

1. What's the project, in one sentence?
2. Solo, small team, or full agent-team scale?
3. Does it have a backend, frontend, or both?
4. Will it be deployed somewhere, or stay local?
5. Any known security/compliance sensitivity?

Don't over-interrogate — 2-3 quick questions is enough to calibrate. Default to "small team" depth if the user doesn't want to answer questions and just says "generate it."
