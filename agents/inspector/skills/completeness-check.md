# Skill: completeness-check

## Purpose
Verify that every planned endpoint migration was completed and no REST calls remain.

## Trigger
Called after code-review.

## Procedure

1. **Cross-reference plans vs. changes**:
   - Read `discoverer-output.json` → `occurrences[]`
   - Read `builder-output.json` → `modifiedFiles[]`
   - For each occurrence in discoverer output:
     - Verify it appears in builder's modified files
     - Mark as: migrated / skipped / missed

2. **Re-scan for remaining REST calls**:
   - Run the same scan patterns from the Discoverer's scan-repo skill
   - Check only for the specific endpoints that were supposed to be migrated
   - Any remaining matches = incomplete migration

3. **Verify new files are complete**:
   - Each GQL query file has: query definition, wrapper function, export
   - Client setup file exists and is properly configured
   - Test files exist for every generated function

4. **Check for orphaned code**:
   - Old HTTP client imports that are no longer used
   - Old utility functions that were only used by REST calls
   - Old type definitions for REST responses no longer needed

5. **Scan coverage validation**:
   - Read `change-manifest.json` → `scanCoverage`
   - Verify the discoverer scanned all relevant directories
   - Check for directories that might have been missed

## Output
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
