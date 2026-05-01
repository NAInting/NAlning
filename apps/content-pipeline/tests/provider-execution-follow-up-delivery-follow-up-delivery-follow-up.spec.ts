import { describe, expect, it } from "vitest";

import type {
  UnitReviewProviderExecutionAttempt,
  UnitReviewProviderExecutionDecision,
  UnitReviewProviderExecutionFollowUp,
  UnitReviewProviderExecutionFollowUpDeliveryFollowUp,
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceipt,
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation,
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan,
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt,
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation,
  UnitReviewProviderExecutionFollowUpPlan,
  UnitReviewProviderExecutionFollowUpReceipt,
  UnitReviewProviderExecutionFollowUpReconciliation,
  UnitReviewProviderExecutionReceipt,
  UnitReviewProviderExecutionReconciliation,
  UnitReviewProviderExecutionRequest,
} from "../src";
import {
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUp,
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUp,
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceipt,
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation,
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan,
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt,
  buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation,
  buildUnitReviewProviderExecutionFollowUpPlan,
  buildUnitReviewProviderExecutionFollowUpReceipt,
  buildUnitReviewProviderExecutionFollowUpReconciliation,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUp,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSource,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlanSource,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceipt,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceiptSource,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationSource,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpSource,
} from "../src";

