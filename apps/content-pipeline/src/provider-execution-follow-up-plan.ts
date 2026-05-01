import type { UnitReviewProviderExecutionAttempt } from "./provider-execution-attempt";
import type { UnitReviewProviderExecutionDecision } from "./provider-execution-decision";
import type { UnitReviewProviderExecutionReceipt } from "./provider-execution-receipt";
import type { UnitReviewProviderExecutionReconciliation } from "./provider-execution-reconciliation";
import type { UnitReviewProviderExecutionRequest } from "./provider-execution-request";
import type { UnitReviewProviderExecutionFollowUp } from "./provider-execution-follow-up";
import {
  validateUnitReviewProviderExecutionFollowUp,
  validateUnitReviewProviderExecutionFollowUpSource
} from "./provider-execution-follow-up";

export type UnitReviewProviderExecutionFollowUpPlanAction =
  | "none"
  | "create_follow_up_inbox_item";

export interface UnitReviewProviderExecutionFollowUpPlan {
  schema_version: "content-pipeline-review-provider-execution-follow-up-plan/v0.1";
  source_follow_up_schema_version: UnitReviewProviderExecutionFollowUp["schema_version"];
  request_key: string;
  chain_key: string;
  attempt_key: string;
  unit_id: string;
  follow_up_state: UnitReviewProviderExecutionFollowUp["follow_up_state"];
  follow_up_action: UnitReviewProviderExecutionFollowUp["follow_up_action"];
  provider_execution_chain_closed: boolean;
  result_artifact_handoff: UnitReviewProviderExecutionFollowUp["result_artifact_handoff"];
  delivery_action: UnitReviewProviderExecutionFollowUpPlanAction;
  final_follow_up_item_key: string | null;
  final_follow_up_queue:
    | NonNullable<UnitReviewProviderExecutionFollowUp["follow_up_item"]>["human_queue"]
    | null;
  upsert:
    | null
    | {
        operation_key: string;
        item_key: NonNullable<UnitReviewProviderExecutionFollowUp["follow_up_item"]>["item_key"];
        human_queue: NonNullable<UnitReviewProviderExecutionFollowUp["follow_up_item"]>["human_queue"];
        title: NonNullable<UnitReviewProviderExecutionFollowUp["follow_up_item"]>["title"];
        summary: NonNullable<UnitReviewProviderExecutionFollowUp["follow_up_item"]>["summary"];
        primary_human_action: NonNullable<UnitReviewProviderExecutionFollowUp["follow_up_item"]>["primary_human_action"];
        automation_step: NonNullable<UnitReviewProviderExecutionFollowUp["follow_up_item"]>["automation_step"];
        labels: string[];
      };
  automation_step: UnitReviewProviderExecutionFollowUp["automation_step"];
  decision_boundary: UnitReviewProviderExecutionFollowUp["decision_boundary"];
}

export interface ProviderExecutionFollowUpPlanSourceValidationIssue {
  code:
    | "invalid_follow_up_schema_version"
    | "source_follow_up_contract_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpPlanSourceValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpPlanSourceValidationIssue[];
}

export interface ProviderExecutionFollowUpPlanValidationIssue {
  code:
    | "invalid_plan_schema_version"
    | "source_follow_up_schema_version_mismatch"
    | "request_key_mismatch"
    | "chain_key_mismatch"
    | "attempt_key_mismatch"
    | "unit_id_mismatch"
    | "follow_up_state_mismatch"
    | "follow_up_action_mismatch"
    | "provider_execution_chain_closed_mismatch"
    | "result_artifact_handoff_mismatch"
    | "delivery_action_mismatch"
    | "final_follow_up_state_mismatch"
    | "upsert_presence_mismatch"
    | "upsert_operation_key_mismatch"
    | "upsert_payload_mismatch"
    | "automation_step_mismatch"
    | "decision_boundary_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpPlanValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpPlanValidationIssue[];
}

