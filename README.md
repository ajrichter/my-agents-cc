# my-agents-cc

Modular Claude Code subagent pipeline for migrating HTTP/REST endpoints to GraphQL — across one or many repositories.

## Architecture

```
my-agents-cc/
├── CLAUDE.md                          # Root agent instructions
├── package.json                       # npm scripts for running agents
│
├── agents/
│   ├── discoverer/                    # Agent 1: Magellan
│   │   ├── CLAUDE.md                  # Agent instructions & skill index
│   │   └── skills/
│   │       ├── scan-repo.md           # Full repo scan for HTTP calls
│   │       ├── match-endpoints.md     # Fuzzy match endpoints to calls
│   │       ├── generate-graphql.md    # Generate GQL queries from REST
│   │       ├── detect-language.md     # Detect repo language & framework
│   │       └── plan-migration.md      # Create prioritized migration plan
│   │
│   ├── builder/                       # Agent 2: Bob the Builder
│   │   ├── CLAUDE.md                  # Agent instructions & skill index
│   │   └── skills/
│   │       ├── detect-stack.md        # Deep stack analysis
│   │       ├── setup-graphql-client.md # GQL client boilerplate
│   │       ├── generate-query-files.md # Per-endpoint query generation
│   │       ├── tdd-cycle.md           # Red-Green-Refactor loop
│   │       ├── replace-rest-calls.md  # Swap REST → GQL in-place
│   │       └── validate-build.md      # Build & full test suite
│   │
│   └── inspector/                     # Agent 3: Inspector Gadget
│       ├── CLAUDE.md                  # Agent instructions & skill index
│       └── skills/
│           ├── validate-tests.md      # Run & verify all tests
│           ├── lint-and-style.md      # Lint, format, style consistency
│           ├── code-review.md         # Senior-level code review
│           ├── completeness-check.md  # Verify all endpoints migrated
│           ├── safety-check.md        # Production safety validation
│           ├── decide-loop.md         # Loop-back decision logic
│           └── generate-report.md     # Final summary report
│
├── shared/
│   ├── tracking.js                    # JSON tracking system
│   └── schemas.js                     # Input/output contracts
│
├── orchestrator/
│   ├── run-agent.js                   # Run single agent
│   ├── run-pipeline.js                # Run full 3-agent pipeline
│   ├── run-multi-repo.js              # Run across folder of repos
│   ├── status.js                      # View pipeline status
│   └── reset.js                       # Reset pipeline state
│
├── templates/
│   ├── endpoints-example.json         # Example endpoints input
│   └── graphql/
│       └── schema-example.graphql     # Example GQL schema
│
└── tracking/                          # (runtime) status files
```

## Skills Map (All 18 Skills)

### Agent 1: Discoverer (Magellan) — 5 Skills

| Skill | Purpose | Input | Output |
|-------|---------|-------|--------|
| `scan-repo` | Full file scan for HTTP client calls (axios, fetch, RestTemplate, etc.) | Repo path | Array of raw HTTP call locations |
| `match-endpoints` | Fuzzy-match discovered calls to endpoint definitions | Scan results + endpoints JSON | Endpoint → location mapping with confidence |
| `generate-graphql` | Generate GQL query/mutation from REST endpoint definition | Endpoint + optional schema | GraphQL operation string |
| `detect-language` | Detect primary language, framework, HTTP client, test framework | Repo path | Language profile JSON |
| `plan-migration` | Prioritize endpoints, rate complexity, flag risks | All match results | Ordered migration plan |

### Agent 2: Bob the Builder — 6 Skills

| Skill | Purpose | Input | Output |
|-------|---------|-------|--------|
| `detect-stack` | Deep tech stack analysis (framework, deps, patterns) | Repo + discoverer output | Complete stack profile |
| `setup-graphql-client` | Generate/configure GQL client infrastructure | Stack profile | Client setup files |
| `generate-query-files` | Create .graphql files and typed wrapper functions | Per endpoint from plan | Query files + wrappers |
| `tdd-cycle` | Red→Green→Refactor loop for each endpoint | Endpoint to migrate | TDD log + passing tests |
| `replace-rest-calls` | Swap REST calls with GQL wrappers in-place | Occurrence locations | Modified source files |
| `validate-build` | Run build + full test suite, fix failures | All changes complete | Build/test report |

### Agent 3: Inspector Gadget — 7 Skills

| Skill | Purpose | Input | Output |
|-------|---------|-------|--------|
| `validate-tests` | Run full test suite, verify new tests exist | Builder output | Test results + coverage |
| `lint-and-style` | Run linter, auto-fix, check style consistency | Changed files | Lint report |
| `code-review` | Senior-level review (correctness, security, perf) | Each changed file | Per-file review verdict |
| `completeness-check` | Verify all planned endpoints were migrated | Discoverer + builder output | Completeness report |
| `safety-check` | Feature flags, fallbacks, auth, rollback readiness | All changes | Safety assessment |
| `decide-loop` | Determine if Builder needs to re-run | All validation results | Loop decision + instructions |
| `generate-report` | Final summary with confidence score and recommendations | All inspection results | Architect-ready report |

