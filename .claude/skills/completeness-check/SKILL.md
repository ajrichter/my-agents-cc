---
name: completeness-check
description: "Verify every planned endpoint migration was completed and no REST calls to migrated endpoints remain. Cross-references discoverer plan with builder changes."
user-invocable: false
allowed-tools: Read, Grep, Glob
---

# Completeness Check

Verify the migration is complete — every planned endpoint was actually migrated.

## Cross-reference plans vs changes
1. Read `.agent-tracking/discoverer-output.json` → `occurrences[]`
2. Read `.agent-tracking/builder-output.json` → `modifiedFiles[]`
3. For each occurrence in discoverer output:
   - Verify it appears in builder's modified files
   - Mark as: **migrated** / **skipped** / **missed**

## Re-scan for remaining REST calls
- Run the same grep patterns from scan-repo skill
- Check only for the specific endpoints that were supposed to be migrated
- Any remaining matches = incomplete migration

## Verify new files are complete
- Each GQL query file has: query definition, wrapper function, export
- Client setup file exists and is properly configured
- Test files exist for every generated function

## Check for orphaned code
- Old HTTP client imports that are no longer used
- Old utility functions that were only used by REST calls
- Old type definitions for REST responses no longer needed

## Verify scan coverage
- Read discoverer output `scanCoverage`
- Verify all relevant directories were scanned
- Flag any that might have been missed

## Output shape
```json
{
  "complete": true,
  "totalPlanned": 12,
  "totalMigrated": 12,
  "totalSkipped": 0,
  "totalMissed": 0,
  "remainingRestCalls": [],
  "orphanedCode": [],
  "scanCoverageVerified": true
}
```
