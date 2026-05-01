import { describe, expect, it } from "vitest";

import type {
  UnitReviewProviderExecutionAttempt,
  UnitReviewProviderExecutionDecision,
  UnitReviewProviderExecutionFollowUp,
  UnitReviewProviderExecutionFollowUpPlan,
  UnitReviewProviderExecutionFollowUpReceipt,
  UnitReviewProviderExecutionReceipt,
  UnitReviewProviderExecutionReconciliation,
  UnitReviewProviderExecutionRequest,
} from "../src";
import {
  buildUnitReviewProviderExecutionFollowUpPlan,
  buildUnitReviewProviderExecutionFollowUpReceipt,
  buildUnitReviewProviderExecutionFollowUpReconciliation,
  validateUnitReviewProviderExecutionFollowUpReconciliation,
  validateUnitReviewProviderExecutionFollowUpReconciliationSource,
} from "../src";

describe("provider execution follow-up reconciliation", () => {
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
      rerun_from: "assessment_designer",
    },
    gating_requirements: {
      requires_explicit_human_approval: true,
      requires_budget_policy_check: true,
      requires_real_provider_credentials: true,
    },
    decision_boundary: {
      requires_provider_execution: true,
      requires_human_decision: true,
      provider_execution_allowed_without_human: false,
    },
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
    budget_check_status: "passed",
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
    recorded_at: "2026-04-24T00:10:00.000Z",
  };

  const executionFailedSourceReceipt: UnitReviewProviderExecutionReceipt = {
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
    failure_code: "provider_timeout",
  };

  const executionFailedSourceReconciliation: UnitReviewProviderExecutionReconciliation = {
    schema_version: "content-pipeline-review-provider-execution-reconciliation/v0.1",
    source_request_schema_version: "content-pipeline-review-provider-execution-request/v0.1",
    source_decision_schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
    source_attempt_schema_version: "content-pipeline-review-provider-execution-attempt/v0.1",
    source_receipt_schema_version: "content-pipeline-review-provider-execution-receipt/v0.1",
    request_key: baseRequest.request_key,
    chain_key: baseRequest.chain_key,
    attempt_key: authorizedAttempt.attempt_key,
    unit_id: baseRequest.unit_id,
    receipt_validation_ok: true,
    receipt_validation_issue_codes: [],
    reconciliation_status: "action_required",
    recommended_follow_up: "manual_execution_triage",
    execution_outcome: "execution_failed",
    result_artifact_available: false,
    result_artifact_generated_at: null,
    result_artifact_status: null,
    actual_provider_call_count: 1,
    executed_by: "review_runner_001",
    executed_at: "2026-04-24T00:20:00.000Z",
    failure_code: "provider_timeout",
  };

  const executionFailedFollowUp: UnitReviewProviderExecutionFollowUp = {
    schema_version: "content-pipeline-review-provider-execution-follow-up/v0.1",
    source_request_schema_version: "content-pipeline-review-provider-execution-request/v0.1",
    source_decision_schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
    source_attempt_schema_version: "content-pipeline-review-provider-execution-attempt/v0.1",
    source_receipt_schema_version: "content-pipeline-review-provider-execution-receipt/v0.1",
    source_reconciliation_schema_version: "content-pipeline-review-provider-execution-reconciliation/v0.1",
    request_key: baseRequest.request_key,
    chain_key: baseRequest.chain_key,
    attempt_key: authorizedAttempt.attempt_key,
    unit_id: baseRequest.unit_id,
    source_reconciliation_status: "action_required",
    source_recommended_follow_up: "manual_execution_triage",
    source_execution_outcome: "execution_failed",
    follow_up_state: "execution_triage_required",
    follow_up_action: "open_manual_execution_triage_item",
    provider_execution_chain_closed: false,
    result_artifact_handoff: null,
    automation_step: "open_inbox_item",
    decision_boundary: {
      requires_provider_execution: false,
      requires_human_decision: true,
      provider_execution_allowed_without_human: false,
    },
    follow_up_item: {
      item_key:
        "content-pipeline:manual_triage_queue:math_g8_linear_function_intro:provider-execution:content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T00:10:00.000Z",
      human_queue: "manual_triage_queue",
      title: "[Provider Execution Triage] math_g8_linear_function_intro",
      summary:
        "Authorized provider rerun for attempt content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T00:10:00.000Z failed with provider_timeout after 1 provider calls. Manual execution triage is required before any next rerun or artifact routing.",
      primary_human_action: "perform_manual_triage",
      automation_step: "open_inbox_item",
      labels: [
        "content_pipeline_review",
        "provider_execution_follow_up",
        "queue:manual_triage_queue",
        "follow_up_state:execution_triage_required",
        "execution_outcome:execution_failed",
        "failure_code:provider_timeout",
      ],
    },
  };

  function buildFailedPlan(): UnitReviewProviderExecutionFollowUpPlan {
    return buildUnitReviewProviderExecutionFollowUpPlan(executionFailedFollowUp);
  }

  function buildFailedReceipt(): UnitReviewProviderExecutionFollowUpReceipt {
    return buildUnitReviewProviderExecutionFollowUpReceipt(buildFailedPlan(), {
      executed_at: "2026-04-24T00:35:00.000Z",
    });
  }

  it("closes the delivery chain when a manual triage follow-up item is delivered successfully", () => {
    const plan = buildFailedPlan();
    const receipt = buildFailedReceipt();
    const reconciliation = buildUnitReviewProviderExecutionFollowUpReconciliation(plan, receipt);

    expect(reconciliation).toMatchObject({
      schema_version: "content-pipeline-review-provider-execution-follow-up-reconciliation/v0.1",
      receipt_validation_ok: true,
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      delivery_status: "applied",
      final_follow_up_queue: "manual_triage_queue",
      unresolved_operations: [],
    });
  });

  it("requires manual repair when follow-up delivery upsert fails", () => {
    const plan = buildFailedPlan();
    const receipt = buildUnitReviewProviderExecutionFollowUpReceipt(plan, {
      executed_at: "2026-04-24T00:35:00.000Z",
      upsert_status: "failed",
    });
    const reconciliation = buildUnitReviewProviderExecutionFollowUpReconciliation(plan, receipt);

    expect(reconciliation).toMatchObject({
      receipt_validation_ok: true,
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_repair_provider_execution_follow_up_delivery",
      delivery_status: "failed",
      final_follow_up_item_key: null,
    });
    expect(reconciliation.unresolved_operations).toEqual([
      expect.objectContaining({
        operation_type: "upsert",
        status: "failed",
      }),
    ]);
  });

  it("drops untrusted delivery metadata when the follow-up receipt is invalid", () => {
    const plan = buildFailedPlan();
    const receipt = buildFailedReceipt();
    receipt.final_follow_up_item_key = "forged-item-key";
    const reconciliation = buildUnitReviewProviderExecutionFollowUpReconciliation(plan, receipt);

    expect(reconciliation).toMatchObject({
      receipt_validation_ok: false,
      recommended_follow_up: "manual_receipt_triage",
      delivery_status: null,
      result_artifact_handoff: null,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      unresolved_operations: [],
    });
    expect(reconciliation.receipt_validation_issue_codes).toContain("final_follow_up_state_mismatch");
  });

  it("rejects reconciliation rendering when the follow-up delivery receipt chain is tampered", () => {
    const plan = buildFailedPlan();
    const receipt = buildFailedReceipt();
    receipt.operations[0]!.target_item_key = "wrong-target";

    const validation = validateUnitReviewProviderExecutionFollowUpReconciliationSource(
      baseRequest,
      approvedDecision,
      authorizedAttempt,
      executionFailedSourceReceipt,
      executionFailedSourceReconciliation,
      executionFailedFollowUp,
      plan,
      receipt
    );

    expect(validation.ok).toBe(false);
    expect(validation.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "source_follow_up_receipt_contract_mismatch" }),
      ])
    );
  });

  it("detects tampered reconciliation payloads during validation", () => {
    const plan = buildFailedPlan();
    const receipt = buildFailedReceipt();
    const reconciliation = {
      ...buildUnitReviewProviderExecutionFollowUpReconciliation(plan, receipt),
      recommended_follow_up: "manual_repair_provider_execution_follow_up_delivery" as const,
    };

    const validation = validateUnitReviewProviderExecutionFollowUpReconciliation(
      plan,
      receipt,
      reconciliation
    );

    expect(validation.ok).toBe(false);
    expect(validation.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "recommended_follow_up_mismatch" }),
      ])
    );
  });
});
