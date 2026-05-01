import type { UnitReviewRepairPlan } from "./repair-plan";
import type { ReviewRerunContext } from "./review-rerun";
import type { UnitReviewRetryPolicy } from "./retry-policy";

export type UnitReviewOrchestrationAction =
  | "notify_human_for_approval"
  | "prepare_scoped_rerun"
  | "prepare_widened_rerun"
  | "manual_triage_required"
  | "blocked_without_guidance";

export type UnitReviewHumanQueue = "approval_queue" | "rerun_decision_queue" | "manual_triage_queue";
export type UnitReviewPrimaryHumanAction =
  | "approve_review_artifact"
  | "decide_scoped_rerun"
  | "decide_widened_rerun"
  | "perform_manual_triage";

export interface UnitReviewOrchestrationGuidance {
  action: UnitReviewOrchestrationAction;
  reason: string;
  requires_provider_execution: boolean;
  requires_human_decision: boolean;
  human_queue: UnitReviewHumanQueue;
  automation_step: "open_inbox_item";
  provider_execution_allowed_without_human: false;
  primary_human_action: UnitReviewPrimaryHumanAction;
  inbox_title: string;
  inbox_summary: string;
  recommended_rerun_from: UnitReviewRepairPlan["recommended_rerun_from"] | null;
  rerun_chain_depth: number;
}

export interface ReviewOrchestrationGuidanceInput {
  unit_id: string;
  artifact_status: "ready_for_human_review" | "blocked";
  repair_plan?: UnitReviewRepairPlan;
  retry_policy?: UnitReviewRetryPolicy;
  rerun_context?: ReviewRerunContext;
}

export function deriveUnitReviewOrchestrationGuidance(
  input: ReviewOrchestrationGuidanceInput
): UnitReviewOrchestrationGuidance {
  const rerunChainDepth = input.rerun_context?.rerun_chain_depth ?? 0;
  const recommendedRerunFrom = input.retry_policy?.recommended_rerun_from ?? input.repair_plan?.recommended_rerun_from ?? null;

  if (input.artifact_status === "ready_for_human_review") {
    return {
      action: "notify_human_for_approval",
      reason: "Candidate patches are ready for human approval. Automation may notify reviewers, but must not apply without explicit approval.",
      requires_provider_execution: false,
      requires_human_decision: true,
      human_queue: "approval_queue",
      automation_step: "open_inbox_item",
      provider_execution_allowed_without_human: false,
      primary_human_action: "approve_review_artifact",
      inbox_title: `[Approval] ${input.unit_id}`,
      inbox_summary: "Review artifact is ready for human approval. Candidate patches passed current gates and can now enter the approval step.",
      recommended_rerun_from: null,
      rerun_chain_depth: rerunChainDepth
    };
  }

  const retryDecision = input.retry_policy?.decision;
  if (retryDecision === "allow_scoped_rerun") {
    return {
      action: "prepare_scoped_rerun",
      reason: "A review-only scoped rerun is structurally allowed, but it still requires an explicit decision before spending provider execution.",
      requires_provider_execution: true,
      requires_human_decision: true,
      human_queue: "rerun_decision_queue",
      automation_step: "open_inbox_item",
      provider_execution_allowed_without_human: false,
      primary_human_action: "decide_scoped_rerun",
      inbox_title: `[Rerun Decision] ${input.unit_id}`,
      inbox_summary: `Blocked artifact can attempt a review-only scoped rerun from ${recommendedRerunFrom ?? "n/a"}, but provider execution still requires an explicit human decision.`,
      recommended_rerun_from: recommendedRerunFrom,
      rerun_chain_depth: rerunChainDepth
    };
  }

  if (retryDecision === "widen_rerun_scope") {
    return {
      action: "prepare_widened_rerun",
      reason: "The next retry should restart from an earlier owner scope, and that widened review-only rerun still requires an explicit decision before provider execution.",
      requires_provider_execution: true,
      requires_human_decision: true,
      human_queue: "rerun_decision_queue",
      automation_step: "open_inbox_item",
      provider_execution_allowed_without_human: false,
      primary_human_action: "decide_widened_rerun",
      inbox_title: `[Widened Rerun Decision] ${input.unit_id}`,
      inbox_summary: `Blocked artifact now points to an earlier owner and should widen rerun scope from ${recommendedRerunFrom ?? "n/a"}, pending explicit human/provider-budget approval.`,
      recommended_rerun_from: recommendedRerunFrom,
      rerun_chain_depth: rerunChainDepth
    };
  }

  if (retryDecision === "manual_review_required") {
    return {
      action: "manual_triage_required",
      reason: "The retry policy already requires manual review, so automation should stop and route the artifact to human triage.",
      requires_provider_execution: false,
      requires_human_decision: true,
      human_queue: "manual_triage_queue",
      automation_step: "open_inbox_item",
      provider_execution_allowed_without_human: false,
      primary_human_action: "perform_manual_triage",
      inbox_title: `[Manual Triage] ${input.unit_id}`,
      inbox_summary: "Retry policy already requires manual review. Route this blocked artifact to human triage instead of attempting another automated rerun.",
      recommended_rerun_from: recommendedRerunFrom,
      rerun_chain_depth: rerunChainDepth
    };
  }

  return {
    action: "blocked_without_guidance",
    reason: "The artifact is blocked but does not expose enough retry guidance for safe automation. Route it to human review first.",
    requires_provider_execution: false,
    requires_human_decision: true,
    human_queue: "manual_triage_queue",
    automation_step: "open_inbox_item",
    provider_execution_allowed_without_human: false,
    primary_human_action: "perform_manual_triage",
    inbox_title: `[Manual Triage] ${input.unit_id}`,
    inbox_summary: "Blocked artifact does not expose enough retry guidance for safe automation. Human triage is required before any next step.",
    recommended_rerun_from: recommendedRerunFrom,
    rerun_chain_depth: rerunChainDepth
  };
}
