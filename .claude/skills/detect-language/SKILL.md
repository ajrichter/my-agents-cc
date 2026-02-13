---
name: detect-language
description: "Analyze a repository to detect its primary language, framework, HTTP client, test framework, and existing GraphQL setup. Use when starting work on an unfamiliar repo."
user-invocable: false
allowed-tools: Read, Glob, Grep
---

# Detect Language and Stack

Analyze the repo to determine primary language and tooling.

## Check for language markers (priority order)
1. `package.json` → JavaScript/TypeScript
2. `pom.xml` → Java (Maven)
3. `build.gradle` / `build.gradle.kts` → Java (Gradle)
4. `pyproject.toml` / `setup.py` / `requirements.txt` → Python

## Count file extensions to confirm
- `.js`, `.ts`, `.jsx`, `.tsx` → JavaScript
- `.java` → Java
- `.py` → Python

## Detect framework
- **JavaScript**: Check package.json deps for react, next, express, vue, angular, nest
- **Java**: Check pom.xml/build.gradle for spring-boot, quarkus, micronaut
- **Python**: Check for django, flask, fastapi

## Detect HTTP client in use
- **JavaScript**: axios, got, node-fetch, ky in package.json
- **Java**: spring-web (RestTemplate), okhttp, retrofit in pom.xml
- **Python**: requests, httpx, aiohttp in requirements

## Detect existing GraphQL setup
- **JavaScript**: @apollo/client, urql, graphql-request in package.json
- **Java**: spring-graphql, netflix-dgs in pom.xml
- **Python**: gql, sgqlc in requirements

## Detect test framework
- **JavaScript**: jest, mocha, vitest in package.json devDependencies
- **Java**: junit, testng in pom.xml test scope
- **Python**: pytest, unittest in requirements

## Output shape
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
