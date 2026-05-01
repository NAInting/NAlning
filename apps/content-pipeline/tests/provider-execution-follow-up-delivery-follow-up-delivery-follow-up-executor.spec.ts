import { describe, expect, it } from "vitest";

import type {
  UnitReviewProviderExecutionAttempt,
  UnitReviewProviderExecutionDecision,
  UnitReviewProviderExecutionFollowUp,
  UnitReviewProviderExecutionFollowUpDeliveryFollowUp,
  UnitReviewProviderExecutionFollowUpPlan,
  UnitReviewProviderExecutionFollowUpReceipt,
  UnitReviewProviderExecutionFollowUpReconciliation,
  UnitReviewProviderExecutionReceipt,
  UnitReviewProviderExecutionReconciliation,
  UnitReviewProviderExecutionRequest,
} from "../src";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUp,
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan,
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt,
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation,
  buildUnitReviewProviderExecutionFollowUpPlan,
  buildUnitReviewProviderExecutionFollowUpReceipt,
  buildUnitReviewProviderExecutionFollowUpReconciliation,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlanSource,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpReceiptSource,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliationSource,
} from "../src";

describe("provider execution follow-up delivery follow-up executor contracts", () => {
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

  const failedSourceReceipt: UnitReviewProviderExecutionReceipt = {
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

  const failedSourceReconciliation: UnitReviewProviderExecutionReconciliation = {
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

  const failedFollowUp: UnitReviewProviderExecutionFollowUp = {
    schema_version: "content-pipeline-review-provider-execution-follow-up/v0.1",
    source_request_schema_version: "content-pipeline-review-provider-execution-request/v0.1",
    source_decision_schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
    source_attempt_schema_version: "content-pipeline-review-provider-execution-attempt/v0.1",
    source_receipt_schema_version: "content-pipeline-review-provider-execution-receipt/v0.1",
    source_reconciliation_schema_version:
      "content-pipeline-review-provider-execution-reconciliation/v0.1",
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

  const artifactSourceReceipt: UnitReviewProviderExecutionReceipt = {
    ...failedSourceReceipt,
    receipt_status: "artifact_recorded",
    actual_provider_call_count: 2,
    result_artifact_schema_version: "content-pipeline-review-artifact/v0.1",
    result_artifact_generated_at: "2026-04-24T00:30:00.000Z",
    result_artifact_status: "ready_for_human_review",
  };

  const artifactSourceReconciliation: UnitReviewProviderExecutionReconciliation = {
    ...failedSourceReconciliation,
    reconciliation_status: "closed",
    recommended_follow_up: "review_result_artifact",
    execution_outcome: "artifact_recorded",
    result_artifact_available: true,
    result_artifact_generated_at: "2026-04-24T00:30:00.000Z",
    result_artifact_status: "ready_for_human_review",
    actual_provider_call_count: 2,
    failure_code: null,
  };

  const artifactFollowUp: UnitReviewProviderExecutionFollowUp = {
    ...failedFollowUp,
    source_reconciliation_status: "closed",
    source_recommended_follow_up: "review_result_artifact",
    source_execution_outcome: "artifact_recorded",
    follow_up_state: "result_artifact_review_required",
    follow_up_action: "defer_to_result_artifact_contract",
    provider_execution_chain_closed: true,
    result_artifact_handoff: {
      expected_schema_version: "content-pipeline-review-artifact/v0.1",
      generated_at: "2026-04-24T00:30:00.000Z",
      status: "ready_for_human_review",
    },
    automation_step: "none",
    decision_boundary: {
      requires_provider_execution: false,
      requires_human_decision: false,
      provider_execution_allowed_without_human: false,
    },
    follow_up_item: null,
  };

  function buildManualDeliveryChain(): {
    followUpPlan: UnitReviewProviderExecutionFollowUpPlan;
    followUpReceipt: UnitReviewProviderExecutionFollowUpReceipt;
    followUpReconciliation: UnitReviewProviderExecutionFollowUpReconciliation;
    deliveryFollowUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUp;
  } {
    const followUpPlan = buildUnitReviewProviderExecutionFollowUpPlan(failedFollowUp);
    const followUpReceipt = buildUnitReviewProviderExecutionFollowUpReceipt(followUpPlan, {
      executed_at: "2026-04-24T00:35:00.000Z",
    });
    const followUpReconciliation = buildUnitReviewProviderExecutionFollowUpReconciliation(
      followUpPlan,
      followUpReceipt
    );
    const deliveryFollowUp = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUp(
      followUpPlan,
      followUpReconciliation
    );
    return {
      followUpPlan,
      followUpReceipt,
      followUpReconciliation,
      deliveryFollowUp,
    };
  }

  function buildArtifactDeliveryChain(): {
    followUpPlan: UnitReviewProviderExecutionFollowUpPlan;
    followUpReceipt: UnitReviewProviderExecutionFollowUpReceipt;
    followUpReconciliation: UnitReviewProviderExecutionFollowUpReconciliation;
    deliveryFollowUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUp;
  } {
    const followUpPlan = buildUnitReviewProviderExecutionFollowUpPlan(artifactFollowUp);
    const followUpReceipt = buildUnitReviewProviderExecutionFollowUpReceipt(followUpPlan, {
      executed_at: "2026-04-24T00:35:00.000Z",
    });
    const followUpReconciliation = buildUnitReviewProviderExecutionFollowUpReconciliation(
      followUpPlan,
      followUpReceipt
    );
    const deliveryFollowUp = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUp(
      followUpPlan,
      followUpReconciliation
    );
    return {
      followUpPlan,
      followUpReceipt,
      followUpReconciliation,
      deliveryFollowUp,
    };
  }

  it("builds a no-op plan for trusted result artifact handoff branches", () => {
    const { deliveryFollowUp } = buildArtifactDeliveryChain();
    const plan = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan(deliveryFollowUp);

    expect(plan).toMatchObject({
      schema_version:
        "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-plan/v0.1",
      follow_up_state: "result_artifact_handoff_ready",
      delivery_action: "none",
      preserved_result_artifact_handoff: {
        expected_schema_version: "content-pipeline-review-artifact/v0.1",
        status: "ready_for_human_review",
      },
      preserved_active_follow_up_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false,
      },
      final_follow_up_item_key: null,
      upsert: null,
    });
  });

  it("preserves the trusted active follow-up item when the post-delivery chain is already delivered", () => {
    const { followUpPlan, deliveryFollowUp } = buildManualDeliveryChain();
    const plan = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan(deliveryFollowUp);

    expect(plan).toMatchObject({
      follow_up_state: "manual_follow_up_item_delivered",
      delivery_action: "none",
      preserved_active_follow_up_item: {
        human_queue: "manual_triage_queue",
        should_remain_open: true,
      },
      final_follow_up_queue: "manual_triage_queue",
      upsert: null,
    });
  });

  it("creates an upsert plan and validates the full source chain for repair branches", () => {
    const { followUpPlan, followUpReceipt, followUpReconciliation, deliveryFollowUp } =
      buildManualDeliveryChain();
    const failedReceipt = buildUnitReviewProviderExecutionFollowUpReceipt(followUpPlan, {
      executed_at: "2026-04-24T00:35:00.000Z",
      upsert_status: "failed",
    });
    const failedReconciliation = buildUnitReviewProviderExecutionFollowUpReconciliation(
      followUpPlan,
      failedReceipt
    );
    const repairDeliveryFollowUp = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUp(
      followUpPlan,
      failedReconciliation
    );
    const plan = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan(
      repairDeliveryFollowUp
    );
    const sourceValidation =
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlanSource(
        baseRequest,
        approvedDecision,
        authorizedAttempt,
        failedSourceReceipt,
        failedSourceReconciliation,
        failedFollowUp,
        followUpPlan,
        followUpReceipt,
        followUpReconciliation,
        deliveryFollowUp
      );

    expect(sourceValidation.ok).toBe(true);
    expect(plan).toMatchObject({
      follow_up_state: "repair_follow_up_delivery_required",
      delivery_action: "create_follow_up_inbox_item",
      upsert: {
        human_queue: "manual_triage_queue",
      },
    });

    const tamperedPlan = {
      ...plan,
      final_follow_up_queue: null,
    };
    const validation = validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan(
      repairDeliveryFollowUp,
      tamperedPlan
    );

    expect(validation.ok).toBe(false);
    expect(validation.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "final_follow_up_state_mismatch" }),
      ])
    );
  });

  it("keeps preserved active items across no-op receipts and nulls new targets on failed upserts", () => {
    const { followUpPlan, deliveryFollowUp } = buildManualDeliveryChain();
    const deliveredPlan = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan(
      deliveryFollowUp
    );
    const deliveredReceipt = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt(
      deliveredPlan,
      {
        executed_at: "2026-04-24T00:45:00.000Z",
      }
    );

    expect(deliveredReceipt).toMatchObject({
      overall_status: "applied",
      final_follow_up_queue: "manual_triage_queue",
      preserved_active_follow_up_item: {
        human_queue: "manual_triage_queue",
        should_remain_open: true,
      },
      operations: [],
    });

    const failedFollowUpReceipt = buildUnitReviewProviderExecutionFollowUpReceipt(
      followUpPlan,
      {
        executed_at: "2026-04-24T00:44:00.000Z",
        upsert_status: "failed",
      }
    );
    const failedFollowUpReconciliation =
      buildUnitReviewProviderExecutionFollowUpReconciliation(
        followUpPlan,
        failedFollowUpReceipt
      );
    const repairDeliveryFollowUp =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUp(
        followUpPlan,
        failedFollowUpReconciliation
      );
    const repairPlan = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan(
      repairDeliveryFollowUp
    );
    const failedReceipt = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt(
      repairPlan,
      {
        executed_at: "2026-04-24T00:45:00.000Z",
        upsert_status: "failed",
      }
    );

    expect(failedReceipt).toMatchObject({
      overall_status: "failed",
      final_follow_up_item_key: null,
      operations: [
        expect.objectContaining({
          operation_type: "upsert",
          status: "failed",
        }),
      ],
    });
  });

  it("routes trusted artifact handoff, repair, and invalid receipt branches in reconciliation", () => {
    const artifactChain = buildArtifactDeliveryChain();
    const artifactPlan = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan(
      artifactChain.deliveryFollowUp
    );
    const artifactReceipt = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt(
      artifactPlan,
      {
        executed_at: "2026-04-24T00:55:00.000Z",
      }
    );
    const artifactReconciliation =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation(
        artifactPlan,
        artifactReceipt
      );

    expect(artifactReconciliation).toMatchObject({
      receipt_validation_ok: true,
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      result_artifact_handoff: {
        expected_schema_version: "content-pipeline-review-artifact/v0.1",
      },
    });

    const manualChain = buildManualDeliveryChain();
    const failedFollowUpReceipt = buildUnitReviewProviderExecutionFollowUpReceipt(
      manualChain.followUpPlan,
      {
        executed_at: "2026-04-24T00:53:00.000Z",
        upsert_status: "failed",
      }
    );
    const failedFollowUpReconciliation =
      buildUnitReviewProviderExecutionFollowUpReconciliation(
        manualChain.followUpPlan,
        failedFollowUpReceipt
      );
    const repairDeliveryFollowUp =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUp(
        manualChain.followUpPlan,
        failedFollowUpReconciliation
      );
    const repairPlan = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan(
      repairDeliveryFollowUp
    );
    const repairReceipt = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt(
      repairPlan,
      {
        executed_at: "2026-04-24T00:55:00.000Z",
        upsert_status: "failed",
      }
    );
    const repairReconciliation =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation(
        repairPlan,
        repairReceipt
      );

    expect(repairReconciliation).toMatchObject({
      receipt_validation_ok: true,
      reconciliation_status: "action_required",
      recommended_follow_up:
        "manual_repair_provider_execution_follow_up_delivery_follow_up",
      delivery_status: "failed",
    });

    const invalidReceipt = {
      ...artifactReceipt,
      final_follow_up_item_key: "forged-item",
    };
    const invalidReconciliation =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation(
        artifactPlan,
        invalidReceipt
      );

    expect(invalidReconciliation).toMatchObject({
      receipt_validation_ok: false,
      recommended_follow_up: "manual_receipt_triage",
      delivery_status: null,
      final_follow_up_item_key: null,
    });
    expect(invalidReconciliation.result_artifact_handoff).toMatchObject({
      expected_schema_version: "content-pipeline-review-artifact/v0.1",
    });
  });

  it("keeps trusted source-derived context explicit on receipt triage branches", () => {
    const { followUpPlan, followUpReceipt } = buildManualDeliveryChain();
    const invalidFollowUpReceipt = {
      ...followUpReceipt,
      final_follow_up_item_key: "forged-item",
      final_follow_up_queue: "manual_triage_queue" as const,
    };
    const invalidFollowUpReconciliation =
      buildUnitReviewProviderExecutionFollowUpReconciliation(
        followUpPlan,
        invalidFollowUpReceipt
      );
    const triageFollowUp =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUp(
        followUpPlan,
        invalidFollowUpReconciliation
      );

    expect(triageFollowUp).toMatchObject({
      follow_up_state: "receipt_triage_required",
      result_artifact_handoff: null,
      preserved_active_follow_up_item: {
        item_key:
          "content-pipeline:manual_triage_queue:math_g8_linear_function_intro:provider-execution:content-pipeline:provider-execution-attempt:run_scoped_review_rerun:math_g8_linear_function_intro:2026-04-24T00:10:00.000Z",
        human_queue: "manual_triage_queue",
        should_remain_open: true,
      },
      active_follow_up_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false,
      },
      source_receipt_validation_issue_codes: ["final_follow_up_state_mismatch"],
    });
    expect(triageFollowUp.follow_up_item?.summary).toContain(
      "final_follow_up_state_mismatch"
    );
    expect(triageFollowUp.follow_up_item?.labels).toEqual(
      expect.arrayContaining([
        "active_queue:manual_triage_queue",
        "receipt_validation:final_follow_up_state_mismatch",
      ])
    );
  });

  it("fails closed when executor builders receive malformed source payloads directly", () => {
    const { deliveryFollowUp } = buildManualDeliveryChain();

    expect(() =>
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan({
        ...deliveryFollowUp,
        follow_up_state: "repair_follow_up_delivery_required",
        follow_up_action: "none",
      })
    ).toThrow(/source is invalid/i);

    const plan = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan(
      deliveryFollowUp
    );

    expect(() =>
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt(
        {
          ...plan,
          delivery_action: "none",
          upsert: {
            operation_key: "forged",
            item_key: "forged-item",
            human_queue: "manual_triage_queue",
            title: "forged",
            summary: "forged",
            primary_human_action: "perform_manual_triage",
            automation_step: "open_inbox_item",
            labels: [],
          },
        },
        {
          executed_at: "2026-04-24T00:57:00.000Z",
        }
      )
    ).toThrow(/source plan is invalid/i);

    const receipt = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt(
      plan,
      {
        executed_at: "2026-04-24T00:57:00.000Z",
      }
    );

    expect(() =>
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation(
        {
          ...plan,
          delivery_action: "none",
          upsert: {
            operation_key: "forged",
            item_key: "forged-item",
            human_queue: "manual_triage_queue",
            title: "forged",
            summary: "forged",
            primary_human_action: "perform_manual_triage",
            automation_step: "open_inbox_item",
            labels: [],
          },
        },
        receipt
      )
    ).toThrow(/source plan is invalid/i);
  });

  it("rejects tampered receipt chains and tampered reconciliation payloads", () => {
    const { followUpPlan, followUpReceipt, followUpReconciliation, deliveryFollowUp } =
      buildManualDeliveryChain();
    const deliveryPlan = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan(
      deliveryFollowUp
    );
    const deliveryReceipt = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt(
      deliveryPlan,
      {
        executed_at: "2026-04-24T00:58:00.000Z",
      }
    );
    const sourceValidation =
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpReceiptSource(
        baseRequest,
        approvedDecision,
        authorizedAttempt,
        failedSourceReceipt,
        failedSourceReconciliation,
        failedFollowUp,
        followUpPlan,
        followUpReceipt,
        followUpReconciliation,
        deliveryFollowUp,
        deliveryPlan
      );
    expect(sourceValidation.ok).toBe(true);

    const tamperedReceipt = {
      ...deliveryReceipt,
      final_follow_up_item_key: "forged-item",
    };
    const reconciliationSourceValidation =
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliationSource(
        baseRequest,
        approvedDecision,
        authorizedAttempt,
        failedSourceReceipt,
        failedSourceReconciliation,
        failedFollowUp,
        followUpPlan,
        followUpReceipt,
        followUpReconciliation,
        deliveryFollowUp,
        deliveryPlan,
        tamperedReceipt
      );

    expect(reconciliationSourceValidation.ok).toBe(false);
    expect(reconciliationSourceValidation.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "source_follow_up_delivery_follow_up_receipt_contract_mismatch",
        }),
      ])
    );

    const reconciliation =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation(
        deliveryPlan,
        deliveryReceipt
      );
    const tamperedReconciliation = {
      ...reconciliation,
      recommended_follow_up: "manual_receipt_triage" as const,
    };
    const validation =
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation(
        deliveryPlan,
        deliveryReceipt,
        tamperedReconciliation
      );

    expect(validation.ok).toBe(false);
    expect(validation.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "recommended_follow_up_mismatch" }),
      ])
    );
  });
});

