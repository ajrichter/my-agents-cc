# Skill: generate-query-files

## Purpose
Generate individual GraphQL query/mutation files and their typed wrapper functions.

## Trigger
Called for each endpoint in the migration plan, after client setup is complete.

## Procedure

### Per endpoint:

1. **Create .graphql file** at `src/graphql/queries/<OperationName>.graphql`:
   ```graphql
   query GetUser($id: ID!) {
     user(id: $id) {
       id
       name
       email
     }
   }
   ```

2. **Create wrapper function**:

   **JavaScript**:
   ```javascript
   // src/graphql/queries/getUser.js
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

   **Java**:
   ```java
   @Service
   public class UserGraphQLService {
       private final HttpGraphQlClient graphQlClient;

       /**
        * Fetches a user by ID via GraphQL.
        * Replaces: GET /api/users/{id}
        */
       public Mono<User> getUser(String id) {
           return graphQlClient.document(QUERY)
               .variable("id", id)
               .retrieve("user")
               .toEntity(User.class);
       }
   }
   ```

3. **Map response shape**: Ensure the wrapper returns data in the same shape the REST call returned, to minimize downstream changes.

4. **Handle errors**: Wrap GQL errors into the same error types the existing code expects.

## Output
List of generated query files and wrapper functions per endpoint.
