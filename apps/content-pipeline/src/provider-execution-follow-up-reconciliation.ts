import type { UnitReviewProviderExecutionAttempt } from "./provider-execution-attempt";
import type { UnitReviewProviderExecutionDecision } from "./provider-execution-decision";
import type { UnitReviewProviderExecutionFollowUp } from "./provider-execution-follow-up";
import type { UnitReviewProviderExecutionFollowUpPlan } from "./provider-execution-follow-up-plan";
import {
  validateUnitReviewProviderExecutionFollowUpPlan,
  validateUnitReviewProviderExecutionFollowUpPlanSource,
} from "./provider-execution-follow-up-plan";
import type {
  ProviderExecutionFollowUpReceiptValidationIssue,
  UnitReviewProviderExecutionFollowUpReceipt,
} from "./provider-execution-follow-up-receipt";
import {
  validateUnitReviewProviderExecutionFollowUpReceipt,
  validateUnitReviewProviderExecutionFollowUpReceiptSource,
} from "./provider-execution-follow-up-receipt";
import type { UnitReviewProviderExecutionReceipt } from "./provider-execution-receipt";
import type { UnitReviewProviderExecutionReconciliation } from "./provider-execution-reconciliation";
import type { UnitReviewProviderExecutionRequest } from "./provider-execution-request";

export type UnitReviewProviderExecutionFollowUpReconciliationStatus =
  | "closed"
  | "action_required";
export type UnitReviewProviderExecutionFollowUpRecommendedFollowUp =
  | "none"
  | "manual_repair_provider_execution_follow_up_delivery"
  | "manual_receipt_triage";

export interface UnitReviewProviderExecutionFollowUpReconciliation {
  schema_version: "content-pipeline-review-provider-execution-follow-up-reconciliation/v0.1";
  source_follow_up_plan_schema_version: UnitReviewProviderExecutionFollowUpPlan["schema_version"];
  source_follow_up_receipt_schema_version: UnitReviewProviderExecutionFollowUpReceipt["schema_version"];
  request_key: string;
  chain_key: string;
  attempt_key: string;
  unit_id: string;
  follow_up_state: UnitReviewProviderExecutionFollowUpPlan["follow_up_state"];
  follow_up_action: UnitReviewProviderExecutionFollowUpPlan["follow_up_action"];
  receipt_validation_ok: boolean;
  receipt_validation_issue_codes: ProviderExecutionFollowUpReceiptValidationIssue["code"][];
  reconciliation_status: UnitReviewProviderExecutionFollowUpReconciliationStatus;
  recommended_follow_up: UnitReviewProviderExecutionFollowUpRecommendedFollowUp;
  delivery_status: UnitReviewProviderExecutionFollowUpReceipt["overall_status"] | null;
  result_artifact_handoff: UnitReviewProviderExecutionFollowUpReceipt["result_artifact_handoff"];
  final_follow_up_item_key: string | null;
  final_follow_up_queue: UnitReviewProviderExecutionFollowUpReceipt["final_follow_up_queue"];
  unresolved_operations: Array<{
    operation_key: string;
    operation_type: UnitReviewProviderExecutionFollowUpReceipt["operations"][number]["operation_type"];
    target_item_key: string;
    status: UnitReviewProviderExecutionFollowUpReceipt["operations"][number]["status"];
  }>;
}

export interface ProviderExecutionFollowUpReconciliationSourceValidationIssue {
  code:
    | "source_follow_up_plan_contract_mismatch"
    | "source_follow_up_receipt_contract_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpReconciliationSourceValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpReconciliationSourceValidationIssue[];
}

export interface ProviderExecutionFollowUpReconciliationValidationIssue {
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
    | "final_follow_up_state_mismatch"
    | "unresolved_operations_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpReconciliationValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpReconciliationValidationIssue[];
}

