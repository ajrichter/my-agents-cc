---
name: tdd-cycle
description: "Enforce strict Test-Driven Development for every code change. Write failing test, write code, verify test passes. Core execution loop for the builder agent."
user-invocable: false
allowed-tools: Read, Write, Edit, Bash
---

# TDD Cycle (Red-Green-Refactor)

For EACH endpoint migration, follow this strict cycle.

## Phase 1: RED — Write Failing Test

**JavaScript (Jest):**
```javascript
import { getUser } from '../../src/graphql/queries/getUser';
import { graphqlClient } from '../../src/graphql/client';

jest.mock('../../src/graphql/client');

describe('getUser', () => {
  it('should fetch user by ID via GraphQL', async () => {
    graphqlClient.request.mockResolvedValue({
      user: { id: '123', name: 'Alice', email: 'alice@test.com' }
    });
    const result = await getUser('123');
    expect(graphqlClient.request).toHaveBeenCalledWith(
      expect.stringContaining('GetUser'), { id: '123' }
    );
    expect(result).toEqual({ id: '123', name: 'Alice', email: 'alice@test.com' });
  });
});
```

**Java (JUnit 5):**
```java
@ExtendWith(MockitoExtension.class)
class UserGraphQLServiceTest {
    @Mock HttpGraphQlClient graphQlClient;
    @InjectMocks UserGraphQLService service;

    @Test
    void shouldFetchUserById() { /* arrange, act, assert */ }
}
```

1. Write the test file
2. Run tests — verify this test FAILS (implementation doesn't exist yet)
3. Log: `{ phase: "red", result: "fail", expected: true }`

## Phase 2: CODE — Write Implementation

1. Generate the query file and wrapper function
2. Do NOT run tests yet

## Phase 3: GREEN — Verify Test Passes

1. Run the specific test
2. If PASSES → log success, move to next endpoint
3. If FAILS → analyze error, fix implementation (NOT the test), re-run (max 3 attempts)
4. If still failing after 3 attempts → flag for Inspector with error details

## Phase 4: REFACTOR (Optional)

1. Check for duplication across generated code
2. Extract shared helpers if a pattern repeats 3+ times
3. Re-run tests after any refactor

## Rules
- NEVER modify the test to make it pass — fix the code
- NEVER skip the red phase — test must fail first
- NEVER proceed to next endpoint if current tests are failing
- Max 3 retry attempts before escalating
