# Misconception Feedback Route Spec

Version: 2026-04-26
Status: Phase 2 draft spec
Owner: curriculum architecture / content-pipeline / student agent runtime
Related docs:

- `docs/PROJECT_MASTER_PLAN_REBASE_2026-04-26.md`
- `docs/UNIT_SPEC.md`
- `docs/CURRICULUM_DESIGN_IMPORT_CONTRACT.md`
- `docs/REVIEW_AND_SELF_CHECK_PROCESS.md`

---

## 1. Purpose

This spec defines how AI-native units model learner-centered misconception feedback routes.

The goal is to move from linear content playback to:

```text
student response
  -> misconception signal
  -> targeted feedback move
  -> retry or no-AI task
  -> evidence capture
  -> teacher-safe summary
```

This is inspired by exploration-style learning systems, but the internal model stays our own `Unit/Page/Block/RuntimeEvent/Evidence` contract.

---

## 2. Non-Goals

This spec does not:

1. Store raw student dialogue for teacher or guardian access.
2. Diagnose emotion or psychology.
3. Use peer ranking.
4. Auto-punish or auto-discipline students.
5. Replace teacher judgment.
6. Write new fields directly into `unit.yaml` before schema promotion.
7. Import external code.
8. Require real provider calls.

---

## 3. Route Shape

Future extension key:

```text
misconception_feedback_routes
```

Draft contract:

```ts
interface MisconceptionFeedbackRoute {
  route_id: string;
  schema_version: "edu-ai-misconception-route-v0.1";
  unit_id: string;
  target_node_id: string;
  misconception_id: string;
  source_block_id: string;
  detection: MisconceptionDetectionRule;
  feedback: MisconceptionFeedbackMove;
  retry: MisconceptionRetryPlan;
  evidence: MisconceptionEvidencePlan;
  teacher_signal: TeacherSafeMisconceptionSignal;
  privacy: MisconceptionPrivacyRule;
  source_trace: string[];
}
```

```ts
interface MisconceptionDetectionRule {
  detection_signal:
    | "selected_wrong_option"
    | "free_text_pattern"
    | "oral_explanation_pattern"
    | "simulation_behavior"
    | "no_ai_task_error"
    | "teacher_marked";
  pattern_description: string;
  confidence_threshold: number;
  low_confidence_behavior: "ask_clarifying_question" | "route_to_teacher_review" | "no_route";
}
```

```ts
interface MisconceptionFeedbackMove {
  feedback_strategy:
    | "socratic_question"
    | "contrast_cases"
    | "counterexample"
    | "visual_simulation"
    | "worked_example_gap"
    | "peer_explain"
    | "teacher_checkpoint";
  student_facing_prompt: string;
  reveal_policy: "do_not_reveal_answer_first" | "hint_after_attempts" | "teacher_mediated";
  max_ai_hints: number;
}
```

```ts
interface MisconceptionRetryPlan {
  retry_block_id: string;
  retry_prompt: string;
  no_ai_followup_task_id?: string;
  max_retry_count: number;
  after_max_retry: "teacher_safe_signal" | "different_representation" | "no_ai_task";
}
```

```ts
interface MisconceptionEvidencePlan {
  evidence_ids: string[];
  evidence_types: Array<"selected_choice" | "short_explanation" | "oral_summary" | "simulation_trace" | "no_ai_output" | "teacher_observation">;
  mastery_update_allowed: boolean;
  minimum_confidence_for_mastery_update: number;
}
```

```ts
interface TeacherSafeMisconceptionSignal {
  signal_type: "misconception_cluster" | "individual_learning_need" | "no_ai_baseline_weakness";
  visible_summary_template: string;
  blocked_raw_fields: string[];
  suggested_intervention_level?: "L1" | "L2" | "L3" | "L4" | "L5";
}
```

```ts
interface MisconceptionPrivacyRule {
  student_visible: boolean;
  teacher_visible: boolean;
  guardian_visible: boolean;
  raw_response_retention: "none" | "student_owned_only" | "short_debug_window";
  teacher_raw_response_access: "denied";
  guardian_raw_response_access: "denied";
}
```

---

## 4. Route Lifecycle

```text
block interaction
  -> collect minimal response signal
  -> classify misconception
  -> confidence check
  -> choose feedback move
  -> retry or no-AI task
  -> create evidence
  -> update mastery only if confidence allows
  -> emit teacher-safe signal if needed
```

Rules:

1. Low confidence does not update mastery.
2. Low confidence should ask a clarifying question or route to teacher review.
3. Student-facing feedback should preserve productive struggle.
4. Teacher-safe signals summarize the pattern, not raw student content.
5. Guardian-facing summaries should not include misconception labels that create anxiety.

---

## 5. Example

