import type { UnitReviewPrimaryHumanAction } from "./orchestration-guidance";
import type { UnitReviewProviderExecutionAttempt } from "./provider-execution-attempt";
import type { UnitReviewProviderExecutionDecision } from "./provider-execution-decision";
import type { UnitReviewProviderExecutionFollowUp } from "./provider-execution-follow-up";
import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUp } from "./provider-execution-follow-up-delivery-follow-up";
import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUp } from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up";
import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan } from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan";
import {
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlanSource,
} from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan";
import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceipt } from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up-receipt";
import type {
  ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationValidationIssue,
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation,
} from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up-reconciliation";
import {
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation,
  validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationSource,
} from "./provider-execution-follow-up-delivery-follow-up-delivery-follow-up-reconciliation";
import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan } from "./provider-execution-follow-up-delivery-follow-up-plan";
import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt } from "./provider-execution-follow-up-delivery-follow-up-receipt";
import type { UnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation } from "./provider-execution-follow-up-delivery-follow-up-reconciliation";
import type { UnitReviewProviderExecutionFollowUpPlan } from "./provider-execution-follow-up-plan";
import type { UnitReviewProviderExecutionFollowUpReceipt } from "./provider-execution-follow-up-receipt";
import type { UnitReviewProviderExecutionFollowUpReconciliation } from "./provider-execution-follow-up-reconciliation";
import type { UnitReviewProviderExecutionReceipt } from "./provider-execution-receipt";
import type { UnitReviewProviderExecutionReconciliation } from "./provider-execution-reconciliation";
import type { UnitReviewProviderExecutionRequest } from "./provider-execution-request";

export type UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState =
  | "result_artifact_handoff_ready"
  | "manual_follow_up_item_delivered"
  | "repair_follow_up_delivery_follow_up_delivery_follow_up_required"
  | "receipt_triage_required";

export type UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpAction =
  | "defer_to_result_artifact_contract"
  | "none"
  | "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_item"
  | "open_manual_receipt_triage_item";

