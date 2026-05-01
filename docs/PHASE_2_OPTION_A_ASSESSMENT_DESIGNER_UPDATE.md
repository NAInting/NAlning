# Phase 2 Option A Update: Assessment Designer

Date: 2026-04-23

## Decision

Option A is implemented: `assessment_designer` is now a first-class content-pipeline workflow role.

Current workflow:

```text
subject_expert -> pedagogy_designer -> narrative_designer -> engineering_agent -> assessment_designer -> qa_agent
```

## Why This Matters

The real Zhipu `glm-5.1` review candidate showed that assessment cannot remain a passive carry-over section. If the knowledge graph changes and assessment items are not regenerated, target node references can become stale.

Assessment drives:

- Mastery scoring.
- Confidence thresholds.
- Teacher reports.
- Intervention triggers.
- Student memory snapshots.

For that reason, `assessment` now has explicit ownership.

## Engineering Contract

- `assessment_designer` owns only `assessment`.
- `assessment_designer` reads `metadata`, `knowledge`, `pedagogy`, `narrative`, and `implementation`.
- `qa_agent` remains the final gate.
- Semantic validation remains mandatory and fail-closed.
- Source `unit.yaml` writeback remains disabled.

## Expected Counts

Normal full content-pipeline runs now produce:

- 6 completed workflow roles.
- 6 mock LLM invocations.
- 6 candidate patches in review artifacts when all roles succeed.

Earlier references to a five-agent workflow are historical unless explicitly labeled as external narrative shorthand.

## Local Verification

Verified after implementation:

- `pnpm --filter @edu-ai/content-pipeline typecheck`
- `pnpm --filter @edu-ai/content-pipeline test`
- `pnpm --filter @edu-ai/shared-types typecheck`
- `pnpm --filter @edu-ai/shared-types test`
- `run-workflow-smoke` completed six roles.
- `run-llm-mock` completed six invocations.

Root CI passed after the implementation and documentation update.

## Real Provider Verification

Executed with Zhipu `glm-5.1` in review-only mode after adding `assessment_designer`.

Result:

- Artifact: `content/units/math-g8-s1-linear-function-concept/review-artifact.zhipu-option-a-2026-04-23.json`
- Report: `content/units/math-g8-s1-linear-function-concept/review-report.zhipu-option-a-2026-04-23.md`
- Status: `blocked`
- Candidate patches: 6
- Completed roles: 6
- Writeback performed: false
- Semantic validation: failed closed
- Blocking semantic issue: `knowledge.edges[3].from_node_id` references missing node `lf_slope_meaning`
- Token summary: input 2686, output 15705

This confirms the six-role real provider path works, while the semantic gate still prevents promotion of invalid candidates.

## Follow-up Prompt Tightening

After the Zhipu run exposed a dangling `knowledge.edges[]` endpoint, the `subject_expert` contract and request schema hint were tightened:

- Hard rule: every knowledge edge endpoint must reference a node id present in the same `knowledge.nodes` output.
- Request hint: every `from_node_id` and `to_node_id` must reference a node in the same `nodes` array.
- Tests added at that point: content-pipeline had 55 tests after prompt tightening.

## Follow-up Early Semantic Gate

Prompt tightening is not enough by itself, because real model output can still be schema-valid but semantically impossible to integrate.

Implemented after prompt tightening:

- `validateUnitSectionSemanticIntegrity(unit, section)` validates the section an Agent just patched.
- `mergeAgentPatchIntoUnit` runs this section gate after ownership and schema validation.
- Review workflows now stop on a semantically invalid patch before invoking later roles.
- This would block a dangling `knowledge.edges[]` endpoint at `subject_expert` time instead of after all six provider calls.
- For `knowledge` patches, the gate also rejects node-id changes that strand existing downstream references.

Updated verification:

- content-pipeline typecheck passed.
- content-pipeline tests passed: 12 files, 61 tests.

## Follow-up Provider Timeout Control

The first semantic-gated Zhipu rerun showed the need for bounded provider waits. The OpenAI-compatible adapter now supports `timeout_ms`, and review mode can set it through `CONTENT_PIPELINE_REVIEW_TIMEOUT_MS`.

Control run:

- Provider: Zhipu official OpenAI-compatible endpoint.
- Model: `glm-5.1`.
- Timeout: 15000 ms.
- Artifact: `content/units/math-g8-s1-linear-function-concept/review-artifact.zhipu-option-a-timeout-control-2026-04-23.json`
- Report: `content/units/math-g8-s1-linear-function-concept/review-report.zhipu-option-a-timeout-control-2026-04-23.md`
- Status: `blocked`
- Candidate patches: 0
- First failure category: `model_unavailable`
- Writeback performed: false

This confirms external provider slowness now fails closed instead of hanging the workflow.

Longer semantic-gated run:

- Artifact: `content/units/math-g8-s1-linear-function-concept/review-artifact.zhipu-option-a-semantic-gated-2026-04-23.json`
- Report: `content/units/math-g8-s1-linear-function-concept/review-report.zhipu-option-a-semantic-gated-2026-04-23.md`
- Status: `blocked`
- Candidate patches: 2
- Passed roles: `subject_expert`, `pedagogy_designer`
- First failed role: `narrative_designer`
- Failure category: `model_unavailable`
- Writeback performed: false

The partial candidate is useful for prompt diagnostics, but not for approval. It shows curriculum-localization drift toward US CCSS-style references and English content, so the next real-provider iteration must tighten Chinese curriculum RAG/source constraints before attempting promotion.

## Follow-up Curriculum Localization Contract

The real Zhipu partial run also exposed that local `hard_rules` were not being sent into the actual model request. That gap is now closed:

- `buildAgentGatewayRequest` injects each role's `hard_rules` into the prompt body.
- Requests include unit subject, grade, and provided `standard_alignment`.
- Requests include the existing owned-section `source_trace` so Agents can preserve/refine concrete provenance instead of inventing replacements.
- All roles now carry China K-12 private-school pilot constraints.
- Learner-facing and teacher-facing prose must be Simplified Chinese.
- Stable ids remain lowercase ASCII.
- Agents must not invent or substitute US Common Core, CCSS, or other foreign standard codes when the provided metadata/source traces are Chinese curriculum context.
- `subject_expert` must preserve Chinese curriculum/textbook/teacher-note provenance in `source_trace`.

This does not make real provider output auto-approvable. It only closes the deterministic prompt-contract gap before the next paid/provider run.
