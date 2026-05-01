import type {
  ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptValidationIssue,
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt,
} from "./provider-execution-follow-up-n11-receipt";
import {
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptSource,
} from "./provider-execution-follow-up-n11-receipt";
import type {
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
} from "./provider-execution-follow-up-n11-plan";
import {
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanContract,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSource,
} from "./provider-execution-follow-up-n11-plan";

type LatestPlanSourceArgs = Parameters<
  typeof validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSource
>;

export type UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationStatus =
  | "closed"
  | "action_required";

export type UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpRecommendedFollowUp =
  | "none"
  | "manual_repair_provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up"
  | "manual_receipt_triage";

export interface UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation {
  schema_version: "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation/v0.1";
  source_follow_up_plan_schema_version: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["schema_version"];
  source_follow_up_receipt_schema_version: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt["schema_version"];
  request_key: string;
  chain_key: string;
  attempt_key: string;
  unit_id: string;
  follow_up_state: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["follow_up_state"];
  follow_up_action: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["follow_up_action"];
  receipt_validation_ok: boolean;
  receipt_validation_issue_codes: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptValidationIssue["code"][];
  reconciliation_status: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationStatus;
  recommended_follow_up: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpRecommendedFollowUp;
  delivery_status: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt["overall_status"] | null;
  result_artifact_handoff: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["preserved_result_artifact_handoff"];
  preserved_active_follow_up_item: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["preserved_active_follow_up_item"];
  final_follow_up_item_key: string | null;
  final_follow_up_queue: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt["final_follow_up_queue"];
  unresolved_operations: Array<{
    operation_key: string;
    operation_type: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt["operations"][number]["operation_type"];
    target_item_key: string;
    status: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt["operations"][number]["status"];
  }>;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationSourceValidationIssue {
  code:
    | "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_plan_contract_mismatch"
    | "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_receipt_contract_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationSourceValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationSourceValidationIssue[];
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationValidationIssue {
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

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationValidationIssue[];
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationSource(
  ...args: [
    ...LatestPlanSourceArgs,
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt
  ]
): ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationSourceValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationSourceValidationIssue[] =
    [];
  const sourceArgs = args.slice(0, -2) as unknown as LatestPlanSourceArgs;
  const followUp = sourceArgs.at(-1) as LatestPlanSourceArgs[number];
  const plan = args.at(-2) as UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan;
  const receipt = args.at(-1) as UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt;
  const planSourceValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSource(
      ...sourceArgs
    );
  const planContractValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanContract(
      plan
    );
  const planPayloadValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
      followUp as Parameters<typeof validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan>[0],
      plan
    );
  const receiptSourceValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptSource(
      ...sourceArgs,
      plan
    );

  if (!planSourceValidation.ok || !planContractValidation.ok || !planPayloadValidation.ok) {
    const issueCodes = [
      ...planSourceValidation.issues.map((issue) => issue.code),
      ...planContractValidation.issues.map((issue) => issue.code),
      ...planPayloadValidation.issues.map((issue) => issue.code),
    ];
    issues.push({
      code: "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_plan_contract_mismatch",
      message: `Provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up reconciliation source plan chain failed validation: ${issueCodes.join(", ")}.`,
    });
  }

  if (!receiptSourceValidation.ok) {
    const issueCodes = receiptSourceValidation.issues.map((issue) => issue.code);
    issues.push({
      code: "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_receipt_contract_mismatch",
      message: `Provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up reconciliation source receipt chain failed validation: ${issueCodes.join(", ")}.`,
    });
  }

  return { ok: issues.length === 0, issues };
}

export function buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  receipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation {
  const planContractValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanContract(
      plan
    );
  if (!planContractValidation.ok) {
    throw new Error(
      `Provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up reconciliation source plan is invalid: ${planContractValidation.issues.map((issue) => issue.code).join(", ")}.`
    );
  }
  const receiptValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt(
      plan,
      receipt
    );

  if (!receiptValidation.ok) {
    return {
      schema_version:
        "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation/v0.1",
      source_follow_up_plan_schema_version:
        "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1",
      source_follow_up_receipt_schema_version:
        "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt/v0.1",
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
      "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation/v0.1",
    source_follow_up_plan_schema_version:
      "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1",
    source_follow_up_receipt_schema_version:
      "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt/v0.1",
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
        : "manual_repair_provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up",
    delivery_status: receipt.overall_status,
    result_artifact_handoff: plan.preserved_result_artifact_handoff,
    preserved_active_follow_up_item: plan.preserved_active_follow_up_item,
    final_follow_up_item_key: receipt.final_follow_up_item_key,
    final_follow_up_queue: receipt.final_follow_up_queue,
    unresolved_operations: unresolvedOperations,
  };
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  receipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt,
  reconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation
): ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationValidationIssue[] =
    [];
  const expected =
    buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
      plan,
      receipt
    );

