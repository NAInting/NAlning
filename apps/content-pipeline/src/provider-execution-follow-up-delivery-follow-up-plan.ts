import type { UnitReviewProviderExecutionAttempt } from "./provider-execution-attempt";
import type { UnitReviewProviderExecutionDecision } from "./provider-execution-decision";
import type { UnitReviewProviderExecutionFollowUp } from "./provider-execution-follow-up";
import type {
  UnitReviewProviderExecutionFollowUpDeliveryFollowUp,
} from "./provider-execution-follow-up-delivery-follow-up";
import {
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUp,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpSourceContract,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpSource,
} from "./provider-execution-follow-up-delivery-follow-up";
import type { UnitReviewProviderExecutionFollowUpPlan } from "./provider-execution-follow-up-plan";
import type { UnitReviewProviderExecutionFollowUpReceipt } from "./provider-execution-follow-up-receipt";
import type { UnitReviewProviderExecutionFollowUpReconciliation } from "./provider-execution-follow-up-reconciliation";
import type { UnitReviewProviderExecutionReceipt } from "./provider-execution-receipt";
import type { UnitReviewProviderExecutionReconciliation } from "./provider-execution-reconciliation";
import type { UnitReviewProviderExecutionRequest } from "./provider-execution-request";

export type UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlanAction =
  | "none"
  | "create_follow_up_inbox_item";

export interface UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan {
  schema_version: "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-plan/v0.1";
  source_follow_up_schema_version: UnitReviewProviderExecutionFollowUpDeliveryFollowUp["schema_version"];
  request_key: string;
  chain_key: string;
  attempt_key: string;
  unit_id: string;
  follow_up_state: UnitReviewProviderExecutionFollowUpDeliveryFollowUp["follow_up_state"];
  follow_up_action: UnitReviewProviderExecutionFollowUpDeliveryFollowUp["follow_up_action"];
  follow_up_delivery_chain_closed: UnitReviewProviderExecutionFollowUpDeliveryFollowUp["follow_up_delivery_chain_closed"];
  preserved_result_artifact_handoff: UnitReviewProviderExecutionFollowUpDeliveryFollowUp["preserved_result_artifact_handoff"];
  preserved_active_follow_up_item: UnitReviewProviderExecutionFollowUpDeliveryFollowUp["preserved_active_follow_up_item"];
  delivery_action: UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlanAction;
  final_follow_up_item_key: string | null;
  final_follow_up_queue:
    | NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUp["follow_up_item"]>["human_queue"]
    | null;
  upsert:
    | null
    | {
        operation_key: string;
        item_key: NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUp["follow_up_item"]>["item_key"];
        human_queue: NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUp["follow_up_item"]>["human_queue"];
        title: NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUp["follow_up_item"]>["title"];
        summary: NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUp["follow_up_item"]>["summary"];
        primary_human_action: NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUp["follow_up_item"]>["primary_human_action"];
        automation_step: NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUp["follow_up_item"]>["automation_step"];
        labels: string[];
      };
  automation_step: UnitReviewProviderExecutionFollowUpDeliveryFollowUp["automation_step"];
  decision_boundary: UnitReviewProviderExecutionFollowUpDeliveryFollowUp["decision_boundary"];
}

export interface ProviderExecutionFollowUpDeliveryFollowUpPlanSourceValidationIssue {
  code:
    | "source_follow_up_delivery_follow_up_contract_mismatch"
    | "source_follow_up_delivery_follow_up_payload_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpPlanSourceValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpPlanSourceValidationIssue[];
}

export interface ProviderExecutionFollowUpDeliveryFollowUpPlanValidationIssue {
  code:
    | "invalid_plan_schema_version"
    | "source_follow_up_schema_version_mismatch"
    | "request_key_mismatch"
    | "chain_key_mismatch"
    | "attempt_key_mismatch"
    | "unit_id_mismatch"
    | "follow_up_state_mismatch"
    | "follow_up_action_mismatch"
    | "follow_up_delivery_chain_closed_mismatch"
    | "preserved_result_artifact_handoff_mismatch"
    | "preserved_active_follow_up_item_mismatch"
    | "delivery_action_mismatch"
    | "final_follow_up_state_mismatch"
    | "upsert_presence_mismatch"
    | "upsert_operation_key_mismatch"
    | "upsert_payload_mismatch"
    | "automation_step_mismatch"
    | "decision_boundary_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpPlanValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpPlanValidationIssue[];
}

