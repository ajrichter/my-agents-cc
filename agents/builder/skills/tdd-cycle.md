# Skill: tdd-cycle

## Purpose
Enforce strict Test-Driven Development for every code change. This is the core execution loop.

## Trigger
Called for each endpoint migration. Wraps generate-query-files and replace-rest-calls.

## Procedure

### For each endpoint migration:

#### Phase 1: RED (Write Failing Test)

**JavaScript (Jest)**:
```javascript
// __tests__/graphql/getUser.test.js
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
      expect.stringContaining('GetUser'),
      { id: '123' }
    );
    expect(result).toEqual({ id: '123', name: 'Alice', email: 'alice@test.com' });
  });
});
```

**Java (JUnit 5)**:
```java
@ExtendWith(MockitoExtension.class)
class UserGraphQLServiceTest {
    @Mock HttpGraphQlClient graphQlClient;
    @InjectMocks UserGraphQLService service;

    @Test
    void shouldFetchUserById() {
        // arrange mock, act, assert
    }
}
```

1. Write the test file
2. Run tests — verify this test FAILS (because implementation doesn't exist yet)
3. Record: `{ phase: "red", test: "getUser.test.js", result: "fail", expected: true }`

#### Phase 2: CODE (Write Implementation)

1. Generate the query file and wrapper function (via generate-query-files skill)
2. Do NOT run tests yet

#### Phase 3: GREEN (Verify Test Passes)

1. Run the specific test
2. If PASSES → record success, move to next endpoint
3. If FAILS:
   - Analyze error message
   - Fix implementation (NOT the test)
   - Re-run (max 3 attempts)
   - If still failing after 3 attempts → flag for Inspector with details
4. Record: `{ phase: "green", test: "getUser.test.js", result: "pass", attempts: 1 }`

#### Phase 4: REFACTOR (Optional Cleanup)

1. Check for duplication across generated code
2. Extract shared helpers if pattern repeats 3+ times
3. Re-run tests after any refactor
4. Record any refactoring done

### TDD Log Entry Format
```json
{
  "endpoint": "GET /api/users/:id",
  "testFile": "__tests__/graphql/getUser.test.js",
  "cycles": [
    { "phase": "red", "result": "fail", "expected": true },
    { "phase": "green", "result": "pass", "attempts": 1 },
    { "phase": "refactor", "result": "pass", "changes": "none" }
  ],
  "status": "complete"
}
```

## Rules
- NEVER modify the test to make it pass — fix the code
- NEVER skip the red phase — the test must fail first
- NEVER proceed to next endpoint if current tests are failing
- Max 3 retry attempts before escalating to Inspector
