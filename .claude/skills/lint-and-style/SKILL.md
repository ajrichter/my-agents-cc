---
name: lint-and-style
description: "Run linting and style checks on changed files. Auto-fixes what's possible, verifies new code matches existing codebase conventions. Use to ensure style consistency."
user-invocable: true
allowed-tools: Read, Edit, Bash
---

# Lint and Style Check

Run linting and verify new code matches the existing codebase style.

## Run project linter
- Detect config: `.eslintrc*`, `.prettierrc*`, `checkstyle.xml`, `spotless`
- Execute: `npx eslint src/` / `mvn checkstyle:check` / etc.
- Capture all warnings and errors

## Auto-fix what's possible
- `npx eslint --fix <changed-files>`
- `npx prettier --write <changed-files>`
- Record what was auto-fixed

## Manual style checks on changed files
- **Indentation**: Match existing (2-space, 4-space, tabs)
- **Quotes**: Match existing (single vs double)
- **Semicolons**: Match existing convention
- **Naming**: camelCase for JS functions, PascalCase for classes, etc.
- **Import ordering**: Match existing grouping and sort order
- **File naming**: Match existing convention (kebab-case, camelCase, PascalCase)

## Check for style divergence
Compare generated code patterns to 3-5 existing similar files:
- Comment style (JSDoc vs inline, Javadoc vs inline)
- Error handling pattern consistency
- Async pattern consistency (async/await vs .then())

## Output shape
```json
{
  "lintPassed": true,
  "autoFixed": ["src/graphql/queries/getUser.js"],
  "remainingIssues": [],
  "styleConsistent": true
}
```
