# `@edu-ai/llm-gateway`

Unified LLM gateway for the AI-native education platform.

Status: phase 0.3 minimum implementation.

Current capabilities:

- `createLlmGateway().complete()` unified entrypoint
- mock adapters for Claude, Qianfan, and campus-local models
- privacy-first routing
- retry and safe fallback
- in-memory cache
- in-memory cost ledger
- versioned prompt registry

Current non-goals:

- no real external model API calls
- no streaming
- no database persistence
- no raw conversation logging
