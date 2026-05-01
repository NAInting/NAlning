import type { UnitReviewInboxDeliveryPlan } from "./inbox-delivery-plan";
import {
  validateUnitReviewInboxDeliveryReceipt,
  type InboxDeliveryReceiptValidationIssue,
  type UnitReviewInboxDeliveryReceipt
} from "./inbox-delivery-receipt";

export type UnitReviewInboxDeliveryReconciliationStatus = "closed" | "action_required";
export type UnitReviewInboxDeliveryRecommendedFollowUp =
  | "none"
  | "manual_cleanup_predecessor"
  | "manual_repair_delivery"
  | "manual_receipt_triage";

export interface UnitReviewInboxDeliveryReconciliation {
  schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1";
  source_plan_schema_version: UnitReviewInboxDeliveryPlan["schema_version"];
  source_receipt_schema_version: UnitReviewInboxDeliveryReceipt["schema_version"];
  chain_key: string;
  source_item_key: string;
  receipt_validation_ok: boolean;
  receipt_validation_issue_codes: InboxDeliveryReceiptValidationIssue["code"][];
  reconciliation_status: UnitReviewInboxDeliveryReconciliationStatus;
  recommended_follow_up: UnitReviewInboxDeliveryRecommendedFollowUp;
  delivery_status: UnitReviewInboxDeliveryReceipt["overall_status"];
  final_active_item_key: string | null;
  final_active_queue: UnitReviewInboxDeliveryReceipt["final_active_queue"];
  unresolved_operations: Array<{
    operation_key: string;
    operation_type: UnitReviewInboxDeliveryReceipt["operations"][number]["operation_type"];
    target_item_key: string;
    status: UnitReviewInboxDeliveryReceipt["operations"][number]["status"];
  }>;
}

export interface InboxDeliveryReconciliationValidationIssue {
  code:
    | "invalid_reconciliation_schema_version"
    | "source_plan_schema_version_mismatch"
    | "source_receipt_schema_version_mismatch"
    | "chain_key_mismatch"
    | "source_item_key_mismatch"
    | "receipt_validation_state_mismatch"
    | "receipt_validation_issue_codes_mismatch"
    | "reconciliation_status_mismatch"
    | "recommended_follow_up_mismatch"
    | "delivery_status_mismatch"
    | "final_active_state_mismatch"
    | "unresolved_operations_mismatch";
  message: string;
}

export interface InboxDeliveryReconciliationValidationResult {
  ok: boolean;
  issues: InboxDeliveryReconciliationValidationIssue[];
}

export function buildUnitReviewInboxDeliveryReconciliation(
  plan: UnitReviewInboxDeliveryPlan,
  receipt: UnitReviewInboxDeliveryReceipt
): UnitReviewInboxDeliveryReconciliation {
  const receiptValidation = validateUnitReviewInboxDeliveryReceipt(plan, receipt);
  const unresolvedOperations = receipt.operations
    .filter((operation) => operation.status === "failed")
    .map((operation) => ({
      operation_key: operation.operation_key,
      operation_type: operation.operation_type,
      target_item_key: operation.target_item_key,
      status: operation.status
    }));

  return {
    schema_version: "content-pipeline-review-inbox-delivery-reconciliation/v0.1",
    source_plan_schema_version: plan.schema_version,
    source_receipt_schema_version: receipt.schema_version,
    chain_key: plan.chain_key,
    source_item_key: plan.source_item_key,
    receipt_validation_ok: receiptValidation.ok,
    receipt_validation_issue_codes: receiptValidation.issues.map((issue) => issue.code),
    reconciliation_status: deriveReconciliationStatus(receiptValidation.ok, receipt.overall_status),
    recommended_follow_up: deriveRecommendedFollowUp(receiptValidation.ok, receipt, unresolvedOperations),
    delivery_status: receipt.overall_status,
    final_active_item_key: receipt.final_active_item_key,
    final_active_queue: receipt.final_active_queue,
    unresolved_operations: unresolvedOperations
  };
}

