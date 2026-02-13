# My Agents CC — Modular Claude Code Subagent Pipeline

## Overview
This project contains 3 modular Claude Code subagents that work independently or together as a pipeline to migrate HTTP REST endpoints to GraphQL across one or many repositories.

## Architecture

```
orchestrator/          — Pipeline runner, multi-repo runner, status viewer
agents/
  discoverer/          — Agent 1: Magellan — scans repos for endpoints, maps to GQL
  builder/             — Agent 2: Bob the Builder — generates GQL code with TDD
  inspector/           — Agent 3: Inspector Gadget — validates, lints, loops back
shared/                — Shared utilities (tracking, config, schemas)
scripts/               — Helper scripts
templates/             — Code generation templates (Java, JS)
tracking/              — JSON status files (generated at runtime)
```

## Running Agents

Each agent can be invoked independently via Claude Code by `cd`-ing into its folder and running claude with that agent's CLAUDE.md context, or through the orchestrator:

```bash
# Individual agents
npm run discover -- --repo /path/to/repo --endpoints endpoints.json
npm run build    -- --repo /path/to/repo
npm run inspect  -- --repo /path/to/repo

# Full pipeline (all 3 in sequence)
npm run pipeline -- --repo /path/to/repo --endpoints endpoints.json

# Multi-repo (run pipeline across all repos in a folder)
npm run pipeline:multi -- --folder /path/to/repos --endpoints endpoints.json

# Check status
npm run status -- --repo /path/to/repo
```

## Agent Communication
Agents communicate via JSON tracking files in each target repo's `.agent-tracking/` directory. Each agent reads the previous agent's output and writes its own. The orchestrator manages the flow.

## Supported Languages
- JavaScript/TypeScript (primary)
- Java (primary)
- Python (future)

## Key Rules
- Never modify files outside the target repo
- Always write tracking JSON before and after changes
- Each agent must be independently runnable
- All code changes must be validated before marking complete
- TDD approach: red test → code → green test
