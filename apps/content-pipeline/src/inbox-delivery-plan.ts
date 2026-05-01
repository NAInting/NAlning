import type { UnitReviewInboxHandoff } from "./inbox-handoff";

export interface UnitReviewInboxDeliveryPlan {
  schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2";
  chain_key: string;
  source_item_key: string;
  delivery_action: UnitReviewInboxHandoff["delivery_action"];
  final_active_item_key: string;
  final_active_queue: UnitReviewInboxHandoff["human_queue"];
  upsert: {
    operation_key: string;
    item_key: string;
    human_queue: UnitReviewInboxHandoff["human_queue"];
    title: string;
    summary: string;
    primary_human_action: UnitReviewInboxHandoff["primary_human_action"];
    automation_step: UnitReviewInboxHandoff["automation_step"];
    labels: string[];
  };
  close: Array<{
    operation_key: string;
    item_key: string;
    reason: "superseded_by_new_artifact";
  }>;
  decision_boundary: UnitReviewInboxHandoff["decision_boundary"];
}

export interface InboxDeliveryPlanValidationIssue {
  code:
    | "invalid_schema_version"
    | "final_active_item_mismatch"
    | "final_active_queue_mismatch"
    | "create_plan_should_not_close_items"
    | "replace_plan_must_close_one_item"
    | "close_item_cannot_match_active_item"
    | "upsert_operation_key_mismatch"
    | "close_operation_key_mismatch"
    | "duplicate_operation_keys";
  message: string;
}

export interface InboxDeliveryPlanValidationResult {
  ok: boolean;
  issues: InboxDeliveryPlanValidationIssue[];
}

export function buildUnitReviewInboxDeliveryPlan(handoff: UnitReviewInboxHandoff): UnitReviewInboxDeliveryPlan {
  return {
    schema_version: "content-pipeline-review-inbox-delivery-plan/v0.2",
    chain_key: handoff.chain_key,
    source_item_key: handoff.item_key,
    delivery_action: handoff.delivery_action,
    final_active_item_key: handoff.item_key,
    final_active_queue: handoff.human_queue,
    upsert: {
      operation_key: buildInboxUpsertOperationKey(handoff.item_key),
      item_key: handoff.item_key,
      human_queue: handoff.human_queue,
      title: handoff.title,
      summary: handoff.summary,
      primary_human_action: handoff.primary_human_action,
      automation_step: handoff.automation_step,
      labels: handoff.labels
    },
    close: handoff.predecessor_item_key
      ? [
          {
            operation_key: buildInboxCloseOperationKey(handoff.predecessor_item_key, handoff.item_key),
            item_key: handoff.predecessor_item_key,
            reason: "superseded_by_new_artifact"
          }
        ]
      : [],
    decision_boundary: handoff.decision_boundary
  };
}

export function validateUnitReviewInboxDeliveryPlan(
  plan: UnitReviewInboxDeliveryPlan
): InboxDeliveryPlanValidationResult {
  const issues: InboxDeliveryPlanValidationIssue[] = [];

  if (plan.schema_version !== "content-pipeline-review-inbox-delivery-plan/v0.2") {
    issues.push({
      code: "invalid_schema_version",
      message: "Inbox delivery plan schema_version must be content-pipeline-review-inbox-delivery-plan/v0.2."
    });
  }

  if (plan.final_active_item_key !== plan.upsert.item_key) {
    issues.push({
      code: "final_active_item_mismatch",
      message: "final_active_item_key must match upsert.item_key."
    });
  }

  if (plan.final_active_queue !== plan.upsert.human_queue) {
    issues.push({
      code: "final_active_queue_mismatch",
      message: "final_active_queue must match upsert.human_queue."
    });
  }

  if (plan.delivery_action === "create_inbox_item" && plan.close.length > 0) {
    issues.push({
      code: "create_plan_should_not_close_items",
      message: "create_inbox_item plans must not include close operations."
    });
  }

  if (plan.delivery_action === "replace_predecessor_inbox_item" && plan.close.length !== 1) {
    issues.push({
      code: "replace_plan_must_close_one_item",
      message: "replace_predecessor_inbox_item plans must include exactly one close operation."
    });
  }

  const expectedUpsertOperationKey = buildInboxUpsertOperationKey(plan.upsert.item_key);
  if (plan.upsert.operation_key !== expectedUpsertOperationKey) {
    issues.push({
      code: "upsert_operation_key_mismatch",
      message: "upsert.operation_key must match the deterministic delivery upsert key for upsert.item_key."
    });
  }

  for (const closeItem of plan.close) {
    if (closeItem.item_key === plan.final_active_item_key) {
      issues.push({
        code: "close_item_cannot_match_active_item",
        message: "close operation item_key must not match the final active item."
      });
      break;
    }

    const expectedCloseOperationKey = buildInboxCloseOperationKey(closeItem.item_key, plan.final_active_item_key);
    if (closeItem.operation_key !== expectedCloseOperationKey) {
      issues.push({
        code: "close_operation_key_mismatch",
        message: `close.operation_key must match the deterministic delivery close key for ${closeItem.item_key}.`
      });
    }
  }

  const operationKeys = [plan.upsert.operation_key, ...plan.close.map((closeItem) => closeItem.operation_key)];
  if (new Set(operationKeys).size !== operationKeys.length) {
    issues.push({
      code: "duplicate_operation_keys",
      message: "Inbox delivery plan operation keys must be unique across upsert and close operations."
    });
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

function buildInboxUpsertOperationKey(itemKey: string): string {
  return `content-pipeline:delivery:upsert:${itemKey}`;
}

function buildInboxCloseOperationKey(itemKey: string, finalActiveItemKey: string): string {
  return `content-pipeline:delivery:close:${itemKey}:superseded_by:${finalActiveItemKey}`;
}
