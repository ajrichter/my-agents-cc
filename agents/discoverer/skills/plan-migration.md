# Skill: plan-migration

## Purpose
Produce a prioritized migration plan from the scan and match results.

## Trigger
Called after all endpoints have been matched and GQL queries generated.

## Procedure

1. **Assess complexity per endpoint**:
   - **Low**: Simple GET, single resource, no auth, no side effects
   - **Medium**: POST/PUT with request body, auth headers, error handling
   - **High**: Chained calls, file uploads, websocket connections, complex auth

2. **Determine order**:
   - Start with simple GETs (lowest risk)
   - Group endpoints that share types/models
   - Dependencies: if endpoint B uses response from endpoint A, migrate A first
   - Leave high-complexity endpoints for last

3. **Identify shared patterns**:
   - Common HTTP client wrapper → single refactor point
   - Shared auth/header logic → extract once
   - Common error handling → create shared GQL error handler
   - Base URL configuration → single GQL endpoint config

4. **Flag risks**:
   - Endpoints with side effects (payments, emails)
   - Endpoints used in critical paths (auth, checkout)
   - Endpoints with complex response transformations
   - Endpoints called from multiple locations

5. **Estimate scope**:
   - Total files to change
   - Total new files to create
   - Shared infrastructure needed (client setup, types, etc.)

## Output
Migration plan with ordered endpoint list, complexity ratings, risk flags, and shared work items.
