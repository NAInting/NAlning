import { resolve } from "node:path";

import { describe, expect, it } from "vitest";
import type { MisconceptionFeedbackRoute, UnitSourceTrace } from "@edu-ai/shared-types";

import { listKnownMisconceptionIds, loadUnitSpecFromFile, validateMisconceptionFeedbackRoutes } from "../src";

const sampleUnitPath = resolve(process.cwd(), "../../content/units/math-g8-s1-linear-function-concept/unit.yaml");

const sourceTrace: UnitSourceTrace = {
  source_id: "runtime-content-block-spec-draft",
  source_type: "agent_output",
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
      pattern_description: "Student treats b as slope or k as y-intercept.",
      confidence_threshold: 0.72,
      low_confidence_behavior: "ask_clarifying_question"
    },
    feedback: {
      feedback_strategy: "contrast_cases",
      student_facing_prompt: "先比较两条 b 相同但 k 不同的直线，哪一条变化更快？",
      reveal_policy: "do_not_reveal_answer_first",
      max_ai_hints: 2
    },
    retry: {
      retry_block_id: "block_slope_quick_check",
      retry_prompt: "重新说一遍：k 变了，图像的什么变了？",
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
      visible_summary_template: "部分学生把 k 与 b 的作用混淆，建议用同 b 不同 k 的对照图再讲一次。",
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

describe("misconception feedback route semantic validation", () => {
  it("passes a synthetic route that references known nodes, blocks, and assessment evidence", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const result = validateMisconceptionFeedbackRoutes(unit, [buildRoute()]);

    expect(result).toMatchObject({
      passed: true,
      error_count: 0
    });
  });

  it("derives stable misconception ids from current UnitSpec text arrays without changing source schema", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);

    expect(listKnownMisconceptionIds(unit)).toContain("misconception_lf_slope_meaning_0");
    expect(listKnownMisconceptionIds(unit)).toContain("misconception_global_0");
  });

  it("blocks routes that reference unknown knowledge nodes", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.target_node_id = "missing_node";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "unknown_route_target_node" }));
  });

  it("blocks routes that reference unknown derived misconception ids", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.misconception_id = "misconception_k_b_swapped";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "unknown_misconception_id" }));
  });

  it("blocks routes that reference missing retry blocks", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.retry.retry_block_id = "missing_retry_block";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "unknown_retry_block" }));
  });

  it("blocks no-AI follow-up tasks that target a different knowledge node", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    unit.knowledge.nodes.push({
      node_id: "lf_intercept_meaning",
      title: "y 截距 b 的意义",
      mastery_criteria: ["能说明 b 决定图像与 y 轴的交点。"],
      misconceptions: [],
      difficulty: 2
    });
    unit.assessment.items[0] = {
      ...unit.assessment.items[0]!,
      target_nodes: ["lf_intercept_meaning"]
    };

    const result = validateMisconceptionFeedbackRoutes(unit, [buildRoute()]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "no_ai_followup_target_node_mismatch" }));
  });

  it("blocks detection signals that cannot be produced by the source block type", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.detection.detection_signal = "selected_wrong_option";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "detection_signal_source_block_type_mismatch" }));
  });

  it("blocks detection signals that cannot be supported by the evidence type", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.source_block_id = "block_slope_quick_check";
    route.detection.detection_signal = "selected_wrong_option";
    route.evidence.evidence_types = ["short_explanation"];

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "detection_signal_evidence_type_mismatch" }));
  });

  it("blocks oral explanation routes that do not explicitly deny teacher voice audio access", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.detection.detection_signal = "oral_explanation_pattern";
    route.evidence.evidence_types = ["oral_summary", "no_ai_output"];

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "oral_route_missing_voice_audio_block" }));
  });

  it("requires exact voice_audio block for oral explanation routes", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.detection.detection_signal = "oral_explanation_pattern";
    route.evidence.evidence_types = ["oral_summary", "no_ai_output"];
    route.teacher_signal.blocked_raw_fields = [...route.teacher_signal.blocked_raw_fields, "voice_audio_summary"];

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "oral_route_missing_voice_audio_block" }));
  });

  it("accepts oral explanation routes when teacher-safe signals block voice audio", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.detection.detection_signal = "oral_explanation_pattern";
    route.evidence.evidence_types = ["oral_summary", "no_ai_output"];
    route.teacher_signal.blocked_raw_fields = [...route.teacher_signal.blocked_raw_fields, "voice_audio"];

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(true);
    expect(result.error_count).toBe(0);
  });

  it("blocks ambiguous blocked raw fields that imply export or visibility", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.teacher_signal.blocked_raw_fields = [...route.teacher_signal.blocked_raw_fields, "voiceTranscriptExport"];

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "unsafe_teacher_signal_blocked_raw_field" }));
  });

  it("requires exact canonical teacher-safe blocked raw fields", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.teacher_signal.blocked_raw_fields = ["raw_dialogue_placeholder", "raw_response", "voice_transcript"];

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "invalid_misconception_route_shape",
        message: expect.stringContaining("teacher_signal.blocked_raw_fields must include raw_dialogue")
      })
    );
  });

  it("blocks Chinese blocked raw field aliases that imply teacher access", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.teacher_signal.blocked_raw_fields = [
      ...route.teacher_signal.blocked_raw_fields,
      "\u5141\u8bb8\u6559\u5e08\u67e5\u770b\u539f\u59cb\u5bf9\u8bdd"
    ];

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "unsafe_teacher_signal_blocked_raw_field" }));
  });

  it("blocks no-AI max-retry routes without an explicit no-AI follow-up task", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.retry.after_max_retry = "no_ai_task";
    delete route.retry.no_ai_followup_task_id;

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "invalid_misconception_route_shape",
        message: expect.stringContaining("after_max_retry=no_ai_task requires retry.no_ai_followup_task_id")
      })
    );
  });

  it("accepts selected-choice evidence for selected wrong option detection", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.source_block_id = "block_slope_quick_check";
    route.detection.detection_signal = "selected_wrong_option";
    route.evidence.evidence_types = ["selected_choice", "no_ai_output"];

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(true);
    expect(result.error_count).toBe(0);
  });

  it("blocks teacher-safe summaries that expose raw dialogue details", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.teacher_signal.visible_summary_template = "老师可以查看原始对话来判断学生哪里错了。";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "teacher_signal_raw_content_leak" }));
  });

  it("blocks teacher-safe summaries that quote exact student responses by euphemism", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.teacher_signal.visible_summary_template = "Student said the exact response incorrectly; show the teacher the verbatim answer.";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "teacher_signal_raw_content_leak" }));
  });

  it("blocks teacher-safe summaries that expose complete student answers by euphemism", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.teacher_signal.visible_summary_template = "Show the teacher the complete student answer so they can inspect the original response.";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "teacher_signal_raw_content_leak" }));
  });

  it("blocks raw student content in misconception detection descriptions", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.detection.pattern_description = "Classify this route by inspecting the student's exact response and verbatim answer.";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "misconception_route_raw_content_leak",
        path: "routes[0].detection.pattern_description"
      })
    );
  });

  it("blocks raw voice transcript references in student retry prompts", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.retry.retry_prompt = "Replay the voice transcript, then retry the explanation.";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "misconception_route_raw_content_leak",
        path: "routes[0].retry.retry_prompt"
      })
    );
  });

  it("blocks guardian-visible misconception drilldown until a guardian-safe projection contract exists", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    const forgedRoute = {
      ...route,
      privacy: {
        ...route.privacy,
        guardian_visible: true
      }
    };

    const result = validateMisconceptionFeedbackRoutes(unit, [forgedRoute]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "invalid_misconception_route_shape",
        path: "0.privacy.guardian_visible",
        message: expect.stringContaining("expected false")
      })
    );
  });

  it("blocks answer-first feedback unless teacher-mediated", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.feedback.student_facing_prompt = "正确答案是 k 决定变化快慢，你记住就行。";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "answer_first_prompt_requires_teacher_mediated_review" })
    );
  });

  it("blocks emotional or family safety content from staying in misconception routes", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.detection.pattern_description = "学生提到家暴后无法解释题目。";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "safety_sensitive_content_in_misconception_route" })
    );
  });

  it("blocks teacher-safe summaries that expose normal Chinese raw-response wording", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.teacher_signal.visible_summary_template = "教师可查看学生原话和完整转写，判断这名学生哪里错了。";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "teacher_signal_raw_content_leak" }));
  });

  it("blocks normal Chinese answer-first feedback unless teacher-mediated", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.feedback.student_facing_prompt = "正确答案是 k 决定变化快慢，先记住就行。";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "answer_first_prompt_requires_teacher_mediated_review" })
    );
  });

  it("blocks normal Chinese family or safety content from staying in misconception routes", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.detection.pattern_description = "学生提到家庭冲突和情绪原文后无法解释题目。";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "safety_sensitive_content_in_misconception_route" })
    );
  });

  it("blocks UTF-8 Chinese raw-response wording in teacher-safe summaries", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.teacher_signal.visible_summary_template = "教师可查看学生原话和完整转写，判断这名学生哪里错了。";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "teacher_signal_raw_content_leak" }));
  });

  it("blocks UTF-8 Chinese answer-first feedback unless teacher-mediated", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.feedback.student_facing_prompt = "正确答案是 k 决定变化快慢，先记住就行。";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "answer_first_prompt_requires_teacher_mediated_review" })
    );
  });

  it("blocks UTF-8 Chinese family or safety content from staying in misconception routes", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.detection.pattern_description = "学生提到家庭冲突和情绪原文后无法解释题目。";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "safety_sensitive_content_in_misconception_route" })
    );
  });

  it("blocks actual UTF-8 Chinese raw-response wording in teacher-safe summaries", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.teacher_signal.visible_summary_template =
      "\u6559\u5e08\u53ef\u4ee5\u67e5\u770b\u5b66\u751f\u539f\u8bdd\u548c\u5b8c\u6574\u8f6c\u5199\uff0c\u5224\u65ad\u8fd9\u540d\u5b66\u751f\u54ea\u91cc\u9519\u4e86\u3002";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "teacher_signal_raw_content_leak" }));
  });

  it("blocks actual UTF-8 Chinese raw-answer euphemisms in teacher-safe summaries", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.teacher_signal.visible_summary_template =
      "\u6559\u5e08\u53ef\u4ee5\u67e5\u770b\u5b66\u751f\u5b8c\u6574\u4f5c\u7b54\u548c\u4f5c\u7b54\u539f\u6587\u3002";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "teacher_signal_raw_content_leak" }));
  });

  it("blocks actual UTF-8 Chinese answer-first feedback unless teacher-mediated", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.feedback.student_facing_prompt =
      "\u6b63\u786e\u7b54\u6848\u662f k \u51b3\u5b9a\u53d8\u5316\u5feb\u6162\uff0c\u5148\u8bb0\u4f4f\u5c31\u884c\u3002";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "answer_first_prompt_requires_teacher_mediated_review" })
    );
  });

  it("blocks actual UTF-8 Chinese family or safety content from staying in misconception routes", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.detection.pattern_description =
      "\u5b66\u751f\u63d0\u5230\u5bb6\u5ead\u51b2\u7a81\u548c\u60c5\u7eea\u539f\u6587\u540e\u65e0\u6cd5\u89e3\u91ca\u9898\u76ee\u3002";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "safety_sensitive_content_in_misconception_route" })
    );
  });

  it("blocks actual UTF-8 Chinese automatic punishment or ranking from misconception routes", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.teacher_signal.visible_summary_template =
      "\u5982\u679c\u5b66\u751f\u518d\u6b21\u6df7\u6dc6 k \u548c b\uff0c\u7cfb\u7edf\u81ea\u52a8\u6263\u5206\u5e76\u901a\u62a5\u6392\u540d\u3002";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "disciplinary_automation_in_misconception_route" })
    );
  });

  it("blocks route source traces that include raw provider output", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.source_trace[0] = {
      ...route.source_trace[0]!,
      reference: "Synthetic route drafted from raw provider output and provider prompt."
    };

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "unsafe_route_source_trace_reference" }));
  });

  it("blocks route source traces that are not defined in the target UnitSpec", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.source_trace[0] = {
      ...route.source_trace[0]!,
      source_id: "external_unreviewed_route_source"
    };

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "unknown_route_source_trace" }));
  });

  it("blocks route source traces that include raw student answer details", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.source_trace[0] = {
      ...route.source_trace[0]!,
      reference: "Synthetic route copied from the complete student answer and voice transcript."
    };

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "unsafe_route_source_trace_reference" }));
  });

  it("blocks automatic punishment or ranking from misconception routes", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.teacher_signal.visible_summary_template = "如果学生再次混淆 k 和 b，系统自动扣分并通报排名。";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: "disciplinary_automation_in_misconception_route" })
    );
  });

  it("warns but does not fail when a route suggests L4/L5 and requires confirmation", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const route = buildRoute();
    route.teacher_signal.suggested_intervention_level = "L4";

    const result = validateMisconceptionFeedbackRoutes(unit, [route]);

    expect(result.passed).toBe(true);
    expect(result.warning_count).toBe(1);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "high_level_intervention_requires_confirmation" }));
  });
});
