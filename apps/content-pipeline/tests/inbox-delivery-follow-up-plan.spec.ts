import { describe, expect, it } from "vitest";

import {
  buildUnitReviewInboxDeliveryFollowUpPlan,
  type UnitReviewInboxDeliveryFollowUp,
  validateUnitReviewInboxDeliveryFollowUpPlan
} from "../src";

describe("review inbox delivery follow-up plan", () => {
  const closedFollowUp: UnitReviewInboxDeliveryFollowUp = {
    schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
    source_plan_schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
    source_reconciliation_schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
    chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
    source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
    source_reconciliation_status: "closed",
    source_recommended_follow_up: "none",
    follow_up_state: "delivery_closed",
    follow_up_action: "none",
    delivery_chain_closed: true,
    active_item: {
      item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      human_queue: "approval_queue",
      should_remain_open: true
    },
    automation_step: "none",
    decision_boundary: {
      requires_provider_execution: false,
      requires_human_decision: false,
      provider_execution_allowed_without_human: false
    },
    follow_up_item: null
  };

  it("builds a no-op follow-up delivery plan when no follow-up inbox item is required", () => {
    const plan = buildUnitReviewInboxDeliveryFollowUpPlan(closedFollowUp);

    expect(plan).toMatchObject({
      schema_version: "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1",
      source_follow_up_schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
      delivery_action: "none",
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      upsert: null,
      preserved_active_item: closedFollowUp.active_item
    });
  });

  it("builds an executor-ready upsert plan for manual repair follow-up items", () => {
    const repairFollowUp: UnitReviewInboxDeliveryFollowUp = {
      ...closedFollowUp,
      source_reconciliation_status: "action_required",
      source_recommended_follow_up: "manual_repair_delivery",
      follow_up_state: "repair_delivery_required",
      follow_up_action: "open_manual_repair_follow_up_item",
      delivery_chain_closed: false,
      active_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false
      },
      automation_step: "open_inbox_item",
      decision_boundary: {
        requires_provider_execution: false,
        requires_human_decision: true,
        provider_execution_allowed_without_human: false
      },
      follow_up_item: {
        item_key: "content-pipeline:manual_triage_queue:math_g8_linear_function_intro:delivery-repair",
        human_queue: "manual_triage_queue",
        title: "[Delivery Repair] math_g8_linear_function_intro",
        summary: "Inbox delivery needs manual repair because at least one upsert operation failed.",
        primary_human_action: "perform_manual_triage",
        automation_step: "open_inbox_item",
        labels: ["content_pipeline_review", "delivery_repair"]
      }
    };

    const plan = buildUnitReviewInboxDeliveryFollowUpPlan(repairFollowUp);

    expect(plan).toMatchObject({
      delivery_action: "create_follow_up_inbox_item",
      final_follow_up_item_key: "content-pipeline:manual_triage_queue:math_g8_linear_function_intro:delivery-repair",
      final_follow_up_queue: "manual_triage_queue",
      upsert: {
        operation_key:
          "content-pipeline:follow-up-delivery:upsert:content-pipeline:manual_triage_queue:math_g8_linear_function_intro:delivery-repair",
        item_key: "content-pipeline:manual_triage_queue:math_g8_linear_function_intro:delivery-repair",
        human_queue: "manual_triage_queue",
        title: "[Delivery Repair] math_g8_linear_function_intro"
      },
      preserved_active_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false
      }
    });
  });

  it("fails validation when the follow-up upsert operation key is not deterministic", () => {
    const repairFollowUp: UnitReviewInboxDeliveryFollowUp = {
      ...closedFollowUp,
      source_reconciliation_status: "action_required",
      source_recommended_follow_up: "manual_receipt_triage",
      follow_up_state: "receipt_triage_required",
      follow_up_action: "open_manual_receipt_triage_item",
      delivery_chain_closed: false,
      active_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false
      },
      automation_step: "open_inbox_item",
      decision_boundary: {
        requires_provider_execution: false,
        requires_human_decision: true,
        provider_execution_allowed_without_human: false
      },
      follow_up_item: {
        item_key: "content-pipeline:manual_triage_queue:math_g8_linear_function_intro:receipt-triage",
        human_queue: "manual_triage_queue",
        title: "[Receipt Triage] math_g8_linear_function_intro",
        summary: "Receipt triage is required because delivery status is internally inconsistent.",
        primary_human_action: "perform_manual_triage",
        automation_step: "open_inbox_item",
        labels: ["content_pipeline_review", "receipt_triage"]
      }
    };

    const plan = buildUnitReviewInboxDeliveryFollowUpPlan(repairFollowUp);
    if (!plan.upsert) {
      throw new Error("Expected follow-up plan upsert to exist.");
    }
    plan.upsert.operation_key = "content-pipeline:follow-up-delivery:upsert:tampered";

    const validation = validateUnitReviewInboxDeliveryFollowUpPlan(repairFollowUp, plan);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "upsert_operation_key_mismatch",
      message:
        "Follow-up delivery plan upsert.operation_key must match the deterministic follow-up upsert key for upsert.item_key."
    });
  });
});
