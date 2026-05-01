import type { UnitReviewPrimaryHumanAction } from "./orchestration-guidance";
import type { UnitReviewProviderExecutionAttempt } from "./provider-execution-attempt";
import type { UnitReviewProviderExecutionDecision } from "./provider-execution-decision";
import type {
  ProviderExecutionReconciliationValidationIssue,
  UnitReviewProviderExecutionReconciliation,
} from "./provider-execution-reconciliation";
import { validateUnitReviewProviderExecutionReconciliation } from "./provider-execution-reconciliation";
import type { UnitReviewProviderExecutionReceipt } from "./provider-execution-receipt";
import type { UnitReviewProviderExecutionRequest } from "./provider-execution-request";
import type { UnitReviewArtifact } from "./review-runner";

export type UnitReviewProviderExecutionFollowUpState =
  | "result_artifact_review_required"
  | "execution_triage_required"
  | "receipt_triage_required";

export type UnitReviewProviderExecutionFollowUpAction =
  | "defer_to_result_artifact_contract"
  | "open_manual_execution_triage_item"
  | "open_manual_receipt_triage_item";

export interface UnitReviewProviderExecutionFollowUp {
  schema_version: "content-pipeline-review-provider-execution-follow-up/v0.1";
  source_request_schema_version: UnitReviewProviderExecutionRequest["schema_version"];
  source_decision_schema_version: UnitReviewProviderExecutionDecision["schema_version"];
  source_attempt_schema_version: UnitReviewProviderExecutionAttempt["schema_version"];
  source_receipt_schema_version: UnitReviewProviderExecutionReceipt["schema_version"];
  source_reconciliation_schema_version: UnitReviewProviderExecutionReconciliation["schema_version"];
  request_key: string;
  chain_key: string;
  attempt_key: string;
  unit_id: string;
  source_reconciliation_status: UnitReviewProviderExecutionReconciliation["reconciliation_status"];
  source_recommended_follow_up: UnitReviewProviderExecutionReconciliation["recommended_follow_up"];
  source_execution_outcome: UnitReviewProviderExecutionReconciliation["execution_outcome"];
  follow_up_state: UnitReviewProviderExecutionFollowUpState;
  follow_up_action: UnitReviewProviderExecutionFollowUpAction;
  provider_execution_chain_closed: boolean;
  result_artifact_handoff: null | {
    expected_schema_version: UnitReviewArtifact["schema_version"];
    generated_at: string;
    status: UnitReviewArtifact["status"];
  };
  automation_step: "none" | "open_inbox_item";
  decision_boundary: {
    requires_provider_execution: false;
    requires_human_decision: boolean;
    provider_execution_allowed_without_human: false;
  };
  follow_up_item: null | {
    item_key: string;
    human_queue: "manual_triage_queue";
    title: string;
    summary: string;
    primary_human_action: Extract<UnitReviewPrimaryHumanAction, "perform_manual_triage">;
    automation_step: "open_inbox_item";
    labels: string[];
  };
}

export interface ProviderExecutionFollowUpSourceValidationIssue {
  code:
    | "source_reconciliation_contract_mismatch"
    | "invalid_reconciliation_shape"
    | "invalid_reconciliation_schema_version";
  message: string;
}

export interface ProviderExecutionFollowUpSourceValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpSourceValidationIssue[];
}

export interface ProviderExecutionFollowUpValidationIssue {
  code:
    | "source_contract_mismatch"
    | "invalid_follow_up_schema_version"
    | "source_request_schema_version_mismatch"
    | "source_decision_schema_version_mismatch"
    | "source_attempt_schema_version_mismatch"
    | "source_receipt_schema_version_mismatch"
    | "source_reconciliation_schema_version_mismatch"
    | "request_key_mismatch"
    | "chain_key_mismatch"
    | "attempt_key_mismatch"
    | "unit_id_mismatch"
    | "source_reconciliation_status_mismatch"
    | "source_recommended_follow_up_mismatch"
    | "source_execution_outcome_mismatch"
    | "follow_up_state_mismatch"
    | "follow_up_action_mismatch"
    | "provider_execution_chain_closed_mismatch"
    | "result_artifact_handoff_mismatch"
    | "automation_step_mismatch"
    | "decision_boundary_mismatch"
    | "follow_up_item_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpValidationIssue[];
}

