import type { UnitReviewInboxDeliveryFollowUpPlan } from "./inbox-delivery-follow-up-plan";
import {
  validateUnitReviewInboxDeliveryFollowUpReceipt,
  type InboxDeliveryFollowUpReceiptValidationIssue,
  type UnitReviewInboxDeliveryFollowUpReceipt
} from "./inbox-delivery-follow-up-receipt";

export type UnitReviewInboxDeliveryFollowUpReconciliationStatus = "closed" | "action_required";
export type UnitReviewInboxDeliveryFollowUpRecommendedFollowUp =
  | "none"
  | "manual_repair_follow_up_delivery"
  | "manual_receipt_triage";

export interface UnitReviewInboxDeliveryFollowUpReconciliation {
  schema_version: "content-pipeline-review-inbox-delivery-follow-up-reconciliation/v0.1";
  source_follow_up_plan_schema_version: UnitReviewInboxDeliveryFollowUpPlan["schema_version"];
  source_follow_up_receipt_schema_version: UnitReviewInboxDeliveryFollowUpReceipt["schema_version"];
  chain_key: string;
  source_item_key: string;
  follow_up_state: UnitReviewInboxDeliveryFollowUpPlan["follow_up_state"];
  follow_up_action: UnitReviewInboxDeliveryFollowUpPlan["follow_up_action"];
  receipt_validation_ok: boolean;
  receipt_validation_issue_codes: InboxDeliveryFollowUpReceiptValidationIssue["code"][];
  reconciliation_status: UnitReviewInboxDeliveryFollowUpReconciliationStatus;
  recommended_follow_up: UnitReviewInboxDeliveryFollowUpRecommendedFollowUp;
  delivery_status: UnitReviewInboxDeliveryFollowUpReceipt["overall_status"];
  preserved_active_item: UnitReviewInboxDeliveryFollowUpPlan["preserved_active_item"];
  final_follow_up_item_key: string | null;
  final_follow_up_queue: UnitReviewInboxDeliveryFollowUpReceipt["final_follow_up_queue"];
  unresolved_operations: Array<{
    operation_key: string;
    operation_type: UnitReviewInboxDeliveryFollowUpReceipt["operations"][number]["operation_type"];
    target_item_key: string;
    status: UnitReviewInboxDeliveryFollowUpReceipt["operations"][number]["status"];
  }>;
}

export interface InboxDeliveryFollowUpReconciliationValidationIssue {
  code:
    | "invalid_reconciliation_schema_version"
    | "source_follow_up_plan_schema_version_mismatch"
    | "source_follow_up_receipt_schema_version_mismatch"
    | "chain_key_mismatch"
    | "source_item_key_mismatch"
    | "follow_up_state_mismatch"
    | "follow_up_action_mismatch"
    | "receipt_validation_state_mismatch"
    | "receipt_validation_issue_codes_mismatch"
    | "reconciliation_status_mismatch"
    | "recommended_follow_up_mismatch"
    | "delivery_status_mismatch"
    | "preserved_active_item_mismatch"
    | "final_follow_up_state_mismatch"
    | "unresolved_operations_mismatch";
  message: string;
}

export interface InboxDeliveryFollowUpReconciliationValidationResult {
  ok: boolean;
  issues: InboxDeliveryFollowUpReconciliationValidationIssue[];
}

