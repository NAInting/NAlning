import type { CurriculumAgentRole } from "./agent-specs";
import type {
  ProviderExecutionAttemptValidationResult,
  UnitReviewProviderExecutionAttempt,
} from "./provider-execution-attempt";
import {
  validateUnitReviewProviderExecutionAttempt,
  validateUnitReviewProviderExecutionAttemptSource,
} from "./provider-execution-attempt";
import type { UnitReviewProviderExecutionDecision } from "./provider-execution-decision";
import type {
  UnitReviewProviderExecutionRequest,
  UnitReviewProviderExecutionRequestAction,
} from "./provider-execution-request";
import type { UnitReviewArtifact } from "./review-runner";

export type UnitReviewProviderExecutionReceiptStatus =
  | "artifact_recorded"
  | "execution_failed";

export interface UnitReviewProviderExecutionReceipt {
  schema_version: "content-pipeline-review-provider-execution-receipt/v0.1";
  source_request_schema_version: UnitReviewProviderExecutionRequest["schema_version"];
  source_decision_schema_version: UnitReviewProviderExecutionDecision["schema_version"];
  source_attempt_schema_version: UnitReviewProviderExecutionAttempt["schema_version"];
  attempt_key: string;
  request_key: string;
  chain_key: string;
  unit_id: string;
  execution_action: UnitReviewProviderExecutionRequestAction;
  requested_start_role: CurriculumAgentRole;
  requested_roles: CurriculumAgentRole[];
  estimated_provider_call_count: number;
  review_mode: UnitReviewProviderExecutionRequest["review_mode"];
  output_contract: UnitReviewProviderExecutionRequest["output_contract"];
  execution_mode: UnitReviewProviderExecutionAttempt["execution_mode"];
  attempt_status_at_execution: UnitReviewProviderExecutionAttempt["attempt_status"];
  receipt_status: UnitReviewProviderExecutionReceiptStatus;
  executed_by: string;
  executed_at: string;
  actual_provider_call_count: number;
  result_artifact_schema_version: UnitReviewArtifact["schema_version"] | null;
  result_artifact_generated_at: string | null;
  result_artifact_status: UnitReviewArtifact["status"] | null;
  failure_code?: string;
  failure_summary?: string;
}

export interface RecordUnitReviewProviderExecutionReceiptOptions {
  receipt_status: UnitReviewProviderExecutionReceiptStatus;
  executed_by: string;
  executed_at?: string;
  actual_provider_call_count: number;
  result_artifact_generated_at?: string;
  result_artifact_status?: UnitReviewArtifact["status"];
  failure_code?: string;
  failure_summary?: string;
}

export interface ProviderExecutionReceiptSourceValidationIssue {
  code:
    | "source_attempt_contract_mismatch"
    | "attempt_not_authorized_pending_execution"
    | "provider_execution_not_allowed"
    | "execution_mode_mismatch";
  message: string;
}

export interface ProviderExecutionReceiptSourceValidationResult {
  ok: boolean;
  issues: ProviderExecutionReceiptSourceValidationIssue[];
}

export interface ProviderExecutionReceiptValidationIssue {
  code:
    | "source_contract_mismatch"
    | "invalid_schema_version"
    | "source_request_schema_version_mismatch"
    | "source_decision_schema_version_mismatch"
    | "source_attempt_schema_version_mismatch"
    | "attempt_key_mismatch"
    | "request_key_mismatch"
    | "chain_key_mismatch"
    | "unit_id_mismatch"
    | "execution_action_mismatch"
    | "requested_start_role_mismatch"
    | "requested_roles_mismatch"
    | "estimated_provider_call_count_mismatch"
    | "review_mode_mismatch"
    | "output_contract_mismatch"
    | "execution_mode_mismatch"
    | "attempt_status_at_execution_mismatch"
    | "invalid_receipt_status"
    | "missing_executed_by"
    | "invalid_executed_at"
    | "invalid_actual_provider_call_count"
    | "artifact_result_contract_mismatch"
    | "failure_result_contract_mismatch"
    | "result_artifact_schema_version_mismatch"
    | "invalid_result_artifact_generated_at"
    | "invalid_result_artifact_status"
    | "missing_failure_code";
  message: string;
}

export interface ProviderExecutionReceiptValidationResult {
  ok: boolean;
  issues: ProviderExecutionReceiptValidationIssue[];
}

