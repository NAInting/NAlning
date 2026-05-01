import type { CurriculumAgentRole } from "./agent-specs";
import type { UnitReviewProviderExecutionDecision } from "./provider-execution-decision";
import {
  validateUnitReviewProviderExecutionDecision,
  validateUnitReviewProviderExecutionDecisionSource,
} from "./provider-execution-decision";
import type {
  UnitReviewProviderExecutionRequest,
  UnitReviewProviderExecutionRequestAction,
} from "./provider-execution-request";

export type UnitReviewProviderExecutionAttemptStatus = "authorized_pending_execution";

export interface UnitReviewProviderExecutionAttempt {
  schema_version: "content-pipeline-review-provider-execution-attempt/v0.1";
  source_request_schema_version: UnitReviewProviderExecutionRequest["schema_version"];
  source_decision_schema_version: UnitReviewProviderExecutionDecision["schema_version"];
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
  execution_mode: "real_provider_review_rerun";
  attempt_status: UnitReviewProviderExecutionAttemptStatus;
  provider_execution_allowed: true;
  execution_command: UnitReviewProviderExecutionRequest["execution_command"];
  approved_by: string;
  approved_at: string;
  budget_check_status: "passed";
  approval_notes?: string;
  budget_reference?: string;
  recorded_by: string;
  recorded_at: string;
  attempt_notes?: string;
}

export interface RecordUnitReviewProviderExecutionAttemptOptions {
  recorded_by: string;
  recorded_at?: string;
  attempt_notes?: string;
}

export interface ProviderExecutionAttemptSourceValidationIssue {
  code:
    | "source_request_contract_mismatch"
    | "source_decision_contract_mismatch"
    | "review_mode_mismatch"
    | "output_contract_mismatch"
    | "decision_not_approved"
    | "execution_permission_not_granted"
    | "budget_check_not_passed";
  message: string;
}

export interface ProviderExecutionAttemptSourceValidationResult {
  ok: boolean;
  issues: ProviderExecutionAttemptSourceValidationIssue[];
}

export interface ProviderExecutionAttemptValidationIssue {
  code:
    | "source_contract_mismatch"
    | "invalid_schema_version"
    | "source_request_schema_version_mismatch"
    | "source_decision_schema_version_mismatch"
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
    | "attempt_status_mismatch"
    | "provider_execution_allowed_mismatch"
    | "execution_command_mismatch"
    | "approved_by_mismatch"
    | "approved_at_mismatch"
    | "budget_check_status_mismatch"
    | "approval_notes_mismatch"
    | "budget_reference_mismatch"
    | "missing_recorded_by"
    | "invalid_recorded_at";
  message: string;
}

export interface ProviderExecutionAttemptValidationResult {
  ok: boolean;
  issues: ProviderExecutionAttemptValidationIssue[];
}

