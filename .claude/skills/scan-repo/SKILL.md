---
name: scan-repo
description: "Scan an entire repository for HTTP client calls across JavaScript, Java, and Python. Use when discovering REST/HTTP endpoint usage in a codebase."
user-invocable: false
allowed-tools: Read, Glob, Grep
---

# Scan Repo for HTTP Client Calls

Scan the entire target repository for HTTP client calls. Ensure 100% file coverage.

## Exclude directories
`node_modules`, `.git`, `build`, `dist`, `target`, `vendor`, `__pycache__`, `.agent-tracking`

## JavaScript/TypeScript patterns
Search for these patterns in `.js`, `.ts`, `.jsx`, `.tsx` files:
```
fetch(                     # native fetch
axios.get|post|put|patch|delete|request
http.request|http.get      # Node.js http module
got(|got.get|got.post      # got library
superagent                 # superagent
$.ajax|$.get|$.post        # jQuery
XMLHttpRequest             # browser XHR
ky(|ky.get                 # ky library
ofetch|$fetch              # nuxt/ofetch
```

## Java patterns
Search for these patterns in `.java` files:
```
HttpClient.newHttpClient|HttpClient.send
RestTemplate.getForObject|exchange|postForObject
WebClient.get|post|put|delete|retrieve
OkHttpClient|Request.Builder
HttpURLConnection|openConnection
@FeignClient|@GetMapping|@PostMapping
Retrofit|@GET|@POST|@PUT|@DELETE
```

## Python patterns
Search for these patterns in `.py` files:
```
requests.get|post|put|patch|delete
urllib.request
httpx.get|post|put|patch|delete
aiohttp.ClientSession
```

## For each match, capture:
- File path (relative to repo root)
- Line number
- The full line + 2 lines above and below for context
- The URL/path being called (if extractable from the code)
- The HTTP method (if extractable)

## Track coverage
Record every directory and file scanned, total count, and confirm completeness.
