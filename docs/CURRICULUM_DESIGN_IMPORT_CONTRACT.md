# Curriculum Design Import Contract

Version: 2026-04-26  
Status: Phase 2 import draft spec  
Owner: content-pipeline / curriculum architecture / governance  
Related docs:

- `课程设计/AI原生课程设计新对话启动包_2026-04-26.md`
- `docs/UNIT_SPEC.md`
- `docs/REVIEW_AND_SELF_CHECK_PROCESS.md`
- `docs/PROJECT_MASTER_PLAN_REBASE_2026-04-26.md`
- `docs/DEEPTUTOR_INFORMED_PROJECT_PLAN_2026-04-25.md`
- `docs/OPENMAIC_DEEP_DIVE_AND_INTEGRATION_PLAN_2026-04-26.md`
- `packages/shared-types/src/content/ai-native-unit.ts`

---

## 1. Purpose

This document defines how curriculum designs produced in a separate course-design conversation enter the engineering content pipeline.

The course-design conversation is allowed to be creative and pedagogically ambitious. The platform import layer must be strict, structured, privacy-safe, and reviewable.

The goal is to transform:

```text
rich curriculum design markdown
```

into:

```text
CurriculumDesignImportDraft
  -> import validation
  -> candidate unit patch
  -> review artifact
  -> human approval
  -> explicit apply to unit.yaml
```

No course-design Agent output may directly write to source `unit.yaml`.

---

## 2. Source And Target

### 2.1 Source

The source is a curriculum design package produced by a new conversation using:

```text
课程设计/AI原生课程设计新对话启动包_2026-04-26.md
```

It should include:

1. Unit reconstruction overview.
2. Student-side AI-native learning material.
3. Teacher-side teaching plan.
4. Classroom runtime script.
5. AI interaction scripts.
6. Learning tasks and capability certifications.
7. Teacher dashboard safe signals.
8. Risk and correction notes.
9. `unit_runtime_contract` draft.

### 2.2 Target

The engineering target is:

```text
AiNativeUnitSpec
```

with current top-level sections:

```yaml
schema_version: ai-native-unit-v0.1
metadata: ...
knowledge: ...
pedagogy: ...
narrative: ...
implementation: ...
runtime_content: ...
assessment: ...
quality: ...
```

Current machine schema:

```text
packages/shared-types/src/content/ai-native-unit.ts
```

---

## 3. Non-Goals

This contract does not:

1. Let the curriculum design conversation write source files.
2. Treat a beautiful markdown plan as an approved unit.
3. Skip schema validation.
4. Skip semantic validation.
5. Skip human review.
6. Introduce real provider calls.
7. Use real student/teacher/guardian data.
8. Import external project code.
9. Rewrite `AiNativeUnitSpec` immediately.
10. Force every future extension into current schema before it is validated.

---

## 4. Import Pipeline

```text
Course Design Markdown
  -> normalize into CurriculumDesignImportDraft
  -> validate import draft shape
  -> map to candidate AiNativeUnitSpec patch
  -> run schema validation
  -> run semantic validation
  -> produce CurriculumImportReviewArtifact
  -> human approve / request repair / reject
  -> explicit apply to target unit path
```

Hard rule:

```text
import draft != approved unit
review artifact != source writeback
approval != automatic apply
```

---

## 5. Contract Overview

The import package has three layers:

1. `design_content`: human-readable curriculum design captured in structured fields.
2. `runtime_contract`: machine-oriented Page/Block/Event/Evidence structure.
3. `governance_contract`: privacy, visibility, source trace, risk, and approval requirements.

---

## 6. CurriculumDesignImportDraft Shape

