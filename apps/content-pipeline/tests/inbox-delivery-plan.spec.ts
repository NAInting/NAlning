import { describe, expect, it } from "vitest";

import { buildUnitReviewInboxDeliveryPlan, type UnitReviewInboxHandoff, validateUnitReviewInboxDeliveryPlan } from "../src";

describe("review inbox delivery plan", () => {
  it("builds a create-only delivery plan when there is no predecessor inbox item", () => {
    const handoff: UnitReviewInboxHandoff = {
      schema_version: "content-pipeline-review-inbox-item/v0.1",
      item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      predecessor_item_key: null,
      delivery_action: "create_inbox_item",
      unit_id: "math_g8_linear_function_intro",
      artifact_generated_at: "2026-04-23T18:00:00.000Z",
      artifact_status: "ready_for_human_review",
      human_queue: "approval_queue",
      title: "[Approval] math_g8_linear_function_intro",
      summary: "Review artifact is ready for human approval.",
      primary_human_action: "approve_review_artifact",
      automation_step: "open_inbox_item",
      decision_boundary: {
        requires_provider_execution: false,
        requires_human_decision: true,
        provider_execution_allowed_without_human: false
      },
      labels: ["content_pipeline_review", "artifact_status:ready_for_human_review"],
      metadata: {
        orchestration_action: "notify_human_for_approval",
        recommended_rerun_from: null,
        rerun_chain_depth: 0,
        retry_decision: null,
        repair_plan_source: null
      }
    };

    const plan = buildUnitReviewInboxDeliveryPlan(handoff);

    expect(plan).toMatchObject({
      schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
      chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      delivery_action: "create_inbox_item",
      final_active_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      final_active_queue: "approval_queue",
      upsert: {
        operation_key:
          "content-pipeline:delivery:upsert:content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z"
      },
      close: [],
      decision_boundary: {
        requires_provider_execution: false,
        requires_human_decision: true,
        provider_execution_allowed_without_human: false
      }
    });
  });

  it("builds a replacement delivery plan when a predecessor inbox item exists", () => {
    const handoff: UnitReviewInboxHandoff = {
      schema_version: "content-pipeline-review-inbox-item/v0.1",
      item_key: "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:30:00.000Z",
      chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      predecessor_item_key:
        "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      delivery_action: "replace_predecessor_inbox_item",
      unit_id: "math_g8_linear_function_intro",
      artifact_generated_at: "2026-04-23T18:30:00.000Z",
      artifact_status: "blocked",
      human_queue: "rerun_decision_queue",
      title: "[Rerun Decision] math_g8_linear_function_intro",
      summary: "Blocked artifact can attempt a review-only scoped rerun.",
      primary_human_action: "decide_scoped_rerun",
      automation_step: "open_inbox_item",
      decision_boundary: {
        requires_provider_execution: true,
        requires_human_decision: true,
        provider_execution_allowed_without_human: false
      },
      labels: ["content_pipeline_review", "retry_policy:allow_scoped_rerun"],
      metadata: {
        orchestration_action: "prepare_scoped_rerun",
        recommended_rerun_from: "assessment_designer",
        rerun_chain_depth: 1,
        retry_decision: "allow_scoped_rerun",
        repair_plan_source: "invocation_failure"
      }
    };

    const plan = buildUnitReviewInboxDeliveryPlan(handoff);

    expect(plan).toMatchObject({
      delivery_action: "replace_predecessor_inbox_item",
      final_active_item_key:
        "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:30:00.000Z",
      final_active_queue: "rerun_decision_queue",
      close: [
        {
          operation_key:
            "content-pipeline:delivery:close:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z:superseded_by:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:30:00.000Z",
          item_key:
            "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          reason: "superseded_by_new_artifact"
        }
      ]
    });
  });

  it("fails validation when a create plan tries to close items", () => {
    const validation = validateUnitReviewInboxDeliveryPlan({
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
      close: [
        {
          operation_key:
            "content-pipeline:delivery:close:content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z:superseded_by:content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
          item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T17:45:00.000Z",
          reason: "superseded_by_new_artifact"
        }
      ],
      decision_boundary: {
        requires_provider_execution: false,
        requires_human_decision: true,
        provider_execution_allowed_without_human: false
      }
    });

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "create_plan_should_not_close_items",
      message: "create_inbox_item plans must not include close operations."
    });
  });

  it("fails validation when a replace plan closes the final active item", () => {
    const validation = validateUnitReviewInboxDeliveryPlan({
      schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
      chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      source_item_key: "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:30:00.000Z",
      delivery_action: "replace_predecessor_inbox_item",
      final_active_item_key:
        "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:30:00.000Z",
      final_active_queue: "rerun_decision_queue",
      upsert: {
        operation_key:
          "content-pipeline:delivery:upsert:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:30:00.000Z",
        item_key: "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:30:00.000Z",
        human_queue: "rerun_decision_queue",
        title: "[Rerun Decision] math_g8_linear_function_intro",
        summary: "Scoped rerun is available.",
        primary_human_action: "decide_scoped_rerun",
        automation_step: "open_inbox_item",
        labels: ["content_pipeline_review"]
      },
      close: [
        {
          operation_key:
            "content-pipeline:delivery:close:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:30:00.000Z:superseded_by:content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:30:00.000Z",
          item_key:
            "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:30:00.000Z",
          reason: "superseded_by_new_artifact"
        }
      ],
      decision_boundary: {
        requires_provider_execution: true,
        requires_human_decision: true,
        provider_execution_allowed_without_human: false
      }
    });

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "close_item_cannot_match_active_item",
      message: "close operation item_key must not match the final active item."
    });
  });

  it("fails validation when a delivery operation key does not match its deterministic replay key", () => {
    const validation = validateUnitReviewInboxDeliveryPlan({
      schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
      chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      source_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      delivery_action: "create_inbox_item",
      final_active_item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      final_active_queue: "approval_queue",
      upsert: {
        operation_key: "content-pipeline:delivery:upsert:tampered",
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
    });

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "upsert_operation_key_mismatch",
      message: "upsert.operation_key must match the deterministic delivery upsert key for upsert.item_key."
    });
  });
});
