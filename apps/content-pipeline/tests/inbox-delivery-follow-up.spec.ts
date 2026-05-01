import { describe, expect, it } from "vitest";

import {
  buildUnitReviewInboxDeliveryFollowUp,
  type UnitReviewInboxDeliveryPlan,
  type UnitReviewInboxDeliveryReconciliation,
  validateUnitReviewInboxDeliveryFollowUpSourceContract,
  validateUnitReviewInboxDeliveryFollowUpSource,
  validateUnitReviewInboxDeliveryFollowUp
} from "../src";

describe("review inbox delivery follow-up", () => {
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

  it("closes delivery routing when reconciliation is already closed", () => {
    const reconciliation: UnitReviewInboxDeliveryReconciliation = {
      schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
      source_plan_schema_version: createPlan.schema_version,
      source_receipt_schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
      chain_key: createPlan.chain_key,
      source_item_key: createPlan.source_item_key,
      receipt_validation_ok: true,
      receipt_validation_issue_codes: [],
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      delivery_status: "applied",
      final_active_item_key: createPlan.final_active_item_key,
      final_active_queue: createPlan.final_active_queue,
      unresolved_operations: []
    };

    const followUp = buildUnitReviewInboxDeliveryFollowUp(createPlan, reconciliation);

    expect(followUp).toMatchObject({
      schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
      follow_up_state: "delivery_closed",
      follow_up_action: "none",
      delivery_chain_closed: true,
      automation_step: "none",
      decision_boundary: {
        requires_provider_execution: false,
        requires_human_decision: false,
        provider_execution_allowed_without_human: false
      },
      active_item: {
        item_key: createPlan.final_active_item_key,
        human_queue: createPlan.final_active_queue,
        should_remain_open: true
      },
      follow_up_item: null
    });
  });

  it("routes predecessor cleanup to manual triage while preserving the active item", () => {
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
    const reconciliation: UnitReviewInboxDeliveryReconciliation = {
      schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
      source_plan_schema_version: plan.schema_version,
      source_receipt_schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
      chain_key: plan.chain_key,
      source_item_key: plan.source_item_key,
      receipt_validation_ok: true,
      receipt_validation_issue_codes: [],
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_cleanup_predecessor",
      delivery_status: "partially_applied",
      final_active_item_key: plan.final_active_item_key,
      final_active_queue: plan.final_active_queue,
      unresolved_operations: [
        {
          operation_key: plan.close[0]!.operation_key,
          operation_type: "close",
          target_item_key: plan.close[0]!.item_key,
          status: "failed"
        }
      ]
    };

    const followUp = buildUnitReviewInboxDeliveryFollowUp(plan, reconciliation);

    expect(followUp).toMatchObject({
      follow_up_state: "cleanup_predecessor_required",
      follow_up_action: "open_manual_cleanup_follow_up_item",
      delivery_chain_closed: false,
      automation_step: "open_inbox_item",
      active_item: {
        item_key: plan.final_active_item_key,
        human_queue: plan.final_active_queue,
        should_remain_open: true
      },
      follow_up_item: {
        human_queue: "manual_triage_queue",
        title: "[Delivery Cleanup] math_g8_linear_function_intro",
        primary_human_action: "perform_manual_triage",
        automation_step: "open_inbox_item"
      }
    });
    expect(followUp.follow_up_item?.summary).toContain("manual cleanup is required");
  });

  it("routes invalid receipts to manual triage without trusting the active item", () => {
    const reconciliation: UnitReviewInboxDeliveryReconciliation = {
      schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
      source_plan_schema_version: createPlan.schema_version,
      source_receipt_schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
      chain_key: createPlan.chain_key,
      source_item_key: createPlan.source_item_key,
      receipt_validation_ok: false,
      receipt_validation_issue_codes: ["final_active_state_mismatch"],
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_receipt_triage",
      delivery_status: "applied",
      final_active_item_key: createPlan.final_active_item_key,
      final_active_queue: createPlan.final_active_queue,
      unresolved_operations: []
    };

    const followUp = buildUnitReviewInboxDeliveryFollowUp(createPlan, reconciliation);

    expect(followUp).toMatchObject({
      follow_up_state: "receipt_triage_required",
      follow_up_action: "open_manual_receipt_triage_item",
      delivery_chain_closed: false,
      active_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false
      },
      follow_up_item: {
        human_queue: "manual_triage_queue",
        title: "[Receipt Triage] math_g8_linear_function_intro"
      }
    });
    expect(followUp.follow_up_item?.summary).toContain("No trustworthy active inbox item is currently confirmed.");
    expect(followUp.follow_up_item?.labels).toContain("active_queue:none");
  });

  it("routes non-close delivery failures to manual repair", () => {
    const reconciliation: UnitReviewInboxDeliveryReconciliation = {
      schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
      source_plan_schema_version: createPlan.schema_version,
      source_receipt_schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
      chain_key: createPlan.chain_key,
      source_item_key: createPlan.source_item_key,
      receipt_validation_ok: true,
      receipt_validation_issue_codes: [],
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_repair_delivery",
      delivery_status: "failed",
      final_active_item_key: null,
      final_active_queue: null,
      unresolved_operations: [
        {
          operation_key: createPlan.upsert.operation_key,
          operation_type: "upsert",
          target_item_key: createPlan.upsert.item_key,
          status: "failed"
        }
      ]
    };

    const followUp = buildUnitReviewInboxDeliveryFollowUp(createPlan, reconciliation);

    expect(followUp).toMatchObject({
      follow_up_state: "repair_delivery_required",
      follow_up_action: "open_manual_repair_follow_up_item",
      delivery_chain_closed: false,
      active_item: {
        item_key: null,
        human_queue: null,
        should_remain_open: false
      },
      follow_up_item: {
        human_queue: "manual_triage_queue",
        title: "[Delivery Repair] math_g8_linear_function_intro"
      }
    });
  });

  it("rejects a reconciliation source that is internally inconsistent before follow-up render", () => {
    const invalidReconciliation: UnitReviewInboxDeliveryReconciliation = {
      schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
      source_plan_schema_version: createPlan.schema_version,
      source_receipt_schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
      chain_key: createPlan.chain_key,
      source_item_key: createPlan.source_item_key,
      receipt_validation_ok: true,
      receipt_validation_issue_codes: [],
      reconciliation_status: "closed",
      recommended_follow_up: "manual_repair_delivery",
      delivery_status: "applied",
      final_active_item_key: createPlan.final_active_item_key,
      final_active_queue: createPlan.final_active_queue,
      unresolved_operations: []
    };

    const validation = validateUnitReviewInboxDeliveryFollowUpSource(createPlan, invalidReconciliation);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toEqual(
      expect.arrayContaining([
        {
          code: "recommended_follow_up_mismatch",
          message:
            "Follow-up source reconciliation recommended_follow_up is inconsistent with its validation state and delivery outcome."
        }
      ])
    );
  });

  it("rejects a follow-up contract whose source reconciliation pair does not match the declared routing state", () => {
    const reconciliation: UnitReviewInboxDeliveryReconciliation = {
      schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
      source_plan_schema_version: createPlan.schema_version,
      source_receipt_schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
      chain_key: createPlan.chain_key,
      source_item_key: createPlan.source_item_key,
      receipt_validation_ok: true,
      receipt_validation_issue_codes: [],
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      delivery_status: "applied",
      final_active_item_key: createPlan.final_active_item_key,
      final_active_queue: createPlan.final_active_queue,
      unresolved_operations: []
    };
    const followUp = buildUnitReviewInboxDeliveryFollowUp(createPlan, reconciliation);
    followUp.source_recommended_follow_up = "manual_repair_delivery";

    const validation = validateUnitReviewInboxDeliveryFollowUpSourceContract(followUp);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "source_reconciliation_contract_mismatch",
      message:
        "Follow-up source_reconciliation_status/source_recommended_follow_up must form a valid routing pair."
    });
  });

  it("rejects a repair follow-up that tries to keep an active item open", () => {
    const reconciliation: UnitReviewInboxDeliveryReconciliation = {
      schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
      source_plan_schema_version: createPlan.schema_version,
      source_receipt_schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
      chain_key: createPlan.chain_key,
      source_item_key: createPlan.source_item_key,
      receipt_validation_ok: true,
      receipt_validation_issue_codes: [],
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_repair_delivery",
      delivery_status: "failed",
      final_active_item_key: null,
      final_active_queue: null,
      unresolved_operations: [
        {
          operation_key: createPlan.upsert.operation_key,
          operation_type: "upsert",
          target_item_key: createPlan.upsert.item_key,
          status: "failed"
        }
      ]
    };
    const followUp = buildUnitReviewInboxDeliveryFollowUp(createPlan, reconciliation);
    followUp.active_item = {
      item_key: createPlan.final_active_item_key,
      human_queue: createPlan.final_active_queue,
      should_remain_open: true
    };

    const validation = validateUnitReviewInboxDeliveryFollowUpSourceContract(followUp);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "active_item_contract_mismatch",
      message:
        "Follow-up active_item must satisfy the visibility and open/closed rules for the declared follow-up state."
    });
  });

  it("rejects a receipt-triage follow-up that still claims an active item", () => {
    const reconciliation: UnitReviewInboxDeliveryReconciliation = {
      schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
      source_plan_schema_version: createPlan.schema_version,
      source_receipt_schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
      chain_key: createPlan.chain_key,
      source_item_key: createPlan.source_item_key,
      receipt_validation_ok: false,
      receipt_validation_issue_codes: ["final_active_state_mismatch"],
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_receipt_triage",
      delivery_status: "applied",
      final_active_item_key: createPlan.final_active_item_key,
      final_active_queue: createPlan.final_active_queue,
      unresolved_operations: []
    };
    const followUp = buildUnitReviewInboxDeliveryFollowUp(createPlan, reconciliation);
    followUp.active_item = {
      item_key: createPlan.final_active_item_key,
      human_queue: createPlan.final_active_queue,
      should_remain_open: false
    };

    const validation = validateUnitReviewInboxDeliveryFollowUpSourceContract(followUp);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "active_item_contract_mismatch",
      message:
        "Follow-up active_item must satisfy the visibility and open/closed rules for the declared follow-up state."
    });
  });

  it("fails validation when the declared follow-up action diverges from the derived contract", () => {
    const reconciliation: UnitReviewInboxDeliveryReconciliation = {
      schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
      source_plan_schema_version: createPlan.schema_version,
      source_receipt_schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
      chain_key: createPlan.chain_key,
      source_item_key: createPlan.source_item_key,
      receipt_validation_ok: true,
      receipt_validation_issue_codes: [],
      reconciliation_status: "closed",
      recommended_follow_up: "none",
      delivery_status: "applied",
      final_active_item_key: createPlan.final_active_item_key,
      final_active_queue: createPlan.final_active_queue,
      unresolved_operations: []
    };
    const followUp = buildUnitReviewInboxDeliveryFollowUp(createPlan, reconciliation);
    followUp.follow_up_action = "open_manual_repair_follow_up_item";

    const validation = validateUnitReviewInboxDeliveryFollowUp(createPlan, reconciliation, followUp);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "follow_up_action_mismatch",
      message: "Follow-up action must match the derived automation action for the source reconciliation."
    });
  });
});