## How to Use

### 1. Prepare Your Input

Create an endpoints JSON file listing the REST endpoints to migrate:

```json
{
  "endpoints": [
    {
      "method": "GET",
      "path": "/api/users/:id",
      "attributes": ["id", "name", "email"],
      "description": "Fetch user by ID"
    }
  ],
  "graphqlSchema": "./schema.graphql",
  "languages": ["javascript"]
}
```

See `templates/endpoints-example.json` for a full example.

### 2. Run Against a Single Repo

```bash
# Run agents individually
npm run discover -- --repo /path/to/repo --endpoints endpoints.json
npm run build    -- --repo /path/to/repo
npm run inspect  -- --repo /path/to/repo

# Or run the full pipeline
npm run pipeline -- --repo /path/to/repo --endpoints endpoints.json

# Check status anytime
npm run status -- --repo /path/to/repo

# Reset and start over
npm run reset -- --repo /path/to/repo
```

### 3. Run Against Multiple Repos

```bash
# All repos in a folder
npm run pipeline:multi -- --folder /path/to/repos --endpoints endpoints.json
```

### 4. Run Agents Directly with Claude Code

Each agent can be invoked directly by pointing Claude Code at the agent's CLAUDE.md:

```bash
cd /path/to/target-repo
claude --claude-md /path/to/my-agents-cc/agents/discoverer/CLAUDE.md
```

## Pipeline Flow

```
                    ┌─────────────────┐
                    │  Endpoints JSON │
                    │  + GQL Schema   │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   DISCOVERER    │
                    │   (Magellan)    │
                    │                 │
                    │  scan-repo      │
                    │  detect-language│
                    │  match-endpoints│
                    │  generate-gql   │
                    │  plan-migration │
                    └────────┬────────┘
                             │
                    discoverer-output.json
                             │
               ┌─────────────▼─────────────┐
               │       BOB THE BUILDER     │
           ┌──►│                           │
           │   │  detect-stack             │
           │   │  setup-graphql-client     │
           │   │  generate-query-files     │
           │   │  tdd-cycle (per endpoint) │
           │   │  replace-rest-calls       │
           │   │  validate-build           │
           │   └─────────────┬─────────────┘
           │                 │
           │        builder-output.json
           │                 │
           │   ┌─────────────▼─────────────┐
           │   │    INSPECTOR GADGET       │
           │   │                           │
           │   │  validate-tests           │
           │   │  lint-and-style           │
           │   │  code-review              │
           │   │  completeness-check       │
           │   │  safety-check             │
           │   │  decide-loop ─────────────┼──► loop back?
           │   │  generate-report          │        │
           │   └─────────────┬─────────────┘        │
           │                 │                      │
           └─────── YES ─────┘            NO ───────┘
                                          │
                                 inspector-output.json
                                          │
                                    ┌─────▼─────┐
                                    │  APPROVED  │
                                    │  + Report  │
                                    └───────────┘
```

## JSON Tracking System

Each target repo gets a `.agent-tracking/` directory containing:

| File | Purpose |
|------|---------|
| `pipeline-status.json` | Overall pipeline state, phase statuses |
| `discoverer-input.json` | Copy of endpoints input |
| `discoverer-output.json` | Scan results, GQL mappings, migration plan |
| `builder-output.json` | Generated files, test results, TDD log |
| `inspector-output.json` | Validation results, review verdicts, report |
| `change-manifest.json` | All file changes + scan coverage proof |
| `builder-loop-instructions.json` | Loop-back instructions (if needed) |

## Supported Languages

| Language | HTTP Clients Detected | GQL Clients Generated | Status |
|----------|----------------------|----------------------|--------|
| JavaScript/TypeScript | axios, fetch, got, superagent, ky | Apollo, urql, graphql-request | Primary |
| Java | RestTemplate, WebClient, OkHttp, Retrofit, Feign | Spring GraphQL, HttpGraphQlClient | Primary |
| Python | requests, httpx, aiohttp | gql, sgqlc | Future |

## Key Design Decisions

1. **Agents communicate via JSON files** — no direct coupling, each can run independently
2. **Skills are markdown documents** — they serve as structured instructions for Claude Code, not executable code
3. **Tracking is per-repo** — `.agent-tracking/` lives inside each target repo so multiple repos can be processed in parallel
4. **TDD is mandatory** — Builder must write failing tests first, then implement
5. **Inspector can loop** — up to 3 times back to Builder for fixes before escalating to manual review
6. **Scan coverage is tracked** — Discoverer must prove it scanned the entire repo
