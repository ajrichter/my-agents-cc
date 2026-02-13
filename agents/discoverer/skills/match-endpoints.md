# Skill: match-endpoints

## Purpose
Match discovered HTTP calls against the provided endpoint list using fuzzy URL path matching.

## Trigger
Called after scan-repo has found all HTTP calls. Takes the raw scan results plus the endpoints input JSON.

## Procedure

1. **Normalize endpoint paths** from input:
   - `/api/users/:id` → regex: `/api/users/[^/]+`
   - `/api/users/{id}` → regex: `/api/users/[^/]+`
   - Handle query params: `/api/users?role=admin` → base path `/api/users`

2. **For each discovered HTTP call**:
   - Extract the URL string (may be template literal, concatenation, or constant)
   - Resolve variables if possible (follow const/variable references)
   - Normalize the path
   - Match against each endpoint regex
   - Score confidence: exact match (100%), path match (80%), partial match (60%)

3. **Group results** by endpoint:
   - Each endpoint gets a list of all matching locations
   - Include confidence score per match
   - Flag ambiguous matches (multiple endpoints could match)

4. **Report unmatched**:
   - HTTP calls that don't match any provided endpoint (informational)
   - Endpoints from input that have zero matches in the repo (warning)

## Output
Structured mapping of endpoints → locations with confidence scores.
