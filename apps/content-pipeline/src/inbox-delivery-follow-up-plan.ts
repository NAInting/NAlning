import type { UnitReviewInboxDeliveryFollowUp } from "./inbox-delivery-follow-up";

export type UnitReviewInboxDeliveryFollowUpPlanAction = "none" | "create_follow_up_inbox_item";

export interface UnitReviewInboxDeliveryFollowUpPlan {
  schema_version: "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1";
  source_follow_up_schema_version: UnitReviewInboxDeliveryFollowUp["schema_version"];
  chain_key: string;
  source_item_key: string;
  follow_up_state: UnitReviewInboxDeliveryFollowUp["follow_up_state"];
  follow_up_action: UnitReviewInboxDeliveryFollowUp["follow_up_action"];
  preserved_active_item: UnitReviewInboxDeliveryFollowUp["active_item"];
  delivery_action: UnitReviewInboxDeliveryFollowUpPlanAction;
  final_follow_up_item_key: string | null;
  final_follow_up_queue: UnitReviewInboxDeliveryFollowUp["follow_up_item"] extends infer T
    ? T extends { human_queue: infer Queue }
      ? Queue | null
      : null
    : null;
  upsert:
    | null
    | {
        operation_key: string;
        item_key: string;
        human_queue: NonNullable<UnitReviewInboxDeliveryFollowUp["follow_up_item"]>["human_queue"];
        title: string;
        summary: string;
        primary_human_action: NonNullable<UnitReviewInboxDeliveryFollowUp["follow_up_item"]>["primary_human_action"];
        automation_step: NonNullable<UnitReviewInboxDeliveryFollowUp["follow_up_item"]>["automation_step"];
        labels: string[];
      };
  decision_boundary: UnitReviewInboxDeliveryFollowUp["decision_boundary"];
}

export interface InboxDeliveryFollowUpPlanValidationIssue {
  code:
    | "invalid_schema_version"
    | "source_follow_up_schema_version_mismatch"
    | "chain_key_mismatch"
    | "source_item_key_mismatch"
    | "follow_up_state_mismatch"
    | "follow_up_action_mismatch"
    | "preserved_active_item_mismatch"
    | "delivery_action_mismatch"
    | "final_follow_up_state_mismatch"
    | "upsert_presence_mismatch"
    | "upsert_operation_key_mismatch"
    | "upsert_payload_mismatch"
    | "decision_boundary_mismatch";
  message: string;
}

export interface InboxDeliveryFollowUpPlanValidationResult {
  ok: boolean;
  issues: InboxDeliveryFollowUpPlanValidationIssue[];
}

export function buildUnitReviewInboxDeliveryFollowUpPlan(
  followUp: UnitReviewInboxDeliveryFollowUp
): UnitReviewInboxDeliveryFollowUpPlan {
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
    schema_version: "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1",
    source_follow_up_schema_version: followUp.schema_version,
    chain_key: followUp.chain_key,
    source_item_key: followUp.source_item_key,
    follow_up_state: followUp.follow_up_state,
    follow_up_action: followUp.follow_up_action,
    preserved_active_item: followUp.active_item,
    delivery_action: upsert ? "create_follow_up_inbox_item" : "none",
    final_follow_up_item_key: upsert?.item_key ?? null,
    final_follow_up_queue: upsert?.human_queue ?? null,
    upsert,
    decision_boundary: followUp.decision_boundary
  };
}

