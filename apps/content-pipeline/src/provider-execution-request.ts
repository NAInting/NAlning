import type { CurriculumAgentRole } from "./agent-specs";
import {
  deriveUnitReviewOrchestrationGuidance,
  type UnitReviewOrchestrationGuidance
} from "./orchestration-guidance";
import type { UnitReviewArtifact } from "./review-runner";
import { curriculumAgentOrder } from "./workflow";

export type UnitReviewProviderExecutionRequestAction =
  | "run_scoped_review_rerun"
  | "run_widened_review_rerun";

export interface UnitReviewProviderExecutionRequest {
  schema_version: "content-pipeline-review-provider-execution-request/v0.1";
  request_key: string;
  chain_key: string;
  source_artifact_schema_version: UnitReviewArtifact["schema_version"];
  source_artifact_generated_at: string;
  source_artifact_status: "blocked";
  unit_id: string;
  execution_action: UnitReviewProviderExecutionRequestAction;
  requested_start_role: CurriculumAgentRole;
  requested_roles: CurriculumAgentRole[];
  estimated_provider_call_count: number;
  review_mode: "llm_review_no_writeback";
  output_contract: "review_artifact_only";
  reason: string;
  rerun_chain_depth: number;
  rerun_root_artifact_generated_at: string;
  source_retry_decision: "allow_scoped_rerun" | "widen_rerun_scope";
  source_recommended_rerun_from: CurriculumAgentRole;
  human_queue: "rerun_decision_queue";
  primary_human_action: "decide_scoped_rerun" | "decide_widened_rerun";
  inbox_title: string;
  inbox_summary: string;
  execution_command: {
    command: "run-llm-review";
    from_artifact_generated_at: string;
    rerun_from: CurriculumAgentRole;
  };
  gating_requirements: {
    requires_explicit_human_approval: true;
    requires_budget_policy_check: true;
    requires_real_provider_credentials: true;
  };
  decision_boundary: {
    requires_provider_execution: true;
    requires_human_decision: true;
    provider_execution_allowed_without_human: false;
  };
}

export interface ProviderExecutionRequestSourceValidationIssue {
  code:
    | "invalid_artifact_schema_version"
    | "artifact_not_blocked"
    | "orchestration_action_not_provider_request"
    | "missing_retry_policy"
    | "retry_policy_mismatch"
    | "missing_recommended_rerun_from"
    | "invalid_recommended_rerun_from"
    | "recommended_rerun_roles_mismatch"
    | "decision_boundary_mismatch"
    | "human_queue_mismatch"
    | "primary_human_action_mismatch";
  message: string;
}

export interface ProviderExecutionRequestSourceValidationResult {
  ok: boolean;
  issues: ProviderExecutionRequestSourceValidationIssue[];
}

export interface ProviderExecutionRequestValidationIssue {
  code:
    | "source_artifact_contract_mismatch"
    | "invalid_request_schema_version"
    | "request_key_mismatch"
    | "chain_key_mismatch"
    | "source_artifact_schema_version_mismatch"
    | "source_artifact_generated_at_mismatch"
    | "source_artifact_status_mismatch"
    | "unit_id_mismatch"
    | "execution_action_mismatch"
    | "requested_start_role_mismatch"
    | "requested_roles_mismatch"
    | "estimated_provider_call_count_mismatch"
    | "review_mode_mismatch"
    | "output_contract_mismatch"
    | "reason_mismatch"
    | "rerun_chain_depth_mismatch"
    | "rerun_root_artifact_generated_at_mismatch"
    | "source_retry_decision_mismatch"
    | "source_recommended_rerun_from_mismatch"
    | "human_queue_mismatch"
    | "primary_human_action_mismatch"
    | "inbox_title_mismatch"
    | "inbox_summary_mismatch"
    | "execution_command_mismatch"
    | "gating_requirements_mismatch"
    | "decision_boundary_mismatch";
  message: string;
}

export interface ProviderExecutionRequestValidationResult {
  ok: boolean;
  issues: ProviderExecutionRequestValidationIssue[];
}

