import { resolve } from "node:path";

import { describe, expect, it } from "vitest";
import type { ClassroomActionPlan, UnitSourceTrace } from "@edu-ai/shared-types";

import { loadUnitSpecFromFile, validateClassroomActionPlans } from "../src";

const sampleUnitPath = resolve(process.cwd(), "../../content/units/math-g8-s1-linear-function-concept/unit.yaml");

const sourceTrace: UnitSourceTrace = {
  source_id: "runtime-content-block-spec-draft",
  source_type: "agent_output",
  reference: "Synthetic classroom action plan fixture inspired by classroom orchestration patterns.",
  retrieved_at: "2026-04-26T15:58:00.000Z"
};

function buildPlan(): ClassroomActionPlan {
  return {
    schema_version: "edu-ai-classroom-action-plan-v0.1",
    plan_id: "cap_math_g8_linear_function_intro_lesson1",
    unit_id: "math_g8_linear_function_intro",
    lesson_duration_min: 45,
    teacher_control_policy: {
      default_mode: "teacher_preview_then_auto_advance",
      teacher_can_pause: true,
      teacher_can_skip: true,
      teacher_can_override: true,
      student_individual_action_requires_confirmation: true
    },
    actions: [
      {
        action_id: "action_open_graph_prediction",
        start_min: 5,
        end_min: 10,
        phase: "block_focus",
        trigger: {
          trigger_type: "time",
          trigger_description: "After teacher frames the taxi fare scenario.",
          auto_start_allowed: false
        },
        teacher_action: "Ask students to predict how the graph changes before using AI.",
        student_action: "Write one prediction without AI.",
        ai_action: "Show two lines with same b and different k, then ask contrast question.",
        target_page_id: "page_slope_first_look",
        target_block_ids: ["block_slope_direction_prompt"],
        target_knowledge_node_ids: ["lf_slope_meaning"],
        runtime_event_suggestions: [
          {
            event_type: "progress",
            domain: "academic",
            privacy_level: "academic",
            safe_summary: "Class completed first slope prediction block."
          }
        ],
        teacher_checkpoint: {
          checkpoint_type: "collect_no_ai_evidence",
          teacher_prompt: "Pick one student to explain k without AI.",
          evidence_to_review: ["prediction_text"],
          decision_required: false
        },
        safety: {
          visibility_scope: "classroom",
          forbidden_payloads: ["raw_dialogue", "voice_transcript", "emotion_or_personal", "family_context"],
          high_stakes_decision_allowed: false,
          audit_required: true
        }
      }
    ],
    evidence_plan: {
      evidence_ids: ["evidence_first_prediction"],
      evidence_types: ["student_prediction", "no_ai_output"],
      mastery_update_allowed: false,
      teacher_dashboard_projection: ["class-level k/b confusion signal"]
    },
    fallback_plan: {
      provider_unavailable: "teacher_led",
      network_unavailable: "printed_material",
      voice_unavailable: "text_or_teacher_read",
      whiteboard_unavailable: "static_diagram_or_teacher_draw"
    },
    source_trace: [sourceTrace]
  };
}

