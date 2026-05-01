import type { UnitReviewHumanQueue, UnitReviewPrimaryHumanAction } from "./orchestration-guidance";
import type { UnitReviewInboxDeliveryPlan } from "./inbox-delivery-plan";
import type { UnitReviewInboxDeliveryReconciliation } from "./inbox-delivery-reconciliation";

export type UnitReviewInboxDeliveryFollowUpState =
  | "delivery_closed"
  | "cleanup_predecessor_required"
  | "repair_delivery_required"
  | "receipt_triage_required";

export type UnitReviewInboxDeliveryFollowUpAction =
  | "none"
  | "open_manual_cleanup_follow_up_item"
  | "open_manual_repair_follow_up_item"
  | "open_manual_receipt_triage_item";

export interface UnitReviewInboxDeliveryFollowUp {
  schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1";
  source_plan_schema_version: UnitReviewInboxDeliveryPlan["schema_version"];
  source_reconciliation_schema_version: UnitReviewInboxDeliveryReconciliation["schema_version"];
  chain_key: string;
  source_item_key: string;
  source_reconciliation_status: UnitReviewInboxDeliveryReconciliation["reconciliation_status"];
  source_recommended_follow_up: UnitReviewInboxDeliveryReconciliation["recommended_follow_up"];
  follow_up_state: UnitReviewInboxDeliveryFollowUpState;
  follow_up_action: UnitReviewInboxDeliveryFollowUpAction;
  delivery_chain_closed: boolean;
  active_item: {
    item_key: string | null;
    human_queue: UnitReviewHumanQueue | null;
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

export interface InboxDeliveryFollowUpValidationIssue {
  code:
    | "invalid_follow_up_schema_version"
    | "source_plan_schema_version_mismatch"
    | "source_reconciliation_schema_version_mismatch"
    | "chain_key_mismatch"
    | "source_item_key_mismatch"
    | "source_reconciliation_status_mismatch"
    | "source_recommended_follow_up_mismatch"
    | "follow_up_state_mismatch"
    | "follow_up_action_mismatch"
    | "delivery_chain_closed_mismatch"
    | "active_item_state_mismatch"
    | "automation_step_mismatch"
    | "decision_boundary_mismatch"
    | "follow_up_item_mismatch";
  message: string;
}

export interface InboxDeliveryFollowUpValidationResult {
  ok: boolean;
  issues: InboxDeliveryFollowUpValidationIssue[];
}

export interface InboxDeliveryFollowUpSourceValidationIssue {
  code:
    | "invalid_reconciliation_schema_version"
    | "source_plan_schema_version_mismatch"
    | "chain_key_mismatch"
    | "source_item_key_mismatch"
    | "reconciliation_status_mismatch"
    | "recommended_follow_up_mismatch";
  message: string;
}

export interface InboxDeliveryFollowUpSourceValidationResult {
  ok: boolean;
  issues: InboxDeliveryFollowUpSourceValidationIssue[];
}

export interface InboxDeliveryFollowUpSourceContractValidationIssue {
  code:
    | "invalid_follow_up_schema_version"
    | "source_reconciliation_contract_mismatch"
    | "follow_up_state_mismatch"
    | "follow_up_action_mismatch"
    | "delivery_chain_closed_mismatch"
    | "active_item_contract_mismatch"
    | "automation_step_mismatch"
    | "decision_boundary_mismatch"
    | "follow_up_item_contract_mismatch";
  message: string;
}

export interface InboxDeliveryFollowUpSourceContractValidationResult {
  ok: boolean;
  issues: InboxDeliveryFollowUpSourceContractValidationIssue[];
}

export function buildUnitReviewInboxDeliveryFollowUp(
  plan: UnitReviewInboxDeliveryPlan,
  reconciliation: UnitReviewInboxDeliveryReconciliation
): UnitReviewInboxDeliveryFollowUp {
  const followUpState = deriveFollowUpState(reconciliation);
  const followUpAction = deriveFollowUpAction(followUpState);
  const activeItem = deriveActiveItem(reconciliation, followUpState);
  const followUpItem = buildDerivedFollowUpItem(plan, activeItem, followUpState, followUpAction);

  return {
    schema_version: "content-pipeline-review-inbox-delivery-follow-up/v0.1",
    source_plan_schema_version: plan.schema_version,
    source_reconciliation_schema_version: reconciliation.schema_version,
    chain_key: plan.chain_key,
    source_item_key: plan.source_item_key,
    source_reconciliation_status: reconciliation.reconciliation_status,
    source_recommended_follow_up: reconciliation.recommended_follow_up,
    follow_up_state: followUpState,
    follow_up_action: followUpAction,
    delivery_chain_closed: followUpAction === "none",
    active_item: activeItem,
    automation_step: followUpItem ? "open_inbox_item" : "none",
    decision_boundary: {
      requires_provider_execution: false,
      requires_human_decision: followUpItem !== null,
      provider_execution_allowed_without_human: false
    },
    follow_up_item: followUpItem
  };
}

export function validateUnitReviewInboxDeliveryFollowUpSource(
  plan: UnitReviewInboxDeliveryPlan,
  reconciliation: UnitReviewInboxDeliveryReconciliation
): InboxDeliveryFollowUpSourceValidationResult {
  const issues: InboxDeliveryFollowUpSourceValidationIssue[] = [];
  const expected = deriveExpectedReconciliationContract(reconciliation);

  if (reconciliation.schema_version !== "content-pipeline-review-inbox-delivery-reconciliation/v0.1") {
    issues.push({
      code: "invalid_reconciliation_schema_version",
      message:
        "Follow-up source reconciliation schema_version must be content-pipeline-review-inbox-delivery-reconciliation/v0.1."
    });
  }

  if (reconciliation.source_plan_schema_version !== plan.schema_version) {
    issues.push({
      code: "source_plan_schema_version_mismatch",
      message: "Follow-up source reconciliation must reference the same delivery plan schema_version."
    });
  }

  if (reconciliation.chain_key !== plan.chain_key) {
    issues.push({
      code: "chain_key_mismatch",
      message: "Follow-up source reconciliation chain_key must match the source delivery plan chain_key."
    });
  }

  if (reconciliation.source_item_key !== plan.source_item_key) {
    issues.push({
      code: "source_item_key_mismatch",
      message: "Follow-up source reconciliation source_item_key must match the source delivery plan source_item_key."
    });
  }

  if (reconciliation.reconciliation_status !== expected.reconciliation_status) {
    issues.push({
      code: "reconciliation_status_mismatch",
      message: "Follow-up source reconciliation status is inconsistent with its validation state and delivery outcome."
    });
  }

  if (reconciliation.recommended_follow_up !== expected.recommended_follow_up) {
    issues.push({
      code: "recommended_follow_up_mismatch",
      message:
        "Follow-up source reconciliation recommended_follow_up is inconsistent with its validation state and delivery outcome."
    });
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

export function validateUnitReviewInboxDeliveryFollowUp(
  plan: UnitReviewInboxDeliveryPlan,
  reconciliation: UnitReviewInboxDeliveryReconciliation,
  followUp: UnitReviewInboxDeliveryFollowUp
): InboxDeliveryFollowUpValidationResult {
  const issues: InboxDeliveryFollowUpValidationIssue[] = [];
  const expected = buildUnitReviewInboxDeliveryFollowUp(plan, reconciliation);

  if (followUp.schema_version !== "content-pipeline-review-inbox-delivery-follow-up/v0.1") {
    issues.push({
      code: "invalid_follow_up_schema_version",
      message: "Inbox delivery follow-up schema_version must be content-pipeline-review-inbox-delivery-follow-up/v0.1."
    });
  }

  if (followUp.source_plan_schema_version !== expected.source_plan_schema_version) {
    issues.push({
      code: "source_plan_schema_version_mismatch",
      message: "Follow-up source_plan_schema_version must match the source delivery plan schema_version."
    });
  }

  if (followUp.source_reconciliation_schema_version !== expected.source_reconciliation_schema_version) {
    issues.push({
      code: "source_reconciliation_schema_version_mismatch",
      message: "Follow-up source_reconciliation_schema_version must match the source reconciliation schema_version."
    });
  }

  if (followUp.chain_key !== expected.chain_key) {
    issues.push({
      code: "chain_key_mismatch",
      message: "Follow-up chain_key must match the source plan/reconciliation chain_key."
    });
  }

  if (followUp.source_item_key !== expected.source_item_key) {
    issues.push({
      code: "source_item_key_mismatch",
      message: "Follow-up source_item_key must match the source plan/reconciliation source_item_key."
    });
  }

  if (followUp.source_reconciliation_status !== expected.source_reconciliation_status) {
    issues.push({
      code: "source_reconciliation_status_mismatch",
      message: "Follow-up source_reconciliation_status must match the source reconciliation status."
    });
  }

  if (followUp.source_recommended_follow_up !== expected.source_recommended_follow_up) {
    issues.push({
      code: "source_recommended_follow_up_mismatch",
      message: "Follow-up source_recommended_follow_up must match the source reconciliation recommended follow-up."
    });
  }

  if (followUp.follow_up_state !== expected.follow_up_state) {
    issues.push({
      code: "follow_up_state_mismatch",
      message: "Follow-up state must match the derived routing state for the source reconciliation."
    });
  }

  if (followUp.follow_up_action !== expected.follow_up_action) {
    issues.push({
      code: "follow_up_action_mismatch",
      message: "Follow-up action must match the derived automation action for the source reconciliation."
    });
  }

  if (followUp.delivery_chain_closed !== expected.delivery_chain_closed) {
    issues.push({
      code: "delivery_chain_closed_mismatch",
      message: "Follow-up delivery_chain_closed must match the derived closure state for the source reconciliation."
    });
  }

  if (
    followUp.active_item.item_key !== expected.active_item.item_key ||
    followUp.active_item.human_queue !== expected.active_item.human_queue ||
    followUp.active_item.should_remain_open !== expected.active_item.should_remain_open
  ) {
    issues.push({
      code: "active_item_state_mismatch",
      message: "Follow-up active_item must match the derived active item handling for the source reconciliation."
    });
  }

  if (followUp.automation_step !== expected.automation_step) {
    issues.push({
      code: "automation_step_mismatch",
      message: "Follow-up automation_step must match the derived automation step for the source reconciliation."
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
      message: "Follow-up decision_boundary must match the derived boundary for the source reconciliation."
    });
  }

  if (!followUpItemsMatch(followUp.follow_up_item, expected.follow_up_item)) {
    issues.push({
      code: "follow_up_item_mismatch",
      message: "Follow-up follow_up_item must match the derived manual-routing item for the source reconciliation."
    });
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

export function validateUnitReviewInboxDeliveryFollowUpSourceContract(
  followUp: UnitReviewInboxDeliveryFollowUp
): InboxDeliveryFollowUpSourceContractValidationResult {
  const issues: InboxDeliveryFollowUpSourceContractValidationIssue[] = [];
  const expectedState = deriveExpectedFollowUpStateFromSourceContract(
    followUp.source_reconciliation_status,
    followUp.source_recommended_follow_up
  );
  const expectedAction = deriveFollowUpAction(followUp.follow_up_state);
  const expectedAutomationStep = followUp.follow_up_action === "none" ? "none" : "open_inbox_item";
  const expectedDecisionBoundary = {
    requires_provider_execution: false as const,
    requires_human_decision: followUp.follow_up_action !== "none",
    provider_execution_allowed_without_human: false as const
  };
  const expectedFollowUpItem = buildExpectedFollowUpItemFromSourceContract(followUp);

  if (followUp.schema_version !== "content-pipeline-review-inbox-delivery-follow-up/v0.1") {
    issues.push({
      code: "invalid_follow_up_schema_version",
      message: "Follow-up schema_version must be content-pipeline-review-inbox-delivery-follow-up/v0.1."
    });
  }

  if (expectedState === null) {
    issues.push({
      code: "source_reconciliation_contract_mismatch",
      message:
        "Follow-up source_reconciliation_status/source_recommended_follow_up must form a valid routing pair."
    });
  } else if (followUp.follow_up_state !== expectedState) {
    issues.push({
      code: "follow_up_state_mismatch",
      message: "Follow-up state must match the routing state implied by the source reconciliation contract."
    });
  }

  if (followUp.follow_up_action !== expectedAction) {
    issues.push({
      code: "follow_up_action_mismatch",
      message: "Follow-up action must match the declared follow-up state."
    });
  }

  if (followUp.delivery_chain_closed !== (followUp.follow_up_action === "none")) {
    issues.push({
      code: "delivery_chain_closed_mismatch",
      message: "Follow-up delivery_chain_closed must match whether the declared follow-up action is none."
    });
  }

  if (!activeItemMatchesSourceContract(followUp)) {
    issues.push({
      code: "active_item_contract_mismatch",
      message: "Follow-up active_item must satisfy the visibility and open/closed rules for the declared follow-up state."
    });
  }

  if (followUp.automation_step !== expectedAutomationStep) {
    issues.push({
      code: "automation_step_mismatch",
      message: "Follow-up automation_step must match whether the declared follow-up action opens a manual inbox item."
    });
  }

  if (
    followUp.decision_boundary.requires_provider_execution !== expectedDecisionBoundary.requires_provider_execution ||
    followUp.decision_boundary.requires_human_decision !== expectedDecisionBoundary.requires_human_decision ||
    followUp.decision_boundary.provider_execution_allowed_without_human !==
      expectedDecisionBoundary.provider_execution_allowed_without_human
  ) {
    issues.push({
      code: "decision_boundary_mismatch",
      message: "Follow-up decision_boundary must match the declared manual-routing requirement."
    });
  }

  if (!followUpItemsMatch(followUp.follow_up_item, expectedFollowUpItem)) {
    issues.push({
      code: "follow_up_item_contract_mismatch",
      message: "Follow-up follow_up_item must match the deterministic manual-routing payload for the declared state."
    });
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

function deriveFollowUpState(
  reconciliation: UnitReviewInboxDeliveryReconciliation
): UnitReviewInboxDeliveryFollowUpState {
  if (
    reconciliation.reconciliation_status === "closed" &&
    reconciliation.recommended_follow_up === "none"
  ) {
    return "delivery_closed";
  }

  if (reconciliation.recommended_follow_up === "manual_cleanup_predecessor") {
    return "cleanup_predecessor_required";
  }

  if (reconciliation.recommended_follow_up === "manual_repair_delivery") {
    return "repair_delivery_required";
  }

  return "receipt_triage_required";
}

function deriveExpectedReconciliationContract(reconciliation: UnitReviewInboxDeliveryReconciliation): Pick<
  UnitReviewInboxDeliveryReconciliation,
  "reconciliation_status" | "recommended_follow_up"
> {
  if (!reconciliation.receipt_validation_ok) {
    return {
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_receipt_triage"
    };
  }

  if (reconciliation.delivery_status === "applied") {
    return {
      reconciliation_status: "closed",
      recommended_follow_up: "none"
    };
  }

  if (
    reconciliation.unresolved_operations.length > 0 &&
    reconciliation.unresolved_operations.every((operation) => operation.operation_type === "close")
  ) {
    return {
      reconciliation_status: "action_required",
      recommended_follow_up: "manual_cleanup_predecessor"
    };
  }

  return {
    reconciliation_status: "action_required",
    recommended_follow_up: "manual_repair_delivery"
  };
}

function deriveFollowUpAction(
  followUpState: UnitReviewInboxDeliveryFollowUpState
): UnitReviewInboxDeliveryFollowUpAction {
  switch (followUpState) {
    case "delivery_closed":
      return "none";
    case "cleanup_predecessor_required":
      return "open_manual_cleanup_follow_up_item";
    case "repair_delivery_required":
      return "open_manual_repair_follow_up_item";
    case "receipt_triage_required":
      return "open_manual_receipt_triage_item";
  }
}

function buildFollowUpItem(
  chainKey: string,
  sourceItemKey: string,
  activeItem: UnitReviewInboxDeliveryFollowUp["active_item"],
  followUpState: Exclude<UnitReviewInboxDeliveryFollowUpState, "delivery_closed">,
  followUpAction: Exclude<UnitReviewInboxDeliveryFollowUpAction, "none">
): NonNullable<UnitReviewInboxDeliveryFollowUp["follow_up_item"]> {
  const unitId = extractUnitId(sourceItemKey);
  return {
    item_key: buildFollowUpItemKey(sourceItemKey, followUpState),
    human_queue: "manual_triage_queue",
    title: buildFollowUpTitle(unitId, followUpState),
    summary: buildFollowUpSummaryFromActiveItem(activeItem, followUpState),
    primary_human_action: "perform_manual_triage",
    automation_step: "open_inbox_item",
    labels: [
      "content_pipeline_delivery_follow_up",
      `chain:${chainKey}`,
      `source_item:${sourceItemKey}`,
      `state:${followUpState}`,
      `action:${followUpAction}`,
      `active_queue:${activeItem.human_queue ?? "none"}`
    ]
  };
}

function buildFollowUpItemKey(sourceItemKey: string, followUpState: string): string {
  return `content-pipeline:delivery-follow-up:${followUpState}:${sourceItemKey}`;
}

function buildFollowUpTitle(unitId: string, followUpState: Exclude<UnitReviewInboxDeliveryFollowUpState, "delivery_closed">): string {
  switch (followUpState) {
    case "cleanup_predecessor_required":
      return `[Delivery Cleanup] ${unitId}`;
    case "repair_delivery_required":
      return `[Delivery Repair] ${unitId}`;
    case "receipt_triage_required":
      return `[Receipt Triage] ${unitId}`;
  }
}

function deriveActiveItem(
  reconciliation: UnitReviewInboxDeliveryReconciliation,
  followUpState: UnitReviewInboxDeliveryFollowUpState
): UnitReviewInboxDeliveryFollowUp["active_item"] {
  if (followUpState === "receipt_triage_required" || followUpState === "repair_delivery_required") {
    return {
      item_key: null,
      human_queue: null,
      should_remain_open: false
    };
  }

  return {
    item_key: reconciliation.final_active_item_key,
    human_queue: reconciliation.final_active_queue,
    should_remain_open: reconciliation.final_active_item_key !== null
  };
}

function extractUnitId(sourceItemKey: string): string {
  const match = /^content-pipeline:(approval_queue|rerun_decision_queue|manual_triage_queue):([^:]+):.+$/.exec(
    sourceItemKey
  );
  return match?.[2] ?? "unknown_unit";
}

function followUpItemsMatch(
  actual: UnitReviewInboxDeliveryFollowUp["follow_up_item"],
  expected: UnitReviewInboxDeliveryFollowUp["follow_up_item"]
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

function buildDerivedFollowUpItem(
  plan: UnitReviewInboxDeliveryPlan,
  activeItem: UnitReviewInboxDeliveryFollowUp["active_item"],
  followUpState: UnitReviewInboxDeliveryFollowUpState,
  _followUpAction: UnitReviewInboxDeliveryFollowUpAction
): UnitReviewInboxDeliveryFollowUp["follow_up_item"] {
  switch (followUpState) {
    case "delivery_closed":
      return null;
    case "cleanup_predecessor_required":
      return buildFollowUpItem(
        plan.chain_key,
        plan.source_item_key,
        activeItem,
        "cleanup_predecessor_required",
        "open_manual_cleanup_follow_up_item"
      );
    case "repair_delivery_required":
      return buildFollowUpItem(
        plan.chain_key,
        plan.source_item_key,
        activeItem,
        "repair_delivery_required",
        "open_manual_repair_follow_up_item"
      );
    case "receipt_triage_required":
      return buildFollowUpItem(
        plan.chain_key,
        plan.source_item_key,
        activeItem,
        "receipt_triage_required",
        "open_manual_receipt_triage_item"
      );
  }
}

function deriveExpectedFollowUpStateFromSourceContract(
  reconciliationStatus: UnitReviewInboxDeliveryFollowUp["source_reconciliation_status"],
  recommendedFollowUp: UnitReviewInboxDeliveryFollowUp["source_recommended_follow_up"]
): UnitReviewInboxDeliveryFollowUpState | null {
  if (reconciliationStatus === "closed" && recommendedFollowUp === "none") {
    return "delivery_closed";
  }

  if (reconciliationStatus !== "action_required") {
    return null;
  }

  switch (recommendedFollowUp) {
    case "manual_cleanup_predecessor":
      return "cleanup_predecessor_required";
    case "manual_repair_delivery":
      return "repair_delivery_required";
    case "manual_receipt_triage":
      return "receipt_triage_required";
    default:
      return null;
  }
}

function activeItemMatchesSourceContract(followUp: UnitReviewInboxDeliveryFollowUp): boolean {
  if (followUp.active_item.item_key === null && followUp.active_item.human_queue !== null) {
    return false;
  }

  switch (followUp.follow_up_state) {
    case "delivery_closed":
    case "cleanup_predecessor_required":
      return (
        followUp.active_item.item_key !== null &&
        followUp.active_item.human_queue !== null &&
        followUp.active_item.should_remain_open
      );
    case "repair_delivery_required":
      return (
        followUp.active_item.item_key === null &&
        followUp.active_item.human_queue === null &&
        !followUp.active_item.should_remain_open
      );
    case "receipt_triage_required":
      return (
        followUp.active_item.item_key === null &&
        followUp.active_item.human_queue === null &&
        !followUp.active_item.should_remain_open
      );
  }
}

function buildExpectedFollowUpItemFromSourceContract(
  followUp: UnitReviewInboxDeliveryFollowUp
): UnitReviewInboxDeliveryFollowUp["follow_up_item"] {
  if (followUp.follow_up_action === "none" || followUp.follow_up_state === "delivery_closed") {
    return null;
  }

  const unitId = extractUnitId(followUp.source_item_key);
  return {
    item_key: buildFollowUpItemKey(followUp.source_item_key, followUp.follow_up_state),
    human_queue: "manual_triage_queue",
    title: buildFollowUpTitle(unitId, followUp.follow_up_state),
    summary: buildFollowUpSummaryFromActiveItem(followUp.active_item, followUp.follow_up_state),
    primary_human_action: "perform_manual_triage",
    automation_step: "open_inbox_item",
    labels: [
      "content_pipeline_delivery_follow_up",
      `chain:${followUp.chain_key}`,
      `source_item:${followUp.source_item_key}`,
      `state:${followUp.follow_up_state}`,
      `action:${followUp.follow_up_action}`,
      `active_queue:${followUp.active_item.human_queue ?? "none"}`
    ]
  };
}

function buildFollowUpSummaryFromActiveItem(
  activeItem: {
    item_key: string | null;
    human_queue: UnitReviewHumanQueue | null;
  },
  followUpState: Exclude<UnitReviewInboxDeliveryFollowUpState, "delivery_closed">
): string {
  const activeItemSummary =
    activeItem.item_key && activeItem.human_queue
      ? `Current active inbox item is ${activeItem.item_key} in ${activeItem.human_queue}.`
      : "No trustworthy active inbox item is currently confirmed.";

  switch (followUpState) {
    case "cleanup_predecessor_required":
      return `${activeItemSummary} The replacement delivery left a predecessor item open, so manual cleanup is required for the superseded inbox item.`;
    case "repair_delivery_required":
      return `${activeItemSummary} Inbox delivery did not fully apply, so manual repair is required before trusting this delivery chain as complete.`;
    case "receipt_triage_required":
      return `${activeItemSummary} The delivery receipt did not validate against its source plan/reconciliation, so manual receipt triage is required before any further automation.`;
  }
}
