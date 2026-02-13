---
name: replace-rest-calls
description: "Replace existing REST/HTTP calls in code with new GraphQL wrapper functions. Preserves error handling and response shapes. Use when swapping a specific REST call."
user-invocable: true
allowed-tools: Read, Edit, Grep
argument-hint: "[file-path] [endpoint]"
---

# Replace REST Calls

For each occurrence found by Magellan, replace the REST call with the new GQL wrapper function.

## For each occurrence:

### 1. Read the file at the specified location

### 2. Identify the exact code block to replace
- Find the REST call (e.g., `axios.get('/api/users/' + id)`)
- Identify the full statement (may span multiple lines)
- Identify how the response is used (destructuring, `.then()`, `await`, etc.)

### 3. Add the import for the new GQL function
```javascript
import { getUser } from '../graphql/queries/getUser';
```

### 4. Replace the call
```javascript
// BEFORE:
const response = await axios.get(`/api/users/${id}`);
const user = response.data;

// AFTER:
const user = await getUser(id);
```

### 5. Preserve error handling
```javascript
// BEFORE:
try {
  const response = await axios.get(`/api/users/${id}`);
  return response.data;
} catch (err) {
  if (err.response?.status === 404) throw new UserNotFoundError();
  throw err;
}

// AFTER:
try {
  return await getUser(id);
} catch (err) {
  if (err.message?.includes('not found')) throw new UserNotFoundError();
  throw err;
}
```

### 6. Remove unused imports
If `axios` (or other HTTP client) is no longer used in this file, remove the import.

### 7. Run file-specific tests to ensure nothing breaks

## Rules
- Preserve all surrounding business logic untouched
- Keep error handling semantically equivalent
- Don't change function signatures of the containing method
- Record each replacement in the builder output
