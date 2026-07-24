## AI Assistance
This project was built with architectural guidance and code generation 
assistance from Claude (Anthropic). All code was reviewed, executed, 
and deployed by Anthony Ndunda.

## Voyage AI v0.5.0
Use module-level `voyageai.get_embedding()` not `voyageai.Client`.
The Client class raises "'TextDoc' object is not callable" in this version.
Deprecation warnign is expected and safe to ignore

## Render free tier cold starts
Service spins down after ~ 15 minutes idle; the first request will take 30-60 seconds
Dashboard retries with backoff(3s, 4s, 5s) and surfaces a "spinning up" message rather than failing silently