export function validateUnitReviewProviderExecutionRequestSource(
  artifact: UnitReviewArtifact
): ProviderExecutionRequestSourceValidationResult {
  const issues: ProviderExecutionRequestSourceValidationIssue[] = [];

  if (artifact.schema_version !== "content-pipeline-review-artifact/v0.1") {
    issues.push({
      code: "invalid_artifact_schema_version",
      message: "Provider execution request source artifact must use schema_version content-pipeline-review-artifact/v0.1."
    });
  }

  if (artifact.status !== "blocked") {
    issues.push({
      code: "artifact_not_blocked",
      message: "Provider execution requests can only be derived from blocked review artifacts."
    });
  }

  const guidance = getOrchestrationGuidance(artifact);
  const isEligibleGuidance = isProviderExecutionGuidance(guidance);

  if (!isEligibleGuidance) {
    issues.push({
      code: "orchestration_action_not_provider_request",
      message:
        "Provider execution requests require orchestration guidance action prepare_scoped_rerun or prepare_widened_rerun."
    });
  } else {
    if (
      !guidance.requires_provider_execution ||
      !guidance.requires_human_decision ||
      guidance.provider_execution_allowed_without_human
    ) {
      issues.push({
        code: "decision_boundary_mismatch",
        message:
          "Provider execution request source guidance must require provider execution, remain human-gated, and forbid unattended provider execution."
      });
    }

    if (guidance.human_queue !== "rerun_decision_queue") {
      issues.push({
        code: "human_queue_mismatch",
        message: "Provider execution request source guidance must route through rerun_decision_queue."
      });
    }

    const expectedHumanAction =
      guidance.action === "prepare_scoped_rerun" ? "decide_scoped_rerun" : "decide_widened_rerun";
    if (guidance.primary_human_action !== expectedHumanAction) {
      issues.push({
        code: "primary_human_action_mismatch",
        message: "Provider execution request source guidance must expose the matching rerun decision action."
      });
    }
  }

  if (!artifact.retry_policy) {
    issues.push({
      code: "missing_retry_policy",
      message: "Provider execution requests require retry_policy metadata on the source artifact."
    });
  } else {
    if (!isProviderExecutionRetryDecision(artifact.retry_policy.decision)) {
      issues.push({
        code: "retry_policy_mismatch",
        message:
          "Provider execution request source retry_policy.decision must be allow_scoped_rerun or widen_rerun_scope."
      });
    } else if (isEligibleGuidance) {
      const expectedDecision =
        guidance.action === "prepare_widened_rerun" ? "widen_rerun_scope" : "allow_scoped_rerun";
      if (artifact.retry_policy.decision !== expectedDecision) {
        issues.push({
          code: "retry_policy_mismatch",
          message: "Provider execution request source retry_policy must match the orchestration rerun action."
        });
      }
    }

    if (
      artifact.retry_policy.recommended_rerun_from === "manual_review"
      || !artifact.retry_policy.recommended_rerun_from
    ) {
      issues.push({
        code: "missing_recommended_rerun_from",
        message: "Provider execution request source retry_policy must expose a concrete rerun start role."
      });
    } else if (!isCurriculumAgentRole(artifact.retry_policy.recommended_rerun_from)) {
      issues.push({
        code: "invalid_recommended_rerun_from",
        message:
          "Provider execution request source retry_policy recommended_rerun_from must be a known curriculum workflow role."
      });
    } else {
      const expectedRoles = deriveExpectedRerunRoles(artifact.retry_policy.recommended_rerun_from);
      if (!expectedRoles || !rolesEqual(artifact.retry_policy.recommended_rerun_roles, expectedRoles)) {
        issues.push({
          code: "recommended_rerun_roles_mismatch",
          message: "Provider execution request source retry_policy recommended_rerun_roles must match the contiguous tail slice from recommended_rerun_from."
        });
      }
    }
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

export function buildUnitReviewProviderExecutionRequest(
  artifact: UnitReviewArtifact
): UnitReviewProviderExecutionRequest {
  const { guidance, retryPolicy, startRole } = resolveProviderExecutionRequestSource(artifact);
  const executionAction =
    guidance.action === "prepare_scoped_rerun" ? "run_scoped_review_rerun" : "run_widened_review_rerun";
  const requestKey = buildProviderExecutionRequestKey(artifact.unit_id, executionAction, artifact.generated_at);
  const rerunRootArtifactGeneratedAt =
    artifact.rerun_context?.rerun_root_artifact_generated_at ?? artifact.generated_at;

  return {
    schema_version: "content-pipeline-review-provider-execution-request/v0.1",
    request_key: requestKey,
    chain_key: buildProviderExecutionChainKey(artifact.unit_id, rerunRootArtifactGeneratedAt),
    source_artifact_schema_version: artifact.schema_version,
    source_artifact_generated_at: artifact.generated_at,
    source_artifact_status: "blocked",
    unit_id: artifact.unit_id,
    execution_action: executionAction,
    requested_start_role: startRole,
    requested_roles: retryPolicy.recommended_rerun_roles,
    estimated_provider_call_count: retryPolicy.recommended_rerun_roles.length,
    review_mode: "llm_review_no_writeback",
    output_contract: "review_artifact_only",
    reason: guidance.reason,
    rerun_chain_depth: guidance.rerun_chain_depth,
    rerun_root_artifact_generated_at: rerunRootArtifactGeneratedAt,
    source_retry_decision: retryPolicy.decision,
    source_recommended_rerun_from: startRole,
    human_queue: "rerun_decision_queue",
    primary_human_action: guidance.primary_human_action,
    inbox_title: guidance.inbox_title,
    inbox_summary: guidance.inbox_summary,
    execution_command: {
      command: "run-llm-review",
      from_artifact_generated_at: artifact.generated_at,
      rerun_from: startRole
    },
    gating_requirements: {
      requires_explicit_human_approval: true,
      requires_budget_policy_check: true,
      requires_real_provider_credentials: true
    },
    decision_boundary: {
      requires_provider_execution: true,
      requires_human_decision: true,
      provider_execution_allowed_without_human: false
    }
  };
}

export function validateUnitReviewProviderExecutionRequest(
  artifact: UnitReviewArtifact,
  request: UnitReviewProviderExecutionRequest
): ProviderExecutionRequestValidationResult {
  const issues: ProviderExecutionRequestValidationIssue[] = [];
  const sourceValidation = validateUnitReviewProviderExecutionRequestSource(artifact);

  if (!sourceValidation.ok) {
    issues.push({
      code: "source_artifact_contract_mismatch",
      message:
        `Provider execution request source artifact failed validation: ${sourceValidation.issues.map((issue) => issue.code).join(", ")}.`
    });
  }

  if (request.schema_version !== "content-pipeline-review-provider-execution-request/v0.1") {
    issues.push({
      code: "invalid_request_schema_version",
      message:
        "Provider execution request schema_version must be content-pipeline-review-provider-execution-request/v0.1."
    });
  }

  if (issues.length > 0) {
    return {
      ok: false,
      issues
    };
  }

  const expected = buildUnitReviewProviderExecutionRequest(artifact);

  if (request.request_key !== expected.request_key) {
    issues.push({ code: "request_key_mismatch", message: "Provider execution request_key must match the derived source request key." });
  }

  if (request.chain_key !== expected.chain_key) {
    issues.push({ code: "chain_key_mismatch", message: "Provider execution request chain_key must match the derived rerun lineage key." });
  }

  if (request.source_artifact_schema_version !== expected.source_artifact_schema_version) {
    issues.push({
      code: "source_artifact_schema_version_mismatch",
      message: "Provider execution request source_artifact_schema_version must match the source review artifact schema_version."
    });
  }

  if (request.source_artifact_generated_at !== expected.source_artifact_generated_at) {
    issues.push({
      code: "source_artifact_generated_at_mismatch",
      message: "Provider execution request source_artifact_generated_at must match the source review artifact timestamp."
    });
  }

  if (request.source_artifact_status !== expected.source_artifact_status) {
    issues.push({
      code: "source_artifact_status_mismatch",
      message: "Provider execution request source_artifact_status must remain blocked."
    });
  }

  if (request.unit_id !== expected.unit_id) {
    issues.push({ code: "unit_id_mismatch", message: "Provider execution request unit_id must match the source artifact unit_id." });
  }

  if (request.execution_action !== expected.execution_action) {
    issues.push({
      code: "execution_action_mismatch",
      message: "Provider execution request execution_action must match the orchestration rerun action."
    });
  }

  if (request.requested_start_role !== expected.requested_start_role) {
    issues.push({
      code: "requested_start_role_mismatch",
      message: "Provider execution request requested_start_role must match the source retry policy recommended_rerun_from."
    });
  }

  if (!rolesEqual(request.requested_roles, expected.requested_roles)) {
    issues.push({
      code: "requested_roles_mismatch",
      message: "Provider execution request requested_roles must match the contiguous rerun tail from requested_start_role."
    });
  }

  if (request.estimated_provider_call_count !== expected.estimated_provider_call_count) {
    issues.push({
      code: "estimated_provider_call_count_mismatch",
      message: "Provider execution request estimated_provider_call_count must equal requested_roles.length."
    });
  }

  if (request.review_mode !== expected.review_mode) {
    issues.push({
      code: "review_mode_mismatch",
      message: "Provider execution request review_mode must remain llm_review_no_writeback."
    });
  }

  if (request.output_contract !== expected.output_contract) {
    issues.push({
      code: "output_contract_mismatch",
      message: "Provider execution request output_contract must remain review_artifact_only."
    });
  }

  if (request.reason !== expected.reason) {
    issues.push({
      code: "reason_mismatch",
      message: "Provider execution request reason must match the source orchestration guidance reason."
    });
  }

  if (request.rerun_chain_depth !== expected.rerun_chain_depth) {
    issues.push({
      code: "rerun_chain_depth_mismatch",
      message: "Provider execution request rerun_chain_depth must match the source rerun lineage depth."
    });
  }

  if (request.rerun_root_artifact_generated_at !== expected.rerun_root_artifact_generated_at) {
    issues.push({
      code: "rerun_root_artifact_generated_at_mismatch",
      message: "Provider execution request rerun_root_artifact_generated_at must match the source rerun lineage root."
    });
  }

  if (request.source_retry_decision !== expected.source_retry_decision) {
    issues.push({
      code: "source_retry_decision_mismatch",
      message: "Provider execution request source_retry_decision must match the source retry policy decision."
    });
  }

  if (request.source_recommended_rerun_from !== expected.source_recommended_rerun_from) {
    issues.push({
      code: "source_recommended_rerun_from_mismatch",
      message: "Provider execution request source_recommended_rerun_from must match the source retry policy rerun start."
    });
  }

  if (request.human_queue !== expected.human_queue) {
    issues.push({
      code: "human_queue_mismatch",
      message: "Provider execution request human_queue must remain rerun_decision_queue."
    });
  }

  if (request.primary_human_action !== expected.primary_human_action) {
    issues.push({
      code: "primary_human_action_mismatch",
      message: "Provider execution request primary_human_action must match the rerun decision type."
    });
  }

  if (request.inbox_title !== expected.inbox_title) {
    issues.push({
      code: "inbox_title_mismatch",
      message: "Provider execution request inbox_title must match the source orchestration guidance title."
    });
  }

  if (request.inbox_summary !== expected.inbox_summary) {
    issues.push({
      code: "inbox_summary_mismatch",
      message: "Provider execution request inbox_summary must match the source orchestration guidance summary."
    });
  }

  if (
    request.execution_command.command !== expected.execution_command.command
    || request.execution_command.from_artifact_generated_at !== expected.execution_command.from_artifact_generated_at
    || request.execution_command.rerun_from !== expected.execution_command.rerun_from
  ) {
    issues.push({
      code: "execution_command_mismatch",
      message: "Provider execution request execution_command must match the derived rerun command hint."
    });
  }

  if (
    request.gating_requirements.requires_explicit_human_approval !== expected.gating_requirements.requires_explicit_human_approval
    || request.gating_requirements.requires_budget_policy_check !== expected.gating_requirements.requires_budget_policy_check
    || request.gating_requirements.requires_real_provider_credentials !==
      expected.gating_requirements.requires_real_provider_credentials
  ) {
    issues.push({
      code: "gating_requirements_mismatch",
      message: "Provider execution request gating_requirements must preserve the explicit approval/budget/provider gates."
    });
  }

  if (
    request.decision_boundary.requires_provider_execution !== expected.decision_boundary.requires_provider_execution
    || request.decision_boundary.requires_human_decision !== expected.decision_boundary.requires_human_decision
    || request.decision_boundary.provider_execution_allowed_without_human !==
      expected.decision_boundary.provider_execution_allowed_without_human
  ) {
    issues.push({
      code: "decision_boundary_mismatch",
      message: "Provider execution request decision_boundary must preserve the human-gated provider boundary."
    });
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

function getOrchestrationGuidance(artifact: UnitReviewArtifact): UnitReviewOrchestrationGuidance {
  return (
    artifact.orchestration_guidance
    ?? deriveUnitReviewOrchestrationGuidance({
      unit_id: artifact.unit_id,
      artifact_status: artifact.status,
      ...(artifact.repair_plan ? { repair_plan: artifact.repair_plan } : {}),
      ...(artifact.retry_policy ? { retry_policy: artifact.retry_policy } : {}),
      ...(artifact.rerun_context ? { rerun_context: artifact.rerun_context } : {})
    })
  );
}

function isProviderExecutionGuidance(
  guidance: UnitReviewOrchestrationGuidance
): guidance is UnitReviewOrchestrationGuidance & {
  action: "prepare_scoped_rerun" | "prepare_widened_rerun";
  human_queue: "rerun_decision_queue";
  primary_human_action: "decide_scoped_rerun" | "decide_widened_rerun";
} {
  return guidance.action === "prepare_scoped_rerun" || guidance.action === "prepare_widened_rerun";
}

function isProviderExecutionRetryDecision(
  decision: unknown
): decision is "allow_scoped_rerun" | "widen_rerun_scope" {
  return decision === "allow_scoped_rerun" || decision === "widen_rerun_scope";
}

function isCurriculumAgentRole(role: unknown): role is CurriculumAgentRole {
  return typeof role === "string" && curriculumAgentOrder.some((candidate) => candidate === role);
}

function deriveExpectedRerunRoles(startRole: CurriculumAgentRole): CurriculumAgentRole[] | null {
  const startIndex = curriculumAgentOrder.indexOf(startRole);
  return startIndex === -1 ? null : [...curriculumAgentOrder.slice(startIndex)];
}

function rolesEqual(left: readonly CurriculumAgentRole[], right: readonly CurriculumAgentRole[]): boolean {
  return left.length === right.length && left.every((role, index) => role === right[index]);
}

function resolveProviderExecutionRequestSource(artifact: UnitReviewArtifact): {
  guidance: UnitReviewOrchestrationGuidance & {
    action: "prepare_scoped_rerun" | "prepare_widened_rerun";
    human_queue: "rerun_decision_queue";
    primary_human_action: "decide_scoped_rerun" | "decide_widened_rerun";
  };
  retryPolicy: typeof artifact.retry_policy & {
    decision: "allow_scoped_rerun" | "widen_rerun_scope";
    recommended_rerun_from: CurriculumAgentRole;
    recommended_rerun_roles: CurriculumAgentRole[];
  };
  startRole: CurriculumAgentRole;
} {
  const sourceValidation = validateUnitReviewProviderExecutionRequestSource(artifact);
  if (!sourceValidation.ok) {
    throw new Error(
      `Provider execution request source artifact is invalid: ${sourceValidation.issues.map((issue) => issue.code).join(", ")}.`
    );
  }

  const guidance = getOrchestrationGuidance(artifact);
  const retryPolicy = artifact.retry_policy;

  if (
    !isProviderExecutionGuidance(guidance)
    || !retryPolicy
    || !isProviderExecutionRetryDecision(retryPolicy.decision)
    || !isCurriculumAgentRole(retryPolicy.recommended_rerun_from)
  ) {
    throw new Error("Provider execution request source artifact could not be narrowed after validation.");
  }

  return {
    guidance,
    retryPolicy: retryPolicy as typeof retryPolicy & {
      decision: "allow_scoped_rerun" | "widen_rerun_scope";
      recommended_rerun_from: CurriculumAgentRole;
      recommended_rerun_roles: CurriculumAgentRole[];
    },
    startRole: retryPolicy.recommended_rerun_from
  };
}

function buildProviderExecutionRequestKey(
  unitId: string,
  executionAction: UnitReviewProviderExecutionRequestAction,
  sourceArtifactGeneratedAt: string
): string {
  return `content-pipeline:provider-execution-request:${executionAction}:${unitId}:${sourceArtifactGeneratedAt}`;
}

function buildProviderExecutionChainKey(unitId: string, rootArtifactGeneratedAt: string): string {
  return `content-pipeline:provider-execution-chain:${unitId}:${rootArtifactGeneratedAt}`;
}
