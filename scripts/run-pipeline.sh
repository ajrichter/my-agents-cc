#!/usr/bin/env bash
# Run full 3-agent pipeline: Magellan → Bob → Gadget (with loop-back).
# Usage: ./scripts/run-pipeline.sh [repo-path] [endpoints-json] [max-loops]
set -euo pipefail

REPO="$(cd "${1:-.}" && pwd)"
ENDPOINTS="${2:-}"
MAX_LOOPS="${3:-3}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Pipeline Start ==="
echo "  Repo: $REPO"
echo "  Endpoints: ${ENDPOINTS:-<none>}"
echo "  Max loops: $MAX_LOOPS"
echo ""

mkdir -p "$REPO/.agent-tracking"
echo '{"status":"running","startedAt":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'"}' \
  > "$REPO/.agent-tracking/pipeline-status.json"

# ── Phase 1: Magellan discovers ──
echo "=== Phase 1: Magellan the Discoverer ==="
"$SCRIPT_DIR/run-magellan.sh" "$REPO" "$ENDPOINTS"

# ── Phase 2+3: Bob builds → Gadget inspects (loop up to MAX_LOOPS) ──
loop=0
while [ "$loop" -lt "$MAX_LOOPS" ]; do
  echo ""
  echo "=== Phase 2+3: Builder/Inspector loop $((loop + 1))/$MAX_LOOPS ==="

  "$SCRIPT_DIR/run-bob.sh" "$REPO"
  "$SCRIPT_DIR/run-gadget.sh" "$REPO"

  # Check if inspector wants a loop (pure bash grep)
  INSPECTOR_OUT="$REPO/.agent-tracking/inspector-output.json"
  if [ -f "$INSPECTOR_OUT" ]; then
    # TODO: For robust JSON parsing, install jq: apt-get install jq
    needs_loop=$(grep -o '"requiresBuilderLoop"[[:space:]]*:[[:space:]]*true' "$INSPECTOR_OUT" 2>/dev/null || echo "")
    if [ -z "$needs_loop" ]; then
      echo "[pipeline] Inspector approved. No loop needed."
      break
    else
      echo "[pipeline] Inspector requests loop. Reason: check inspector-output.json"
    fi
  else
    echo "[pipeline] WARNING: Inspector output not found. Stopping loop."
    break
  fi

  loop=$((loop + 1))
done

# ── Final status ──
echo '{"status":"completed","completedAt":"'"$(date -u +%Y-%m-%dT%H:%M:%SZ)"'","loops":'"$loop"'}' \
  > "$REPO/.agent-tracking/pipeline-status.json"

echo ""
echo "=== Pipeline Complete ==="
"$SCRIPT_DIR/status.sh" "$REPO"
