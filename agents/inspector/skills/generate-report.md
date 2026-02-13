# Skill: generate-report

## Purpose
Produce the final summary report for the architect to review.

## Trigger
Called as the last step when all validation passes (no loop needed).

## Procedure

1. **Compile change summary**:
   - Total files created
   - Total files modified
   - Total lines changed (additions + deletions)
   - List every file with its change type and description

2. **Migration coverage**:
   - Endpoints planned vs. migrated
   - Files scanned vs. total in repo
   - Test coverage before and after

3. **Confidence score** (0-100):
   - Start at 100
   - -5 for each MINOR_ISSUE in code review
   - -10 for each auto-fixed lint error
   - -15 for each builder loop that was needed
   - -20 for any safety warning
   - Floor at 0

4. **Risk assessment**:
   - LOW: All tests pass, no safety warnings, high confidence
   - MEDIUM: Minor issues found and fixed, some safety recommendations
   - HIGH: Builder loops needed, safety concerns, manual review recommended

5. **Recommendations for architect**:
   - Feature flag implementation (if not present)
   - Monitoring and alerting for GQL endpoint
   - Gradual rollout strategy
   - Performance testing needs
   - Documentation updates

6. **Files requiring manual review**:
   - Complex migrations with confidence < 80%
   - Files with MINOR_ISSUES that couldn't be auto-fixed
   - Security-sensitive files (auth, payments)

## Output
Comprehensive report JSON written to `inspector-output.json` and a human-readable summary.
