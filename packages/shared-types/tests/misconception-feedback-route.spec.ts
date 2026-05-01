import { describe, expect, it } from "vitest";

import {
  MisconceptionFeedbackRouteSchema,
  type MisconceptionFeedbackRoute,
  type UnitSourceTrace
} from "../src";

const sourceTrace: UnitSourceTrace = {
  source_id: "textbook_linear_function",
  source_type: "textbook",
  reference: "Synthetic misconception route fixture for 一次函数概念.",
  retrieved_at: "2026-04-26T15:40:00.000Z"
};

function buildRoute(): MisconceptionFeedbackRoute {
  return {
    route_id: "route_k_b_confusion",
    schema_version: "edu-ai-misconception-route-v0.1",
    unit_id: "math_g8_linear_function_intro",
    target_node_id: "lf_slope_meaning",
    misconception_id: "misconception_lf_slope_meaning_0",
    source_block_id: "block_slope_direction_prompt",
    detection: {
      detection_signal: "free_text_pattern",
      pattern_description: "Student treats the intercept as the changing rate.",
      confidence_threshold: 0.72,
      low_confidence_behavior: "ask_clarifying_question"
    },
    feedback: {
      feedback_strategy: "contrast_cases",
      student_facing_prompt: "先比较两条截距相同但变化快慢不同的直线。你看到什么变了？",
      reveal_policy: "do_not_reveal_answer_first",
      max_ai_hints: 2
    },
    retry: {
      retry_block_id: "block_slope_quick_check",
      retry_prompt: "重新说一遍：变化快慢由哪个量决定？",
      no_ai_followup_task_id: "item_slope_direction",
      max_retry_count: 2,
      after_max_retry: "teacher_safe_signal"
    },
    evidence: {
      evidence_ids: ["evidence_k_b_retry_summary"],
      evidence_types: ["short_explanation", "no_ai_output"],
      mastery_update_allowed: true,
      minimum_confidence_for_mastery_update: 0.8
    },
    teacher_signal: {
      signal_type: "misconception_cluster",
      visible_summary_template: "部分学生混淆变化率和截距，建议用对照图再讲一次。",
      blocked_raw_fields: ["raw_dialogue", "raw_response", "voice_transcript"],
      suggested_intervention_level: "L2"
    },
    privacy: {
      student_visible: true,
      teacher_visible: true,
      guardian_visible: false,
      raw_response_retention: "student_owned_only",
      teacher_raw_response_access: "denied",
      guardian_raw_response_access: "denied"
    },
    source_trace: [sourceTrace]
  };
}

describe("misconception feedback route schema", () => {
  it("accepts a teacher-safe synthetic misconception route", () => {
    expect(MisconceptionFeedbackRouteSchema.safeParse(buildRoute()).success).toBe(true);
  });

  it("rejects teacher signals that do not block raw transcript fields", () => {
    const route = buildRoute();
    route.teacher_signal.blocked_raw_fields = ["raw_dialogue"];

    const result = MisconceptionFeedbackRouteSchema.safeParse(route);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "teacher_signal.blocked_raw_fields must include raw_response"
      );
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "teacher_signal.blocked_raw_fields must include voice_transcript"
      );
    }
  });

  it("rejects guardian-visible misconception drilldown", () => {
    const route = buildRoute();
    route.privacy.guardian_visible = true as false;

    expect(MisconceptionFeedbackRouteSchema.safeParse(route).success).toBe(false);
  });

  it("rejects no-AI max-retry routing without an explicit no-AI follow-up task", () => {
    const route = buildRoute();
    route.retry.after_max_retry = "no_ai_task";
    delete route.retry.no_ai_followup_task_id;

    const result = MisconceptionFeedbackRouteSchema.safeParse(route);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "after_max_retry=no_ai_task requires retry.no_ai_followup_task_id"
      );
    }
  });

  it("rejects mastery update thresholds lower than the detection threshold", () => {
    const route = buildRoute();
    route.evidence.minimum_confidence_for_mastery_update = 0.5;

    const result = MisconceptionFeedbackRouteSchema.safeParse(route);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "mastery updates require evidence confidence at least as high as the detection threshold"
      );
      expect(result.error.issues.map((issue) => issue.message)).toContain("mastery updates require minimum confidence >= 0.7");
    }
  });
});