describe("provider execution follow-up delivery follow-up post-delivery routing", () => {
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

  function buildManualChain(): {
    followUpPlan: UnitReviewProviderExecutionFollowUpPlan;
    followUpReceipt: UnitReviewProviderExecutionFollowUpReceipt;
    followUpReconciliation: UnitReviewProviderExecutionFollowUpReconciliation;
    deliveryFollowUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUp;
    deliveryPlan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan;
    deliveryReceipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt;
    deliveryReconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation;
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
    const deliveryPlan = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan(
      deliveryFollowUp
    );
    const deliveryReceipt =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt(deliveryPlan, {
        executed_at: "2026-04-24T00:45:00.000Z",
      });
    const deliveryReconciliation =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation(
        deliveryPlan,
        deliveryReceipt
      );
    return {
      followUpPlan,
      followUpReceipt,
      followUpReconciliation,
      deliveryFollowUp,
      deliveryPlan,
      deliveryReceipt,
      deliveryReconciliation,
    };
  }

  function buildArtifactChain(): {
    followUpPlan: UnitReviewProviderExecutionFollowUpPlan;
    followUpReceipt: UnitReviewProviderExecutionFollowUpReceipt;
    followUpReconciliation: UnitReviewProviderExecutionFollowUpReconciliation;
    deliveryFollowUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUp;
    deliveryPlan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan;
    deliveryReceipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt;
    deliveryReconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation;
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
    const deliveryPlan = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan(
      deliveryFollowUp
    );
    const deliveryReceipt =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt(deliveryPlan, {
        executed_at: "2026-04-24T00:45:00.000Z",
      });
    const deliveryReconciliation =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation(
        deliveryPlan,
        deliveryReceipt
      );
    return {
      followUpPlan,
      followUpReceipt,
      followUpReconciliation,
      deliveryFollowUp,
      deliveryPlan,
      deliveryReceipt,
      deliveryReconciliation,
    };
  }

  function buildManualExecutorChain(): {
    followUpPlan: UnitReviewProviderExecutionFollowUpPlan;
    followUpReceipt: UnitReviewProviderExecutionFollowUpReceipt;
    followUpReconciliation: UnitReviewProviderExecutionFollowUpReconciliation;
    deliveryFollowUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUp;
    deliveryPlan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan;
    deliveryReceipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt;
    deliveryReconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation;
    postDelivery: ReturnType<
      typeof buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUp
    >;
  } {
    const chain = buildManualChain();
    const postDelivery =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUp(
        chain.deliveryPlan,
        chain.deliveryReconciliation
      );
    return {
      ...chain,
      postDelivery,
    };
  }

  function buildDeepestExecutorChain(): {
    followUpPlan: UnitReviewProviderExecutionFollowUpPlan;
    followUpReceipt: UnitReviewProviderExecutionFollowUpReceipt;
    followUpReconciliation: UnitReviewProviderExecutionFollowUpReconciliation;
    deliveryFollowUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUp;
    deliveryPlan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan;
    deliveryReceipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt;
    deliveryReconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation;
    postDelivery: ReturnType<
      typeof buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUp
    >;
    executorPlan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan;
    executorReceipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceipt;
    executorReconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation;
  } {
    const chain = buildManualExecutorChain();
    const executorPlan =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
        chain.postDelivery
      );
    const executorReceipt =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceipt(
        executorPlan,
        {
          executed_at: "2026-04-24T01:20:00.000Z",
        }
      );
    const executorReconciliation =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
        executorPlan,
        executorReceipt
      );

    return {
      ...chain,
      executorPlan,
      executorReceipt,
      executorReconciliation,
    };
  }

  it("keeps trusted artifact handoff branches closed after executor reconciliation", () => {
    const artifactChain = buildArtifactChain();

    const postDelivery =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUp(
        artifactChain.deliveryPlan,
        artifactChain.deliveryReconciliation
      );

    expect(postDelivery).toMatchObject({
      follow_up_state: "result_artifact_handoff_ready",
      follow_up_action: "defer_to_result_artifact_contract",
      follow_up_delivery_follow_up_chain_closed: true,
      result_artifact_handoff: {
        expected_schema_version: "content-pipeline-review-artifact/v0.1",
      },
      active_follow_up_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false,
      },
      follow_up_item: null,
    });
  });

  it("routes delivered manual triage branches to manual_follow_up_item_delivered", () => {
    const manualChain = buildManualChain();
    const sourceValidation =
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpSource(
        baseRequest,
        approvedDecision,
        authorizedAttempt,
        failedSourceReceipt,
        failedSourceReconciliation,
        failedFollowUp,
        manualChain.followUpPlan,
        manualChain.followUpReceipt,
        manualChain.followUpReconciliation,
        manualChain.deliveryFollowUp,
        manualChain.deliveryPlan,
        manualChain.deliveryReceipt,
        manualChain.deliveryReconciliation
      );
    expect(sourceValidation.ok).toBe(true);

    const postDelivery =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUp(
        manualChain.deliveryPlan,
        manualChain.deliveryReconciliation
      );
    const validation =
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUp(
        manualChain.deliveryPlan,
        manualChain.deliveryReconciliation,
        postDelivery
      );

    expect(postDelivery).toMatchObject({
      follow_up_state: "manual_follow_up_item_delivered",
      follow_up_action: "none",
      active_follow_up_item: {
        human_queue: "manual_triage_queue",
        should_remain_open: true,
      },
      follow_up_item: null,
    });
    expect(validation.ok).toBe(true);
  });

  it("opens receipt triage when the executor receipt no longer validates", () => {
    const manualChain = buildManualChain();
    const invalidDeliveryReceipt = {
      ...manualChain.deliveryReceipt,
      final_follow_up_item_key: "forged-follow-up-item",
    };
    const invalidDeliveryReconciliation =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation(
        manualChain.deliveryPlan,
        invalidDeliveryReceipt
      );

    const postDelivery =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUp(
        manualChain.deliveryPlan,
        invalidDeliveryReconciliation
      );

    expect(postDelivery).toMatchObject({
      follow_up_state: "receipt_triage_required",
      follow_up_action: "open_manual_receipt_triage_item",
      result_artifact_handoff: null,
      active_follow_up_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false,
      },
    });
    expect(postDelivery.follow_up_item?.summary).toContain(
      "final_follow_up_state_mismatch"
    );
  });

  it("builds and validates a no-op executor plan for trusted artifact handoff branches", () => {
    const artifactChain = buildArtifactChain();
    const postDelivery =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUp(
        artifactChain.deliveryPlan,
        artifactChain.deliveryReconciliation
      );
    const executorPlan =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
        postDelivery
      );

    expect(executorPlan).toMatchObject({
      schema_version:
        "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1",
      follow_up_state: "result_artifact_handoff_ready",
      delivery_action: "none",
      preserved_result_artifact_handoff: {
        expected_schema_version: "content-pipeline-review-artifact/v0.1",
      },
      final_follow_up_item_key: null,
      upsert: null,
    });

    const validation =
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
        postDelivery,
        executorPlan
      );
    expect(validation.ok).toBe(true);
  });

  it("builds a no-op executor plan that preserves the trusted active follow-up item", () => {
    const manualExecutorChain = buildManualExecutorChain();
    const sourceValidation =
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlanSource(
        baseRequest,
        approvedDecision,
        authorizedAttempt,
        failedSourceReceipt,
        failedSourceReconciliation,
        failedFollowUp,
        manualExecutorChain.followUpPlan,
        manualExecutorChain.followUpReceipt,
        manualExecutorChain.followUpReconciliation,
        manualExecutorChain.deliveryFollowUp,
        manualExecutorChain.deliveryPlan,
        manualExecutorChain.deliveryReceipt,
        manualExecutorChain.deliveryReconciliation,
        manualExecutorChain.postDelivery
      );
    const executorPlan =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
        manualExecutorChain.postDelivery
      );

    expect(sourceValidation.ok).toBe(true);
    expect(executorPlan).toMatchObject({
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

  it("creates an executor upsert plan and routes failed delivery to manual repair follow-up", () => {
    const followUpPlan = buildUnitReviewProviderExecutionFollowUpPlan(failedFollowUp);
    const failedFollowUpReceipt = buildUnitReviewProviderExecutionFollowUpReceipt(
      followUpPlan,
      {
        executed_at: "2026-04-24T01:05:00.000Z",
        upsert_status: "failed",
      }
    );
    const failedFollowUpReconciliation =
      buildUnitReviewProviderExecutionFollowUpReconciliation(
        followUpPlan,
        failedFollowUpReceipt
      );
    const repairDeliveryFollowUp = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUp(
      followUpPlan,
      failedFollowUpReconciliation
    );
    const repairDeliveryPlan = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan(
      repairDeliveryFollowUp
    );
    const repairDeliveryReceipt = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt(
      repairDeliveryPlan,
      {
        executed_at: "2026-04-24T01:08:00.000Z",
        upsert_status: "failed",
      }
    );
    const repairDeliveryReconciliation =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation(
        repairDeliveryPlan,
        repairDeliveryReceipt
      );
    const repairPostDelivery =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUp(
        repairDeliveryPlan,
        repairDeliveryReconciliation
      );
    const executorPlan =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
        repairPostDelivery
      );
    const executorReceipt =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceipt(
        executorPlan,
        {
          executed_at: "2026-04-24T01:10:00.000Z",
          upsert_status: "failed",
        }
      );
    const executorReconciliation =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
        executorPlan,
        executorReceipt
      );

    expect(executorPlan).toMatchObject({
      follow_up_state: "repair_follow_up_delivery_follow_up_required",
      delivery_action: "create_follow_up_inbox_item",
      upsert: {
        human_queue: "manual_triage_queue",
      },
    });
    expect(executorReceipt).toMatchObject({
      overall_status: "failed",
      final_follow_up_item_key: null,
      operations: [
        expect.objectContaining({
          operation_type: "upsert",
          status: "failed",
        }),
      ],
    });
    expect(executorReconciliation).toMatchObject({
      receipt_validation_ok: true,
      reconciliation_status: "action_required",
      recommended_follow_up:
        "manual_repair_provider_execution_follow_up_delivery_follow_up_delivery_follow_up",
      delivery_status: "failed",
    });

    const receiptValidation =
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceipt(
        executorPlan,
        executorReceipt
      );
    const reconciliationValidation =
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
        executorPlan,
        executorReceipt,
        executorReconciliation
      );
    expect(receiptValidation.ok).toBe(true);
    expect(reconciliationValidation.ok).toBe(true);
  });

  it("routes invalid executor receipts to manual receipt triage without trusting forged targets", () => {
    const manualExecutorChain = buildManualExecutorChain();
    const executorPlan =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
        manualExecutorChain.postDelivery
      );
    const executorReceipt =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceipt(
        executorPlan,
        {
          executed_at: "2026-04-24T01:12:00.000Z",
        }
      );
    const invalidExecutorReceipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceipt =
      {
        ...executorReceipt,
        final_follow_up_item_key: "forged-follow-up-item",
      };
    const executorReconciliation =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
        executorPlan,
        invalidExecutorReceipt
      );

    expect(executorReconciliation).toMatchObject({
      receipt_validation_ok: false,
      recommended_follow_up: "manual_receipt_triage",
      delivery_status: null,
      final_follow_up_item_key: null,
    });
    expect(executorReconciliation.preserved_active_follow_up_item).toMatchObject({
      human_queue: "manual_triage_queue",
      should_remain_open: true,
    });
  });

  it("fails closed when executor builders receive malformed source payloads directly", () => {
    const manualExecutorChain = buildManualExecutorChain();

    expect(() =>
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan({
        ...manualExecutorChain.postDelivery,
        follow_up_state: "repair_follow_up_delivery_follow_up_required",
        follow_up_action: "none",
      })
    ).toThrow(/source is invalid/i);

    const executorPlan =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
        manualExecutorChain.postDelivery
      );

    expect(() =>
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceipt(
        {
          ...executorPlan,
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
          executed_at: "2026-04-24T01:14:00.000Z",
        }
      )
    ).toThrow(/source plan is invalid/i);

    const executorReceipt =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceipt(
        executorPlan,
        {
          executed_at: "2026-04-24T01:14:00.000Z",
        }
      );

    expect(() =>
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
        {
          ...executorPlan,
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
        executorReceipt
      )
    ).toThrow(/source plan is invalid/i);
  });

  it("rejects tampered executor receipt chains and reconciliation payloads", () => {
    const manualExecutorChain = buildManualExecutorChain();
    const executorPlan =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
        manualExecutorChain.postDelivery
      );
    const executorReceipt =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceipt(
        executorPlan,
        {
          executed_at: "2026-04-24T01:16:00.000Z",
        }
      );
    const sourceValidation =
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceiptSource(
        baseRequest,
        approvedDecision,
        authorizedAttempt,
        failedSourceReceipt,
        failedSourceReconciliation,
        failedFollowUp,
        manualExecutorChain.followUpPlan,
        manualExecutorChain.followUpReceipt,
        manualExecutorChain.followUpReconciliation,
        manualExecutorChain.deliveryFollowUp,
        manualExecutorChain.deliveryPlan,
        manualExecutorChain.deliveryReceipt,
        manualExecutorChain.deliveryReconciliation,
        manualExecutorChain.postDelivery,
        executorPlan
      );
    expect(sourceValidation.ok).toBe(true);

    const tamperedReceipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceipt =
      {
        ...executorReceipt,
        final_follow_up_item_key: "forged-item",
      };
    const reconciliationSourceValidation =
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationSource(
        baseRequest,
        approvedDecision,
        authorizedAttempt,
        failedSourceReceipt,
        failedSourceReconciliation,
        failedFollowUp,
        manualExecutorChain.followUpPlan,
        manualExecutorChain.followUpReceipt,
        manualExecutorChain.followUpReconciliation,
        manualExecutorChain.deliveryFollowUp,
        manualExecutorChain.deliveryPlan,
        manualExecutorChain.deliveryReceipt,
        manualExecutorChain.deliveryReconciliation,
        manualExecutorChain.postDelivery,
        executorPlan,
        tamperedReceipt
      );

    expect(reconciliationSourceValidation.ok).toBe(false);
    expect(reconciliationSourceValidation.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code:
            "source_follow_up_delivery_follow_up_delivery_follow_up_receipt_contract_mismatch",
        }),
      ])
    );

    const reconciliation =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
        executorPlan,
        executorReceipt
      );
    const tamperedReconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation =
      {
        ...reconciliation,
        recommended_follow_up: "manual_receipt_triage",
      };
    const validation =
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
        executorPlan,
        executorReceipt,
        tamperedReconciliation
      );

    expect(validation.ok).toBe(false);
    expect(validation.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "recommended_follow_up_mismatch" }),
      ])
    );
  });

  it("keeps trusted artifact handoff branches closed after the downstream executor trio", () => {
    const artifactChain = buildArtifactChain();
    const postDelivery =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUp(
        artifactChain.deliveryPlan,
        artifactChain.deliveryReconciliation
      );
    const executorPlan =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
        postDelivery
      );
    const executorReceipt =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceipt(
        executorPlan,
        {
          executed_at: "2026-04-24T01:22:00.000Z",
        }
      );
    const executorReconciliation =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
        executorPlan,
        executorReceipt
      );

    const downstreamRouting =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        executorPlan,
        executorReconciliation
      );

    expect(downstreamRouting).toMatchObject({
      follow_up_state: "result_artifact_handoff_ready",
      follow_up_action: "defer_to_result_artifact_contract",
      follow_up_delivery_follow_up_delivery_follow_up_chain_closed: true,
      result_artifact_handoff: {
        expected_schema_version: "content-pipeline-review-artifact/v0.1",
      },
      active_follow_up_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false,
      },
      follow_up_item: null,
    });
  });

  it("routes delivered manual triage branches to manual_follow_up_item_delivered after the downstream executor trio", () => {
    const chain = buildDeepestExecutorChain();
    const sourceValidation =
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSource(
        baseRequest,
        approvedDecision,
        authorizedAttempt,
        failedSourceReceipt,
        failedSourceReconciliation,
        failedFollowUp,
        chain.followUpPlan,
        chain.followUpReceipt,
        chain.followUpReconciliation,
        chain.deliveryFollowUp,
        chain.deliveryPlan,
        chain.deliveryReceipt,
        chain.deliveryReconciliation,
        chain.postDelivery,
        chain.executorPlan,
        chain.executorReceipt,
        chain.executorReconciliation
      );
    expect(sourceValidation.ok).toBe(true);

    const downstreamRouting =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        chain.executorPlan,
        chain.executorReconciliation
      );
    const validation =
      validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        chain.executorPlan,
        chain.executorReconciliation,
        downstreamRouting
      );

    expect(downstreamRouting).toMatchObject({
      follow_up_state: "manual_follow_up_item_delivered",
      follow_up_action: "none",
      active_follow_up_item: {
        human_queue: "manual_triage_queue",
        should_remain_open: true,
      },
      follow_up_item: null,
    });
    expect(validation.ok).toBe(true);
  });

  it("opens receipt triage when the downstream executor receipt no longer validates", () => {
    const chain = buildDeepestExecutorChain();
    const invalidExecutorReceipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceipt =
      {
        ...chain.executorReceipt,
        final_follow_up_item_key: "forged-follow-up-item",
      };
    const invalidExecutorReconciliation =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
        chain.executorPlan,
        invalidExecutorReceipt
      );

    const downstreamRouting =
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        chain.executorPlan,
        invalidExecutorReconciliation
      );

    expect(downstreamRouting).toMatchObject({
      follow_up_state: "receipt_triage_required",
      follow_up_action: "open_manual_receipt_triage_item",
      result_artifact_handoff: null,
      active_follow_up_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false,
      },
    });
    expect(downstreamRouting.follow_up_item?.summary).toContain(
      "final_follow_up_state_mismatch"
    );
  });

  it("fails closed when downstream provider post-delivery routing builders receive malformed source payloads", () => {
    const chain = buildDeepestExecutorChain();
    const malformedExecutorPlan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan =
      {
        ...chain.executorPlan,
        schema_version:
          "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan/invalid",
      } as unknown as UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan;

    expect(() =>
      buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
        malformedExecutorPlan,
        chain.executorReconciliation
      )
    ).toThrow(/source is invalid/i);
  });
});