export interface UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp {
  schema_version: "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up/v0.1";
  source_follow_up_plan_schema_version: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan["schema_version"];
  source_follow_up_reconciliation_schema_version: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation["schema_version"];
  request_key: string;
  chain_key: string;
  attempt_key: string;
  unit_id: string;
  source_follow_up_state: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan["follow_up_state"];
  source_follow_up_action: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan["follow_up_action"];
  source_reconciliation_status: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation["reconciliation_status"];
  source_recommended_follow_up: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation["recommended_follow_up"];
  source_delivery_status: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation["delivery_status"];
  follow_up_state: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState;
  follow_up_action: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpAction;
  follow_up_delivery_follow_up_delivery_follow_up_chain_closed: boolean;
  preserved_result_artifact_handoff: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation["result_artifact_handoff"];
  result_artifact_handoff: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation["result_artifact_handoff"];
  preserved_active_follow_up_item: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation["preserved_active_follow_up_item"];
  active_follow_up_item: {
    item_key: string | null;
    human_queue: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation["final_follow_up_queue"];
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

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceValidationIssue {
  code:
    | "source_follow_up_delivery_follow_up_delivery_follow_up_plan_contract_mismatch"
    | "source_follow_up_delivery_follow_up_delivery_follow_up_reconciliation_contract_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceValidationIssue[];
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceContractValidationIssue {
  code:
    | "invalid_follow_up_schema_version"
    | "source_reconciliation_contract_mismatch"
    | "follow_up_state_mismatch"
    | "follow_up_action_mismatch"
    | "follow_up_delivery_follow_up_delivery_follow_up_chain_closed_mismatch"
    | "preserved_result_artifact_handoff_contract_mismatch"
    | "result_artifact_handoff_contract_mismatch"
    | "preserved_active_follow_up_item_contract_mismatch"
    | "active_follow_up_item_contract_mismatch"
    | "automation_step_mismatch"
    | "decision_boundary_mismatch"
    | "follow_up_item_contract_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceContractValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceContractValidationIssue[];
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpValidationIssue {
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
    | "follow_up_delivery_follow_up_delivery_follow_up_chain_closed_mismatch"
    | "preserved_result_artifact_handoff_mismatch"
    | "result_artifact_handoff_mismatch"
    | "preserved_active_follow_up_item_mismatch"
    | "active_follow_up_item_mismatch"
    | "automation_step_mismatch"
    | "decision_boundary_mismatch"
    | "follow_up_item_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpValidationIssue[];
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSource(
  request: UnitReviewProviderExecutionRequest,
  decision: UnitReviewProviderExecutionDecision,
  attempt: UnitReviewProviderExecutionAttempt,
  sourceReceipt: UnitReviewProviderExecutionReceipt,
  sourceReconciliation: UnitReviewProviderExecutionReconciliation,
  followUp: UnitReviewProviderExecutionFollowUp,
  plan: UnitReviewProviderExecutionFollowUpPlan,
  followUpReceipt: UnitReviewProviderExecutionFollowUpReceipt,
  followUpReconciliation: UnitReviewProviderExecutionFollowUpReconciliation,
  followUpDeliveryFollowUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUp,
  deliveryFollowUpPlan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpPlan,
  deliveryFollowUpReceipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReceipt,
  deliveryFollowUpReconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliation,
  deliveryFollowUpDeliveryFollowUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUp,
  deliveryFollowUpDeliveryFollowUpPlan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  deliveryFollowUpDeliveryFollowUpReceipt: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReceipt,
  deliveryFollowUpDeliveryFollowUpReconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation
): ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceValidationIssue[] =
    [];
  const planSourceValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlanSource(
      request,
      decision,
      attempt,
      sourceReceipt,
      sourceReconciliation,
      followUp,
      plan,
      followUpReceipt,
      followUpReconciliation,
      followUpDeliveryFollowUp,
      deliveryFollowUpPlan,
      deliveryFollowUpReceipt,
      deliveryFollowUpReconciliation,
      deliveryFollowUpDeliveryFollowUp
    );
  const planValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan(
      deliveryFollowUpDeliveryFollowUp,
      deliveryFollowUpDeliveryFollowUpPlan
    );
  const reconciliationSourceValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliationSource(
      request,
      decision,
      attempt,
      sourceReceipt,
      sourceReconciliation,
      followUp,
      plan,
      followUpReceipt,
      followUpReconciliation,
      followUpDeliveryFollowUp,
      deliveryFollowUpPlan,
      deliveryFollowUpReceipt,
      deliveryFollowUpReconciliation,
      deliveryFollowUpDeliveryFollowUp,
      deliveryFollowUpDeliveryFollowUpPlan,
      deliveryFollowUpDeliveryFollowUpReceipt
    );
  const reconciliationValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation(
      deliveryFollowUpDeliveryFollowUpPlan,
      deliveryFollowUpDeliveryFollowUpReceipt,
      deliveryFollowUpDeliveryFollowUpReconciliation
    );

  if (!planSourceValidation.ok || !planValidation.ok) {
    const issueCodes = [
      ...planSourceValidation.issues.map((issue) => issue.code),
      ...planValidation.issues.map((issue) => issue.code),
    ];
    issues.push({
      code: "source_follow_up_delivery_follow_up_delivery_follow_up_plan_contract_mismatch",
      message:
        `Provider execution follow-up delivery follow-up delivery follow-up routing source plan chain failed validation: ${issueCodes.join(", ")}.`,
    });
  }

  if (!reconciliationSourceValidation.ok || !reconciliationValidation.ok) {
    const issueCodes = [
      ...reconciliationSourceValidation.issues.map((issue) => issue.code),
      ...reconciliationValidation.issues.map((issue) => issue.code),
    ];
    issues.push({
      code: "source_follow_up_delivery_follow_up_delivery_follow_up_reconciliation_contract_mismatch",
      message:
        `Provider execution follow-up delivery follow-up delivery follow-up routing source reconciliation chain failed validation: ${issueCodes.join(", ")}.`,
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

export function buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  reconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp {
  const sourceContractValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceContract(
      plan,
      reconciliation
    );
  if (!sourceContractValidation.ok) {
    throw new Error(
      `Provider execution follow-up delivery follow-up delivery follow-up routing source is invalid: ${sourceContractValidation.issues.map((issue) => issue.code).join(", ")}.`
    );
  }

  const followUpState = deriveFollowUpState(plan, reconciliation);
  const followUpAction = deriveFollowUpAction(followUpState);
  const activeFollowUpItem = deriveActiveFollowUpItem(reconciliation, followUpState);
  const followUpItem = buildDerivedFollowUpItem(plan, reconciliation, followUpState);

  return {
    schema_version:
      "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up/v0.1",
    source_follow_up_plan_schema_version:
      "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1",
    source_follow_up_reconciliation_schema_version:
      "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-reconciliation/v0.1",
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
    follow_up_delivery_follow_up_delivery_follow_up_chain_closed:
      followUpState === "result_artifact_handoff_ready" ||
      followUpState === "manual_follow_up_item_delivered",
    preserved_result_artifact_handoff: reconciliation.result_artifact_handoff,
    result_artifact_handoff:
      followUpState === "result_artifact_handoff_ready"
        ? reconciliation.result_artifact_handoff
        : null,
    preserved_active_follow_up_item: reconciliation.preserved_active_follow_up_item,
    active_follow_up_item: activeFollowUpItem,
    automation_step: followUpItem === null ? "none" : "open_inbox_item",
    decision_boundary: {
      requires_provider_execution: false,
      requires_human_decision: followUpItem !== null,
      provider_execution_allowed_without_human: false,
    },
    follow_up_item: followUpItem,
  };
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  reconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation,
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp
): ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpValidationIssue[] =
    [];
  const expected =
    buildUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp(
      plan,
      reconciliation
    );

  if (
    followUp.schema_version !==
    "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up/v0.1"
  ) {
    issues.push({
      code: "invalid_follow_up_schema_version",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing schema_version must be content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up/v0.1.",
    });
  }

  if (
    followUp.source_follow_up_plan_schema_version !==
    expected.source_follow_up_plan_schema_version
  ) {
    issues.push({
      code: "source_follow_up_plan_schema_version_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing source_follow_up_plan_schema_version must match the source plan schema_version.",
    });
  }

  if (
    followUp.source_follow_up_reconciliation_schema_version !==
    expected.source_follow_up_reconciliation_schema_version
  ) {
    issues.push({
      code: "source_follow_up_reconciliation_schema_version_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing source_follow_up_reconciliation_schema_version must match the source reconciliation schema_version.",
    });
  }

  if (followUp.request_key !== expected.request_key) {
    issues.push({
      code: "request_key_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing request_key must match the source plan/reconciliation chain.",
    });
  }

  if (followUp.chain_key !== expected.chain_key) {
    issues.push({
      code: "chain_key_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing chain_key must match the source plan/reconciliation chain.",
    });
  }

  if (followUp.attempt_key !== expected.attempt_key) {
    issues.push({
      code: "attempt_key_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing attempt_key must match the source plan/reconciliation chain.",
    });
  }

  if (followUp.unit_id !== expected.unit_id) {
    issues.push({
      code: "unit_id_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing unit_id must match the source plan/reconciliation chain.",
    });
  }

  if (followUp.source_follow_up_state !== expected.source_follow_up_state) {
    issues.push({
      code: "source_follow_up_state_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing source_follow_up_state must match the source follow-up plan state.",
    });
  }

  if (followUp.source_follow_up_action !== expected.source_follow_up_action) {
    issues.push({
      code: "source_follow_up_action_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing source_follow_up_action must match the source follow-up plan action.",
    });
  }

  if (followUp.source_reconciliation_status !== expected.source_reconciliation_status) {
    issues.push({
      code: "source_reconciliation_status_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing source_reconciliation_status must match the source reconciliation status.",
    });
  }

  if (followUp.source_recommended_follow_up !== expected.source_recommended_follow_up) {
    issues.push({
      code: "source_recommended_follow_up_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing source_recommended_follow_up must match the source reconciliation recommended_follow_up.",
    });
  }

  if (followUp.source_delivery_status !== expected.source_delivery_status) {
    issues.push({
      code: "source_delivery_status_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing source_delivery_status must match the source reconciliation delivery_status.",
    });
  }

  if (followUp.follow_up_state !== expected.follow_up_state) {
    issues.push({
      code: "follow_up_state_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing follow_up_state must match the derived routing state.",
    });
  }

  if (followUp.follow_up_action !== expected.follow_up_action) {
    issues.push({
      code: "follow_up_action_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing follow_up_action must match the derived routing action.",
    });
  }

  if (
    followUp.follow_up_delivery_follow_up_delivery_follow_up_chain_closed !==
    expected.follow_up_delivery_follow_up_delivery_follow_up_chain_closed
  ) {
    issues.push({
      code: "follow_up_delivery_follow_up_delivery_follow_up_chain_closed_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing closure flag must match the derived routing state.",
    });
  }

  if (
    !resultArtifactHandoffsMatch(
      followUp.preserved_result_artifact_handoff,
      expected.preserved_result_artifact_handoff
    )
  ) {
    issues.push({
      code: "preserved_result_artifact_handoff_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing preserved_result_artifact_handoff must match the trusted source reconciliation artifact context.",
    });
  }

  if (
    !resultArtifactHandoffsMatch(
      followUp.result_artifact_handoff,
      expected.result_artifact_handoff
    )
  ) {
    issues.push({
      code: "result_artifact_handoff_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing result_artifact_handoff must match the trusted artifact handoff derived from the source reconciliation.",
    });
  }

  if (
    !activeFollowUpItemsMatch(
      followUp.preserved_active_follow_up_item,
      expected.preserved_active_follow_up_item
    )
  ) {
    issues.push({
      code: "preserved_active_follow_up_item_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing preserved_active_follow_up_item must match the trusted source reconciliation active follow-up context.",
    });
  }

  if (!activeFollowUpItemsMatch(followUp.active_follow_up_item, expected.active_follow_up_item)) {
    issues.push({
      code: "active_follow_up_item_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing active_follow_up_item must match the derived current active follow-up state.",
    });
  }

  if (followUp.automation_step !== expected.automation_step) {
    issues.push({
      code: "automation_step_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing automation_step must match whether a downstream manual triage item is required.",
    });
  }

  if (
    followUp.decision_boundary.requires_provider_execution !==
      expected.decision_boundary.requires_provider_execution ||
    followUp.decision_boundary.requires_human_decision !==
      expected.decision_boundary.requires_human_decision ||
    followUp.decision_boundary.provider_execution_allowed_without_human !==
      expected.decision_boundary.provider_execution_allowed_without_human
  ) {
    issues.push({
      code: "decision_boundary_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing decision_boundary must match whether a downstream manual triage item is required.",
    });
  }

  if (!followUpItemsMatch(followUp.follow_up_item, expected.follow_up_item)) {
    issues.push({
      code: "follow_up_item_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing follow_up_item must match the derived manual triage payload for the declared routing state.",
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceContract(
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  reconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation
): ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceContractValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceContractValidationIssue[] =
    [];
  const expectedState = deriveExpectedStateFromSourceContract(
    plan.follow_up_state,
    reconciliation.reconciliation_status,
    reconciliation.recommended_follow_up
  );

  if (expectedState === null) {
    issues.push({
      code: "source_reconciliation_contract_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing source follow-up state and reconciliation contract must form a valid routing pair.",
    });
  }

  if (
    plan.schema_version !==
    "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1"
  ) {
    issues.push({
      code: "invalid_follow_up_schema_version",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing source plan schema_version must be content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan/v0.1.",
    });
  }

  if (
    reconciliation.schema_version !==
    "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-reconciliation/v0.1"
  ) {
    issues.push({
      code: "source_reconciliation_contract_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing source reconciliation schema_version must be content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-reconciliation/v0.1.",
    });
  }

  if (
    expectedState === "result_artifact_handoff_ready" &&
    reconciliation.result_artifact_handoff === null
  ) {
    issues.push({
      code: "result_artifact_handoff_contract_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing source reconciliation must keep a trusted result_artifact_handoff on trusted artifact handoff branches.",
    });
  }

  if (
    expectedState === "manual_follow_up_item_delivered" &&
    (reconciliation.final_follow_up_item_key === null ||
      reconciliation.final_follow_up_queue === null ||
      reconciliation.preserved_active_follow_up_item.item_key === null ||
      reconciliation.preserved_active_follow_up_item.human_queue === null ||
      reconciliation.preserved_active_follow_up_item.should_remain_open !== true)
  ) {
    issues.push({
      code: "active_follow_up_item_contract_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing source reconciliation must expose a trusted active follow-up item on delivered manual follow-up branches.",
    });
  }

  if (
    expectedState !== "manual_follow_up_item_delivered" &&
    reconciliation.final_follow_up_item_key !== null
  ) {
    issues.push({
      code: "active_follow_up_item_contract_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing source reconciliation must clear current follow-up targets outside delivered manual follow-up branches.",
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpContract(
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp
): ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceContractValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpSourceContractValidationIssue[] =
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

  if (
    followUp.schema_version !==
    "content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up/v0.1"
  ) {
    issues.push({
      code: "invalid_follow_up_schema_version",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing schema_version must be content-pipeline-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up/v0.1.",
    });
  }

  if (expectedState === null) {
    issues.push({
      code: "source_reconciliation_contract_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing source follow-up state and reconciliation contract must form a valid routing pair.",
    });
  }

  if (expectedState !== null && followUp.follow_up_state !== expectedState) {
    issues.push({
      code: "follow_up_state_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing follow_up_state must match the source-derived routing state.",
    });
  }

  const expectedAction =
    expectedState === null ? null : deriveFollowUpAction(expectedState);
  if (expectedAction !== null && followUp.follow_up_action !== expectedAction) {
    issues.push({
      code: "follow_up_action_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing follow_up_action must match the source-derived routing action.",
    });
  }

  const expectedClosed =
    expectedState === "result_artifact_handoff_ready" ||
    expectedState === "manual_follow_up_item_delivered";
  if (
    expectedState !== null &&
    followUp.follow_up_delivery_follow_up_delivery_follow_up_chain_closed !== expectedClosed
  ) {
    issues.push({
      code: "follow_up_delivery_follow_up_delivery_follow_up_chain_closed_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing closure flag must match the source-derived routing state.",
    });
  }

  if (
    expectedState === "result_artifact_handoff_ready" &&
    followUp.preserved_result_artifact_handoff === null
  ) {
    issues.push({
      code: "preserved_result_artifact_handoff_contract_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing must preserve a trusted result_artifact_handoff on trusted artifact handoff branches.",
    });
  }

  if (
    expectedState === "result_artifact_handoff_ready" &&
    !resultArtifactHandoffsMatch(
      followUp.result_artifact_handoff,
      followUp.preserved_result_artifact_handoff
    )
  ) {
    issues.push({
      code: "result_artifact_handoff_contract_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing result_artifact_handoff must match preserved_result_artifact_handoff on trusted artifact handoff branches.",
    });
  }

  if (
    expectedState !== "result_artifact_handoff_ready" &&
    followUp.result_artifact_handoff !== null
  ) {
    issues.push({
      code: "result_artifact_handoff_contract_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing result_artifact_handoff must be null outside trusted artifact handoff branches.",
    });
  }

  if (
    expectedState === "manual_follow_up_item_delivered" &&
    (followUp.preserved_active_follow_up_item.item_key === null ||
      followUp.preserved_active_follow_up_item.human_queue === null ||
      followUp.preserved_active_follow_up_item.should_remain_open !== true)
  ) {
    issues.push({
      code: "preserved_active_follow_up_item_contract_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing must preserve a trusted active follow-up item on delivered manual follow-up branches.",
    });
  }

  if (
    expectedState === "manual_follow_up_item_delivered" &&
    !activeFollowUpItemsMatch(followUp.active_follow_up_item, {
      item_key: followUp.preserved_active_follow_up_item.item_key,
      human_queue: followUp.preserved_active_follow_up_item.human_queue,
      should_remain_open: followUp.preserved_active_follow_up_item.should_remain_open,
    })
  ) {
    issues.push({
      code: "active_follow_up_item_contract_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing active_follow_up_item must match preserved_active_follow_up_item on delivered manual follow-up branches.",
    });
  }

  if (
    expectedState !== "manual_follow_up_item_delivered" &&
    !activeFollowUpItemsMatch(followUp.active_follow_up_item, {
      item_key: null,
      human_queue: null,
      should_remain_open: false,
    })
  ) {
    issues.push({
      code: "active_follow_up_item_contract_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing active_follow_up_item must clear untrusted current follow-up targets outside delivered manual follow-up branches.",
    });
  }

  const expectedAutomationStep =
    expectedFollowUpItem === null ? "none" : "open_inbox_item";
  if (followUp.automation_step !== expectedAutomationStep) {
    issues.push({
      code: "automation_step_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing automation_step must match follow_up_item presence.",
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
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing decision_boundary must match whether a downstream manual triage item is required.",
    });
  }

  if (!followUpItemsMatch(followUp.follow_up_item, expectedFollowUpItem)) {
    issues.push({
      code: "follow_up_item_contract_mismatch",
      message:
        "Provider execution follow-up delivery follow-up delivery follow-up routing follow_up_item must match the deterministic manual-routing payload for the declared state.",
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

function deriveFollowUpState(
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  reconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState {
  if (!reconciliation.receipt_validation_ok) {
    return "receipt_triage_required";
  }

  if (reconciliation.recommended_follow_up === "manual_receipt_triage") {
    return "receipt_triage_required";
  }

  if (
    reconciliation.reconciliation_status === "action_required" &&
    reconciliation.recommended_follow_up ===
      "manual_repair_provider_execution_follow_up_delivery_follow_up_delivery_follow_up"
  ) {
    return "repair_follow_up_delivery_follow_up_delivery_follow_up_required";
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
    `Unsupported provider execution follow-up delivery follow-up delivery follow-up routing combination: ${reconciliation.reconciliation_status}/${reconciliation.recommended_follow_up}.`
  );
}

function deriveFollowUpAction(
  followUpState: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpAction {
  switch (followUpState) {
    case "result_artifact_handoff_ready":
      return "defer_to_result_artifact_contract";
    case "manual_follow_up_item_delivered":
      return "none";
    case "repair_follow_up_delivery_follow_up_delivery_follow_up_required":
      return "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_item";
    case "receipt_triage_required":
      return "open_manual_receipt_triage_item";
  }
}

function deriveActiveFollowUpItem(
  reconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation,
  followUpState: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["active_follow_up_item"] {
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
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  reconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation,
  followUpState: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"] {
  switch (followUpState) {
    case "result_artifact_handoff_ready":
    case "manual_follow_up_item_delivered":
      return null;
    case "repair_follow_up_delivery_follow_up_delivery_follow_up_required":
      return buildFollowUpItem(
        plan,
        reconciliation,
        "repair_follow_up_delivery_follow_up_delivery_follow_up_required",
        "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_item"
      );
    case "receipt_triage_required":
      return buildFollowUpItem(
        plan,
        reconciliation,
        "receipt_triage_required",
        "open_manual_receipt_triage_item"
      );
  }
}

function buildFollowUpItem(
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  reconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation,
  followUpState: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState,
    | "repair_follow_up_delivery_follow_up_delivery_follow_up_required"
    | "receipt_triage_required"
  >,
  followUpAction: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpAction,
    | "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_item"
    | "open_manual_receipt_triage_item"
  >
): NonNullable<
  UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"]
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
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
  expectedState: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState | null
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"] {
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
        UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpAction,
        | "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_item"
        | "open_manual_receipt_triage_item"
      >
    ),
  };
}

function deriveExpectedStateFromSourceContract(
  sourceFollowUpState: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan["follow_up_state"],
  sourceReconciliationStatus: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation["reconciliation_status"],
  sourceRecommendedFollowUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation["recommended_follow_up"]
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState | null {
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
    sourceRecommendedFollowUp ===
      "manual_repair_provider_execution_follow_up_delivery_follow_up_delivery_follow_up"
  ) {
    return "repair_follow_up_delivery_follow_up_delivery_follow_up_required";
  }

  if (
    sourceReconciliationStatus === "action_required" &&
    sourceRecommendedFollowUp === "manual_receipt_triage"
  ) {
    return "receipt_triage_required";
  }

  return null;
}

function buildFollowUpItemKey(
  unitId: string,
  attemptKey: string,
  followUpState: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState,
    | "repair_follow_up_delivery_follow_up_delivery_follow_up_required"
    | "receipt_triage_required"
  >
): string {
  const suffix =
    followUpState === "repair_follow_up_delivery_follow_up_delivery_follow_up_required"
      ? "provider-follow-up-delivery-follow-up-delivery-follow-up-repair"
      : "provider-follow-up-delivery-follow-up-delivery-follow-up-receipt";
  return `content-pipeline:manual_triage_queue:${unitId}:${suffix}:${attemptKey}`;
}

function buildFollowUpTitle(
  unitId: string,
  followUpState: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState,
    | "repair_follow_up_delivery_follow_up_delivery_follow_up_required"
    | "receipt_triage_required"
  >
): string {
  return followUpState === "repair_follow_up_delivery_follow_up_delivery_follow_up_required"
    ? `[Provider Follow-up Delivery Follow-up Delivery Follow-up Repair] ${unitId}`
    : `[Provider Follow-up Delivery Follow-up Delivery Follow-up Receipt Triage] ${unitId}`;
}

function buildFollowUpSummary(
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  reconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation,
  followUpState: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState,
    | "repair_follow_up_delivery_follow_up_delivery_follow_up_required"
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
    "repair_follow_up_delivery_follow_up_delivery_follow_up_required"
  ) {
    return `${activeSummary} Provider execution follow-up delivery follow-up delivery follow-up for attempt ${plan.attempt_key} did not fully apply (delivery status: ${reconciliation.delivery_status ?? "unknown"}). Manual repair is required before this downstream provider post-delivery route can be treated as delivered.`;
  }

  return `${activeSummary} Provider execution follow-up delivery follow-up delivery follow-up receipt for attempt ${plan.attempt_key} did not validate (${reconciliation.receipt_validation_issue_codes.join(", ") || "unknown_receipt_issue"}). Manual receipt triage is required before any further downstream provider post-delivery automation.`;
}

function buildCurrentContractFollowUpSummary(
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
  followUpState: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState,
    | "repair_follow_up_delivery_follow_up_delivery_follow_up_required"
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
    "repair_follow_up_delivery_follow_up_delivery_follow_up_required"
  ) {
    return `${activeSummary} Provider execution follow-up delivery follow-up delivery follow-up for attempt ${followUp.attempt_key} did not fully apply (delivery status: ${followUp.source_delivery_status ?? "unknown"}). Manual repair is required before this downstream provider post-delivery route can be treated as delivered.`;
  }

  return `${activeSummary} Provider execution follow-up delivery follow-up delivery follow-up receipt for attempt ${followUp.attempt_key} did not validate. Manual receipt triage is required before any further downstream provider post-delivery automation.`;
}

function buildFollowUpLabels(
  plan: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpPlan,
  reconciliation: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpReconciliation,
  followUpState: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState,
    | "repair_follow_up_delivery_follow_up_delivery_follow_up_required"
    | "receipt_triage_required"
  >,
  followUpAction: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpAction,
    | "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_item"
    | "open_manual_receipt_triage_item"
  >
): string[] {
  const receiptLabel =
    followUpState === "receipt_triage_required"
      ? reconciliation.receipt_validation_issue_codes.join("|") || "unknown_receipt_issue"
      : reconciliation.delivery_status ?? "unknown";

  return [
    "content_pipeline_review",
    "provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up",
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
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp,
  followUpState: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpState,
    | "repair_follow_up_delivery_follow_up_delivery_follow_up_required"
    | "receipt_triage_required"
  >,
  followUpAction: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUpAction,
    | "open_manual_repair_follow_up_delivery_follow_up_delivery_follow_up_item"
    | "open_manual_receipt_triage_item"
  >
): string[] {
  const receiptLabel =
    followUpState === "receipt_triage_required"
      ? "untrusted_receipt"
      : followUp.source_delivery_status ?? "unknown";

  return [
    "content_pipeline_review",
    "provider_execution_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up",
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

function resultArtifactHandoffsMatch(
  actual: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["result_artifact_handoff"],
  expected: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["result_artifact_handoff"]
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
  actual: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"],
  expected: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["follow_up_item"]
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

function activeFollowUpItemsMatch(
  actual: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["active_follow_up_item"] | UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["preserved_active_follow_up_item"],
  expected: UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["active_follow_up_item"] | UnitReviewProviderExecutionFollowUpDeliveryFollowUpDeliveryFollowUpDeliveryFollowUp["preserved_active_follow_up_item"]
): boolean {
  return (
    actual.item_key === expected.item_key &&
    actual.human_queue === expected.human_queue &&
    actual.should_remain_open === expected.should_remain_open
  );
}
