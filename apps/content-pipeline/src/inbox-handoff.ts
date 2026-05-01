import {
  deriveUnitReviewOrchestrationGuidance,
  type UnitReviewHumanQueue,
  type UnitReviewOrchestrationAction,
  type UnitReviewPrimaryHumanAction
} from "./orchestration-guidance";
import {
  buildUnitReviewRepairRequest,
  validateUnitReviewRepairRequestSource,
  type UnitReviewRepairRequest
} from "./repair-request";
import type { UnitReviewArtifact } from "./review-runner";

export interface UnitReviewInboxHandoff {
  schema_version: "content-pipeline-review-inbox-item/v0.1";
  item_key: string;
  chain_key: string;
  predecessor_item_key: string | null;
  delivery_action: "create_inbox_item" | "replace_predecessor_inbox_item";
  unit_id: string;
  artifact_generated_at: string;
  artifact_status: UnitReviewArtifact["status"];
  human_queue: UnitReviewHumanQueue;
  title: string;
  summary: string;
  primary_human_action: UnitReviewPrimaryHumanAction;
  automation_step: "open_inbox_item";
  decision_boundary: {
    requires_provider_execution: boolean;
    requires_human_decision: boolean;
    provider_execution_allowed_without_human: false;
  };
  labels: string[];
  metadata: {
    orchestration_action: UnitReviewOrchestrationAction;
    recommended_rerun_from: string | null;
    rerun_chain_depth: number;
    retry_decision: UnitReviewArtifact["retry_policy"] extends infer T
      ? T extends { decision: infer D }
        ? D | null
        : null
      : null;
    repair_plan_source: UnitReviewArtifact["repair_plan"] extends infer T
      ? T extends { source: infer S }
        ? S | null
        : null
      : null;
    repair_request?: {
      request_key: string;
      repair_action: UnitReviewRepairRequest["repair_action"];
      repair_strategy: UnitReviewRepairRequest["repair_strategy"];
      requested_start_role: UnitReviewRepairRequest["requested_start_role"];
      requested_role_count: number;
      requires_provider_execution: false;
      requires_source_writeback: false;
      blocked_artifact_approval_allowed: false;
    };
  };
}

export function buildUnitReviewInboxHandoff(artifact: UnitReviewArtifact): UnitReviewInboxHandoff {
  const guidance =
    artifact.orchestration_guidance ??
    deriveUnitReviewOrchestrationGuidance({
      unit_id: artifact.unit_id,
      artifact_status: artifact.status,
      ...(artifact.repair_plan ? { repair_plan: artifact.repair_plan } : {}),
      ...(artifact.retry_policy ? { retry_policy: artifact.retry_policy } : {}),
      ...(artifact.rerun_context ? { rerun_context: artifact.rerun_context } : {})
    });

  const predecessorItemKey = buildPredecessorItemKey(artifact);
  const repairRequestSummary = buildRepairRequestSummary(artifact);
  const labels = buildInboxLabels(artifact, guidance);

  return {
    schema_version: "content-pipeline-review-inbox-item/v0.1",
    item_key: buildInboxItemKey(artifact.unit_id, artifact.generated_at, guidance.human_queue),
    chain_key: buildChainKey(
      artifact.unit_id,
      artifact.rerun_context?.rerun_root_artifact_generated_at ?? artifact.generated_at
    ),
    predecessor_item_key: predecessorItemKey,
    delivery_action: predecessorItemKey ? "replace_predecessor_inbox_item" : "create_inbox_item",
    unit_id: artifact.unit_id,
    artifact_generated_at: artifact.generated_at,
    artifact_status: artifact.status,
    human_queue: guidance.human_queue,
    title: guidance.inbox_title,
    summary: guidance.inbox_summary,
    primary_human_action: guidance.primary_human_action,
    automation_step: guidance.automation_step,
    decision_boundary: {
      requires_provider_execution: guidance.requires_provider_execution,
      requires_human_decision: guidance.requires_human_decision,
      provider_execution_allowed_without_human: guidance.provider_execution_allowed_without_human
    },
    labels: repairRequestSummary
      ? [
          ...labels,
          `repair_request:${repairRequestSummary.repair_strategy}`,
          `repair_action:${repairRequestSummary.repair_action}`
        ]
      : labels,
    metadata: {
      orchestration_action: guidance.action,
      recommended_rerun_from: guidance.recommended_rerun_from,
      rerun_chain_depth: guidance.rerun_chain_depth,
      retry_decision: artifact.retry_policy?.decision ?? null,
      repair_plan_source: artifact.repair_plan?.source ?? null,
      ...(repairRequestSummary ? { repair_request: repairRequestSummary } : {})
    }
  };
}

function buildRepairRequestSummary(
  artifact: UnitReviewArtifact
): UnitReviewInboxHandoff["metadata"]["repair_request"] | undefined {
  const validation = validateUnitReviewRepairRequestSource(artifact);
  if (!validation.ok) {
    return undefined;
  }

  const request = buildUnitReviewRepairRequest(artifact);
  return {
    request_key: request.request_key,
    repair_action: request.repair_action,
    repair_strategy: request.repair_strategy,
    requested_start_role: request.requested_start_role,
    requested_role_count: request.requested_roles.length,
    requires_provider_execution: request.execution_boundary.requires_provider_execution,
    requires_source_writeback: request.execution_boundary.requires_source_writeback,
    blocked_artifact_approval_allowed: request.execution_boundary.blocked_artifact_approval_allowed
  };
}

function buildInboxItemKey(unitId: string, generatedAt: string, humanQueue: UnitReviewHumanQueue): string {
  return `content-pipeline:${humanQueue}:${unitId}:${generatedAt}`;
}

function buildChainKey(unitId: string, rootArtifactGeneratedAt: string): string {
  return `content-pipeline:chain:${unitId}:${rootArtifactGeneratedAt}`;
}

function buildPredecessorItemKey(artifact: UnitReviewArtifact): string | null {
  const rerunContext = artifact.rerun_context;
  if (!rerunContext) {
    return null;
  }

  const predecessorQueue = derivePredecessorQueue(rerunContext.source_retry_decision);
  return buildInboxItemKey(artifact.unit_id, rerunContext.source_artifact_generated_at, predecessorQueue);
}

function derivePredecessorQueue(
  sourceRetryDecision: UnitReviewArtifact["rerun_context"] extends infer T
    ? T extends { source_retry_decision?: infer D }
      ? D | undefined
      : undefined
    : undefined
): UnitReviewHumanQueue {
  if (sourceRetryDecision === "allow_scoped_rerun" || sourceRetryDecision === "widen_rerun_scope") {
    return "rerun_decision_queue";
  }

  if (sourceRetryDecision === "manual_review_required") {
    return "manual_triage_queue";
  }

  return "manual_triage_queue";
}

function buildInboxLabels(
  artifact: UnitReviewArtifact,
  guidance: ReturnType<typeof deriveUnitReviewOrchestrationGuidance>
): string[] {
  return [
    "content_pipeline_review",
    `chain:${artifact.rerun_context?.rerun_root_artifact_generated_at ?? artifact.generated_at}`,
    `artifact_status:${artifact.status}`,
    `queue:${guidance.human_queue}`,
    `action:${guidance.action}`,
    ...(artifact.retry_policy?.decision ? [`retry_policy:${artifact.retry_policy.decision}`] : []),
    ...(guidance.recommended_rerun_from ? [`rerun_from:${guidance.recommended_rerun_from}`] : [])
  ];
}
