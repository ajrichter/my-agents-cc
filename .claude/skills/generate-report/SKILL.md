---
name: generate-report
description: "Produce a final summary report for the architect — change list, confidence score, risk assessment, recommendations. Use after all validation passes."
user-invocable: true
allowed-tools: Read, Write
---

# Generate Report

Produce the final summary report for the architect to review.

## Compile change summary
- Total files created
- Total files modified
- Total lines changed (additions + deletions)
- List every file with its change type and description

## Migration coverage
- Endpoints planned vs. migrated
- Files scanned vs. total in repo
- Test coverage before and after (if available)

## Confidence score (0-100)
- Start at 100
- -5 for each MINOR_ISSUE in code review
- -10 for each auto-fixed lint error
- -15 for each builder loop that was needed
- -20 for any safety warning
- Floor at 0

## Risk assessment
- **LOW**: All tests pass, no safety warnings, high confidence
- **MEDIUM**: Minor issues found and fixed, some safety recommendations
- **HIGH**: Builder loops needed, safety concerns, manual review recommended

## Recommendations for architect
- Feature flag implementation (if not present)
- Monitoring and alerting for GQL endpoint
- Gradual rollout strategy
- Performance testing needs
- Documentation updates needed

## Files requiring manual review
- Complex migrations with confidence < 80%
- Files with MINOR_ISSUES that couldn't be auto-fixed
- Security-sensitive files (auth, payments)

## Write output
Write the full report to `.agent-tracking/inspector-output.json` and print a human-readable summary.
