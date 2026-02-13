# Skill: replace-rest-calls

## Purpose
Replace existing REST/HTTP calls in the codebase with the new GraphQL wrapper functions.

## Trigger
Called after the GQL wrapper function passes its tests, for each occurrence found by the Discoverer.

## Procedure

### For each occurrence:

1. **Read the file** at the location specified in discoverer output
2. **Identify the exact code block** to replace:
   - Find the REST call (e.g., `axios.get('/api/users/' + id)`)
   - Identify the full statement (may span multiple lines)
   - Identify how the response is used (destructuring, .then(), await, etc.)

3. **Add the import** for the new GQL function:
   ```javascript
   // Add at top of file with other imports
   import { getUser } from '../graphql/queries/getUser';
   ```

4. **Replace the call**:
   ```javascript
   // BEFORE:
   const response = await axios.get(`/api/users/${id}`);
   const user = response.data;

   // AFTER:
   const user = await getUser(id);
   ```

5. **Preserve error handling**:
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

6. **Remove unused imports**: If `axios` is no longer used in this file, remove the import.

7. **Run existing tests** for this file to ensure nothing breaks.

### Java equivalent:
```java
// BEFORE:
ResponseEntity<User> response = restTemplate.getForEntity("/api/users/" + id, User.class);
User user = response.getBody();

// AFTER:
User user = userGraphQLService.getUser(id).block();
```

## Rules
- Preserve all surrounding business logic untouched
- Keep error handling semantically equivalent
- Don't change function signatures of the containing method
- Run file-specific tests after each replacement
- Record each replacement in the change manifest
