# @edu-ai/agent-sdk

Shared Agent runtime utilities.

Status: Phase 1.2 memory runtime minimum contract implemented.

Current scope:

- Student Agent working memory window.
- Episodic memory write pipeline on top of `@edu-ai/memory-store`.
- Semantic memory snapshot builder with confidence gate.
- Student memory deletion from ordinary personalization recall.
- Student-facing transparency view model.
- Teacher evidence reference non-reversibility guard.

Non-goals:

- No real LLM summarizer yet.
- No production Postgres adapter yet.
- No Teacher Agent daily report generation yet.
