# Skill: validate-tests

## Purpose
Run the full test suite and verify all tests pass, including new tests added by the Builder.

## Trigger
Called as the first validation step in the Inspector phase.

## Procedure

1. **Run full test suite**:
   - Detect test command from package.json / pom.xml / build.gradle
   - Execute: `npm test` / `mvn test` / `gradle test`
   - Capture full output

2. **Compare with Builder's reported results**:
   - Read `builder-output.json` → `testResults`
   - Verify counts match (total, passed, failed)
   - Flag discrepancies — Builder may have run partial suites

3. **Check test coverage** (if tools available):
   - JavaScript: `npx nyc npm test` or jest --coverage
   - Java: jacoco report
   - Flag new code without test coverage

4. **Verify new tests exist**:
   - For each `generatedFiles[]` in builder output with type "query"
   - Confirm a corresponding test file exists
   - Confirm the test actually tests the function (not just an empty test)

5. **Check test quality**:
   - Tests mock the GQL client (not making real network calls)
   - Tests verify correct query is sent
   - Tests verify correct variables are passed
   - Tests verify response mapping
   - Tests cover error cases

## Output
```json
{
  "testsPassed": true,
  "total": 42,
  "passed": 42,
  "failed": 0,
  "newTestsVerified": true,
  "coveragePercent": 85,
  "issues": []
}
```
