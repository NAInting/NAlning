# Phase 2.6 Agent Runtime Event Self Review

Date: 2026-04-25
Status: local verified, pending cold review

## Scope

This slice adds the first shared `AgentRuntimeEvent` contract inspired by
DeepTutor-style runtime event streams, but implemented natively in this project.
It also adds a minimal in-memory emitter in `@edu-ai/agent-sdk` so downstream
mock Agent runs can emit schema-validated events without introducing production
streaming, persistence, or real provider calls.

This follow-up slice wires that emitter into one mock Student Agent runtime run.
The mock run emits the E3 minimum sequence (`stage_start`, `progress`,
`source_anchor`, `result`, `done`) and returns all audience projections through
the shared projection helper.

This follow-up also wires the same emitter into the content-pipeline mock unit
workflow. The mock workflow can now emit admin-only `stage_start` and
`stage_end` events for each curriculum Agent role without calling a provider or
writing back to source `unit.yaml`.

This second follow-up factors the content-pipeline runtime event helpers into a
shared workflow module and wires the LLM mock workflow into the same event
contract. The LLM mock workflow now emits admin-only stage events on success and
a sanitized `error` event on provider/parser failure, without storing raw prompt,
raw provider output, or raw exception text in runtime event payloads.

This third follow-up exports the LLM review workflow runtime projections into
the review artifact and CLI JSON summary. The artifact records a compact
`runtime_projection_summary` plus the admin-only audit projection. It does not
write back to source `unit.yaml`, does not expose student/teacher/guardian
projections, and does not persist or stream runtime events.

This fourth follow-up adds a frontend-only projection rendering spike in
`frontend-user`. It renders a student-facing timeline from safe
`AgentRuntimeEventProjection` data, proves that admin-only `internal_metadata`
is ignored by the formatter, and avoids importing Node-only Agent SDK runtime
emitters into the browser bundle.

## Outputs

- `packages/shared-types/src/agent/agent-runtime-event.ts`
- `packages/shared-types/src/enums.ts`
- `packages/shared-types/src/index.ts`
- `packages/shared-types/tests/agent-runtime-event.spec.ts`
- `packages/agent-sdk/src/runtime-events/index.ts`
- `packages/agent-sdk/src/student-agent-runtime/index.ts`
- `packages/agent-sdk/src/index.ts`
- `packages/agent-sdk/tests/runtime-events.spec.ts`
- `packages/agent-sdk/tests/student-agent-runtime.spec.ts`
- `apps/frontend-user/src/App.vue`
- `apps/frontend-user/src/RuntimeEventTimeline.vue`
- `apps/frontend-user/src/student-agent-runtime.spec.ts`
- `apps/frontend-user/src/student-runtime-events.ts`
- `apps/frontend-user/src/styles.css`
- `apps/content-pipeline/package.json`
- `apps/content-pipeline/src/agent-runtime.ts`
- `apps/content-pipeline/src/cli.ts`
- `apps/content-pipeline/src/mock-runner.ts`
- `apps/content-pipeline/src/review-runner.ts`
- `apps/content-pipeline/src/workflow-runtime-events.ts`
- `apps/content-pipeline/tests/agent-runtime.spec.ts`
- `apps/content-pipeline/tests/cli.spec.ts`
- `apps/content-pipeline/tests/mock-runner.spec.ts`
- `apps/content-pipeline/tests/review-runner.spec.ts`
- `pnpm-lock.yaml`
- `docs/PHASE_2_6_AGENT_RUNTIME_EVENT_SPEC.md`
- `docs/PHASE_2_6_AGENT_RUNTIME_EVENT_SELF_REVIEW.md`

## Local Checks

