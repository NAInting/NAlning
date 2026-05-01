# `@edu-ai/memory-store`

Vector memory storage contract for the AI-native education platform.

Status: phase 0.4 minimum implementation.

Current capabilities:

- pgvector DDL draft
- deterministic embedding for tests
- in-memory vector store
- cosine similarity search
- academic / emotional / personal bucket isolation
- campus-local hard constraint for emotional memory
- incremental summary versioning
- pgvector-compatible default embedding dimension (1536)
- student-bound memory query guard for non-privileged roles

Current non-goals:

- no real Postgres connection
- no real embedding model
- no backend API
- no persistence beyond process memory
