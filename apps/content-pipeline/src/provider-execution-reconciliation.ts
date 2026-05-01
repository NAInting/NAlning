import type { UnitReviewProviderExecutionAttempt } from "./provider-execution-attempt";
import type { UnitReviewProviderExecutionDecision } from "./provider-execution-decision";
import type {
  ProviderExecutionReceiptValidationIssue,
  UnitReviewProviderExecutionReceipt
} from "./provider-execution-receipt";
import { validateUnitReviewProviderExecutionReceipt } from "./provider-execution-receipt";
import type { UnitReviewProviderExecutionRequest } from "./provider-execution-request";

export type UnitReviewProviderExecutionReconciliationStatus = "closed" | "action_required";
export type UnitReviewProviderExecutionReconciliationRecommendedFollowUp =
  | "review_result_artifact"
  | "manual_execution_triage"
  | "manual_receipt_triage";
export type UnitReviewProviderExecutionOutcome =
  | UnitReviewProviderExecutionReceipt["receipt_status"]
  | "invalid_receipt";

export interface UnitReviewProviderExecutionReconciliation {
  schema_version: "content-pipeline-review-provider-execution-reconciliation/v0.1";
  source_request_schema_version: UnitReviewProviderExecutionRequest["schema_version"];
  source_decision_schema_version: UnitReviewProviderExecutionDecision["schema_version"];
  source_attempt_schema_version: UnitReviewProviderExecutionAttempt["schema_version"];
  source_receipt_schema_version: UnitReviewProviderExecutionReceipt["schema_version"];
  request_key: string;
  chain_key: string;
  attempt_key: string;
  unit_id: string;
  receipt_validation_ok: boolean;
  receipt_validation_issue_codes: ProviderExecutionReceiptValidationIssue["code"][];
  reconciliation_status: UnitReviewProviderExecutionReconciliationStatus;
  recommended_follow_up: UnitReviewProviderExecutionReconciliationRecommendedFollowUp;
  execution_outcome: UnitReviewProviderExecutionOutcome;
  result_artifact_available: boolean;
  result_artifact_generated_at: string | null;
  result_artifact_status: UnitReviewProviderExecutionReceipt["result_artifact_status"];
  actual_provider_call_count: number | null;
  executed_by: string | null;
  executed_at: string | null;
  failure_code: string | null;
}

export interface ProviderExecutionReconciliationValidationIssue {
  code:
    | "invalid_reconciliation_schema_version"
    | "source_request_schema_version_mismatch"
    | "source_decision_schema_version_mismatch"
    | "source_attempt_schema_version_mismatch"
    | "source_receipt_schema_version_mismatch"
    | "request_key_mismatch"
    | "chain_key_mismatch"
    | "attempt_key_mismatch"
    | "unit_id_mismatch"
    | "receipt_validation_state_mismatch"
    | "receipt_validation_issue_codes_mismatch"
    | "reconciliation_status_mismatch"
    | "recommended_follow_up_mismatch"
    | "execution_outcome_mismatch"
    | "result_artifact_state_mismatch"
    | "execution_metadata_mismatch"
    | "failure_code_mismatch";
  message: string;
}

export interface ProviderExecutionReconciliationValidationResult {
  ok: boolean;
  issues: ProviderExecutionReconciliationValidationIssue[];
}

const providerExecutionRequestSchemaVersion =
  "content-pipeline-review-provider-execution-request/v0.1";
const providerExecutionDecisionSchemaVersion =
  "content-pipeline-review-provider-execution-decision/v0.1";
const providerExecutionAttemptSchemaVersion =
  "content-pipeline-review-provider-execution-attempt/v0.1";
const providerExecutionReceiptSchemaVersion =
  "content-pipeline-review-provider-execution-receipt/v0.1";

