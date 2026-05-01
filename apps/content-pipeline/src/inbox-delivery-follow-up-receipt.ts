import type { UnitReviewInboxDeliveryFollowUpPlan } from "./inbox-delivery-follow-up-plan";
import type {
  UnitReviewInboxDeliveryOperationStatus,
  UnitReviewInboxDeliveryOverallStatus
} from "./inbox-delivery-receipt";

export interface UnitReviewInboxDeliveryFollowUpReceipt {
  schema_version: "content-pipeline-review-inbox-delivery-follow-up-receipt/v0.1";
  source_follow_up_plan_schema_version: UnitReviewInboxDeliveryFollowUpPlan["schema_version"];
  chain_key: string;
  source_item_key: string;
  follow_up_state: UnitReviewInboxDeliveryFollowUpPlan["follow_up_state"];
  follow_up_action: UnitReviewInboxDeliveryFollowUpPlan["follow_up_action"];
  delivery_action: UnitReviewInboxDeliveryFollowUpPlan["delivery_action"];
  executed_at: string;
  overall_status: UnitReviewInboxDeliveryOverallStatus;
  preserved_active_item: UnitReviewInboxDeliveryFollowUpPlan["preserved_active_item"];
  final_follow_up_item_key: string | null;
  final_follow_up_queue: UnitReviewInboxDeliveryFollowUpPlan["final_follow_up_queue"];
  operations: Array<{
    operation_key: string;
    operation_type: "upsert";
    target_item_key: string;
    status: UnitReviewInboxDeliveryOperationStatus;
  }>;
}

export interface BuildUnitReviewInboxDeliveryFollowUpReceiptOptions {
  executed_at: string;
  upsert_status?: UnitReviewInboxDeliveryOperationStatus;
}

export interface InboxDeliveryFollowUpReceiptValidationIssue {
  code:
    | "invalid_receipt_schema_version"
    | "source_follow_up_plan_schema_version_mismatch"
    | "chain_key_mismatch"
    | "source_item_key_mismatch"
    | "follow_up_state_mismatch"
    | "follow_up_action_mismatch"
    | "delivery_action_mismatch"
    | "operation_count_mismatch"
    | "unexpected_operation_key"
    | "operation_type_mismatch"
    | "operation_target_mismatch"
    | "duplicate_operation_keys"
    | "overall_status_mismatch"
    | "preserved_active_item_mismatch"
    | "final_follow_up_state_mismatch";
  message: string;
}

export interface InboxDeliveryFollowUpReceiptValidationResult {
  ok: boolean;
  issues: InboxDeliveryFollowUpReceiptValidationIssue[];
}

export function buildUnitReviewInboxDeliveryFollowUpReceipt(
  plan: UnitReviewInboxDeliveryFollowUpPlan,
  options: BuildUnitReviewInboxDeliveryFollowUpReceiptOptions
): UnitReviewInboxDeliveryFollowUpReceipt {
  const operations = plan.upsert
    ? [
        {
          operation_key: plan.upsert.operation_key,
          operation_type: "upsert" as const,
          target_item_key: plan.upsert.item_key,
          status: options.upsert_status ?? "applied"
        }
      ]
    : [];

  const overall_status = deriveOverallStatus(operations.map((operation) => operation.status));
  const upsertSucceeded = operations[0]?.status !== "failed";

  return {
    schema_version: "content-pipeline-review-inbox-delivery-follow-up-receipt/v0.1",
    source_follow_up_plan_schema_version: plan.schema_version,
    chain_key: plan.chain_key,
    source_item_key: plan.source_item_key,
    follow_up_state: plan.follow_up_state,
    follow_up_action: plan.follow_up_action,
    delivery_action: plan.delivery_action,
    executed_at: options.executed_at,
    overall_status,
    preserved_active_item: plan.preserved_active_item,
    final_follow_up_item_key: plan.upsert && upsertSucceeded ? plan.final_follow_up_item_key : null,
    final_follow_up_queue: plan.upsert && upsertSucceeded ? plan.final_follow_up_queue : null,
    operations
  };
}