export function buildUnitReviewInboxDeliveryFollowUpReconciliation(
  plan: UnitReviewInboxDeliveryFollowUpPlan,
  receipt: UnitReviewInboxDeliveryFollowUpReceipt
): UnitReviewInboxDeliveryFollowUpReconciliation {
  const receiptValidation = validateUnitReviewInboxDeliveryFollowUpReceipt(plan, receipt);
  const unresolvedOperations = receipt.operations
    .filter((operation) => operation.status === "failed")
    .map((operation) => ({
      operation_key: operation.operation_key,
      operation_type: operation.operation_type,
      target_item_key: operation.target_item_key,
      status: operation.status
    }));

  return {
    schema_version: "content-pipeline-review-inbox-delivery-follow-up-reconciliation/v0.1",
    source_follow_up_plan_schema_version: plan.schema_version,
    source_follow_up_receipt_schema_version: receipt.schema_version,
    chain_key: plan.chain_key,
    source_item_key: plan.source_item_key,
    follow_up_state: plan.follow_up_state,
    follow_up_action: plan.follow_up_action,
    receipt_validation_ok: receiptValidation.ok,
    receipt_validation_issue_codes: receiptValidation.issues.map((issue) => issue.code),
    reconciliation_status: deriveFollowUpReconciliationStatus(receiptValidation.ok, receipt.overall_status),
    recommended_follow_up: deriveFollowUpRecommendedFollowUp(receiptValidation.ok, receipt.overall_status),
    delivery_status: receipt.overall_status,
    preserved_active_item: plan.preserved_active_item,
    final_follow_up_item_key: receipt.final_follow_up_item_key,
    final_follow_up_queue: receipt.final_follow_up_queue,
    unresolved_operations: unresolvedOperations
  };
}

