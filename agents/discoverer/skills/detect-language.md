# Skill: detect-language

## Purpose
Analyze the target repository to determine the primary programming language and framework.

## Trigger
Called at the start of the discovery phase.

## Procedure

1. **Check for language markers** (in priority order):
   - `package.json` → JavaScript/TypeScript
   - `pom.xml` → Java (Maven)
   - `build.gradle` / `build.gradle.kts` → Java (Gradle)
   - `pyproject.toml` / `setup.py` / `requirements.txt` → Python

2. **Count file extensions**:
   - `.js`, `.ts`, `.jsx`, `.tsx` → JavaScript
   - `.java` → Java
   - `.py` → Python
   - Use majority to confirm primary language

3. **Detect framework** (language-specific):
   - **JavaScript**: Check package.json dependencies for react, next, express, vue, angular, nest
   - **Java**: Check pom.xml/build.gradle for spring-boot, quarkus, micronaut
   - **Python**: Check for django, flask, fastapi

4. **Detect HTTP client** already in use:
   - **JavaScript**: axios, got, node-fetch, ky in package.json
   - **Java**: spring-web (RestTemplate), okhttp, retrofit in pom.xml
   - **Python**: requests, httpx, aiohttp in requirements

5. **Detect existing GraphQL** setup:
   - **JavaScript**: @apollo/client, urql, graphql-request in package.json
   - **Java**: spring-graphql, netflix-dgs in pom.xml

## Output
```json
{
  "language": "javascript",
  "framework": "react",
  "buildTool": "npm",
  "httpClient": "axios",
  "existingGraphQL": null,
  "testFramework": "jest"
}
```
