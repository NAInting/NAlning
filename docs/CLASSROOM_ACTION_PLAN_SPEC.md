# Classroom Action Plan Spec

Version: 2026-04-26
Status: Phase 2 / Phase 4 draft spec
Owner: content-pipeline / teacher agent / student runtime
Related docs:

- `docs/PROJECT_MASTER_PLAN_REBASE_2026-04-26.md`
- `docs/OPENMAIC_DEEP_DIVE_AND_INTEGRATION_PLAN_2026-04-26.md`
- `docs/UNIT_SPEC.md`
- `docs/VOICE_RUNTIME_SPIKE_SPEC.md`
- `docs/CURRICULUM_DESIGN_IMPORT_CONTRACT.md`

---

## 1. Purpose

This spec defines the classroom action plan: a teacher-visible, controllable sequence of AI-assisted classroom actions.

The action plan turns AI-native content into something a teacher can actually run in a lesson:

```text
teacher framing
  -> AI / block / whiteboard / voice / discussion action
  -> student action
  -> evidence capture
  -> teacher checkpoint
  -> safe runtime event
```

The goal is not to automate the teacher. The goal is to make the AI classroom legible, previewable, interruptible, and auditable.

---

## 2. Non-Goals

This spec does not:

1. Let AI run a class without teacher control.
2. Trigger discipline, grading, parent messages, or high-stakes decisions automatically.
3. Reveal raw student dialogue, voice, emotion, family context, or private notes to teachers.
4. Choose a production whiteboard or voice provider.
5. Import OpenMAIC code.
6. Replace `runtime_content`.
7. Write new fields directly into `unit.yaml` before schema promotion.

---

## 3. Action Plan Shape

Future extension key:

```text
classroom_action_plan
```

Draft contract:

```ts
interface ClassroomActionPlan {
  schema_version: "edu-ai-classroom-action-plan-v0.1";
  plan_id: string;
  unit_id: string;
  lesson_duration_min: number;
  teacher_control_policy: TeacherControlPolicy;
  actions: ClassroomAction[];
  evidence_plan: ClassroomEvidencePlan;
  fallback_plan: ClassroomFallbackPlan;
  source_trace: string[];
}
```

```ts
interface TeacherControlPolicy {
  default_mode: "teacher_confirm_each_action" | "teacher_preview_then_auto_advance" | "teacher_led_only";
  teacher_can_pause: true;
  teacher_can_skip: true;
  teacher_can_override: true;
  student_individual_action_requires_confirmation: true;
}
```

```ts
interface ClassroomAction {
  action_id: string;
  start_min: number;
  end_min: number;
  phase:
    | "scenario_wakeup"
    | "teacher_framing"
    | "ai_exploration"
    | "block_focus"
    | "whiteboard_action"
    | "voice_exchange"
    | "peer_discussion"
    | "pbl_issue_open"
    | "quiz_prompt"
    | "no_ai_baseline"
    | "teacher_synthesis"
    | "reflection_trace";
  trigger: ClassroomActionTrigger;
  teacher_action: string;
  student_action: string;
  ai_action: string;
  target_page_id?: string;
  target_block_ids: string[];
  target_knowledge_node_ids: string[];
  runtime_event_suggestions: ClassroomRuntimeEventSuggestion[];
  teacher_checkpoint: TeacherCheckpoint;
  safety: ClassroomActionSafety;
}
```

```ts
interface ClassroomActionTrigger {
  trigger_type: "time" | "teacher_manual" | "class_signal" | "block_completion" | "misconception_cluster" | "no_ai_result";
  trigger_description: string;
  auto_start_allowed: boolean;
}
```

```ts
interface ClassroomRuntimeEventSuggestion {
  event_type:
    | "stage_start"
    | "stage_end"
    | "progress"
    | "source_anchor"
    | "content_delta"
    | "result"
    | "blocked"
    | "error"
    | "done"
    | "future_voice_turn"
    | "future_whiteboard_action"
    | "future_pbl_action";
  domain: "academic" | "content" | "runtime" | "emotion" | "system";
  privacy_level: "public" | "academic" | "student_sensitive" | "campus_local_only";
  safe_summary: string;
}
```