```ts
interface CurriculumDesignImportDraft {
  schema_version: "edu-ai-curriculum-import-v0.1";
  import_id: string;
  created_at: string;
  source_conversation: {
    conversation_id?: string;
    author: "human" | "ai_assistant" | "mixed";
    source_file?: string;
    source_material_summary: string;
  };
  unit_overview: CurriculumUnitOverview;
  student_material: StudentMaterialDesign;
  teacher_plan: TeacherPlanDesign;
  classroom_script: ClassroomRuntimeScript;
  ai_interaction_scripts: AiInteractionScriptDraft[];
  learning_tasks: LearningTaskDraft[];
  capability_certifications: CapabilityCertificationDraft[];
  teacher_dashboard_signals: TeacherDashboardSignalDraft[];
  privacy_boundaries: PrivacyBoundaryDraft[];
  runtime_contract: UnitRuntimeContractDraft;
  risks: CurriculumRiskDraft[];
  source_trace: CurriculumImportSourceTrace[];
}
```

### 6.1 Required Import Metadata

```ts
interface CurriculumUnitOverview {
  unit_id_suggestion: string;
  subject: string;
  grade: string;
  title: string;
  duration_hours: number;
  source_textbook?: string;
  source_chapter?: string;
  standard_alignment: Array<{
    standard_system: string;
    standard_code?: string;
    description: string;
    confidence: number;
    needs_human_verification: boolean;
  }>;
  ai_native_big_question: string;
  knowledge_goals: string[];
  capability_goals: string[];
  student_experience_thesis: string;
  teacher_teaching_thesis: string;
  no_ai_principles: string[];
}
```

Rules:

1. `standard_alignment` must reference China K-12 curriculum or a local textbook source.
2. Foreign standard substitution is invalid.
3. Any uncertain standard must set `needs_human_verification = true`.

---

## 7. Student Material Contract

```ts
interface StudentMaterialDesign {
  pages: StudentPageDraft[];
}

interface StudentPageDraft {
  page_id: string;
  page_title: string;
  page_type:
    | "scenario_entry"
    | "observation_discovery"
    | "concept_construction"
    | "interactive_simulation"
    | "character_dialogue"
    | "misconception_challenge"
    | "no_ai_baseline"
    | "transfer_application"
    | "reflection_review"
    | "portfolio_output";
  learning_goal: string;
  student_experience: string;
  teacher_purpose: string;
  blocks: StudentBlockDraft[];
}
```

```ts
interface StudentBlockDraft {
  block_id: string;
  block_type:
    | "story_scene"
    | "character_dialogue"
    | "socratic_prompt"
    | "student_prediction"
    | "interactive_simulation"
    | "concept_graph"
    | "worked_example_challenge"
    | "misconception_probe"
    | "misconception_feedback_route"
    | "voice_dialogue"
    | "whiteboard_action"
    | "pbl_issueboard"
    | "no_ai_task"
    | "peer_discussion"
    | "oral_explanation"
    | "reflection_card"
    | "teacher_checkpoint"
    | "portfolio_output";
  target_knowledge_nodes: string[];
  student_action: string;
  ai_role: string;
  ai_prompt_draft?: string;
  voice_or_text: "text" | "voice" | "either" | "none";
  whiteboard_or_simulation?: string;
  no_ai_boundary: string;
  output_evidence: string[];
  teacher_visible_signal: string[];
  privacy_boundary: string[];
  assessment_hook?: string;
  source_trace: CurriculumImportSourceTrace[];
}
```

Rules:

1. Every block must identify target knowledge nodes.
2. Every core learning goal must have at least one no-AI block or task.
3. Voice blocks are suggestions only until `VOICE_RUNTIME_SPIKE_SPEC.md` is implemented.
4. Whiteboard and PBL blocks are future-capability suggestions unless current runtime supports them.
5. Blocks cannot include real student examples or raw personal data.

---

## 8. Teacher Plan Contract

