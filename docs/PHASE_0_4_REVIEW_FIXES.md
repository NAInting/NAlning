# Phase 0.4 Substitute Review Fixes

Date: 2026-04-22

## Review Result

The substitute independent review found 3 P1 issues in `@edu-ai/memory-store`.

All 3 P1 issues are fixed and covered by regression tests.

## Fixes

| Finding | Fix | Regression test |
|---|---|---|
| `source_id` upsert could overwrite records across tenant/student partitions | `findLatestBySource()` now matches `tenant_id`, `source_type`, `source_id`, `memory_bucket`, and `student_id` for student-bound records. Explicit `id` updates also reject partition mismatch. | `does not merge incremental summaries across tenant or student partitions` |
| `student_agent` could query student-bound memory without `student_id` | `assertSafeQuery()` rejects non-content queries without `student_id` for non-privileged roles, and `isRecordVisibleToQuery()` filters student-bound records when no `student_id` is supplied. | `requires student-bound memory queries to include student_id for non-privileged roles` |
| Default deterministic embedding dimension did not match `vector(1536)` DDL | `DeterministicEmbeddingProvider` now defaults to 1536 dimensions. | `uses the pgvector-compatible 1536 dimension by default` |

## Verification

```powershell
pnpm --filter @edu-ai/memory-store typecheck
pnpm --filter @edu-ai/memory-store test
pnpm --filter @edu-ai/memory-store build
pnpm typecheck
pnpm test
pnpm build
```

Package-level verification:

- `@edu-ai/memory-store` typecheck passed.
- `@edu-ai/memory-store` test passed, 9 tests passed.
- `@edu-ai/memory-store` build passed.

Root-level verification:

- `pnpm typecheck` passed.
- `pnpm test` passed.
- `pnpm build` passed.

## Current Gate

Phase 0.4 can be considered 8.5 after the root-level verification remains green.
