# my-agents-cc

Modular Claude Code subagent pipeline for migrating HTTP/REST endpoints to GraphQL — across one or many repositories.

## 3 Agents, 18 Skills

| Agent | Codename | Skills | Role |
|-------|----------|--------|------|
| 1 | **Magellan** the Discoverer | 5 skills | Scans repos, matches endpoints, generates GQL queries, plans migration |
| 2 | **Bob** the Builder | 6 skills | Generates GQL code with strict TDD, replaces REST calls |
| 3 | **Inspector Gadget** | 7 skills | Validates, reviews, lints, decides if Bob loops back |

## How to Use

### Option A: Inside Claude Code REPL (interactive)

```bash
cd /path/to/target-repo
claude
```

Then in the REPL:
```
# Delegate to named agents
> Use the magellan agent to scan this repo for REST endpoints
> Use the bob-the-builder agent to generate GraphQL code
> Use the inspector-gadget agent to validate the changes

# Or use slash commands for individual skills
> /generate-graphql
> /setup-graphql-client
> /validate-build
> /code-review
> /generate-report
> /lint-and-style
> /validate-tests
> /replace-rest-calls
```

### Option B: CLI one-shot with named agent

```bash
cd /path/to/target-repo
claude -p "Scan this repo for REST endpoints" --agent magellan --output-format json
claude -p "Generate GraphQL code using TDD" --agent bob-the-builder --output-format json
claude -p "Validate all changes" --agent inspector-gadget --output-format json
```

### Option C: Shell scripts

```bash
# Individual agents
./scripts/run-magellan.sh /path/to/repo endpoints.json
./scripts/run-bob.sh /path/to/repo
./scripts/run-gadget.sh /path/to/repo

# Full pipeline (Magellan → Bob → Gadget with loop-back)
./scripts/run-pipeline.sh /path/to/repo endpoints.json

# Pipeline across all repos in a folder (parallel)
./scripts/run-multi-repo.sh /path/to/repos endpoints.json

# Check status
./scripts/status.sh /path/to/repo
```

### Option D: Run scripts from inside Claude Code

```
> Run ./scripts/run-pipeline.sh . templates/endpoints-example.json
> Run ./scripts/status.sh .
```

## Input Format

Create an endpoints JSON file (see `templates/endpoints-example.json`):

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
  "languages": ["javascript", "java"]
}
```

## Pipeline Flow

```
                    ┌─────────────────┐
                    │  Endpoints JSON  │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │    MAGELLAN     │
                    │  the Discoverer │
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
              ┌──────────────▼──────────────┐
              │      BOB THE BUILDER        │
          ┌──►│                             │
          │   │  detect-stack               │
          │   │  setup-graphql-client       │
          │   │  tdd-cycle (per endpoint)   │
          │   │  generate-query-files       │
          │   │  replace-rest-calls         │
          │   │  validate-build             │
          │   └──────────────┬──────────────┘
          │                  │
          │       builder-output.json
          │                  │
          │   ┌──────────────▼──────────────┐
          │   │     INSPECTOR GADGET        │
          │   │                             │
          │   │  validate-tests             │
          │   │  lint-and-style             │
          │   │  code-review                │
          │   │  completeness-check         │
          │   │  safety-check               │
          │   │  decide-loop ───────────────┼──► loop?
          │   │  generate-report            │      │
          │   └──────────────┬──────────────┘      │
          │                  │                     │
          └──── YES ─────────┘           NO ───────┘
                                         │
                                inspector-output.json
                                         │
                                   ┌─────▼─────┐
                                   │  APPROVED  │
                                   │  + Report  │
                                   └───────────┘
