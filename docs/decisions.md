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

## LLM numerical reliability
Models are unreliable at arithmetic and will invent figures rather than
leave a sentence incomplete. Derived metrics (deltas, bps, ratios, H1/H2
splits) are computed in kpi_service.get_derived_metrics() and passed in
pre-calculated. The prompt prohibits arithmetic outright.

This reduces but does not eliminate errors — the model will still derive
from provided numbers when it wants a comparison that wasn't anticipated.
Generated reports require human review before circulation.