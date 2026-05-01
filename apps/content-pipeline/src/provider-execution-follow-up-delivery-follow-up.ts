import type { UnitReviewPrimaryHumanAction } from "./orchestration-guidance";
import type { UnitReviewProviderExecutionAttempt } from "./provider-execution-attempt";
import type { UnitReviewProviderExecutionDecision } from "./provider-execution-decision";
import type { UnitReviewProviderExecutionFollowUp } from "./provider-execution-follow-up";
import type { UnitReviewProviderExecutionFollowUpPlan } from "./provider-execution-follow-up-plan";
import {
  validateUnitReviewProviderExecutionFollowUpPlan,
  validateUnitReviewProviderExecutionFollowUpPlanSource,
} from "./provider-execution-follow-up-plan";
import type { UnitReviewProviderExecutionFollowUpReceipt } from "./provider-execution-follow-up-receipt";
import type {
  ProviderExecutionFollowUpReconciliationValidationIssue,
  UnitReviewProviderExecutionFollowUpReconciliation,
} from "./provider-execution-follow-up-reconciliation";
import {
  validateUnitReviewProviderExecutionFollowUpReconciliation,
  validateUnitReviewProviderExecutionFollowUpReconciliationSource,
} from "./provider-execution-follow-up-reconciliation";
import type { UnitReviewProviderExecutionReceipt } from "./provider-execution-receipt";
import type { UnitReviewProviderExecutionReconciliation } from "./provider-execution-reconciliation";
import type { UnitReviewProviderExecutionRequest } from "./provider-execution-request";

export type UnitReviewProviderExecutionFollowUpDeliveryFollowUpState =
  | "result_artifact_handoff_ready"
  | "manual_follow_up_item_delivered"
  | "repair_follow_up_delivery_required"
  | "receipt_triage_required";

export type UnitReviewProviderExecutionFollowUpDeliveryFollowUpAction =
  | "defer_to_result_artifact_contract"
  | "none"
  | "open_manual_repair_follow_up_delivery_item"
  | "open_manual_receipt_triage_item";