```ts
interface TeacherCheckpoint {
  checkpoint_type: "observe" | "ask_student" | "collect_no_ai_evidence" | "mini_explain" | "decide_intervention";
  teacher_prompt: string;
  evidence_to_review: string[];
  decision_required: boolean;
}
```

```ts
interface ClassroomActionSafety {
  visibility_scope: "student" | "teacher" | "classroom" | "admin_audit";
  forbidden_payloads: string[];
  high_stakes_decision_allowed: false;
  audit_required: boolean;
}
```

```ts
interface ClassroomEvidencePlan {
  evidence_ids: string[];
  evidence_types: Array<"class_poll" | "student_prediction" | "peer_explanation" | "no_ai_output" | "oral_summary" | "teacher_observation" | "runtime_completion">;
  mastery_update_allowed: boolean;
  teacher_dashboard_projection: string[];
}
```

```ts
interface ClassroomFallbackPlan {
  provider_unavailable: "teacher_led" | "static_content" | "no_ai_task";
  network_unavailable: "teacher_led" | "printed_material" | "local_package";
  voice_unavailable: "text_or_teacher_read";
  whiteboard_unavailable: "static_diagram_or_teacher_draw";
}
```

---

## 4. Action Families

### 4.1 Speech Segment

Teacher or AI speaks a short segment.

Rules:

1. Segment must be short and interruptible.
2. AI speech cannot reveal hidden reasoning.
3. Sensitive speech must route through voice privacy rules.

### 4.2 Block Focus

Class focuses on a specific runtime block.

Rules:

1. Block must exist in `runtime_content`.
2. Target nodes must resolve.
3. Teacher can pause or skip.

### 4.3 Whiteboard Action

Graph, sketch, highlight, drag, annotate, or compare on a board.

Rules:

1. Executable/simulation actions require sandbox.
2. Student prediction should precede AI explanation.
3. Captured student work needs privacy classification.

### 4.4 Interactive Start

Launches an interactive block or class poll.

Rules:

1. Required capability must be declared.
2. Offline fallback must exist.
3. Results are evidence, not automatic grades.

### 4.5 Discussion Trigger

Starts pair, group, or class discussion.

Rules:

1. Prompt should target reasoning, not ranking.
2. Teacher can choose whether summaries are collected.
3. Peer comparison is blocked by default.

### 4.6 PBL Issue Open

Opens a project/problem issue.

Rules:

1. Must map to target knowledge nodes.
2. Must define artifact/evidence expected.
3. Must not use real family/personal data as scenario input.

### 4.7 Quiz Prompt

Runs quick check.

Rules:

1. Quiz result may inform teacher dashboard only as safe projection.
2. Low confidence does not update mastery.
3. Individual remediation requires teacher confirmation.

---

## 5. Example

```yaml
schema_version: edu-ai-classroom-action-plan-v0.1
plan_id: cap_math_g8_linear_function_intro_lesson1
unit_id: math_g8_linear_function_intro
lesson_duration_min: 45
teacher_control_policy:
  default_mode: teacher_preview_then_auto_advance
  teacher_can_pause: true
  teacher_can_skip: true
  teacher_can_override: true
  student_individual_action_requires_confirmation: true
actions:
  - action_id: action_open_graph_prediction
    start_min: 5
    end_min: 10
    phase: block_focus
    trigger:
      trigger_type: time
      trigger_description: "After teacher frames the taxi fare scenario."
      auto_start_allowed: false
    teacher_action: "Ask students to predict how the graph changes before using AI."
    student_action: "Write one prediction without AI."
    ai_action: "Show two lines with same b and different k, then ask contrast question."
    target_page_id: page_slope_observe
    target_block_ids:
      - block_predict_k
    target_knowledge_node_ids:
      - lf_slope_meaning
    runtime_event_suggestions:
      - event_type: progress
        domain: academic
        privacy_level: academic
        safe_summary: "Class completed first slope prediction block."
    teacher_checkpoint:
      checkpoint_type: collect_no_ai_evidence
      teacher_prompt: "Pick one student to explain k without AI."
      evidence_to_review:
        - prediction_text
      decision_required: false
    safety:
      visibility_scope: classroom
      forbidden_payloads:
        - raw_dialogue
        - voice_transcript
        - emotion_or_personal
        - family_context
      high_stakes_decision_allowed: false
      audit_required: true
evidence_plan:
  evidence_ids:
    - evidence_first_prediction
  evidence_types:
    - student_prediction
    - no_ai_output
  mastery_update_allowed: false
  teacher_dashboard_projection:
    - "class-level k/b confusion signal"
fallback_plan:
  provider_unavailable: teacher_led
  network_unavailable: printed_material
  voice_unavailable: text_or_teacher_read
  whiteboard_unavailable: static_diagram_or_teacher_draw
source_trace:
  - source_textbook_linear_function
```

