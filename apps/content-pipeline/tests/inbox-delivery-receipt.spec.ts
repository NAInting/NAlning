import { describe, expect, it } from "vitest";

import {
  buildUnitReviewInboxDeliveryReceipt,
  type UnitReviewInboxDeliveryPlan,
  validateUnitReviewInboxDeliveryReceipt
} from "../src";

describe("review inbox delivery receipt", () => {
  const replacementPlan: UnitReviewInboxDeliveryPlan = {
    schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
    chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
    source_item_key: "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
    delivery_action: "replace_predecessor_inbox_item",
    final_active_item_key:
      "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
    final_active_queue: "rerun_decision_queue",
    upsert: {
      operation_key:
        "content-pipeline:delivery:upsert:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
      item_key: "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
      human_queue: "rerun_decision_queue",
      title: "[Rerun Decision] math_g8_linear_function_intro",
      summary: "Blocked artifact can attempt a scoped rerun.",
      primary_human_action: "decide_scoped_rerun",
      automation_step: "open_inbox_item",
      labels: ["content_pipeline_review"]
    },
    close: [
      {
        operation_key:
          "content-pipeline:delivery:close:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z:superseded_by:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
        item_key: "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z",
        reason: "superseded_by_new_artifact"
      }
    ],
    decision_boundary: {
      requires_provider_execution: true,
      requires_human_decision: true,
      provider_execution_allowed_without_human: false
    }
  };

  it("builds an applied receipt with matching final active state", () => {
    const receipt = buildUnitReviewInboxDeliveryReceipt(replacementPlan, {
      executed_at: "2026-04-23T18:12:00.000Z"
    });

    expect(receipt).toMatchObject({
      schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
      source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
      overall_status: "applied",
      final_active_item_key:
        "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
      final_active_queue: "rerun_decision_queue",
      operations: [
        {
          operation_type: "upsert",
          status: "applied"
        },
        {
          operation_type: "close",
          status: "applied"
        }
      ]
    });
  });

  it("builds a partially applied receipt when only the close operation fails", () => {
    const receipt = buildUnitReviewInboxDeliveryReceipt(replacementPlan, {
      executed_at: "2026-04-23T18:12:00.000Z",
      operation_statuses: {
        [replacementPlan.close[0]!.operation_key]: "failed"
      }
    });

    expect(receipt).toMatchObject({
      overall_status: "partially_applied",
      final_active_item_key:
        "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
      final_active_queue: "rerun_decision_queue",
      operations: [
        {
          operation_type: "upsert",
          status: "applied"
        },
        {
          operation_type: "close",
          status: "failed"
        }
      ]
    });
  });

  it("builds a failed receipt with null active state when the upsert fails", () => {
    const receipt = buildUnitReviewInboxDeliveryReceipt(replacementPlan, {
      executed_at: "2026-04-23T18:12:00.000Z",
      operation_statuses: {
        [replacementPlan.upsert.operation_key]: "failed",
        [replacementPlan.close[0]!.operation_key]: "failed"
      }
    });

    expect(receipt).toMatchObject({
      overall_status: "failed",
      final_active_item_key: null,
      final_active_queue: null
    });
  });

  it("fails validation when receipt operation targets diverge from the delivery plan", () => {
    const receipt = buildUnitReviewInboxDeliveryReceipt(replacementPlan, {
      executed_at: "2026-04-23T18:12:00.000Z"
    });
    receipt.operations[1] = {
      ...receipt.operations[1]!,
      target_item_key: "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:unexpected"
    };

    const validation = validateUnitReviewInboxDeliveryReceipt(replacementPlan, receipt);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "operation_target_mismatch",
      message:
        "Receipt operation content-pipeline:delivery:close:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z:superseded_by:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z must target content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z."
    });
  });
});
