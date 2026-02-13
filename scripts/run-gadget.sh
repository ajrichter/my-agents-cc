#!/usr/bin/env bash
# Run Inspector Gadget agent against a target repo.
# Usage: ./scripts/run-gadget.sh [repo-path]
set -euo pipefail

REPO="$(cd "${1:-.}" && pwd)"

echo "[gadget] Starting inspection on: $REPO"

mkdir -p "$REPO/.agent-tracking"

# Write phase status
echo '{"phase":"inspector-gadget","status":"in_progress","startedAt":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}' \
  > "$REPO/.agent-tracking/gadget-status.json"

cd "$REPO"
claude -p "You are Inspector Gadget. Read .agent-tracking/builder-output.json and discoverer-output.json. \
Use validate-tests, lint-and-style, code-review, completeness-check, safety-check, decide-loop, generate-report skills. \
Write complete structured JSON output to .agent-tracking/inspector-output.json. \
Set requiresBuilderLoop to true in your output if issues need fixing by Bob. \
If looping, also write specific instructions to .agent-tracking/builder-loop-instructions.json. \
Update .agent-tracking/gadget-status.json setting status to completed when done." \
  --agent inspector-gadget \
  --output-format json

echo "[gadget] Done. Output: $REPO/.agent-tracking/inspector-output.json"
