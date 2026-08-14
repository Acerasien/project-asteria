# Stack-specific layout conventions

Use these as the *target* structure when planning a reorganization. Adapt to what already exists rather than forcing a rewrite — the goal is convention + consistency, not a specific tree shape for its own sake.

## Node / TypeScript — single app

```
project/
├── src/
│   ├── index.ts | main.ts        # entry point
│   ├── routes/ | pages/          # HTTP routes or page components
│   ├── components/               # UI components (frontend)
│   ├── hooks/                    # React/Vue composables
│   ├── lib/ | utils/             # shared utilities (pick one name, not both)
│   ├── services/                 # business logic / orchestration
│   ├── middleware/                # request middleware (backend)
│   └── types/                    # local type definitions (if not shared)
├── tests/ | __tests__/           # mirrors src/ structure
├── public/ | assets/             # static assets (frontend)
├── docs/                         # project documentation
├── scripts/                      # one-off / build / migration scripts
├── package.json
├── tsconfig.json
└── README.md
```

Root should contain only: package manifest, lockfile, tsconfig, linter/formatter configs, README, LICENSE, `.gitignore`, `.env.example`, and CI config directory (`.github/`). Everything else belongs in a subfolder.

## Turborepo / Nx / pnpm monorepo

```
repo/
├── apps/
│   ├── <app-name>/                # deployable applications
│   └── ...
├── packages/
│   ├── <shared-package>/          # shared libraries consumed by apps
│   └── ...
├── docs/
├── turbo.json | nx.json
├── package.json                   # root workspace manifest
├── tsconfig.base.json
└── README.md
```

Each app/package under `apps/` or `packages/` follows the single-app convention internally (its own `src/`, `tests/`, `package.json`, `tsconfig.json`). Never let a shared package import directly from another package's `src/` internals — only from its public export (`index.ts`/barrel).

## Python

```
project/
├── src/<package_name>/ | <package_name>/
│   ├── __init__.py
│   └── ...
├── tests/                         # mirrors package structure, test_*.py
├── docs/
├── scripts/
├── pyproject.toml | setup.py + setup.cfg
├── requirements.txt | poetry.lock
└── README.md
```

Prefer the `src/` layout (`src/<package_name>/`) for anything installable/publishable; flat `<package_name>/` at root is acceptable for simple scripts or internal tools.

## Rust

```
project/
├── src/
│   ├── main.rs | lib.rs
│   ├── bin/                       # additional binaries
│   └── <module>/mod.rs            # module directories
├── tests/                         # integration tests
├── benches/                       # benchmarks
├── examples/
├── Cargo.toml
└── README.md
```

For workspaces: root `Cargo.toml` with `[workspace]`, member crates each in their own top-level directory following the single-crate convention.

## Go

```
project/
├── cmd/<binary-name>/main.go      # entry points, one dir per binary
├── internal/                      # private application code
├── pkg/                           # public library code (importable by others)
├── api/                           # API definitions (proto, OpenAPI)
├── scripts/
├── go.mod
└── README.md
```

## Docs-only / knowledge-base projects

```
project/
├── docs/
│   ├── 00-<topic>.md, 01-<topic>.md, ...  # numbered for reading order, or
│   └── <category>/<topic>.md              # grouped by category
├── assets/ | images/              # referenced media
├── README.md                      # index / entry point linking into docs/
└── .gitignore
```

Numbered prefixes (`00-`, `01-`) are useful when there's a strict reading order (e.g. onboarding docs, a spec sequence). Category folders are better when docs are looked up by topic rather than read start-to-end.

## Universal root-level hygiene (all stacks)

Only these belong directly at the project root:
- Package/dependency manifest (`package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`)
- Lockfile
- Primary config files the tooling *requires* at root (`tsconfig.json`, `.eslintrc`, `next.config.js`, etc. — only if the tool mandates root placement)
- `README.md`, `LICENSE`, `CHANGELOG.md`
- `.gitignore`, `.env.example`
- CI/CD directory (`.github/`, `.gitlab-ci.yml`)
- Top-level source/test/docs/scripts directories themselves

Anything else — loose `.ts`/`.py`/`.js` files, ad-hoc notes, one-off scripts, images, exported data files — should move into an appropriately named subfolder.

## Naming consistency checklist

- Pick one casing convention per file category and apply it uniformly: `kebab-case.ts` for files, `PascalCase.tsx` for React/Vue components is a common accepted split — don't mix `kebab-case` and `snake_case` for the same category.
- Pick one name for a "miscellaneous utilities" folder (`lib/` or `utils/` or `helpers/`) and don't let more than one coexist with overlapping purpose.
- Plural vs singular: prefer plural for folders holding many instances of a thing (`components/`, `routes/`, `services/`), singular for a folder holding one concept's internals (`config/`, `auth/`).
