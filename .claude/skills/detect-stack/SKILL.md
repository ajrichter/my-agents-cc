---
name: detect-stack
description: "Deep analysis of a repo's technology stack — framework, dependencies, patterns, test structure, async handling. Use before generating code to ensure correct patterns."
user-invocable: false
allowed-tools: Read, Glob, Grep
---

# Detect Stack (Deep Analysis)

Go beyond language detection — understand exactly how the codebase is structured so generated code fits in perfectly.

## Read discoverer output first
Check `.agent-tracking/discoverer-output.json` for initial language detection.

## Deep-scan package manifests
- **package.json**: Read ALL dependencies and devDependencies
- **pom.xml**: Read ALL dependency entries, check parent POM
- **build.gradle**: Read ALL implementation/compile/testImplementation dependencies

## Determine exact stack profile
```json
{
  "language": "javascript|java",
  "framework": "react|next|express|vue|angular|spring-boot|quarkus",
  "httpClient": "axios|fetch|got|RestTemplate|OkHttp",
  "graphqlClient": null | "apollo|urql|graphql-request|spring-graphql",
  "testFramework": "jest|mocha|vitest|junit5|testng",
  "buildTool": "npm|yarn|pnpm|maven|gradle",
  "typeSystem": "typescript|flow|java-generics|none",
  "moduleSystem": "esm|commonjs|java-modules"
}
```

## Detect existing code patterns
- How are imports done? (`import` vs `require`, star vs named)
- How are tests structured? (`describe/it`, `@Test`, file naming `*.test.js` vs `*.spec.js`)
- How is async code handled? (`async/await`, `.then()`, `CompletableFuture`)
- How are API clients instantiated? (singleton, factory, dependency injection)

## Select code generation strategy
- If existing GQL client found → use it, don't add a new one
- If TypeScript → generate types, use codegen if available
- If Spring → use Spring's GraphQL client beans with DI
- If plain Node.js → use graphql-request (lightest option)
