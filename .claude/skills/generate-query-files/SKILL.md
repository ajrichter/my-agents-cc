---
name: generate-query-files
description: "Generate individual GraphQL query/mutation files and typed wrapper functions for each endpoint. Use when creating GQL operations from a migration plan."
user-invocable: true
allowed-tools: Read, Write
argument-hint: "[endpoint-name]"
---

# Generate Query Files

For each endpoint, create a `.graphql` file and a typed wrapper function.

## Per endpoint, create:

### 1. The .graphql file
At `src/graphql/queries/<OperationName>.graphql` (or equivalent for Java):
```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}
```

### 2. The wrapper function

**JavaScript:**
```javascript
import { gql } from 'graphql-request';
import { graphqlClient } from '../client';

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) { id name email }
  }
`;

/**
 * Fetches a user by ID via GraphQL.
 * Replaces: GET /api/users/:id
 * @param {string} id - The user ID
 * @returns {Promise<{id: string, name: string, email: string}>}
 */
export async function getUser(id) {
  const data = await graphqlClient.request(GET_USER, { id });
  return data.user;
}
```

**Java:**
```java
@Service
public class UserGraphQLService {
    private final HttpGraphQlClient graphQlClient;

    /** Fetches a user by ID via GraphQL. Replaces: GET /api/users/{id} */
    public Mono<User> getUser(String id) {
        return graphQlClient.document(QUERY)
            .variable("id", id)
            .retrieve("user")
            .toEntity(User.class);
    }
}
```

### 3. Response shape mapping
Ensure the wrapper returns data in the same shape the REST call returned, to minimize downstream changes.

### 4. Error handling
Wrap GQL errors into the same error types the existing code expects.
