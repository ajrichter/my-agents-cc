---
name: validate-tests
description: "Run the full test suite, compare with builder's reported results, verify new tests exist for every generated function. Use to validate test coverage after code changes."
user-invocable: true
allowed-tools: Read, Bash
---

# Validate Tests

Run the full test suite and verify all tests pass, including new tests added by Bob.

## Run full test suite
- Detect test command from package.json / pom.xml / build.gradle
- Execute: `npm test` / `mvn test` / `gradle test`
- Capture full output

## Compare with builder's reported results
- Read `.agent-tracking/builder-output.json` → `testResults`
- Verify counts match (total, passed, failed)
- Flag discrepancies — Bob may have run partial suites

## Check test coverage (if tools available)
- JavaScript: `npx jest --coverage` or `npx nyc npm test`
- Java: jacoco report
- Flag new code without test coverage

## Verify new tests exist
For each generated function in builder output:
- Confirm a corresponding test file exists
- Confirm the test actually tests the function (not an empty test)
- Check tests mock the GQL client, verify query, verify variables, verify response mapping
- Check tests cover error cases

## Output shape
```json
{
  "testsPassed": true,
  "total": 42,
  "passed": 42,
  "failed": 0,
  "newTestsVerified": true,
  "issues": []
}
```
