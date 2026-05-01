import type { CurriculumAgentRole } from "./agent-specs";
import type {
  UnitReviewProviderExecutionRequest,
  UnitReviewProviderExecutionRequestAction
} from "./provider-execution-request";
import { curriculumAgentOrder } from "./workflow";

export type UnitReviewProviderExecutionDecisionStatus = "approved" | "rejected";
export type UnitReviewProviderExecutionBudgetCheckStatus = "passed" | "failed";
export type UnitReviewProviderExecutionPermission = "granted" | "denied";

export interface UnitReviewProviderExecutionDecision {
  schema_version: "content-pipeline-review-provider-execution-decision/v0.1";
  source_request_schema_version: UnitReviewProviderExecutionRequest["schema_version"];
  request_key: string;
  chain_key: string;
  unit_id: string;
  execution_action: UnitReviewProviderExecutionRequestAction;
  requested_start_role: CurriculumAgentRole;
  requested_roles: CurriculumAgentRole[];
  estimated_provider_call_count: number;
  human_queue: UnitReviewProviderExecutionRequest["human_queue"];
  primary_human_action: UnitReviewProviderExecutionRequest["primary_human_action"];
  decision_status: UnitReviewProviderExecutionDecisionStatus;
  execution_permission: UnitReviewProviderExecutionPermission;
  reviewer_id: string;
  reviewed_at: string;
  budget_check_status: UnitReviewProviderExecutionBudgetCheckStatus;
  notes?: string;
  budget_reference?: string;
}

export interface RecordUnitReviewProviderExecutionDecisionOptions {
  reviewer_id: string;
  decision: UnitReviewProviderExecutionDecisionStatus;
  budget_check_status: UnitReviewProviderExecutionBudgetCheckStatus;
  reviewed_at?: string;
  notes?: string;
  budget_reference?: string;
}

export interface ProviderExecutionDecisionSourceValidationIssue {
  code:
    | "invalid_request_schema_version"
    | "source_artifact_schema_version_mismatch"
    | "source_artifact_status_mismatch"
    | "invalid_execution_action"
    | "invalid_requested_start_role"
    | "request_key_mismatch"
    | "chain_key_mismatch"
    | "requested_roles_mismatch"
    | "estimated_provider_call_count_mismatch"
    | "review_mode_mismatch"
    | "output_contract_mismatch"
    | "reason_mismatch"
    | "source_retry_decision_mismatch"
    | "source_recommended_rerun_from_mismatch"
    | "human_queue_mismatch"
    | "primary_human_action_mismatch"
    | "inbox_title_mismatch"
    | "inbox_summary_mismatch"
    | "execution_command_mismatch"
    | "gating_requirements_mismatch"
    | "decision_boundary_mismatch";
  message: string;
}

export interface ProviderExecutionDecisionSourceValidationResult {
  ok: boolean;
  issues: ProviderExecutionDecisionSourceValidationIssue[];
}

export interface ProviderExecutionDecisionValidationIssue {
  code:
    | "source_request_contract_mismatch"
    | "invalid_schema_version"
    | "source_request_schema_version_mismatch"
    | "request_key_mismatch"
    | "chain_key_mismatch"
    | "unit_id_mismatch"
    | "execution_action_mismatch"
    | "requested_start_role_mismatch"
    | "requested_roles_mismatch"
    | "estimated_provider_call_count_mismatch"
    | "human_queue_mismatch"
    | "primary_human_action_mismatch"
    | "invalid_decision_status"
    | "invalid_execution_permission"
    | "execution_permission_mismatch"
    | "missing_reviewer_id"
    | "invalid_reviewed_at"
    | "invalid_budget_check_status"
    | "approval_requires_budget_pass";
  message: string;
}

export interface ProviderExecutionDecisionValidationResult {
  ok: boolean;
  issues: ProviderExecutionDecisionValidationIssue[];
}

