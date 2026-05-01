import { describe, expect, it } from "vitest";

import type {
  UnitReviewProviderExecutionAttempt,
  UnitReviewProviderExecutionDecision,
  UnitReviewProviderExecutionFollowUp,
  UnitReviewProviderExecutionReceipt,
  UnitReviewProviderExecutionRequest
} from "../src";
import {
  buildUnitReviewProviderExecutionFollowUp,
  buildUnitReviewProviderExecutionFollowUpPlan,
  buildUnitReviewProviderExecutionReconciliation,
  validateUnitReviewProviderExecutionFollowUpPlan,
  validateUnitReviewProviderExecutionFollowUpPlanSource
} from "../src";

describe("provider execution follow-up plan", () => {
  const baseRequest: UnitReviewProviderExecutionRequest = {
    schema_version: "content-pipeline-review-provider-execution-request/v0.1",
    request_key:
      "content-pipeline:provider-execution-request:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
    chain_key:
      "content-pipeline:provider-execution-chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
    source_artifact_schema_version: "content-pipeline-review-artifact/v0.1",
    source_artifact_generated_at: "2026-04-23T18:00:00.000Z",
    source_artifact_status: "blocked",
    unit_id: "math_g8_linear_function_intro",
    execution_action: "run_scoped_review_rerun",
    requested_start_role: "assessment_designer",
    requested_roles: ["assessment_designer", "qa_agent"],
    estimated_provider_call_count: 2,
    review_mode: "llm_review_no_writeback",
    output_contract: "review_artifact_only",
    reason:
      "A review-only scoped rerun is structurally allowed, but it still requires an explicit decision before spending provider execution.",
    rerun_chain_depth: 0,
    rerun_root_artifact_generated_at: "2026-04-23T18:00:00.000Z",
    source_retry_decision: "allow_scoped_rerun",
    source_recommended_rerun_from: "assessment_designer",
    human_queue: "rerun_decision_queue",
    primary_human_action: "decide_scoped_rerun",
    inbox_title: "[Rerun Decision] math_g8_linear_function_intro",
    inbox_summary:
      "Blocked artifact can attempt a review-only scoped rerun from assessment_designer, but provider execution still requires an explicit human decision.",
    execution_command: {
      command: "run-llm-review",
      from_artifact_generated_at: "2026-04-23T18:00:00.000Z",
      rerun_from: "assessment_designer"
    },
    gating_requirements: {
      requires_explicit_human_approval: true,
      requires_budget_policy_check: true,
      requires_real_provider_credentials: true
    },
    decision_boundary: {
      requires_provider_execution: true,
      requires_human_decision: true,
      provider_execution_allowed_without_human: false
    }
  };

  const approvedDecision: UnitReviewProviderExecutionDecision = {
    schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
    source_request_schema_version: "content-pipeline-review-provider-execution-request/v0.1",
    request_key: baseRequest.request_key,
    chain_key: baseRequest.chain_key,
    unit_id: baseRequest.unit_id,
    execution_action: baseRequest.execution_action,
    requested_start_role: baseRequest.requested_start_role,
    requested_roles: baseRequest.requested_roles,
    estimated_provider_call_count: baseRequest.estimated_provider_call_count,
    human_queue: baseRequest.human_queue,
    primary_human_action: baseRequest.primary_human_action,
    decision_status: "approved",
    execution_permission: "granted",
    reviewer_id: "ops_lead_001",
    reviewed_at: "2026-04-24T00:05:00.000Z",
    budget_check_status: "passed"
  };

  const authorizedAttempt: UnitReviewProviderExecutionAttempt = {
    schema_version: "content-pipeline-review-provider-execution-attempt/v0.1",
    source_request_schema_version: "content-pipeline-review-provider-execution-request/v0.1",
    source_decision_schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
    attempt_key:
      "content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T00:10:00.000Z",
    request_key: baseRequest.request_key,
    chain_key: baseRequest.chain_key,
    unit_id: baseRequest.unit_id,
    execution_action: baseRequest.execution_action,
    requested_start_role: baseRequest.requested_start_role,
    requested_roles: baseRequest.requested_roles,
    estimated_provider_call_count: baseRequest.estimated_provider_call_count,
    review_mode: baseRequest.review_mode,
    output_contract: baseRequest.output_contract,
    execution_mode: "real_provider_review_rerun",
    attempt_status: "authorized_pending_execution",
    provider_execution_allowed: true,
    execution_command: baseRequest.execution_command,
    approved_by: approvedDecision.reviewer_id,
    approved_at: approvedDecision.reviewed_at,
    budget_check_status: "passed",
    recorded_by: "automation_worker_001",
    recorded_at: "2026-04-24T00:10:00.000Z"
  };

  it("builds a no-op delivery plan when execution hands off to the result artifact contract", () => {
    const receipt = buildArtifactRecordedReceipt();
    const reconciliation = buildUnitReviewProviderExecutionReconciliation(
      baseRequest,
      approvedDecision,
      authorizedAttempt,
      receipt
    );
    const followUp = buildUnitReviewProviderExecutionFollowUp(
      baseRequest,
      approvedDecision,
      authorizedAttempt,
      receipt,
      reconciliation
    );

    const plan = buildUnitReviewProviderExecutionFollowUpPlan(followUp);

    expect(plan).toMatchObject({
      schema_version: "content-pipeline-review-provider-execution-follow-up-plan/v0.1",
      delivery_action: "none",
      provider_execution_chain_closed: true,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      upsert: null,
      automation_step: "none",
      result_artifact_handoff: {
        expected_schema_version: "content-pipeline-review-artifact/v0.1",
        generated_at: "2026-04-24T00:20:30.000Z",
        status: "blocked"
      }
    });
  });

  it("builds an executor-ready upsert when execution failure needs manual triage", () => {
    const receipt = buildExecutionFailedReceipt();
    const reconciliation = buildUnitReviewProviderExecutionReconciliation(
      baseRequest,
      approvedDecision,
      authorizedAttempt,
      receipt
    );
    const followUp = buildUnitReviewProviderExecutionFollowUp(
      baseRequest,
      approvedDecision,
      authorizedAttempt,
      receipt,
      reconciliation
    );

    const plan = buildUnitReviewProviderExecutionFollowUpPlan(followUp);

    expect(plan).toMatchObject({
      delivery_action: "create_follow_up_inbox_item",
      final_follow_up_item_key:
        "content-pipeline:manual_triage_queue:math_g8_linear_function_intro:provider-execution:content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T00:10:00.000Z",
      final_follow_up_queue: "manual_triage_queue",
      automation_step: "open_inbox_item",
      upsert: {
        human_queue: "manual_triage_queue",
        title: "[Provider Execution Triage] math_g8_linear_function_intro",
        primary_human_action: "perform_manual_triage",
        automation_step: "open_inbox_item"
      }
    });
    expect(plan.upsert).not.toBeNull();
    expect(plan.upsert!.operation_key).toBe(
      `content-pipeline:provider-execution-follow-up-delivery:upsert:${plan.upsert!.item_key}`
    );
  });

  it("keeps receipt-triage follow-up delivery scoped to a manual receipt inbox item", () => {
    const invalidReceipt = {
      ...buildArtifactRecordedReceipt(),
      failure_code: "should_not_be_here"
    } as UnitReviewProviderExecutionReceipt;
    const reconciliation = buildUnitReviewProviderExecutionReconciliation(
      baseRequest,
      approvedDecision,
      authorizedAttempt,
      invalidReceipt
    );
    const followUp = buildUnitReviewProviderExecutionFollowUp(
      baseRequest,
      approvedDecision,
      authorizedAttempt,
      invalidReceipt,
      reconciliation
    );

    const plan = buildUnitReviewProviderExecutionFollowUpPlan(followUp);

    expect(plan.follow_up_state).toBe("receipt_triage_required");
    expect(plan.delivery_action).toBe("create_follow_up_inbox_item");
    expect(plan.upsert?.item_key).toContain(":provider-receipt:");
    expect(plan.result_artifact_handoff).toBeNull();
  });

  it("rejects plan source rendering when the upstream follow-up contract is tampered", () => {
    const receipt = buildArtifactRecordedReceipt();
    const reconciliation = buildUnitReviewProviderExecutionReconciliation(
      baseRequest,
      approvedDecision,
      authorizedAttempt,
      receipt
    );
    const followUp = buildUnitReviewProviderExecutionFollowUp(
      baseRequest,
      approvedDecision,
      authorizedAttempt,
      receipt,
      reconciliation
    );
    const tamperedFollowUp: UnitReviewProviderExecutionFollowUp = {
      ...followUp,
      follow_up_action: "open_manual_execution_triage_item"
    };

    const validation = validateUnitReviewProviderExecutionFollowUpPlanSource(
      baseRequest,
      approvedDecision,
      authorizedAttempt,
      receipt,
      reconciliation,
      tamperedFollowUp
    );

    expect(validation.ok).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toContain("source_follow_up_contract_mismatch");
  });

  it("detects a tampered follow-up delivery plan payload", () => {
    const receipt = buildExecutionFailedReceipt();
    const reconciliation = buildUnitReviewProviderExecutionReconciliation(
      baseRequest,
      approvedDecision,
      authorizedAttempt,
      receipt
    );
    const followUp = buildUnitReviewProviderExecutionFollowUp(
      baseRequest,
      approvedDecision,
      authorizedAttempt,
      receipt,
      reconciliation
    );
    const plan = buildUnitReviewProviderExecutionFollowUpPlan(followUp);
    const tamperedPlan = {
      ...plan,
      final_follow_up_item_key: "wrong-item",
      upsert: plan.upsert
        ? {
            ...plan.upsert,
            summary: "tampered"
          }
        : null
    };

    const validation = validateUnitReviewProviderExecutionFollowUpPlan(followUp, tamperedPlan);

    expect(validation.ok).toBe(false);
    expect(validation.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining(["final_follow_up_state_mismatch", "upsert_payload_mismatch"])
    );
  });

  function buildArtifactRecordedReceipt(): UnitReviewProviderExecutionReceipt {
    return {
      schema_version: "content-pipeline-review-provider-execution-receipt/v0.1",
      source_request_schema_version: "content-pipeline-review-provider-execution-request/v0.1",
      source_decision_schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
      source_attempt_schema_version: "content-pipeline-review-provider-execution-attempt/v0.1",
      attempt_key: authorizedAttempt.attempt_key,
      request_key: baseRequest.request_key,
      chain_key: baseRequest.chain_key,
      unit_id: baseRequest.unit_id,
      execution_action: baseRequest.execution_action,
      requested_start_role: baseRequest.requested_start_role,
      requested_roles: baseRequest.requested_roles,
      estimated_provider_call_count: baseRequest.estimated_provider_call_count,
      review_mode: baseRequest.review_mode,
      output_contract: baseRequest.output_contract,
      execution_mode: "real_provider_review_rerun",
      attempt_status_at_execution: "authorized_pending_execution",
      receipt_status: "artifact_recorded",
      executed_by: "review_runner_001",
      executed_at: "2026-04-24T00:20:00.000Z",
      actual_provider_call_count: 2,
      result_artifact_schema_version: "content-pipeline-review-artifact/v0.1",
      result_artifact_generated_at: "2026-04-24T00:20:30.000Z",
      result_artifact_status: "blocked"
    };
  }

  function buildExecutionFailedReceipt(): UnitReviewProviderExecutionReceipt {
    return {
      schema_version: "content-pipeline-review-provider-execution-receipt/v0.1",
      source_request_schema_version: "content-pipeline-review-provider-execution-request/v0.1",
      source_decision_schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
      source_attempt_schema_version: "content-pipeline-review-provider-execution-attempt/v0.1",
      attempt_key: authorizedAttempt.attempt_key,
      request_key: baseRequest.request_key,
      chain_key: baseRequest.chain_key,
      unit_id: baseRequest.unit_id,
      execution_action: baseRequest.execution_action,
      requested_start_role: baseRequest.requested_start_role,
      requested_roles: baseRequest.requested_roles,
      estimated_provider_call_count: baseRequest.estimated_provider_call_count,
      review_mode: baseRequest.review_mode,
      output_contract: baseRequest.output_contract,
      execution_mode: "real_provider_review_rerun",
      attempt_status_at_execution: "authorized_pending_execution",
      receipt_status: "execution_failed",
      executed_by: "review_runner_001",
      executed_at: "2026-04-24T00:20:00.000Z",
      actual_provider_call_count: 1,
      result_artifact_schema_version: null,
      result_artifact_generated_at: null,
      result_artifact_status: null,
      failure_code: "provider_timeout"
    };
  }
});
