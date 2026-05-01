# Phase 2.6 Agent Runtime Event Spec

Date: 2026-04-25
Status: first-pass implementation spec

## 1. Purpose

DeepTutor's runtime pattern reinforces one useful idea for this project:
Agent work should not be exposed as unstructured logs or scattered UI strings.
It should be represented as typed runtime events that can be projected safely
for different audiences.

This phase adds a project-native `AgentRuntimeEvent` contract. It does not
import DeepTutor code, does not call a real provider, and does not change the
main Vue / Node / Postgres stack.

## 2. Scope

In scope:

- Shared event type and Zod schema in `@edu-ai/shared-types`.
- A minimal in-memory event emitter in `@edu-ai/agent-sdk`.
- A local mock Student Agent runtime run that emits the minimum student-facing
  runtime sequence through the shared emitter.
- Local content-pipeline no-provider and LLM mock workflow event streams that
  emit admin-only workflow stage events through the same shared emitter.
- A frontend-only `frontend-user` projection rendering spike that consumes
  already-projected student runtime events and never imports Node-only runtime
  emitters into the browser bundle.
- Event types for stage progress, tool calls, source anchors, content deltas,
  result, blocked, error, and done states.
- A conservative projection helper for student, teacher, guardian, and
  admin/audit views.
- Privacy guardrails that reject obvious raw prompt, raw model output, raw
  student dialogue, and emotional detail keys.
- Campus-local hard requirement for `emotion` runtime events.

Out of scope:

- Production event streaming in Student Agent runtime.
- Real-provider content-pipeline event streaming.
- Persisting runtime events.
- Replacing existing audit logs.
- Production event streaming/rendering in frontend clients.
- Real model/provider calls.

## 3. Event Contract

`AgentRuntimeEvent` is an event-like shared type with:

- `trace_id`, `run_id`, and `sequence` for deterministic ordering.
- `event_type` for UI/runtime state.
- `domain` for academic/content/runtime/emotion/system grouping.
- `source_agent_id` and `source_agent_type`.
- Optional `session_id`, `student_id`, `unit_id`, and `stage_id`.
- `privacy_level` and `visibility_scope`.
- `payload` with structured, UI-safe fields.
- Optional `internal_metadata` with prompt asset id/version, provider/model id,
  latency, token, and cost summaries.

The event contract deliberately stores prompt references rather than raw prompt
or raw output text.

## 4. Supported Event Types

- `stage_start`
- `stage_end`
- `progress`
- `tool_call`
- `tool_result`
- `source_anchor`
- `content_delta`
- `result`
- `blocked`
- `error`
- `done`

## 5. Projection Rules

`projectAgentRuntimeEvent(event, view)` returns:

- `null` when the requested view role is outside `visibility_scope`.
- A public projection without `internal_metadata` for `student`, `teacher`,
  and `guardian`.
- An audit projection with safe `internal_metadata` for `admin_audit`.

This is intentionally conservative. It gives downstream UI and runtime code a
single safe helper instead of making every page reason about internal traces.

## 6. Privacy And Governance Rules

The schema rejects payload/internal metadata keys that would signal raw or
sensitive leakage, including:

- Raw prompts and raw provider output.
- Chain-of-thought / internal reasoning.
- Raw student messages, responses, transcript, or conversation excerpts.
- Raw emotional text/details.
- Guardian private notes or teacher private notes.

Emotion-domain runtime events must use `privacy_level =
campus_local_only`. Student-private runtime events may only be visible to
`student` or `system`.

## 7. Verification

Target checks:

```powershell
pnpm --filter @edu-ai/shared-types test
pnpm --filter @edu-ai/shared-types typecheck
```

Before promoting any downstream integration that consumes this event contract,
run:

```powershell
pnpm run ci
```

## 8. Current Downstream Integrations

- Mock Student Agent runtime emits the E3 minimum sequence:
  `stage_start -> progress -> source_anchor -> result -> done`.
- Content-pipeline no-provider mock workflow emits admin-only `stage_start` and
  `stage_end` events for all six curriculum roles.
- Content-pipeline LLM mock workflow emits admin-only `stage_start` and
  `stage_end` events on successful provider responses and a sanitized `error`
  event on provider/parser failures.
- Content-pipeline LLM review artifacts now expose `runtime_projection_summary`
  and `runtime_admin_audit_projection` so CLI consumers can inspect safe
  workflow-stage telemetry without writing anything back to source `unit.yaml`.
- `frontend-user` renders a local student-facing runtime timeline from safe
  `AgentRuntimeEventProjection` data. It intentionally consumes projections
  only; runtime emitters remain outside the browser bundle.

## 9. Next Steps

- Keep review artifact runtime projections admin-only until a user-facing
  runtime event view has a dedicated frontend rendering spec.
- If runtime events later become live-streamed, add a dedicated transport spec
  and keep projection filtering server/shared-contract driven.
- Keep provider raw prompt/output logging out of runtime event payloads; use
  prompt ids, versions, model/provider ids, token summaries, and source traces
  instead.
