import { describe, expect, it } from "vitest";

import { ClassroomActionPlanSchema, type ClassroomActionPlan, type UnitSourceTrace } from "../src";

const sourceTrace: UnitSourceTrace = {
  source_id: "openmaic_inspired_classroom_plan",
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

describe("classroom action plan schema", () => {
  it("accepts a teacher-controllable synthetic classroom action plan", () => {
    expect(ClassroomActionPlanSchema.safeParse(buildPlan()).success).toBe(true);
  });

  it("rejects plans where teachers cannot override actions", () => {
    const plan = buildPlan();
    plan.teacher_control_policy.teacher_can_override = false as true;

    expect(ClassroomActionPlanSchema.safeParse(plan).success).toBe(false);
  });

  it("rejects high-stakes classroom actions", () => {
    const plan = buildPlan();
    plan.actions[0]!.safety.high_stakes_decision_allowed = true as false;

    expect(ClassroomActionPlanSchema.safeParse(plan).success).toBe(false);
  });

  it("rejects action ranges outside lesson duration", () => {
    const plan = buildPlan();
    plan.actions[0]!.end_min = 60;

    const result = ClassroomActionPlanSchema.safeParse(plan);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain("action end_min cannot exceed lesson_duration_min");
    }
  });

  it("rejects emotion runtime events that are not campus-local", () => {
    const plan = buildPlan();
    plan.actions[0]!.runtime_event_suggestions[0] = {
      event_type: "progress",
      domain: "emotion",
      privacy_level: "student_sensitive",
      safe_summary: "Emotion signal should not leave campus-local handling."
    };

    const result = ClassroomActionPlanSchema.safeParse(plan);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "emotion-domain classroom runtime events must be campus_local_only"
      );
    }
  });

  it("rejects safety sections that do not explicitly block raw transcript payloads", () => {
    const plan = buildPlan();
    plan.actions[0]!.safety.forbidden_payloads = ["raw_dialogue"];

    const result = ClassroomActionPlanSchema.safeParse(plan);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "classroom action safety.forbidden_payloads must include voice_transcript"
      );
    }
  });

  it("rejects safety sections that do not explicitly block family-context payloads", () => {
    const plan = buildPlan();
    plan.actions[0]!.safety.forbidden_payloads = ["raw_dialogue", "voice_transcript", "emotion_or_personal"];

    const result = ClassroomActionPlanSchema.safeParse(plan);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "classroom action safety.forbidden_payloads must include family_context"
      );
    }
  });
});