export function validateUnitReviewProviderExecutionFollowUpSource(
  request: UnitReviewProviderExecutionRequest,
  decision: UnitReviewProviderExecutionDecision,
  attempt: UnitReviewProviderExecutionAttempt,
  receipt: UnitReviewProviderExecutionReceipt,
  reconciliation: UnitReviewProviderExecutionReconciliation
): ProviderExecutionFollowUpSourceValidationResult {
  const issues: ProviderExecutionFollowUpSourceValidationIssue[] = [];

  if (!isProviderExecutionReconciliationShape(reconciliation)) {
    issues.push({
      code: "invalid_reconciliation_shape",
      message:
        "Provider execution follow-up source reconciliation must include the required reconciliation fields with the expected primitive shapes."
    });

    return {
      ok: false,
      issues
    };
  }

  if (reconciliation.schema_version !== "content-pipeline-review-provider-execution-reconciliation/v0.1") {
    issues.push({
      code: "invalid_reconciliation_schema_version",
      message:
        "Provider execution follow-up source reconciliation must use schema_version content-pipeline-review-provider-execution-reconciliation/v0.1.",
    });
  }

  const reconciliationValidation = validateUnitReviewProviderExecutionReconciliation(
    request,
    decision,
    attempt,
    receipt,
    reconciliation
  );

  if (!reconciliationValidation.ok) {
    issues.push({
      code: "source_reconciliation_contract_mismatch",
      message:
        `Provider execution follow-up source reconciliation failed validation: ${reconciliationValidation.issues.map((issue) => issue.code).join(", ")}.`,
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

export function buildUnitReviewProviderExecutionFollowUp(
  request: UnitReviewProviderExecutionRequest,
  decision: UnitReviewProviderExecutionDecision,
  attempt: UnitReviewProviderExecutionAttempt,
  receipt: UnitReviewProviderExecutionReceipt,
  reconciliation: UnitReviewProviderExecutionReconciliation
): UnitReviewProviderExecutionFollowUp {
  const sourceValidation = validateUnitReviewProviderExecutionFollowUpSource(
    request,
    decision,
    attempt,
    receipt,
    reconciliation
  );
  if (!sourceValidation.ok) {
    throw new Error(
      `Provider execution follow-up source is invalid: ${sourceValidation.issues.map((issue) => issue.code).join(", ")}.`
    );
  }

  const followUpState = deriveFollowUpState(reconciliation);
  const followUpAction = deriveFollowUpAction(followUpState);

  return {
    schema_version: "content-pipeline-review-provider-execution-follow-up/v0.1",
    source_request_schema_version: "content-pipeline-review-provider-execution-request/v0.1",
    source_decision_schema_version: "content-pipeline-review-provider-execution-decision/v0.1",
    source_attempt_schema_version: "content-pipeline-review-provider-execution-attempt/v0.1",
    source_receipt_schema_version: "content-pipeline-review-provider-execution-receipt/v0.1",
    source_reconciliation_schema_version: "content-pipeline-review-provider-execution-reconciliation/v0.1",
    request_key: request.request_key,
    chain_key: request.chain_key,
    attempt_key: attempt.attempt_key,
    unit_id: request.unit_id,
    source_reconciliation_status: reconciliation.reconciliation_status,
    source_recommended_follow_up: reconciliation.recommended_follow_up,
    source_execution_outcome: reconciliation.execution_outcome,
    follow_up_state: followUpState,
    follow_up_action: followUpAction,
    provider_execution_chain_closed: followUpState === "result_artifact_review_required",
    result_artifact_handoff: buildResultArtifactHandoff(reconciliation, followUpState),
    automation_step: followUpState === "result_artifact_review_required" ? "none" : "open_inbox_item",
    decision_boundary: {
      requires_provider_execution: false,
      requires_human_decision: followUpState !== "result_artifact_review_required",
      provider_execution_allowed_without_human: false,
    },
    follow_up_item: buildFollowUpItem(request, attempt, reconciliation, followUpState),
  };
}

export function validateUnitReviewProviderExecutionFollowUp(
  request: UnitReviewProviderExecutionRequest,
  decision: UnitReviewProviderExecutionDecision,
  attempt: UnitReviewProviderExecutionAttempt,
  receipt: UnitReviewProviderExecutionReceipt,
  reconciliation: UnitReviewProviderExecutionReconciliation,
  followUp: UnitReviewProviderExecutionFollowUp
): ProviderExecutionFollowUpValidationResult {
  const issues: ProviderExecutionFollowUpValidationIssue[] = [];
  const sourceValidation = validateUnitReviewProviderExecutionFollowUpSource(
    request,
    decision,
    attempt,
    receipt,
    reconciliation
  );

  if (!sourceValidation.ok) {
    issues.push({
      code: "source_contract_mismatch",
      message:
        `Provider execution follow-up source failed validation: ${sourceValidation.issues.map((issue) => issue.code).join(", ")}.`,
    });

    return {
      ok: false,
      issues,
    };
  }

  const expected = buildUnitReviewProviderExecutionFollowUp(
    request,
    decision,
    attempt,
    receipt,
    reconciliation
  );

  if (followUp.schema_version !== "content-pipeline-review-provider-execution-follow-up/v0.1") {
    issues.push({
      code: "invalid_follow_up_schema_version",
      message:
        "Provider execution follow-up schema_version must be content-pipeline-review-provider-execution-follow-up/v0.1.",
    });
  }

  if (followUp.source_request_schema_version !== expected.source_request_schema_version) {
    issues.push({
      code: "source_request_schema_version_mismatch",
      message:
        "Provider execution follow-up source_request_schema_version must match the canonical provider execution request schema version.",
    });
  }

  if (followUp.source_decision_schema_version !== expected.source_decision_schema_version) {
    issues.push({
      code: "source_decision_schema_version_mismatch",
      message:
        "Provider execution follow-up source_decision_schema_version must match the canonical provider execution decision schema version.",
    });
  }

  if (followUp.source_attempt_schema_version !== expected.source_attempt_schema_version) {
    issues.push({
      code: "source_attempt_schema_version_mismatch",
      message:
        "Provider execution follow-up source_attempt_schema_version must match the canonical provider execution attempt schema version.",
    });
  }

  if (followUp.source_receipt_schema_version !== expected.source_receipt_schema_version) {
    issues.push({
      code: "source_receipt_schema_version_mismatch",
      message:
        "Provider execution follow-up source_receipt_schema_version must match the canonical provider execution receipt schema version.",
    });
  }

  if (followUp.source_reconciliation_schema_version !== expected.source_reconciliation_schema_version) {
    issues.push({
      code: "source_reconciliation_schema_version_mismatch",
      message:
        "Provider execution follow-up source_reconciliation_schema_version must match the canonical provider execution reconciliation schema version.",
    });
  }

  if (followUp.request_key !== expected.request_key) {
    issues.push({
      code: "request_key_mismatch",
      message: "Provider execution follow-up request_key must match the source execution chain.",
    });
  }

  if (followUp.chain_key !== expected.chain_key) {
    issues.push({
      code: "chain_key_mismatch",
      message: "Provider execution follow-up chain_key must match the source execution chain.",
    });
  }

  if (followUp.attempt_key !== expected.attempt_key) {
    issues.push({
      code: "attempt_key_mismatch",
      message: "Provider execution follow-up attempt_key must match the source execution chain.",
    });
  }

  if (followUp.unit_id !== expected.unit_id) {
    issues.push({
      code: "unit_id_mismatch",
      message: "Provider execution follow-up unit_id must match the source execution chain.",
    });
  }

  if (followUp.source_reconciliation_status !== expected.source_reconciliation_status) {
    issues.push({
      code: "source_reconciliation_status_mismatch",
      message:
        "Provider execution follow-up source_reconciliation_status must match the source reconciliation status.",
    });
  }

  if (followUp.source_recommended_follow_up !== expected.source_recommended_follow_up) {
    issues.push({
      code: "source_recommended_follow_up_mismatch",
      message:
        "Provider execution follow-up source_recommended_follow_up must match the source reconciliation recommended follow-up.",
    });
  }

  if (followUp.source_execution_outcome !== expected.source_execution_outcome) {
    issues.push({
      code: "source_execution_outcome_mismatch",
      message:
        "Provider execution follow-up source_execution_outcome must match the source reconciliation execution outcome.",
    });
  }

  if (followUp.follow_up_state !== expected.follow_up_state) {
    issues.push({
      code: "follow_up_state_mismatch",
      message:
        "Provider execution follow-up follow_up_state must match the derived post-execution routing state.",
    });
  }

  if (followUp.follow_up_action !== expected.follow_up_action) {
    issues.push({
      code: "follow_up_action_mismatch",
      message:
        "Provider execution follow-up follow_up_action must match the derived post-execution routing action.",
    });
  }

  if (followUp.provider_execution_chain_closed !== expected.provider_execution_chain_closed) {
    issues.push({
      code: "provider_execution_chain_closed_mismatch",
      message:
        "Provider execution follow-up provider_execution_chain_closed must match the derived execution-closure state.",
    });
  }

  if (!resultArtifactHandoffsMatch(followUp.result_artifact_handoff, expected.result_artifact_handoff)) {
    issues.push({
      code: "result_artifact_handoff_mismatch",
      message:
        "Provider execution follow-up result_artifact_handoff must match the trusted result-artifact handoff derived from the source reconciliation.",
    });
  }

  if (followUp.automation_step !== expected.automation_step) {
    issues.push({
      code: "automation_step_mismatch",
      message:
        "Provider execution follow-up automation_step must match the derived next-step contract.",
    });
  }

  if (
    followUp.decision_boundary.requires_provider_execution !== expected.decision_boundary.requires_provider_execution ||
    followUp.decision_boundary.requires_human_decision !== expected.decision_boundary.requires_human_decision ||
    followUp.decision_boundary.provider_execution_allowed_without_human !==
      expected.decision_boundary.provider_execution_allowed_without_human
  ) {
    issues.push({
      code: "decision_boundary_mismatch",
      message:
        "Provider execution follow-up decision_boundary must match the derived post-execution human-routing boundary.",
    });
  }

  if (!followUpItemsMatch(followUp.follow_up_item, expected.follow_up_item)) {
    issues.push({
      code: "follow_up_item_mismatch",
      message:
        "Provider execution follow-up follow_up_item must match the derived manual triage item for the source execution chain.",
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

function deriveFollowUpState(
  reconciliation: UnitReviewProviderExecutionReconciliation
): UnitReviewProviderExecutionFollowUpState {
  switch (reconciliation.recommended_follow_up) {
    case "review_result_artifact":
      return "result_artifact_review_required";
    case "manual_execution_triage":
      return "execution_triage_required";
    case "manual_receipt_triage":
      return "receipt_triage_required";
    default:
      throw new Error(
        `Unsupported provider execution reconciliation recommended_follow_up: ${String(reconciliation.recommended_follow_up)}.`
      );
  }
}

function deriveFollowUpAction(
  followUpState: UnitReviewProviderExecutionFollowUpState
): UnitReviewProviderExecutionFollowUpAction {
  switch (followUpState) {
    case "result_artifact_review_required":
      return "defer_to_result_artifact_contract";
    case "execution_triage_required":
      return "open_manual_execution_triage_item";
    case "receipt_triage_required":
      return "open_manual_receipt_triage_item";
    default:
      throw new Error(`Unsupported provider execution follow-up state: ${String(followUpState)}.`);
  }
}

function buildResultArtifactHandoff(
  reconciliation: UnitReviewProviderExecutionReconciliation,
  followUpState: UnitReviewProviderExecutionFollowUpState
): UnitReviewProviderExecutionFollowUp["result_artifact_handoff"] {
  if (
    followUpState !== "result_artifact_review_required" ||
    !reconciliation.result_artifact_available ||
    !reconciliation.result_artifact_generated_at ||
    !reconciliation.result_artifact_status
  ) {
    return null;
  }

  return {
    expected_schema_version: "content-pipeline-review-artifact/v0.1",
    generated_at: reconciliation.result_artifact_generated_at,
    status: reconciliation.result_artifact_status,
  };
}

function buildFollowUpItem(
  request: UnitReviewProviderExecutionRequest,
  attempt: UnitReviewProviderExecutionAttempt,
  reconciliation: UnitReviewProviderExecutionReconciliation,
  followUpState: UnitReviewProviderExecutionFollowUpState
): UnitReviewProviderExecutionFollowUp["follow_up_item"] {
  if (followUpState === "result_artifact_review_required") {
    return null;
  }

  const executionFailure = followUpState === "execution_triage_required";
  const itemKey = executionFailure
    ? buildExecutionTriageItemKey(request.unit_id, attempt.attempt_key)
    : buildReceiptTriageItemKey(request.unit_id, attempt.attempt_key);

  const title = executionFailure
    ? `[Provider Execution Triage] ${request.unit_id}`
    : `[Provider Receipt Triage] ${request.unit_id}`;

  const summary = executionFailure
    ? `Authorized provider rerun for attempt ${attempt.attempt_key} failed with ${reconciliation.failure_code ?? "unknown_failure"} after ${reconciliation.actual_provider_call_count ?? "n/a"} provider calls. Manual execution triage is required before any next rerun or artifact routing.`
    : `Provider execution receipt for attempt ${attempt.attempt_key} is not trustworthy (${reconciliation.receipt_validation_issue_codes.join(", ") || "unknown_receipt_issue"}). No trusted artifact or failure outcome is currently confirmed. Manual receipt triage is required before any next rerun or artifact routing.`;

  const labels = executionFailure
    ? [
        "content_pipeline_review",
        "provider_execution_follow_up",
        "queue:manual_triage_queue",
        "follow_up_state:execution_triage_required",
        "execution_outcome:execution_failed",
        `failure_code:${sanitizeLabelValue(reconciliation.failure_code ?? "unknown_failure")}`,
      ]
    : [
        "content_pipeline_review",
        "provider_execution_follow_up",
        "queue:manual_triage_queue",
        "follow_up_state:receipt_triage_required",
        "execution_outcome:invalid_receipt",
        `receipt_validation:${reconciliation.receipt_validation_issue_codes.join("|") || "unknown_receipt_issue"}`,
      ];

  return {
    item_key: itemKey,
    human_queue: "manual_triage_queue",
    title,
    summary,
    primary_human_action: "perform_manual_triage",
    automation_step: "open_inbox_item",
    labels,
  };
}

function resultArtifactHandoffsMatch(
  actual: UnitReviewProviderExecutionFollowUp["result_artifact_handoff"],
  expected: UnitReviewProviderExecutionFollowUp["result_artifact_handoff"]
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

function followUpItemsMatch(
  actual: UnitReviewProviderExecutionFollowUp["follow_up_item"],
  expected: UnitReviewProviderExecutionFollowUp["follow_up_item"]
): boolean {
  if (actual === null || expected === null) {
    return actual === expected;
  }

  return (
    actual.item_key === expected.item_key &&
    actual.human_queue === expected.human_queue &&
    actual.title === expected.title &&
    actual.summary === expected.summary &&
    actual.primary_human_action === expected.primary_human_action &&
    actual.automation_step === expected.automation_step &&
    actual.labels.length === expected.labels.length &&
    actual.labels.every((label, index) => label === expected.labels[index])
  );
}

function buildExecutionTriageItemKey(unitId: string, attemptKey: string): string {
  return `content-pipeline:manual_triage_queue:${unitId}:provider-execution:${attemptKey}`;
}

function buildReceiptTriageItemKey(unitId: string, attemptKey: string): string {
  return `content-pipeline:manual_triage_queue:${unitId}:provider-receipt:${attemptKey}`;
}

function sanitizeLabelValue(value: string): string {
  const sanitized = value.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "");
  return sanitized.length > 0 ? sanitized : "unknown_value";
}

function isProviderExecutionReconciliationShape(
  reconciliation: UnitReviewProviderExecutionReconciliation
): reconciliation is UnitReviewProviderExecutionReconciliation {
  const candidate = reconciliation as unknown as Record<string, unknown>;

  return (
    typeof candidate === "object" &&
    candidate !== null &&
    typeof candidate.schema_version === "string" &&
    typeof candidate.source_request_schema_version === "string" &&
    typeof candidate.source_decision_schema_version === "string" &&
    typeof candidate.source_attempt_schema_version === "string" &&
    typeof candidate.source_receipt_schema_version === "string" &&
    typeof candidate.request_key === "string" &&
    typeof candidate.chain_key === "string" &&
    typeof candidate.attempt_key === "string" &&
    typeof candidate.unit_id === "string" &&
    typeof candidate.receipt_validation_ok === "boolean" &&
    Array.isArray(candidate.receipt_validation_issue_codes) &&
    candidate.receipt_validation_issue_codes.every((issue) => typeof issue === "string") &&
    (candidate.reconciliation_status === "closed" || candidate.reconciliation_status === "action_required") &&
    (candidate.recommended_follow_up === "review_result_artifact" ||
      candidate.recommended_follow_up === "manual_execution_triage" ||
      candidate.recommended_follow_up === "manual_receipt_triage") &&
    typeof candidate.execution_outcome === "string" &&
    typeof candidate.result_artifact_available === "boolean" &&
    isNullableString(candidate.result_artifact_generated_at) &&
    isNullableString(candidate.result_artifact_status) &&
    isNullableNonNegativeInteger(candidate.actual_provider_call_count) &&
    isNullableString(candidate.executed_by) &&
    isNullableString(candidate.executed_at) &&
    isNullableString(candidate.failure_code)
  );
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isNullableNonNegativeInteger(value: unknown): value is number | null {
  return value === null || (Number.isInteger(value) && (value as number) >= 0);
}