| Check | Result |
| --- | --- |
| Runtime event type enum covers the E3 plan events | Pass |
| Event contract carries trace/run/sequence ordering | Pass |
| Event contract carries `privacy_level` and `visibility_scope` | Pass |
| Event payload is structured rather than unbounded free text | Pass |
| Obvious raw prompt/output/dialogue/emotion-detail keys are rejected | Pass |
| Emotion-domain events require `campus_local_only` | Pass |
| Student-private events cannot be visible to teacher/guardian/admin | Pass |
| Student/teacher/guardian projections omit `internal_metadata` | Pass |
| Admin audit projection may include safe internal metadata | Pass |
| Agent SDK emitter validates every emitted event through shared Zod schema | Pass |
| Agent SDK emitter preserves deterministic trace/run/sequence ordering | Pass |
| Agent SDK emitter projections reuse `projectAgentRuntimeEvent()` | Pass |
| Agent SDK emitter fails closed before appending invalid events | Pass |
| Mock Student Agent run emits the E3 minimum event sequence | Pass |
| Mock Student Agent run returns student/teacher/guardian/admin projections through the emitter | Pass |
| Mock Student Agent run uses structured source anchors without raw prompt/output/dialogue keys | Pass |
| `AgentType` includes `content_pipeline_agent` instead of mislabeling content workflow events as teacher/student/guardian events | Pass |
| Content-pipeline mock workflow can emit `stage_start` and `stage_end` events for six curriculum Agent stages | Pass |
| Content-pipeline workflow events are hidden from student/teacher/guardian projections and visible to admin audit projection | Pass |
| Content-pipeline workflow event payloads avoid raw provider output and raw dialogue-shaped keys | Pass |
| Content-pipeline LLM mock workflow reuses the same admin-only runtime event helper | Pass |
| Content-pipeline LLM mock workflow records prompt/provider/model/token summaries only in admin audit metadata | Pass |
| Content-pipeline LLM mock workflow emits sanitized retryable `error` events without raw provider exception text | Pass |
| Shared content-pipeline runtime helper preserves no-provider `local_mock` metadata and LLM `llm_gateway` metadata paths | Pass |
| LLM review artifacts expose runtime projection counts and admin-only audit projections | Pass |
| LLM review artifact runtime projections keep student/teacher/guardian counts at zero for content workflow events | Pass |
| CLI `run-llm-review` JSON summary exposes runtime projection counts for automation consumers | Pass |
| `frontend-user` renders student runtime projections without exposing admin-only `internal_metadata` | Pass |
| Frontend bundle consumes projection data only and avoids Node-only runtime emitter imports | Pass |

## Verification

| Command | Result |
| --- | --- |
| `pnpm --filter @edu-ai/shared-types test` | Passed, 119 tests |
| `pnpm --filter @edu-ai/shared-types typecheck` | Passed |
| `pnpm --filter @edu-ai/agent-sdk test` | Passed, 29 tests |
| `pnpm --filter @edu-ai/agent-sdk typecheck` | Passed |
| `pnpm --filter @edu-ai/frontend-user test` | Passed, 8 tests |
| `pnpm --filter @edu-ai/frontend-user typecheck` | Passed |
| `pnpm --filter @edu-ai/frontend-user build` | Passed |
| `pnpm --filter @edu-ai/content-pipeline test` | Passed, 299 tests, 1 skipped |
| `pnpm --filter @edu-ai/content-pipeline typecheck` | Passed |
| `pnpm run ci` | Passed |
| `pnpm scan:project-health` | Passed, 0 project-owned matches |

## Governance Check

- No real provider call was made.
- No DeepTutor source code was imported.
- No production `unit.yaml` was edited.
- No real student, teacher, guardian, or emotional data was used.
- The new projection helper narrows what non-admin views can see; it does not
  relax existing visibility boundaries.
- The Agent SDK emitter is in-memory only. It does not persist events, stream
  events to frontend clients, or bypass the shared projection helper.
- The mock Student Agent run is local-only and deterministic. It does not call a
  model provider and does not accept or emit raw student dialogue.
- The content-pipeline mock workflow event emission is opt-in through
  `emit_runtime_events`. It records stage boundaries only and does not include
  raw provider output, raw patches, or source `unit.yaml` writeback.
- The content-pipeline LLM mock workflow event emission is also opt-in through
  `emit_runtime_events`. It records stage lifecycle, safe prompt/provider/model
  references, and token summaries only in admin audit metadata.
- LLM review mode enables runtime events only for review artifact telemetry and
  stores the admin-audit projection plus counts. Student, teacher, and guardian
  projection counts remain zero for content workflow events.
- LLM mock workflow failure events classify the failure category and retryable
  state, but do not copy raw provider exception messages into event payloads.
- Content-pipeline workflow events use `content_pipeline_agent` as their source
  type and are restricted to system/admin visibility. Student, teacher, and
  guardian projections remain empty.
- Invalid payloads are rejected before being appended to the emitter history,
  so raw prompt/dialogue leakage tests fail closed.
- The frontend timeline is a projection consumer only. It does not run runtime
  emitters in-browser, does not call a provider, and does not receive raw
  prompts, raw output, raw student dialogue, or emotional details.

## Residual Backlog

- `P2`: Runtime events are not yet persisted or streamed; this is intentional
  until projection semantics remain stable.
- `P3`: Add cold-review once sub-agent stability is acceptable; previous narrow
  cold-review attempts around E2 timed out.

## Next Entry Condition

Proceed to one narrow downstream integration only after this contract and
emitter remain green under shared-types, agent-sdk, and content-pipeline checks.
The mock Student Agent runtime run, no-provider content workflow, LLM mock
workflow event paths, CLI review artifact export, and frontend projection
rendering spike are now complete. The recommended next step is to define a
transport/persistence spec only if live runtime streaming becomes necessary.
Downstream integrations must reuse `projectAgentRuntimeEvent()` rather than
hand-rolling audience filters.
