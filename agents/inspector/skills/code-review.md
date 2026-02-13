# Skill: code-review

## Purpose
Perform a senior-engineer-level code review on every changed file.

## Trigger
Called after lint-and-style, for each file in the change manifest.

## Procedure

### For each changed file:

1. **Read the diff** (git diff for modified files, full content for new files)

2. **Correctness check**:
   - Does the GQL query match the original REST call's behavior exactly?
   - Are all response fields mapped correctly?
   - Are query variables correctly derived from the original params?
   - Is the data shape returned to callers unchanged?

3. **Error handling check**:
   - Are GraphQL errors caught?
   - Are network errors handled?
   - Are partial data responses handled (GQL can return data + errors)?
   - Is error handling consistent with the existing codebase patterns?

4. **Type safety check**:
   - TypeScript: Are proper types/interfaces defined for GQL responses?
   - Java: Are DTOs/records defined for GQL responses?
   - No `any` types or unsafe casts

5. **Security check**:
   - No hardcoded API keys, tokens, or secrets
   - Auth headers properly forwarded (not hardcoded)
   - No user input directly interpolated into queries (use variables)
   - CORS considerations handled

6. **Performance check**:
   - No N+1 query patterns (fetching lists then querying each item)
   - Appropriate use of fragments for shared fields
   - No unnecessary fields in queries (over-fetching)

7. **Code smell check**:
   - No dead code or commented-out code
   - No duplicated logic across query files
   - Function length reasonable (< 30 lines)
   - No deeply nested callbacks or promise chains

### Rating per file:
- **PASS**: No issues found
- **MINOR_ISSUES**: Style or non-critical concerns, can fix in-place
- **NEEDS_REWORK**: Functional issues, must loop back to Builder

## Output
Per-file review with rating, issues found, and specific line references.
