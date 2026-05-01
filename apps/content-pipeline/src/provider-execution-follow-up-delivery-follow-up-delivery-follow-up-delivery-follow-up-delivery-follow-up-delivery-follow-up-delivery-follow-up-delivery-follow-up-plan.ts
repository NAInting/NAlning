import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp } from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up";
import {
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpContract,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSource,
} from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up";

type LatestRoutingSourceArgs = Parameters<
  typeof validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSource
>;
type LatestRoutingSourcePlan = LatestRoutingSourceArgs[30];
type LatestRoutingSourceReconciliation = LatestRoutingSourceArgs[32];

export type UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanAction =
  | "none"
  | "create_follow_up_inbox_item";

export interface UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan {
  schema_version: "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1";
  source_follow_up_schema_version: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["schema_version"];
  request_key: string;
  chain_key: string;
  attempt_key: string;
  unit_id: string;
  follow_up_state: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_state"];
  follow_up_action: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_action"];
  follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed"];
  preserved_result_artifact_handoff: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["preserved_result_artifact_handoff"];
  preserved_active_follow_up_item: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["preserved_active_follow_up_item"];
  delivery_action: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanAction;
  final_follow_up_item_key: string | null;
  final_follow_up_queue:
    | NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"]>["human_queue"]
    | null;
  upsert:
    | null
    | {
        operation_key: string;
        item_key: NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"]>["item_key"];
        human_queue: NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"]>["human_queue"];
        title: NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"]>["title"];
        summary: NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"]>["summary"];
        primary_human_action: NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"]>["primary_human_action"];
        automation_step: NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"]>["automation_step"];
        labels: string[];
      };
  automation_step: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["automation_step"];
  decision_boundary: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["decision_boundary"];
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSourceValidationIssue {
  code:
    | "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_contract_mismatch"
    | "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_payload_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSourceValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSourceValidationIssue[];
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanValidationIssue {
  code:
    | "invalid_plan_schema_version"
    | "source_follow_up_schema_version_mismatch"
    | "request_key_mismatch"
    | "chain_key_mismatch"
    | "attempt_key_mismatch"
    | "unit_id_mismatch"
    | "follow_up_state_mismatch"
    | "follow_up_action_mismatch"
    | "follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed_mismatch"
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

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanValidationIssue[];
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanContractValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanValidationIssue[];
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSource(
  ...args: [
    ...LatestRoutingSourceArgs,
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp
  ]
): ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSourceValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSourceValidationIssue[] = [];
  const sourceArgs = args.slice(0, -1) as unknown as LatestRoutingSourceArgs;
  const followUp = args.at(-1) as UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp;
  const sourcePlan = sourceArgs[30] as unknown as LatestRoutingSourcePlan;
  const sourceReconciliation = sourceArgs[32] as unknown as LatestRoutingSourceReconciliation;
  const sourceValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSource(
      ...sourceArgs
    );
  const followUpValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
      sourcePlan,
      sourceReconciliation,
      followUp
    );

  if (!sourceValidation.ok) {
    issues.push({
      code: "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_contract_mismatch",
      message: `Provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up plan source chain failed validation: ${sourceValidation.issues.map((issue) => issue.code).join(", ")}.`,
    });
  }

  if (!followUpValidation.ok) {
    issues.push({
      code: "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_payload_mismatch",
      message: `Provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up plan source payload failed validation: ${followUpValidation.issues.map((issue) => issue.code).join(", ")}.`,
    });
  }

  return { ok: issues.length === 0, issues };
}

export function buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan {
  const sourceContractValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpContract(
      followUp
    );
  if (!sourceContractValidation.ok) {
    throw new Error(
      `Provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up plan source is invalid: ${sourceContractValidation.issues.map((issue) => issue.code).join(", ")}.`
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
      "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1",
    source_follow_up_schema_version: followUp.schema_version,
    request_key: followUp.request_key,
    chain_key: followUp.chain_key,
    attempt_key: followUp.attempt_key,
    unit_id: followUp.unit_id,
    follow_up_state: followUp.follow_up_state,
    follow_up_action: followUp.follow_up_action,
    follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed:
      followUp.follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed,
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

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan
): ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanValidationIssue[] =
    [];
  const expected =
    buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
      followUp
    );

  if (
    plan.schema_version !==
    "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1"
  ) {
    issues.push({
      code: "invalid_plan_schema_version",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up plan schema_version must match v0.1.",
    });
  }

  pushMismatchIssues(plan, expected, issues);
  return { ok: issues.length === 0, issues };
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanContract(
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan
): ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanContractValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanValidationIssue[] =
    [];

  if (
    plan.schema_version !==
    "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1"
  ) {
    issues.push({
      code: "invalid_plan_schema_version",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up plan schema_version must match v0.1.",
    });
  }

  const expectsUpsert = plan.delivery_action === "create_follow_up_inbox_item";
  if (expectsUpsert !== (plan.upsert !== null)) {
    issues.push({
      code: "upsert_presence_mismatch",
      message: "Provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up plan upsert presence must match delivery_action.",
    });
  }

  if (expectsUpsert && plan.upsert) {
    const expectedOperationKey = buildFollowUpUpsertOperationKey(plan.upsert.item_key);
    if (plan.upsert.operation_key !== expectedOperationKey) {
      issues.push({
        code: "upsert_operation_key_mismatch",
        message:
          "Provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up plan upsert.operation_key must match the deterministic follow-up upsert key.",
      });
    }

    if (
      plan.final_follow_up_item_key !== plan.upsert.item_key ||
      plan.final_follow_up_queue !== plan.upsert.human_queue
    ) {
      issues.push({
        code: "final_follow_up_state_mismatch",
        message:
          "Provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up plan final follow-up state must match the upsert target.",
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
          "Provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up plan final follow-up state must match the preserved active item when no upsert is scheduled.",
      });
    }
  }

  const expectedAutomationStep = expectsUpsert ? "open_inbox_item" : "none";
  if (plan.automation_step !== expectedAutomationStep) {
    issues.push({
      code: "automation_step_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up plan automation_step must match whether an upsert is scheduled.",
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
        "Provider execution follow-up delivery follow-up delivery follow-up delivery follow-up delivery follow-up plan decision boundary must remain no-spend and match human follow-up state.",
    });
  }

  return { ok: issues.length === 0, issues };
}

function pushMismatchIssues(
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  expected: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanValidationIssue[]
): void {
  const scalarChecks: Array<{
    code: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanValidationIssue["code"];
    actual: unknown;
    expected: unknown;
    message: string;
  }> = [
    { code: "source_follow_up_schema_version_mismatch", actual: plan.source_follow_up_schema_version, expected: expected.source_follow_up_schema_version, message: "source_follow_up_schema_version must match source follow-up." },
    { code: "request_key_mismatch", actual: plan.request_key, expected: expected.request_key, message: "request_key must match source follow-up." },
    { code: "chain_key_mismatch", actual: plan.chain_key, expected: expected.chain_key, message: "chain_key must match source follow-up." },
    { code: "attempt_key_mismatch", actual: plan.attempt_key, expected: expected.attempt_key, message: "attempt_key must match source follow-up." },
    { code: "unit_id_mismatch", actual: plan.unit_id, expected: expected.unit_id, message: "unit_id must match source follow-up." },
    { code: "follow_up_state_mismatch", actual: plan.follow_up_state, expected: expected.follow_up_state, message: "follow_up_state must match source follow-up." },
    { code: "follow_up_action_mismatch", actual: plan.follow_up_action, expected: expected.follow_up_action, message: "follow_up_action must match source follow-up." },
    { code: "follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed_mismatch", actual: plan.follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed, expected: expected.follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed, message: "closure state must match source follow-up." },
    { code: "delivery_action_mismatch", actual: plan.delivery_action, expected: expected.delivery_action, message: "delivery_action must match source follow-up item presence." },
    { code: "final_follow_up_state_mismatch", actual: [plan.final_follow_up_item_key, plan.final_follow_up_queue], expected: [expected.final_follow_up_item_key, expected.final_follow_up_queue], message: "final follow-up state must match derived target." },
    { code: "automation_step_mismatch", actual: plan.automation_step, expected: expected.automation_step, message: "automation_step must match source follow-up." },
  ];

  for (const check of scalarChecks) {
    if (!jsonEqual(check.actual, check.expected)) {
      issues.push({ code: check.code, message: check.message });
    }
  }

  if (!jsonEqual(plan.preserved_result_artifact_handoff, expected.preserved_result_artifact_handoff)) {
    issues.push({
      code: "preserved_result_artifact_handoff_mismatch",
      message: "preserved_result_artifact_handoff must match the source follow-up artifact handoff.",
    });
  }

  if (!jsonEqual(plan.preserved_active_follow_up_item, expected.preserved_active_follow_up_item)) {
    issues.push({
      code: "preserved_active_follow_up_item_mismatch",
      message: "preserved_active_follow_up_item must match the source follow-up active item contract.",
    });
  }

  if ((plan.upsert === null) !== (expected.upsert === null)) {
    issues.push({
      code: "upsert_presence_mismatch",
      message: "upsert presence must match whether the source follow-up includes a follow_up_item.",
    });
  } else if (plan.upsert && expected.upsert) {
    if (plan.upsert.operation_key !== buildFollowUpUpsertOperationKey(plan.upsert.item_key)) {
      issues.push({
        code: "upsert_operation_key_mismatch",
        message: "upsert.operation_key must match the deterministic upsert key for upsert.item_key.",
      });
    }

    if (!jsonEqual(plan.upsert, expected.upsert)) {
      issues.push({
        code: "upsert_payload_mismatch",
        message: "upsert payload must match the source follow-up item exactly.",
      });
    }
  }

  if (!jsonEqual(plan.decision_boundary, expected.decision_boundary)) {
    issues.push({
      code: "decision_boundary_mismatch",
      message: "decision_boundary must match the source follow-up decision boundary.",
    });
  }
}

function deriveFinalFollowUpState(
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
  upsert: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["upsert"]
): {
  item_key: string | null;
  human_queue: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["final_follow_up_queue"];
} {
  if (upsert) {
    return { item_key: upsert.item_key, human_queue: upsert.human_queue };
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

  return { item_key: null, human_queue: null };
}

function buildFollowUpUpsertOperationKey(itemKey: string): string {
  return `content-pipeline:provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up:upsert:${itemKey}`;
}

function jsonEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}