export function validateUnitReviewProviderExecutionReceiptSource(
  request: UnitReviewProviderExecutionRequest,
  decision: UnitReviewProviderExecutionDecision,
  attempt: UnitReviewProviderExecutionAttempt
): ProviderExecutionReceiptSourceValidationResult {
  const issues: ProviderExecutionReceiptSourceValidationIssue[] = [];
  const attemptSourceValidation = validateUnitReviewProviderExecutionAttemptSource(request, decision);
  const attemptValidation = validateUnitReviewProviderExecutionAttempt(request, decision, attempt);

  if (!attemptSourceValidation.ok || !attemptValidation.ok) {
    const codes = [
      ...attemptSourceValidation.issues.map((issue) => issue.code),
      ...attemptValidation.issues.map((issue) => issue.code),
    ];
    issues.push({
      code: "source_attempt_contract_mismatch",
      message: `Provider execution receipt source attempt chain failed validation: ${codes.join(", ")}.`,
    });
  }

  if (attempt.attempt_status !== "authorized_pending_execution") {
    issues.push({
      code: "attempt_not_authorized_pending_execution",
      message:
        "Provider execution receipts require an attempt with status authorized_pending_execution.",
    });
  }

  if (attempt.provider_execution_allowed !== true) {
    issues.push({
      code: "provider_execution_not_allowed",
      message:
        "Provider execution receipts require provider_execution_allowed = true on the source attempt.",
    });
  }

  if (attempt.execution_mode !== "real_provider_review_rerun") {
    issues.push({
      code: "execution_mode_mismatch",
      message:
        "Provider execution receipts require execution_mode = real_provider_review_rerun on the source attempt.",
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

export function recordUnitReviewProviderExecutionReceipt(
  request: UnitReviewProviderExecutionRequest,
  decision: UnitReviewProviderExecutionDecision,
  attempt: UnitReviewProviderExecutionAttempt,
  options: RecordUnitReviewProviderExecutionReceiptOptions
): UnitReviewProviderExecutionReceipt {
  const sourceValidation = validateUnitReviewProviderExecutionReceiptSource(request, decision, attempt);
  if (!sourceValidation.ok) {
    throw new Error(
      `Provider execution receipt source is invalid: ${sourceValidation.issues.map((issue) => issue.code).join(", ")}.`
    );
  }

  if (!isNonEmptyString(options.executed_by)) {
    throw new Error("Provider execution receipt executed_by must be a non-empty string.");
  }

  if (!isNonNegativeInteger(options.actual_provider_call_count)) {
    throw new Error(
      "Provider execution receipt actual_provider_call_count must be a non-negative integer."
    );
  }

  const executedAt = options.executed_at ?? new Date().toISOString();

  if (options.receipt_status === "artifact_recorded") {
    if (!isNonEmptyString(options.result_artifact_generated_at)) {
      throw new Error(
        "Artifact-recorded provider execution receipts require result_artifact_generated_at."
      );
    }

    if (!isProviderExecutionArtifactStatus(options.result_artifact_status)) {
      throw new Error(
        "Artifact-recorded provider execution receipts require result_artifact_status = ready_for_human_review or blocked."
      );
    }
  } else {
    if (!isNonEmptyString(options.failure_code)) {
      throw new Error("Execution-failed provider execution receipts require failure_code.");
    }
  }

  const receipt: UnitReviewProviderExecutionReceipt = {
    schema_version: "content-pipeline-review-provider-execution-receipt/v0.1",
    source_request_schema_version: request.schema_version,
    source_decision_schema_version: decision.schema_version,
    source_attempt_schema_version: attempt.schema_version,
    attempt_key: attempt.attempt_key,
    request_key: request.request_key,
    chain_key: request.chain_key,
    unit_id: request.unit_id,
    execution_action: request.execution_action,
    requested_start_role: request.requested_start_role,
    requested_roles: request.requested_roles,
    estimated_provider_call_count: request.estimated_provider_call_count,
    review_mode: request.review_mode,
    output_contract: request.output_contract,
    execution_mode: attempt.execution_mode,
    attempt_status_at_execution: attempt.attempt_status,
    receipt_status: options.receipt_status,
    executed_by: options.executed_by.trim(),
    executed_at: executedAt,
    actual_provider_call_count: options.actual_provider_call_count,
    result_artifact_schema_version:
      options.receipt_status === "artifact_recorded"
        ? "content-pipeline-review-artifact/v0.1"
        : null,
    result_artifact_generated_at:
      options.receipt_status === "artifact_recorded"
        ? options.result_artifact_generated_at ?? null
        : null,
    result_artifact_status:
      options.receipt_status === "artifact_recorded"
        ? options.result_artifact_status ?? null
        : null,
  };

  if (options.receipt_status === "execution_failed") {
    const failureCode = options.failure_code?.trim();
    if (!failureCode) {
      throw new Error("Execution-failed provider execution receipts require failure_code.");
    }
    receipt.failure_code = failureCode;
    if (options.failure_summary) {
      receipt.failure_summary = options.failure_summary;
    }
  }

  return receipt;
}

export function validateUnitReviewProviderExecutionReceipt(
  request: UnitReviewProviderExecutionRequest,
  decision: UnitReviewProviderExecutionDecision,
  attempt: UnitReviewProviderExecutionAttempt,
  receipt: UnitReviewProviderExecutionReceipt
): ProviderExecutionReceiptValidationResult {
  const issues: ProviderExecutionReceiptValidationIssue[] = [];
  const sourceValidation = validateUnitReviewProviderExecutionReceiptSource(
    request,
    decision,
    attempt
  );

  if (!sourceValidation.ok) {
    issues.push({
      code: "source_contract_mismatch",
      message: `Provider execution receipt source failed validation: ${sourceValidation.issues.map((issue) => issue.code).join(", ")}.`,
    });
  }

  if (receipt.schema_version !== "content-pipeline-review-provider-execution-receipt/v0.1") {
    issues.push({
      code: "invalid_schema_version",
      message:
        "Provider execution receipt schema_version must be content-pipeline-review-provider-execution-receipt/v0.1.",
    });
  }

  if (issues.length > 0) {
    return {
      ok: false,
      issues,
    };
  }

  if (receipt.source_request_schema_version !== request.schema_version) {
    issues.push({
      code: "source_request_schema_version_mismatch",
      message:
        "Provider execution receipt source_request_schema_version must match the source request schema_version.",
    });
  }

  if (receipt.source_decision_schema_version !== decision.schema_version) {
    issues.push({
      code: "source_decision_schema_version_mismatch",
      message:
        "Provider execution receipt source_decision_schema_version must match the source decision schema_version.",
    });
  }

  if (receipt.source_attempt_schema_version !== attempt.schema_version) {
    issues.push({
      code: "source_attempt_schema_version_mismatch",
      message:
        "Provider execution receipt source_attempt_schema_version must match the source attempt schema_version.",
    });
  }

  if (receipt.attempt_key !== attempt.attempt_key) {
    issues.push({
      code: "attempt_key_mismatch",
      message: "Provider execution receipt attempt_key must match the source attempt attempt_key.",
    });
  }

  if (receipt.request_key !== request.request_key) {
    issues.push({
      code: "request_key_mismatch",
      message: "Provider execution receipt request_key must match the source request request_key.",
    });
  }

  if (receipt.chain_key !== request.chain_key) {
    issues.push({
      code: "chain_key_mismatch",
      message: "Provider execution receipt chain_key must match the source request chain_key.",
    });
  }

  if (receipt.unit_id !== request.unit_id) {
    issues.push({
      code: "unit_id_mismatch",
      message: "Provider execution receipt unit_id must match the source request unit_id.",
    });
  }

  if (receipt.execution_action !== request.execution_action) {
    issues.push({
      code: "execution_action_mismatch",
      message:
        "Provider execution receipt execution_action must match the source request execution_action.",
    });
  }

  if (receipt.requested_start_role !== request.requested_start_role) {
    issues.push({
      code: "requested_start_role_mismatch",
      message:
        "Provider execution receipt requested_start_role must match the source request requested_start_role.",
    });
  }

  if (!rolesEqual(receipt.requested_roles, request.requested_roles)) {
    issues.push({
      code: "requested_roles_mismatch",
      message:
        "Provider execution receipt requested_roles must match the source request requested_roles.",
    });
  }

  if (receipt.estimated_provider_call_count !== request.estimated_provider_call_count) {
    issues.push({
      code: "estimated_provider_call_count_mismatch",
      message:
        "Provider execution receipt estimated_provider_call_count must match the source request estimate.",
    });
  }

  if (receipt.review_mode !== request.review_mode) {
    issues.push({
      code: "review_mode_mismatch",
      message:
        "Provider execution receipt review_mode must match the source request review_mode.",
    });
  }

  if (receipt.output_contract !== request.output_contract) {
    issues.push({
      code: "output_contract_mismatch",
      message:
        "Provider execution receipt output_contract must match the source request output_contract.",
    });
  }

  if (receipt.execution_mode !== attempt.execution_mode) {
    issues.push({
      code: "execution_mode_mismatch",
      message:
        "Provider execution receipt execution_mode must match the source attempt execution_mode.",
    });
  }

  if (receipt.attempt_status_at_execution !== attempt.attempt_status) {
    issues.push({
      code: "attempt_status_at_execution_mismatch",
      message:
        "Provider execution receipt attempt_status_at_execution must match the source attempt status.",
    });
  }

  if (!isReceiptStatus(receipt.receipt_status)) {
    issues.push({
      code: "invalid_receipt_status",
      message:
        "Provider execution receipt receipt_status must be artifact_recorded or execution_failed.",
    });
  }

  if (!isNonEmptyString(receipt.executed_by)) {
    issues.push({
      code: "missing_executed_by",
      message: "Provider execution receipt executed_by must be a non-empty string.",
    });
  }

  if (!isNonEmptyString(receipt.executed_at) || Number.isNaN(Date.parse(receipt.executed_at))) {
    issues.push({
      code: "invalid_executed_at",
      message:
        "Provider execution receipt executed_at must be an ISO-parseable timestamp.",
    });
  }

  if (!isNonNegativeInteger(receipt.actual_provider_call_count)) {
    issues.push({
      code: "invalid_actual_provider_call_count",
      message:
        "Provider execution receipt actual_provider_call_count must be a non-negative integer.",
    });
  }

  if (receipt.receipt_status === "artifact_recorded") {
    if (
      receipt.failure_code !== undefined ||
      receipt.failure_summary !== undefined
    ) {
      issues.push({
        code: "artifact_result_contract_mismatch",
        message:
          "Artifact-recorded provider execution receipts must not include failure fields.",
      });
    }

    if (
      receipt.result_artifact_schema_version !== "content-pipeline-review-artifact/v0.1"
    ) {
      issues.push({
        code: "result_artifact_schema_version_mismatch",
        message:
          "Artifact-recorded provider execution receipts must set result_artifact_schema_version to content-pipeline-review-artifact/v0.1.",
      });
    }

    if (
      !isNonEmptyString(receipt.result_artifact_generated_at) ||
      Number.isNaN(Date.parse(receipt.result_artifact_generated_at))
    ) {
      issues.push({
        code: "invalid_result_artifact_generated_at",
        message:
          "Artifact-recorded provider execution receipts require an ISO-parseable result_artifact_generated_at.",
      });
    }

    if (!isProviderExecutionArtifactStatus(receipt.result_artifact_status)) {
      issues.push({
        code: "invalid_result_artifact_status",
        message:
          "Artifact-recorded provider execution receipts require result_artifact_status = ready_for_human_review or blocked.",
      });
    }
  }

  if (receipt.receipt_status === "execution_failed") {
    if (
      receipt.result_artifact_schema_version !== null ||
      receipt.result_artifact_generated_at !== null ||
      receipt.result_artifact_status !== null
    ) {
      issues.push({
        code: "failure_result_contract_mismatch",
        message:
          "Execution-failed provider execution receipts must not include result artifact fields.",
      });
    }

    if (!isNonEmptyString(receipt.failure_code)) {
      issues.push({
        code: "missing_failure_code",
        message:
          "Execution-failed provider execution receipts require a non-empty failure_code.",
      });
    }
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

function rolesEqual(left: readonly CurriculumAgentRole[], right: readonly CurriculumAgentRole[]): boolean {
  return left.length === right.length && left.every((role, index) => role === right[index]);
}

function isReceiptStatus(value: unknown): value is UnitReviewProviderExecutionReceiptStatus {
  return value === "artifact_recorded" || value === "execution_failed";
}

function isProviderExecutionArtifactStatus(
  value: unknown
): value is Extract<UnitReviewArtifact["status"], "ready_for_human_review" | "blocked"> {
  return value === "ready_for_human_review" || value === "blocked";
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}