  if (
    reconciliation.schema_version !==
    "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation/v0.1"
  ) {
    issues.push({
      code: "invalid_reconciliation_schema_version",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up reconciliation schema_version must match v0.1.",
    });
  }

  pushReconciliationMismatchIssues(reconciliation, expected, issues);
  return { ok: issues.length === 0, issues };
}

function pushReconciliationMismatchIssues(
  reconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation,
  expected: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation,
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationValidationIssue[]
): void {
  const checks: Array<{
    code: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationValidationIssue["code"];
    actual: unknown;
    expected: unknown;
    message: string;
  }> = [
    { code: "source_follow_up_plan_schema_version_mismatch", actual: reconciliation.source_follow_up_plan_schema_version, expected: expected.source_follow_up_plan_schema_version, message: "source_follow_up_plan_schema_version must match expected." },
    { code: "source_follow_up_receipt_schema_version_mismatch", actual: reconciliation.source_follow_up_receipt_schema_version, expected: expected.source_follow_up_receipt_schema_version, message: "source_follow_up_receipt_schema_version must match expected." },
    { code: "request_key_mismatch", actual: reconciliation.request_key, expected: expected.request_key, message: "request_key must match expected." },
    { code: "chain_key_mismatch", actual: reconciliation.chain_key, expected: expected.chain_key, message: "chain_key must match expected." },
    { code: "attempt_key_mismatch", actual: reconciliation.attempt_key, expected: expected.attempt_key, message: "attempt_key must match expected." },
    { code: "unit_id_mismatch", actual: reconciliation.unit_id, expected: expected.unit_id, message: "unit_id must match expected." },
    { code: "follow_up_state_mismatch", actual: reconciliation.follow_up_state, expected: expected.follow_up_state, message: "follow_up_state must match expected." },
    { code: "follow_up_action_mismatch", actual: reconciliation.follow_up_action, expected: expected.follow_up_action, message: "follow_up_action must match expected." },
    { code: "receipt_validation_state_mismatch", actual: reconciliation.receipt_validation_ok, expected: expected.receipt_validation_ok, message: "receipt_validation_ok must match validation result." },
    { code: "receipt_validation_issue_codes_mismatch", actual: reconciliation.receipt_validation_issue_codes, expected: expected.receipt_validation_issue_codes, message: "receipt_validation_issue_codes must match validation result." },
    { code: "reconciliation_status_mismatch", actual: reconciliation.reconciliation_status, expected: expected.reconciliation_status, message: "reconciliation_status must match expected." },
    { code: "recommended_follow_up_mismatch", actual: reconciliation.recommended_follow_up, expected: expected.recommended_follow_up, message: "recommended_follow_up must match expected." },
    { code: "delivery_status_mismatch", actual: reconciliation.delivery_status, expected: expected.delivery_status, message: "delivery_status must match trusted receipt status." },
    { code: "result_artifact_handoff_mismatch", actual: reconciliation.result_artifact_handoff, expected: expected.result_artifact_handoff, message: "result_artifact_handoff must match expected." },
    { code: "preserved_active_follow_up_item_mismatch", actual: reconciliation.preserved_active_follow_up_item, expected: expected.preserved_active_follow_up_item, message: "preserved_active_follow_up_item must match expected." },
    { code: "final_follow_up_state_mismatch", actual: [reconciliation.final_follow_up_item_key, reconciliation.final_follow_up_queue], expected: [expected.final_follow_up_item_key, expected.final_follow_up_queue], message: "final follow-up state must match expected." },
    { code: "unresolved_operations_mismatch", actual: reconciliation.unresolved_operations, expected: expected.unresolved_operations, message: "unresolved_operations must match failed receipt operations." },
  ];

  for (const check of checks) {
    if (!jsonEqual(check.actual, check.expected)) {
      issues.push({ code: check.code, message: check.message });
    }
  }
}

function jsonEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}





