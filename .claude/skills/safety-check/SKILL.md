---
name: safety-check
description: "Check for production safety issues in a migration — feature flags, fallbacks, auth forwarding, response compatibility, rollback readiness."
user-invocable: false
allowed-tools: Read, Grep
---

# Safety Check

Check for common migration safety issues that could cause production incidents.

## Feature flag check
- Is there a way to toggle between REST and GQL at runtime?
- Recommend adding one if not present (environment variable or config flag)
- Example: `USE_GRAPHQL=true` environment variable

## Fallback logic check
- If the GQL endpoint is down, does the code fail gracefully?
- Is there circuit breaker logic?
- Are timeouts configured?

## Response compatibility check
- Compare REST response shape to GQL response shape
- Ensure no fields are missing that downstream code depends on
- Check for type changes (string dates vs Date objects, numbers vs strings)

## Auth forwarding check
- Verify auth tokens/cookies are forwarded to GQL endpoint
- Check that auth error handling is preserved
- Verify no auth bypass is introduced

## Async behavior check
- Verify no race conditions introduced
- Check that concurrent requests are handled correctly
- Verify loading/error states in UI components still work

## Rollback readiness
- Can the changes be easily reverted? (git revert friendly)
- Are there database/schema changes that complicate rollback?

## Output shape
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
