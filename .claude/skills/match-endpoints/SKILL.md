---
name: match-endpoints
description: "Match discovered HTTP calls against a provided endpoint list using fuzzy URL path matching. Use when mapping found REST calls to known endpoint definitions."
user-invocable: false
allowed-tools: Read, Grep
---

# Match Endpoints

Match discovered HTTP calls against the provided endpoint list using fuzzy URL path matching.

## Normalize endpoint paths from input
- `/api/users/:id` → regex pattern: `/api/users/[^/]+`
- `/api/users/{id}` → regex pattern: `/api/users/[^/]+`
- Handle query params: `/api/users?role=admin` → base path `/api/users`

## For each discovered HTTP call
1. Extract the URL string (may be template literal, concatenation, or constant reference)
2. Resolve variables if possible (follow const/variable references in nearby code)
3. Normalize the path
4. Match against each endpoint regex
5. Score confidence:
   - **100%**: Exact path + method match
   - **80%**: Path matches, method inferrable
   - **60%**: Partial path match or ambiguous
   - **40%**: Only base path matches

## Group results by endpoint
Each endpoint gets a list of all matching locations with confidence scores.

## Report unmatched items
- HTTP calls that don't match any provided endpoint (informational — may be internal or third-party)
- Endpoints from input that have zero matches in the repo (warning — may indicate dead code or different repo)
