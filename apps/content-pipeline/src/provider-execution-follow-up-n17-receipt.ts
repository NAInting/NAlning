import type {
  UnitReviewInboxDeliveryOperationStatus,
  UnitReviewInboxDeliveryOverallStatus,
} from "./inbox-delivery-receipt";
import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp } from "./provider-execution-follow-up-n17";
import type {
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
} from "./provider-execution-follow-up-n17-plan";
import {
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanContract,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSource,
} from "./provider-execution-follow-up-n17-plan";

type LatestPlanSourceArgs = Parameters<
  typeof validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSource
>;

export interface UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt {
  schema_version: "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt/v0.1";
  source_follow_up_plan_schema_version: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["schema_version"];
  request_key: string;
  chain_key: string;
  attempt_key: string;
  unit_id: string;
  follow_up_state: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["follow_up_state"];
  follow_up_action: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["follow_up_action"];
  delivery_action: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["delivery_action"];
  executed_at: string;
  overall_status: UnitReviewInboxDeliveryOverallStatus;
  preserved_result_artifact_handoff: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["preserved_result_artifact_handoff"];
  preserved_active_follow_up_item: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["preserved_active_follow_up_item"];
  final_follow_up_item_key: string | null;
  final_follow_up_queue: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["final_follow_up_queue"];
  operations: Array<{
    operation_key: string;
    operation_type: "upsert";
    target_item_key: string;
    status: UnitReviewInboxDeliveryOperationStatus;
  }>;
}