```ts
interface TeacherPlanDesign {
  pre_class_setup: string[];
  opening_moves: string[];
  key_concept_explanations: string[];
  ai_interaction_plan: string[];
  peer_discussion_plan: string[];
  no_ai_verification_plan: string[];
  board_or_whiteboard_plan: string[];
  teacher_observation_points: string[];
  expected_heatmap_patterns: string[];
  intervention_ladder: InterventionLadderDraft[];
  after_class_tasks: string[];
  next_lesson_bridge: string[];
}

interface InterventionLadderDraft {
  level: "L1" | "L2" | "L3" | "L4" | "L5";
  trigger: string;
  teacher_action: string;
  verification: string;
  close_condition: string;
}
```

Rules:

1. Teacher plan must preserve teacher control.
2. Teacher intervention suggestions must never include raw emotional content.
3. L5 must route to school support workflow, not ordinary teacher-only action.
4. Teacher dashboard signals must be projections, not raw dialogue.

---

## 9. Classroom Runtime Script Contract

```ts
interface ClassroomRuntimeScript {
  duration_min: 40 | 45 | 90 | number;
  steps: ClassroomRuntimeStepDraft[];
}

interface ClassroomRuntimeStepDraft {
  step_id: string;
  start_min: number;
  end_min: number;
  phase:
    | "scenario_wakeup"
    | "teacher_framing"
    | "ai_exploration"
    | "peer_discussion"
    | "no_ai_baseline"
    | "teacher_synthesis"
    | "reflection_trace"
    | "extension";
  teacher_action: string;
  student_action: string;
  ai_action: string;
  evidence_created: string[];
  runtime_event_suggestions: RuntimeEventSuggestionDraft[];
}
```