describe("classroom action plan semantic validation", () => {
  it("passes a teacher-controllable plan that references known runtime content", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const result = validateClassroomActionPlans(unit, [buildPlan()]);

    expect(result).toMatchObject({
      passed: true,
      error_count: 0
    });
  });

  it("blocks plans that target unknown blocks", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.target_block_ids = ["missing_block"];

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "unknown_action_target_block" }));
  });

  it("blocks action block/page mismatches", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.target_page_id = "missing_page";

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "unknown_target_page" }));
  });

  it("blocks individual student-scoped actions that auto-start", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.safety.visibility_scope = "student";
    plan.actions[0]!.trigger.auto_start_allowed = true;

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "individual_action_auto_start_without_confirmation" }));
  });

  it("blocks individual student-scoped actions without an audit trail", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.safety.visibility_scope = "student";
    plan.actions[0]!.safety.audit_required = false;

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "individual_action_without_audit" }));
  });

  it("blocks auto-start actions when the classroom plan is teacher-led only", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.teacher_control_policy.default_mode = "teacher_led_only";
    plan.actions[0]!.trigger.auto_start_allowed = true;

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "teacher_led_action_auto_start" }));
  });

  it("blocks manual classroom triggers that also claim auto-start", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.trigger.trigger_type = "teacher_manual";
    plan.actions[0]!.trigger.auto_start_allowed = true;

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "manual_trigger_auto_start" }));
  });

  it("blocks intervention checkpoints that do not require an explicit teacher decision", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.teacher_checkpoint.checkpoint_type = "decide_intervention";
    plan.actions[0]!.teacher_checkpoint.decision_required = false;

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "intervention_checkpoint_without_teacher_decision" }));
  });

  it("blocks ambiguous forbidden payloads that imply export or visibility", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.safety.forbidden_payloads = [
      ...plan.actions[0]!.safety.forbidden_payloads,
      "voiceTranscriptExport"
    ];

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "unsafe_action_forbidden_payload" }));
  });

  it("blocks Chinese forbidden payload aliases that imply teacher access", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.safety.forbidden_payloads = [
      ...plan.actions[0]!.safety.forbidden_payloads,
      "\u5141\u8bb8\u6559\u5e08\u67e5\u770b\u539f\u59cb\u8bed\u97f3"
    ];

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "unsafe_action_forbidden_payload" }));
  });

  it("blocks classroom actions that do not explicitly deny family-context payloads", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.safety.forbidden_payloads = ["raw_dialogue", "voice_transcript", "emotion_or_personal"];

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "invalid_classroom_action_plan_shape",
        message: expect.stringContaining("family_context")
      })
    );
  });

  it("blocks raw dialogue or voice leakage in classroom actions", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.ai_action = "Show the teacher the raw dialogue before the next question.";

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "classroom_action_raw_content_leak" }));
  });

  it("blocks original student-answer euphemisms in classroom actions", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.teacher_action = "Show the teacher the complete student answer before the next classroom move.";

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "classroom_action_raw_content_leak" }));
  });

  it("blocks raw content leakage in classroom trigger descriptions", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.trigger.trigger_description = "Start this action after reviewing the student's raw transcript.";

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "classroom_action_raw_content_leak" }));
  });

  it("blocks raw content leakage in teacher checkpoint prompts and evidence references", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.teacher_checkpoint.teacher_prompt = "Ask the teacher to inspect the complete student answer.";
    plan.actions[0]!.teacher_checkpoint.evidence_to_review = ["voice_transcript"];

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "classroom_action_raw_content_leak" }));
  });

  it("blocks normal Chinese raw dialogue or voice leakage in classroom actions", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.ai_action = "展示学生原话和语音回放，再进入下一问。";

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "classroom_action_raw_content_leak" }));
  });

  it("blocks raw dialogue or voice leakage in classroom runtime event summaries", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.runtime_event_suggestions[0] = {
      ...plan.actions[0]!.runtime_event_suggestions[0]!,
      safe_summary: "Teacher can inspect the raw transcript from this action."
    };

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "runtime_event_safe_summary_raw_content_leak" }));
  });

  it("blocks normal Chinese raw dialogue or voice leakage in runtime event summaries", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.runtime_event_suggestions[0] = {
      ...plan.actions[0]!.runtime_event_suggestions[0]!,
      safe_summary: "教师可以查看完整转写和音频回放。"
    };

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "runtime_event_safe_summary_raw_content_leak" }));
  });

  it("blocks raw dialogue or voice leakage in teacher dashboard projections", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.evidence_plan.teacher_dashboard_projection = ["Teacher can inspect each student's raw transcript for this classroom action."];

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "teacher_dashboard_projection_raw_content_leak" }));
  });

  it("blocks original student-answer euphemisms in teacher dashboard projections", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.evidence_plan.teacher_dashboard_projection = ["Teacher can inspect each student's original response for this classroom action."];

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "teacher_dashboard_projection_raw_content_leak" }));
  });

  it("blocks normal Chinese raw or family details in teacher dashboard projections", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.evidence_plan.teacher_dashboard_projection = ["教师可查看家庭冲突细节与学生逐字回答。"];

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "teacher_dashboard_projection_raw_content_leak" }));
  });

  it("blocks emotion-domain runtime events that are not campus-local only", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.runtime_event_suggestions[0] = {
      event_type: "progress",
      domain: "emotion",
      privacy_level: "student_sensitive",
      safe_summary: "Student sentiment marker was detected during class."
    };

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "invalid_classroom_action_plan_shape",
        message: expect.stringContaining("emotion-domain classroom runtime events must be campus_local_only")
      })
    );
  });

  it("accepts emotion-domain runtime events when they are campus-local only", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.runtime_event_suggestions[0] = {
      event_type: "progress",
      domain: "emotion",
      privacy_level: "campus_local_only",
      safe_summary: "Campus-local support marker was detected during class."
    };

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(true);
    expect(result.error_count).toBe(0);
  });

  it("blocks automated discipline wording", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.teacher_checkpoint.teacher_prompt = "If students fail, automatically punish them.";

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "classroom_action_disciplinary_automation" }));
  });

  it("blocks normal Chinese automated discipline wording", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.teacher_checkpoint.teacher_prompt = "如果学生没有完成，系统自动处罚。";

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "classroom_action_disciplinary_automation" }));
  });

  it("blocks UTF-8 Chinese raw dialogue or voice leakage in classroom actions", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.ai_action = "展示学生原话和语音回放，再进入下一个问题。";

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "classroom_action_raw_content_leak" }));
  });

  it("blocks UTF-8 Chinese raw or family details in teacher dashboard projections", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.evidence_plan.teacher_dashboard_projection = ["教师可查看家庭冲突细节与学生逐字回答。"];

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "teacher_dashboard_projection_raw_content_leak" }));
  });

  it("blocks UTF-8 Chinese automated discipline, score penalty, or ranking wording", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.teacher_checkpoint.teacher_prompt = "如果学生没有完成，系统自动扣分并通报排名。";

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "classroom_action_disciplinary_automation" }));
  });

  it("blocks actual UTF-8 Chinese raw dialogue or voice leakage in classroom actions", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.ai_action =
      "\u5c55\u793a\u5b66\u751f\u539f\u8bdd\u548c\u8bed\u97f3\u56de\u653e\uff0c\u518d\u8fdb\u5165\u4e0b\u4e00\u4e2a\u95ee\u9898\u3002";

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "classroom_action_raw_content_leak" }));
  });

  it("blocks actual UTF-8 Chinese original-answer euphemisms in classroom actions", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.ai_action =
      "\u5c55\u793a\u5b66\u751f\u5b8c\u6574\u4f5c\u7b54\u548c\u4f5c\u7b54\u539f\u6587\uff0c\u518d\u8fdb\u5165\u4e0b\u4e00\u4e2a\u95ee\u9898\u3002";

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "classroom_action_raw_content_leak" }));
  });

  it("blocks actual UTF-8 Chinese raw or family details in teacher dashboard projections", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.evidence_plan.teacher_dashboard_projection = [
      "\u6559\u5e08\u53ef\u67e5\u770b\u5bb6\u5ead\u51b2\u7a81\u7ec6\u8282\u4e0e\u5b66\u751f\u9010\u5b57\u56de\u7b54\u3002"
    ];

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "teacher_dashboard_projection_raw_content_leak" }));
  });

  it("blocks actual UTF-8 Chinese automated discipline, score penalty, or ranking wording", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.teacher_checkpoint.teacher_prompt =
      "\u5982\u679c\u5b66\u751f\u6ca1\u6709\u5b8c\u6210\uff0c\u7cfb\u7edf\u81ea\u52a8\u6263\u5206\u5e76\u901a\u62a5\u6392\u540d\u3002";

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "classroom_action_disciplinary_automation" }));
  });

  it("blocks plan source traces that include raw provider output", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.source_trace[0] = {
      ...plan.source_trace[0]!,
      reference: "Synthetic classroom plan derived from raw provider output and provider prompt."
    };

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "unsafe_classroom_plan_source_trace_reference" }));
  });

  it("blocks plan source traces that are not defined in the target UnitSpec", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.source_trace[0] = {
      ...plan.source_trace[0]!,
      source_id: "external_unreviewed_classroom_plan_source"
    };

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "unknown_classroom_plan_source_trace" }));
  });

  it("blocks plan source traces that include raw student answer details", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.source_trace[0] = {
      ...plan.source_trace[0]!,
      reference: "Synthetic classroom plan copied from the complete student answer and voice transcript."
    };

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "unsafe_classroom_plan_source_trace_reference" }));
  });

  it("blocks voice actions that do not deny raw voice audio", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.phase = "voice_exchange";
    plan.actions[0]!.safety.forbidden_payloads = ["raw_dialogue", "voice_transcript", "emotion_or_personal", "family_context"];

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "missing_action_forbidden_payload" }));
  });

  it("blocks future voice-turn suggestions that do not deny raw voice audio", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.runtime_event_suggestions = [
      {
        event_type: "future_voice_turn",
        domain: "runtime",
        privacy_level: "student_sensitive",
        safe_summary: "Student may answer this classroom prompt by voice."
      }
    ];
    plan.actions[0]!.safety.forbidden_payloads = ["raw_dialogue", "voice_transcript", "emotion_or_personal", "family_context"];

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "missing_action_forbidden_payload" }));
  });

  it("blocks voice exchange actions without a future voice-turn runtime suggestion", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.phase = "voice_exchange";
    plan.actions[0]!.safety.forbidden_payloads = ["raw_dialogue", "voice_audio", "voice_transcript", "emotion_or_personal", "family_context"];

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "missing_action_runtime_event_suggestion" }));
  });

  it("accepts voice exchange actions with explicit voice runtime mapping and privacy guard", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.phase = "voice_exchange";
    plan.actions[0]!.safety.forbidden_payloads = ["raw_dialogue", "voice_audio", "voice_transcript", "emotion_or_personal", "family_context"];
    plan.actions[0]!.runtime_event_suggestions = [
      {
        event_type: "future_voice_turn",
        domain: "runtime",
        privacy_level: "student_sensitive",
        safe_summary: "Student may answer this classroom prompt by voice."
      }
    ];

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(true);
    expect(result.error_count).toBe(0);
  });

  it("blocks PBL issue actions without a future PBL runtime suggestion", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.phase = "pbl_issue_open";

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "missing_action_runtime_event_suggestion" }));
  });

  it("warns when quiz/no-AI actions do not name evidence for teacher review", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.actions[0]!.phase = "quiz_prompt";
    plan.actions[0]!.teacher_checkpoint.evidence_to_review = [];

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(true);
    expect(result.warning_count).toBe(1);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "checkpoint_without_evidence_to_review" }));
  });

  it("blocks mastery updates without no-AI evidence", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const plan = buildPlan();
    plan.evidence_plan.mastery_update_allowed = true;
    plan.evidence_plan.evidence_types = ["student_prediction"];

    const result = validateClassroomActionPlans(unit, [plan]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "mastery_update_without_no_ai_evidence" }));
  });
});
