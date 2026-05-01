import { describe, expect, it } from "vitest";

import {
  buildUnitReviewInboxDeliveryFollowUpReconciliation,
  type UnitReviewInboxDeliveryFollowUpPlan,
  type UnitReviewInboxDeliveryFollowUpReceipt,
  validateUnitReviewInboxDeliveryFollowUpReconciliation
} from "../src";

describe("review inbox delivery follow-up reconciliation", () => {
  const closedPlan: UnitReviewInboxDeliveryFollowUpPlan = {
    schema_version: "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1",
    source_follow_up_schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
    chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
    source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
    follow_up_state: "delivery_closed",
    follow_up_action: "none",
    preserved_active_item: {
      item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      human_queue: "approval_queue",
      should_remain_open: true
    },
    delivery_action: "none",
    final_follow_up_item_key: null,
    final_follow_up_queue: null,
    upsert: null,
    decision_boundary: {
      requires_provider_execution: false,
      requires_human_decision: false,
      provider_execution_allowed_without_human: false
    }
  };

  it("marks the follow-up chain closed when no follow-up inbox item was required", () => {
    const receipt: UnitReviewInboxDeliveryFollowUpReceipt = {
      schema_version: "content-pipeline-review-inbox-delivery-follow-up-receipt/v0.1",
      source_follow_up_plan_schema_version: closedPlan.schema_version,
      chain_key: closedPlan.chain_key,
      source_item_key: closedPlan.source_item_key,
      follow_up_state: closedPlan.follow_up_state,
      follow_up_action: closedPlan.follow_up_action,
      delivery_action: closedPlan.delivery_action,
      executed_at: "2026-04-23T18:25:00.000Z",
      overall_status: "applied",
      preserved_active_item: closedPlan.preserved_active_item,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      operations: []
    };

    const reconciliation = buildUnitReviewInboxDeliveryFollowUpReconciliation(closedPlan, receipt);

    expect(reconciliation).toMatchObject({
      schema_version: "content-pipeline-review-inbox-delivery-follow-up-reconciliation/v0.1",
      receipt_validation_ok: true,
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      unresolved_operations: []
    });
  });

  it("recommends follow-up delivery repair when the follow-up upsert failed", () => {
    const plan: UnitReviewInboxDeliveryFollowUpPlan = {
      schema_version: "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1",
      source_follow_up_schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
      chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
      source_item_key:
        "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
      follow_up_state: "cleanup_predecessor_required",
      follow_up_action: "open_manual_cleanup_follow_up_item",
      preserved_active_item: {
        item_key:
          "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
        human_queue: "rerun_decision_queue",
        should_remain_open: true
      },
      delivery_action: "create_follow_up_inbox_item",
      final_follow_up_item_key:
        "content-pipeline:delivery-follow-up:cleanup_predecessor_required:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
      final_follow_up_queue: "manual_triage_queue",
      upsert: {
        operation_key:
          "content-pipeline:follow-up-delivery:upsert:content-pipeline:delivery-follow-up:cleanup_predecessor_required:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
        item_key:
          "content-pipeline:delivery-follow-up:cleanup_predecessor_required:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
        human_queue: "manual_triage_queue",
        title: "[Delivery Cleanup] math_g8_linear_function_intro",
        summary:
          "Current active inbox item is content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z in rerun_decision_queue. The replacement delivery left a predecessor item open, so manual cleanup is required for the superseded inbox item.",
        primary_human_action: "perform_manual_triage",
        automation_step: "open_inbox_item",
        labels: [
          "content_pipeline_delivery_follow_up",
          "chain:content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
          "source_item:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
          "state:cleanup_predecessor_required",
          "action:open_manual_cleanup_follow_up_item",
          "active_queue:rerun_decision_queue"
        ]
      },
      decision_boundary: {
        requires_provider_execution: false,
        requires_human_decision: true,
        provider_execution_allowed_without_human: false
      }
    };
    const receipt: UnitReviewInboxDeliveryFollowUpReceipt = {
      schema_version: "content-pipeline-review-inbox-delivery-follow-up-receipt/v0.1",
      source_follow_up_plan_schema_version: plan.schema_version,
      chain_key: plan.chain_key,
      source_item_key: plan.source_item_key,
      follow_up_state: plan.follow_up_state,
      follow_up_action: plan.follow_up_action,
      delivery_action: plan.delivery_action,
      executed_at: "2026-04-23T18:25:00.000Z",
      overall_status: "failed",
      preserved_active_item: plan.preserved_active_item,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      operations: [
        {
          operation_key: plan.upsert!.operation_key,
          operation_type: "upsert",
          target_item_key: plan.upsert!.item_key,
          status: "failed"
        }
      ]
    };

    const reconciliation = buildUnitReviewInboxDeliveryFollowUpReconciliation(plan, receipt);

    expect(reconciliation).toMatchObject({
      receipt_validation_ok: true,
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_repair_follow_up_delivery",
      unresolved_operations: [
        {
          operation_type: "upsert",
          status: "failed"
        }
      ]
    });
  });

  it("recommends receipt triage when the follow-up receipt itself is invalid", () => {
    const receipt: UnitReviewInboxDeliveryFollowUpReceipt = {
      schema_version: "content-pipeline-review-inbox-delivery-follow-up-receipt/v0.1",
      source_follow_up_plan_schema_version: closedPlan.schema_version,
      chain_key: closedPlan.chain_key,
      source_item_key: closedPlan.source_item_key,
      follow_up_state: closedPlan.follow_up_state,
      follow_up_action: closedPlan.follow_up_action,
      delivery_action: closedPlan.delivery_action,
      executed_at: "2026-04-23T18:25:00.000Z",
      overall_status: "applied",
      preserved_active_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false
      },
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      operations: []
    };

    const reconciliation = buildUnitReviewInboxDeliveryFollowUpReconciliation(closedPlan, receipt);

    expect(reconciliation).toMatchObject({
      receipt_validation_ok: false,
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_receipt_triage"
    });
    expect(reconciliation.receipt_validation_issue_codes).toContain("preserved_active_item_mismatch");
  });

  it("fails validation when the declared follow-up reconciliation diverges from the derived result", () => {
    const receipt: UnitReviewInboxDeliveryFollowUpReceipt = {
      schema_version: "content-pipeline-review-inbox-delivery-follow-up-receipt/v0.1",
      source_follow_up_plan_schema_version: closedPlan.schema_version,
      chain_key: closedPlan.chain_key,
      source_item_key: closedPlan.source_item_key,
      follow_up_state: closedPlan.follow_up_state,
      follow_up_action: closedPlan.follow_up_action,
      delivery_action: closedPlan.delivery_action,
      executed_at: "2026-04-23T18:25:00.000Z",
      overall_status: "applied",
      preserved_active_item: closedPlan.preserved_active_item,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      operations: []
    };
    const reconciliation = buildUnitReviewInboxDeliveryFollowUpReconciliation(closedPlan, receipt);
    reconciliation.recommended_follow_up = "manual_repair_follow_up_delivery";

    const validation = validateUnitReviewInboxDeliveryFollowUpReconciliation(closedPlan, receipt, reconciliation);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "recommended_follow_up_mismatch",
      message:
        "Follow-up delivery reconciliation recommended_follow_up must match the derived next action for the source follow-up receipt."
    });
  });
});