```ts
interface RuntimeEventSuggestionDraft {
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

Rules:

1. Future event suggestions must not be forced into current runtime enum until schema supports them.
2. `emotion` domain suggestions must be campus-local and abstract only.
3. Runtime events must not contain raw transcript, raw prompt, or chain-of-thought.

---

## 10. AI Interaction Script Contract

```ts
interface AiInteractionScriptDraft {
  script_id: string;
  role_type:
    | "student_agent"
    | "character_agent"
    | "challenger_agent"
    | "simulation_agent"
    | "reflection_coach"
    | "teacher_summary_agent";
  target_knowledge_nodes: string[];
  role_positioning: string;
  hard_no: string[];
  opening_move: string;
  follow_up_strategy: string[];
  hint_policy: string;
  no_ai_transition_rule: string;
  source_trace_required: boolean;
}
```

Rules:

1. Scripts must include hard boundaries.
2. Student-facing scripts must ask before explaining when possible.
3. Teacher summary scripts can only summarize safe signals.
4. Character role-play must not fabricate source facts as authoritative.
5. Historical/literary/scientific role-play must include source caveat when uncertain.

---

## 11. Learning Task And Capability Certification Contract

```ts
interface LearningTaskDraft {
  task_id: string;
  task_type:
    | "exploration_task"
    | "practice_task"
    | "transfer_challenge"
    | "correction_task"
    | "portfolio_task"
    | "no_ai_baseline_task"
    | "ai_collaboration_task";
  purpose: string;
  student_submission: string[];
  ai_allowed: boolean;
  target_knowledge_nodes: string[];
  evaluation_criteria: string[];
  teacher_visible_signal: string[];
  privacy_boundary: string[];
}
```

```ts
interface CapabilityCertificationDraft {
  certification_id: string;
  certification_type:
    | "no_ai_baseline"
    | "transfer_challenge"
    | "oral_explanation"
    | "process_evidence"
    | "portfolio"
    | "ai_collaboration";
  capability_goal: string;
  evidence_required: string[];
  pass_criteria: string[];
  human_review_required: boolean;
  target_knowledge_nodes: string[];
}
```

Rules:

1. Every unit must include at least one no-AI baseline task.
2. AI collaboration tasks must require transparency about how AI was used.
3. Certification should produce evidence, not only a score.
4. Oral explanation certifications must not store raw audio by default.

---

## 12. Teacher Dashboard Safe Signals

```ts
interface TeacherDashboardSignalDraft {
  signal_id: string;
  signal_type:
    | "knowledge_heat"
    | "misconception_cluster"
    | "no_ai_baseline_weakness"
    | "question_quality"
    | "reflection_quality"
    | "transfer_readiness"
    | "ai_dependency_risk"
    | "intervention_suggestion";
  source_evidence: string[];
  visible_summary: string;
  blocked_raw_fields: string[];
  suggested_intervention_level?: "L1" | "L2" | "L3" | "L4" | "L5";
}
```

Rules:

1. Signals must be safe summaries.
2. Signals must list blocked raw fields.
3. `ai_dependency_risk` should compare AI-assisted and no-AI evidence.
4. Emotional or family details cannot be exposed as signal content.

---

## 13. Privacy Boundary Contract

```ts
interface PrivacyBoundaryDraft {
  boundary_id: string;
  data_class:
    | "academic_response"
    | "raw_dialogue"
    | "voice_audio"
    | "voice_transcript"
    | "emotion_or_personal"
    | "family_context"
    | "teacher_private_note"
    | "model_internal";
  student_visible: boolean;
  teacher_visible: boolean;
  guardian_visible: boolean;
  admin_audit_visible: boolean;
  retention_note: string;
  projection_rule: string;
}
```

Default rules:

1. `raw_dialogue`: student-owned future view only; teacher/guardian denied.
2. `voice_audio`: not stored by default.
3. `voice_transcript`: not stored by default.
4. `emotion_or_personal`: campus-local only.
5. `family_context`: campus-local only.
6. `teacher_private_note`: teacher/admin-audit scoped, never student/guardian by default.
7. `model_internal`: not visible to student/teacher/guardian.

---

## 14. Runtime Contract Mapping

The course-design conversation must provide a `unit_runtime_contract` draft. Import tooling maps it to current and future schema as follows:

| Import field | Current target | Future target |
| --- | --- | --- |
| `unit_overview` | `metadata`, `knowledge` seed context | richer metadata |
| `student_material.pages` | `runtime_content.pages` | same |
| `student_material.blocks` | `runtime_content.pages[].blocks[]` payload | future richer block types |
| `teacher_plan` | `pedagogy`, `quality.reviewer_notes`, teacher guide artifact | teacher runtime package |
| `classroom_script` | `runtime_content` payload / `quality.reviewer_notes` | `classroom_action_plan` |
| `ai_interaction_scripts` | `narrative.dialogue_scripts`, `implementation.prompts` | voice/role prompt assets |
| `learning_tasks` | `assessment.items`, runtime blocks | `learning_task_evidence_plan` |
| `capability_certifications` | `assessment.items` + notes | certification schema |
| `teacher_dashboard_signals` | future docs / implementation hooks | `TeacherSignalProjection` |
| `privacy_boundaries` | `visibility_scope`, `privacy_level`, quality notes | governance schema |
| `runtime_event_suggestions` | notes only unless enum supports it | `AgentRuntimeEvent` extensions |

If current schema cannot represent a field safely, the importer must preserve it in the review artifact and mark it as `future_extension`, not force it into unsafe payloads.

---

## 15. Candidate Patch Generation

The importer may generate candidate patches for:

1. `metadata`
2. `knowledge`
3. `pedagogy`
4. `narrative`
5. `implementation`
6. `runtime_content`
7. `assessment`
8. `quality`

Candidate patches must be complete owned-section objects, not informal diffs.

The importer must attach:

1. `confidence_score`
2. `source_trace`
3. `author_agent` or source role
4. source material reference
5. import draft reference

Any generated patch without traceability is invalid.

---

## 16. Validation Gates

### 16.1 Shape Gate

The import draft must:

1. Parse as structured JSON/YAML or be normalizable into the contract.
2. Include required sections.
3. Use stable machine IDs.
4. Avoid raw real student/teacher/guardian data.
5. Include source trace.

### 16.2 Curriculum Gate

The import draft must:

1. Preserve China K-12 curriculum context.
2. Avoid replacing source standards with foreign standards.
3. Mark uncertain textbook/standard alignment for human verification.
4. Keep subject matter claims traceable.

### 16.3 Pedagogy Gate

The import draft must:

1. Include student-first thinking before AI explanation.
2. Include no-AI baseline tasks.
3. Avoid AI answer-machine patterns.
4. Include teacher control points.
5. Include evidence of learning, not only engagement.

### 16.4 Runtime Gate

The import draft must:

1. Map every Page/Block to target knowledge nodes.
2. Declare voice/whiteboard/PBL needs as capability suggestions.
3. Declare sandbox needs for interactive/simulation/code-like blocks.
4. Avoid unsupported runtime event coercion.

### 16.5 Governance Gate

The import draft must:

1. Declare privacy boundaries.
2. Block teacher/guardian raw dialogue access.
3. Block raw voice/audio by default.
4. Avoid emotional/family data leakage.
5. Specify teacher-safe signals only.

---

## 17. Review Artifact

Import must produce:

```ts
interface CurriculumImportReviewArtifact {
  artifact_id: string;
  schema_version: "edu-ai-curriculum-import-review-v0.1";
  source_import_id: string;
  target_unit_id: string;
  status: "passed" | "blocked" | "needs_human_review";
  candidate_patches: Array<{
    section:
      | "metadata"
      | "knowledge"
      | "pedagogy"
      | "narrative"
      | "implementation"
      | "runtime_content"
      | "assessment"
      | "quality";
    patch: unknown;
    validation_status: "passed" | "blocked" | "needs_human_review";
    issues: CurriculumImportIssue[];
  }>;
  future_extensions: Array<{
    extension_key:
      | "misconception_feedback_routes"
      | "classroom_action_plan"
      | "voice_script"
      | "whiteboard_action_plan"
      | "pbl_issueboard"
      | "learning_task_evidence_plan"
      | "content_package_manifest";
    source_reference: string;
    reason_not_applied: string;
  }>;
  validation_summary: {
    shape_gate: "passed" | "blocked";
    curriculum_gate: "passed" | "blocked" | "needs_human_review";
    pedagogy_gate: "passed" | "blocked" | "needs_human_review";
    runtime_gate: "passed" | "blocked" | "needs_human_review";
    governance_gate: "passed" | "blocked";
  };
  approval_required: boolean;
  apply_allowed: boolean;
}
```

```ts
interface CurriculumImportIssue {
  issue_id: string;
  severity: "low" | "medium" | "high" | "blocking";
  owner: "curriculum_designer" | "subject_expert" | "pedagogy_designer" | "engineering_agent" | "qa_agent" | "human_reviewer";
  message: string;
  repair_hint: string;
}
```

Rules:

1. `status = blocked` means `apply_allowed = false`.
2. `needs_human_review` cannot be auto-applied.
3. Future extensions are preserved for planning but not forced into source schema.
4. Human approval must reference a concrete artifact ID.

---

## 18. Apply Rules

Apply is allowed only when:

1. Import review artifact exists.
2. Artifact status is `passed`.
3. `apply_allowed = true`.
4. Human approval exists.
5. Target path is explicit.
6. Current target source hash matches the review artifact source hash.
7. Generated candidate patches pass schema and semantic validation.

Apply must produce:

1. Updated target file.
2. Apply receipt.
3. Audit entry or local audit artifact.
4. Verification command output.

---

## 19. Negative Examples

The importer must reject or block:

1. Markdown-only course design with no `unit_runtime_contract`.
2. Blocks without target knowledge nodes.
3. Teacher signals containing raw dialogue or emotional text.
4. “AI explains answer first” as the dominant pedagogy.
5. No no-AI baseline task.
6. Foreign curriculum standards substituted for Chinese standards.
7. Role-play scripts that fabricate facts without source caveat.
8. Voice tasks that store raw audio by default.
9. Patches without `source_trace`.
10. Candidate patches that change sections outside their owner.

---

## 20. Example Minimal Import Draft

```yaml
schema_version: edu-ai-curriculum-import-v0.1
import_id: import_math_g8_linear_function_001
created_at: "2026-04-26T13:00:00.000Z"
source_conversation:
  author: mixed
  source_file: "课程设计/math_g8_linear_function_design.md"
  source_material_summary: "基于一次函数概念教材材料的 AI 原生课程设计。"
