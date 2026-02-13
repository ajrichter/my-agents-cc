# Skill: lint-and-style

## Purpose
Run linting and verify new code matches the existing codebase style conventions.

## Trigger
Called after validate-tests.

## Procedure

1. **Run project linter**:
   - Detect linter config: `.eslintrc`, `.prettierrc`, `checkstyle.xml`, etc.
   - Execute: `npx eslint src/` / `mvn checkstyle:check` / etc.
   - Capture all warnings and errors

2. **Auto-fix what's possible**:
   - `npx eslint --fix <changed-files>`
   - `npx prettier --write <changed-files>`
   - Record what was auto-fixed

3. **Manual style checks** on changed files:
   - **Indentation**: Match existing (2-space, 4-space, tabs)
   - **Quotes**: Match existing (single vs double)
   - **Semicolons**: Match existing convention
   - **Naming**: camelCase for JS functions, PascalCase for classes, etc.
   - **Import ordering**: Match existing grouping and sort order
   - **File naming**: Match existing convention (kebab-case, camelCase, PascalCase)

4. **Check for style divergence**:
   - Compare generated code patterns to 3-5 existing similar files
   - Flag any significant deviations
   - Specific checks:
     - Are comments in the same style? (JSDoc vs inline, Javadoc vs inline)
     - Error handling pattern consistent?
     - Async pattern consistent? (async/await vs .then())

5. **Report remaining issues**:
   - Categorize as: auto-fixed, manual-fix-needed, style-suggestion
   - Only flag genuine issues, not personal preferences

## Output
```json
{
  "lintPassed": true,
  "autoFixed": ["src/graphql/queries/getUser.js"],
  "remainingIssues": [],
  "styleConsistent": true
}
```
