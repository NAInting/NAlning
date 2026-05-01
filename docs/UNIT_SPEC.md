# Unit Spec

This document defines the canonical Phase 2.1 contract for AI-native curriculum unit definitions.

Status: `ai-native-unit-v0.1`.

## 1. Purpose

The 4-Agent curriculum production pipeline writes one shared unit artifact. Each agent owns a section, but every section must remain machine-checkable and traceable.

The runtime target is a `unit.yaml` file with this shape:

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

The machine schema lives in:

- `packages/shared-types/src/content/ai-native-unit.ts`

The current sample lives in:

- `content/units/math-g8-s1-linear-function-concept/unit.yaml`

## 2. Agent Ownership

| Section | Owner Agent | Responsibility |
| --- | --- | --- |
| `metadata` | orchestrator / human setup | Unit identity, subject, grade, duration, standards, prerequisites |
| `knowledge` | subject expert | Knowledge nodes, edges, misconceptions, mastery criteria |
| `pedagogy` | pedagogy designer | Learning path, activities, cognitive load, differentiation |
| `narrative` | narrative designer | Scenarios, characters, dialogue scripts, gamification |
| `implementation` | engineering agent | Components, prompt assets, data hooks |
| `runtime_content` | engineering agent (draft), future block planner (optional) | Renderable pages and blocks derived from knowledge, pedagogy, narrative, implementation, and assessment |
| `assessment` | subject expert + QA | Assessment items and confidence threshold |
| `quality` | QA agent | Pass/fail, issues, reviewer notes |

## 3. Required Traceability

Every AI-generated section must include:

- `confidence_score`: number from `0` to `1`.
- `source_trace`: at least one source reference.

Valid source types:

- `curriculum_standard`
- `textbook`
- `teacher_note`
- `pedagogy_library`
- `agent_output`
- `human_review`

This is a hard gate. A generated section without source trace is invalid.

Runtime blocks also carry block-level `confidence_score` and `source_trace`, because each block may be rendered independently by the student UI.

## 4. ID Rules

`unit_id`, `node_id`, `activity_id`, `script_id`, `prompt_id`, `hook_id`, and `issue_id` must be stable machine IDs:

- lowercase letters, numbers, underscores, and hyphens only
- no Chinese display names
- no spaces

Good:

- `math_g8_linear_function_intro`
- `lf_slope_meaning`
- `prompt_slope_mentor_v1`

Bad:

- `一次函数`
- `Slope Meaning`

## 5. Quality Gate

`quality.checklist_pass` may be `false` during production, but published units must have:

- no `blocking` or `high` open issues
- source trace present in every generated section
- runtime content blocks reference existing knowledge nodes and declare visibility scope
- interactive / animation / code blocks declare an active sandbox
- human reviewer notes recorded
- assessment confidence threshold defined

## 6. Validation

Run:

```powershell
pnpm --filter @edu-ai/shared-types test
pnpm run ci
```

The test file is:

- `packages/shared-types/tests/ai-native-unit.spec.ts`

It verifies:

- the Phase 2.1 sample unit passes schema validation
- missing `source_trace` fails
- non-machine-readable unit IDs fail
- runtime content blocks without source trace fail

Semantic validation additionally verifies:

- runtime page and block `target_nodes` resolve to known knowledge nodes
- restricted block visibility does not leak to student or guardian roles
- executable runtime blocks have sandbox protection

## 7. Future Extension Notes

These notes reserve the next design directions for AI-native curriculum units. They do not change the canonical `ai-native-unit-v0.1` machine schema yet.

Until the shared-types schema is explicitly upgraded, the fields below must not be written directly into source `unit.yaml`. They may appear in:

- curriculum import drafts
- review artifacts
- quality reviewer notes
- future-extension sections of import reports
- design docs

They become source fields only after schema, semantic validator, fixtures, and review gates are added.

### 7.1 `misconception_feedback_routes`

Purpose: model Oppia-style learner-centered branching, where a student's response can reveal a misconception and route to a targeted feedback path.

Future shape:

```yaml
misconception_feedback_routes:
  - route_id: route_k_b_confusion
    target_node_id: lf_slope_meaning
    misconception_id: misconception_k_b_swapped
    detection_signal: student treats b as slope or k as y-intercept
    feedback_strategy: ask the student to compare two functions with same b and different k
    retry_block_id: block_slope_retry_compare
    no_ai_followup_task_id: task_no_ai_k_b_explain
```

Rules:

- Routes must reference existing knowledge nodes and misconceptions.
- Feedback must ask the student to reason, not reveal the final answer immediately.
- Routes must produce evidence that can be summarized safely for teachers.
- Raw student responses must not be exposed to teacher or guardian views.

### 7.2 `classroom_action_plan`

Purpose: describe teacher-visible, controllable classroom actions inspired by OpenMAIC-style AI classroom orchestration.

Future shape:

