# Phase 2.4 Unit Semantic Validation Report

## 1. Why This Was Added

The Zod schema validates the shape of an AI-native unit, but it does not guarantee that cross-section references are coherent.

The first real Zhipu `glm-5.1` candidate proved this gap:

- The candidate YAML was schema-valid.
- The original `unit.yaml` was not overwritten.
- The candidate still contained dangling references to `lf_slope_meaning`, even though the candidate knowledge section had replaced that node with a broader linear-function concept graph.

This is an engineering-validity problem, not a subject-matter judgment. It should be caught automatically before any candidate YAML is produced or promoted for teacher review.

## 2. Implemented Guard

New file:

- `apps/content-pipeline/src/unit-semantic-validation.ts`

New exported API:

- `validateUnitSemanticIntegrity(unit)`
- `validateUnitSectionSemanticIntegrity(unit, section)`

The validator currently checks:

- Duplicate ids across knowledge nodes, activities, scenarios, characters, dialogue scripts, prompts, data hooks, assessment items, and quality issues.
- `knowledge.edges[].from_node_id` and `knowledge.edges[].to_node_id` must reference existing `knowledge.nodes[].node_id`.
- `pedagogy.learning_path[]` must reference existing knowledge nodes.
- All `target_nodes[]` in pedagogy, narrative, implementation, and assessment sections must reference existing knowledge nodes.
- `quality.checklist_pass` cannot be `true` while open high/blocking quality issues remain.
- Any open `high` or `blocking` quality issue blocks promotion even when `quality.checklist_pass = false`.
- Section `meta.source_trace[]` cannot reference CCSS, Common Core, or equivalent foreign-standard provenance. This deterministic check is limited to provenance fields so reviewer notes can still say things like "未引入 CCSS" without false positives.

Section-level validation is also available for workflow runtime use. It validates the section an Agent just patched. For `knowledge` patches, it also validates downstream node references because knowledge node ids are shared anchors for pedagogy, narrative, implementation, and assessment.

## 3. CLI Behavior Change

`validate-unit` now runs both schema validation and semantic validation.

If semantic validation fails:

- The command returns a non-zero exit code.
- The JSON output includes `semantic_validation.passed = false`.
- Errors include stable `code`, `path`, and `message` fields.

`apply-reviewed-patch` now validates the integrated candidate unit before writing `--out`.

If semantic validation fails:

- No candidate YAML is written.
- The command fails with a semantic validation error.
- Source `unit.yaml` remains untouched.

`run-llm-review` / `createUnitReviewArtifact` now also validates the fully integrated candidate before marking an artifact ready.

If all Agent invocations succeed but the merged candidate is semantically invalid:

- The artifact status is `blocked`.
- The artifact includes `semantic_validation`.
- The Markdown report renders a `Semantic Validation Issues` section.
- The artifact cannot be approved by `approve-review-artifact`, because blocked artifacts are rejected by the approval gate.

`mergeAgentPatchIntoUnit` now also validates the patched section immediately after ownership and schema validation.

If an Agent patch is semantically invalid:

- The workflow stops before invoking the next Agent.
- The failure is recorded as retryable.
- No candidate patch is emitted for the failed invocation.
- The source `unit.yaml` remains untouched.
- `apply-reviewed-patch` preserves its external error contract by wrapping early merge failures as `Candidate unit failed semantic validation`.

## 4. Real Candidate Validation Result

Command:

```powershell
pnpm --filter @edu-ai/content-pipeline exec tsx src/cli.ts validate-unit ../../content/units/math-g8-s1-linear-function-concept/unit.candidate.zhipu-glm-5.1.yaml
```

Result:

- `ok = false`
- `semantic_validation.error_count = 2`
- `quality_checklist_pass = false`

Errors:

| Code | Path | Meaning |
| --- | --- | --- |
| `unknown_node_reference` | `knowledge.edges[2].to_node_id` | Edge points to `lf_slope_meaning`, but that node no longer exists. |
| `unknown_node_reference` | `assessment.items[0].target_nodes[0]` | Assessment still targets `lf_slope_meaning`, but that node no longer exists. |

## 5. Source Unit Validation Result

Command:

```powershell
pnpm --filter @edu-ai/content-pipeline exec tsx src/cli.ts validate-unit ../../content/units/math-g8-s1-linear-function-concept/unit.yaml
```