export function validateUnitReviewProviderExecutionDecisionSource(
  request: UnitReviewProviderExecutionRequest
): ProviderExecutionDecisionSourceValidationResult {
  const issues: ProviderExecutionDecisionSourceValidationIssue[] = [];

  if (request.schema_version !== "content-pipeline-review-provider-execution-request/v0.1") {
    issues.push({
      code: "invalid_request_schema_version",
      message:
        "Provider execution decision source request must use schema_version content-pipeline-review-provider-execution-request/v0.1."
    });
  }

  if (request.source_artifact_schema_version !== "content-pipeline-review-artifact/v0.1") {
    issues.push({
      code: "source_artifact_schema_version_mismatch",
      message:
        "Provider execution decision source request source_artifact_schema_version must remain content-pipeline-review-artifact/v0.1."
    });
  }

  if (request.source_artifact_status !== "blocked") {
    issues.push({
      code: "source_artifact_status_mismatch",
      message: "Provider execution decisions can only be recorded against blocked source artifacts."
    });
  }

  if (!isProviderExecutionAction(request.execution_action)) {
    issues.push({
      code: "invalid_execution_action",
      message:
        "Provider execution decision source request must use execution_action run_scoped_review_rerun or run_widened_review_rerun."
    });
  }

  if (!isCurriculumAgentRole(request.requested_start_role)) {
    issues.push({
      code: "invalid_requested_start_role",
      message:
        "Provider execution decision source request requested_start_role must be a known curriculum workflow role."
    });
  }

  const expectedRequestedRoles = isCurriculumAgentRole(request.requested_start_role)
    ? deriveExpectedRequestedRoles(request.requested_start_role)
    : null;
  if (
    request.request_key
    !== buildProviderExecutionRequestKey(
      request.unit_id,
      request.execution_action,
      request.source_artifact_generated_at
    )
  ) {
    issues.push({
      code: "request_key_mismatch",
      message:
        "Provider execution decision source request request_key must match the derived provider execution request key."
    });
  }

  if (
    request.chain_key
    !== buildProviderExecutionChainKey(request.unit_id, request.rerun_root_artifact_generated_at)
  ) {
    issues.push({
      code: "chain_key_mismatch",
      message:
        "Provider execution decision source request chain_key must match the derived rerun lineage key."
    });
  }

  if (!expectedRequestedRoles || !rolesEqual(request.requested_roles, expectedRequestedRoles)) {
    issues.push({
      code: "requested_roles_mismatch",
      message:
        "Provider execution decision source request requested_roles must match the contiguous tail slice from requested_start_role."
    });
  }

  if (request.estimated_provider_call_count !== request.requested_roles.length) {
    issues.push({
      code: "estimated_provider_call_count_mismatch",
      message:
        "Provider execution decision source request estimated_provider_call_count must equal requested_roles.length."
    });
  }

  if (request.review_mode !== "llm_review_no_writeback") {
    issues.push({
      code: "review_mode_mismatch",
      message:
        "Provider execution decision source request review_mode must remain llm_review_no_writeback."
    });
  }

  if (request.output_contract !== "review_artifact_only") {
    issues.push({
      code: "output_contract_mismatch",
      message:
        "Provider execution decision source request output_contract must remain review_artifact_only."
    });
  }

  const expectedRetryDecision =
    request.execution_action === "run_widened_review_rerun" ? "widen_rerun_scope" : "allow_scoped_rerun";
  const expectedReason =
    request.execution_action === "run_widened_review_rerun"
      ? "The next retry should restart from an earlier owner scope, and that widened review-only rerun still requires an explicit decision before provider execution."
      : "A review-only scoped rerun is structurally allowed, but it still requires an explicit decision before spending provider execution.";
  if (request.reason !== expectedReason) {
    issues.push({
      code: "reason_mismatch",
      message:
        "Provider execution decision source request reason must match the expected rerun orchestration message."
    });
  }

  if (request.source_retry_decision !== expectedRetryDecision) {
    issues.push({
      code: "source_retry_decision_mismatch",
      message:
        "Provider execution decision source request source_retry_decision must match the requested rerun action."
    });
  }

  if (request.source_recommended_rerun_from !== request.requested_start_role) {
    issues.push({
      code: "source_recommended_rerun_from_mismatch",
      message:
        "Provider execution decision source request source_recommended_rerun_from must match requested_start_role."
    });
  }

  if (request.human_queue !== "rerun_decision_queue") {
    issues.push({
      code: "human_queue_mismatch",
      message: "Provider execution decision source request human_queue must remain rerun_decision_queue."
    });
  }

  const expectedPrimaryHumanAction =
    request.execution_action === "run_widened_review_rerun" ? "decide_widened_rerun" : "decide_scoped_rerun";
  if (request.primary_human_action !== expectedPrimaryHumanAction) {
    issues.push({
      code: "primary_human_action_mismatch",
      message:
        "Provider execution decision source request primary_human_action must match the requested rerun action."
    });
  }

  const expectedInboxTitle =
    request.execution_action === "run_widened_review_rerun"
      ? `[Widened Rerun Decision] ${request.unit_id}`
      : `[Rerun Decision] ${request.unit_id}`;
  if (request.inbox_title !== expectedInboxTitle) {
    issues.push({
      code: "inbox_title_mismatch",
      message:
        "Provider execution decision source request inbox_title must match the expected rerun decision title."
    });
  }

  const expectedInboxSummary =
    request.execution_action === "run_widened_review_rerun"
      ? `Blocked artifact now points to an earlier owner and should widen rerun scope from ${request.requested_start_role}, pending explicit human/provider-budget approval.`
      : `Blocked artifact can attempt a review-only scoped rerun from ${request.requested_start_role}, but provider execution still requires an explicit human decision.`;
  if (request.inbox_summary !== expectedInboxSummary) {
    issues.push({
      code: "inbox_summary_mismatch",
      message:
        "Provider execution decision source request inbox_summary must match the expected rerun decision summary."
    });
  }

  if (
    request.execution_command.command !== "run-llm-review"
    || request.execution_command.from_artifact_generated_at !== request.source_artifact_generated_at
    || request.execution_command.rerun_from !== request.requested_start_role
  ) {
    issues.push({
      code: "execution_command_mismatch",
      message:
        "Provider execution decision source request execution_command must remain aligned with the blocked artifact timestamp and requested rerun start."
    });
  }

  if (
    request.gating_requirements.requires_explicit_human_approval !== true
    || request.gating_requirements.requires_budget_policy_check !== true
    || request.gating_requirements.requires_real_provider_credentials !== true
  ) {
    issues.push({
      code: "gating_requirements_mismatch",
      message:
        "Provider execution decision source request gating_requirements must preserve explicit approval, budget, and provider-credential gates."
    });
  }

  if (
    request.decision_boundary.requires_provider_execution !== true
    || request.decision_boundary.requires_human_decision !== true
    || request.decision_boundary.provider_execution_allowed_without_human !== false
  ) {
    issues.push({
      code: "decision_boundary_mismatch",
      message:
        "Provider execution decision source request decision_boundary must preserve the human-gated provider execution boundary."
    });
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

export function recordUnitReviewProviderExecutionDecision(
  request: UnitReviewProviderExecutionRequest,
  options: RecordUnitReviewProviderExecutionDecisionOptions
): UnitReviewProviderExecutionDecision {
  const sourceValidation = validateUnitReviewProviderExecutionDecisionSource(request);
  if (!sourceValidation.ok) {
    throw new Error(
      `Provider execution decision source request is invalid: ${sourceValidation.issues.map((issue) => issue.code).join(", ")}.`
    );
  }

  if (options.decision === "approved" && options.budget_check_status !== "passed") {
    throw new Error("Approved provider execution decisions require budget_check_status = passed.");
  }

  if (!isNonEmptyString(options.reviewer_id)) {
    throw new Error("Provider execution decision reviewer_id must be a non-empty string.");
  }

  const executionPermission = deriveExecutionPermission(options.decision, options.budget_check_status);
  const decision: UnitReviewProviderExecutionDecision = {
    schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
    source_request_schema_version: request.schema_version,
    request_key: request.request_key,
    chain_key: request.chain_key,
    unit_id: request.unit_id,
    execution_action: request.execution_action,
    requested_start_role: request.requested_start_role,
    requested_roles: request.requested_roles,
    estimated_provider_call_count: request.estimated_provider_call_count,
    human_queue: request.human_queue,
    primary_human_action: request.primary_human_action,
    decision_status: options.decision,
    execution_permission: executionPermission,
    reviewer_id: options.reviewer_id.trim(),
    reviewed_at: options.reviewed_at ?? new Date().toISOString(),
    budget_check_status: options.budget_check_status
  };

  if (options.notes) {
    decision.notes = options.notes;
  }

  if (options.budget_reference) {
    decision.budget_reference = options.budget_reference;
  }

  return decision;
}

export function validateUnitReviewProviderExecutionDecision(
  request: UnitReviewProviderExecutionRequest,
  decision: UnitReviewProviderExecutionDecision
): ProviderExecutionDecisionValidationResult {
  const issues: ProviderExecutionDecisionValidationIssue[] = [];
  const sourceValidation = validateUnitReviewProviderExecutionDecisionSource(request);

  if (!sourceValidation.ok) {
    issues.push({
      code: "source_request_contract_mismatch",
      message:
        `Provider execution decision source request failed validation: ${sourceValidation.issues.map((issue) => issue.code).join(", ")}.`
    });
  }

  if (decision.schema_version !== "content-pipeline-review-provider-execution-decision/v0.1") {
    issues.push({
      code: "invalid_schema_version",
      message:
        "Provider execution decision schema_version must be content-pipeline-review-provider-execution-decision/v0.1."
    });
  }

  if (issues.length > 0) {
    return {
      ok: false,
      issues
    };
  }

  if (decision.source_request_schema_version !== request.schema_version) {
    issues.push({
      code: "source_request_schema_version_mismatch",
      message:
        "Provider execution decision source_request_schema_version must match the source provider execution request schema_version."
    });
  }

  if (decision.request_key !== request.request_key) {
    issues.push({
      code: "request_key_mismatch",
      message: "Provider execution decision request_key must match the source provider execution request request_key."
    });
  }

  if (decision.chain_key !== request.chain_key) {
    issues.push({
      code: "chain_key_mismatch",
      message: "Provider execution decision chain_key must match the source provider execution request chain_key."
    });
  }

  if (decision.unit_id !== request.unit_id) {
    issues.push({
      code: "unit_id_mismatch",
      message: "Provider execution decision unit_id must match the source provider execution request unit_id."
    });
  }

  if (decision.execution_action !== request.execution_action) {
    issues.push({
      code: "execution_action_mismatch",
      message:
        "Provider execution decision execution_action must match the source provider execution request execution_action."
    });
  }

  if (decision.requested_start_role !== request.requested_start_role) {
    issues.push({
      code: "requested_start_role_mismatch",
      message:
        "Provider execution decision requested_start_role must match the source provider execution request requested_start_role."
    });
  }

  if (!rolesEqual(decision.requested_roles, request.requested_roles)) {
    issues.push({
      code: "requested_roles_mismatch",
      message:
        "Provider execution decision requested_roles must match the source provider execution request requested_roles."
    });
  }

  if (decision.estimated_provider_call_count !== request.estimated_provider_call_count) {
    issues.push({
      code: "estimated_provider_call_count_mismatch",
      message:
        "Provider execution decision estimated_provider_call_count must match the source provider execution request estimated_provider_call_count."
    });
  }

  if (decision.human_queue !== request.human_queue) {
    issues.push({
      code: "human_queue_mismatch",
      message:
        "Provider execution decision human_queue must match the source provider execution request human_queue."
    });
  }

  if (decision.primary_human_action !== request.primary_human_action) {
    issues.push({
      code: "primary_human_action_mismatch",
      message:
        "Provider execution decision primary_human_action must match the source provider execution request primary_human_action."
    });
  }

  if (!isDecisionStatus(decision.decision_status)) {
    issues.push({
      code: "invalid_decision_status",
      message: "Provider execution decision decision_status must be approved or rejected."
    });
  }

  if (!isExecutionPermission(decision.execution_permission)) {
    issues.push({
      code: "invalid_execution_permission",
      message: "Provider execution decision execution_permission must be granted or denied."
    });
  }

  if (!isNonEmptyString(decision.reviewer_id)) {
    issues.push({
      code: "missing_reviewer_id",
      message: "Provider execution decision reviewer_id must be a non-empty string."
    });
  }

  if (!isNonEmptyString(decision.reviewed_at) || Number.isNaN(Date.parse(decision.reviewed_at))) {
    issues.push({
      code: "invalid_reviewed_at",
      message: "Provider execution decision reviewed_at must be an ISO-parseable timestamp."
    });
  }

  if (!isBudgetCheckStatus(decision.budget_check_status)) {
    issues.push({
      code: "invalid_budget_check_status",
      message: "Provider execution decision budget_check_status must be passed or failed."
    });
  }

  if (decision.decision_status === "approved" && decision.budget_check_status !== "passed") {
    issues.push({
      code: "approval_requires_budget_pass",
      message: "Approved provider execution decisions require budget_check_status = passed."
    });
  }

  const expectedExecutionPermission = deriveExecutionPermission(decision.decision_status, decision.budget_check_status);
  if (decision.execution_permission !== expectedExecutionPermission) {
    issues.push({
      code: "execution_permission_mismatch",
      message:
        `Provider execution decision execution_permission must be ${expectedExecutionPermission} for the recorded decision and budget check.`
    });
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

function isProviderExecutionAction(value: unknown): value is UnitReviewProviderExecutionRequestAction {
  return value === "run_scoped_review_rerun" || value === "run_widened_review_rerun";
}

function isCurriculumAgentRole(role: unknown): role is CurriculumAgentRole {
  return typeof role === "string" && curriculumAgentOrder.some((candidate) => candidate === role);
}

function deriveExpectedRequestedRoles(startRole: CurriculumAgentRole): CurriculumAgentRole[] | null {
  const startIndex = curriculumAgentOrder.indexOf(startRole);
  return startIndex === -1 ? null : [...curriculumAgentOrder.slice(startIndex)];
}

function rolesEqual(left: readonly CurriculumAgentRole[], right: readonly CurriculumAgentRole[]): boolean {
  return left.length === right.length && left.every((role, index) => role === right[index]);
}

function isDecisionStatus(value: unknown): value is UnitReviewProviderExecutionDecisionStatus {
  return value === "approved" || value === "rejected";
}

function isBudgetCheckStatus(value: unknown): value is UnitReviewProviderExecutionBudgetCheckStatus {
  return value === "passed" || value === "failed";
}

function isExecutionPermission(value: unknown): value is UnitReviewProviderExecutionPermission {
  return value === "granted" || value === "denied";
}

function deriveExecutionPermission(
  decisionStatus: UnitReviewProviderExecutionDecisionStatus,
  budgetCheckStatus: UnitReviewProviderExecutionBudgetCheckStatus
): UnitReviewProviderExecutionPermission {
  return decisionStatus === "approved" && budgetCheckStatus === "passed" ? "granted" : "denied";
}

function buildProviderExecutionRequestKey(
  unitId: string,
  executionAction: UnitReviewProviderExecutionRequestAction,
  sourceArtifactGeneratedAt: string
): string {
  return `content-pipeline:provider-execution-request:${executionAction}:${unitId}:${sourceArtifactGeneratedAt}`;
}

function buildProviderExecutionChainKey(unitId: string, rootArtifactGeneratedAt: string): string {
  return `content-pipeline:provider-execution-chain:${unitId}:${rootArtifactGeneratedAt}`;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}
