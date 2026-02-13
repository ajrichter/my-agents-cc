# My Agents CC — Modular Claude Code Subagent Pipeline

Migrates HTTP/REST endpoints to GraphQL across one or many repositories using 3 modular Claude Code agents.

## Agents

| Agent | Name | Role |
|-------|------|------|
| `.claude/agents/magellan.md` | Magellan the Discoverer | Scans repos, matches endpoints, generates GQL queries, produces migration plan |
| `.claude/agents/bob-the-builder.md` | Bob the Builder | Generates GQL client code with strict TDD, replaces REST calls |
| `.claude/agents/inspector-gadget.md` | Inspector Gadget | Validates changes, reviews code, decides if Bob needs to loop back |

## Skills (18 total)

### Magellan's skills (5)
- `scan-repo` — full repo scan for HTTP client calls
- `detect-language` — detect language, framework, HTTP client, test framework
- `match-endpoints` — fuzzy-match discovered calls to endpoint list
- `generate-graphql` — generate GQL queries from REST definitions (slash: `/generate-graphql`)
- `plan-migration` — prioritize endpoints, rate complexity, flag risks

### Bob's skills (6)
- `detect-stack` — deep tech stack analysis
- `setup-graphql-client` — scaffold GQL client infrastructure (slash: `/setup-graphql-client`)
- `generate-query-files` — create .graphql files + wrapper functions (slash: `/generate-query-files`)
- `tdd-cycle` — red-green-refactor loop per endpoint
- `replace-rest-calls` — swap REST calls with GQL wrappers (slash: `/replace-rest-calls`)
- `validate-build` — run build + test suite (slash: `/validate-build`)

### Gadget's skills (7)
- `validate-tests` — run tests, verify coverage (slash: `/validate-tests`)
- `lint-and-style` — lint, auto-fix, style consistency (slash: `/lint-and-style`)
- `code-review` — senior-level code review (slash: `/code-review`)
- `completeness-check` — verify all endpoints migrated
- `safety-check` — production safety validation
- `decide-loop` — should Bob re-run?
- `generate-report` — final summary for architect (slash: `/generate-report`)

## Pipeline Flow

```
Endpoints JSON → Magellan → discoverer-output.json
                              ↓
                            Bob ←──── loop back? ←── Gadget
                              ↓                        ↑
                         builder-output.json ─────────→│
                                                       ↓
                                              inspector-output.json → APPROVED
```

## Tracking

Each target repo gets `.agent-tracking/` with:
- `pipeline-status.json` — overall state
- `discoverer-input.json` — endpoints input
- `discoverer-output.json` — Magellan's findings
- `builder-output.json` — Bob's generated code report
- `inspector-output.json` — Gadget's validation report
- `builder-loop-instructions.json` — loop-back instructions (if needed)
- `magellan-status.json`, `bob-status.json`, `gadget-status.json` — per-agent status

## Supported Languages
- JavaScript/TypeScript (primary)
- Java (primary)
- Python (future)