```yaml
classroom_action_plan:
  - action_id: action_pause_for_peer_discussion
    phase: peer_discussion
    trigger: more than 30 percent of students show k/b confusion
    ai_action: pause individual tutoring and suggest pair explanation
    teacher_control: teacher_must_confirm
    evidence_created:
      - peer_explanation_summary
```

Rules:

- Teachers must be able to preview, pause, skip, or override classroom actions.
- Actions cannot directly trigger disciplinary or high-stakes decisions.
- Actions must not reveal raw private dialogue.
- Any action affecting a student individually must have auditability and a safe reason code.

### 7.3 `voice_script`

Purpose: reserve voice-first learning interactions for the realtime voice companion spike.

Future shape:

```yaml
voice_script:
  - voice_script_id: voice_slope_oral_explain
    target_node_id: lf_slope_meaning
    mode: oral_explanation
    opening_prompt: 用你自己的话说说 k 变大时图像会怎样。
    barge_in_allowed: true
    transcript_retention: none_by_default
    privacy_route: academic
    no_ai_boundary: final oral explanation should be completed without AI prompting
```

Rules:

- Voice scripts are suggestions until `VOICE_RUNTIME_SPIKE_SPEC.md` is implemented.
- Raw audio and full transcripts are not stored by default.
- Sensitive utterances route to `campus_local_only`.
- Teacher projections may include oral quality bands, not raw audio or transcript.

### 7.4 `whiteboard_action_plan`

Purpose: describe visual/whiteboard actions such as drawing, annotating, dragging, highlighting, graph manipulation, or student board work.

Future shape:

```yaml
whiteboard_action_plan:
  - whiteboard_action_id: wb_change_k
    target_node_id: lf_slope_meaning
    action_type: graph_parameter_drag
    student_action: drag k from negative to positive
    ai_prompt: 观察图像方向发生了什么变化。
    teacher_checkpoint: ask one student to explain without AI
    sandbox_required: true
```

Rules:

- Dynamic or executable actions must declare sandbox requirements.
- Whiteboard actions must preserve student-first prediction before AI explanation.
- Teacher must be able to pause or take over.
- Any captured student work must be classified by privacy level.

### 7.5 `pbl_issueboard`

Purpose: support project-based learning issue boards where students investigate, propose, debate, and revise solutions.

Future shape:

```yaml
pbl_issueboard:
  board_id: pbl_school_bus_pricing
  driving_question: 如何设计一个公平的校车收费方案？
  issues:
    - issue_id: issue_fixed_vs_variable_cost
      target_nodes:
        - lf_slope_meaning
      student_role: pricing analyst
      evidence_required:
        - graph_explanation
        - no_ai_written_argument
```

Rules:

- PBL boards must connect back to knowledge nodes.
- Student artifacts must be evidence, not just chat transcripts.
- Peer comparison and ranking must not be exposed by default.
- Family or personal context must not be used as PBL data.

### 7.6 `learning_task_evidence_plan`

Purpose: replace old "homework/test" thinking with learning tasks and capability certifications.

Future shape:

```yaml
learning_task_evidence_plan:
  tasks:
    - task_id: task_no_ai_k_explain
      task_type: no_ai_baseline_task
      target_nodes:
        - lf_slope_meaning
      evidence_required:
        - handwritten_explanation
        - oral_explanation_summary
      ai_allowed: false
  certifications:
    - certification_id: cert_transfer_slope
      certification_type: transfer_challenge
      pass_criteria:
        - explains slope in a new context
        - distinguishes k and b without AI help
```

Rules:

- Every core learning goal needs no-AI evidence.
- AI-assisted evidence and no-AI evidence must remain distinguishable.
- Capability certification should produce evidence, not only score.
- Teacher-visible summaries must not include raw private content.

### 7.7 `content_package_manifest`

Purpose: reserve the offline/campus distribution contract defined in `EXTERNAL_STANDARDS_ADAPTER_SPEC.md`.

Future shape:

```yaml
content_package_manifest:
  manifest_id: pkg_math_g8_linear_function_intro_v1
  package_type: unit
  offline_policy:
    can_run_offline: true
    fallback_mode: teacher_led
  assets:
    - asset_id: worksheet_k_b_no_ai
      asset_type: worksheet_pdf
      contains_personal_data: false
```

Rules:

- The manifest is a distribution artifact, not the authoring source.
- It must be generated from an approved unit and asset set.
- It must not contain real student data.
- Unknown-license assets block package approval.

## 8. Extension Promotion Gate

A future extension can move from "note" to "schema field" only when all of the following are true:

1. The use case appears in at least one curriculum import draft or unit design.
2. A shared-types schema is proposed.
3. Positive and negative fixtures exist.
4. Semantic validation rules are defined.
5. Privacy and visibility behavior is explicit.
6. Review artifacts preserve blocked/needs-review states.
7. Source writeback requires explicit approval.
8. `pnpm --filter @edu-ai/shared-types test` passes.
9. `pnpm --filter @edu-ai/content-pipeline test` passes if pipeline behavior changes.
10. `pnpm run ci` passes before lock.
