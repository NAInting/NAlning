import type { UnitReviewPrimaryHumanAction } from "./orchestration-guidance";
import type {
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan as SourceFollowUpPlan,
} from "./provider-execution-follow-up-n13-plan";
import {
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlan as validateSourceFollowUpPlan,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpPlanSource as validateSourceFollowUpPlanSource,
} from "./provider-execution-follow-up-n13-plan";
import type {
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReceipt as SourceFollowUpReceipt,
} from "./provider-execution-follow-up-n13-receipt";
import type {
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation as SourceFollowUpReconciliation,
} from "./provider-execution-follow-up-n13-reconciliation";
import {
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation as validateSourceFollowUpReconciliation,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationSource as validateSourceFollowUpReconciliationSource,
} from "./provider-execution-follow-up-n13-reconciliation";

type SourcePlanArgs = Parameters<typeof validateSourceFollowUpPlanSource>;
type SourceFollowUp = Parameters<typeof validateSourceFollowUpPlan>[0];

const SCHEMA_VERSION =
  "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up/v0.1" as const;
const SOURCE_PLAN_SCHEMA_VERSION =
  "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1" as const;
const SOURCE_RECEIPT_SCHEMA_VERSION: SourceFollowUpReceipt["schema_version"] =
  "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt/v0.1";
const SOURCE_RECONCILIATION_SCHEMA_VERSION =
  "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation/v0.1" as const;
const SOURCE_REPAIR_RECOMMENDATION =
  "manual_repair_provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up" as const;
const DEPTH_LABEL =
  "provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up";

export type UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState =
  | "result_artifact_handoff_ready"
  | "manual_follow_up_item_delivered"
  | "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required"
  | "receipt_triage_required";

export type UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpAction =
  | "defer_to_result_artifact_contract"
  | "none"
  | "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_item"
  | "open_manual_receipt_triage_item";