unit_overview:
  unit_id_suggestion: math_g8_linear_function_intro
  subject: math
  grade: g8
  title: 一次函数的概念
  duration_hours: 6
  standard_alignment:
    - standard_system: 义务教育数学课程标准（2022年版）
      description: "函数相关条目，需学科顾问核对精确编号。"
      confidence: 0.7
      needs_human_verification: true
  ai_native_big_question: "为什么一条直线能表达变化关系？"
  knowledge_goals:
    - "理解 k 对一次函数图像方向和变化快慢的影响。"
  capability_goals:
    - "能用图像、表格和语言解释变化率。"
  student_experience_thesis: "学生先观察图像变化，再和 AI 导师讨论 k 的意义。"
  teacher_teaching_thesis: "老师控制概念边界，用无 AI 口头解释验证真实掌握。"
  no_ai_principles:
    - "关键解释必须由学生独立完成。"
student_material:
  pages:
    - page_id: page_slope_observe
      page_title: "先看图像怎么变"
      page_type: observation_discovery
      learning_goal: "观察 k 的正负与图像方向。"
      student_experience: "拖动 k，先写预测，再看图像变化。"
      teacher_purpose: "暴露 k/b 混淆。"
      blocks:
        - block_id: block_predict_k
          block_type: student_prediction
          target_knowledge_nodes: [lf_slope_meaning]
          student_action: "先预测 k 变大时图像如何变化。"
          ai_role: "苏格拉底导师"
          ai_prompt_draft: "你先猜，不急着套公式。你觉得 k 变大会发生什么？"
          voice_or_text: either
          no_ai_boundary: "预测必须先独立写出。"
          output_evidence: ["prediction_text"]
          teacher_visible_signal: ["是否能区分 k 和 b"]
          privacy_boundary: ["不展示原始对话全文给老师"]
          source_trace:
            - source_id: textbook-linear-function
              source_type: textbook
              reference: "一次函数概念教材片段"
