import type { UnitReviewInboxDeliveryPlan } from "./inbox-delivery-plan";

export type UnitReviewInboxDeliveryOperationStatus = "applied" | "already_applied" | "failed";
export type UnitReviewInboxDeliveryOverallStatus = "applied" | "partially_applied" | "failed";

export interface UnitReviewInboxDeliveryReceipt {
  schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1";
  source_plan_schema_version: UnitReviewInboxDeliveryPlan["schema_version"];
  chain_key: string;
  source_item_key: string;
  delivery_action: UnitReviewInboxDeliveryPlan["delivery_action"];
  executed_at: string;
  overall_status: UnitReviewInboxDeliveryOverallStatus;
  final_active_item_key: string | null;
  final_active_queue: UnitReviewInboxDeliveryPlan["final_active_queue"] | null;
  operations: Array<{
    operation_key: string;
    operation_type: "upsert" | "close";
    target_item_key: string;
    status: UnitReviewInboxDeliveryOperationStatus;
  }>;
}

export interface BuildUnitReviewInboxDeliveryReceiptOptions {
  executed_at: string;
  operation_statuses?: Partial<Record<string, UnitReviewInboxDeliveryOperationStatus>>;
}

export interface InboxDeliveryReceiptValidationIssue {
  code:
    | "invalid_receipt_schema_version"
    | "source_plan_schema_version_mismatch"
    | "chain_key_mismatch"
    | "source_item_key_mismatch"
    | "delivery_action_mismatch"
    | "operation_count_mismatch"
    | "duplicate_operation_keys"
    | "unexpected_operation_key"
    | "operation_type_mismatch"
    | "operation_target_mismatch"
    | "overall_status_mismatch"
    | "final_active_state_mismatch";
  message: string;
}

export interface InboxDeliveryReceiptValidationResult {
  ok: boolean;
  issues: InboxDeliveryReceiptValidationIssue[];
}

export function buildUnitReviewInboxDeliveryReceipt(
  plan: UnitReviewInboxDeliveryPlan,
  options: BuildUnitReviewInboxDeliveryReceiptOptions
): UnitReviewInboxDeliveryReceipt {
  const operations = [
    {
      operation_key: plan.upsert.operation_key,
      operation_type: "upsert" as const,
      target_item_key: plan.upsert.item_key,
      status: options.operation_statuses?.[plan.upsert.operation_key] ?? "applied"
    },
    ...plan.close.map((closeItem) => ({
      operation_key: closeItem.operation_key,
      operation_type: "close" as const,
      target_item_key: closeItem.item_key,
      status: options.operation_statuses?.[closeItem.operation_key] ?? "applied"
    }))
  ];

  const overall_status = deriveOverallStatus(operations.map((operation) => operation.status));
  const upsertSucceeded = operations[0]?.status !== "failed";

  return {
    schema_version: "content-pipeline-review-inbox-delivery-receipt/v0.1",
    source_plan_schema_version: plan.schema_version,
    chain_key: plan.chain_key,
    source_item_key: plan.source_item_key,
    delivery_action: plan.delivery_action,
    executed_at: options.executed_at,
    overall_status,
    final_active_item_key: upsertSucceeded ? plan.final_active_item_key : null,
    final_active_queue: upsertSucceeded ? plan.final_active_queue : null,
    operations
  };
}

export function validateUnitReviewInboxDeliveryReceipt(
  plan: UnitReviewInboxDeliveryPlan,
  receipt: UnitReviewInboxDeliveryReceipt
): InboxDeliveryReceiptValidationResult {
  const issues: InboxDeliveryReceiptValidationIssue[] = [];

  if (receipt.schema_version !== "content-pipeline-review-inbox-delivery-receipt/v0.1") {
    issues.push({
      code: "invalid_receipt_schema_version",
      message: "Inbox delivery receipt schema_version must be content-pipeline-review-inbox-delivery-receipt/v0.1."
    });
  }

  if (receipt.source_plan_schema_version !== plan.schema_version) {
    issues.push({
      code: "source_plan_schema_version_mismatch",
      message: "Receipt source_plan_schema_version must match the source plan schema_version."
    });
  }

  if (receipt.chain_key !== plan.chain_key) {
    issues.push({
      code: "chain_key_mismatch",
      message: "Receipt chain_key must match the source delivery plan chain_key."
    });
  }

  if (receipt.source_item_key !== plan.source_item_key) {
    issues.push({
      code: "source_item_key_mismatch",
      message: "Receipt source_item_key must match the source delivery plan source_item_key."
    });
  }

  if (receipt.delivery_action !== plan.delivery_action) {
    issues.push({
      code: "delivery_action_mismatch",
      message: "Receipt delivery_action must match the source delivery plan delivery_action."
    });
  }

  const expectedOperations = [
    {
      operation_key: plan.upsert.operation_key,
      operation_type: "upsert" as const,
      target_item_key: plan.upsert.item_key
    },
    ...plan.close.map((closeItem) => ({
      operation_key: closeItem.operation_key,
      operation_type: "close" as const,
      target_item_key: closeItem.item_key
    }))
  ];

  if (receipt.operations.length !== expectedOperations.length) {
    issues.push({
      code: "operation_count_mismatch",
      message: "Receipt operations must match the source plan operation count."
    });
  }

  const operationKeys = receipt.operations.map((operation) => operation.operation_key);
  if (new Set(operationKeys).size !== operationKeys.length) {
    issues.push({
      code: "duplicate_operation_keys",
      message: "Receipt operation keys must be unique."
    });
  }

  for (const expectedOperation of expectedOperations) {
    const actualOperation = receipt.operations.find(
      (operation) => operation.operation_key === expectedOperation.operation_key
    );

    if (!actualOperation) {
      issues.push({
        code: "unexpected_operation_key",
        message: `Receipt must include operation ${expectedOperation.operation_key}.`
      });
      continue;
    }

    if (actualOperation.operation_type !== expectedOperation.operation_type) {
      issues.push({
        code: "operation_type_mismatch",
        message: `Receipt operation ${expectedOperation.operation_key} must keep type ${expectedOperation.operation_type}.`
      });
    }

    if (actualOperation.target_item_key !== expectedOperation.target_item_key) {
      issues.push({
        code: "operation_target_mismatch",
        message: `Receipt operation ${expectedOperation.operation_key} must target ${expectedOperation.target_item_key}.`
      });
    }
  }

  for (const actualOperation of receipt.operations) {
    if (!expectedOperations.some((expectedOperation) => expectedOperation.operation_key === actualOperation.operation_key)) {
      issues.push({
        code: "unexpected_operation_key",
        message: `Receipt contains unexpected operation ${actualOperation.operation_key}.`
      });
    }
  }

  const expectedOverallStatus = deriveOverallStatus(receipt.operations.map((operation) => operation.status));
  if (receipt.overall_status !== expectedOverallStatus) {
    issues.push({
      code: "overall_status_mismatch",
      message: `Receipt overall_status must be ${expectedOverallStatus} for the recorded operation statuses.`
    });
  }

  const upsertOperation = receipt.operations.find((operation) => operation.operation_type === "upsert");
  const expectedFinalActiveState =
    upsertOperation?.status === "failed"
      ? { item_key: null, queue: null }
      : { item_key: plan.final_active_item_key, queue: plan.final_active_queue };

  if (
    receipt.final_active_item_key !== expectedFinalActiveState.item_key ||
    receipt.final_active_queue !== expectedFinalActiveState.queue
  ) {
    issues.push({
      code: "final_active_state_mismatch",
      message: "Receipt final active item state must match the source plan after applying the recorded upsert status."
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
