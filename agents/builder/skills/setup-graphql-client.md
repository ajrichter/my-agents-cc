# Skill: setup-graphql-client

## Purpose
Generate or configure the GraphQL client infrastructure in the target repo.

## Trigger
Called after detect-stack, before generating individual queries.

## Procedure

### JavaScript — No existing GQL client
1. Add `graphql-request` to package.json (lightest option)
2. Create `src/graphql/client.js`:
   ```javascript
   import { GraphQLClient } from 'graphql-request';

   const endpoint = process.env.GRAPHQL_ENDPOINT || '/graphql';

   export const graphqlClient = new GraphQLClient(endpoint, {
     headers: () => ({
       authorization: `Bearer ${getAuthToken()}`,
     }),
   });
   ```
3. Create error handler wrapper

### JavaScript — Apollo already present
1. Verify Apollo Client is configured
2. Create shared query execution helper if not present
3. Reuse existing provider/client setup

### Java — Spring Boot
1. Add spring-boot-starter-graphql dependency
2. Create `GraphQLClientConfig.java`:
   ```java
   @Configuration
   public class GraphQLClientConfig {
       @Bean
       public HttpGraphQlClient graphQlClient(WebClient.Builder builder) {
           WebClient client = builder.baseUrl("${graphql.endpoint}").build();
           return HttpGraphQlClient.builder(client).build();
       }
   }
   ```
3. Create service base class with error handling

### Java — No Spring
1. Create lightweight GraphQL HTTP client utility
2. Use existing HTTP client (OkHttp, HttpClient) as transport
3. Add JSON parsing for GraphQL responses

### All languages
- Add environment variable for GQL endpoint URL
- Forward existing auth headers/tokens
- Add retry logic matching existing patterns
- Add request/response logging at debug level

## Output
List of created/modified files for client infrastructure.