export function validateUnitReviewInboxDeliveryFollowUpReconciliation(
  plan: UnitReviewInboxDeliveryFollowUpPlan,
  receipt: UnitReviewInboxDeliveryFollowUpReceipt,
  reconciliation: UnitReviewInboxDeliveryFollowUpReconciliation
): InboxDeliveryFollowUpReconciliationValidationResult {
  const issues: InboxDeliveryFollowUpReconciliationValidationIssue[] = [];
  const expected = buildUnitReviewInboxDeliveryFollowUpReconciliation(plan, receipt);

  if (reconciliation.schema_version !== "content-pipeline-review-inbox-delivery-follow-up-reconciliation/v0.1") {
    issues.push({
      code: "invalid_reconciliation_schema_version",
      message:
        "Follow-up delivery reconciliation schema_version must be content-pipeline-review-inbox-delivery-follow-up-reconciliation/v0.1."
    });
  }

  if (reconciliation.source_follow_up_plan_schema_version !== expected.source_follow_up_plan_schema_version) {
    issues.push({
      code: "source_follow_up_plan_schema_version_mismatch",
      message:
        "Follow-up delivery reconciliation source_follow_up_plan_schema_version must match the source follow-up plan schema_version."
    });
  }

  if (reconciliation.source_follow_up_receipt_schema_version !== expected.source_follow_up_receipt_schema_version) {
    issues.push({
      code: "source_follow_up_receipt_schema_version_mismatch",
      message:
        "Follow-up delivery reconciliation source_follow_up_receipt_schema_version must match the source follow-up receipt schema_version."
    });
  }

  if (reconciliation.chain_key !== expected.chain_key) {
    issues.push({
      code: "chain_key_mismatch",
      message: "Follow-up delivery reconciliation chain_key must match the source follow-up plan/receipt chain_key."
    });
  }

  if (reconciliation.source_item_key !== expected.source_item_key) {
    issues.push({
      code: "source_item_key_mismatch",
      message:
        "Follow-up delivery reconciliation source_item_key must match the source follow-up plan/receipt source_item_key."
    });
  }

  if (reconciliation.follow_up_state !== expected.follow_up_state) {
    issues.push({
      code: "follow_up_state_mismatch",
      message: "Follow-up delivery reconciliation follow_up_state must match the source follow-up plan state."
    });
  }

  if (reconciliation.follow_up_action !== expected.follow_up_action) {
    issues.push({
      code: "follow_up_action_mismatch",
      message: "Follow-up delivery reconciliation follow_up_action must match the source follow-up plan action."
    });
  }

  if (reconciliation.receipt_validation_ok !== expected.receipt_validation_ok) {
    issues.push({
      code: "receipt_validation_state_mismatch",
      message:
        "Follow-up delivery reconciliation receipt_validation_ok must match the actual follow-up plan-vs-receipt validation result."
    });
  }

  if (
    reconciliation.receipt_validation_issue_codes.length !== expected.receipt_validation_issue_codes.length ||
    reconciliation.receipt_validation_issue_codes.some(
      (code, index) => code !== expected.receipt_validation_issue_codes[index]
    )
  ) {
    issues.push({
      code: "receipt_validation_issue_codes_mismatch",
      message:
        "Follow-up delivery reconciliation receipt_validation_issue_codes must match the actual follow-up receipt validation issue codes."
    });
  }

  if (reconciliation.reconciliation_status !== expected.reconciliation_status) {
    issues.push({
      code: "reconciliation_status_mismatch",
      message:
        "Follow-up delivery reconciliation status must match the derived closure state for the source follow-up receipt."
    });
  }

  if (reconciliation.recommended_follow_up !== expected.recommended_follow_up) {
    issues.push({
      code: "recommended_follow_up_mismatch",
      message:
        "Follow-up delivery reconciliation recommended_follow_up must match the derived next action for the source follow-up receipt."
    });
  }

  if (reconciliation.delivery_status !== expected.delivery_status) {
    issues.push({
      code: "delivery_status_mismatch",
      message:
        "Follow-up delivery reconciliation delivery_status must match the source follow-up receipt overall_status."
    });
  }

  if (
    reconciliation.preserved_active_item.item_key !== expected.preserved_active_item.item_key ||
    reconciliation.preserved_active_item.human_queue !== expected.preserved_active_item.human_queue ||
    reconciliation.preserved_active_item.should_remain_open !== expected.preserved_active_item.should_remain_open
  ) {
    issues.push({
      code: "preserved_active_item_mismatch",
      message:
        "Follow-up delivery reconciliation preserved_active_item must match the source follow-up plan preserved active item."
    });
  }

  if (
    reconciliation.final_follow_up_item_key !== expected.final_follow_up_item_key ||
    reconciliation.final_follow_up_queue !== expected.final_follow_up_queue
  ) {
    issues.push({
      code: "final_follow_up_state_mismatch",
      message:
        "Follow-up delivery reconciliation final follow-up item state must match the source follow-up receipt final state."
    });
  }

  if (
    reconciliation.unresolved_operations.length !== expected.unresolved_operations.length ||
    reconciliation.unresolved_operations.some((operation, index) => {
      const expectedOperation = expected.unresolved_operations[index];
      return (
        !expectedOperation ||
        operation.operation_key !== expectedOperation.operation_key ||
        operation.operation_type !== expectedOperation.operation_type ||
        operation.target_item_key !== expectedOperation.target_item_key ||
        operation.status !== expectedOperation.status
      );
    })
  ) {
    issues.push({
      code: "unresolved_operations_mismatch",
      message:
        "Follow-up delivery reconciliation unresolved_operations must match the failed operations in the source follow-up receipt."
    });
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

function deriveFollowUpReconciliationStatus(
  receiptValidationOk: boolean,
  deliveryStatus: UnitReviewInboxDeliveryFollowUpReceipt["overall_status"]
): UnitReviewInboxDeliveryFollowUpReconciliationStatus {
  if (!receiptValidationOk) {
    return "action_required";
  }

  return deliveryStatus === "applied" ? "closed" : "action_required";
}

function deriveFollowUpRecommendedFollowUp(
  receiptValidationOk: boolean,
  deliveryStatus: UnitReviewInboxDeliveryFollowUpReceipt["overall_status"]
): UnitReviewInboxDeliveryFollowUpRecommendedFollowUp {
  if (!receiptValidationOk) {
    return "manual_receipt_triage";
  }

  return deliveryStatus === "applied" ? "none" : "manual_repair_follow_up_delivery";
}