Result:

- `ok = true`
- `semantic_validation.passed = true`
- `semantic_validation.error_count = 0`

The source unit remains the stable baseline.

## 6. Apply Gate Verification

Command:

```powershell
pnpm --filter @edu-ai/content-pipeline exec tsx src/cli.ts apply-reviewed-patch ../../content/units/math-g8-s1-linear-function-concept/unit.yaml ../../content/units/math-g8-s1-linear-function-concept/review-artifact.zhipu-glm-5.1.approved.json --confirm-reviewed --out ../../content/units/math-g8-s1-linear-function-concept/unit.candidate.zhipu-glm-5.1.semantic-gated.yaml
```

Result:

- Command failed before write.
- `unit.candidate.zhipu-glm-5.1.semantic-gated.yaml` was not created.
- Error output identified the two dangling references.

This confirms the apply gate now fails closed.

## 7. Tests Added

New test file:

- `apps/content-pipeline/tests/unit-semantic-validation.spec.ts`

Updated:

- `apps/content-pipeline/tests/cli.spec.ts`
- `apps/content-pipeline/tests/review-runner.spec.ts`
- `apps/content-pipeline/tests/review-report.spec.ts`

Coverage added:

- Valid sample unit passes semantic validation.
- Dangling `target_nodes[]` reference is rejected.
- Duplicate ids are rejected.
- `quality.checklist_pass = true` with open high/blocking issues is rejected.
- Open high/blocking quality issues are rejected even when `quality.checklist_pass = false`.
- CCSS/Common Core references in section `meta.source_trace[]` are rejected.
- `validate-unit` returns non-zero on semantic failure.
- `apply-reviewed-patch` rejects approved artifacts that would produce semantically invalid candidate units.
- `run-llm-review` blocks artifacts when integrated candidate patches create dangling node references.
- `run-llm-review` blocks artifacts when the QA Agent leaves an open blocking issue.
- `mergeAgentPatchIntoUnit` rejects semantically invalid owned sections before later Agents run.
- `run-llm-review` stops early when a candidate patch has dangling node references.
- `validateUnitSectionSemanticIntegrity` rejects knowledge patches that strand existing downstream node references.
- Markdown reports display semantic validation status and issue details.

## 8. Verification

Executed:

```powershell
pnpm --filter @edu-ai/content-pipeline typecheck
pnpm --filter @edu-ai/content-pipeline test
pnpm run ci
```

Results:

- content-pipeline typecheck passed.
- content-pipeline tests passed: 12 files, 66 tests.
- root CI passed: lint, typecheck, test, e2e, build.

Regression check:

- Recomputed `review-artifact.zhipu-option-a-localized-2026-04-23.json` under the new gate.
- Result: blocked during QA merge with `open_quality_blocker` at `quality.issues[0]`.
- This closes the prior case where a QA patch could set `quality.checklist_pass = false` but the artifact still appeared ready for human review.

Cold review:

- Codex sub-agent `Galileo` reviewed the gate, tests, and docs.
- Finding: no P0/P1/P2 issues.
- The residual P3 suggestions were closed by adding a negative test proving QA notes containing "CCSS" are allowed and a positive test for Chinese forbidden source-trace phrases.

## 9. Current Status

The Zhipu candidate remains useful as a review artifact, but it is not structurally ready for promotion.

Current safe status:

- `unit.yaml`: stable source, schema-valid and semantic-valid.
- `review-artifact.zhipu-glm-5.1.approved.json`: engineering-approved artifact for candidate generation only.
- `unit.candidate.zhipu-glm-5.1.yaml`: legacy candidate generated before semantic gate; now known semantic-invalid.
- No source writeback has occurred.

## 10. Next Engineering Step

The next safe step was to make `assessment` a first-class generated section rather than a stale carry-over from the source unit.

Decision implemented on 2026-04-23:

- Added `assessment_designer` as the owner of `assessment`.
- Updated the workflow order to run `assessment_designer` after `engineering_agent` and before `qa_agent`.
- Updated invocation contracts, schema hints, ownership tests, CLI expectations, mock workflow expectations, and shared type enums.
- Full workflows now produce six candidate patches/invocations in the normal path.
- Keep source writeback disabled until a subject-matter reviewer approves the final candidate.

Semantic validation remains the final fail-closed guard even after `assessment_designer` is present.
