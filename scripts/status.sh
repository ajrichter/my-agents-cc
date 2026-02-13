#!/usr/bin/env bash
# Show pipeline status for a repo or folder of repos.
# Usage: ./scripts/status.sh [path]
set -euo pipefail

TARGET="${1:-.}"

# ── Multi-repo mode: if target has no .agent-tracking but has subdirs ──
if [ -d "$TARGET" ] && [ ! -d "$TARGET/.agent-tracking" ]; then
  has_repos=false
  for repo in "$TARGET"/*/; do
    [ -d "$repo/.agent-tracking" ] || continue
    has_repos=true
  done

  if [ "$has_repos" = true ]; then
    echo "=== Multi-Repo Status ==="
    echo ""
    for repo in "$TARGET"/*/; do
      [ -d "$repo/.agent-tracking" ] || continue
      name="$(basename "$repo")"
      pipeline_file="$repo/.agent-tracking/pipeline-status.json"

      if [ -f "$pipeline_file" ]; then
        status=$(grep -o '"status"[[:space:]]*:[[:space:]]*"[^"]*"' "$pipeline_file" | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
        case "$status" in
          completed)   icon="[done]" ;;
          running)     icon="[....]" ;;
          failed)      icon="[FAIL]" ;;
          *)           icon="[    ]" ;;
        esac
        echo "  $icon $name"
      else
        echo "  [    ] $name"
      fi
    done
    echo ""
    exit 0
  fi

  echo "No pipeline data found at: $TARGET"
  exit 0
fi

# ── Single repo mode ──
REPO="$(cd "$TARGET" && pwd)"
TRACKING="$REPO/.agent-tracking"

if [ ! -d "$TRACKING" ]; then
  echo "No pipeline initialized for: $REPO"
  exit 0
fi

echo "=== Pipeline Status: $(basename "$REPO") ==="
echo ""

# Show pipeline-level status
if [ -f "$TRACKING/pipeline-status.json" ]; then
  p_status=$(grep -o '"status"[[:space:]]*:[[:space:]]*"[^"]*"' "$TRACKING/pipeline-status.json" | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
  echo "  Pipeline: $p_status"
fi

# Show agent statuses
echo "  Agents:"
for agent_label in "magellan:Magellan the Discoverer" "bob:Bob the Builder" "gadget:Inspector Gadget"; do
  agent="${agent_label%%:*}"
  label="${agent_label#*:}"
  status_file="$TRACKING/${agent}-status.json"

  if [ -f "$status_file" ]; then
    status=$(grep -o '"status"[[:space:]]*:[[:space:]]*"[^"]*"' "$status_file" | head -1 | sed 's/.*"\([^"]*\)"$/\1/')
    case "$status" in
      completed)   icon="[done]" ;;
      in_progress) icon="[....]" ;;
      failed)      icon="[FAIL]" ;;
      *)           icon="[    ]" ;;
    esac
    echo "    $icon $label"
  else
    echo "    [    ] $label"
  fi
done

# Show output files
echo ""
echo "  Outputs:"
for f in discoverer-output.json builder-output.json inspector-output.json; do
  if [ -f "$TRACKING/$f" ]; then
    size=$(wc -c < "$TRACKING/$f" | tr -d ' ')
    echo "    [exists] $f (${size} bytes)"
  else
    echo "    [      ] $f"
  fi
done
echo ""
