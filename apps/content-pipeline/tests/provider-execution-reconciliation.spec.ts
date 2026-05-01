import { describe, expect, it } from "vitest";

import type {
  UnitReviewProviderExecutionAttempt,
  UnitReviewProviderExecutionDecision,
  UnitReviewProviderExecutionReceipt,
  UnitReviewProviderExecutionReconciliation,
  UnitReviewProviderExecutionRequest
} from "../src";
import {
  buildUnitReviewProviderExecutionReconciliation,
  validateUnitReviewProviderExecutionReconciliation
} from "../src";

describe("provider execution reconciliation", () => {
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

  it("builds a closed reconciliation when execution records a new review artifact", () => {
    const receipt: UnitReviewProviderExecutionReceipt = {
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

    const reconciliation = buildUnitReviewProviderExecutionReconciliation(
      baseRequest,
      approvedDecision,
      authorizedAttempt,
      receipt
    );

    expect(reconciliation).toMatchObject({
      schema_version: "content-pipeline-review-provider-execution-reconciliation/v0.1",
      reconciliation_status: "closed",
      recommended_follow_up: "review_result_artifact",
      execution_outcome: "artifact_recorded",
      result_artifact_available: true,
      result_artifact_status: "blocked",
      actual_provider_call_count: 2
    });
  });

  it("builds an action-required reconciliation when execution fails", () => {
    const receipt: UnitReviewProviderExecutionReceipt = {
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

    const reconciliation = buildUnitReviewProviderExecutionReconciliation(
      baseRequest,
      approvedDecision,
      authorizedAttempt,
      receipt
    );

    expect(reconciliation).toMatchObject({
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_execution_triage",
      execution_outcome: "execution_failed",
      result_artifact_available: false,
      failure_code: "provider_timeout"
    });
  });

  it("drops untrusted downstream metadata when the receipt is invalid", () => {
    const invalidReceipt: UnitReviewProviderExecutionReceipt = {
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
      result_artifact_status: "ready_for_human_review",
      failure_code: "should_not_be_here"
    };

    const reconciliation = buildUnitReviewProviderExecutionReconciliation(
      baseRequest,
      approvedDecision,
      authorizedAttempt,
      invalidReceipt
    );

    expect(reconciliation).toMatchObject({
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_receipt_triage",
      execution_outcome: "invalid_receipt",
      result_artifact_available: false,
      result_artifact_generated_at: null,
      result_artifact_status: null,
      actual_provider_call_count: null,
      failure_code: null
    });
    expect(reconciliation.receipt_validation_issue_codes).toContain(
      "artifact_result_contract_mismatch"
    );
  });

  it("keeps canonical source schema versions when upstream source contracts are malformed", () => {
    const invalidRequest = {
      ...baseRequest,
      schema_version: "bogus-request-schema"
    } as unknown as UnitReviewProviderExecutionRequest;

    const receipt: UnitReviewProviderExecutionReceipt = {
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
      result_artifact_status: "ready_for_human_review"
    };

    const reconciliation = buildUnitReviewProviderExecutionReconciliation(
      invalidRequest,
      approvedDecision,
      authorizedAttempt,
      receipt
    );
    const validation = validateUnitReviewProviderExecutionReconciliation(
      invalidRequest,
      approvedDecision,
      authorizedAttempt,
      receipt,
      reconciliation
    );

    expect(reconciliation.source_request_schema_version).toBe(
      "content-pipeline-review-provider-execution-request/v0.1"
    );
    expect(reconciliation.receipt_validation_ok).toBe(false);
    expect(reconciliation.receipt_validation_issue_codes).toContain(
      "source_contract_mismatch"
    );
    expect(validation.ok).toBe(true);
  });

  it("fails validation when reconciliation fields drift from the derived result summary", () => {
    const receipt: UnitReviewProviderExecutionReceipt = {
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
      result_artifact_status: "ready_for_human_review"
    };

    const reconciliation: UnitReviewProviderExecutionReconciliation = {
      ...buildUnitReviewProviderExecutionReconciliation(
        baseRequest,
        approvedDecision,
        authorizedAttempt,
        receipt
      ),
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_execution_triage",
      result_artifact_available: false
    };

    const validation = validateUnitReviewProviderExecutionReconciliation(
      baseRequest,
      approvedDecision,
      authorizedAttempt,
      receipt,
      reconciliation
    );

    expect(validation.ok).toBe(false);
    expect(validation.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "reconciliation_status_mismatch" }),
        expect.objectContaining({ code: "recommended_follow_up_mismatch" }),
        expect.objectContaining({ code: "result_artifact_state_mismatch" })
      ])
    );
  });
});