export function validateUnitReviewInboxDeliveryFollowUpReceipt(
  plan: UnitReviewInboxDeliveryFollowUpPlan,
  receipt: UnitReviewInboxDeliveryFollowUpReceipt
): InboxDeliveryFollowUpReceiptValidationResult {
  const issues: InboxDeliveryFollowUpReceiptValidationIssue[] = [];

  if (receipt.schema_version !== "content-pipeline-review-inbox-delivery-follow-up-receipt/v0.1") {
    issues.push({
      code: "invalid_receipt_schema_version",
      message:
        "Follow-up delivery receipt schema_version must be content-pipeline-review-inbox-delivery-follow-up-receipt/v0.1."
    });
  }

  if (receipt.source_follow_up_plan_schema_version !== plan.schema_version) {
    issues.push({
      code: "source_follow_up_plan_schema_version_mismatch",
      message: "Follow-up delivery receipt source_follow_up_plan_schema_version must match the source plan schema_version."
    });
  }

  if (receipt.chain_key !== plan.chain_key) {
    issues.push({
      code: "chain_key_mismatch",
      message: "Follow-up delivery receipt chain_key must match the source follow-up plan chain_key."
    });
  }

  if (receipt.source_item_key !== plan.source_item_key) {
    issues.push({
      code: "source_item_key_mismatch",
      message: "Follow-up delivery receipt source_item_key must match the source follow-up plan source_item_key."
    });
  }

  if (receipt.follow_up_state !== plan.follow_up_state) {
    issues.push({
      code: "follow_up_state_mismatch",
      message: "Follow-up delivery receipt follow_up_state must match the source follow-up plan state."
    });
  }

  if (receipt.follow_up_action !== plan.follow_up_action) {
    issues.push({
      code: "follow_up_action_mismatch",
      message: "Follow-up delivery receipt follow_up_action must match the source follow-up plan action."
    });
  }

  if (receipt.delivery_action !== plan.delivery_action) {
    issues.push({
      code: "delivery_action_mismatch",
      message: "Follow-up delivery receipt delivery_action must match the source follow-up plan delivery_action."
    });
  }

  const expectedOperations = plan.upsert
    ? [
        {
          operation_key: plan.upsert.operation_key,
          operation_type: "upsert" as const,
          target_item_key: plan.upsert.item_key
        }
      ]
    : [];

  if (receipt.operations.length !== expectedOperations.length) {
    issues.push({
      code: "operation_count_mismatch",
      message: "Follow-up delivery receipt operations must match the source follow-up plan operation count."
    });
  }

  const operationKeys = receipt.operations.map((operation) => operation.operation_key);
  if (new Set(operationKeys).size !== operationKeys.length) {
    issues.push({
      code: "duplicate_operation_keys",
      message: "Follow-up delivery receipt operation keys must be unique."
    });
  }

  for (const expectedOperation of expectedOperations) {
    const actualOperation = receipt.operations.find(
      (operation) => operation.operation_key === expectedOperation.operation_key
    );

    if (!actualOperation) {
      issues.push({
        code: "unexpected_operation_key",
        message: `Follow-up delivery receipt must include operation ${expectedOperation.operation_key}.`
      });
      continue;
    }

    if (actualOperation.operation_type !== expectedOperation.operation_type) {
      issues.push({
        code: "operation_type_mismatch",
        message: `Follow-up delivery receipt operation ${expectedOperation.operation_key} must keep type upsert.`
      });
    }

    if (actualOperation.target_item_key !== expectedOperation.target_item_key) {
      issues.push({
        code: "operation_target_mismatch",
        message:
          `Follow-up delivery receipt operation ${expectedOperation.operation_key} must target ${expectedOperation.target_item_key}.`
      });
    }
  }

  for (const actualOperation of receipt.operations) {
    if (!expectedOperations.some((expectedOperation) => expectedOperation.operation_key === actualOperation.operation_key)) {
      issues.push({
        code: "unexpected_operation_key",
        message: `Follow-up delivery receipt contains unexpected operation ${actualOperation.operation_key}.`
      });
    }
  }

  const expectedOverallStatus = deriveOverallStatus(receipt.operations.map((operation) => operation.status));
  if (receipt.overall_status !== expectedOverallStatus) {
    issues.push({
      code: "overall_status_mismatch",
      message: `Follow-up delivery receipt overall_status must be ${expectedOverallStatus} for the recorded operation statuses.`
    });
  }

  if (
    receipt.preserved_active_item.item_key !== plan.preserved_active_item.item_key ||
    receipt.preserved_active_item.human_queue !== plan.preserved_active_item.human_queue ||
    receipt.preserved_active_item.should_remain_open !== plan.preserved_active_item.should_remain_open
  ) {
    issues.push({
      code: "preserved_active_item_mismatch",
      message: "Follow-up delivery receipt preserved_active_item must match the source follow-up plan preserved active item."
    });
  }

  const upsertOperation = receipt.operations[0];
  const expectedFinalFollowUpState =
    !plan.upsert || upsertOperation?.status === "failed"
      ? { item_key: null, queue: null }
      : { item_key: plan.final_follow_up_item_key, queue: plan.final_follow_up_queue };

  if (
    receipt.final_follow_up_item_key !== expectedFinalFollowUpState.item_key ||
    receipt.final_follow_up_queue !== expectedFinalFollowUpState.queue
  ) {
    issues.push({
      code: "final_follow_up_state_mismatch",
      message:
        "Follow-up delivery receipt final follow-up item state must match the source plan after applying the recorded upsert status."
    });
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

function deriveOverallStatus(statuses: UnitReviewInboxDeliveryOperationStatus[]): UnitReviewInboxDeliveryOverallStatus {
  const failedCount = statuses.filter((status) => status === "failed").length;
  if (failedCount === 0) {
    return "applied";
  }

  if (failedCount === statuses.length) {
    return "failed";
  }

  return "partially_applied";
}