```yaml
route_id: route_k_b_confusion
schema_version: edu-ai-misconception-route-v0.1
unit_id: math_g8_linear_function_intro
target_node_id: lf_slope_meaning
misconception_id: misconception_k_b_swapped
source_block_id: block_predict_k
detection:
  detection_signal: free_text_pattern
  pattern_description: "Student treats b as slope or k as y-intercept."
  confidence_threshold: 0.72
  low_confidence_behavior: ask_clarifying_question
feedback:
  feedback_strategy: contrast_cases
  student_facing_prompt: "我们先不套公式。看两条 b 相同但 k 不同的直线，哪一条变化更快？"
  reveal_policy: do_not_reveal_answer_first
  max_ai_hints: 2
retry:
  retry_block_id: block_compare_same_b_different_k
  retry_prompt: "重新说一遍：k 变了，图像的什么变了？"
  no_ai_followup_task_id: task_no_ai_k_b_explain
  max_retry_count: 2
  after_max_retry: teacher_safe_signal
evidence:
  evidence_ids:
    - evidence_k_b_retry_summary
  evidence_types:
    - short_explanation
    - no_ai_output
  mastery_update_allowed: true
  minimum_confidence_for_mastery_update: 0.8
teacher_signal:
  signal_type: misconception_cluster
  visible_summary_template: "部分学生把 k 与 b 的作用混淆，建议用同 b 不同 k 的对照图再讲一次。"
  blocked_raw_fields:
    - raw_dialogue
    - raw_response
    - voice_transcript
privacy:
  student_visible: true
  teacher_visible: true
  guardian_visible: false
  raw_response_retention: student_owned_only
  teacher_raw_response_access: denied
  guardian_raw_response_access: denied
source_trace:
  - source_textbook_linear_function
```

---

## 6. Runtime Event Mapping

Misconception routes may produce:

1. `AgentRuntimeEvent` for route start/end/progress/error.
2. `LearningEvent` for safe evidence.
3. `MasteryRecord` update only through derived evaluation.
4. `InterAgentSignal` only as teacher-safe summary.

They must not produce:

1. Direct teacher raw transcript.
2. Guardian raw answer view.
3. High-stakes intervention without teacher confirmation.
4. Unreviewed mastery downgrade from low-confidence evidence.

---

## 7. Validation Rules

Future semantic validator should enforce:

1. `target_node_id` exists in `knowledge.nodes`.
2. `misconception_id` exists in `knowledge.misconceptions`.
3. `source_block_id` and `retry_block_id` exist in `runtime_content`.
4. `no_ai_followup_task_id`, if present, maps to assessment/task evidence.
5. `confidence_threshold` is between `0` and `1`.
6. `teacher_signal.blocked_raw_fields` includes raw dialogue/transcript when applicable.
7. `teacher_raw_response_access` and `guardian_raw_response_access` are `denied`.
8. `max_ai_hints` is bounded.
9. Feedback prompt does not reveal answer before student attempt unless explicitly teacher-mediated.
10. Mastery update is disallowed when evidence confidence is below threshold.

---

## 8. Privacy And Safety Gates

1. Raw student response is student-owned or ephemeral by default.
2. Teacher sees misconception category and suggested teaching move, not raw response.
3. Guardian sees supportive progress summary only, not misconception drilldown.
4. Emotional or family content detected during feedback routes exits this route and goes to `campus_local_only`.
5. No route can auto-escalate to disciplinary action.
6. Any L4/L5 intervention suggestion requires teacher or school workflow confirmation.

---

## 9. Testing Plan

Future tests should include:

1. Valid route passes schema.
2. Unknown knowledge node blocks route.
3. Unknown misconception ID blocks route.
4. Retry block missing blocks route.
5. Teacher signal containing raw dialogue blocks route.
6. Guardian visible raw response blocks route.
7. Low confidence does not update mastery.
8. Feedback route with answer-first prompt requires review.
9. Emotional content route exits to privacy workflow.

Recommended commands once implemented:

```powershell
pnpm --filter @edu-ai/shared-types test
pnpm --filter @edu-ai/content-pipeline test
pnpm scan:project-health
```

---

## 10. Decision Gates

The following require user/human confirmation:

1. Promoting route schema into canonical `unit.yaml`.
2. Using real student response data for route evaluation.
3. Allowing teachers to inspect raw responses.
4. Allowing guardian misconception drilldown.
5. Sending route payloads to real providers.
6. Adding high-stakes automated decisions based on misconception detection.

---

## 11. Completion Criteria

This spec is complete when it defines:

1. Misconception route shape.
2. Detection, feedback, retry, evidence, teacher signal, and privacy contracts.
3. Runtime mapping.
4. Validation rules.
5. Privacy and safety gates.
6. Test plan.
7. Decision gates.

---

## 12. Lock Recommendation

This document is safe to use as the Phase 2 misconception feedback entry spec.

The next implementation step should be a shared-types draft schema and semantic validator using synthetic unit fixtures only.