---

## 6. Teacher Control Rules

1. Teacher can preview the full action plan before class.
2. Teacher can pause, skip, override, or take over any action.
3. Individualized student actions require teacher confirmation.
4. AI cannot directly message guardians.
5. AI cannot create disciplinary actions.
6. AI cannot mark high-stakes grades.
7. AI can recommend, but teacher decides.

---

## 7. Runtime Mapping

Classroom actions may map to:

1. `runtime_content.pages[].blocks[]`
2. `AgentRuntimeEvent`
3. `LearningEvent`
4. `TeacherSignalProjection`
5. Future `content_package_manifest` entrypoints

If current schemas cannot represent an action, the importer must preserve it as a future extension in review artifacts.

---

## 8. Privacy And Governance

Allowed teacher view:

1. Action status.
2. Class-level progress.
3. Safe misconception cluster.
4. No-AI evidence completion.
5. Suggested next teaching move.

Denied teacher view:

1. Raw student-Agent dialogue.
2. Voice audio.
3. Voice transcript.
4. Emotional or family details.
5. Model internal reasoning.

Every action that affects an individual student must have:

1. Reason code.
2. Teacher confirmation.
3. Audit trail.
4. Safe summary.

---

## 9. Validation Rules

Future semantic validator should enforce:

1. Action time ranges are valid and non-negative.
2. Target pages and blocks exist.
3. Target knowledge nodes exist.
4. Required capabilities have fallback.
5. Teacher control policy allows pause/skip/override.
6. Individualized action requires confirmation.
7. `high_stakes_decision_allowed` is always false.
8. Forbidden payload list includes raw dialogue, voice transcript, emotion/personal data, and family context for every action; voice actions also include voice audio.
9. Emotion domain runtime suggestions are `campus_local_only`.
10. Provider unavailable fallback is defined.

---

## 10. Testing Plan

Future tests should include:

1. Valid action plan passes schema.
2. Unknown block ID blocks plan.
3. Missing teacher override blocks pilot-ready plan.
4. Individual student action without confirmation blocks plan.
5. High-stakes action blocks plan.
6. Voice action without transcript/audio deny-list blocks plan.
7. Emotion event not `campus_local_only` blocks plan.
8. Missing offline fallback blocks pilot-ready package.

Recommended commands once implemented:

```powershell
pnpm --filter @edu-ai/shared-types test
pnpm --filter @edu-ai/content-pipeline test
pnpm scan:project-health
```

---

## 11. Decision Gates

The following require user/human confirmation:

1. Promoting action plan schema into canonical `unit.yaml`.
2. Choosing a production whiteboard or classroom runtime.
3. Choosing LiveKit/Pipecat/WebRTC production voice runtime.
4. Allowing AI to auto-advance without teacher preview.
5. Using real classroom data.
6. Letting classroom actions write directly to production source units.

---

## 12. Completion Criteria

This spec is complete when it defines:

1. Action plan shape.
2. Action families.
3. Teacher control rules.
4. Runtime mapping.
5. Privacy/governance rules.
6. Validation rules.
7. Test plan.
8. Decision gates.

---

## 13. Lock Recommendation

This document is safe to use as the Phase 2 / Phase 4 classroom action entry spec.

The next implementation step should be a draft shared-types schema and semantic validator using synthetic classroom actions only.