export function validateUnitReviewProviderExecutionAttemptSource(
  request: UnitReviewProviderExecutionRequest,
  decision: UnitReviewProviderExecutionDecision
): ProviderExecutionAttemptSourceValidationResult {
  const issues: ProviderExecutionAttemptSourceValidationIssue[] = [];
  const requestValidation = validateUnitReviewProviderExecutionDecisionSource(request);
  const decisionValidation = validateUnitReviewProviderExecutionDecision(request, decision);

  if (!requestValidation.ok) {
    issues.push({
      code: "source_request_contract_mismatch",
      message:
        `Provider execution attempt source request failed validation: ${requestValidation.issues.map((issue) => issue.code).join(", ")}.`,
    });
  }

  if (!decisionValidation.ok) {
    issues.push({
      code: "source_decision_contract_mismatch",
      message:
        `Provider execution attempt source decision failed validation: ${decisionValidation.issues.map((issue) => issue.code).join(", ")}.`,
    });
  }

  if (request.review_mode !== "llm_review_no_writeback") {
    issues.push({
      code: "review_mode_mismatch",
      message:
        "Provider execution attempts only support review_mode llm_review_no_writeback.",
    });
  }

  if (request.output_contract !== "review_artifact_only") {
    issues.push({
      code: "output_contract_mismatch",
      message:
        "Provider execution attempts only support output_contract review_artifact_only.",
    });
  }

  if (decision.decision_status !== "approved") {
    issues.push({
      code: "decision_not_approved",
      message:
        "Provider execution attempts can only be recorded from approved provider execution decisions.",
    });
  }

  if (decision.execution_permission !== "granted") {
    issues.push({
      code: "execution_permission_not_granted",
      message:
        "Provider execution attempts require execution_permission = granted on the source decision.",
    });
  }

  if (decision.budget_check_status !== "passed") {
    issues.push({
      code: "budget_check_not_passed",
      message:
        "Provider execution attempts require budget_check_status = passed on the source decision.",
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

export function recordUnitReviewProviderExecutionAttempt(
  request: UnitReviewProviderExecutionRequest,
  decision: UnitReviewProviderExecutionDecision,
  options: RecordUnitReviewProviderExecutionAttemptOptions
): UnitReviewProviderExecutionAttempt {
  const sourceValidation = validateUnitReviewProviderExecutionAttemptSource(request, decision);
  if (!sourceValidation.ok) {
    throw new Error(
      `Provider execution attempt source is invalid: ${sourceValidation.issues.map((issue) => issue.code).join(", ")}.`
    );
  }

  if (!isNonEmptyString(options.recorded_by)) {
    throw new Error("Provider execution attempt recorded_by must be a non-empty string.");
  }

  const recordedAt = options.recorded_at ?? new Date().toISOString();
  const attempt: UnitReviewProviderExecutionAttempt = {
    schema_version: "content-pipeline-review-provider-execution-attempt/v0.1",
    source_request_schema_version: request.schema_version,
    source_decision_schema_version: decision.schema_version,
    attempt_key: buildProviderExecutionAttemptKey(
      request.unit_id,
      request.execution_action,
      recordedAt
    ),
    request_key: request.request_key,
    chain_key: request.chain_key,
    unit_id: request.unit_id,
    execution_action: request.execution_action,
    requested_start_role: request.requested_start_role,
    requested_roles: request.requested_roles,
    estimated_provider_call_count: request.estimated_provider_call_count,
    review_mode: request.review_mode,
    output_contract: request.output_contract,
    execution_mode: "real_provider_review_rerun",
    attempt_status: "authorized_pending_execution",
    provider_execution_allowed: true,
    execution_command: request.execution_command,
    approved_by: decision.reviewer_id,
    approved_at: decision.reviewed_at,
    budget_check_status: "passed",
    recorded_by: options.recorded_by.trim(),
    recorded_at: recordedAt,
  };

  if (decision.notes) {
    attempt.approval_notes = decision.notes;
  }

  if (decision.budget_reference) {
    attempt.budget_reference = decision.budget_reference;
  }

  if (options.attempt_notes) {
    attempt.attempt_notes = options.attempt_notes;
  }

  return attempt;
}

export function validateUnitReviewProviderExecutionAttempt(
  request: UnitReviewProviderExecutionRequest,
  decision: UnitReviewProviderExecutionDecision,
  attempt: UnitReviewProviderExecutionAttempt
): ProviderExecutionAttemptValidationResult {
  const issues: ProviderExecutionAttemptValidationIssue[] = [];
  const sourceValidation = validateUnitReviewProviderExecutionAttemptSource(request, decision);

  if (!sourceValidation.ok) {
    issues.push({
      code: "source_contract_mismatch",
      message:
        `Provider execution attempt source failed validation: ${sourceValidation.issues.map((issue) => issue.code).join(", ")}.`,
    });
  }

  if (attempt.schema_version !== "content-pipeline-review-provider-execution-attempt/v0.1") {
    issues.push({
      code: "invalid_schema_version",
      message:
        "Provider execution attempt schema_version must be content-pipeline-review-provider-execution-attempt/v0.1.",
    });
  }

  if (issues.length > 0) {
    return {
      ok: false,
      issues,
    };
  }

  if (attempt.source_request_schema_version !== request.schema_version) {
    issues.push({
      code: "source_request_schema_version_mismatch",
      message:
        "Provider execution attempt source_request_schema_version must match the source request schema_version.",
    });
  }

  if (attempt.source_decision_schema_version !== decision.schema_version) {
    issues.push({
      code: "source_decision_schema_version_mismatch",
      message:
        "Provider execution attempt source_decision_schema_version must match the source decision schema_version.",
    });
  }

  if (attempt.attempt_key !== buildProviderExecutionAttemptKey(request.unit_id, request.execution_action, attempt.recorded_at)) {
    issues.push({
      code: "attempt_key_mismatch",
      message:
        "Provider execution attempt attempt_key must match the derived attempt key for unit_id, execution_action, and recorded_at.",
    });
  }

  if (attempt.request_key !== request.request_key) {
    issues.push({
      code: "request_key_mismatch",
      message: "Provider execution attempt request_key must match the source request request_key.",
    });
  }

  if (attempt.chain_key !== request.chain_key) {
    issues.push({
      code: "chain_key_mismatch",
      message: "Provider execution attempt chain_key must match the source request chain_key.",
    });
  }

  if (attempt.unit_id !== request.unit_id) {
    issues.push({
      code: "unit_id_mismatch",
      message: "Provider execution attempt unit_id must match the source request unit_id.",
    });
  }

  if (attempt.execution_action !== request.execution_action) {
    issues.push({
      code: "execution_action_mismatch",
      message:
        "Provider execution attempt execution_action must match the source request execution_action.",
    });
  }

  if (attempt.requested_start_role !== request.requested_start_role) {
    issues.push({
      code: "requested_start_role_mismatch",
      message:
        "Provider execution attempt requested_start_role must match the source request requested_start_role.",
    });
  }

  if (!rolesEqual(attempt.requested_roles, request.requested_roles)) {
    issues.push({
      code: "requested_roles_mismatch",
      message:
        "Provider execution attempt requested_roles must match the source request requested_roles.",
    });
  }

  if (attempt.estimated_provider_call_count !== request.estimated_provider_call_count) {
    issues.push({
      code: "estimated_provider_call_count_mismatch",
      message:
        "Provider execution attempt estimated_provider_call_count must match the source request estimate.",
    });
  }

  if (attempt.review_mode !== request.review_mode) {
    issues.push({
      code: "review_mode_mismatch",
      message:
        "Provider execution attempt review_mode must match the source request review_mode.",
    });
  }

  if (attempt.output_contract !== request.output_contract) {
    issues.push({
      code: "output_contract_mismatch",
      message:
        "Provider execution attempt output_contract must match the source request output_contract.",
    });
  }

  if (attempt.execution_mode !== "real_provider_review_rerun") {
    issues.push({
      code: "execution_mode_mismatch",
      message:
        "Provider execution attempt execution_mode must remain real_provider_review_rerun.",
    });
  }

  if (attempt.attempt_status !== "authorized_pending_execution") {
    issues.push({
      code: "attempt_status_mismatch",
      message:
        "Provider execution attempt attempt_status must remain authorized_pending_execution.",
    });
  }

  if (attempt.provider_execution_allowed !== true) {
    issues.push({
      code: "provider_execution_allowed_mismatch",
      message:
        "Provider execution attempt provider_execution_allowed must remain true for an approved pending execution.",
    });
  }

  if (
    attempt.execution_command.command !== request.execution_command.command ||
    attempt.execution_command.from_artifact_generated_at !== request.execution_command.from_artifact_generated_at ||
    attempt.execution_command.rerun_from !== request.execution_command.rerun_from
  ) {
    issues.push({
      code: "execution_command_mismatch",
      message:
        "Provider execution attempt execution_command must match the source request execution command.",
    });
  }

  if (attempt.approved_by !== decision.reviewer_id) {
    issues.push({
      code: "approved_by_mismatch",
      message:
        "Provider execution attempt approved_by must match the approving reviewer_id from the source decision.",
    });
  }

  if (attempt.approved_at !== decision.reviewed_at) {
    issues.push({
      code: "approved_at_mismatch",
      message:
        "Provider execution attempt approved_at must match the source decision reviewed_at timestamp.",
    });
  }

  if (attempt.budget_check_status !== "passed") {
    issues.push({
      code: "budget_check_status_mismatch",
      message:
        "Provider execution attempt budget_check_status must remain passed.",
    });
  }

  if ((attempt.approval_notes ?? undefined) !== (decision.notes ?? undefined)) {
    issues.push({
      code: "approval_notes_mismatch",
      message:
        "Provider execution attempt approval_notes must match the source decision notes when present.",
    });
  }

  if ((attempt.budget_reference ?? undefined) !== (decision.budget_reference ?? undefined)) {
    issues.push({
      code: "budget_reference_mismatch",
      message:
        "Provider execution attempt budget_reference must match the source decision budget_reference when present.",
    });
  }

  if (!isNonEmptyString(attempt.recorded_by)) {
    issues.push({
      code: "missing_recorded_by",
      message:
        "Provider execution attempt recorded_by must be a non-empty string.",
    });
  }

  if (!isNonEmptyString(attempt.recorded_at) || Number.isNaN(Date.parse(attempt.recorded_at))) {
    issues.push({
      code: "invalid_recorded_at",
      message:
        "Provider execution attempt recorded_at must be an ISO-parseable timestamp.",
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

function rolesEqual(left: readonly CurriculumAgentRole[], right: readonly CurriculumAgentRole[]): boolean {
  return left.length === right.length && left.every((role, index) => role === right[index]);
}

function buildProviderExecutionAttemptKey(
  unitId: string,
  executionAction: UnitReviewProviderExecutionRequestAction,
  recordedAt: string
): string {
  return `content-pipeline:provider-execution-attempt:${executionAction}:${unitId}:${recordedAt}`;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
