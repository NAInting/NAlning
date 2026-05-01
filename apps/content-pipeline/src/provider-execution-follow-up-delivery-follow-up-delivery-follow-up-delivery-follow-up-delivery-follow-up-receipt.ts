import type {
  UnitReviewInboxDeliveryOperationStatus,
  UnitReviewInboxDeliveryOverallStatus,
} from "./inbox-delivery-receipt";
import type { UnitReviewProviderExecutionAttempt } from "./provider-execution-attempt";
import type { UnitReviewProviderExecutionDecision } from "./provider-execution-decision";
import type { UnitReviewProviderExecutionFollowUp } from "./provider-execution-follow-up";
import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUp } from "./provider-execution-follow-up-delivery-follow-up";
import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan } from "./provider-execution-follow-up-delivery-follow-up-plan";
import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt } from "./provider-execution-follow-up-delivery-follow-up-receipt";
import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation } from "./provider-execution-follow-up-delivery-follow-up-reconciliation";
import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUp } from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up";
import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan } from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan";
import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceipt } from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up-receipt";
import type {
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
} from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up";
import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation } from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up-reconciliation";
import type {
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
} from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up";
import type {
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
} from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan";
import type {
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt,
} from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt";
import type {
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation,
} from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation";
import type {
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
} from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan";
import {
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanContract,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSource,
} from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan";
import type { UnitReviewProviderExecutionFollowUpPlan } from "./provider-execution-follow-up-plan";
import type { UnitReviewProviderExecutionFollowUpReceipt } from "./provider-execution-follow-up-receipt";
import type { UnitReviewProviderExecutionFollowUpReconciliation } from "./provider-execution-follow-up-reconciliation";
import type { UnitReviewProviderExecutionReceipt } from "./provider-execution-receipt";
import type { UnitReviewProviderExecutionReconciliation } from "./provider-execution-reconciliation";
import type { UnitReviewProviderExecutionRequest } from "./provider-execution-request";

export interface UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt {
  schema_version: "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt/v0.1";
  source_follow_up_plan_schema_version: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["schema_version"];
  request_key: string;
  chain_key: string;
  attempt_key: string;
  unit_id: string;
  follow_up_state: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["follow_up_state"];
  follow_up_action: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["follow_up_action"];
  delivery_action: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["delivery_action"];
  executed_at: string;
  overall_status: UnitReviewInboxDeliveryOverallStatus;
  preserved_result_artifact_handoff: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["preserved_result_artifact_handoff"];
  preserved_active_follow_up_item: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["preserved_active_follow_up_item"];
  final_follow_up_item_key: string | null;
  final_follow_up_queue: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["final_follow_up_queue"];
  operations: Array<{
    operation_key: string;
    operation_type: "upsert";
    target_item_key: string;
    status: UnitReviewInboxDeliveryOperationStatus;
  }>;
}

