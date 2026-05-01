import { describe, expect, it } from "vitest";

import type {
  UnitReviewProviderExecutionAttempt,
  UnitReviewProviderExecutionDecision,
  UnitReviewProviderExecutionRequest
} from "../src";
import {
  recordUnitReviewProviderExecutionAttempt,
  validateUnitReviewProviderExecutionAttempt,
  validateUnitReviewProviderExecutionAttemptSource
} from "../src";

describe("provider execution attempt", () => {
  const baseRequest: UnitReviewProviderExecutionRequest = {
    schema_version: "content-pipeline-review-provider-execution-request/v0.1",
    request_key:
      "content-pipeline:provider-execution-request:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
    chain_key: "content-pipeline:provider-execution-chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
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
    budget_check_status: "passed",
    notes: "Budget approved for one scoped rerun.",
    budget_reference: "budget-policy-2026-04-24"
  };

  it("records an authorized pending execution attempt from an approved decision", () => {
    const attempt = recordUnitReviewProviderExecutionAttempt(baseRequest, approvedDecision, {
      recorded_by: "automation_worker_001",
      recorded_at: "2026-04-24T00:10:00.000Z",
      attempt_notes: "Prepared but not yet executed."
    });

    expect(attempt).toMatchObject({
      schema_version: "content-pipeline-review-provider-execution-attempt/v0.1",
      attempt_key:
        "content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T00:10:00.000Z",
      request_key: baseRequest.request_key,
      execution_mode: "real_provider_review_rerun",
      attempt_status: "authorized_pending_execution",
      provider_execution_allowed: true,
      approved_by: "ops_lead_001",
      recorded_by: "automation_worker_001",
      budget_reference: "budget-policy-2026-04-24"
    });
  });

  it("rejects attempts sourced from non-approved decisions", () => {
    const rejectedDecision: UnitReviewProviderExecutionDecision = {
      ...approvedDecision,
      decision_status: "rejected",
      execution_permission: "denied"
    };

    const validation = validateUnitReviewProviderExecutionAttemptSource(baseRequest, rejectedDecision);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "decision_not_approved" })])
    );
    expect(() =>
      recordUnitReviewProviderExecutionAttempt(baseRequest, rejectedDecision, {
        recorded_by: "automation_worker_001"
      })
    ).toThrow(/Provider execution attempt source is invalid/);
  });

  it("fails validation closed when the source decision contract is invalid", () => {
    const malformedDecision: UnitReviewProviderExecutionDecision = {
      ...approvedDecision,
      execution_permission: "denied"
    };
    const attempt: UnitReviewProviderExecutionAttempt = {
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

    const validation = validateUnitReviewProviderExecutionAttempt(baseRequest, malformedDecision, attempt);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "source_contract_mismatch" })])
    );
  });

  it("rejects attempts when budget check did not pass", () => {
    const failedBudgetDecision: UnitReviewProviderExecutionDecision = {
      ...approvedDecision,
      decision_status: "rejected",
      execution_permission: "denied",
      budget_check_status: "failed"
    };

    const validation = validateUnitReviewProviderExecutionAttemptSource(baseRequest, failedBudgetDecision);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "budget_check_not_passed" })])
    );
  });
});