export function buildUnitReviewProviderExecutionReconciliation(
  request: UnitReviewProviderExecutionRequest,
  decision: UnitReviewProviderExecutionDecision,
  attempt: UnitReviewProviderExecutionAttempt,
  receipt: UnitReviewProviderExecutionReceipt
): UnitReviewProviderExecutionReconciliation {
  const receiptValidation = validateUnitReviewProviderExecutionReceipt(
    request,
    decision,
    attempt,
    receipt
  );

  if (!receiptValidation.ok) {
    return {
      schema_version: "content-pipeline-review-provider-execution-reconciliation/v0.1",
      source_request_schema_version: providerExecutionRequestSchemaVersion,
      source_decision_schema_version: providerExecutionDecisionSchemaVersion,
      source_attempt_schema_version: providerExecutionAttemptSchemaVersion,
      source_receipt_schema_version: providerExecutionReceiptSchemaVersion,
      request_key: request.request_key,
      chain_key: request.chain_key,
      attempt_key: attempt.attempt_key,
      unit_id: request.unit_id,
      receipt_validation_ok: false,
      receipt_validation_issue_codes: receiptValidation.issues.map((issue) => issue.code),
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_receipt_triage",
      execution_outcome: "invalid_receipt",
      result_artifact_available: false,
      result_artifact_generated_at: null,
      result_artifact_status: null,
      actual_provider_call_count: null,
      executed_by: null,
      executed_at: null,
      failure_code: null
    };
  }

  const artifactRecorded = receipt.receipt_status === "artifact_recorded";

  return {
    schema_version: "content-pipeline-review-provider-execution-reconciliation/v0.1",
    source_request_schema_version: providerExecutionRequestSchemaVersion,
    source_decision_schema_version: providerExecutionDecisionSchemaVersion,
    source_attempt_schema_version: providerExecutionAttemptSchemaVersion,
    source_receipt_schema_version: providerExecutionReceiptSchemaVersion,
    request_key: request.request_key,
    chain_key: request.chain_key,
    attempt_key: attempt.attempt_key,
    unit_id: request.unit_id,
    receipt_validation_ok: true,
    receipt_validation_issue_codes: [],
    reconciliation_status: artifactRecorded ? "closed" : "action_required",
    recommended_follow_up: artifactRecorded
      ? "review_result_artifact"
      : "manual_execution_triage",
    execution_outcome: receipt.receipt_status,
    result_artifact_available: artifactRecorded,
    result_artifact_generated_at: artifactRecorded
      ? receipt.result_artifact_generated_at
      : null,
    result_artifact_status: artifactRecorded ? receipt.result_artifact_status : null,
    actual_provider_call_count: receipt.actual_provider_call_count,
    executed_by: receipt.executed_by,
    executed_at: receipt.executed_at,
    failure_code: artifactRecorded ? null : receipt.failure_code ?? null
  };
}

