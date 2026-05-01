import { describe, expect, it } from "vitest";

import type { UnitReviewProviderExecutionDecision, UnitReviewProviderExecutionRequest } from "../src";
import {
  recordUnitReviewProviderExecutionDecision,
  validateUnitReviewProviderExecutionDecision,
  validateUnitReviewProviderExecutionDecisionSource
} from "../src";

describe("provider execution decision", () => {
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

  it("records an approved decision with granted execution permission", () => {
    const decision = recordUnitReviewProviderExecutionDecision(baseRequest, {
      reviewer_id: "ops_lead_001",
      decision: "approved",
      budget_check_status: "passed",
      reviewed_at: "2026-04-24T00:05:00.000Z",
      notes: "Budget approved for one scoped rerun.",
      budget_reference: "budget-policy-2026-04-24"
    });

    expect(decision).toMatchObject({
      schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
      request_key: baseRequest.request_key,
      execution_action: "run_scoped_review_rerun",
      requested_start_role: "assessment_designer",
      decision_status: "approved",
      execution_permission: "granted",
      reviewer_id: "ops_lead_001",
      budget_check_status: "passed",
      budget_reference: "budget-policy-2026-04-24"
    });
  });

  it("rejects malformed source requests before a decision is recorded", () => {
    const malformedRequest = {
      ...baseRequest,
      requested_start_role: "bogus_role"
    } as unknown as UnitReviewProviderExecutionRequest;

    const validation = validateUnitReviewProviderExecutionDecisionSource(malformedRequest);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid_requested_start_role" })
      ])
    );
    expect(() =>
      recordUnitReviewProviderExecutionDecision(malformedRequest, {
        reviewer_id: "ops_lead_001",
        decision: "approved",
        budget_check_status: "passed"
      })
    ).toThrow(/Provider execution decision source request is invalid/);
  });

  it("fails source validation when contract-critical request fields are tampered", () => {
    const tamperedRequest = {
      ...baseRequest,
      review_mode: "live_writeback_mode",
      output_contract: "patched_unit_yaml",
      inbox_summary: "tampered summary"
    } as unknown as UnitReviewProviderExecutionRequest;

    const validation = validateUnitReviewProviderExecutionDecisionSource(tamperedRequest);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "review_mode_mismatch" }),
        expect.objectContaining({ code: "output_contract_mismatch" }),
        expect.objectContaining({ code: "inbox_summary_mismatch" })
      ])
    );
  });

  it("fails validation closed when the source request contract is invalid", () => {
    const malformedRequest = {
      ...baseRequest,
      source_artifact_status: "ready_for_human_review"
    } as unknown as UnitReviewProviderExecutionRequest;
    const decision: UnitReviewProviderExecutionDecision = {
      schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
      source_request_schema_version: "content-pipeline-review-provider-execution-request/v0.1",
      request_key: malformedRequest.request_key,
      chain_key: malformedRequest.chain_key,
      unit_id: malformedRequest.unit_id,
      execution_action: malformedRequest.execution_action,
      requested_start_role: "assessment_designer",
      requested_roles: ["assessment_designer", "qa_agent"],
      estimated_provider_call_count: 2,
      human_queue: "rerun_decision_queue",
      primary_human_action: "decide_scoped_rerun",
      decision_status: "rejected",
      execution_permission: "denied",
      reviewer_id: "ops_lead_001",
      reviewed_at: "2026-04-24T00:05:00.000Z",
      budget_check_status: "failed"
    };

    const validation = validateUnitReviewProviderExecutionDecision(malformedRequest, decision);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "source_request_contract_mismatch" })
      ])
    );
  });

  it("rejects whitespace-only reviewer ids when recording decisions", () => {
    expect(() =>
      recordUnitReviewProviderExecutionDecision(baseRequest, {
        reviewer_id: "   ",
        decision: "approved",
        budget_check_status: "passed"
      })
    ).toThrow(/reviewer_id must be a non-empty string/);
  });

  it("rejects approved decisions when budget check did not pass", () => {
    const decision: UnitReviewProviderExecutionDecision = {
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
      execution_permission: "denied",
      reviewer_id: "ops_lead_001",
      reviewed_at: "2026-04-24T00:05:00.000Z",
      budget_check_status: "failed"
    };

    const validation = validateUnitReviewProviderExecutionDecision(baseRequest, decision);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "approval_requires_budget_pass" })
      ])
    );
  });

  it("reports malformed reviewer/timestamp fields instead of throwing", () => {
    const malformedDecision = {
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
      reviewer_id: null,
      reviewed_at: null,
      budget_check_status: "passed"
    } as unknown as UnitReviewProviderExecutionDecision;

    expect(() => validateUnitReviewProviderExecutionDecision(baseRequest, malformedDecision)).not.toThrow();
    const validation = validateUnitReviewProviderExecutionDecision(baseRequest, malformedDecision);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "missing_reviewer_id" }),
        expect.objectContaining({ code: "invalid_reviewed_at" })
      ])
    );
  });
});
