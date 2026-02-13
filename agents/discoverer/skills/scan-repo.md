# Skill: scan-repo

## Purpose
Scan the entire target repository for HTTP client calls across all supported languages.

## Trigger
Called when the Discoverer needs to find all HTTP/REST calls in a repo.

## Procedure

1. **Enumerate all source files** (exclude: node_modules, .git, build, dist, target, vendor, __pycache__)
2. **For each file**, search for HTTP client patterns:

### JavaScript/TypeScript patterns:
```
fetch(                    # native fetch
axios.get|post|put|patch|delete|request
http.request|http.get     # Node.js http module
got(|got.get|got.post     # got library
superagent                # superagent
$.ajax|$.get|$.post       # jQuery
XMLHttpRequest            # browser XHR
ky(|ky.get                # ky library
ofetch|$fetch             # nuxt/ofetch
```

### Java patterns:
```
HttpClient.newHttpClient|HttpClient.send
RestTemplate.getForObject|exchange|postForObject
WebClient.get|post|put|delete|retrieve
OkHttpClient|Request.Builder
HttpURLConnection|openConnection
@FeignClient|@GetMapping|@PostMapping
Retrofit|@GET|@POST|@PUT|@DELETE
```

3. **Extract context**: For each match, capture:
   - File path (relative to repo root)
   - Line number
   - The full line + 2 lines above and below
   - The URL/path being called (if extractable)
   - The HTTP method (if extractable)

4. **Track coverage**: Record every file scanned, total count, and confirm completeness.

## Output
Array of raw HTTP call locations with context, ready for endpoint matching.