```

## Directory Structure

```
my-agents-cc/
├── CLAUDE.md                            # Project context (auto-loaded)
├── README.md
├── .claude/
│   ├── agents/
│   │   ├── magellan.md                  # Agent 1: Magellan the Discoverer
│   │   ├── bob-the-builder.md           # Agent 2: Bob the Builder
│   │   └── inspector-gadget.md          # Agent 3: Inspector Gadget
│   └── skills/
│       ├── scan-repo/SKILL.md           # Discoverer skills (5)
│       ├── match-endpoints/SKILL.md
│       ├── generate-graphql/SKILL.md
│       ├── detect-language/SKILL.md
│       ├── plan-migration/SKILL.md
│       ├── detect-stack/SKILL.md        # Builder skills (6)
│       ├── setup-graphql-client/SKILL.md
│       ├── generate-query-files/SKILL.md
│       ├── tdd-cycle/SKILL.md
│       ├── replace-rest-calls/SKILL.md
│       ├── validate-build/SKILL.md
│       ├── validate-tests/SKILL.md      # Inspector skills (7)
│       ├── lint-and-style/SKILL.md
│       ├── code-review/SKILL.md
│       ├── completeness-check/SKILL.md
│       ├── safety-check/SKILL.md
│       ├── decide-loop/SKILL.md
│       └── generate-report/SKILL.md
├── scripts/
│   ├── run-magellan.sh                  # Run Magellan alone
│   ├── run-bob.sh                       # Run Bob alone
│   ├── run-gadget.sh                    # Run Gadget alone
│   ├── run-pipeline.sh                  # Full pipeline with loop
│   ├── run-multi-repo.sh               # Parallel across repos
│   └── status.sh                        # View tracking status
└── templates/
    ├── endpoints-example.json           # Example endpoints input
    └── graphql/
        └── schema-example.graphql       # Example GQL schema
```

## All 18 Skills

### Magellan (Discoverer) — 5 Skills

| Skill | Slash Command | Purpose |
|-------|--------------|---------|
| `scan-repo` | (auto) | Full repo scan for HTTP client calls |
| `detect-language` | (auto) | Detect language, framework, test tools |
| `match-endpoints` | (auto) | Fuzzy-match calls to endpoint list |
| `generate-graphql` | `/generate-graphql` | Generate GQL query from REST endpoint |
| `plan-migration` | (auto) | Prioritized migration plan |

### Bob (Builder) — 6 Skills

| Skill | Slash Command | Purpose |
|-------|--------------|---------|
| `detect-stack` | (auto) | Deep tech stack analysis |
| `setup-graphql-client` | `/setup-graphql-client` | Scaffold GQL client |
| `generate-query-files` | `/generate-query-files` | Create .graphql + wrapper |
| `tdd-cycle` | (auto) | Red-green-refactor loop |
| `replace-rest-calls` | `/replace-rest-calls` | Swap REST -> GQL in code |
| `validate-build` | `/validate-build` | Run build + tests |

### Gadget (Inspector) — 7 Skills

| Skill | Slash Command | Purpose |
|-------|--------------|---------|
| `validate-tests` | `/validate-tests` | Run test suite + verify coverage |
| `lint-and-style` | `/lint-and-style` | Lint + auto-fix + style check |
| `code-review` | `/code-review` | Senior-level review |
| `completeness-check` | (auto) | Verify all endpoints migrated |
| `safety-check` | (auto) | Production safety validation |
| `decide-loop` | (auto) | Loop-back decision |
| `generate-report` | `/generate-report` | Final architect summary |

## Tracking

Each target repo gets a `.agent-tracking/` directory:

| File | Written by | Purpose |
|------|-----------|---------|
| `pipeline-status.json` | scripts | Overall pipeline state |
| `magellan-status.json` | Magellan | Discoverer phase status |
| `bob-status.json` | Bob | Builder phase status |
| `gadget-status.json` | Gadget | Inspector phase status |
| `discoverer-input.json` | scripts | Copy of endpoints input |
| `discoverer-output.json` | Magellan | Scan results + migration plan |
| `builder-output.json` | Bob | Generated files + test results |
| `inspector-output.json` | Gadget | Validation results + report |
| `builder-loop-instructions.json` | Gadget | Fix instructions for Bob (if looping) |

## Supported Languages

| Language | HTTP Clients Detected | GQL Clients Generated | Status |
|----------|----------------------|----------------------|--------|
| JavaScript/TypeScript | axios, fetch, got, superagent, ky | Apollo, urql, graphql-request | Primary |
| Java | RestTemplate, WebClient, OkHttp, Retrofit, Feign | Spring GraphQL, HttpGraphQlClient | Primary |
| Python | requests, httpx, aiohttp | gql, sgqlc | Future |
