# ADR: Phase 2 Assessment Section Ownership

Status: accepted and implemented

Date: 2026-04-23

## Context

The AI-native unit schema contains seven top-level sections:

- `metadata`
- `knowledge`
- `pedagogy`
- `narrative`
- `implementation`
- `assessment`
- `quality`

The original Phase 2 workflow had five curriculum agents:

- `subject_expert` owns `knowledge`
- `pedagogy_designer` owns `pedagogy`
- `narrative_designer` owns `narrative`
- `engineering_agent` owns `implementation`
- `qa_agent` owns `quality`

No agent owned `assessment`.

The first real Zhipu `glm-5.1` review candidate exposed the issue:

- `subject_expert` replaced the knowledge graph.
- `assessment` remained from the original source unit.
- The resulting candidate contained dangling references to the old `lf_slope_meaning` node.
- Semantic validation now blocks this, but the pipeline still needs a design decision for who is allowed to update `assessment`.

## Decision

Option A is accepted: add `assessment_designer` as the owner of the `assessment` section.

The implemented workflow is:

```text
subject_expert -> pedagogy_designer -> narrative_designer -> engineering_agent -> assessment_designer -> qa_agent
```

This is the authoritative Phase 2 content-pipeline order as of 2026-04-23.

## Option A: Add A Sixth Agent, `assessment_designer`

`assessment_designer` owns `assessment`.

Recommended workflow:

```text
subject_expert -> pedagogy_designer -> narrative_designer -> engineering_agent -> assessment_designer -> qa_agent
```

Pros:

- Clean one-agent-one-section ownership.
- Assessment is generated after knowledge, pedagogy, narrative, and implementation are known.
- QA can review a complete unit including assessment.
- Easier to test and reason about.

Cons:

- Changes the current "five-agent" implementation to six agents.
- Requires updating docs, tests, prompt assets, and workflow expectations.
- Slightly weakens the external narrative of "4-Agent/5-Agent pipeline" unless we present assessment as a specialist sub-agent.

## Option B: Let `subject_expert` Own Both `knowledge` And `assessment`

`subject_expert` writes both subject structure and assessment items.

Pros:

- Keeps the named five-agent pipeline.
- Assessment is tightly aligned with curriculum standards and mastery criteria.
- Minimal conceptual expansion for stakeholders.

Cons:

- Breaks current one-agent-one-section ownership.
- Subject expert would need to write assessment before pedagogy and narrative are finalized, unless it runs again later.
- More complex ownership guard: one role would own multiple sections.
- QA would still catch issues, but the generation order is less natural.

## Option C: Keep Five Agents And Add Deterministic Assessment Repair

No agent owns assessment. The pipeline only rewrites stale `target_nodes` when node mapping is unambiguous.

Pros:

- Smallest engineering change.
- Keeps current agent list unchanged.
- Useful as a safety helper even if another option is chosen.

Cons:

- Does not create new assessment items for newly added concepts.
- Unsafe when the mapping is ambiguous.
- Treats assessment as an afterthought, which conflicts with the project goal of AI-native教材.

## Codex Recommendation

Choose Option A.

Reason:

Assessment is not merely a byproduct of subject knowledge. For this product, assessment drives mastery, confidence, intervention, student memory, and teacher reports. It deserves explicit ownership.

The cleanest production chain is:

```text
Knowledge -> Pedagogy -> Narrative -> Implementation -> Assessment -> QA
```

This keeps QA as the final gate and lets assessment items align with:

- knowledge nodes
- learning path
- dialogue modes
- implementation hooks
- mastery criteria

To preserve the public narrative, we can describe this as:

```text
4 production agents + 1 assessment specialist + 1 QA gate
```

or:

```text
5 production specialists + QA
```

## Implemented Changes

1. Extend `CurriculumAgentRole` with `assessment_designer`.
2. Add an agent spec:
   - owns `assessment`
   - reads `metadata`, `knowledge`, `pedagogy`, `narrative`, `implementation`
   - prompt asset id `prompt_assessment_designer_unit_items_v0_1`
3. Update `curriculumAgentOrder` to run `assessment_designer` before `qa_agent`.
4. Add `assessment` schema hint to invocation prompt ownership.
5. Update output parser/ownership tests.
6. Update CLI/report tests to expect six workflow runs.
7. Keep semantic validation as a final guard.
8. Update Phase 2 docs to clarify that assessment is a first-class specialist step.

## Verification

Executed after implementation:

- `pnpm --filter @edu-ai/content-pipeline typecheck`
- `pnpm --filter @edu-ai/content-pipeline test`
- `pnpm --filter @edu-ai/shared-types typecheck`
- `pnpm --filter @edu-ai/shared-types test`
- CLI smoke workflow now reports six completed roles.
- CLI LLM mock workflow now reports six invocations.

## Remaining Guardrail

Semantic validation remains mandatory. The legacy Zhipu candidate generated before this ADR is still known to be semantic-invalid and must not be promoted.
