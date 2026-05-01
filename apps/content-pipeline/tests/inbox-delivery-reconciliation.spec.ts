import { describe, expect, it } from "vitest";

import {
  buildUnitReviewInboxDeliveryReconciliation,
  type UnitReviewInboxDeliveryPlan,
  type UnitReviewInboxDeliveryReceipt,
  validateUnitReviewInboxDeliveryReconciliation
} from "../src";

describe("review inbox delivery reconciliation", () => {
  const createPlan: UnitReviewInboxDeliveryPlan = {
    schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
    chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
    source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
    delivery_action: "create_inbox_item",
    final_active_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
    final_active_queue: "approval_queue",
    upsert: {
      operation_key:
        "content-pipeline:delivery:upsert:content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      human_queue: "approval_queue",
      title: "[Approval] math_g8_linear_function_intro",
      summary: "Ready for approval.",
      primary_human_action: "approve_review_artifact",
      automation_step: "open_inbox_item",
      labels: ["content_pipeline_review"]
    },
    close: [],
    decision_boundary: {
      requires_provider_execution: false,
      requires_human_decision: true,
      provider_execution_allowed_without_human: false
    }
  };

  it("marks the chain closed when delivery applied cleanly", () => {
    const receipt: UnitReviewInboxDeliveryReceipt = {
      schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
      source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
      chain_key: createPlan.chain_key,
      source_item_key: createPlan.source_item_key,
      delivery_action: createPlan.delivery_action,
      executed_at: "2026-04-23T18:20:00.000Z",
      overall_status: "applied",
      final_active_item_key: createPlan.final_active_item_key,
      final_active_queue: createPlan.final_active_queue,
      operations: [
        {
          operation_key: createPlan.upsert.operation_key,
          operation_type: "upsert",
          target_item_key: createPlan.upsert.item_key,
          status: "applied"
        }
      ]
    };

    const reconciliation = buildUnitReviewInboxDeliveryReconciliation(createPlan, receipt);

    expect(reconciliation).toMatchObject({
      schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
      receipt_validation_ok: true,
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      unresolved_operations: []
    });
  });

  it("recommends cleanup when only predecessor close operations failed", () => {
    const plan: UnitReviewInboxDeliveryPlan = {
      ...createPlan,
      delivery_action: "replace_predecessor_inbox_item",
      source_item_key: "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
      final_active_item_key:
        "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
      final_active_queue: "rerun_decision_queue",
      upsert: {
        ...createPlan.upsert,
        operation_key:
          "content-pipeline:delivery:upsert:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
        item_key: "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
        human_queue: "rerun_decision_queue",
        title: "[Rerun Decision] math_g8_linear_function_intro",
        summary: "Blocked artifact can attempt a scoped rerun.",
        primary_human_action: "decide_scoped_rerun"
      },
      close: [
        {
          operation_key:
            "content-pipeline:delivery:close:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z:superseded_by:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
          item_key: "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z",
          reason: "superseded_by_new_artifact"
        }
      ]
    };
    const receipt: UnitReviewInboxDeliveryReceipt = {
      schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
      source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
      chain_key: plan.chain_key,
      source_item_key: plan.source_item_key,
      delivery_action: plan.delivery_action,
      executed_at: "2026-04-23T18:20:00.000Z",
      overall_status: "partially_applied",
      final_active_item_key: plan.final_active_item_key,
      final_active_queue: plan.final_active_queue,
      operations: [
        {
          operation_key: plan.upsert.operation_key,
          operation_type: "upsert",
          target_item_key: plan.upsert.item_key,
          status: "applied"
        },
        {
          operation_key: plan.close[0]!.operation_key,
          operation_type: "close",
          target_item_key: plan.close[0]!.item_key,
          status: "failed"
        }
      ]
    };

    const reconciliation = buildUnitReviewInboxDeliveryReconciliation(plan, receipt);

    expect(reconciliation).toMatchObject({
      receipt_validation_ok: true,
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_cleanup_predecessor",
      unresolved_operations: [
        {
          operation_type: "close",
          status: "failed"
        }
      ]
    });
  });

  it("recommends receipt triage when the receipt itself is invalid", () => {
    const receipt: UnitReviewInboxDeliveryReceipt = {
      schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
      source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
      chain_key: createPlan.chain_key,
      source_item_key: createPlan.source_item_key,
      delivery_action: createPlan.delivery_action,
      executed_at: "2026-04-23T18:20:00.000Z",
      overall_status: "applied",
      final_active_item_key: null,
      final_active_queue: null,
      operations: [
        {
          operation_key: createPlan.upsert.operation_key,
          operation_type: "upsert",
          target_item_key: createPlan.upsert.item_key,
          status: "applied"
        }
      ]
    };

    const reconciliation = buildUnitReviewInboxDeliveryReconciliation(createPlan, receipt);

    expect(reconciliation).toMatchObject({
      receipt_validation_ok: false,
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_receipt_triage"
    });
    expect(reconciliation.receipt_validation_issue_codes).toContain("final_active_state_mismatch");
  });

  it("fails validation when the declared follow-up diverges from the derived reconciliation", () => {
    const receipt: UnitReviewInboxDeliveryReceipt = {
      schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
      source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
      chain_key: createPlan.chain_key,
      source_item_key: createPlan.source_item_key,
      delivery_action: createPlan.delivery_action,
      executed_at: "2026-04-23T18:20:00.000Z",
      overall_status: "applied",
      final_active_item_key: createPlan.final_active_item_key,
      final_active_queue: createPlan.final_active_queue,
      operations: [
        {
          operation_key: createPlan.upsert.operation_key,
          operation_type: "upsert",
          target_item_key: createPlan.upsert.item_key,
          status: "applied"
        }
      ]
    };
    const reconciliation = buildUnitReviewInboxDeliveryReconciliation(createPlan, receipt);
    reconciliation.recommended_follow_up = "manual_repair_delivery";

    const validation = validateUnitReviewInboxDeliveryReconciliation(createPlan, receipt, reconciliation);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "recommended_follow_up_mismatch",
      message: "Reconciliation recommended_follow_up must match the derived follow-up action for the source receipt."
    });
  });
});