export interface ProviderExecutionFollowUpDeliveryFollowUpPlanContractValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpPlanValidationIssue[];
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlanSource(
  request: UnitReviewProviderExecutionRequest,
  decision: UnitReviewProviderExecutionDecision,
  attempt: UnitReviewProviderExecutionAttempt,
  sourceReceipt: UnitReviewProviderExecutionReceipt,
  sourceReconciliation: UnitReviewProviderExecutionReconciliation,
  followUp: UnitReviewProviderExecutionFollowUp,
  plan: UnitReviewProviderExecutionFollowUpPlan,
  followUpReceipt: UnitReviewProviderExecutionFollowUpReceipt,
  followUpReconciliation: UnitReviewProviderExecutionFollowUpReconciliation,
  followUpDeliveryFollowUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUp
): ProviderExecutionFollowUpDeliveryFollowUpPlanSourceValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpPlanSourceValidationIssue[] = [];
  const sourceValidation = validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpSource(
    request,
    decision,
    attempt,
    sourceReceipt,
    sourceReconciliation,
    followUp,
    plan,
    followUpReceipt,
    followUpReconciliation
  );
  const followUpValidation = validateUnitReviewProviderExecutionFollowUpDeliveryFollowUp(
    plan,
    followUpReconciliation,
    followUpDeliveryFollowUp
  );

  if (!sourceValidation.ok) {
    issues.push({
      code: "source_follow_up_delivery_follow_up_contract_mismatch",
      message:
        `Provider execution follow-up delivery follow-up plan source chain failed validation: ${sourceValidation.issues.map((issue) => issue.code).join(", ")}.`,
    });
  }

  if (!followUpValidation.ok) {
    issues.push({
      code: "source_follow_up_delivery_follow_up_payload_mismatch",
      message:
        `Provider execution follow-up delivery follow-up plan source payload failed validation: ${followUpValidation.issues.map((issue) => issue.code).join(", ")}.`,
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

export function buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan(
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUp
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan {
  const sourceContractValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpSourceContract(followUp);
  if (!sourceContractValidation.ok) {
    throw new Error(
      `Provider execution follow-up delivery follow-up plan source is invalid: ${sourceContractValidation.issues.map((issue) => issue.code).join(", ")}.`
    );
  }
  const upsert = followUp.follow_up_item
    ? {
        operation_key: buildFollowUpUpsertOperationKey(followUp.follow_up_item.item_key),
        item_key: followUp.follow_up_item.item_key,
        human_queue: followUp.follow_up_item.human_queue,
        title: followUp.follow_up_item.title,
        summary: followUp.follow_up_item.summary,
        primary_human_action: followUp.follow_up_item.primary_human_action,
        automation_step: followUp.follow_up_item.automation_step,
        labels: followUp.follow_up_item.labels,
      }
    : null;
  const finalFollowUpState = deriveFinalFollowUpState(followUp, upsert);

  return {
    schema_version:
      "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-plan/v0.1",
    source_follow_up_schema_version: followUp.schema_version,
    request_key: followUp.request_key,
    chain_key: followUp.chain_key,
    attempt_key: followUp.attempt_key,
    unit_id: followUp.unit_id,
    follow_up_state: followUp.follow_up_state,
    follow_up_action: followUp.follow_up_action,
    follow_up_delivery_chain_closed: followUp.follow_up_delivery_chain_closed,
    preserved_result_artifact_handoff: followUp.preserved_result_artifact_handoff,
    preserved_active_follow_up_item: followUp.preserved_active_follow_up_item,
    delivery_action: upsert ? "create_follow_up_inbox_item" : "none",
    final_follow_up_item_key: finalFollowUpState.item_key,
    final_follow_up_queue: finalFollowUpState.human_queue,
    upsert,
    automation_step: followUp.automation_step,
    decision_boundary: followUp.decision_boundary,
  };
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan(
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUp,
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan
): ProviderExecutionFollowUpDeliveryFollowUpPlanValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpPlanValidationIssue[] = [];
  const expected = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan(followUp);

  if (
    plan.schema_version !==
    "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-plan/v0.1"
  ) {
    issues.push({
      code: "invalid_plan_schema_version",
      message:
        "Provider execution follow-up delivery follow-up plan schema_version must be content-pipeline-review-provider-execution-follow-up-delivery-follow-up-plan/v0.1.",
    });
  }

  if (plan.source_follow_up_schema_version !== expected.source_follow_up_schema_version) {
    issues.push({
      code: "source_follow_up_schema_version_mismatch",
      message:
        "Provider execution follow-up delivery follow-up plan source_follow_up_schema_version must match the source follow-up schema_version.",
    });
  }

  if (plan.request_key !== expected.request_key) {
    issues.push({
      code: "request_key_mismatch",
      message:
        "Provider execution follow-up delivery follow-up plan request_key must match the source follow-up request_key.",
    });
  }

  if (plan.chain_key !== expected.chain_key) {
    issues.push({
      code: "chain_key_mismatch",
      message:
        "Provider execution follow-up delivery follow-up plan chain_key must match the source follow-up chain_key.",
    });
  }

  if (plan.attempt_key !== expected.attempt_key) {
    issues.push({
      code: "attempt_key_mismatch",
      message:
        "Provider execution follow-up delivery follow-up plan attempt_key must match the source follow-up attempt_key.",
    });
  }

  if (plan.unit_id !== expected.unit_id) {
    issues.push({
      code: "unit_id_mismatch",
      message:
        "Provider execution follow-up delivery follow-up plan unit_id must match the source follow-up unit_id.",
    });
  }

  if (plan.follow_up_state !== expected.follow_up_state) {
    issues.push({
      code: "follow_up_state_mismatch",
      message:
        "Provider execution follow-up delivery follow-up plan follow_up_state must match the source follow-up state.",
    });
  }

  if (plan.follow_up_action !== expected.follow_up_action) {
    issues.push({
      code: "follow_up_action_mismatch",
      message:
        "Provider execution follow-up delivery follow-up plan follow_up_action must match the source follow-up action.",
    });
  }

  if (
    plan.follow_up_delivery_chain_closed !== expected.follow_up_delivery_chain_closed
  ) {
    issues.push({
      code: "follow_up_delivery_chain_closed_mismatch",
      message:
        "Provider execution follow-up delivery follow-up plan follow_up_delivery_chain_closed must match the source follow-up closure state.",
    });
  }

  if (
    !resultArtifactHandoffsMatch(
      plan.preserved_result_artifact_handoff,
      expected.preserved_result_artifact_handoff
    )
  ) {
    issues.push({
      code: "preserved_result_artifact_handoff_mismatch",
      message:
        "Provider execution follow-up delivery follow-up plan preserved_result_artifact_handoff must match the source follow-up artifact handoff.",
    });
  }

  if (
    plan.preserved_active_follow_up_item.item_key !==
      expected.preserved_active_follow_up_item.item_key ||
    plan.preserved_active_follow_up_item.human_queue !==
      expected.preserved_active_follow_up_item.human_queue ||
    plan.preserved_active_follow_up_item.should_remain_open !==
      expected.preserved_active_follow_up_item.should_remain_open
  ) {
    issues.push({
      code: "preserved_active_follow_up_item_mismatch",
      message:
        "Provider execution follow-up delivery follow-up plan preserved_active_follow_up_item must match the source follow-up active item contract.",
    });
  }

  if (plan.delivery_action !== expected.delivery_action) {
    issues.push({
      code: "delivery_action_mismatch",
      message:
        "Provider execution follow-up delivery follow-up plan delivery_action must match whether the source follow-up includes a manual triage inbox item.",
    });
  }

  if (
    plan.final_follow_up_item_key !== expected.final_follow_up_item_key ||
    plan.final_follow_up_queue !== expected.final_follow_up_queue
  ) {
    issues.push({
      code: "final_follow_up_state_mismatch",
      message:
        "Provider execution follow-up delivery follow-up plan final follow-up item state must match the derived follow-up delivery target.",
    });
  }

  if ((plan.upsert === null) !== (expected.upsert === null)) {
    issues.push({
      code: "upsert_presence_mismatch",
      message:
        "Provider execution follow-up delivery follow-up plan upsert presence must match whether the source follow-up includes a follow_up_item.",
    });
  }

  if (plan.upsert && expected.upsert) {
    const expectedOperationKey = buildFollowUpUpsertOperationKey(plan.upsert.item_key);
    if (plan.upsert.operation_key !== expectedOperationKey) {
      issues.push({
        code: "upsert_operation_key_mismatch",
        message:
          "Provider execution follow-up delivery follow-up plan upsert.operation_key must match the deterministic follow-up delivery upsert key for upsert.item_key.",
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
          "Provider execution follow-up delivery follow-up plan upsert payload must match the source follow-up item exactly.",
      });
    }
  }

  if (plan.automation_step !== expected.automation_step) {
    issues.push({
      code: "automation_step_mismatch",
      message:
        "Provider execution follow-up delivery follow-up plan automation_step must match the source follow-up automation step.",
    });
  }

  if (
    plan.decision_boundary.requires_provider_execution !==
      expected.decision_boundary.requires_provider_execution ||
    plan.decision_boundary.requires_human_decision !==
      expected.decision_boundary.requires_human_decision ||
    plan.decision_boundary.provider_execution_allowed_without_human !==
      expected.decision_boundary.provider_execution_allowed_without_human
  ) {
    issues.push({
      code: "decision_boundary_mismatch",
      message:
        "Provider execution follow-up delivery follow-up plan decision_boundary must match the source follow-up decision boundary.",
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpPlanContract(
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan
): ProviderExecutionFollowUpDeliveryFollowUpPlanContractValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpPlanValidationIssue[] = [];

  if (
    plan.schema_version !==
    "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-plan/v0.1"
  ) {
    issues.push({
      code: "invalid_plan_schema_version",
      message:
        "Provider execution follow-up delivery follow-up plan schema_version must be content-pipeline-review-provider-execution-follow-up-delivery-follow-up-plan/v0.1.",
    });
  }

  const expectsUpsert = plan.delivery_action === "create_follow_up_inbox_item";
  if (expectsUpsert !== (plan.upsert !== null)) {
    issues.push({
      code: "upsert_presence_mismatch",
      message:
        "Provider execution follow-up delivery follow-up plan upsert presence must match delivery_action.",
    });
  }

  if (expectsUpsert && plan.upsert) {
    const expectedOperationKey = buildFollowUpUpsertOperationKey(plan.upsert.item_key);
    if (plan.upsert.operation_key !== expectedOperationKey) {
      issues.push({
        code: "upsert_operation_key_mismatch",
        message:
          "Provider execution follow-up delivery follow-up plan upsert.operation_key must match the deterministic follow-up upsert key for upsert.item_key.",
      });
    }

    if (
      plan.final_follow_up_item_key !== plan.upsert.item_key ||
      plan.final_follow_up_queue !== plan.upsert.human_queue
    ) {
      issues.push({
        code: "final_follow_up_state_mismatch",
        message:
          "Provider execution follow-up delivery follow-up plan final follow-up item state must match the upsert target when delivery_action creates a follow-up inbox item.",
      });
    }
  }

  if (!expectsUpsert) {
    const expectedFinalKey =
      plan.follow_up_state === "manual_follow_up_item_delivered"
        ? plan.preserved_active_follow_up_item.item_key
        : null;
    const expectedFinalQueue =
      plan.follow_up_state === "manual_follow_up_item_delivered"
        ? plan.preserved_active_follow_up_item.human_queue
        : null;
    if (
      plan.final_follow_up_item_key !== expectedFinalKey ||
      plan.final_follow_up_queue !== expectedFinalQueue
    ) {
      issues.push({
        code: "final_follow_up_state_mismatch",
        message:
          "Provider execution follow-up delivery follow-up plan final follow-up item state must match the preserved trusted active item when no upsert is scheduled.",
      });
    }
  }

  const expectedAutomationStep = expectsUpsert ? "open_inbox_item" : "none";
  if (plan.automation_step !== expectedAutomationStep) {
    issues.push({
      code: "automation_step_mismatch",
      message:
        "Provider execution follow-up delivery follow-up plan automation_step must match whether the plan schedules a new follow-up inbox item.",
    });
  }

  const expectedHumanDecision = expectsUpsert;
  if (
    plan.decision_boundary.requires_provider_execution !== false ||
    plan.decision_boundary.requires_human_decision !== expectedHumanDecision ||
    plan.decision_boundary.provider_execution_allowed_without_human !== false
  ) {
    issues.push({
      code: "decision_boundary_mismatch",
      message:
        "Provider execution follow-up delivery follow-up plan decision_boundary must match whether the plan schedules another human follow-up item.",
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

function deriveFinalFollowUpState(
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUp,
  upsert: UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan["upsert"]
): { item_key: string | null; human_queue: UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan["final_follow_up_queue"] } {
  if (upsert) {
    return {
      item_key: upsert.item_key,
      human_queue: upsert.human_queue,
    };
  }

  if (
    followUp.preserved_active_follow_up_item.item_key &&
    followUp.preserved_active_follow_up_item.human_queue &&
    followUp.preserved_active_follow_up_item.should_remain_open
  ) {
    return {
      item_key: followUp.preserved_active_follow_up_item.item_key,
      human_queue: followUp.preserved_active_follow_up_item.human_queue,
    };
  }

  return {
    item_key: null,
    human_queue: null,
  };
}

function resultArtifactHandoffsMatch(
  actual: UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan["preserved_result_artifact_handoff"],
  expected: UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan["preserved_result_artifact_handoff"]
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
  return `content-pipeline:provider-execution-follow-up-delivery-follow-up:upsert:${itemKey}`;
}
