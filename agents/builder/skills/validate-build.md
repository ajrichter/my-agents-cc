# Skill: validate-build

## Purpose
Run the full build and test suite after all code changes are complete to ensure nothing is broken.

## Trigger
Called as the final step of the Builder phase, after all endpoints are migrated.

## Procedure

1. **Detect build command**:
   - `package.json` → `npm run build` or `npm run compile`
   - `pom.xml` → `mvn compile`
   - `build.gradle` → `gradle build`

2. **Run build**:
   - Execute the build command
   - Capture stdout and stderr
   - If build fails: analyze errors, attempt fixes, rebuild (max 3 attempts)
   - Record build result

3. **Run full test suite**:
   - `npm test` / `mvn test` / `gradle test`
   - Capture results (total, passed, failed, skipped)
   - If tests fail: categorize failures as:
     - Pre-existing (existed before our changes)
     - Introduced (caused by our changes → must fix)
   - Fix introduced failures, re-run

4. **Type checking** (if applicable):
   - TypeScript: `npx tsc --noEmit`
   - Java: compiler already checks during build

5. **Report**:
   ```json
   {
     "buildStatus": "success|failure",
     "buildAttempts": 1,
     "testResults": {
       "total": 42,
       "passed": 42,
       "failed": 0,
       "skipped": 2
     },
     "typeCheckPassed": true,
     "errors": []
   }
   ```

## Rules
- NEVER ignore test failures — either fix them or document them as pre-existing
- NEVER modify tests to make them pass (fix the code instead)
- If build cannot be fixed in 3 attempts, report failure for Inspector
