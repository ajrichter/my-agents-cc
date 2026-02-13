---
name: code-review
description: "Senior-engineer-level code review on changed files. Checks correctness, error handling, types, security, performance, code smells. Use to review code quality."
user-invocable: true
allowed-tools: Read, Grep, Glob
argument-hint: "[file-path]"
---

# Code Review

Perform a senior-engineer-level code review on each changed file.

## For each changed file, check:

### 1. Correctness
- Does the GQL query match the original REST call's behavior exactly?
- Are all response fields mapped correctly?
- Are query variables correctly derived from the original params?
- Is the data shape returned to callers unchanged?

### 2. Error handling
- Are GraphQL errors caught?
- Are network errors handled?
- Are partial data responses handled (GQL can return data + errors)?
- Is error handling consistent with existing codebase patterns?

### 3. Type safety
- TypeScript: proper types/interfaces defined for GQL responses?
- Java: DTOs/records defined for GQL responses?
- No `any` types or unsafe casts

### 4. Security
- No hardcoded API keys, tokens, or secrets
- Auth headers properly forwarded (not hardcoded)
- No user input directly interpolated into queries (use variables)

### 5. Performance
- No N+1 query patterns (fetching lists then querying each item)
- Appropriate use of fragments for shared fields
- No unnecessary fields in queries (over-fetching)

### 6. Code smells
- No dead code or commented-out code
- No duplicated logic across query files
- Function length reasonable (< 30 lines)
- No deeply nested callbacks or promise chains

## Rate each file
- **PASS**: No issues found
- **MINOR_ISSUES**: Style or non-critical concerns, can fix in-place
- **NEEDS_REWORK**: Functional issues, must loop back to builder
