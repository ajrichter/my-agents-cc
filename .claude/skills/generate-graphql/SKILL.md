---
name: generate-graphql
description: "Generate GraphQL queries or mutations from REST endpoint definitions. Use when you need to create GQL operations from HTTP endpoint specs."
user-invocable: true
allowed-tools: Read, Write
argument-hint: "[endpoint-method] [endpoint-path]"
---

# Generate GraphQL Query/Mutation

Generate a GraphQL query or mutation from a REST endpoint definition. Optionally validate against a provided schema.

## Determine operation type
- **GET** → `query`
- **POST** → `mutation` (create)
- **PUT/PATCH** → `mutation` (update)
- **DELETE** → `mutation` (delete)

## Map path params to variables
- `/api/users/:id` → `$id: ID!`
- `/api/orders/:orderId/items/:itemId` → `$orderId: ID!, $itemId: ID!`

## Map attributes to selection set fields
- `["id", "name", "email"]` → `{ id name email }`
- Nested: `["user.name", "user.address.city"]` → `{ user { name address { city } } }`

## If a GraphQL schema file is available
1. Parse the `.graphql` schema
2. Find the matching Query/Mutation type
3. Validate field names exist in schema types
4. Use schema types for variable definitions
5. Warn if requested attributes don't exist in schema

## Name the operation
- GET /api/users → `GetUsers`
- GET /api/users/:id → `GetUser`
- POST /api/users → `CreateUser`
- PUT /api/users/:id → `UpdateUser`
- DELETE /api/users/:id → `DeleteUser`

## Output format
```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}
```
