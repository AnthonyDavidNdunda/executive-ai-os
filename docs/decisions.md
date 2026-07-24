## AI Assistance
This project was built with architectural guidance and code generation 
assistance from Claude (Anthropic). All code was reviewed, executed, 
and deployed by Anthony Ndunda.

#Voyage AI v0.5.0
Use module-level `voyageai.get_embedding()` not `voyageai.Client`.
The Client class raises "'TextDoc' object is not callable" in this version.
Deprecation warnign is expected and safe to ignore