export interface UnitReviewProviderExecutionFollowUpDeliveryFollowUp {
  schema_version: "content-pipeline-review-provider-execution-follow-up-delivery-follow-up/v0.1";
  source_follow_up_plan_schema_version: UnitReviewProviderExecutionFollowUpPlan["schema_version"];
  source_follow_up_reconciliation_schema_version: UnitReviewProviderExecutionFollowUpReconciliation["schema_version"];
  request_key: string;
  chain_key: string;
  attempt_key: string;
  unit_id: string;
  source_follow_up_state: UnitReviewProviderExecutionFollowUpPlan["follow_up_state"];
  source_follow_up_action: UnitReviewProviderExecutionFollowUpPlan["follow_up_action"];
  source_reconciliation_status: UnitReviewProviderExecutionFollowUpReconciliation["reconciliation_status"];
  source_recommended_follow_up: UnitReviewProviderExecutionFollowUpReconciliation["recommended_follow_up"];
  source_delivery_status: UnitReviewProviderExecutionFollowUpReconciliation["delivery_status"];
  source_receipt_validation_ok: UnitReviewProviderExecutionFollowUpReconciliation["receipt_validation_ok"];
  source_receipt_validation_issue_codes: UnitReviewProviderExecutionFollowUpReconciliation["receipt_validation_issue_codes"];
  follow_up_state: UnitReviewProviderExecutionFollowUpDeliveryFollowUpState;
  follow_up_action: UnitReviewProviderExecutionFollowUpDeliveryFollowUpAction;
  follow_up_delivery_chain_closed: boolean;
  preserved_result_artifact_handoff: UnitReviewProviderExecutionFollowUpPlan["result_artifact_handoff"];
  result_artifact_handoff: UnitReviewProviderExecutionFollowUpReconciliation["result_artifact_handoff"];
  preserved_active_follow_up_item: {
    item_key: string | null;
    human_queue: UnitReviewProviderExecutionFollowUpReconciliation["final_follow_up_queue"];
    should_remain_open: boolean;
  };
  active_follow_up_item: {
    item_key: string | null;
    human_queue: UnitReviewProviderExecutionFollowUpReconciliation["final_follow_up_queue"];
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

export interface ProviderExecutionFollowUpDeliveryFollowUpSourceValidationIssue {
  code:
    | "source_follow_up_plan_contract_mismatch"
    | "source_follow_up_reconciliation_contract_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpSourceValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpSourceValidationIssue[];
}

export interface ProviderExecutionFollowUpDeliveryFollowUpSourceContractValidationIssue {
  code:
    | "invalid_follow_up_schema_version"
    | "source_reconciliation_contract_mismatch"
    | "follow_up_state_mismatch"
    | "follow_up_action_mismatch"
    | "follow_up_delivery_chain_closed_mismatch"
    | "result_artifact_handoff_contract_mismatch"
    | "active_follow_up_item_contract_mismatch"
    | "automation_step_mismatch"
    | "decision_boundary_mismatch"
    | "follow_up_item_contract_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpSourceContractValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpSourceContractValidationIssue[];
}

export interface ProviderExecutionFollowUpDeliveryFollowUpValidationIssue {
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
    | "source_receipt_validation_ok_mismatch"
    | "source_receipt_validation_issue_codes_mismatch"
    | "follow_up_state_mismatch"
    | "follow_up_action_mismatch"
    | "follow_up_delivery_chain_closed_mismatch"
    | "preserved_result_artifact_handoff_mismatch"
    | "result_artifact_handoff_mismatch"
    | "preserved_active_follow_up_item_mismatch"
    | "active_follow_up_item_mismatch"
    | "automation_step_mismatch"
    | "decision_boundary_mismatch"
    | "follow_up_item_mismatch";
  message: string;
}

export interface ProviderExecutionFollowUpDeliveryFollowUpValidationResult {
  ok: boolean;
  issues: ProviderExecutionFollowUpDeliveryFollowUpValidationIssue[];
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpSource(
  request: UnitReviewProviderExecutionRequest,
  decision: UnitReviewProviderExecutionDecision,
  attempt: UnitReviewProviderExecutionAttempt,
  sourceReceipt: UnitReviewProviderExecutionReceipt,
  sourceReconciliation: UnitReviewProviderExecutionReconciliation,
  followUp: UnitReviewProviderExecutionFollowUp,
  plan: UnitReviewProviderExecutionFollowUpPlan,
  followUpReceipt: UnitReviewProviderExecutionFollowUpReceipt,
  followUpReconciliation: UnitReviewProviderExecutionFollowUpReconciliation
): ProviderExecutionFollowUpDeliveryFollowUpSourceValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpSourceValidationIssue[] = [];
  const planSourceValidation = validateUnitReviewProviderExecutionFollowUpPlanSource(
    request,
    decision,
    attempt,
    sourceReceipt,
    sourceReconciliation,
    followUp
  );
  const planValidation = validateUnitReviewProviderExecutionFollowUpPlan(followUp, plan);
  const followUpReconciliationSourceValidation =
    validateUnitReviewProviderExecutionFollowUpReconciliationSource(
      request,
      decision,
      attempt,
      sourceReceipt,
      sourceReconciliation,
      followUp,
      plan,
      followUpReceipt
    );
  const followUpReconciliationValidation =
    validateUnitReviewProviderExecutionFollowUpReconciliation(
      plan,
      followUpReceipt,
      followUpReconciliation
    );

  if (!planSourceValidation.ok || !planValidation.ok) {
    const issueCodes = [
      ...planSourceValidation.issues.map((issue) => issue.code),
      ...planValidation.issues.map((issue) => issue.code),
    ];
    issues.push({
      code: "source_follow_up_plan_contract_mismatch",
      message:
        `Provider execution follow-up delivery follow-up source plan chain failed validation: ${issueCodes.join(", ")}.`,
    });
  }

  if (!followUpReconciliationSourceValidation.ok || !followUpReconciliationValidation.ok) {
    const issueCodes = [
      ...followUpReconciliationSourceValidation.issues.map((issue) => issue.code),
      ...followUpReconciliationValidation.issues.map((issue) => issue.code),
    ];
    issues.push({
      code: "source_follow_up_reconciliation_contract_mismatch",
      message:
        `Provider execution follow-up delivery follow-up source reconciliation chain failed validation: ${issueCodes.join(", ")}.`,
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

export function buildUnitReviewProviderExecutionFollowUpDeliveryFollowUp(
  plan: UnitReviewProviderExecutionFollowUpPlan,
  reconciliation: UnitReviewProviderExecutionFollowUpReconciliation
): UnitReviewProviderExecutionFollowUpDeliveryFollowUp {
  const sourceContractValidation =
    validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliationContract(
      plan,
      reconciliation
    );
  if (!sourceContractValidation.ok) {
    throw new Error(
      `Provider execution follow-up delivery follow-up source is invalid: ${sourceContractValidation.issues.map((issue) => issue.code).join(", ")}.`
    );
  }

  const followUpState = deriveFollowUpState(plan, reconciliation);
  const followUpAction = deriveFollowUpAction(followUpState);
  const activeFollowUpItem = deriveActiveFollowUpItem(reconciliation, followUpState);
  const followUpItem = buildDerivedFollowUpItem(
    plan,
    reconciliation,
    followUpState
  );

  return {
    schema_version:
      "content-pipeline-review-provider-execution-follow-up-delivery-follow-up/v0.1",
    source_follow_up_plan_schema_version:
      "content-pipeline-review-provider-execution-follow-up-plan/v0.1",
    source_follow_up_reconciliation_schema_version:
      "content-pipeline-review-provider-execution-follow-up-reconciliation/v0.1",
    request_key: plan.request_key,
    chain_key: plan.chain_key,
    attempt_key: plan.attempt_key,
    unit_id: plan.unit_id,
    source_follow_up_state: plan.follow_up_state,
    source_follow_up_action: plan.follow_up_action,
    source_reconciliation_status: reconciliation.reconciliation_status,
    source_recommended_follow_up: reconciliation.recommended_follow_up,
    source_delivery_status: reconciliation.delivery_status,
    source_receipt_validation_ok: reconciliation.receipt_validation_ok,
    source_receipt_validation_issue_codes: reconciliation.receipt_validation_issue_codes,
    follow_up_state: followUpState,
    follow_up_action: followUpAction,
    follow_up_delivery_chain_closed:
      followUpState === "result_artifact_handoff_ready" ||
      followUpState === "manual_follow_up_item_delivered",
    preserved_result_artifact_handoff: plan.result_artifact_handoff,
    result_artifact_handoff:
      followUpState === "result_artifact_handoff_ready"
        ? reconciliation.result_artifact_handoff
        : null,
    preserved_active_follow_up_item: derivePreservedActiveFollowUpItem(plan),
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

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUp(
  plan: UnitReviewProviderExecutionFollowUpPlan,
  reconciliation: UnitReviewProviderExecutionFollowUpReconciliation,
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUp
): ProviderExecutionFollowUpDeliveryFollowUpValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpValidationIssue[] = [];
  const expected = buildUnitReviewProviderExecutionFollowUpDeliveryFollowUp(plan, reconciliation);

  if (
    followUp.schema_version !==
    "content-pipeline-review-provider-execution-follow-up-delivery-follow-up/v0.1"
  ) {
    issues.push({
      code: "invalid_follow_up_schema_version",
      message:
        "Provider execution follow-up delivery follow-up schema_version must be content-pipeline-review-provider-execution-follow-up-delivery-follow-up/v0.1.",
    });
  }

  if (
    followUp.source_follow_up_plan_schema_version !==
    expected.source_follow_up_plan_schema_version
  ) {
    issues.push({
      code: "source_follow_up_plan_schema_version_mismatch",
      message:
        "Provider execution follow-up delivery follow-up source_follow_up_plan_schema_version must match the source plan schema_version.",
    });
  }

  if (
    followUp.source_follow_up_reconciliation_schema_version !==
    expected.source_follow_up_reconciliation_schema_version
  ) {
    issues.push({
      code: "source_follow_up_reconciliation_schema_version_mismatch",
      message:
        "Provider execution follow-up delivery follow-up source_follow_up_reconciliation_schema_version must match the source reconciliation schema_version.",
    });
  }

  if (followUp.request_key !== expected.request_key) {
    issues.push({
      code: "request_key_mismatch",
      message:
        "Provider execution follow-up delivery follow-up request_key must match the source plan/reconciliation chain.",
    });
  }

  if (followUp.chain_key !== expected.chain_key) {
    issues.push({
      code: "chain_key_mismatch",
      message:
        "Provider execution follow-up delivery follow-up chain_key must match the source plan/reconciliation chain.",
    });
  }

  if (followUp.attempt_key !== expected.attempt_key) {
    issues.push({
      code: "attempt_key_mismatch",
      message:
        "Provider execution follow-up delivery follow-up attempt_key must match the source plan/reconciliation chain.",
    });
  }

  if (followUp.unit_id !== expected.unit_id) {
    issues.push({
      code: "unit_id_mismatch",
      message:
        "Provider execution follow-up delivery follow-up unit_id must match the source plan/reconciliation chain.",
    });
  }

  if (followUp.source_follow_up_state !== expected.source_follow_up_state) {
    issues.push({
      code: "source_follow_up_state_mismatch",
      message:
        "Provider execution follow-up delivery follow-up source_follow_up_state must match the source follow-up plan state.",
    });
  }

  if (followUp.source_follow_up_action !== expected.source_follow_up_action) {
    issues.push({
      code: "source_follow_up_action_mismatch",
      message:
        "Provider execution follow-up delivery follow-up source_follow_up_action must match the source follow-up plan action.",
    });
  }

  if (followUp.source_reconciliation_status !== expected.source_reconciliation_status) {
    issues.push({
      code: "source_reconciliation_status_mismatch",
      message:
        "Provider execution follow-up delivery follow-up source_reconciliation_status must match the source reconciliation status.",
    });
  }

  if (followUp.source_recommended_follow_up !== expected.source_recommended_follow_up) {
    issues.push({
      code: "source_recommended_follow_up_mismatch",
      message:
        "Provider execution follow-up delivery follow-up source_recommended_follow_up must match the source reconciliation recommended_follow_up.",
    });
  }

  if (followUp.source_delivery_status !== expected.source_delivery_status) {
    issues.push({
      code: "source_delivery_status_mismatch",
      message:
        "Provider execution follow-up delivery follow-up source_delivery_status must match the source reconciliation delivery status.",
    });
  }

  if (
    followUp.source_receipt_validation_ok !== expected.source_receipt_validation_ok
  ) {
    issues.push({
      code: "source_receipt_validation_ok_mismatch",
      message:
        "Provider execution follow-up delivery follow-up source_receipt_validation_ok must match the source reconciliation receipt_validation_ok.",
    });
  }

  if (
    followUp.source_receipt_validation_issue_codes.length !==
      expected.source_receipt_validation_issue_codes.length ||
    followUp.source_receipt_validation_issue_codes.some(
      (issueCode, index) =>
        issueCode !== expected.source_receipt_validation_issue_codes[index]
    )
  ) {
    issues.push({
      code: "source_receipt_validation_issue_codes_mismatch",
      message:
        "Provider execution follow-up delivery follow-up source_receipt_validation_issue_codes must match the source reconciliation receipt validation issues.",
    });
  }

  if (followUp.follow_up_state !== expected.follow_up_state) {
    issues.push({
      code: "follow_up_state_mismatch",
      message:
        "Provider execution follow-up delivery follow-up follow_up_state must match the derived post-delivery routing state.",
    });
  }

  if (followUp.follow_up_action !== expected.follow_up_action) {
    issues.push({
      code: "follow_up_action_mismatch",
      message:
        "Provider execution follow-up delivery follow-up follow_up_action must match the derived post-delivery routing action.",
    });
  }

  if (
    followUp.follow_up_delivery_chain_closed !== expected.follow_up_delivery_chain_closed
  ) {
    issues.push({
      code: "follow_up_delivery_chain_closed_mismatch",
      message:
        "Provider execution follow-up delivery follow-up follow_up_delivery_chain_closed must match the derived closure state.",
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
        "Provider execution follow-up delivery follow-up preserved_result_artifact_handoff must keep the trusted source-plan artifact context.",
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
        "Provider execution follow-up delivery follow-up result_artifact_handoff must match the trusted artifact handoff derived from the source reconciliation.",
    });
  }

  if (
    followUp.preserved_active_follow_up_item.item_key !==
      expected.preserved_active_follow_up_item.item_key ||
    followUp.preserved_active_follow_up_item.human_queue !==
      expected.preserved_active_follow_up_item.human_queue ||
    followUp.preserved_active_follow_up_item.should_remain_open !==
      expected.preserved_active_follow_up_item.should_remain_open
  ) {
    issues.push({
      code: "preserved_active_follow_up_item_mismatch",
      message:
        "Provider execution follow-up delivery follow-up preserved_active_follow_up_item must keep the trusted source-plan active follow-up context.",
    });
  }

  if (
    followUp.active_follow_up_item.item_key !== expected.active_follow_up_item.item_key ||
    followUp.active_follow_up_item.human_queue !==
      expected.active_follow_up_item.human_queue ||
    followUp.active_follow_up_item.should_remain_open !==
      expected.active_follow_up_item.should_remain_open
  ) {
    issues.push({
      code: "active_follow_up_item_mismatch",
      message:
        "Provider execution follow-up delivery follow-up active_follow_up_item must match the derived active follow-up item state.",
    });
  }

  if (followUp.automation_step !== expected.automation_step) {
    issues.push({
      code: "automation_step_mismatch",
      message:
        "Provider execution follow-up delivery follow-up automation_step must match the derived next-step contract.",
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
        "Provider execution follow-up delivery follow-up decision_boundary must match the derived post-delivery human-routing boundary.",
    });
  }

  if (!followUpItemsMatch(followUp.follow_up_item, expected.follow_up_item)) {
    issues.push({
      code: "follow_up_item_mismatch",
      message:
        "Provider execution follow-up delivery follow-up follow_up_item must match the derived manual triage item for the post-delivery routing state.",
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

export function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpSourceContract(
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUp
): ProviderExecutionFollowUpDeliveryFollowUpSourceContractValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpSourceContractValidationIssue[] = [];
  const expectedState = deriveExpectedStateFromSourceContract(
    followUp.source_follow_up_action,
    followUp.source_reconciliation_status,
    followUp.source_recommended_follow_up
  );
  const expectedAction =
    expectedState === null ? null : deriveFollowUpAction(expectedState);
  const expectedAutomationStep =
    expectedAction === null || expectedAction === "none" || expectedAction === "defer_to_result_artifact_contract"
      ? "none"
      : "open_inbox_item";
  const expectedRequiresHumanDecision =
    expectedAction === "open_manual_repair_follow_up_delivery_item" ||
    expectedAction === "open_manual_receipt_triage_item";
  const expectedFollowUpItem = buildExpectedFollowUpItemFromSourceContract(followUp);

  if (
    followUp.schema_version !==
    "content-pipeline-review-provider-execution-follow-up-delivery-follow-up/v0.1"
  ) {
    issues.push({
      code: "invalid_follow_up_schema_version",
      message:
        "Provider execution follow-up delivery follow-up schema_version must be content-pipeline-review-provider-execution-follow-up-delivery-follow-up/v0.1.",
    });
  }

  if (expectedState === null || expectedAction === null) {
    issues.push({
      code: "source_reconciliation_contract_mismatch",
      message:
        "Provider execution follow-up delivery follow-up source follow-up action and source reconciliation state must form a valid routing pair.",
    });
  } else if (followUp.follow_up_state !== expectedState) {
    issues.push({
      code: "follow_up_state_mismatch",
      message:
        "Provider execution follow-up delivery follow-up state must match the routing state implied by the source follow-up action and source reconciliation contract.",
    });
  }

  if (expectedAction !== null && followUp.follow_up_action !== expectedAction) {
    issues.push({
      code: "follow_up_action_mismatch",
      message:
        "Provider execution follow-up delivery follow-up action must match the declared follow-up state.",
    });
  }

  const expectedClosed =
    followUp.follow_up_action === "none" ||
    followUp.follow_up_action === "defer_to_result_artifact_contract";
  if (followUp.follow_up_delivery_chain_closed !== expectedClosed) {
    issues.push({
      code: "follow_up_delivery_chain_closed_mismatch",
      message:
        "Provider execution follow-up delivery follow-up closure flag must match whether the declared action opens another human task.",
    });
  }

  if (!resultArtifactHandoffMatchesSourceContract(followUp)) {
    issues.push({
      code: "result_artifact_handoff_contract_mismatch",
      message:
        "Provider execution follow-up delivery follow-up result_artifact_handoff must only be present for trusted result-artifact handoff states.",
    });
  }

  if (!activeFollowUpItemMatchesSourceContract(followUp)) {
    issues.push({
      code: "active_follow_up_item_contract_mismatch",
      message:
        "Provider execution follow-up delivery follow-up active_follow_up_item must satisfy the visibility/open rules for the declared follow-up state.",
    });
  }

  if (followUp.automation_step !== expectedAutomationStep) {
    issues.push({
      code: "automation_step_mismatch",
      message:
        "Provider execution follow-up delivery follow-up automation_step must match whether the declared action opens another human task.",
    });
  }

  if (
    followUp.decision_boundary.requires_provider_execution !== false ||
    followUp.decision_boundary.requires_human_decision !== expectedRequiresHumanDecision ||
    followUp.decision_boundary.provider_execution_allowed_without_human !== false
  ) {
    issues.push({
      code: "decision_boundary_mismatch",
      message:
        "Provider execution follow-up delivery follow-up decision_boundary must match the declared manual-routing requirement.",
    });
  }

  if (!followUpItemsMatch(followUp.follow_up_item, expectedFollowUpItem)) {
    issues.push({
      code: "follow_up_item_contract_mismatch",
      message:
        "Provider execution follow-up delivery follow-up follow_up_item must match the deterministic manual-routing payload for the declared state.",
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

function validateUnitReviewProviderExecutionFollowUpDeliveryFollowUpReconciliationContract(
  plan: UnitReviewProviderExecutionFollowUpPlan,
  reconciliation: UnitReviewProviderExecutionFollowUpReconciliation
): ProviderExecutionFollowUpDeliveryFollowUpSourceContractValidationResult {
  const issues: ProviderExecutionFollowUpDeliveryFollowUpSourceContractValidationIssue[] = [];

  const recommendedAllowed =
    (reconciliation.receipt_validation_ok &&
      reconciliation.reconciliation_status === "closed" &&
      reconciliation.recommended_follow_up === "none") ||
    (reconciliation.receipt_validation_ok &&
      reconciliation.reconciliation_status === "action_required" &&
      reconciliation.recommended_follow_up ===
        "manual_repair_provider_execution_follow_up_delivery") ||
    (!reconciliation.receipt_validation_ok &&
      reconciliation.reconciliation_status === "action_required" &&
      reconciliation.recommended_follow_up === "manual_receipt_triage");

  if (!recommendedAllowed) {
    issues.push({
      code: "source_reconciliation_contract_mismatch",
      message:
        "Provider execution follow-up delivery follow-up source reconciliation must expose a valid reconciliation_status / recommended_follow_up pair.",
    });
  }

  if (
    reconciliation.reconciliation_status === "closed" &&
    reconciliation.recommended_follow_up === "none" &&
    plan.follow_up_action === "defer_to_result_artifact_contract" &&
    reconciliation.result_artifact_handoff === null
  ) {
    issues.push({
      code: "result_artifact_handoff_contract_mismatch",
      message:
        "Provider execution follow-up delivery follow-up source reconciliation must include a trusted result_artifact_handoff when the source follow-up action defers to the result artifact contract.",
    });
  }

  return {
    ok: issues.length === 0,
    issues,
  };
}

function deriveFollowUpState(
  plan: UnitReviewProviderExecutionFollowUpPlan,
  reconciliation: UnitReviewProviderExecutionFollowUpReconciliation
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpState {
  if (!reconciliation.receipt_validation_ok) {
    return "receipt_triage_required";
  }

  if (reconciliation.recommended_follow_up === "manual_receipt_triage") {
    return "receipt_triage_required";
  }

  if (
    reconciliation.reconciliation_status === "action_required" &&
    reconciliation.recommended_follow_up ===
      "manual_repair_provider_execution_follow_up_delivery"
  ) {
    return "repair_follow_up_delivery_required";
  }

  if (
    reconciliation.reconciliation_status === "closed" &&
    reconciliation.recommended_follow_up === "none"
  ) {
    return plan.follow_up_action === "defer_to_result_artifact_contract"
      ? "result_artifact_handoff_ready"
      : "manual_follow_up_item_delivered";
  }

  throw new Error(
    `Unsupported provider execution follow-up delivery follow-up routing combination: ${reconciliation.reconciliation_status}/${reconciliation.recommended_follow_up}.`
  );
}

function deriveFollowUpAction(
  followUpState: UnitReviewProviderExecutionFollowUpDeliveryFollowUpState
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpAction {
  switch (followUpState) {
    case "result_artifact_handoff_ready":
      return "defer_to_result_artifact_contract";
    case "manual_follow_up_item_delivered":
      return "none";
    case "repair_follow_up_delivery_required":
      return "open_manual_repair_follow_up_delivery_item";
    case "receipt_triage_required":
      return "open_manual_receipt_triage_item";
  }
}

function deriveActiveFollowUpItem(
  reconciliation: UnitReviewProviderExecutionFollowUpReconciliation,
  followUpState: UnitReviewProviderExecutionFollowUpDeliveryFollowUpState
): UnitReviewProviderExecutionFollowUpDeliveryFollowUp["active_follow_up_item"] {
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

function derivePreservedActiveFollowUpItem(
  plan: UnitReviewProviderExecutionFollowUpPlan
): UnitReviewProviderExecutionFollowUpDeliveryFollowUp["preserved_active_follow_up_item"] {
  return {
    item_key: plan.final_follow_up_item_key,
    human_queue: plan.final_follow_up_queue,
    should_remain_open: plan.final_follow_up_item_key !== null,
  };
}

function buildDerivedFollowUpItem(
  plan: UnitReviewProviderExecutionFollowUpPlan,
  reconciliation: UnitReviewProviderExecutionFollowUpReconciliation,
  followUpState: UnitReviewProviderExecutionFollowUpDeliveryFollowUpState
): UnitReviewProviderExecutionFollowUpDeliveryFollowUp["follow_up_item"] {
  switch (followUpState) {
    case "result_artifact_handoff_ready":
    case "manual_follow_up_item_delivered":
      return null;
    case "repair_follow_up_delivery_required":
      return buildFollowUpItem(
        plan,
        reconciliation,
        derivePreservedActiveFollowUpItem(plan),
        "repair_follow_up_delivery_required",
        "open_manual_repair_follow_up_delivery_item"
      );
    case "receipt_triage_required":
      return buildFollowUpItem(
        plan,
        reconciliation,
        derivePreservedActiveFollowUpItem(plan),
        "receipt_triage_required",
        "open_manual_receipt_triage_item"
      );
  }
}

function buildFollowUpItem(
  plan: UnitReviewProviderExecutionFollowUpPlan,
  reconciliation: UnitReviewProviderExecutionFollowUpReconciliation,
  preservedActiveFollowUpItem: UnitReviewProviderExecutionFollowUpDeliveryFollowUp["preserved_active_follow_up_item"],
  followUpState: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpState,
    "repair_follow_up_delivery_required" | "receipt_triage_required"
  >,
  followUpAction: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpAction,
    "open_manual_repair_follow_up_delivery_item" | "open_manual_receipt_triage_item"
  >
): NonNullable<UnitReviewProviderExecutionFollowUpDeliveryFollowUp["follow_up_item"]> {
  return {
    item_key: buildFollowUpItemKey(plan.unit_id, plan.attempt_key, followUpState),
    human_queue: "manual_triage_queue",
    title: buildFollowUpTitle(plan.unit_id, followUpState),
    summary: buildFollowUpSummary(
      plan,
      reconciliation,
      preservedActiveFollowUpItem,
      followUpState
    ),
    primary_human_action: "perform_manual_triage",
    automation_step: "open_inbox_item",
    labels: buildFollowUpLabels(
      plan,
      reconciliation,
      preservedActiveFollowUpItem,
      followUpState,
      followUpAction
    ),
  };
}

function buildExpectedFollowUpItemFromSourceContract(
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUp
): UnitReviewProviderExecutionFollowUpDeliveryFollowUp["follow_up_item"] {
  if (
    followUp.follow_up_action === "none" ||
    followUp.follow_up_action === "defer_to_result_artifact_contract"
  ) {
    return null;
  }

  return {
    item_key: buildFollowUpItemKey(
      followUp.unit_id,
      followUp.attempt_key,
      followUp.follow_up_state as Extract<
        UnitReviewProviderExecutionFollowUpDeliveryFollowUpState,
        "repair_follow_up_delivery_required" | "receipt_triage_required"
      >
    ),
    human_queue: "manual_triage_queue",
    title: buildFollowUpTitle(
      followUp.unit_id,
      followUp.follow_up_state as Extract<
        UnitReviewProviderExecutionFollowUpDeliveryFollowUpState,
        "repair_follow_up_delivery_required" | "receipt_triage_required"
      >
    ),
    summary: buildFollowUpSummaryFromSourceContract(followUp),
    primary_human_action: "perform_manual_triage",
    automation_step: "open_inbox_item",
    labels: buildFollowUpLabelsFromSourceContract(followUp),
  };
}

function deriveExpectedStateFromSourceContract(
  sourceFollowUpAction: UnitReviewProviderExecutionFollowUpPlan["follow_up_action"],
  sourceReconciliationStatus: UnitReviewProviderExecutionFollowUpReconciliation["reconciliation_status"],
  sourceRecommendedFollowUp: UnitReviewProviderExecutionFollowUpReconciliation["recommended_follow_up"]
): UnitReviewProviderExecutionFollowUpDeliveryFollowUpState | null {
  if (
    sourceReconciliationStatus === "closed" &&
    sourceRecommendedFollowUp === "none"
  ) {
    return sourceFollowUpAction === "defer_to_result_artifact_contract"
      ? "result_artifact_handoff_ready"
      : "manual_follow_up_item_delivered";
  }

  if (
    sourceReconciliationStatus === "action_required" &&
    sourceRecommendedFollowUp === "manual_repair_provider_execution_follow_up_delivery"
  ) {
    return "repair_follow_up_delivery_required";
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
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpState,
    "repair_follow_up_delivery_required" | "receipt_triage_required"
  >
): string {
  const suffix =
    followUpState === "repair_follow_up_delivery_required"
      ? "provider-follow-up-delivery-repair"
      : "provider-follow-up-delivery-receipt";
  return `content-pipeline:manual_triage_queue:${unitId}:${suffix}:${attemptKey}`;
}

function buildFollowUpTitle(
  unitId: string,
  followUpState: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpState,
    "repair_follow_up_delivery_required" | "receipt_triage_required"
  >
): string {
  return followUpState === "repair_follow_up_delivery_required"
    ? `[Provider Follow-up Delivery Repair] ${unitId}`
    : `[Provider Follow-up Receipt Triage] ${unitId}`;
}

function buildFollowUpSummary(
  plan: UnitReviewProviderExecutionFollowUpPlan,
  reconciliation: UnitReviewProviderExecutionFollowUpReconciliation,
  preservedActiveFollowUpItem: UnitReviewProviderExecutionFollowUpDeliveryFollowUp["preserved_active_follow_up_item"],
  followUpState: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpState,
    "repair_follow_up_delivery_required" | "receipt_triage_required"
  >
): string {
  const activeSummary =
    preservedActiveFollowUpItem.item_key && preservedActiveFollowUpItem.human_queue
      ? `Current trusted follow-up item is ${preservedActiveFollowUpItem.item_key} in ${preservedActiveFollowUpItem.human_queue}.`
      : "No trustworthy follow-up item is currently confirmed.";

  if (followUpState === "repair_follow_up_delivery_required") {
    return `${activeSummary} Provider execution follow-up delivery for attempt ${plan.attempt_key} did not fully apply (delivery status: ${reconciliation.delivery_status ?? "unknown"}). Manual repair is required before this post-execution triage route can be treated as delivered.`;
  }

  return `${activeSummary} Provider execution follow-up delivery receipt for attempt ${plan.attempt_key} did not validate (${reconciliation.receipt_validation_issue_codes.join(", ") || "unknown_receipt_issue"}). Manual receipt triage is required before any further automation or provider-execution follow-up routing.`;
}

function buildFollowUpSummaryFromSourceContract(
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUp
): string {
  const activeSummary =
    followUp.preserved_active_follow_up_item.item_key &&
    followUp.preserved_active_follow_up_item.human_queue
      ? `Current trusted follow-up item is ${followUp.preserved_active_follow_up_item.item_key} in ${followUp.preserved_active_follow_up_item.human_queue}.`
      : "No trustworthy follow-up item is currently confirmed.";

  if (followUp.follow_up_state === "repair_follow_up_delivery_required") {
    return `${activeSummary} Provider execution follow-up delivery for attempt ${followUp.attempt_key} did not fully apply (delivery status: ${followUp.source_delivery_status ?? "unknown"}). Manual repair is required before this post-execution triage route can be treated as delivered.`;
  }

  return `${activeSummary} Provider execution follow-up delivery receipt for attempt ${followUp.attempt_key} did not validate (${followUp.source_receipt_validation_issue_codes.join(", ") || "unknown_receipt_issue"}). Manual receipt triage is required before any further automation or provider-execution follow-up routing.`;
}

function buildFollowUpLabels(
  plan: UnitReviewProviderExecutionFollowUpPlan,
  reconciliation: UnitReviewProviderExecutionFollowUpReconciliation,
  preservedActiveFollowUpItem: UnitReviewProviderExecutionFollowUpDeliveryFollowUp["preserved_active_follow_up_item"],
  followUpState: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpState,
    "repair_follow_up_delivery_required" | "receipt_triage_required"
  >,
  followUpAction: Extract<
    UnitReviewProviderExecutionFollowUpDeliveryFollowUpAction,
    "open_manual_repair_follow_up_delivery_item" | "open_manual_receipt_triage_item"
  >
): string[] {
  const receiptLabel =
    followUpState === "receipt_triage_required"
      ? reconciliation.receipt_validation_issue_codes.join("|") || "unknown_receipt_issue"
      : reconciliation.delivery_status ?? "unknown";

  return [
    "content_pipeline_review",
    "provider_execution_follow_up_delivery_follow_up",
    "queue:manual_triage_queue",
    `follow_up_state:${followUpState}`,
    `action:${followUpAction}`,
    `source_follow_up_state:${plan.follow_up_state}`,
    `delivery_status:${reconciliation.delivery_status ?? "untrusted"}`,
    `active_queue:${preservedActiveFollowUpItem.human_queue ?? "none"}`,
    followUpState === "receipt_triage_required"
      ? `receipt_validation:${receiptLabel}`
      : `repair_signal:${receiptLabel}`,
  ];
}

function buildFollowUpLabelsFromSourceContract(
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUp
): string[] {
  const receiptLabel =
    followUp.follow_up_state === "receipt_triage_required"
      ? "source_receipt_validation_issue"
      : followUp.source_delivery_status ?? "unknown";

  return [
    "content_pipeline_review",
    "provider_execution_follow_up_delivery_follow_up",
    "queue:manual_triage_queue",
    `follow_up_state:${followUp.follow_up_state}`,
    `action:${followUp.follow_up_action}`,
    `source_follow_up_state:${followUp.source_follow_up_state}`,
    `delivery_status:${followUp.source_delivery_status ?? "untrusted"}`,
    `active_queue:${followUp.preserved_active_follow_up_item.human_queue ?? "none"}`,
    followUp.follow_up_state === "receipt_triage_required"
      ? `receipt_validation:${followUp.source_receipt_validation_issue_codes.join("|") || receiptLabel}`
      : `repair_signal:${receiptLabel}`,
  ];
}

function resultArtifactHandoffsMatch(
  actual: UnitReviewProviderExecutionFollowUpDeliveryFollowUp["result_artifact_handoff"],
  expected: UnitReviewProviderExecutionFollowUpDeliveryFollowUp["result_artifact_handoff"]
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
  actual: UnitReviewProviderExecutionFollowUpDeliveryFollowUp["follow_up_item"],
  expected: UnitReviewProviderExecutionFollowUpDeliveryFollowUp["follow_up_item"]
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

function resultArtifactHandoffMatchesSourceContract(
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUp
): boolean {
  switch (followUp.follow_up_state) {
    case "result_artifact_handoff_ready":
      return followUp.result_artifact_handoff !== null;
    case "manual_follow_up_item_delivered":
    case "repair_follow_up_delivery_required":
    case "receipt_triage_required":
      return followUp.result_artifact_handoff === null;
  }
}

function activeFollowUpItemMatchesSourceContract(
  followUp: UnitReviewProviderExecutionFollowUpDeliveryFollowUp
): boolean {
  if (
    followUp.active_follow_up_item.item_key === null &&
    followUp.active_follow_up_item.human_queue !== null
  ) {
    return false;
  }

  switch (followUp.follow_up_state) {
    case "result_artifact_handoff_ready":
      return (
        followUp.active_follow_up_item.item_key === null &&
        followUp.active_follow_up_item.human_queue === null &&
        !followUp.active_follow_up_item.should_remain_open
      );
    case "manual_follow_up_item_delivered":
      return (
        followUp.active_follow_up_item.item_key !== null &&
        followUp.active_follow_up_item.human_queue !== null &&
        followUp.active_follow_up_item.should_remain_open
      );
    case "repair_follow_up_delivery_required":
    case "receipt_triage_required":
      return (
        followUp.active_follow_up_item.item_key === null &&
        followUp.active_follow_up_item.human_queue === null &&
        !followUp.active_follow_up_item.should_remain_open
      );
  }
}