export interface BuildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptOptions {
  executed_at: string;
  upsert_status?: UnitReviewInboxDeliveryOperationStatus;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptSourceValidationIssue {
  code:
    | "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_plan_contract_mismatch"
    | "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_plan_payload_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptSourceValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptSourceValidationIssue[];
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptValidationIssue {
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

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptValidationIssue[];
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptSource(
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
  deliveryFollowUpReceipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt,
  deliveryFollowUpReconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation,
  deliveryFollowUpDeliveryFollowUpSourceFollowUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUp,
  deliveryFollowUpDeliveryFollowUpSourcePlan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  deliveryFollowUpDeliveryFollowUpSourceReceipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceipt,
  deliveryFollowUpDeliveryFollowUpSourceReconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation,
  deliveryFollowUpDeliveryFollowUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
  deliveryFollowUpDeliveryFollowUpPlan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  deliveryFollowUpDeliveryFollowUpReceipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt,
  deliveryFollowUpDeliveryFollowUpReconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation,
  deliveryFollowUpDeliveryFollowUpDeliveryFollowUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
  deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan
): ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptSourceValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptSourceValidationIssue[] =
    [];
  const planSourceValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSource(
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
      deliveryFollowUpPlan,
      deliveryFollowUpReceipt,
      deliveryFollowUpReconciliation,
      deliveryFollowUpDeliveryFollowUpSourceFollowUp,
      deliveryFollowUpDeliveryFollowUpSourcePlan,
      deliveryFollowUpDeliveryFollowUpSourceReceipt,
      deliveryFollowUpDeliveryFollowUpSourceReconciliation,
      deliveryFollowUpDeliveryFollowUp,
      deliveryFollowUpDeliveryFollowUpPlan,
      deliveryFollowUpDeliveryFollowUpReceipt,
      deliveryFollowUpDeliveryFollowUpReconciliation,
      deliveryFollowUpDeliveryFollowUpDeliveryFollowUp
    );
  const planValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
      deliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
      deliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan
    );

  if (!planSourceValidation.ok) {
    issues.push({
      code: "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_plan_contract_mismatch",
      message:
        `Provider execution follow-up delivery follow-up delivery follow-up receipt source chain failed validation: ${planSourceValidation.issues.map((issue) => issue.code).join(", ")}.`,
    });
  }

  if (!planValidation.ok) {
    issues.push({
      code: "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_plan_payload_mismatch",
      message:
        `Provider execution follow-up delivery follow-up delivery follow-up receipt source plan payload failed validation: ${planValidation.issues.map((issue) => issue.code).join(", ")}.`,
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

export function buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt(
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  options: BuildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptOptions
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt {
  const planContractValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanContract(
      plan
    );
  if (!planContractValidation.ok) {
    throw new Error(
      `Provider execution follow-up delivery follow-up delivery follow-up receipt source plan is invalid: ${planContractValidation.issues.map((issue) => issue.code).join(", ")}.`
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
      "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt/v0.1",
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

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt(
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  receipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt
): ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceiptValidationIssue[] =
    [];

  if (
    receipt.schema_version !==
    "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt/v0.1"
  ) {
    issues.push({
      code: "invalid_receipt_schema_version",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up receipt schema_version must be content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt/v0.1.",
    });
  }

  if (receipt.source_follow_up_plan_schema_version !== plan.schema_version) {
    issues.push({
      code: "source_follow_up_plan_schema_version_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up receipt source_follow_up_plan_schema_version must match the source plan schema_version.",
    });
  }

  if (receipt.request_key !== plan.request_key) {
    issues.push({
      code: "request_key_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up receipt request_key must match the source plan request_key.",
    });
  }

  if (receipt.chain_key !== plan.chain_key) {
    issues.push({
      code: "chain_key_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up receipt chain_key must match the source plan chain_key.",
    });
  }

  if (receipt.attempt_key !== plan.attempt_key) {
    issues.push({
      code: "attempt_key_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up receipt attempt_key must match the source plan attempt_key.",
    });
  }

  if (receipt.unit_id !== plan.unit_id) {
    issues.push({
      code: "unit_id_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up receipt unit_id must match the source plan unit_id.",
    });
  }

  if (receipt.follow_up_state !== plan.follow_up_state) {
    issues.push({
      code: "follow_up_state_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up receipt follow_up_state must match the source plan follow_up_state.",
    });
  }

  if (receipt.follow_up_action !== plan.follow_up_action) {
    issues.push({
      code: "follow_up_action_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up receipt follow_up_action must match the source plan follow_up_action.",
    });
  }

  if (receipt.delivery_action !== plan.delivery_action) {
    issues.push({
      code: "delivery_action_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up receipt delivery_action must match the source plan delivery_action.",
    });
  }

  const expectedOperations = plan.upsert
    ? [
        {
          operation_key: plan.upsert.operation_key,
          operation_type: "upsert" as const,
          target_item_key: plan.upsert.item_key,
        },
      ]
    : [];

  if (receipt.operations.length !== expectedOperations.length) {
    issues.push({
      code: "operation_count_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up receipt operations must match the source plan operation count.",
    });
  }

  const operationKeys = receipt.operations.map((operation) => operation.operation_key);
  if (new Set(operationKeys).size !== operationKeys.length) {
    issues.push({
      code: "duplicate_operation_keys",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up receipt operation keys must be unique.",
    });
  }

  for (const expectedOperation of expectedOperations) {
    const actualOperation = receipt.operations.find(
      (operation) => operation.operation_key === expectedOperation.operation_key
    );

    if (!actualOperation) {
      issues.push({
        code: "unexpected_operation_key",
        message:
          `Provider execution follow-up delivery follow-up delivery follow-up receipt must include operation ${expectedOperation.operation_key}.`,
      });
      continue;
    }

    if (actualOperation.operation_type !== expectedOperation.operation_type) {
      issues.push({
        code: "operation_type_mismatch",
        message:
          `Provider execution follow-up delivery follow-up delivery follow-up receipt operation ${expectedOperation.operation_key} must keep type upsert.`,
      });
    }

    if (actualOperation.target_item_key !== expectedOperation.target_item_key) {
      issues.push({
        code: "operation_target_mismatch",
        message:
          `Provider execution follow-up delivery follow-up delivery follow-up receipt operation ${expectedOperation.operation_key} must target ${expectedOperation.target_item_key}.`,
      });
    }
  }

  for (const actualOperation of receipt.operations) {
    if (!isInboxDeliveryOperationStatus(actualOperation.status)) {
      issues.push({
        code: "invalid_operation_status",
        message:
          `Provider execution follow-up delivery follow-up delivery follow-up receipt operation ${actualOperation.operation_key} must use status applied, already_applied, or failed.`,
      });
    }

    if (
      !expectedOperations.some(
        (expectedOperation) => expectedOperation.operation_key === actualOperation.operation_key
      )
    ) {
      issues.push({
        code: "unexpected_operation_key",
        message:
          `Provider execution follow-up delivery follow-up delivery follow-up receipt contains unexpected operation ${actualOperation.operation_key}.`,
      });
    }
  }

  const expectedOverallStatus = deriveOverallStatus(
    receipt.operations.map((operation) => operation.status)
  );
  if (receipt.overall_status !== expectedOverallStatus) {
    issues.push({
      code: "overall_status_mismatch",
      message:
        `Provider execution follow-up delivery follow-up delivery follow-up receipt overall_status must be ${expectedOverallStatus} for the recorded operation statuses.`,
    });
  }

  if (
    !resultArtifactHandoffsMatch(
      receipt.preserved_result_artifact_handoff,
      plan.preserved_result_artifact_handoff
    )
  ) {
    issues.push({
      code: "preserved_result_artifact_handoff_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up receipt preserved_result_artifact_handoff must match the source plan artifact handoff.",
    });
  }

  if (
    receipt.preserved_active_follow_up_item.item_key !==
      plan.preserved_active_follow_up_item.item_key ||
    receipt.preserved_active_follow_up_item.human_queue !==
      plan.preserved_active_follow_up_item.human_queue ||
    receipt.preserved_active_follow_up_item.should_remain_open !==
      plan.preserved_active_follow_up_item.should_remain_open
  ) {
    issues.push({
      code: "preserved_active_follow_up_item_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up receipt preserved_active_follow_up_item must match the source plan preserved active item.",
    });
  }

  const upsertOperation = receipt.operations[0];
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
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up receipt final follow-up item state must match the source plan after applying the recorded upsert status.",
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
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

function resultArtifactHandoffsMatch(
  actual: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt["preserved_result_artifact_handoff"],
  expected: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["preserved_result_artifact_handoff"]
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