export function validateUnitReviewInboxDeliveryReconciliation(
  plan: UnitReviewInboxDeliveryPlan,
  receipt: UnitReviewInboxDeliveryReceipt,
  reconciliation: UnitReviewInboxDeliveryReconciliation
): InboxDeliveryReconciliationValidationResult {
  const issues: InboxDeliveryReconciliationValidationIssue[] = [];
  const expected = buildUnitReviewInboxDeliveryReconciliation(plan, receipt);

  if (reconciliation.schema_version !== "content-pipeline-review-inbox-delivery-reconciliation/v0.1") {
    issues.push({
      code: "invalid_reconciliation_schema_version",
      message:
        "Inbox delivery reconciliation schema_version must be content-pipeline-review-inbox-delivery-reconciliation/v0.1."
    });
  }

  if (reconciliation.source_plan_schema_version !== expected.source_plan_schema_version) {
    issues.push({
      code: "source_plan_schema_version_mismatch",
      message: "Reconciliation source_plan_schema_version must match the source delivery plan schema_version."
    });
  }

  if (reconciliation.source_receipt_schema_version !== expected.source_receipt_schema_version) {
    issues.push({
      code: "source_receipt_schema_version_mismatch",
      message: "Reconciliation source_receipt_schema_version must match the source receipt schema_version."
    });
  }

  if (reconciliation.chain_key !== expected.chain_key) {
    issues.push({
      code: "chain_key_mismatch",
      message: "Reconciliation chain_key must match the source plan/receipt chain_key."
    });
  }

  if (reconciliation.source_item_key !== expected.source_item_key) {
    issues.push({
      code: "source_item_key_mismatch",
      message: "Reconciliation source_item_key must match the source plan/receipt source_item_key."
    });
  }

  if (reconciliation.receipt_validation_ok !== expected.receipt_validation_ok) {
    issues.push({
      code: "receipt_validation_state_mismatch",
      message: "Reconciliation receipt_validation_ok must match the actual plan-vs-receipt validation result."
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
      message: "Reconciliation receipt_validation_issue_codes must match the actual receipt validation issue codes."
    });
  }

  if (reconciliation.reconciliation_status !== expected.reconciliation_status) {
    issues.push({
      code: "reconciliation_status_mismatch",
      message: "Reconciliation status must match the derived closure state for the source receipt."
    });
  }

  if (reconciliation.recommended_follow_up !== expected.recommended_follow_up) {
    issues.push({
      code: "recommended_follow_up_mismatch",
      message: "Reconciliation recommended_follow_up must match the derived follow-up action for the source receipt."
    });
  }

  if (reconciliation.delivery_status !== expected.delivery_status) {
    issues.push({
      code: "delivery_status_mismatch",
      message: "Reconciliation delivery_status must match the source receipt overall_status."
    });
  }

  if (
    reconciliation.final_active_item_key !== expected.final_active_item_key ||
    reconciliation.final_active_queue !== expected.final_active_queue
  ) {
    issues.push({
      code: "final_active_state_mismatch",
      message: "Reconciliation final active item state must match the source receipt final active state."
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
      message: "Reconciliation unresolved_operations must match the failed operations in the source receipt."
    });
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

function deriveReconciliationStatus(
  receiptValidationOk: boolean,
  deliveryStatus: UnitReviewInboxDeliveryReceipt["overall_status"]
): UnitReviewInboxDeliveryReconciliationStatus {
  if (!receiptValidationOk) {
    return "action_required";
  }

  return deliveryStatus === "applied" ? "closed" : "action_required";
}

function deriveRecommendedFollowUp(
  receiptValidationOk: boolean,
  receipt: UnitReviewInboxDeliveryReceipt,
  unresolvedOperations: UnitReviewInboxDeliveryReconciliation["unresolved_operations"]
): UnitReviewInboxDeliveryRecommendedFollowUp {
  if (!receiptValidationOk) {
    return "manual_receipt_triage";
  }

  if (receipt.overall_status === "applied") {
    return "none";
  }

  if (unresolvedOperations.length > 0 && unresolvedOperations.every((operation) => operation.operation_type === "close")) {
    return "manual_cleanup_predecessor";
  }

  return "manual_repair_delivery";
}