export function validateUnitReviewProviderExecutionFollowUpReconciliationSource(
  request: UnitReviewProviderExecutionRequest,
  decision: UnitReviewProviderExecutionDecision,
  attempt: UnitReviewProviderExecutionAttempt,
  sourceReceipt: UnitReviewProviderExecutionReceipt,
  sourceReconciliation: UnitReviewProviderExecutionReconciliation,
  followUp: UnitReviewProviderExecutionFollowUp,
  plan: UnitReviewProviderExecutionFollowUpPlan,
  receipt: UnitReviewProviderExecutionFollowUpReceipt
): ProviderExecutionFollowUpReconciliationSourceValidationResult {
  const issues: ProviderExecutionFollowUpReconciliationSourceValidationIssue[] = [];
  const planSourceValidation = validateUnitReviewProviderExecutionFollowUpPlanSource(
    request,
    decision,
    attempt,
    sourceReceipt,
    sourceReconciliation,
    followUp
  );
  const planValidation = validateUnitReviewProviderExecutionFollowUpPlan(followUp, plan);
  const receiptSourceValidation = validateUnitReviewProviderExecutionFollowUpReceiptSource(
    request,
    decision,
    attempt,
    sourceReceipt,
    sourceReconciliation,
    followUp,
    plan
  );
  const receiptValidation = validateUnitReviewProviderExecutionFollowUpReceipt(plan, receipt);

  if (!planSourceValidation.ok || !planValidation.ok) {
    const issueCodes = [
      ...planSourceValidation.issues.map((issue) => issue.code),
      ...planValidation.issues.map((issue) => issue.code),
    ];
    issues.push({
      code: "source_follow_up_plan_contract_mismatch",
      message:
        `Provider execution follow-up reconciliation source plan chain failed validation: ${issueCodes.join(", ")}.`,
    });
  }

  if (!receiptSourceValidation.ok || !receiptValidation.ok) {
    const issueCodes = [
      ...receiptSourceValidation.issues.map((issue) => issue.code),
      ...receiptValidation.issues.map((issue) => issue.code),
    ];
    issues.push({
      code: "source_follow_up_receipt_contract_mismatch",
      message:
        `Provider execution follow-up reconciliation source receipt chain failed validation: ${issueCodes.join(", ")}.`,
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

export function buildUnitReviewProviderExecutionFollowUpReconciliation(
  plan: UnitReviewProviderExecutionFollowUpPlan,
  receipt: UnitReviewProviderExecutionFollowUpReceipt
): UnitReviewProviderExecutionFollowUpReconciliation {
  const receiptValidation = validateUnitReviewProviderExecutionFollowUpReceipt(plan, receipt);

  if (!receiptValidation.ok) {
    return {
      schema_version: "content-pipeline-review-provider-execution-follow-up-reconciliation/v0.1",
      source_follow_up_plan_schema_version:
        "content-pipeline-review-provider-execution-follow-up-plan/v0.1",
      source_follow_up_receipt_schema_version:
        "content-pipeline-review-provider-execution-follow-up-receipt/v0.1",
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
      result_artifact_handoff: null,
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
    schema_version: "content-pipeline-review-provider-execution-follow-up-reconciliation/v0.1",
    source_follow_up_plan_schema_version:
      "content-pipeline-review-provider-execution-follow-up-plan/v0.1",
    source_follow_up_receipt_schema_version:
      "content-pipeline-review-provider-execution-follow-up-receipt/v0.1",
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
        : "manual_repair_provider_execution_follow_up_delivery",
    delivery_status: receipt.overall_status,
    result_artifact_handoff: plan.result_artifact_handoff,
    final_follow_up_item_key: receipt.final_follow_up_item_key,
    final_follow_up_queue: receipt.final_follow_up_queue,
    unresolved_operations: unresolvedOperations,
  };
}

export function validateUnitReviewProviderExecutionFollowUpReconciliation(
  plan: UnitReviewProviderExecutionFollowUpPlan,
  receipt: UnitReviewProviderExecutionFollowUpReceipt,
  reconciliation: UnitReviewProviderExecutionFollowUpReconciliation
): ProviderExecutionFollowUpReconciliationValidationResult {
  const issues: ProviderExecutionFollowUpReconciliationValidationIssue[] = [];
  const expected = buildUnitReviewProviderExecutionFollowUpReconciliation(plan, receipt);

  if (
    reconciliation.schema_version !==
    "content-pipeline-review-provider-execution-follow-up-reconciliation/v0.1"
  ) {
    issues.push({
      code: "invalid_reconciliation_schema_version",
      message:
        "Provider execution follow-up reconciliation schema_version must be content-pipeline-review-provider-execution-follow-up-reconciliation/v0.1.",
    });
  }

  if (
    reconciliation.source_follow_up_plan_schema_version !==
    expected.source_follow_up_plan_schema_version
  ) {
    issues.push({
      code: "source_follow_up_plan_schema_version_mismatch",
      message:
        "Provider execution follow-up reconciliation source_follow_up_plan_schema_version must match the source plan schema_version.",
    });
  }

  if (
    reconciliation.source_follow_up_receipt_schema_version !==
    expected.source_follow_up_receipt_schema_version
  ) {
    issues.push({
      code: "source_follow_up_receipt_schema_version_mismatch",
      message:
        "Provider execution follow-up reconciliation source_follow_up_receipt_schema_version must match the source receipt schema_version.",
    });
  }

  if (reconciliation.request_key !== expected.request_key) {
    issues.push({
      code: "request_key_mismatch",
      message:
        "Provider execution follow-up reconciliation request_key must match the source follow-up plan/receipt chain.",
    });
  }

  if (reconciliation.chain_key !== expected.chain_key) {
    issues.push({
      code: "chain_key_mismatch",
      message:
        "Provider execution follow-up reconciliation chain_key must match the source follow-up plan/receipt chain.",
    });
  }

  if (reconciliation.attempt_key !== expected.attempt_key) {
    issues.push({
      code: "attempt_key_mismatch",
      message:
        "Provider execution follow-up reconciliation attempt_key must match the source follow-up plan/receipt chain.",
    });
  }

  if (reconciliation.unit_id !== expected.unit_id) {
    issues.push({
      code: "unit_id_mismatch",
      message:
        "Provider execution follow-up reconciliation unit_id must match the source follow-up plan/receipt chain.",
    });
  }

  if (reconciliation.follow_up_state !== expected.follow_up_state) {
    issues.push({
      code: "follow_up_state_mismatch",
      message:
        "Provider execution follow-up reconciliation follow_up_state must match the source follow-up plan state.",
    });
  }

  if (reconciliation.follow_up_action !== expected.follow_up_action) {
    issues.push({
      code: "follow_up_action_mismatch",
      message:
        "Provider execution follow-up reconciliation follow_up_action must match the source follow-up plan action.",
    });
  }

  if (reconciliation.receipt_validation_ok !== expected.receipt_validation_ok) {
    issues.push({
      code: "receipt_validation_state_mismatch",
      message:
        "Provider execution follow-up reconciliation receipt_validation_ok must match the actual plan-vs-receipt validation result.",
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
        "Provider execution follow-up reconciliation receipt_validation_issue_codes must match the actual follow-up receipt validation issue codes.",
    });
  }

  if (reconciliation.reconciliation_status !== expected.reconciliation_status) {
    issues.push({
      code: "reconciliation_status_mismatch",
      message:
        "Provider execution follow-up reconciliation status must match the derived closure state for the source follow-up receipt.",
    });
  }

  if (reconciliation.recommended_follow_up !== expected.recommended_follow_up) {
    issues.push({
      code: "recommended_follow_up_mismatch",
      message:
        "Provider execution follow-up reconciliation recommended_follow_up must match the derived next action for the source follow-up receipt.",
    });
  }

  if (reconciliation.delivery_status !== expected.delivery_status) {
    issues.push({
      code: "delivery_status_mismatch",
      message:
        "Provider execution follow-up reconciliation delivery_status must match the trusted source follow-up receipt delivery status.",
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
        "Provider execution follow-up reconciliation result_artifact_handoff must match the trusted source follow-up artifact handoff.",
    });
  }

  if (
    reconciliation.final_follow_up_item_key !== expected.final_follow_up_item_key ||
    reconciliation.final_follow_up_queue !== expected.final_follow_up_queue
  ) {
    issues.push({
      code: "final_follow_up_state_mismatch",
      message:
        "Provider execution follow-up reconciliation final follow-up item state must match the trusted source follow-up receipt final state.",
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
        "Provider execution follow-up reconciliation unresolved_operations must match the failed operations in the source follow-up receipt.",
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

function resultArtifactHandoffsMatch(
  actual: UnitReviewProviderExecutionFollowUpReconciliation["result_artifact_handoff"],
  expected: UnitReviewProviderExecutionFollowUpReconciliation["result_artifact_handoff"]
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
