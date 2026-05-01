import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp } from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up";
import {
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpContract,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSource,
} from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up";

type LatestRoutingSourceArgs = Parameters<
  typeof validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSource
>;
type LatestRoutingSourcePlan = LatestRoutingSourceArgs[26];
type LatestRoutingSourceReconciliation = LatestRoutingSourceArgs[28];

export type UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanAction =
  | "none"
  | "create_follow_up_inbox_item";

export interface UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan {
  schema_version: "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1";
  source_follow_up_schema_version: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["schema_version"];
  request_key: string;
  chain_key: string;
  attempt_key: string;
  unit_id: string;
  follow_up_state: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_state"];
  follow_up_action: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_action"];
  follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed"];
  preserved_result_artifact_handoff: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["preserved_result_artifact_handoff"];
  preserved_active_follow_up_item: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["preserved_active_follow_up_item"];
  delivery_action: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanAction;
  final_follow_up_item_key: string | null;
  final_follow_up_queue:
    | NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"]>["human_queue"]
    | null;
  upsert:
    | null
    | {
        operation_key: string;
        item_key: NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"]>["item_key"];
        human_queue: NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"]>["human_queue"];
        title: NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"]>["title"];
        summary: NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"]>["summary"];
        primary_human_action: NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"]>["primary_human_action"];
        automation_step: NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"]>["automation_step"];
        labels: string[];
      };
  automation_step: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["automation_step"];
  decision_boundary: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["decision_boundary"];
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSourceValidationIssue {
  code:
    | "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_contract_mismatch"
    | "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_payload_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSourceValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSourceValidationIssue[];
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanValidationIssue {
  code:
    | "invalid_plan_schema_version"
    | "source_follow_up_schema_version_mismatch"
    | "request_key_mismatch"
    | "chain_key_mismatch"
    | "attempt_key_mismatch"
    | "unit_id_mismatch"
    | "follow_up_state_mismatch"
    | "follow_up_action_mismatch"
    | "follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed_mismatch"
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

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanValidationIssue[];
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanContractValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanValidationIssue[];
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSource(
  ...args: [
    ...LatestRoutingSourceArgs,
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp
  ]
): ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSourceValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSourceValidationIssue[] = [];
  const sourceArgs = args.slice(0, -1) as unknown as LatestRoutingSourceArgs;
  const followUp = args.at(-1) as UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp;
  const sourcePlan = sourceArgs[26] as unknown as LatestRoutingSourcePlan;
  const sourceReconciliation = sourceArgs[28] as unknown as LatestRoutingSourceReconciliation;
  const sourceValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSource(
      ...sourceArgs
    );
  const followUpValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
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

export function buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan {
  const sourceContractValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpContract(
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
      "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1",
    source_follow_up_schema_version: followUp.schema_version,
    request_key: followUp.request_key,
    chain_key: followUp.chain_key,
    attempt_key: followUp.attempt_key,
    unit_id: followUp.unit_id,
    follow_up_state: followUp.follow_up_state,
    follow_up_action: followUp.follow_up_action,
    follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed:
      followUp.follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed,
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

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan
): ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanValidationIssue[] =
    [];
  const expected =
    buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
      followUp
    );

  if (
    plan.schema_version !==
    "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1"
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

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanContract(
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan
): ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanContractValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanValidationIssue[] =
    [];

  if (
    plan.schema_version !==
    "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1"
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
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  expected: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanValidationIssue[]
): void {
  const scalarChecks: Array<{
    code: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanValidationIssue["code"];
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
    { code: "follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed_mismatch", actual: plan.follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed, expected: expected.follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed, message: "closure state must match source follow-up." },
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
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
  upsert: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["upsert"]
): {
  item_key: string | null;
  human_queue: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan["final_follow_up_queue"];
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
  return `content-pipeline:provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up:upsert:${itemKey}`;
}

function jsonEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

