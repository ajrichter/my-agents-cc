---
name: setup-graphql-client
description: "Generate or configure GraphQL client infrastructure for a repo. Handles Apollo, urql, graphql-request (JS) and Spring GraphQL, plain HTTP (Java). Use when scaffolding a new GQL client."
user-invocable: true
allowed-tools: Read, Write, Edit
argument-hint: "[language]"
---

# Setup GraphQL Client

Generate or configure the GraphQL client infrastructure appropriate to the detected stack.

## JavaScript — No existing GQL client
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

## JavaScript — Apollo already present
1. Verify Apollo Client is configured
2. Create shared query execution helper if not present
3. Reuse existing provider/client setup

## Java — Spring Boot
1. Add spring-boot-starter-graphql dependency
2. Create `GraphQLClientConfig.java` with `@Bean HttpGraphQlClient`
3. Create service base class with error handling

## Java — No Spring
1. Create lightweight GraphQL HTTP client utility
2. Use existing HTTP client (OkHttp, HttpClient) as transport
3. Add JSON parsing for GraphQL responses

## For all languages
- Add environment variable for GQL endpoint URL
- Forward existing auth headers/tokens from the current HTTP client setup
- Add retry logic matching existing patterns
- Add request/response logging at debug level
