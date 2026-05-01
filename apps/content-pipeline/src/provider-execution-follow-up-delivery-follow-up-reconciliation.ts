import type { UnitReviewProviderExecutionAttempt } from "./provider-execution-attempt";
import type { UnitReviewProviderExecutionDecision } from "./provider-execution-decision";
import type { UnitReviewProviderExecutionFollowUp } from "./provider-execution-follow-up";
import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUp } from "./provider-execution-follow-up-delivery-follow-up";
import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan } from "./provider-execution-follow-up-delivery-follow-up-plan";
import {
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlanContract,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlanSource,
} from "./provider-execution-follow-up-delivery-follow-up-plan";
import type {
  ProviderExecutionFollowUpDeliveryFollowUpReceiptValidationIssue,
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt,
} from "./provider-execution-follow-up-delivery-follow-up-receipt";
import {
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpReceiptSource,
} from "./provider-execution-follow-up-delivery-follow-up-receipt";
import type { UnitReviewProviderExecutionFollowUpPlan } from "./provider-execution-follow-up-plan";
import type { UnitReviewProviderExecutionFollowUpReceipt } from "./provider-execution-follow-up-receipt";
import type { UnitReviewProviderExecutionFollowUpReconciliation } from "./provider-execution-follow-up-reconciliation";
import type { UnitReviewProviderExecutionReceipt } from "./provider-execution-receipt";
import type { UnitReviewProviderExecutionReconciliation } from "./provider-execution-reconciliation";
import type { UnitReviewProviderExecutionRequest } from "./provider-execution-request";

export type UnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliationStatus =
  | "closed"
  | "action_required";

export type UnitReviewProviderExecutionFollowUpDeliveryFollowUpRecommendedFollowUp =
  | "none"
  | "manual_repair_provider_execution_follow_up_delivery_follow_up"
  | "manual_receipt_triage";

export interface UnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation {
  schema_version: "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-reconciliation/v0.1";
  source_follow_up_plan_schema_version: UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan["schema_version"];
  source_follow_up_receipt_schema_version: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt["schema_version"];
  request_key: string;
  chain_key: string;
  attempt_key: string;
  unit_id: string;
  follow_up_state: UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan["follow_up_state"];
  follow_up_action: UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan["follow_up_action"];
  receipt_validation_ok: boolean;
  receipt_validation_issue_codes: ProviderExecutionFollowUpDeliveryFollowUpReceiptValidationIssue["code"][];
  reconciliation_status: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliationStatus;
  recommended_follow_up: UnitReviewProviderExecutionFollowUpDeliveryFollowUpRecommendedFollowUp;
  delivery_status: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt["overall_status"] | null;
  result_artifact_handoff: UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan["preserved_result_artifact_handoff"];
  preserved_active_follow_up_item: UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan["preserved_active_follow_up_item"];
  final_follow_up_item_key: string | null;
  final_follow_up_queue: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt["final_follow_up_queue"];
  unresolved_operations: Array<{
    operation_key: string;
    operation_type: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt["operations"][number]["operation_type"];
    target_item_key: string;
    status: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt["operations"][number]["status"];
  }>;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpReconciliationSourceValidationIssue {
  code:
    | "source_follow_up_delivery_follow_up_plan_contract_mismatch"
    | "source_follow_up_delivery_follow_up_receipt_contract_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpReconciliationSourceValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpReconciliationSourceValidationIssue[];
}

export interface ProviderExecutionFollowUpDeliveryFollowUpReconciliationValidationIssue {
  code:
    | "invalid_reconciliation_schema_version"
    | "source_follow_up_plan_schema_version_mismatch"
    | "source_follow_up_receipt_schema_version_mismatch"
    | "request_key_mismatch"
    | "chain_key_mismatch"
    | "attempt_key_mismatch"
    | "unit_id_mismatch"
    | "follow_up_state_mismatch"
    | "follow_up_action_mismatch"
    | "receipt_validation_state_mismatch"
    | "receipt_validation_issue_codes_mismatch"
    | "reconciliation_status_mismatch"
    | "recommended_follow_up_mismatch"
    | "delivery_status_mismatch"
    | "result_artifact_handoff_mismatch"
    | "preserved_active_follow_up_item_mismatch"
    | "final_follow_up_state_mismatch"
    | "unresolved_operations_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpReconciliationValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpReconciliationValidationIssue[];
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliationSource(
  request: UnitReviewProviderExecutionRequest,
  decision: UnitReviewProviderExecutionDecision,
  attempt: UnitReviewProviderExecutionAttempt,
  sourceReceipt: UnitReviewProviderExecutionReceipt,
  sourceReconciliation: UnitReviewProviderExecutionReconciliation,
  followUp: UnitReviewProviderExecutionFollowUp,
  plan: UnitReviewProviderExecutionFollowUpPlan,
  followUpReceipt: UnitReviewProviderExecutionFollowUpReceipt,
  followUpReconciliation: UnitReviewProviderExecutionFollowUpReconciliation,
  followUpDeliveryFollowUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUp,
  deliveryFollowUpPlan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan,
  deliveryFollowUpReceipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt
): ProviderExecutionFollowUpDeliveryFollowUpReconciliationSourceValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpReconciliationSourceValidationIssue[] = [];
  const planSourceValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlanSource(
      request,
      decision,
      attempt,
      sourceReceipt,
      sourceReconciliation,
      followUp,
      plan,
      followUpReceipt,
      followUpReconciliation,
      followUpDeliveryFollowUp
    );
  const planValidation = validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan(
    followUpDeliveryFollowUp,
    deliveryFollowUpPlan
  );
  const receiptSourceValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpReceiptSource(
      request,
      decision,
      attempt,
      sourceReceipt,
      sourceReconciliation,
      followUp,
      plan,
      followUpReceipt,
      followUpReconciliation,
      followUpDeliveryFollowUp,
      deliveryFollowUpPlan
    );
  const receiptValidation = validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt(
    deliveryFollowUpPlan,
    deliveryFollowUpReceipt
  );

