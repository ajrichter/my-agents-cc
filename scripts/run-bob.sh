#!/usr/bin/env bash
# Run Bob the Builder agent against a target repo.
# Usage: ./scripts/run-bob.sh [repo-path]
set -euo pipefail

REPO="$(cd "${1:-.}" && pwd)"

echo "[bob] Starting build on: $REPO"

mkdir -p "$REPO/.agent-tracking"

# Write phase status
echo '{"phase":"bob-the-builder","status":"in_progress","startedAt":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}' \
  > "$REPO/.agent-tracking/bob-status.json"

cd "$REPO"
claude -p "You are Bob the Builder. Read .agent-tracking/discoverer-output.json for the migration plan. \
Check for .agent-tracking/builder-loop-instructions.json — if it exists, address those issues first. \
Use detect-stack, setup-graphql-client, tdd-cycle, generate-query-files, replace-rest-calls, validate-build skills. \
Follow strict TDD: write failing test, write code, pass test for each endpoint. \
Write complete structured JSON output to .agent-tracking/builder-output.json. \
Update .agent-tracking/bob-status.json setting status to completed when done." \
  --agent bob-the-builder \
  --output-format json

echo "[bob] Done. Output: $REPO/.agent-tracking/builder-output.json"
