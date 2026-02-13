# Skill: generate-graphql

## Purpose
Generate GraphQL queries/mutations from REST endpoint definitions, optionally validated against a provided schema.

## Trigger
Called for each matched endpoint after match-endpoints completes.

## Procedure

1. **Determine operation type**:
   - GET → `query`
   - POST → `mutation` (create)
   - PUT/PATCH → `mutation` (update)
   - DELETE → `mutation` (delete)

2. **Map path params to variables**:
   - `/api/users/:id` → `$id: ID!`
   - `/api/orders/:orderId/items/:itemId` → `$orderId: ID!, $itemId: ID!`

3. **Map attributes to fields**:
   - Input attributes `["id", "name", "email"]` → selection set `{ id name email }`
   - Nested attributes `["user.name", "user.address.city"]` → nested selection

4. **If schema provided**:
   - Parse the .graphql schema file
   - Find the matching Query/Mutation type
   - Validate field names exist in schema types
   - Use schema types for variable definitions
   - Warn if attributes don't exist in schema

5. **Generate query string**:
```graphql
query GetUser($id: ID!) {
  user(id: $id) {
    id
    name
    email
  }
}
```

6. **Name the operation**:
   - GET /api/users → `GetUsers`
   - GET /api/users/:id → `GetUser`
   - POST /api/users → `CreateUser`
   - PUT /api/users/:id → `UpdateUser`
   - DELETE /api/users/:id → `DeleteUser`

## Output
Generated GraphQL operation string per endpoint, with variable definitions.
