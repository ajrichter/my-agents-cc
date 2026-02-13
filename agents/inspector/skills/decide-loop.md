# Skill: decide-loop

## Purpose
Determine whether the Builder agent needs to re-run to fix issues found during inspection.

## Trigger
Called after all other validation skills have completed.

## Procedure

1. **Collect all results** from previous skills:
   - validate-tests → any test failures?
   - lint-and-style → any unfixable lint errors?
   - code-review → any NEEDS_REWORK ratings?
   - completeness-check → any missed endpoints?
   - safety-check → any critical safety issues?

2. **Decision matrix**:

   | Condition | Decision |
   |-----------|----------|
   | Tests fail (introduced failures) | LOOP REQUIRED |
   | Any file rated NEEDS_REWORK | LOOP REQUIRED |
   | Endpoints missed | LOOP REQUIRED |
   | Build fails | LOOP REQUIRED |
   | Critical safety issue | LOOP REQUIRED |
   | Only MINOR_ISSUES | Fix in-place, NO LOOP |
   | Style-only issues | Auto-fix, NO LOOP |
   | All checks pass | NO LOOP |

3. **If loop required**, prepare loop instructions:
   ```json
   {
     "requiresBuilderLoop": true,
     "loopReason": "2 test failures and 1 missed endpoint",
     "loopItems": [
       {
         "type": "test_failure",
         "file": "src/graphql/queries/getUser.js",
         "issue": "Response shape mismatch — missing 'createdAt' field",
         "expectedFix": "Add createdAt to GQL query selection set"
       },
       {
         "type": "missed_endpoint",
         "endpoint": "PUT /api/users/:id",
         "locations": ["src/pages/Profile.jsx:89"],
         "expectedFix": "Generate updateUser GQL mutation and replace REST call"
       }
     ],
     "maxLoops": 3,
     "currentLoop": 1
   }
   ```

4. **Loop limit**: Maximum 3 builder loops. If issues persist after 3 loops, escalate to manual review.

5. **If no loop needed**, prepare final approval:
   ```json
   {
     "requiresBuilderLoop": false,
     "approved": true,
     "confidenceScore": 95,
     "notes": "All checks pass. Minor style auto-fixes applied."
   }
   ```

## Output
Loop decision with detailed instructions if looping, or approval if not.
