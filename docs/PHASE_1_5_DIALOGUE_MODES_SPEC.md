# Phase 1.5 Student Agent Dialogue Modes Spec

Version: 2026-04-22  
Status: Implemented minimal policy layer

## 1. Phase Goal

Phase 1.5 defines the first runtime contract for Student Agent dialogue behavior.

The goal is not to produce final LLM responses yet. The goal is to define a safe, testable policy layer that decides:

- Which mode should be used.
- What response policy applies.
- Which context is safe to include.
- Which context must be blocked.
- Which privacy flags must be preserved for Phase 1.6 routing.

## 2. Upstream Dependencies

| Source | What Phase 1.5 Uses |
|---|---|
| `docs/AGENT_PERSONA.md` | Boundaries, tone, no-homework, no-diagnosis, no-raw-content principles |
| `packages/agent-sdk/src/memory-runtime` | Memory buckets and transparency boundaries |
| `docs/PHASE_1_3_KNOWLEDGE_GRAPH_SPEC.md` | Knowledge node anchoring |
| `packages/agent-sdk/src/mastery-evaluator` | Student visibility and confidence gates for mastery context |

## 3. Non-Goals

This phase does not:

- Call an LLM.
- Stream chat tokens.
- Persist conversations.
- Implement final emotional risk routing.
- Generate teacher or guardian reports.
- Decide the school-specific Red-risk receiver.

## 4. Modes

### 4.1 Mentor Mode

Purpose: Socratic learning support.

Default behavior:

- Acknowledge the question.
- Ask one focused question.
- Do not give the final answer before the student attempts the next step.
- If the student is stuck repeatedly, offer a clearer hint.

### 4.2 Tutor Mode

Purpose: direct explanation when explicitly requested.

Default behavior:

- Give a concise explanation.
- Connect to safe knowledge-node context when available.
- Ask one small check question.
- Do not provide a submittable homework answer.

### 4.3 Companion Tone

Purpose: lightweight support when the student expresses frustration.

Default behavior:

- Acknowledge frustration without diagnosis.
- Shrink the task to one observable next action.
- Preserve a local-handling flag for Phase 1.6.

This is not mental-health service and does not replace a human adult.

## 5. Intent Detection

The first implementation uses deterministic keyword heuristics:

- `submittable_answer_request`
- `frustration`
- `direct_explanation_request`
- `concept_question`
- `unknown`

This is deliberately simple and auditable. LLM-based intent detection can be introduced later only after regression examples exist.

## 6. Safe Context Rules

Allowed:

- Knowledge node ID and title.
- Student-visible mastery summary, only when `studentCanSeeMastery(record)` is true.
- Academic and personal memory summaries.

Blocked:

- Emotional memory in normal prompt context.
- Low-confidence or not-student-visible mastery.
- Raw conversation text.
- Raw student answers.
- Hidden reasoning chain.

## 7. Output Contract

The policy layer returns `DialogueModePlan`:

- `mode`
- `intent`
- `answer_policy`
- `policy_version`
- `prompt_version`
- `should_offer_hint`
- `must_not`
- `response_moves`
- `safe_context`
- `blocked_context_reasons`
- `privacy_flags`

This object is designed to become the prompt contract for the future LLM Gateway call.

## 8. Completion Criteria

Phase 1.5 can lock when:

- Mentor and Tutor produce different response contracts for the same broad student learning scenario.
- Tutor still refuses submittable homework answers.
- Mentor offers clearer hints after repeated stuck attempts.
- Low-confidence mastery is not included in safe context.
- Emotional memory is blocked from normal prompt context.
- Frustration preserves a campus-local handling flag for Phase 1.6.
- `pnpm run ci` passes.

## 9. Review Focus

- Does Mentor accidentally reveal the answer too early?
- Does Tutor become homework代写?
- Does any mode expose raw memory, raw answer, or hidden reasoning chain?
- Does any mode bypass mastery visibility gates?
- Are policy and prompt versions traceable?

