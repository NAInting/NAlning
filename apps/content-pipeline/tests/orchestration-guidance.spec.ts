import { describe, expect, it } from "vitest";

import { deriveUnitReviewOrchestrationGuidance } from "../src/orchestration-guidance";

describe("review orchestration guidance", () => {
  it("routes ready artifacts to human approval", () => {
    const guidance = deriveUnitReviewOrchestrationGuidance({
      unit_id: "math_g8_linear_function_intro",
      artifact_status: "ready_for_human_review"
    });

    expect(guidance).toMatchObject({
      action: "notify_human_for_approval",
      requires_provider_execution: false,
      requires_human_decision: true,
      human_queue: "approval_queue",
      automation_step: "open_inbox_item",
      provider_execution_allowed_without_human: false,
      primary_human_action: "approve_review_artifact",
      inbox_title: "[Approval] math_g8_linear_function_intro",
      recommended_rerun_from: null,
      rerun_chain_depth: 0
    });
  });

  it("marks first blocked artifacts as scoped rerun preparation only", () => {
    const guidance = deriveUnitReviewOrchestrationGuidance({
      unit_id: "math_g8_linear_function_intro",
      artifact_status: "blocked",
      retry_policy: {
        decision: "allow_scoped_rerun",
        reason: "First blocked artifact in current scope.",
        recommended_rerun_from: "assessment_designer",
        recommended_rerun_roles: ["assessment_designer", "qa_agent"]
      }
    });

    expect(guidance).toMatchObject({
      action: "prepare_scoped_rerun",
      requires_provider_execution: true,
      requires_human_decision: true,
      human_queue: "rerun_decision_queue",
      automation_step: "open_inbox_item",
      provider_execution_allowed_without_human: false,
      primary_human_action: "decide_scoped_rerun",
      inbox_title: "[Rerun Decision] math_g8_linear_function_intro",
      recommended_rerun_from: "assessment_designer",
      rerun_chain_depth: 0
    });
  });

  it("marks widened reruns as provider-executing but still human-gated", () => {
    const guidance = deriveUnitReviewOrchestrationGuidance({
      unit_id: "math_g8_linear_function_intro",
      artifact_status: "blocked",
      retry_policy: {
        decision: "widen_rerun_scope",
        reason: "An earlier owner must rerun.",
        recommended_rerun_from: "subject_expert",
        recommended_rerun_roles: [
          "subject_expert",
          "pedagogy_designer",
          "narrative_designer",
          "engineering_agent",
          "assessment_designer",
          "qa_agent"
        ],
        prior_rerun_from: "assessment_designer"
      },
      rerun_context: {
        source_artifact_generated_at: "2026-04-23T09:00:00.000Z",
        source_artifact_status: "blocked",
        start_from_role: "assessment_designer",
        inherited_roles: ["subject_expert", "pedagogy_designer", "narrative_designer", "engineering_agent"],
        rerun_chain_depth: 1,
        rerun_root_artifact_generated_at: "2026-04-23T09:00:00.000Z",
        source_retry_decision: "allow_scoped_rerun",
        source_recommended_rerun_from: "assessment_designer"
      }
    });

    expect(guidance).toMatchObject({
      action: "prepare_widened_rerun",
      requires_provider_execution: true,
      requires_human_decision: true,
      human_queue: "rerun_decision_queue",
      automation_step: "open_inbox_item",
      provider_execution_allowed_without_human: false,
      primary_human_action: "decide_widened_rerun",
      inbox_title: "[Widened Rerun Decision] math_g8_linear_function_intro",
      recommended_rerun_from: "subject_expert",
      rerun_chain_depth: 1
    });
  });

  it("routes manual-review artifacts to human triage", () => {
    const guidance = deriveUnitReviewOrchestrationGuidance({
      unit_id: "math_g8_linear_function_intro",
      artifact_status: "blocked",
      retry_policy: {
        decision: "manual_review_required",
        reason: "Provider instability persisted after rerun.",
        recommended_rerun_from: "qa_agent",
        recommended_rerun_roles: ["qa_agent"],
        prior_rerun_from: "qa_agent"
      },
      rerun_context: {
        source_artifact_generated_at: "2026-04-23T09:30:00.000Z",
        source_artifact_status: "blocked",
        start_from_role: "qa_agent",
        inherited_roles: [
          "subject_expert",
          "pedagogy_designer",
          "narrative_designer",
          "engineering_agent",
          "assessment_designer"
        ],
        rerun_chain_depth: 1,
        rerun_root_artifact_generated_at: "2026-04-23T09:30:00.000Z",
        source_retry_decision: "allow_scoped_rerun",
        source_recommended_rerun_from: "qa_agent"
      }
    });

    expect(guidance).toMatchObject({
      action: "manual_triage_required",
      requires_provider_execution: false,
      requires_human_decision: true,
      human_queue: "manual_triage_queue",
      automation_step: "open_inbox_item",
      provider_execution_allowed_without_human: false,
      primary_human_action: "perform_manual_triage",
      inbox_title: "[Manual Triage] math_g8_linear_function_intro",
      recommended_rerun_from: "qa_agent",
      rerun_chain_depth: 1
    });
  });
});
