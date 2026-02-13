#!/usr/bin/env bash
# Run Magellan the Discoverer agent against a target repo.
# Usage: ./scripts/run-magellan.sh [repo-path] [endpoints-json]
set -euo pipefail

REPO="$(cd "${1:-.}" && pwd)"
ENDPOINTS="${2:-}"

echo "[magellan] Starting discovery on: $REPO"

mkdir -p "$REPO/.agent-tracking"

# Copy endpoints input if provided
if [ -n "$ENDPOINTS" ]; then
  cp "$ENDPOINTS" "$REPO/.agent-tracking/discoverer-input.json"
  echo "[magellan] Endpoints loaded from: $ENDPOINTS"
fi

# Write phase status
echo '{"phase":"magellan","status":"in_progress","startedAt":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}' \
  > "$REPO/.agent-tracking/magellan-status.json"

cd "$REPO"
claude -p "You are Magellan the Discoverer. Scan this entire repo for HTTP/REST calls. \
Read .agent-tracking/discoverer-input.json for the endpoint list to match against. \
Use your scan-repo, detect-language, match-endpoints, generate-graphql, and plan-migration skills. \
Write complete structured JSON output to .agent-tracking/discoverer-output.json. \
Update .agent-tracking/magellan-status.json setting status to completed when done." \
  --agent magellan \
  --output-format json

echo "[magellan] Done. Output: $REPO/.agent-tracking/discoverer-output.json"