export function validateUnitReviewProviderExecutionFollowUpPlanSource(
  request: UnitReviewProviderExecutionRequest,
  decision: UnitReviewProviderExecutionDecision,
  attempt: UnitReviewProviderExecutionAttempt,
  receipt: UnitReviewProviderExecutionReceipt,
  reconciliation: UnitReviewProviderExecutionReconciliation,
  followUp: UnitReviewProviderExecutionFollowUp
): ProviderExecutionFollowUpPlanSourceValidationResult {
  const issues: ProviderExecutionFollowUpPlanSourceValidationIssue[] = [];
  const followUpSourceValidation = validateUnitReviewProviderExecutionFollowUpSource(
    request,
    decision,
    attempt,
    receipt,
    reconciliation
  );
  const followUpValidation = validateUnitReviewProviderExecutionFollowUp(
    request,
    decision,
    attempt,
    receipt,
    reconciliation,
    followUp
  );

  if (followUp.schema_version !== "content-pipeline-review-provider-execution-follow-up/v0.1") {
    issues.push({
      code: "invalid_follow_up_schema_version",
      message:
        "Provider execution follow-up plan source follow-up must use schema_version content-pipeline-review-provider-execution-follow-up/v0.1."
    });
  }

  if (!followUpSourceValidation.ok || !followUpValidation.ok) {
    const issueCodes = [
      ...followUpSourceValidation.issues.map((issue) => issue.code),
      ...followUpValidation.issues.map((issue) => issue.code)
    ];
    issues.push({
      code: "source_follow_up_contract_mismatch",
      message:
        `Provider execution follow-up plan source follow-up failed validation: ${issueCodes.join(", ")}.`
    });
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

export function buildUnitReviewProviderExecutionFollowUpPlan(
  followUp: UnitReviewProviderExecutionFollowUp
): UnitReviewProviderExecutionFollowUpPlan {
  const upsert = followUp.follow_up_item
    ? {
        operation_key: buildFollowUpUpsertOperationKey(followUp.follow_up_item.item_key),
        item_key: followUp.follow_up_item.item_key,
        human_queue: followUp.follow_up_item.human_queue,
        title: followUp.follow_up_item.title,
        summary: followUp.follow_up_item.summary,
        primary_human_action: followUp.follow_up_item.primary_human_action,
        automation_step: followUp.follow_up_item.automation_step,
        labels: followUp.follow_up_item.labels
      }
    : null;

  return {
    schema_version: "content-pipeline-review-provider-execution-follow-up-plan/v0.1",
    source_follow_up_schema_version: followUp.schema_version,
    request_key: followUp.request_key,
    chain_key: followUp.chain_key,
    attempt_key: followUp.attempt_key,
    unit_id: followUp.unit_id,
    follow_up_state: followUp.follow_up_state,
    follow_up_action: followUp.follow_up_action,
    provider_execution_chain_closed: followUp.provider_execution_chain_closed,
    result_artifact_handoff: followUp.result_artifact_handoff,
    delivery_action: upsert ? "create_follow_up_inbox_item" : "none",
    final_follow_up_item_key: upsert?.item_key ?? null,
    final_follow_up_queue: upsert?.human_queue ?? null,
    upsert,
    automation_step: followUp.automation_step,
    decision_boundary: followUp.decision_boundary
  };
}

export function validateUnitReviewProviderExecutionFollowUpPlan(
  followUp: UnitReviewProviderExecutionFollowUp,
  plan: UnitReviewProviderExecutionFollowUpPlan
): ProviderExecutionFollowUpPlanValidationResult {
  const issues: ProviderExecutionFollowUpPlanValidationIssue[] = [];
  const expected = buildUnitReviewProviderExecutionFollowUpPlan(followUp);

  if (plan.schema_version !== "content-pipeline-review-provider-execution-follow-up-plan/v0.1") {
    issues.push({
      code: "invalid_plan_schema_version",
      message:
        "Provider execution follow-up plan schema_version must be content-pipeline-review-provider-execution-follow-up-plan/v0.1."
    });
  }

  if (plan.source_follow_up_schema_version !== expected.source_follow_up_schema_version) {
    issues.push({
      code: "source_follow_up_schema_version_mismatch",
      message:
        "Provider execution follow-up plan source_follow_up_schema_version must match the source follow-up schema_version."
    });
  }

  if (plan.request_key !== expected.request_key) {
    issues.push({
      code: "request_key_mismatch",
      message: "Provider execution follow-up plan request_key must match the source follow-up request_key."
    });
  }

  if (plan.chain_key !== expected.chain_key) {
    issues.push({
      code: "chain_key_mismatch",
      message: "Provider execution follow-up plan chain_key must match the source follow-up chain_key."
    });
  }

  if (plan.attempt_key !== expected.attempt_key) {
    issues.push({
      code: "attempt_key_mismatch",
      message: "Provider execution follow-up plan attempt_key must match the source follow-up attempt_key."
    });
  }

  if (plan.unit_id !== expected.unit_id) {
    issues.push({
      code: "unit_id_mismatch",
      message: "Provider execution follow-up plan unit_id must match the source follow-up unit_id."
    });
  }

  if (plan.follow_up_state !== expected.follow_up_state) {
    issues.push({
      code: "follow_up_state_mismatch",
      message: "Provider execution follow-up plan follow_up_state must match the source follow-up state."
    });
  }

  if (plan.follow_up_action !== expected.follow_up_action) {
    issues.push({
      code: "follow_up_action_mismatch",
      message: "Provider execution follow-up plan follow_up_action must match the source follow-up action."
    });
  }

  if (plan.provider_execution_chain_closed !== expected.provider_execution_chain_closed) {
    issues.push({
      code: "provider_execution_chain_closed_mismatch",
      message:
        "Provider execution follow-up plan provider_execution_chain_closed must match the source follow-up closure state."
    });
  }

  if (!resultArtifactHandoffsMatch(plan.result_artifact_handoff, expected.result_artifact_handoff)) {
    issues.push({
      code: "result_artifact_handoff_mismatch",
      message:
        "Provider execution follow-up plan result_artifact_handoff must match the source follow-up artifact handoff."
    });
  }

  if (plan.delivery_action !== expected.delivery_action) {
    issues.push({
      code: "delivery_action_mismatch",
      message:
        "Provider execution follow-up plan delivery_action must match whether the source follow-up includes a manual triage inbox item."
    });
  }

  if (
    plan.final_follow_up_item_key !== expected.final_follow_up_item_key ||
    plan.final_follow_up_queue !== expected.final_follow_up_queue
  ) {
    issues.push({
      code: "final_follow_up_state_mismatch",
      message:
        "Provider execution follow-up plan final follow-up item state must match the source follow-up delivery target."
    });
  }

  if ((plan.upsert === null) !== (expected.upsert === null)) {
    issues.push({
      code: "upsert_presence_mismatch",
      message:
        "Provider execution follow-up plan upsert presence must match whether the source follow-up includes a follow_up_item."
    });
  }

  if (plan.upsert && expected.upsert) {
    const expectedOperationKey = buildFollowUpUpsertOperationKey(plan.upsert.item_key);
    if (plan.upsert.operation_key !== expectedOperationKey) {
      issues.push({
        code: "upsert_operation_key_mismatch",
        message:
          "Provider execution follow-up plan upsert.operation_key must match the deterministic follow-up delivery upsert key for upsert.item_key."
      });
    }

    if (
      plan.upsert.item_key !== expected.upsert.item_key ||
      plan.upsert.human_queue !== expected.upsert.human_queue ||
      plan.upsert.title !== expected.upsert.title ||
      plan.upsert.summary !== expected.upsert.summary ||
      plan.upsert.primary_human_action !== expected.upsert.primary_human_action ||
      plan.upsert.automation_step !== expected.upsert.automation_step ||
      plan.upsert.labels.length !== expected.upsert.labels.length ||
      plan.upsert.labels.some((label, index) => label !== expected.upsert?.labels[index])
    ) {
      issues.push({
        code: "upsert_payload_mismatch",
        message:
          "Provider execution follow-up plan upsert payload must match the source follow-up item exactly."
      });
    }
  }

  if (plan.automation_step !== expected.automation_step) {
    issues.push({
      code: "automation_step_mismatch",
      message:
        "Provider execution follow-up plan automation_step must match the source follow-up automation step."
    });
  }

  if (
    plan.decision_boundary.requires_provider_execution !== expected.decision_boundary.requires_provider_execution ||
    plan.decision_boundary.requires_human_decision !== expected.decision_boundary.requires_human_decision ||
    plan.decision_boundary.provider_execution_allowed_without_human !==
      expected.decision_boundary.provider_execution_allowed_without_human
  ) {
    issues.push({
      code: "decision_boundary_mismatch",
      message:
        "Provider execution follow-up plan decision_boundary must match the source follow-up decision boundary."
    });
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

function resultArtifactHandoffsMatch(
  actual: UnitReviewProviderExecutionFollowUpPlan["result_artifact_handoff"],
  expected: UnitReviewProviderExecutionFollowUpPlan["result_artifact_handoff"]
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

function buildFollowUpUpsertOperationKey(itemKey: string): string {
  return `content-pipeline:provider-execution-follow-up-delivery:upsert:${itemKey}`;
}
