---
name: decide-loop
description: "Determine whether the builder agent needs to re-run to fix issues found during inspection. Produces loop instructions or final approval."
user-invocable: false
allowed-tools: Read
---

# Decide Loop

Determine if Bob the Builder needs to re-run based on all validation results.

## Collect results from previous skills
- validate-tests → any test failures?
- lint-and-style → any unfixable lint errors?
- code-review → any NEEDS_REWORK ratings?
- completeness-check → any missed endpoints?
- safety-check → any critical safety issues?

## Decision matrix

| Condition | Decision |
|-----------|----------|
| Tests fail (introduced failures) | **LOOP REQUIRED** |
| Any file rated NEEDS_REWORK | **LOOP REQUIRED** |
| Endpoints missed | **LOOP REQUIRED** |
| Build fails | **LOOP REQUIRED** |
| Critical safety issue | **LOOP REQUIRED** |
| Only MINOR_ISSUES | Fix in-place, NO LOOP |
| Style-only issues | Auto-fix, NO LOOP |
| All checks pass | NO LOOP |

## If loop required
1. Set `requiresBuilderLoop: true` in inspector output
2. Write specific fix instructions to `.agent-tracking/builder-loop-instructions.json`:
```json
{
  "loop": 2,
  "items": [
    {
      "type": "test_failure",
      "file": "src/graphql/queries/getUser.js",
      "issue": "Response shape mismatch — missing 'createdAt' field",
      "expectedFix": "Add createdAt to GQL query selection set"
    }
  ]
}
```
3. Maximum 3 loops. If issues persist after 3, escalate to manual review.

## If no loop needed
```json
{
  "requiresBuilderLoop": false,
  "approved": true,
  "confidenceScore": 95,
  "notes": "All checks pass."
}
```
