---
name: validate-build
description: "Run the project's full build and test suite after code changes. Reports pass/fail with details. Use to verify code compiles and tests pass."
user-invocable: true
allowed-tools: Read, Bash
---

# Validate Build

Run the full build and test suite to ensure nothing is broken.

## Detect build command
- `package.json` → `npm run build` or `npm run compile`
- `pom.xml` → `mvn compile`
- `build.gradle` → `gradle build`

## Run build
1. Execute the build command
2. Capture stdout and stderr
3. If build fails: analyze errors, attempt fixes, rebuild (max 3 attempts)

## Run full test suite
- `npm test` / `mvn test` / `gradle test`
- Capture results (total, passed, failed, skipped)
- Categorize failures as:
  - **Pre-existing** (existed before our changes) — note but don't fix
  - **Introduced** (caused by our changes) — must fix

## Type checking (if applicable)
- TypeScript: `npx tsc --noEmit`
- Java: compiler already checks during build

## Output shape
```json
{
  "buildStatus": "success",
  "buildAttempts": 1,
  "testResults": { "total": 42, "passed": 42, "failed": 0, "skipped": 2 },
  "typeCheckPassed": true,
  "errors": []
}
```

## Rules
- NEVER ignore test failures — either fix them or document as pre-existing
- NEVER modify tests to make them pass (fix the code instead)
- If build cannot be fixed in 3 attempts, report failure
