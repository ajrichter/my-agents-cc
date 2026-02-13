/**
 * JSON schemas and shape definitions for agent input/output contracts.
 * These define what each agent expects and produces.
 */

/**
 * Input to the pipeline: list of HTTP endpoints to migrate.
 * User provides this as a JSON file.
 *
 * Shape:
 * {
 *   "endpoints": [
 *     {
 *       "method": "GET",
 *       "path": "/api/users/:id",
 *       "attributes": ["id", "name", "email"],
 *       "description": "Fetch user by ID",
 *       "graphqlTarget": "query GetUser"   // optional hint
 *     }
 *   ],
 *   "graphqlSchema": "./schema.graphql",   // path to GQL schema file
 *   "languages": ["javascript", "java"]    // which languages to target
 * }
 */
export const ENDPOINTS_INPUT_SCHEMA = {
  type: "object",
  required: ["endpoints"],
  properties: {
    endpoints: {
      type: "array",
      items: {
        type: "object",
        required: ["method", "path", "attributes"],
        properties: {
          method: { type: "string", enum: ["GET", "POST", "PUT", "DELETE", "PATCH"] },
          path: { type: "string" },
          attributes: { type: "array", items: { type: "string" } },
          description: { type: "string" },
          graphqlTarget: { type: "string" },
        },
      },
    },
    graphqlSchema: { type: "string" },
    languages: { type: "array", items: { type: "string", enum: ["javascript", "java", "python"] } },
  },
};

/**
 * Agent 1 (Discoverer) output shape.
 *
 * {
 *   "repoPath": "/path/to/repo",
 *   "scannedFiles": 342,
 *   "language": "javascript",
 *   "occurrences": [
 *     {
 *       "endpoint": { "method": "GET", "path": "/api/users/:id" },
 *       "locations": [
 *         { "file": "src/api/users.js", "line": 45, "context": "axios.get('/api/users/' + id)" }
 *       ],
 *       "suggestedGraphQL": "query GetUser($id: ID!) { user(id: $id) { id name email } }",
 *       "migrationPlan": "Replace axios.get call with graphql query using Apollo client"
 *     }
 *   ],
 *   "migrationPlan": {
 *     "totalEndpoints": 5,
 *     "totalOccurrences": 12,
 *     "complexity": "medium",
 *     "suggestedOrder": ["GET /api/users/:id", "POST /api/users"]
 *   }
 * }
 */
export const DISCOVERER_OUTPUT_SCHEMA = {
  type: "object",
  required: ["repoPath", "scannedFiles", "language", "occurrences"],
  properties: {
    repoPath: { type: "string" },
    scannedFiles: { type: "number" },
    language: { type: "string" },
    occurrences: {
      type: "array",
      items: {
        type: "object",
        required: ["endpoint", "locations"],
        properties: {
          endpoint: { type: "object" },
          locations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                file: { type: "string" },
                line: { type: "number" },
                context: { type: "string" },
              },
            },
          },
          suggestedGraphQL: { type: "string" },
          migrationPlan: { type: "string" },
        },
      },
    },
    migrationPlan: { type: "object" },
  },
};

/**
 * Agent 2 (Builder) output shape.
 *
 * {
 *   "generatedFiles": [
 *     { "file": "src/graphql/queries/getUser.js", "type": "query", "status": "created" }
 *   ],
 *   "testResults": {
 *     "total": 5, "passed": 5, "failed": 0
 *   },
 *   "modifiedFiles": [
 *     { "file": "src/api/users.js", "changes": "Replaced REST call with GQL query" }
 *   ]
 * }
 */
export const BUILDER_OUTPUT_SCHEMA = {
  type: "object",
  required: ["generatedFiles", "testResults", "modifiedFiles"],
  properties: {
    generatedFiles: { type: "array" },
    testResults: {
      type: "object",
      properties: {
        total: { type: "number" },
        passed: { type: "number" },
        failed: { type: "number" },
      },
    },
    modifiedFiles: { type: "array" },
  },
};

/**
 * Agent 3 (Inspector) output shape.
 *
 * {
 *   "validationResults": {
 *     "passed": true,
 *     "checks": [
 *       { "name": "lint", "passed": true, "details": "" },
 *       { "name": "tests", "passed": true, "details": "" },
 *       { "name": "codeSmell", "passed": true, "details": "" }
 *     ]
 *   },
 *   "requiresBuilderLoop": false,
 *   "loopReason": null,
 *   "recommendations": [],
 *   "changedFileReview": []
 * }
 */
export const INSPECTOR_OUTPUT_SCHEMA = {
  type: "object",
  required: ["validationResults", "requiresBuilderLoop"],
  properties: {
    validationResults: { type: "object" },
    requiresBuilderLoop: { type: "boolean" },
    loopReason: { type: "string" },
    recommendations: { type: "array" },
    changedFileReview: { type: "array" },
  },
};

/**
 * Validate a basic shape (field existence check).
 */
export function validateShape(data, schema) {
  const errors = [];
  if (schema.required) {
    for (const field of schema.required) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }
  return { valid: errors.length === 0, errors };
}
