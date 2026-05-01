import { describe, expect, it } from "vitest";

import {
  buildUnitReviewInboxDeliveryFollowUpReceipt,
  type UnitReviewInboxDeliveryFollowUpPlan,
  validateUnitReviewInboxDeliveryFollowUpReceipt
} from "../src";

describe("review inbox delivery follow-up receipt", () => {
  const repairPlan: UnitReviewInboxDeliveryFollowUpPlan = {
    schema_version: "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1",
    source_follow_up_schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
    chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
    source_item_key: "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:10:00.000Z",
    follow_up_state: "repair_delivery_required",
    follow_up_action: "open_manual_repair_follow_up_item",
    preserved_active_item: {
      item_key: null,
      human_queue: null,
      should_remain_open: false
    },
    delivery_action: "create_follow_up_inbox_item",
    final_follow_up_item_key: "content-pipeline:manual_triage_queue:math_g8_linear_function_intro:delivery-repair",
    final_follow_up_queue: "manual_triage_queue",
    upsert: {
      operation_key:
        "content-pipeline:follow-up-delivery:upsert:content-pipeline:manual_triage_queue:math_g8_linear_function_intro:delivery-repair",
      item_key: "content-pipeline:manual_triage_queue:math_g8_linear_function_intro:delivery-repair",
      human_queue: "manual_triage_queue",
      title: "[Delivery Repair] math_g8_linear_function_intro",
      summary: "Inbox delivery needs manual repair because at least one upsert operation failed.",
      primary_human_action: "perform_manual_triage",
      automation_step: "open_inbox_item",
      labels: ["content_pipeline_review", "delivery_repair"]
    },
    decision_boundary: {
      requires_provider_execution: false,
      requires_human_decision: true,
      provider_execution_allowed_without_human: false
    }
  };

  it("builds an applied follow-up receipt when the manual follow-up item opens successfully", () => {
    const receipt = buildUnitReviewInboxDeliveryFollowUpReceipt(repairPlan, {
      executed_at: "2026-04-23T18:25:00.000Z"
    });

    expect(receipt).toMatchObject({
      schema_version: "content-pipeline-review-inbox-delivery-follow-up-receipt/v0.1",
      source_follow_up_plan_schema_version: "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1",
      overall_status: "applied",
      preserved_active_item: repairPlan.preserved_active_item,
      final_follow_up_item_key:
        "content-pipeline:manual_triage_queue:math_g8_linear_function_intro:delivery-repair",
      final_follow_up_queue: "manual_triage_queue",
      operations: [
        {
          operation_type: "upsert",
          status: "applied"
        }
      ]
    });
  });

  it("builds a failed follow-up receipt when the follow-up inbox upsert fails", () => {
    const receipt = buildUnitReviewInboxDeliveryFollowUpReceipt(repairPlan, {
      executed_at: "2026-04-23T18:25:00.000Z",
      upsert_status: "failed"
    });

    expect(receipt).toMatchObject({
      overall_status: "failed",
      preserved_active_item: repairPlan.preserved_active_item,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      operations: [
        {
          operation_type: "upsert",
          status: "failed"
        }
      ]
    });
  });

  it("builds an applied no-op receipt when no follow-up inbox item should be opened", () => {
    const closedPlan: UnitReviewInboxDeliveryFollowUpPlan = {
      ...repairPlan,
      follow_up_state: "delivery_closed",
      follow_up_action: "none",
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

    const receipt = buildUnitReviewInboxDeliveryFollowUpReceipt(closedPlan, {
      executed_at: "2026-04-23T18:25:00.000Z"
    });

    expect(receipt).toMatchObject({
      overall_status: "applied",
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      operations: []
    });
  });

  it("fails validation when the preserved active item diverges from the source follow-up plan", () => {
    const receipt = buildUnitReviewInboxDeliveryFollowUpReceipt(repairPlan, {
      executed_at: "2026-04-23T18:25:00.000Z"
    });
    receipt.preserved_active_item = {
      item_key: "content-pipeline:approval_queue:unexpected",
      human_queue: "approval_queue",
      should_remain_open: true
    };

    const validation = validateUnitReviewInboxDeliveryFollowUpReceipt(repairPlan, receipt);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "preserved_active_item_mismatch",
      message:
        "Follow-up delivery receipt preserved_active_item must match the source follow-up plan preserved active item."
    });
  });
});