export function validateUnitReviewInboxDeliveryFollowUpPlan(
  followUp: UnitReviewInboxDeliveryFollowUp,
  plan: UnitReviewInboxDeliveryFollowUpPlan
): InboxDeliveryFollowUpPlanValidationResult {
  const issues: InboxDeliveryFollowUpPlanValidationIssue[] = [];
  const expected = buildUnitReviewInboxDeliveryFollowUpPlan(followUp);

  if (plan.schema_version !== "content-pipeline-review-inbox-delivery-follow-up-plan/v0.1") {
    issues.push({
      code: "invalid_schema_version",
      message:
        "Follow-up delivery plan schema_version must be content-pipeline-review-inbox-delivery-follow-up-plan/v0.1."
    });
  }

  if (plan.source_follow_up_schema_version !== expected.source_follow_up_schema_version) {
    issues.push({
      code: "source_follow_up_schema_version_mismatch",
      message: "Follow-up delivery plan source_follow_up_schema_version must match the source follow-up schema_version."
    });
  }

  if (plan.chain_key !== expected.chain_key) {
    issues.push({
      code: "chain_key_mismatch",
      message: "Follow-up delivery plan chain_key must match the source follow-up chain_key."
    });
  }

  if (plan.source_item_key !== expected.source_item_key) {
    issues.push({
      code: "source_item_key_mismatch",
      message: "Follow-up delivery plan source_item_key must match the source follow-up source_item_key."
    });
  }

  if (plan.follow_up_state !== expected.follow_up_state) {
    issues.push({
      code: "follow_up_state_mismatch",
      message: "Follow-up delivery plan follow_up_state must match the source follow-up state."
    });
  }

  if (plan.follow_up_action !== expected.follow_up_action) {
    issues.push({
      code: "follow_up_action_mismatch",
      message: "Follow-up delivery plan follow_up_action must match the source follow-up action."
    });
  }

  if (
    plan.preserved_active_item.item_key !== expected.preserved_active_item.item_key ||
    plan.preserved_active_item.human_queue !== expected.preserved_active_item.human_queue ||
    plan.preserved_active_item.should_remain_open !== expected.preserved_active_item.should_remain_open
  ) {
    issues.push({
      code: "preserved_active_item_mismatch",
      message: "Follow-up delivery plan preserved_active_item must match the source follow-up active item contract."
    });
  }

  if (plan.delivery_action !== expected.delivery_action) {
    issues.push({
      code: "delivery_action_mismatch",
      message: "Follow-up delivery plan delivery_action must match whether the source follow-up requires a new inbox item."
    });
  }

  if (
    plan.final_follow_up_item_key !== expected.final_follow_up_item_key ||
    plan.final_follow_up_queue !== expected.final_follow_up_queue
  ) {
    issues.push({
      code: "final_follow_up_state_mismatch",
      message: "Follow-up delivery plan final follow-up item state must match the derived follow-up delivery target."
    });
  }

  if ((plan.upsert === null) !== (expected.upsert === null)) {
    issues.push({
      code: "upsert_presence_mismatch",
      message: "Follow-up delivery plan upsert presence must match whether the source follow-up includes a follow_up_item."
    });
  }

  if (plan.upsert && expected.upsert) {
    const expectedOperationKey = buildFollowUpUpsertOperationKey(plan.upsert.item_key);
    if (plan.upsert.operation_key !== expectedOperationKey) {
      issues.push({
        code: "upsert_operation_key_mismatch",
        message:
          "Follow-up delivery plan upsert.operation_key must match the deterministic follow-up upsert key for upsert.item_key."
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
        message: "Follow-up delivery plan upsert payload must match the source follow-up item exactly."
      });
    }
  }

  if (
    plan.decision_boundary.requires_provider_execution !== expected.decision_boundary.requires_provider_execution ||
    plan.decision_boundary.requires_human_decision !== expected.decision_boundary.requires_human_decision ||
    plan.decision_boundary.provider_execution_allowed_without_human !==
      expected.decision_boundary.provider_execution_allowed_without_human
  ) {
    issues.push({
      code: "decision_boundary_mismatch",
      message: "Follow-up delivery plan decision_boundary must match the source follow-up decision boundary."
    });
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

function buildFollowUpUpsertOperationKey(itemKey: string): string {
  return `content-pipeline:follow-up-delivery:upsert:${itemKey}`;
}
