# Phase 2 E2 Repair Request Report

Version: 2026-04-25
Status: 8.5 lock candidate

## Scope

This report records the first E2 step from the DeepTutor-informed project plan:
turn a blocked review artifact with `unknown_node_reference` semantic failures
into a machine-readable repair request without writing back to `unit.yaml` and
without authorizing real provider execution.

## Outputs

- Added `apps/content-pipeline/src/repair-request.ts`.
- Exported the contract from `apps/content-pipeline/src/index.ts`.
- Added `apps/content-pipeline/tests/repair-request.spec.ts`.
- Added CLI export/validation commands:
  - `render-review-repair-request`
  - `validate-review-repair-request`
- Added CLI regression coverage in `apps/content-pipeline/tests/cli.spec.ts`.
- Integrated the repair request summary into review inbox handoff routing:
  - `metadata.repair_request` carries the no-spend repair action, strategy,
    source role, and execution boundary.
  - inbox labels now expose `repair_request:*` and `repair_action:*` for
    downstream routing without authorizing provider execution.
- Added a stable fixture for the current `lf_slope_meaning` dangling-reference
  artifact:
  - `apps/content-pipeline/tests/fixtures/unknown-node-review-artifact.json`
  - `apps/content-pipeline/tests/fixtures.ts`

## Contract

`content-pipeline-review-repair-request/v0.1` carries:

- Source artifact anchors: schema version, generated timestamp, blocked status,
  and `unit_id`.
- Role scope: `requested_start_role` and contiguous `requested_roles`.
- Repair strategy:
  - `preserve_core_node_id` when subject-expert knowledge node churn strands
    downstream references.
  - `fix_owned_section_reference` when the dangling reference is owned by a
    downstream section.
  - `manual_triage` only when the source plan is already manual.
- Target issues, including path, message, parsed missing node id when available,
  root owner, and impacted owner.
- Hard execution boundary:
  - `requires_provider_execution: false`
  - `requires_source_writeback: false`
  - `blocked_artifact_approval_allowed: false`
- Next execution hint as a review-only rerun candidate, not as provider
  authorization.

## Governance Check

- The contract does not permit source writeback.
- The contract does not approve blocked artifacts.
- The contract does not authorize provider calls or budget spend.
- The contract requires semantic validation evidence and only covers
  `unknown_node_reference` failures for this E2 slice.
- The source validator rejects artifacts where `repair_plan` recommendations
  and `retry_policy` rerun scope diverge.
- The source validator rejects unknown-node failures that do not have a matching
  repair recommendation.
- The source validator recomputes expected `repair_plan` from
  `semantic_validation + candidate_patches` and rejects forged/stale root-owner
  strategies.
- The source validator rejects mixed semantic failures instead of silently
  reducing a multi-error blocked artifact to unknown-node repair only.
- The request validator shape-guards untrusted JSON, rejects unknown fields, and
  returns structured validation issues for malformed nested fields.
- The contract preserves review artifact output semantics:
  `review_mode = llm_review_no_writeback` and
  `output_contract = review_artifact_only`.

## Verification

- `pnpm --filter @edu-ai/content-pipeline typecheck`: passed
- `pnpm --filter @edu-ai/content-pipeline exec vitest run tests/repair-request.spec.ts --reporter=dot`: passed
- `pnpm --filter @edu-ai/content-pipeline test`: passed
- `pnpm --filter @edu-ai/content-pipeline typecheck`: passed after cold-review fixes
- `pnpm --filter @edu-ai/content-pipeline exec vitest run tests/cli.spec.ts --reporter=dot`: passed after CLI integration
- `pnpm --filter @edu-ai/content-pipeline typecheck`: passed after CLI integration
- `pnpm --filter @edu-ai/content-pipeline test`: passed after CLI integration
- `pnpm --filter @edu-ai/content-pipeline exec vitest run tests/inbox-handoff.spec.ts tests/cli.spec.ts --reporter=dot`: passed after inbox handoff integration
- `pnpm --filter @edu-ai/content-pipeline typecheck`: passed after inbox handoff integration
- `pnpm --filter @edu-ai/content-pipeline test`: passed after inbox handoff integration
- `pnpm --filter @edu-ai/content-pipeline exec vitest run tests/repair-request.spec.ts tests/inbox-handoff.spec.ts tests/cli.spec.ts --reporter=dot`: passed after fixture integration
- `pnpm --filter @edu-ai/content-pipeline typecheck`: passed after fixture integration
- `pnpm --filter @edu-ai/content-pipeline test`: passed after fixture integration

## Cross Review

- Reviewer: Codex sub-agent `Turing`
- Result: 3 medium gaps found in first cold review:
  - Repair strategy trusted forgeable `repair_plan` fields.
  - Request validator did not strict-shape-guard untrusted JSON.
  - Mixed semantic failures could be reduced to unknown-node repair.
- Resolution: all 3 medium gaps fixed with regression tests.
- Reviewer: Codex sub-agent `Gibbs`
- Result: no blocking or medium findings after fixes; confirmed 8.5 lock
  candidate.
- Follow-up note: CLI and inbox handoff integrations were locally verified after
  the `Gibbs` cold review. Two later narrow sub-agent cold-review attempts timed
  out, so this follow-up slice is marked as locally verified and pending the
  next stable independent review window.

## Residual Backlog

- P3: `manual_triage` is currently effectively unreachable from this E2 source
  validator because the no-spend repair request contract only accepts concrete
  role-scoped unknown-node rerun candidates.
- P3: deep equality currently uses canonical generated object comparison; field
  order differences in hand-authored JSON may false-fail validation until CLI
  export fixes order deterministically.
- P3: inbox handoff integration has local verification but no successful fresh
  sub-agent cold-review because the last two narrow cold-review attempts timed
  out.

## Next Entry Condition

Run the full content-pipeline test suite and, if it stays green, proceed to the
next no-decision slice from the DeepTutor-informed plan: E1 runtime content
Page/Block schema tightening and semantic validation coverage.
