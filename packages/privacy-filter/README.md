# @edu-ai/privacy-filter

Runtime privacy and safety filtering for Student Agent MVP.

Current Phase 1.6 capabilities:

- Detects student emotional/safety keywords.
- Forces campus-local routing for local-only, yellow, and red signals.
- Builds abstract `InterAgentSignal` payloads without raw conversation content.
- Validates signal payloads against forbidden raw-content fields.

This package deliberately does not decide school-specific escalation recipients. It uses the generic `school_safety_protocol` placeholder until pilot school operations define the real path.
