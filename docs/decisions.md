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

## Planned: LLM output validation layer

Pre-calculating metrics eliminated arithmetic errors but not false claims. Observed failures on 60-month data;
    - "EBITDA crossed the million-dollar threshold" - (actual: $969,244)
    - "more than double the 16.78%" (actual: 1.94x)

Both quote correct figures while asserting incorrect relationships, so they are invisible to generation-time
constraints

Approach: post-generation validation pass that extracts numeric claims, classifies them (quoted/derived/threshold), 
verifies against source data, and annotates unverified claims in the UI rather than blocking. 

Scope narrowly at first - table figures only, where extraction is reliable. Prose extraction is the difficult part
and a validator with false negatives is worse than having no validator at all.