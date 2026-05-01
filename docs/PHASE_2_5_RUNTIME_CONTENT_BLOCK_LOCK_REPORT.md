# Phase 2.5 Runtime Content Block Lock Report

Date: 2026-04-25
Status: lock candidate

## Scope

Phase 2.5 adds a DeepTutor-informed but project-native `runtime_content` Page/Block layer to AI native unit specs.

This lock covers:

- Shared TypeScript interfaces and Zod schemas for `RuntimeContentSection`, `UnitPage`, `UnitBlock`, `UnitBlockType`, `UnitBlockStatus`, and `UnitSourceAnchor`.
- Semantic validation for runtime page/block target references, duplicate IDs, visibility/privacy mismatch, forbidden foreign-standard source traces, and executable-block sandbox requirements.
- A minimal non-sensitive sample in `content/units/math-g8-s1-linear-function-concept/unit.yaml`.
- Documentation in `docs/PHASE_2_5_RUNTIME_CONTENT_BLOCK_SPEC.md`, `docs/UNIT_SPEC.md`, and the self-review report.
- A default `content-pipeline` test gate that remains fast, plus an opt-in deep CLI stress script.

This lock does not cover:

- Direct DeepTutor code reuse.
- Student-facing runtime rendering UI.
- New real-provider calls.
- Assigning `runtime_content` to a new autonomous `block_planner` role.
- Writing blocked review artifacts back into source `unit.yaml`.

## Outputs

- `packages/shared-types/src/content/ai-native-unit.ts`
- `packages/shared-types/tests/ai-native-unit.spec.ts`
- `apps/content-pipeline/src/unit-semantic-validation.ts`
- `apps/content-pipeline/tests/unit-semantic-validation.spec.ts`
- `apps/content-pipeline/package.json`
- `content/units/math-g8-s1-linear-function-concept/unit.yaml`
- `docs/PHASE_2_5_RUNTIME_CONTENT_BLOCK_SPEC.md`
- `docs/PHASE_2_5_RUNTIME_CONTENT_BLOCK_SELF_REVIEW.md`
- `docs/UNIT_SPEC.md`

## Verification

| Command | Result |
| --- | --- |
| `pnpm --filter @edu-ai/shared-types typecheck` | Passed during Phase 2.5 self-check |
| `pnpm --filter @edu-ai/shared-types test` | Passed, 112 tests |
| `pnpm --filter @edu-ai/content-pipeline typecheck` | Passed |
| `pnpm --filter @edu-ai/content-pipeline test` | Passed, 41 files, 280 tests, 1 opt-in stress test skipped |
| `pnpm scan:project-health` | Passed, 0 matches |
| `pnpm run ci` | Passed: lint, typecheck, test, e2e, build |

## Governance Check

| Check | Result |
| --- | --- |
| Runtime blocks require `visibility_scope` | Pass |
| Runtime blocks require `privacy_level` | Pass |
| Runtime blocks require `confidence_score` | Pass |
| Runtime blocks require `source_trace` | Pass |
| Student-private blocks fail if visible beyond student/system | Pass |
| Teacher-only blocks fail if visible to student/guardian | Pass |
| Executable blocks require an active sandbox | Pass |
| CCSS/Common Core source substitution remains blocked | Pass |
| No real student, teacher, guardian, or emotional data used | Pass |
| No DeepTutor source code imported | Pass |
| No real provider call made | Pass |

## Cross Review

Reviewer: Codex sub-agent cold review, Gauss.

Result: no blocking findings and no medium-risk findings.

Score: 8.5 lock candidate.

## Residual Backlog

- `P3`: Run `pnpm --filter @edu-ai/content-pipeline test:deep-cli-stress` before Phase 2.5 final lock or any release candidate touching provider-execution follow-up CLI chaining.
- `P3`: Decide in Phase 2.6 whether `runtime_content` stays under `engineering_agent`, gets a deterministic builder, or becomes a dedicated `block_planner` role.
- `P3`: Add frontend runtime rendering only after the content schema remains stable across more than one unit.

## Next Entry Condition

The next engineering stage can begin once the pending cold review has no blocking or medium findings.

Default next stage: E2, role-scoped repair request generation for `unknown_node_reference`, without real provider spend and without writing blocked artifacts back into source units.
