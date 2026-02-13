---
name: plan-migration
description: "Produce a prioritized migration plan from endpoint scan and match results. Rates complexity, identifies shared work, flags risks. Use after endpoints have been matched."
user-invocable: false
allowed-tools: Read
---

# Plan Migration

Produce a prioritized, ordered migration plan from the scan and match results.

## Assess complexity per endpoint
- **Low**: Simple GET, single resource, no auth, no side effects
- **Medium**: POST/PUT with request body, auth headers, error handling
- **High**: Chained calls, file uploads, websocket connections, complex auth

## Determine migration order
1. Start with simple GETs (lowest risk, fastest validation)
2. Group endpoints that share types/models
3. Dependencies: if endpoint B uses response from endpoint A, migrate A first
4. Leave high-complexity endpoints for last

## Identify shared work
- Common HTTP client wrapper → single refactor point
- Shared auth/header logic → extract once into GQL client config
- Common error handling → create shared GQL error handler
- Base URL configuration → single GQL endpoint config

## Flag risks
- Endpoints with side effects (payments, emails, notifications)
- Endpoints used in critical paths (auth, checkout, login)
- Endpoints with complex response transformations
- Endpoints called from multiple locations (higher blast radius)

## Estimate scope
- Total files to change
- Total new files to create
- Shared infrastructure needed (client setup, types, etc.)

## Output: ordered list with complexity ratings, risk flags, shared work items