  if (!planSourceValidation.ok || !planValidation.ok) {
    const issueCodes = [
      ...planSourceValidation.issues.map((issue) => issue.code),
      ...planValidation.issues.map((issue) => issue.code),
    ];
    issues.push({
      code: "source_follow_up_delivery_follow_up_plan_contract_mismatch",
      message:
        `Provider execution follow-up delivery follow-up reconciliation source plan chain failed validation: ${issueCodes.join(", ")}.`,
    });
  }

  if (!receiptSourceValidation.ok || !receiptValidation.ok) {
    const issueCodes = [
      ...receiptSourceValidation.issues.map((issue) => issue.code),
      ...receiptValidation.issues.map((issue) => issue.code),
    ];
    issues.push({
      code: "source_follow_up_delivery_follow_up_receipt_contract_mismatch",
      message:
        `Provider execution follow-up delivery follow-up reconciliation source receipt chain failed validation: ${issueCodes.join(", ")}.`,
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

export function buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation(
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan,
  receipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation {
  const planContractValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlanContract(plan);
  if (!planContractValidation.ok) {
    throw new Error(
      `Provider execution follow-up delivery follow-up reconciliation source plan is invalid: ${planContractValidation.issues.map((issue) => issue.code).join(", ")}.`
    );
  }
  const receiptValidation = validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt(
    plan,
    receipt
  );

  if (!receiptValidation.ok) {
    return {
      schema_version:
        "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-reconciliation/v0.1",
      source_follow_up_plan_schema_version:
        "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-plan/v0.1",
      source_follow_up_receipt_schema_version:
        "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-receipt/v0.1",
      request_key: plan.request_key,
      chain_key: plan.chain_key,
      attempt_key: plan.attempt_key,
      unit_id: plan.unit_id,
      follow_up_state: plan.follow_up_state,
      follow_up_action: plan.follow_up_action,
      receipt_validation_ok: false,
      receipt_validation_issue_codes: receiptValidation.issues.map((issue) => issue.code),
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_receipt_triage",
      delivery_status: null,
      result_artifact_handoff: plan.preserved_result_artifact_handoff,
      preserved_active_follow_up_item: plan.preserved_active_follow_up_item,
      final_follow_up_item_key: null,
      final_follow_up_queue: null,
      unresolved_operations: [],
    };
  }

  const unresolvedOperations = receipt.operations
    .filter((operation) => operation.status === "failed")
    .map((operation) => ({
      operation_key: operation.operation_key,
      operation_type: operation.operation_type,
      target_item_key: operation.target_item_key,
      status: operation.status,
    }));

  return {
    schema_version:
      "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-reconciliation/v0.1",
    source_follow_up_plan_schema_version:
      "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-plan/v0.1",
    source_follow_up_receipt_schema_version:
      "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-receipt/v0.1",
    request_key: plan.request_key,
    chain_key: plan.chain_key,
    attempt_key: plan.attempt_key,
    unit_id: plan.unit_id,
    follow_up_state: plan.follow_up_state,
    follow_up_action: plan.follow_up_action,
    receipt_validation_ok: true,
    receipt_validation_issue_codes: [],
    reconciliation_status: receipt.overall_status === "applied" ? "closed" : "action_required",
    recommended_follow_up:
      receipt.overall_status === "applied"
        ? "none"
        : "manual_repair_provider_execution_follow_up_delivery_follow_up",
    delivery_status: receipt.overall_status,
    result_artifact_handoff: plan.preserved_result_artifact_handoff,
    preserved_active_follow_up_item: plan.preserved_active_follow_up_item,
    final_follow_up_item_key: receipt.final_follow_up_item_key,
    final_follow_up_queue: receipt.final_follow_up_queue,
    unresolved_operations: unresolvedOperations,
  };
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation(
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan,
  receipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt,
  reconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation
): ProviderExecutionFollowUpDeliveryFollowUpReconciliationValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpReconciliationValidationIssue[] = [];
  const expected = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation(
    plan,
    receipt
  );

  if (
    reconciliation.schema_version !==
    "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-reconciliation/v0.1"
  ) {
    issues.push({
      code: "invalid_reconciliation_schema_version",
      message:
        "Provider execution follow-up delivery follow-up reconciliation schema_version must be content-pipeline-review-provider-execution-follow-up-delivery-follow-up-reconciliation/v0.1.",
    });
  }

  if (
    reconciliation.source_follow_up_plan_schema_version !==
    expected.source_follow_up_plan_schema_version
  ) {
    issues.push({
      code: "source_follow_up_plan_schema_version_mismatch",
      message:
        "Provider execution follow-up delivery follow-up reconciliation source_follow_up_plan_schema_version must match the source plan schema_version.",
    });
  }

  if (
    reconciliation.source_follow_up_receipt_schema_version !==
    expected.source_follow_up_receipt_schema_version
  ) {
    issues.push({
      code: "source_follow_up_receipt_schema_version_mismatch",
      message:
        "Provider execution follow-up delivery follow-up reconciliation source_follow_up_receipt_schema_version must match the source receipt schema_version.",
    });
  }

  if (reconciliation.request_key !== expected.request_key) {
    issues.push({
      code: "request_key_mismatch",
      message:
        "Provider execution follow-up delivery follow-up reconciliation request_key must match the source plan/receipt chain.",
    });
  }

  if (reconciliation.chain_key !== expected.chain_key) {
    issues.push({
      code: "chain_key_mismatch",
      message:
        "Provider execution follow-up delivery follow-up reconciliation chain_key must match the source plan/receipt chain.",
    });
  }

  if (reconciliation.attempt_key !== expected.attempt_key) {
    issues.push({
      code: "attempt_key_mismatch",
      message:
        "Provider execution follow-up delivery follow-up reconciliation attempt_key must match the source plan/receipt chain.",
    });
  }

  if (reconciliation.unit_id !== expected.unit_id) {
    issues.push({
      code: "unit_id_mismatch",
      message:
        "Provider execution follow-up delivery follow-up reconciliation unit_id must match the source plan/receipt chain.",
    });
  }

  if (reconciliation.follow_up_state !== expected.follow_up_state) {
    issues.push({
      code: "follow_up_state_mismatch",
      message:
        "Provider execution follow-up delivery follow-up reconciliation follow_up_state must match the source follow-up plan state.",
    });
  }

  if (reconciliation.follow_up_action !== expected.follow_up_action) {
    issues.push({
      code: "follow_up_action_mismatch",
      message:
        "Provider execution follow-up delivery follow-up reconciliation follow_up_action must match the source follow-up plan action.",
    });
  }

  if (reconciliation.receipt_validation_ok !== expected.receipt_validation_ok) {
    issues.push({
      code: "receipt_validation_state_mismatch",
      message:
        "Provider execution follow-up delivery follow-up reconciliation receipt_validation_ok must match the actual plan-vs-receipt validation result.",
    });
  }

  if (
    reconciliation.receipt_validation_issue_codes.length !==
      expected.receipt_validation_issue_codes.length ||
    reconciliation.receipt_validation_issue_codes.some(
      (code, index) => code !== expected.receipt_validation_issue_codes[index]
    )
  ) {
    issues.push({
      code: "receipt_validation_issue_codes_mismatch",
      message:
        "Provider execution follow-up delivery follow-up reconciliation receipt_validation_issue_codes must match the actual follow-up receipt validation issue codes.",
    });
  }

  if (reconciliation.reconciliation_status !== expected.reconciliation_status) {
    issues.push({
      code: "reconciliation_status_mismatch",
      message:
        "Provider execution follow-up delivery follow-up reconciliation status must match the derived closure state for the source follow-up receipt.",
    });
  }

  if (reconciliation.recommended_follow_up !== expected.recommended_follow_up) {
    issues.push({
      code: "recommended_follow_up_mismatch",
      message:
        "Provider execution follow-up delivery follow-up reconciliation recommended_follow_up must match the derived next action for the source follow-up receipt.",
    });
  }

  if (reconciliation.delivery_status !== expected.delivery_status) {
    issues.push({
      code: "delivery_status_mismatch",
      message:
        "Provider execution follow-up delivery follow-up reconciliation delivery_status must match the trusted source follow-up receipt delivery status.",
    });
  }

  if (
    !resultArtifactHandoffsMatch(
      reconciliation.result_artifact_handoff,
      expected.result_artifact_handoff
    )
  ) {
    issues.push({
      code: "result_artifact_handoff_mismatch",
      message:
        "Provider execution follow-up delivery follow-up reconciliation result_artifact_handoff must match the preserved source artifact handoff contract.",
    });
  }

  if (
    reconciliation.preserved_active_follow_up_item.item_key !==
      expected.preserved_active_follow_up_item.item_key ||
    reconciliation.preserved_active_follow_up_item.human_queue !==
      expected.preserved_active_follow_up_item.human_queue ||
    reconciliation.preserved_active_follow_up_item.should_remain_open !==
      expected.preserved_active_follow_up_item.should_remain_open
  ) {
    issues.push({
      code: "preserved_active_follow_up_item_mismatch",
      message:
        "Provider execution follow-up delivery follow-up reconciliation preserved_active_follow_up_item must match the source plan preserved active item.",
    });
  }

  if (
    reconciliation.final_follow_up_item_key !== expected.final_follow_up_item_key ||
    reconciliation.final_follow_up_queue !== expected.final_follow_up_queue
  ) {
    issues.push({
      code: "final_follow_up_state_mismatch",
      message:
        "Provider execution follow-up delivery follow-up reconciliation final follow-up item state must match the trusted source follow-up receipt final state.",
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
        "Provider execution follow-up delivery follow-up reconciliation unresolved_operations must match the failed operations in the source follow-up receipt.",
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

function resultArtifactHandoffsMatch(
  actual: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation["result_artifact_handoff"],
  expected: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation["result_artifact_handoff"]
): boolean {
  if (actual === null || expected === null) {
    return actual === expected;
  }

  return (
    actual.expected_schema_version === expected.expected_schema_version &&
    actual.generated_at === expected.generated_at &&
    actual.status === expected.status
  );
}
