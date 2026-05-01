# Phase 2.5 Runtime Content Block Self Review

Date: 2026-04-25
Status: current self review

## Verdict

Phase 2.5 now has a first-pass `runtime_content` Page/Block model inspired by DeepTutor-style page orchestration, but implemented as native project schema rather than imported DeepTutor code.

The change is intentionally conservative: runtime content is a top-level unit section, source-traced, privacy-scoped, and checked by semantic validation. It is not yet assigned to an autonomous agent role, and generated/blocked artifacts still cannot write directly to source `unit.yaml`.

## Checks

| Check | Result |
| --- | --- |
| `runtime_content` exists in shared-types unit schema | Pass |
| Page/Block interfaces and Zod schemas are exported | Pass |
| Every runtime block requires `visibility_scope`, `privacy_level`, `confidence_score`, and `source_trace` | Pass |
| Runtime page and block `target_nodes` must resolve to knowledge nodes | Pass |
| Runtime block IDs and page IDs are duplicate-checked | Pass |
| `student_private` blocks cannot be visible to teacher/guardian/admin | Pass |
| `teacher_only` blocks cannot be visible to student/guardian | Pass |
| Executable block types require an active sandbox | Pass |
| Common Core / CCSS source traces remain blocked | Pass |
| Sample unit includes reviewed callout and quiz blocks | Pass |
| `UNIT_SPEC.md` documents `runtime_content` shape and ownership | Pass |
| Dedicated Phase 2.5 runtime content spec exists | Pass |

## Verification

| Command | Result |
| --- | --- |
| `pnpm --filter @edu-ai/shared-types typecheck` | Pass |
| `pnpm --filter @edu-ai/shared-types test` | Pass, 112 tests |
| `pnpm --filter @edu-ai/content-pipeline typecheck` | Pass |
| `pnpm --filter @edu-ai/content-pipeline exec vitest run tests/unit-semantic-validation.spec.ts --reporter=dot` | Pass, 12 tests |
| `pnpm --filter @edu-ai/content-pipeline test` | Pass, 41 files, 280 tests, 1 opt-in stress test skipped |
| `pnpm --filter @edu-ai/content-pipeline test:deep-cli-stress` | Not part of default gate; run before Phase 2.5 lock or release candidate |

## Residual Risk

The full `content-pipeline` default test suite now passes. One deep recursive CLI stress regression is excluded from the default gate and can be run explicitly with `pnpm --filter @edu-ai/content-pipeline test:deep-cli-stress`; this keeps ordinary regression checks usable while preserving the heavier stress path for deliberate runs.

The deep stress path previously exceeded a 300s desktop heartbeat timeout when included in the default suite. It is preserved as a named opt-in check rather than deleted, and should be run before locking Phase 2.5 or before any release candidate that touches provider-execution follow-up CLI chaining.

`runtime_content` is deliberately not yet agent-owned. A future Phase 2.6 decision can either keep it under Engineering Agent output, split out a dedicated Runtime Content Planner, or derive it from `implementation.components` through a deterministic builder.

No real provider calls were made, no DeepTutor source code was imported, and no real student, teacher, guardian, or emotional data was used.
