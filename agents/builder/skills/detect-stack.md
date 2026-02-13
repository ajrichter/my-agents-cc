# Skill: detect-stack

## Purpose
Deep analysis of the target repo's technology stack to determine exactly how to generate code.

## Trigger
Called at the start of the build phase, before any code generation.

## Procedure

1. **Read discoverer output** for initial language detection
2. **Deep-scan package manifests**:
   - **package.json**: Read all dependencies and devDependencies
   - **pom.xml**: Read all <dependency> entries
   - **build.gradle**: Read all implementation/compile dependencies

3. **Determine exact stack profile**:
   ```
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

4. **Detect existing patterns**:
   - How are imports done? (import vs require, star imports vs named)
   - How are tests structured? (describe/it, @Test, file naming)
   - How is async code handled? (async/await, promises, CompletableFuture)
   - How are API clients instantiated? (singleton, factory, DI)

5. **Select code generation strategy**:
   - If existing GQL client → use it, don't add a new one
   - If TypeScript → generate types, use codegen if available
   - If Spring → use Spring's GraphQL client beans with DI

## Output
Complete stack profile JSON that drives all subsequent code generation skills.
