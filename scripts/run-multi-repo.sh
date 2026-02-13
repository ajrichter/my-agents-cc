#!/usr/bin/env bash
# Run pipeline across all repos in a folder (parallel execution).
# Usage: ./scripts/run-multi-repo.sh <folder> [endpoints-json] [max-loops]
set -euo pipefail

FOLDER="$(cd "${1}" && pwd)"
ENDPOINTS="${2:-}"
MAX_LOOPS="${3:-3}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Multi-Repo Pipeline ==="
echo "  Folder: $FOLDER"
echo "  Endpoints: ${ENDPOINTS:-<none>}"
echo ""

repo_count=0
for repo in "$FOLDER"/*/; do
  # Only process directories that look like repos
  [ -d "$repo/.git" ] || [ -f "$repo/package.json" ] || [ -f "$repo/pom.xml" ] || [ -f "$repo/build.gradle" ] || continue

  repo_count=$((repo_count + 1))
  echo "--- Queuing: $(basename "$repo") ---"
  "$SCRIPT_DIR/run-pipeline.sh" "$repo" "$ENDPOINTS" "$MAX_LOOPS" &
done

if [ "$repo_count" -eq 0 ]; then
  echo "No repositories found in: $FOLDER"
  echo "Looking for directories with .git/, package.json, pom.xml, or build.gradle"
  exit 1
fi

echo ""
echo "Waiting for $repo_count repos to complete..."
wait

echo ""
echo "=== All Repos Processed ==="
"$SCRIPT_DIR/status.sh" "$FOLDER"