export interface UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp {
  schema_version: typeof SCHEMA_VERSION;
  source_follow_up_plan_schema_version: SourceFollowUpPlan["schema_version"];
  source_follow_up_reconciliation_schema_version: SourceFollowUpReconciliation["schema_version"];
  request_key: string;
  chain_key: string;
  attempt_key: string;
  unit_id: string;
  source_follow_up_state: SourceFollowUpPlan["follow_up_state"];
  source_follow_up_action: SourceFollowUpPlan["follow_up_action"];
  source_reconciliation_status: SourceFollowUpReconciliation["reconciliation_status"];
  source_recommended_follow_up: SourceFollowUpReconciliation["recommended_follow_up"];
  source_delivery_status: SourceFollowUpReconciliation["delivery_status"];
  follow_up_state: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState;
  follow_up_action: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpAction;
  follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed: boolean;
  preserved_result_artifact_handoff: SourceFollowUpReconciliation["result_artifact_handoff"];
  result_artifact_handoff: SourceFollowUpReconciliation["result_artifact_handoff"];
  preserved_active_follow_up_item: SourceFollowUpReconciliation["preserved_active_follow_up_item"];
  active_follow_up_item: {
    item_key: string | null;
    human_queue: SourceFollowUpReconciliation["final_follow_up_queue"];
    should_remain_open: boolean;
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

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceValidationIssue {
  code:
    | "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_plan_contract_mismatch"
    | "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_reconciliation_contract_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceValidationIssue[];
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpContractValidationIssue {
  code:
    | "invalid_follow_up_schema_version"
    | "source_reconciliation_contract_mismatch"
    | "follow_up_state_mismatch"
    | "follow_up_action_mismatch"
    | "follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed_mismatch"
    | "preserved_result_artifact_handoff_contract_mismatch"
    | "result_artifact_handoff_contract_mismatch"
    | "preserved_active_follow_up_item_contract_mismatch"
    | "active_follow_up_item_contract_mismatch"
    | "automation_step_mismatch"
    | "decision_boundary_mismatch"
    | "follow_up_item_contract_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpContractValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpContractValidationIssue[];
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpValidationIssue {
  code:
    | "invalid_follow_up_schema_version"
    | "source_follow_up_plan_schema_version_mismatch"
    | "source_follow_up_reconciliation_schema_version_mismatch"
    | "request_key_mismatch"
    | "chain_key_mismatch"
    | "attempt_key_mismatch"
    | "unit_id_mismatch"
    | "source_follow_up_state_mismatch"
    | "source_follow_up_action_mismatch"
    | "source_reconciliation_status_mismatch"
    | "source_recommended_follow_up_mismatch"
    | "source_delivery_status_mismatch"
    | "follow_up_state_mismatch"
    | "follow_up_action_mismatch"
    | "follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed_mismatch"
    | "preserved_result_artifact_handoff_mismatch"
    | "result_artifact_handoff_mismatch"
    | "preserved_active_follow_up_item_mismatch"
    | "active_follow_up_item_mismatch"
    | "automation_step_mismatch"
    | "decision_boundary_mismatch"
    | "follow_up_item_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpValidationIssue[];
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSource(
  ...args: [
    ...SourcePlanArgs,
    SourceFollowUpPlan,
    SourceFollowUpReceipt,
    SourceFollowUpReconciliation
  ]
): ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceValidationIssue[] =
    [];
  const sourceArgs = args.slice(0, -3) as unknown as SourcePlanArgs;
  const sourceFollowUp = sourceArgs.at(-1) as SourceFollowUp;
  const plan = args.at(-3) as SourceFollowUpPlan;
  const receipt = args.at(-2) as SourceFollowUpReceipt;
  const reconciliation = args.at(-1) as SourceFollowUpReconciliation;
  const planSourceValidation = validateSourceFollowUpPlanSource(...sourceArgs);
  const planPayloadValidation = validateSourceFollowUpPlan(sourceFollowUp, plan);
  const reconciliationSourceValidation = validateSourceFollowUpReconciliationSource(
    ...sourceArgs,
    plan,
    receipt
  );
  const reconciliationValidation = validateSourceFollowUpReconciliation(
    plan,
    receipt,
    reconciliation
  );

  if (!planSourceValidation.ok || !planPayloadValidation.ok) {
    const issueCodes = [
      ...planSourceValidation.issues.map((issue) => issue.code),
      ...planPayloadValidation.issues.map((issue) => issue.code),
    ];
    issues.push({
      code: "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_plan_contract_mismatch",
      message:
        `Newest downstream provider post-delivery executor-ready trio routing source plan chain failed validation: ${issueCodes.join(", ")}.`,
    });
  }

  if (!reconciliationSourceValidation.ok || !reconciliationValidation.ok) {
    const issueCodes = [
      ...reconciliationSourceValidation.issues.map((issue) => issue.code),
      ...reconciliationValidation.issues.map((issue) => issue.code),
    ];
    issues.push({
      code: "source_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_reconciliation_contract_mismatch",
      message:
        `Newest downstream provider post-delivery executor-ready trio routing source reconciliation chain failed validation: ${issueCodes.join(", ")}.`,
    });
  }

  return { ok: issues.length === 0, issues };
}

export function buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
  plan: SourceFollowUpPlan,
  reconciliation: SourceFollowUpReconciliation
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp {
  const sourceContractValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceContract(
      plan,
      reconciliation
    );
  if (!sourceContractValidation.ok) {
    throw new Error(
      `Newest downstream provider post-delivery executor-ready trio routing source is invalid: ${sourceContractValidation.issues.map((issue) => issue.code).join(", ")}.`
    );
  }

  const followUpState = deriveFollowUpState(plan, reconciliation);
  const followUpAction = deriveFollowUpAction(followUpState);
  const followUpItem = buildDerivedFollowUpItem(plan, reconciliation, followUpState);

  return {
    schema_version: SCHEMA_VERSION,
    source_follow_up_plan_schema_version: SOURCE_PLAN_SCHEMA_VERSION,
    source_follow_up_reconciliation_schema_version: SOURCE_RECONCILIATION_SCHEMA_VERSION,
    request_key: plan.request_key,
    chain_key: plan.chain_key,
    attempt_key: plan.attempt_key,
    unit_id: plan.unit_id,
    source_follow_up_state: plan.follow_up_state,
    source_follow_up_action: plan.follow_up_action,
    source_reconciliation_status: reconciliation.reconciliation_status,
    source_recommended_follow_up: reconciliation.recommended_follow_up,
    source_delivery_status: reconciliation.delivery_status,
    follow_up_state: followUpState,
    follow_up_action: followUpAction,
    follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed:
      followUpState === "result_artifact_handoff_ready" ||
      followUpState === "manual_follow_up_item_delivered",
    preserved_result_artifact_handoff: reconciliation.result_artifact_handoff,
    result_artifact_handoff:
      followUpState === "result_artifact_handoff_ready"
        ? reconciliation.result_artifact_handoff
        : null,
    preserved_active_follow_up_item: reconciliation.preserved_active_follow_up_item,
    active_follow_up_item: deriveActiveFollowUpItem(reconciliation, followUpState),
    automation_step: followUpItem === null ? "none" : "open_inbox_item",
    decision_boundary: {
      requires_provider_execution: false,
      requires_human_decision: followUpItem !== null,
      provider_execution_allowed_without_human: false,
    },
    follow_up_item: followUpItem,
  };
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
  plan: SourceFollowUpPlan,
  reconciliation: SourceFollowUpReconciliation,
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp
): ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpValidationIssue[] =
    [];
  const expected =
    buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
      plan,
      reconciliation
    );
  const checks: Array<{
    code: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpValidationIssue["code"];
    actual: unknown;
    expected: unknown;
    message: string;
  }> = [
    { code: "invalid_follow_up_schema_version", actual: followUp.schema_version, expected: expected.schema_version, message: "schema_version must match the newest downstream provider post-delivery executor-ready trio routing contract." },
    { code: "source_follow_up_plan_schema_version_mismatch", actual: followUp.source_follow_up_plan_schema_version, expected: expected.source_follow_up_plan_schema_version, message: "source_follow_up_plan_schema_version must match the source plan schema_version." },
    { code: "source_follow_up_reconciliation_schema_version_mismatch", actual: followUp.source_follow_up_reconciliation_schema_version, expected: expected.source_follow_up_reconciliation_schema_version, message: "source_follow_up_reconciliation_schema_version must match the source reconciliation schema_version." },
    { code: "request_key_mismatch", actual: followUp.request_key, expected: expected.request_key, message: "request_key must match the source plan/reconciliation chain." },
    { code: "chain_key_mismatch", actual: followUp.chain_key, expected: expected.chain_key, message: "chain_key must match the source plan/reconciliation chain." },
    { code: "attempt_key_mismatch", actual: followUp.attempt_key, expected: expected.attempt_key, message: "attempt_key must match the source plan/reconciliation chain." },
    { code: "unit_id_mismatch", actual: followUp.unit_id, expected: expected.unit_id, message: "unit_id must match the source plan/reconciliation chain." },
    { code: "source_follow_up_state_mismatch", actual: followUp.source_follow_up_state, expected: expected.source_follow_up_state, message: "source_follow_up_state must match the source follow-up plan state." },
    { code: "source_follow_up_action_mismatch", actual: followUp.source_follow_up_action, expected: expected.source_follow_up_action, message: "source_follow_up_action must match the source follow-up plan action." },
    { code: "source_reconciliation_status_mismatch", actual: followUp.source_reconciliation_status, expected: expected.source_reconciliation_status, message: "source_reconciliation_status must match the source reconciliation status." },
    { code: "source_recommended_follow_up_mismatch", actual: followUp.source_recommended_follow_up, expected: expected.source_recommended_follow_up, message: "source_recommended_follow_up must match the source reconciliation recommendation." },
    { code: "source_delivery_status_mismatch", actual: followUp.source_delivery_status, expected: expected.source_delivery_status, message: "source_delivery_status must match trusted source delivery status." },
    { code: "follow_up_state_mismatch", actual: followUp.follow_up_state, expected: expected.follow_up_state, message: "follow_up_state must match the derived routing state." },
    { code: "follow_up_action_mismatch", actual: followUp.follow_up_action, expected: expected.follow_up_action, message: "follow_up_action must match the derived routing action." },
    { code: "follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed_mismatch", actual: followUp.follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed, expected: expected.follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed, message: "closure flag must match the derived routing state." },
    { code: "preserved_result_artifact_handoff_mismatch", actual: followUp.preserved_result_artifact_handoff, expected: expected.preserved_result_artifact_handoff, message: "preserved_result_artifact_handoff must match trusted source artifact context." },
    { code: "result_artifact_handoff_mismatch", actual: followUp.result_artifact_handoff, expected: expected.result_artifact_handoff, message: "result_artifact_handoff must match trusted artifact handoff semantics." },
    { code: "preserved_active_follow_up_item_mismatch", actual: followUp.preserved_active_follow_up_item, expected: expected.preserved_active_follow_up_item, message: "preserved_active_follow_up_item must match trusted source active-item context." },
    { code: "active_follow_up_item_mismatch", actual: followUp.active_follow_up_item, expected: expected.active_follow_up_item, message: "active_follow_up_item must match the derived current active-item state." },
    { code: "automation_step_mismatch", actual: followUp.automation_step, expected: expected.automation_step, message: "automation_step must match whether downstream manual triage is required." },
    { code: "decision_boundary_mismatch", actual: followUp.decision_boundary, expected: expected.decision_boundary, message: "decision_boundary must match whether downstream manual triage is required." },
    { code: "follow_up_item_mismatch", actual: followUp.follow_up_item, expected: expected.follow_up_item, message: "follow_up_item must match the deterministic manual-routing payload." },
  ];

  for (const check of checks) {
    if (!jsonEqual(check.actual, check.expected)) {
      issues.push({ code: check.code, message: check.message });
    }
  }

  return { ok: issues.length === 0, issues };
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceContract(
  plan: SourceFollowUpPlan,
  reconciliation: SourceFollowUpReconciliation
): ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpContractValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpContractValidationIssue[] =
    [];
  const expectedState = deriveExpectedStateFromSourceContract(
    plan.follow_up_state,
    reconciliation.reconciliation_status,
    reconciliation.recommended_follow_up
  );

  if (plan.schema_version !== SOURCE_PLAN_SCHEMA_VERSION) {
    issues.push({
      code: "invalid_follow_up_schema_version",
      message: "Source follow-up plan schema_version must match the latest executor-ready plan contract.",
    });
  }

  if (reconciliation.schema_version !== SOURCE_RECONCILIATION_SCHEMA_VERSION) {
    issues.push({
      code: "source_reconciliation_contract_mismatch",
      message: "Source reconciliation schema_version must match the latest executor-ready reconciliation contract.",
    });
  }

  const sourceLinkageChecks: Array<{
    actual: unknown;
    expected: unknown;
    message: string;
  }> = [
    {
      actual: reconciliation.source_follow_up_plan_schema_version,
      expected: plan.schema_version,
      message: "Source reconciliation must reference the exact source plan schema_version.",
    },
    {
      actual: reconciliation.source_follow_up_receipt_schema_version,
      expected: SOURCE_RECEIPT_SCHEMA_VERSION,
      message: "Source reconciliation must reference the exact source receipt schema_version.",
    },
    {
      actual: reconciliation.request_key,
      expected: plan.request_key,
      message: "Source reconciliation request_key must match the source plan.",
    },
    {
      actual: reconciliation.chain_key,
      expected: plan.chain_key,
      message: "Source reconciliation chain_key must match the source plan.",
    },
    {
      actual: reconciliation.attempt_key,
      expected: plan.attempt_key,
      message: "Source reconciliation attempt_key must match the source plan.",
    },
    {
      actual: reconciliation.unit_id,
      expected: plan.unit_id,
      message: "Source reconciliation unit_id must match the source plan.",
    },
    {
      actual: reconciliation.follow_up_state,
      expected: plan.follow_up_state,
      message: "Source reconciliation follow_up_state must match the source plan.",
    },
    {
      actual: reconciliation.follow_up_action,
      expected: plan.follow_up_action,
      message: "Source reconciliation follow_up_action must match the source plan.",
    },
    {
      actual: reconciliation.result_artifact_handoff,
      expected: plan.preserved_result_artifact_handoff,
      message: "Source reconciliation result_artifact_handoff must match the source plan preserved artifact context.",
    },
    {
      actual: reconciliation.preserved_active_follow_up_item,
      expected: plan.preserved_active_follow_up_item,
      message: "Source reconciliation preserved_active_follow_up_item must match the source plan.",
    },
  ];

  for (const check of sourceLinkageChecks) {
    if (!jsonEqual(check.actual, check.expected)) {
      issues.push({
        code: "source_reconciliation_contract_mismatch",
        message: check.message,
      });
    }
  }

  if (
    reconciliation.recommended_follow_up === "manual_receipt_triage" &&
    (reconciliation.receipt_validation_ok !== false ||
      reconciliation.receipt_validation_issue_codes.length === 0 ||
      reconciliation.delivery_status !== null ||
      reconciliation.final_follow_up_item_key !== null ||
      reconciliation.final_follow_up_queue !== null ||
      reconciliation.unresolved_operations.length !== 0)
  ) {
    issues.push({
      code: "source_reconciliation_contract_mismatch",
      message:
        "Receipt-triage source reconciliation must expose invalid receipt issues while clearing untrusted delivery status, final target, and unresolved operations.",
    });
  }

  if (
    reconciliation.recommended_follow_up !== "manual_receipt_triage" &&
    reconciliation.receipt_validation_ok !== true
  ) {
    issues.push({
      code: "source_reconciliation_contract_mismatch",
      message:
        "Non-receipt-triage source reconciliation must be backed by a valid source receipt.",
    });
  }

  if (expectedState === null) {
    issues.push({
      code: "source_reconciliation_contract_mismatch",
      message: "Source follow-up state and reconciliation recommendation must form a valid routing pair.",
    });
  }

  if (
    expectedState === "result_artifact_handoff_ready" &&
    reconciliation.result_artifact_handoff === null
  ) {
    issues.push({
      code: "result_artifact_handoff_contract_mismatch",
      message: "Source reconciliation must preserve result_artifact_handoff on trusted artifact-handoff branches.",
    });
  }

  if (
    expectedState === "manual_follow_up_item_delivered" &&
    (reconciliation.final_follow_up_item_key === null ||
      reconciliation.final_follow_up_queue === null)
  ) {
    issues.push({
      code: "active_follow_up_item_contract_mismatch",
      message: "Source reconciliation must expose the trusted final follow-up item on delivered manual-follow-up branches.",
    });
  }

  if (
    expectedState !== "manual_follow_up_item_delivered" &&
    reconciliation.final_follow_up_item_key !== null
  ) {
    issues.push({
      code: "active_follow_up_item_contract_mismatch",
      message: "Source reconciliation must clear current follow-up targets outside delivered manual-follow-up branches.",
    });
  }

  return { ok: issues.length === 0, issues };
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpContract(
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp
): ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpContractValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpContractValidationIssue[] =
    [];
  const expectedState = deriveExpectedStateFromSourceContract(
    followUp.source_follow_up_state,
    followUp.source_reconciliation_status,
    followUp.source_recommended_follow_up
  );
  const expectedFollowUpItem = buildExpectedFollowUpItemFromCurrentContract(
    followUp,
    expectedState
  );

  if (followUp.schema_version !== SCHEMA_VERSION) {
    issues.push({
      code: "invalid_follow_up_schema_version",
      message: "schema_version must match the newest downstream provider post-delivery executor-ready trio routing contract.",
    });
  }

  if (expectedState === null) {
    issues.push({
      code: "source_reconciliation_contract_mismatch",
      message: "Source follow-up state and reconciliation recommendation must form a valid routing pair.",
    });
  }

  if (expectedState !== null && followUp.follow_up_state !== expectedState) {
    issues.push({
      code: "follow_up_state_mismatch",
      message: "follow_up_state must match the source-derived routing state.",
    });
  }

  const expectedAction =
    expectedState === null ? null : deriveFollowUpAction(expectedState);
  if (expectedAction !== null && followUp.follow_up_action !== expectedAction) {
    issues.push({
      code: "follow_up_action_mismatch",
      message: "follow_up_action must match the source-derived routing action.",
    });
  }

  const expectedClosed =
    expectedState === "result_artifact_handoff_ready" ||
    expectedState === "manual_follow_up_item_delivered";
  if (
    expectedState !== null &&
    followUp.follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed !==
      expectedClosed
  ) {
    issues.push({
      code: "follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_chain_closed_mismatch",
      message: "Closure flag must match the source-derived routing state.",
    });
  }

  if (
    expectedState === "result_artifact_handoff_ready" &&
    followUp.preserved_result_artifact_handoff === null
  ) {
    issues.push({
      code: "preserved_result_artifact_handoff_contract_mismatch",
      message: "Trusted artifact handoff branches must preserve result_artifact_handoff.",
    });
  }

  if (
    expectedState === "result_artifact_handoff_ready" &&
    !jsonEqual(followUp.result_artifact_handoff, followUp.preserved_result_artifact_handoff)
  ) {
    issues.push({
      code: "result_artifact_handoff_contract_mismatch",
      message: "result_artifact_handoff must match preserved_result_artifact_handoff on trusted artifact-handoff branches.",
    });
  }

  if (
    expectedState !== "result_artifact_handoff_ready" &&
    followUp.result_artifact_handoff !== null
  ) {
    issues.push({
      code: "result_artifact_handoff_contract_mismatch",
      message: "result_artifact_handoff must be null outside trusted artifact-handoff branches.",
    });
  }

  if (
    expectedState === "manual_follow_up_item_delivered" &&
    (followUp.active_follow_up_item.item_key === null ||
      followUp.active_follow_up_item.human_queue === null ||
      followUp.active_follow_up_item.should_remain_open !== true)
  ) {
    issues.push({
      code: "active_follow_up_item_contract_mismatch",
      message: "Delivered manual-follow-up branches must expose the trusted active follow-up item.",
    });
  }

  const expectedActiveItem =
    expectedState === "manual_follow_up_item_delivered"
      ? null
      : { item_key: null, human_queue: null, should_remain_open: false };
  if (expectedActiveItem !== null && !jsonEqual(followUp.active_follow_up_item, expectedActiveItem)) {
    issues.push({
      code: "active_follow_up_item_contract_mismatch",
      message: "active_follow_up_item must be cleared outside delivered manual-follow-up branches.",
    });
  }

  const expectedAutomationStep =
    expectedFollowUpItem === null ? "none" : "open_inbox_item";
  if (followUp.automation_step !== expectedAutomationStep) {
    issues.push({
      code: "automation_step_mismatch",
      message: "automation_step must match follow_up_item presence.",
    });
  }

  if (
    followUp.decision_boundary.requires_provider_execution !== false ||
    followUp.decision_boundary.requires_human_decision !==
      (expectedFollowUpItem !== null) ||
    followUp.decision_boundary.provider_execution_allowed_without_human !== false
  ) {
    issues.push({
      code: "decision_boundary_mismatch",
      message: "decision_boundary must keep provider execution disabled and expose human-decision needs only for manual follow-up items.",
    });
  }

  if (
    !currentContractFollowUpItemMatches(
      followUp.follow_up_item,
      expectedFollowUpItem,
      expectedState
    )
  ) {
    issues.push({
      code: "follow_up_item_contract_mismatch",
      message: "follow_up_item must match the deterministic manual-routing payload for the declared state.",
    });
  }

  return { ok: issues.length === 0, issues };
}

function deriveFollowUpState(
  plan: SourceFollowUpPlan,
  reconciliation: SourceFollowUpReconciliation
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState {
  if (!reconciliation.receipt_validation_ok) {
    return "receipt_triage_required";
  }

  if (reconciliation.recommended_follow_up === "manual_receipt_triage") {
    return "receipt_triage_required";
  }

  if (
    reconciliation.reconciliation_status === "action_required" &&
    reconciliation.recommended_follow_up === SOURCE_REPAIR_RECOMMENDATION
  ) {
    return "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required";
  }

  if (
    reconciliation.reconciliation_status === "closed" &&
    reconciliation.recommended_follow_up === "none"
  ) {
    return plan.follow_up_state === "result_artifact_handoff_ready"
      ? "result_artifact_handoff_ready"
      : "manual_follow_up_item_delivered";
  }

  throw new Error(
    `Unsupported newest downstream provider post-delivery executor-ready trio routing combination: ${reconciliation.reconciliation_status}/${reconciliation.recommended_follow_up}.`
  );
}

function deriveExpectedStateFromSourceContract(
  sourceFollowUpState: SourceFollowUpPlan["follow_up_state"],
  sourceReconciliationStatus: SourceFollowUpReconciliation["reconciliation_status"],
  sourceRecommendedFollowUp: SourceFollowUpReconciliation["recommended_follow_up"]
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState | null {
  if (
    sourceReconciliationStatus === "closed" &&
    sourceRecommendedFollowUp === "none"
  ) {
    return sourceFollowUpState === "result_artifact_handoff_ready"
      ? "result_artifact_handoff_ready"
      : "manual_follow_up_item_delivered";
  }

  if (
    sourceReconciliationStatus === "action_required" &&
    sourceRecommendedFollowUp === SOURCE_REPAIR_RECOMMENDATION
  ) {
    return "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required";
  }

  if (
    sourceReconciliationStatus === "action_required" &&
    sourceRecommendedFollowUp === "manual_receipt_triage"
  ) {
    return "receipt_triage_required";
  }

  return null;
}

function deriveFollowUpAction(
  followUpState: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpAction {
  switch (followUpState) {
    case "result_artifact_handoff_ready":
      return "defer_to_result_artifact_contract";
    case "manual_follow_up_item_delivered":
      return "none";
    case "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required":
      return "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_item";
    case "receipt_triage_required":
      return "open_manual_receipt_triage_item";
  }
}

function deriveActiveFollowUpItem(
  reconciliation: SourceFollowUpReconciliation,
  followUpState: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["active_follow_up_item"] {
  if (followUpState !== "manual_follow_up_item_delivered") {
    return {
      item_key: null,
      human_queue: null,
      should_remain_open: false,
    };
  }

  return {
    item_key: reconciliation.final_follow_up_item_key,
    human_queue: reconciliation.final_follow_up_queue,
    should_remain_open: reconciliation.final_follow_up_item_key !== null,
  };
}

function buildDerivedFollowUpItem(
  plan: SourceFollowUpPlan,
  reconciliation: SourceFollowUpReconciliation,
  followUpState: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"] {
  switch (followUpState) {
    case "result_artifact_handoff_ready":
    case "manual_follow_up_item_delivered":
      return null;
    case "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required":
      return buildFollowUpItem(
        plan,
        reconciliation,
        followUpState,
        "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_item"
      );
    case "receipt_triage_required":
      return buildFollowUpItem(
        plan,
        reconciliation,
        followUpState,
        "open_manual_receipt_triage_item"
      );
  }
}

function buildFollowUpItem(
  plan: SourceFollowUpPlan,
  reconciliation: SourceFollowUpReconciliation,
  followUpState: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState,
    | "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required"
    | "receipt_triage_required"
  >,
  followUpAction: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpAction,
    | "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_item"
    | "open_manual_receipt_triage_item"
  >
): NonNullable<
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"]
> {
  return {
    item_key: buildFollowUpItemKey(plan.unit_id, plan.attempt_key, followUpState),
    human_queue: "manual_triage_queue",
    title: buildFollowUpTitle(plan.unit_id, followUpState),
    summary: buildFollowUpSummary(plan, reconciliation, followUpState),
    primary_human_action: "perform_manual_triage",
    automation_step: "open_inbox_item",
    labels: buildFollowUpLabels(plan, reconciliation, followUpState, followUpAction),
  };
}

function buildExpectedFollowUpItemFromCurrentContract(
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
  expectedState: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState | null
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"] {
  if (
    expectedState === null ||
    expectedState === "result_artifact_handoff_ready" ||
    expectedState === "manual_follow_up_item_delivered"
  ) {
    return null;
  }

  return {
    item_key: buildFollowUpItemKey(followUp.unit_id, followUp.attempt_key, expectedState),
    human_queue: "manual_triage_queue",
    title: buildFollowUpTitle(followUp.unit_id, expectedState),
    summary: buildCurrentContractFollowUpSummary(followUp, expectedState),
    primary_human_action: "perform_manual_triage",
    automation_step: "open_inbox_item",
    labels: buildCurrentContractFollowUpLabels(
      followUp,
      expectedState,
      deriveFollowUpAction(expectedState) as Extract<
        UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpAction,
        | "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_item"
        | "open_manual_receipt_triage_item"
      >
    ),
  };
}

function buildFollowUpItemKey(
  unitId: string,
  attemptKey: string,
  followUpState: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState,
    | "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required"
    | "receipt_triage_required"
  >
): string {
  const suffix =
    followUpState === "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required"
      ? `provider-follow-up${"-delivery-follow-up".repeat(14)}-repair`
      : `provider-follow-up${"-delivery-follow-up".repeat(14)}-receipt`;
  return `content-pipeline:manual_triage_queue:${unitId}:${suffix}:${attemptKey}`;
}

function buildFollowUpTitle(
  unitId: string,
  followUpState: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState,
    | "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required"
    | "receipt_triage_required"
  >
): string {
  const titleDepth = `Provider Follow-up ${Array.from({ length: 14 }, () => "Delivery Follow-up").join(" ")}`;
  return followUpState === "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required"
    ? `[${titleDepth} Repair] ${unitId}`
    : `[${titleDepth} Receipt Triage] ${unitId}`;
}

function buildFollowUpSummary(
  plan: SourceFollowUpPlan,
  reconciliation: SourceFollowUpReconciliation,
  followUpState: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState,
    | "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required"
    | "receipt_triage_required"
  >
): string {
  const activeSummary =
    reconciliation.preserved_active_follow_up_item.item_key &&
    reconciliation.preserved_active_follow_up_item.human_queue
      ? `Current trusted follow-up item is ${reconciliation.preserved_active_follow_up_item.item_key} in ${reconciliation.preserved_active_follow_up_item.human_queue}.`
      : "No trustworthy follow-up item is currently confirmed.";

  if (
    followUpState ===
    "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required"
  ) {
    return `${activeSummary} Newest downstream provider post-delivery follow-up for attempt ${plan.attempt_key} did not fully apply (delivery status: ${reconciliation.delivery_status ?? "unknown"}). Manual repair is required before this route can be treated as delivered.`;
  }

  return `${activeSummary} Newest downstream provider post-delivery receipt for attempt ${plan.attempt_key} did not validate (${reconciliation.receipt_validation_issue_codes.join(", ") || "unknown_receipt_issue"}). Manual receipt triage is required before further downstream automation.`;
}

function buildCurrentContractFollowUpSummary(
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
  followUpState: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState,
    | "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required"
    | "receipt_triage_required"
  >
): string {
  const activeSummary =
    followUp.preserved_active_follow_up_item.item_key &&
    followUp.preserved_active_follow_up_item.human_queue
      ? `Current trusted follow-up item is ${followUp.preserved_active_follow_up_item.item_key} in ${followUp.preserved_active_follow_up_item.human_queue}.`
      : "No trustworthy follow-up item is currently confirmed.";

  if (
    followUpState ===
    "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required"
  ) {
    return `${activeSummary} Newest downstream provider post-delivery follow-up for attempt ${followUp.attempt_key} did not fully apply (delivery status: ${followUp.source_delivery_status ?? "unknown"}). Manual repair is required before this route can be treated as delivered.`;
  }

  return `${activeSummary} Newest downstream provider post-delivery receipt for attempt ${followUp.attempt_key} did not validate. Manual receipt triage is required before further downstream automation.`;
}

function buildFollowUpLabels(
  plan: SourceFollowUpPlan,
  reconciliation: SourceFollowUpReconciliation,
  followUpState: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState,
    | "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required"
    | "receipt_triage_required"
  >,
  followUpAction: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpAction,
    | "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_item"
    | "open_manual_receipt_triage_item"
  >
): string[] {
  const receiptLabel =
    followUpState === "receipt_triage_required"
      ? reconciliation.receipt_validation_issue_codes.join("|") || "unknown_receipt_issue"
      : reconciliation.delivery_status ?? "unknown";

  return [
    "content_pipeline_review",
    DEPTH_LABEL,
    "queue:manual_triage_queue",
    `follow_up_state:${followUpState}`,
    `action:${followUpAction}`,
    `source_follow_up_state:${plan.follow_up_state}`,
    `delivery_status:${reconciliation.delivery_status ?? "untrusted"}`,
    `active_queue:${reconciliation.preserved_active_follow_up_item.human_queue ?? "none"}`,
    followUpState === "receipt_triage_required"
      ? `receipt_validation:${receiptLabel}`
      : `repair_signal:${receiptLabel}`,
  ];
}

function buildCurrentContractFollowUpLabels(
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
  followUpState: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState,
    | "repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required"
    | "receipt_triage_required"
  >,
  followUpAction: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpAction,
    | "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_item"
    | "open_manual_receipt_triage_item"
  >
): string[] {
  const receiptLabel =
    followUpState === "receipt_triage_required"
      ? "untrusted_receipt"
      : followUp.source_delivery_status ?? "unknown";

  return [
    "content_pipeline_review",
    DEPTH_LABEL,
    "queue:manual_triage_queue",
    `follow_up_state:${followUpState}`,
    `action:${followUpAction}`,
    `source_follow_up_state:${followUp.source_follow_up_state}`,
    `delivery_status:${followUp.source_delivery_status ?? "untrusted"}`,
    `active_queue:${followUp.preserved_active_follow_up_item.human_queue ?? "none"}`,
    followUpState === "receipt_triage_required"
      ? `receipt_validation:${receiptLabel}`
      : `repair_signal:${receiptLabel}`,
  ];
}

function currentContractFollowUpItemMatches(
  actual: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"],
  expected: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"],
  expectedState: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState | null
): boolean {
  if (jsonEqual(actual, expected)) {
    return true;
  }

  if (expectedState !== "receipt_triage_required" || actual === null || expected === null) {
    return false;
  }

  const expectedStableLabels = expected.labels.filter(
    (label) => !label.startsWith("receipt_validation:")
  );
  const actualStableLabels = actual.labels.filter(
    (label) => !label.startsWith("receipt_validation:")
  );
  const actualReceiptValidationLabels = actual.labels.filter((label) =>
    label.startsWith("receipt_validation:")
  );
  const receiptValidationLabel = actualReceiptValidationLabels[0] ?? "";
  const hasExactlyExpectedStableLabels =
    actualStableLabels.length === expectedStableLabels.length &&
    expectedStableLabels.every((label) => actualStableLabels.includes(label));
  const hasExactlyOneReceiptValidationLabel =
    actualReceiptValidationLabels.length === 1 &&
    receiptValidationLabel.length > "receipt_validation:".length;
  const expectedSummaryPrefix =
    `${expected.summary.split(" did not validate. Manual receipt triage")[0]} did not validate`;

  return (
    actual.item_key === expected.item_key &&
    actual.human_queue === expected.human_queue &&
    actual.title === expected.title &&
    actual.primary_human_action === expected.primary_human_action &&
    actual.automation_step === expected.automation_step &&
    actual.summary.startsWith(expectedSummaryPrefix) &&
    actual.summary.endsWith(
      "Manual receipt triage is required before further downstream automation."
    ) &&
    hasExactlyExpectedStableLabels &&
    hasExactlyOneReceiptValidationLabel
  );
}

function jsonEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}