export function validateUnitReviewProviderExecutionReconciliation(
  request: UnitReviewProviderExecutionRequest,
  decision: UnitReviewProviderExecutionDecision,
  attempt: UnitReviewProviderExecutionAttempt,
  receipt: UnitReviewProviderExecutionReceipt,
  reconciliation: UnitReviewProviderExecutionReconciliation
): ProviderExecutionReconciliationValidationResult {
  const issues: ProviderExecutionReconciliationValidationIssue[] = [];
  const expected = buildUnitReviewProviderExecutionReconciliation(
    request,
    decision,
    attempt,
    receipt
  );

  if (
    reconciliation.schema_version !==
    "content-pipeline-review-provider-execution-reconciliation/v0.1"
  ) {
    issues.push({
      code: "invalid_reconciliation_schema_version",
      message:
        "Provider execution reconciliation schema_version must be content-pipeline-review-provider-execution-reconciliation/v0.1."
    });
  }

  if (
    reconciliation.source_request_schema_version !==
    expected.source_request_schema_version
  ) {
    issues.push({
      code: "source_request_schema_version_mismatch",
      message:
        "Provider execution reconciliation source_request_schema_version must match the source request schema_version."
    });
  }

  if (
    reconciliation.source_decision_schema_version !==
    expected.source_decision_schema_version
  ) {
    issues.push({
      code: "source_decision_schema_version_mismatch",
      message:
        "Provider execution reconciliation source_decision_schema_version must match the source decision schema_version."
    });
  }

  if (
    reconciliation.source_attempt_schema_version !==
    expected.source_attempt_schema_version
  ) {
    issues.push({
      code: "source_attempt_schema_version_mismatch",
      message:
        "Provider execution reconciliation source_attempt_schema_version must match the source attempt schema_version."
    });
  }

  if (
    reconciliation.source_receipt_schema_version !==
    expected.source_receipt_schema_version
  ) {
    issues.push({
      code: "source_receipt_schema_version_mismatch",
      message:
        "Provider execution reconciliation source_receipt_schema_version must match the source receipt schema_version."
    });
  }

  if (reconciliation.request_key !== expected.request_key) {
    issues.push({
      code: "request_key_mismatch",
      message:
        "Provider execution reconciliation request_key must match the source request/receipt chain."
    });
  }

  if (reconciliation.chain_key !== expected.chain_key) {
    issues.push({
      code: "chain_key_mismatch",
      message:
        "Provider execution reconciliation chain_key must match the source request/receipt chain."
    });
  }

  if (reconciliation.attempt_key !== expected.attempt_key) {
    issues.push({
      code: "attempt_key_mismatch",
      message:
        "Provider execution reconciliation attempt_key must match the source attempt/receipt chain."
    });
  }

  if (reconciliation.unit_id !== expected.unit_id) {
    issues.push({
      code: "unit_id_mismatch",
      message:
        "Provider execution reconciliation unit_id must match the source request/receipt unit."
    });
  }

  if (reconciliation.receipt_validation_ok !== expected.receipt_validation_ok) {
    issues.push({
      code: "receipt_validation_state_mismatch",
      message:
        "Provider execution reconciliation receipt_validation_ok must match the actual request/decision/attempt/receipt validation result."
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
        "Provider execution reconciliation receipt_validation_issue_codes must match the actual receipt validation issue codes."
    });
  }

  if (
    reconciliation.reconciliation_status !== expected.reconciliation_status
  ) {
    issues.push({
      code: "reconciliation_status_mismatch",
      message:
        "Provider execution reconciliation reconciliation_status must match the derived result state for the source receipt."
    });
  }

  if (
    reconciliation.recommended_follow_up !== expected.recommended_follow_up
  ) {
    issues.push({
      code: "recommended_follow_up_mismatch",
      message:
        "Provider execution reconciliation recommended_follow_up must match the derived post-execution action for the source receipt."
    });
  }

  if (reconciliation.execution_outcome !== expected.execution_outcome) {
    issues.push({
      code: "execution_outcome_mismatch",
      message:
        "Provider execution reconciliation execution_outcome must match the validated execution receipt outcome."
    });
  }

  if (
    reconciliation.result_artifact_available !== expected.result_artifact_available ||
    reconciliation.result_artifact_generated_at !==
      expected.result_artifact_generated_at ||
    reconciliation.result_artifact_status !== expected.result_artifact_status
  ) {
    issues.push({
      code: "result_artifact_state_mismatch",
      message:
        "Provider execution reconciliation result artifact state must match the trusted result artifact metadata derived from the source receipt."
    });
  }

  if (
    reconciliation.actual_provider_call_count !==
      expected.actual_provider_call_count ||
    reconciliation.executed_by !== expected.executed_by ||
    reconciliation.executed_at !== expected.executed_at
  ) {
    issues.push({
      code: "execution_metadata_mismatch",
      message:
        "Provider execution reconciliation execution metadata must match the trusted execution metadata derived from the source receipt."
    });
  }

  if (reconciliation.failure_code !== expected.failure_code) {
    issues.push({
      code: "failure_code_mismatch",
      message:
        "Provider execution reconciliation failure_code must match the trusted execution failure metadata derived from the source receipt."
    });
  }

  return {
    ok: issues.length === 0,
    issues
  };
}
