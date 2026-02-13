# Skill: safety-check

## Purpose
Check for migration safety issues that could cause production incidents.

## Trigger
Called after completeness-check.

## Procedure

1. **Feature flag check**:
   - Is there a way to toggle between REST and GQL at runtime?
   - Recommend adding one if not present (environment variable or config)
   - Example: `USE_GRAPHQL=true` environment variable

2. **Fallback logic check**:
   - If the GQL endpoint is down, does the code fail gracefully?
   - Is there circuit breaker logic?
   - Are timeouts configured?

3. **Response compatibility check**:
   - Compare REST response shape to GQL response shape
   - Ensure no fields are missing that downstream code depends on
   - Check for type changes (string dates vs Date objects, numbers vs strings)

4. **Auth forwarding check**:
   - Verify auth tokens/cookies are forwarded to GQL endpoint
   - Check that auth error handling is preserved
   - Verify no auth bypass is introduced

5. **Async behavior check**:
   - Verify no race conditions introduced
   - Check that concurrent requests are handled correctly
   - Verify loading/error states in UI components still work

6. **Rollback readiness**:
   - Can the changes be easily reverted? (git revert friendly)
   - Are there database migrations or schema changes that complicate rollback?
   - Is the GQL endpoint deployed and ready before this code ships?

## Output
```json
{
  "safetyPassed": true,
  "featureFlags": { "present": false, "recommended": true },
  "fallbackLogic": { "present": false, "recommended": true },
  "responseCompatible": true,
  "authHandled": true,
  "rollbackReady": true,
  "warnings": []
}
```