export interface BuildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptOptions {
  executed_at: string;
  upsert_status?: UnitReviewInboxDeliveryOperationStatus;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptSourceValidationIssue {
  code:
    | "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_plan_contract_mismatch"
    | "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_plan_payload_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptSourceValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptSourceValidationIssue[];
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptValidationIssue {
  code:
    | "invalid_receipt_schema_version"
    | "source_follow_up_plan_schema_version_mismatch"
    | "request_key_mismatch"
    | "chain_key_mismatch"
    | "attempt_key_mismatch"
    | "unit_id_mismatch"
    | "follow_up_state_mismatch"
    | "follow_up_action_mismatch"
    | "delivery_action_mismatch"
    | "operation_count_mismatch"
    | "invalid_operation_entry"
    | "duplicate_operation_keys"
    | "unexpected_operation_key"
    | "operation_type_mismatch"
    | "operation_target_mismatch"
    | "invalid_operation_status"
    | "overall_status_mismatch"
    | "preserved_result_artifact_handoff_mismatch"
    | "preserved_active_follow_up_item_mismatch"
    | "final_follow_up_state_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptValidationIssue[];
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptSource(
  ...args: [
    ...LatestPlanSourceArgs,
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan
  ]
): ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptSourceValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptSourceValidationIssue[] =
    [];
  const sourceArgs = args.slice(0, -1) as unknown as LatestPlanSourceArgs;
  const followUp = sourceArgs.at(-1) as UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp;
  const plan = args.at(-1) as UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan;
  const sourceValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSource(
      ...sourceArgs
    );
  const planValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
      followUp,
      plan
    );

  if (!sourceValidation.ok) {
    issues.push({
      code: "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_plan_contract_mismatch",
      message: `Provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up receipt source chain failed validation: ${sourceValidation.issues.map((issue) => issue.code).join(", ")}.`,
    });
  }

  if (!planValidation.ok) {
    issues.push({
      code: "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_plan_payload_mismatch",
      message: `Provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up receipt source plan payload failed validation: ${planValidation.issues.map((issue) => issue.code).join(", ")}.`,
    });
  }

  return { ok: issues.length === 0, issues };
}

export function buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt(
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  options: BuildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptOptions
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt {
  const planContractValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanContract(
      plan
    );
  if (!planContractValidation.ok) {
    throw new Error(
      `Provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up receipt source plan is invalid: ${planContractValidation.issues.map((issue) => issue.code).join(", ")}.`
    );
  }

  const operations = plan.upsert
    ? [
        {
          operation_key: plan.upsert.operation_key,
          operation_type: "upsert" as const,
          target_item_key: plan.upsert.item_key,
          status: options.upsert_status ?? "applied",
        },
      ]
    : [];
  const overallStatus = deriveOverallStatus(operations.map((operation) => operation.status));
  const upsertSucceeded = operations[0]?.status !== "failed";

  return {
    schema_version:
      "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt/v0.1",
    source_follow_up_plan_schema_version: plan.schema_version,
    request_key: plan.request_key,
    chain_key: plan.chain_key,
    attempt_key: plan.attempt_key,
    unit_id: plan.unit_id,
    follow_up_state: plan.follow_up_state,
    follow_up_action: plan.follow_up_action,
    delivery_action: plan.delivery_action,
    executed_at: options.executed_at,
    overall_status: overallStatus,
    preserved_result_artifact_handoff: plan.preserved_result_artifact_handoff,
    preserved_active_follow_up_item: plan.preserved_active_follow_up_item,
    final_follow_up_item_key:
      plan.upsert && !upsertSucceeded ? null : plan.final_follow_up_item_key,
    final_follow_up_queue:
      plan.upsert && !upsertSucceeded ? null : plan.final_follow_up_queue,
    operations,
  };
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt(
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  receipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt
): ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptValidationIssue[] =
    [];
  if (!isRecord(receipt)) {
    issues.push({
      code: "invalid_receipt_schema_version",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up receipt must be an object with schema_version v0.1.",
    });
    return { ok: false, issues };
  }

  if (
    receipt.schema_version !==
    "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt/v0.1"
  ) {
    issues.push({
      code: "invalid_receipt_schema_version",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up receipt schema_version must match v0.1.",
    });
  }

  pushReceiptMismatchIssues(plan, receipt, issues);
  return { ok: issues.length === 0, issues };
}

function pushReceiptMismatchIssues(
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  receipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt,
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptValidationIssue[]
): void {
  const expectedOperations = plan.upsert
    ? [
        {
          operation_key: plan.upsert.operation_key,
          operation_type: "upsert" as const,
          target_item_key: plan.upsert.item_key,
        },
      ]
    : [];
  const scalarChecks: Array<{
    code: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptValidationIssue["code"];
    actual: unknown;
    expected: unknown;
    message: string;
  }> = [
    { code: "source_follow_up_plan_schema_version_mismatch", actual: receipt.source_follow_up_plan_schema_version, expected: plan.schema_version, message: "source_follow_up_plan_schema_version must match plan schema_version." },
    { code: "request_key_mismatch", actual: receipt.request_key, expected: plan.request_key, message: "request_key must match plan request_key." },
    { code: "chain_key_mismatch", actual: receipt.chain_key, expected: plan.chain_key, message: "chain_key must match plan chain_key." },
    { code: "attempt_key_mismatch", actual: receipt.attempt_key, expected: plan.attempt_key, message: "attempt_key must match plan attempt_key." },
    { code: "unit_id_mismatch", actual: receipt.unit_id, expected: plan.unit_id, message: "unit_id must match plan unit_id." },
    { code: "follow_up_state_mismatch", actual: receipt.follow_up_state, expected: plan.follow_up_state, message: "follow_up_state must match plan follow_up_state." },
    { code: "follow_up_action_mismatch", actual: receipt.follow_up_action, expected: plan.follow_up_action, message: "follow_up_action must match plan follow_up_action." },
    { code: "delivery_action_mismatch", actual: receipt.delivery_action, expected: plan.delivery_action, message: "delivery_action must match plan delivery_action." },
  ];

  for (const check of scalarChecks) {
    if (!jsonEqual(check.actual, check.expected)) {
      issues.push({ code: check.code, message: check.message });
    }
  }

  const operationsAreArray = Array.isArray(receipt.operations);
  const invalidOperationCount = operationsAreArray
    ? receipt.operations.filter((operation) => !isReceiptOperationEntry(operation)).length
    : 0;
  const receiptOperations = operationsAreArray
    ? receipt.operations.filter(isReceiptOperationEntry)
    : [];
  if (!operationsAreArray) {
    issues.push({
      code: "operation_count_mismatch",
      message: "receipt operations must be an array before reconciliation can trust executor outcomes.",
    });
  } else if (invalidOperationCount > 0) {
    issues.push({
      code: "invalid_operation_entry",
      message: "receipt operations must contain only object entries before reconciliation can trust executor outcomes.",
    });
  }

  if (operationsAreArray && receiptOperations.length !== expectedOperations.length) {
    issues.push({
      code: "operation_count_mismatch",
      message: "receipt operations must match the plan operation count.",
    });
  }

  const operationKeys = receiptOperations.map((operation) => operation.operation_key);
  if (new Set(operationKeys).size !== operationKeys.length) {
    issues.push({
      code: "duplicate_operation_keys",
      message: "receipt operation keys must be unique.",
    });
  }

  if (operationsAreArray) {
    for (const expectedOperation of expectedOperations) {
      const actualOperation = receiptOperations.find(
        (operation) => operation.operation_key === expectedOperation.operation_key
      );
      if (!actualOperation) {
        issues.push({
          code: "unexpected_operation_key",
          message: `receipt must include expected operation ${expectedOperation.operation_key}.`,
        });
        continue;
      }

      if (actualOperation.operation_type !== expectedOperation.operation_type) {
        issues.push({
          code: "operation_type_mismatch",
          message: `receipt operation ${expectedOperation.operation_key} must keep type upsert.`,
        });
      }

      if (actualOperation.target_item_key !== expectedOperation.target_item_key) {
        issues.push({
          code: "operation_target_mismatch",
          message: `receipt operation ${expectedOperation.operation_key} must target the plan item key.`,
        });
      }
    }
  }

  for (const actualOperation of receiptOperations) {
    if (!isInboxDeliveryOperationStatus(actualOperation.status)) {
      issues.push({
        code: "invalid_operation_status",
        message: `receipt operation ${actualOperation.operation_key} must use status applied, already_applied, or failed.`,
      });
    }

    if (
      !expectedOperations.some(
        (expectedOperation) => expectedOperation.operation_key === actualOperation.operation_key
      )
    ) {
      issues.push({
        code: "unexpected_operation_key",
        message: `receipt contains unexpected operation ${actualOperation.operation_key}.`,
      });
    }
  }

  const expectedOverallStatus = deriveOverallStatus(
    receiptOperations.map((operation) => operation.status)
  );
  if (receipt.overall_status !== expectedOverallStatus) {
    issues.push({
      code: "overall_status_mismatch",
      message: `overall_status must be ${expectedOverallStatus} for recorded operation statuses.`,
    });
  }

  if (!jsonEqual(receipt.preserved_result_artifact_handoff, plan.preserved_result_artifact_handoff)) {
    issues.push({
      code: "preserved_result_artifact_handoff_mismatch",
      message: "preserved_result_artifact_handoff must match the source plan.",
    });
  }

  if (!jsonEqual(receipt.preserved_active_follow_up_item, plan.preserved_active_follow_up_item)) {
    issues.push({
      code: "preserved_active_follow_up_item_mismatch",
      message: "preserved_active_follow_up_item must match the source plan.",
    });
  }

  const upsertOperation = receiptOperations[0];
  const expectedFinalFollowUpState =
    !plan.upsert || upsertOperation?.status !== "failed"
      ? { item_key: plan.final_follow_up_item_key, queue: plan.final_follow_up_queue }
      : { item_key: null, queue: null };
  if (
    receipt.final_follow_up_item_key !== expectedFinalFollowUpState.item_key ||
    receipt.final_follow_up_queue !== expectedFinalFollowUpState.queue
  ) {
    issues.push({
      code: "final_follow_up_state_mismatch",
      message: "final follow-up state must match the plan after applying the recorded upsert status.",
    });
  }
}

function deriveOverallStatus(
  statuses: UnitReviewInboxDeliveryOperationStatus[]
): UnitReviewInboxDeliveryOverallStatus {
  const failedCount = statuses.filter((status) => status === "failed").length;
  if (failedCount === 0) {
    return "applied";
  }

  if (failedCount === statuses.length) {
    return "failed";
  }

  return "partially_applied";
}

function isInboxDeliveryOperationStatus(
  status: unknown
): status is UnitReviewInboxDeliveryOperationStatus {
  return status === "applied" || status === "already_applied" || status === "failed";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isReceiptOperationEntry(
  operation: unknown
): operation is UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt["operations"][number] {
  return typeof operation === "object" && operation !== null;
}

function jsonEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}