runtime_contract:
  unit_id: math_g8_linear_function_intro
  pages: []
risks:
  - risk_id: risk_ai_gives_formula_too_early
    risk: "AI 过早给公式解释。"
    mitigation: "必须先收集学生预测。"
source_trace:
  - source_id: textbook-linear-function
    source_type: textbook
    reference: "用户提供的教材材料"
```

---

## 21. Future Implementation Files

Suggested later files:

```text
packages/shared-types/src/content/curriculum-import.ts
packages/shared-types/tests/curriculum-import.spec.ts
apps/content-pipeline/src/import/curriculum-design-importer.ts
apps/content-pipeline/src/import/curriculum-import-review.ts
apps/content-pipeline/tests/curriculum-import.spec.ts
```

This spec does not require creating these files yet.

---

## 22. Completion Criteria For This Spec

This spec is complete when it defines:

1. Source and target boundary.
2. Import draft shape.
3. Student material mapping.
4. Teacher plan mapping.
5. Classroom runtime mapping.
6. AI script mapping.
7. Learning task and capability certification mapping.
8. Teacher safe signal mapping.
9. Privacy boundary contract.
10. Runtime contract mapping to current/future schema.
11. Validation gates.
12. Review artifact contract.
13. Apply rules.
14. Negative examples.
15. Future implementation files.

---

## 23. Lock Recommendation

This document is safe to use as the Phase 2 curriculum import entry spec.

The next implementation step should be shared-types schema and tests for `CurriculumDesignImportDraft`, not direct source `unit.yaml` writeback.

