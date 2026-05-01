import { randomUUID } from "node:crypto";

import {
  AgentMode,
  MasteryLevel,
  UserRole,
  type MasteryRecord
} from "@edu-ai/shared-types";
import { describe, expect, it } from "vitest";

import { buildDialogueModePlan } from "../src";

const studentId = "11111111-1111-4111-8111-111111111111";
const nodeId = "33333333-3333-4333-8333-333333333333";
const nowIso = "2026-04-22T10:00:00.000Z";

describe("dialogue mode planner", () => {
  it("defaults concept questions to Mentor mode with a Socratic contract", () => {
    const plan = buildDialogueModePlan({
      student_message: "这题怎么做？我看不懂一次函数图像。",
      knowledge_node: {
        id: nodeId,
        title: "一次函数图像",
        mastery_criteria: "Can explain slope and intercept from a graph.",
        common_misconceptions: []
      }
    });

    expect(plan.mode).toBe(AgentMode.MENTOR);
    expect(plan.intent).toBe("concept_question");
    expect(plan.answer_policy).toBe("socratic_prompt");
    expect(plan.response_moves).toContain("ask one focused Socratic question");
    expect(plan.must_not).toContain("do not give the final answer before the student attempts the next step");
    expect(plan.safe_context.knowledge_node_id).toBe(nodeId);
  });

  it("uses Tutor mode for direct explanation requests and still requires a check question", () => {
    const plan = buildDialogueModePlan({
      student_message: "我只想知道为什么 b 变大图像会上移。",
      requested_mode: AgentMode.TUTOR
    });

    expect(plan.mode).toBe(AgentMode.TUTOR);
    expect(plan.intent).toBe("direct_explanation_request");
    expect(plan.answer_policy).toBe("clear_explanation_with_check");
    expect(plan.response_moves).toContain("give a concise explanation");
    expect(plan.response_moves).toContain("ask one small check question");
    expect(plan.must_not).not.toContain("do not provide a submittable homework answer");
  });

  it("refuses submittable answer requests while offering an alternative path", () => {
    const plan = buildDialogueModePlan({
      student_message: "直接给答案，我要可提交答案。",
      requested_mode: AgentMode.TUTOR
    });

    expect(plan.mode).toBe(AgentMode.TUTOR);
    expect(plan.intent).toBe("submittable_answer_request");
    expect(plan.answer_policy).toBe("boundary_refusal_with_alternative");
    expect(plan.must_not).toContain("do not provide a submittable homework answer");
    expect(plan.response_moves).toEqual([
      "acknowledge the student's desire for speed",
      "state the boundary against submittable answers",
      "offer a first step, hint, or parallel example"
    ]);
  });

  it("offers clearer hints after repeated Mentor-mode stuck attempts", () => {
    const plan = buildDialogueModePlan({
      student_message: "还是不会。",
      current_mode: AgentMode.MENTOR,
      stuck_count: 3
    });

    expect(plan.mode).toBe(AgentMode.MENTOR);
    expect(plan.should_offer_hint).toBe(true);
  });

  it("only includes mastery context when all student visibility gates pass", () => {
    const visiblePlan = buildDialogueModePlan({
      student_message: "这题怎么想？",
      mastery_record: masteryRecord({ visible: true, acceptable: true })
    });

    const blockedPlan = buildDialogueModePlan({
      student_message: "这题怎么想？",
      mastery_record: masteryRecord({ visible: false, acceptable: false })
    });

    expect(visiblePlan.safe_context.mastery_summary).toContain(`node=${nodeId}`);
    expect(blockedPlan.safe_context.mastery_summary).toBeUndefined();
    expect(blockedPlan.blocked_context_reasons).toContain("mastery record is blocked by visibility or confidence gates");
  });

  it("blocks emotional memory from normal prompt context and marks frustration for local handling", () => {
    const plan = buildDialogueModePlan({
      student_message: "烦死了，我不想学了。",
      memory_context: [
        { bucket: "academic", summary: "Needs more graph-to-expression practice." },
        { bucket: "emotional", summary: "Raw emotional summary must not enter the prompt." },
        { bucket: "personal", summary: "Prefers sports examples." }
      ]
    });

    expect(plan.mode).toBe(AgentMode.COMPANION);
    expect(plan.intent).toBe("frustration");
    expect(plan.answer_policy).toBe("support_and_shrink_task");
    expect(plan.safe_context.memory_summaries).toEqual([
      "Needs more graph-to-expression practice.",
      "Prefers sports examples."
    ]);
    expect(plan.blocked_context_reasons).toContain("emotional memory is not allowed in normal dialogue prompt context");
    expect(plan.privacy_flags.must_use_campus_local).toBe(true);
    expect(plan.privacy_flags.expose_raw_memory).toBe(false);
    expect(plan.privacy_flags.expose_reasoning_chain).toBe(false);
  });
});

function masteryRecord(input: { visible: boolean; acceptable: boolean }): MasteryRecord {
  return {
    id: randomUUID(),
    created_at: nowIso,
    updated_at: nowIso,
    version: 1,
    student_id: studentId,
    knowledge_node_id: nodeId,
    current_mastery: 0.78,
    current_level: MasteryLevel.PROFICIENT,
    confidence: input.acceptable ? 0.82 : 0.52,
    evidence_count: input.acceptable ? 3 : 1,
    last_evidence_at: nowIso,
    last_activated_at: nowIso,
    decay_factor: 0,
    next_review_recommended_at: "2026-04-26T10:00:00.000Z",
    is_visible_to_student: input.visible,
    is_acceptable_to_record: input.acceptable,
    visibility_scope: {
      visible_to_roles: input.visible ? [UserRole.STUDENT, UserRole.TEACHER] : [UserRole.SYSTEM]
    },
    ai_generated: {
      value: 0.78,
      confidence: input.acceptable ? 0.82 : 0.52,
      model_version: "rule-based-test",
      prompt_version: "test",
      generated_at: nowIso,
      human_reviewed: false
    }
  };
}
