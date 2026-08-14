---
name: project-organizer
description: Audits a project's file and folder structure and reorganizes it to be clean, consistent, and idiomatic for its stack. Use when the user asks to organize, clean up, tidy, restructure, or declutter a project/repo/folder, complains files are "a mess" or "everywhere", or wants a sane directory layout enforced. Covers misplaced files, inconsistent naming, missing standard directories, orphaned/dead files, and stray root-level clutter. Not for renaming individual variables/functions (that's refactoring, not organization) and not for deleting code just to silence warnings.
---

# Project Organizer

Turn a messy project layout into a clean, conventional one — safely, incrementally, and without breaking anything.

## When to use this

Trigger this skill when the user wants to:
- "Organize this project" / "clean up this folder" / "make this neat"
- Fix a repo where files are scattered at the root with no structure
- Enforce a standard layout (e.g. `src/`, `tests/`, `docs/`) on an ad-hoc project
- Consolidate scattered configs, assets, or scripts into sensible homes
- Remove dead/orphaned files that nothing references anymore

Do **not** use this for:
- Renaming variables, functions, or classes (that's refactoring — see `kaizen` skill if available)
- Reorganizing code *within* a single file
- Deleting code to fix lint/type errors

## Core principle: Move, don't guess-and-break

Reorganizing a project is inherently risky — moving a file can break imports, build configs, CI scripts, and doc links. Every step below exists to prevent that. Never skip the audit or validation steps to save time.

## Workflow

### 1. Audit (read-only, no changes yet)

- Run `list_directory` recursively (or `find_path` with `**/*`) to build a full picture of the current structure.
- Identify the project's stack(s): look for `package.json`, `Cargo.toml`, `pyproject.toml`/`requirements.txt`, `go.mod`, `*.csproj`, monorepo markers (`turbo.json`, `nx.json`, `pnpm-workspace.yaml`, `lerna.json`), or a docs-only project (no code, just `.md`).
- Check for a version control system (`.git`). If present, prefer `move_path` for every move (it's a plain filesystem move; remind the user that a git repo will show these as renames once committed — you are not required to run git commands yourself, but avoid `delete_path` + `write_file` when a `move_path` will do, since it preserves file history).
- Load `references/stack-conventions.md` from this skill directory for the idiomatic layout of the detected stack(s).
- Catalog problems into these categories:
  1. **Root clutter** — loose source files, scripts, or assets sitting at the project root that belong in a subfolder.
  2. **Missing standard directories** — no `src/`, no `tests/`, docs scattered instead of in `docs/`, etc. (per the stack's convention).
  3. **Inconsistent naming** — mixed `kebab-case`/`snake_case`/`camelCase` file names within the same category, inconsistent pluralization (`util` vs `utils`).
  4. **Misplaced files** — a test file living next to source instead of in `tests/`, a config file buried three folders deep, assets mixed into source directories.
  5. **Duplicate or orphaned files** — files that look like leftovers (`old_`, `backup_`, `copy of`, `*.bak`, numbered duplicates like `file (1).ts`), or files with no incoming references anywhere in the codebase (use `grep` to search for imports/requires of the file's name before flagging it as orphaned — never assume orphaned status from naming alone).
  6. **Flat-when-it-should-be-grouped** — e.g. 40 files directly in `src/` with no subfolders, when grouping by feature/domain would help.
  7. **Grouped-when-it-should-be-flat** — over-nested single-file directories (a folder containing exactly one file that could live one level up).

### 2. Plan

Produce a concise before/after plan. Use this structure:

```markdown
# Reorganization Plan

## Detected stack
<e.g. "Turborepo monorepo: Node/TypeScript (Fastify API + React frontend)">

## Issues found
1. <issue> — <affected files/count>
2. ...

## Proposed structure
<tree diagram of the target layout — only show directories that change>

## Moves
| From | To | Reason |
|------|----|----|
| ... | ... | ... |

## Files that need reference updates
<list files whose imports/paths must change because of the moves — be exhaustive, use grep to find every reference>

## Out of scope / left as-is
<anything intentionally not touched, and why>
```

- Keep moves **atomic and grouped** by concern (e.g. "consolidate all test files", "flatten single-file folders") so the user can approve/reject a group at a time if they want.
- If a move is ambiguous (could belong in two places), ask the user rather than guessing — this is one of the few cases worth a clarifying question.
- Never propose deleting a file the user didn't ask to remove. Orphaned files go in a "candidates for deletion — confirm before removing" section, not an automatic delete list.

### 3. Confirm

- Present the plan to the user before executing anything **unless** the user has already explicitly approved a full auto-organize (e.g. "just do it", "reorganize however you think is best"). When in doubt, show the plan first.
- For large plans (>15 moves), consider asking if they want it done in one pass or in reviewable batches.

### 4. Execute

- Use `move_path` for every file/directory relocation — never `copy_path` + `delete_path` (that loses history and risks partial failure leaving duplicates).
- Move in dependency order: move leaf files before the directories that will contain them if creating new nesting; move directories as whole units when possible instead of file-by-file.
- Immediately after each group of moves, update every reference found in the audit step:
  - Import/require paths in source files
  - Config file paths (`tsconfig.json` `include`/`paths`, bundler configs, `package.json` `main`/`exports`/`files`/scripts, lint/test config `testMatch`/`roots`, CI workflow file paths)
  - Doc links (relative markdown links, README trees)
- Use `edit_file` for targeted reference updates. Use `grep` before and after each batch to confirm no dangling references remain (search for the old path string).
- If a moved directory contained a barrel/index file with relative exports, verify those relative paths still resolve after the move.

### 5. Validate

- Re-run whatever the project uses to verify correctness: build command, test command, linter, or type-checker (check `package.json` scripts, `Makefile`, `justfile`, or ask if unclear).
- Run `grep` for the old paths/names one more time across the whole project to catch anything missed (docs, CI YAML, Docker files, env examples).
- Report results: what moved, what was updated, what validation ran and its outcome. If validation fails, fix the root cause (usually a missed import) before declaring done — don't leave the project in a broken state.

## Safety rules

1. **Never lose history carelessly.** Prefer `move_path` over delete+recreate.
2. **Never delete without explicit confirmation**, even for things that look like obvious cruft (`*.bak`, `old_*`). List them, ask, then delete only what's approved.
3. **Never move files you can't find all references for.** If `grep` can't confirm a file's reference surface (e.g. it's dynamically imported via a computed path, or referenced from a config format grep can't parse), flag it explicitly as higher-risk in the plan and ask before moving it.
4. **One concern at a time.** Don't mix "flatten this folder" with "rename all files to kebab-case" in the same unreviewed batch if the user hasn't approved both.
5. **Always validate after executing.** A reorganization isn't done until the build/tests pass.
6. **Respect existing conventions already in use.** If 90% of the project already uses `kebab-case.ts`, don't introduce `camelCase.ts` — conform to the majority pattern rather than an external ideal, unless the user asks you to change the convention itself.

## Reference material

See `references/stack-conventions.md` for idiomatic directory layouts by stack (Node/TypeScript apps, monorepos, Python, Rust, Go, docs-only projects) to use as the target structure during planning.
