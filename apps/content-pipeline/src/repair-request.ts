import type { CurriculumAgentRole } from "./agent-specs";
import { deriveUnitReviewRepairPlan, type UnitReviewRepairPlan } from "./repair-plan";
import type { UnitReviewArtifact } from "./review-runner";
import { curriculumAgentOrder } from "./workflow";

export type UnitReviewRepairRequestAction =
  | "prepare_role_scoped_repair"
  | "manual_triage_required";

export type UnitReviewRepairStrategy =
  | "preserve_core_node_id"
  | "fix_owned_section_reference"
  | "manual_triage";

export interface UnitReviewRepairTargetIssue {
  code: "unknown_node_reference";
  path: string;
  message: string;
  missing_node_id: string | null;
  impacted_owner: CurriculumAgentRole | "manual_review";
  root_owner: CurriculumAgentRole | "manual_review";
}

export interface UnitReviewRepairRequest {
  schema_version: "content-pipeline-review-repair-request/v0.1";
  request_key: string;
  chain_key: string;
  source_artifact_schema_version: UnitReviewArtifact["schema_version"];
  source_artifact_generated_at: string;
  source_artifact_status: "blocked";
  unit_id: string;
  repair_action: UnitReviewRepairRequestAction;
  repair_strategy: UnitReviewRepairStrategy;
  requested_start_role: CurriculumAgentRole | "manual_review";
  requested_roles: CurriculumAgentRole[];
  target_issues: UnitReviewRepairTargetIssue[];
  review_mode: "llm_review_no_writeback";
  output_contract: "review_artifact_only";
  reason: string;
  role_instructions: string[];
  execution_boundary: {
    requires_provider_execution: false;
    requires_source_writeback: false;
    blocked_artifact_approval_allowed: false;
  };
  next_execution_request: {
    kind: "review_only_rerun_candidate" | "manual_triage";
    command_hint: {
      command: "run-llm-review";
      from_artifact_generated_at: string;
      rerun_from: CurriculumAgentRole;
    } | null;
  };
}

export interface RepairRequestSourceValidationIssue {
  code:
    | "invalid_artifact_schema_version"
    | "artifact_not_blocked"
    | "writeback_already_performed"
    | "missing_semantic_validation"
    | "missing_unknown_node_reference"
    | "mixed_semantic_errors"
    | "missing_repair_plan"
    | "missing_repair_recommendation"
    | "repair_plan_mismatch"
    | "repair_plan_retry_policy_mismatch"
    | "missing_retry_policy"
    | "retry_policy_mismatch"
    | "missing_recommended_rerun_from"
    | "invalid_recommended_rerun_from"
    | "recommended_rerun_roles_mismatch";
  message: string;
}

export interface RepairRequestSourceValidationResult {
  ok: boolean;
  issues: RepairRequestSourceValidationIssue[];
}

export interface RepairRequestValidationIssue {
  code:
    | "source_artifact_contract_mismatch"
    | "request_shape_mismatch"
    | "unknown_request_field"
    | "invalid_request_schema_version"
    | "request_key_mismatch"
    | "chain_key_mismatch"
    | "source_artifact_schema_version_mismatch"
    | "source_artifact_generated_at_mismatch"
    | "source_artifact_status_mismatch"
    | "unit_id_mismatch"
    | "repair_action_mismatch"
    | "repair_strategy_mismatch"
    | "requested_start_role_mismatch"
    | "requested_roles_mismatch"
    | "target_issues_mismatch"
    | "review_mode_mismatch"
    | "output_contract_mismatch"
    | "reason_mismatch"
    | "role_instructions_mismatch"
    | "execution_boundary_mismatch"
    | "next_execution_request_mismatch";
  message: string;
}

export interface RepairRequestValidationResult {
  ok: boolean;
  issues: RepairRequestValidationIssue[];
}

export function validateUnitReviewRepairRequestSource(
  artifact: UnitReviewArtifact
): RepairRequestSourceValidationResult {
  const issues: RepairRequestSourceValidationIssue[] = [];

  if (artifact.schema_version !== "content-pipeline-review-artifact/v0.1") {
    issues.push({
      code: "invalid_artifact_schema_version",
      message: "Repair requests require review artifacts using schema_version content-pipeline-review-artifact/v0.1."
    });
  }

  if (artifact.status !== "blocked") {
    issues.push({
      code: "artifact_not_blocked",
      message: "Repair requests can only be derived from blocked review artifacts."
    });
  }

  if (artifact.writeback_performed !== false) {
    issues.push({
      code: "writeback_already_performed",
      message: "Repair requests cannot be derived after a source writeback has already been performed."
    });
  }

  const semanticValidation = artifact.semantic_validation;
  if (!semanticValidation) {
    issues.push({
      code: "missing_semantic_validation",
      message: "Role-scoped repair requests require semantic_validation evidence on the source artifact."
    });
  } else if (collectUnknownNodeIssues(artifact).length === 0) {
    issues.push({
      code: "missing_unknown_node_reference",
      message: "This repair request contract currently covers unknown_node_reference semantic failures."
    });
  } else {
    const unsupportedErrors = semanticValidation.issues.filter(
      (issue) => issue.severity === "error" && issue.code !== "unknown_node_reference"
    );
    if (unsupportedErrors.length > 0) {
      issues.push({
        code: "mixed_semantic_errors",
        message:
          `Repair request source contains unsupported semantic errors: ${unsupportedErrors.map((issue) => issue.code).join(", ")}.`
      });
    }
  }

  if (!artifact.repair_plan) {
    issues.push({
      code: "missing_repair_plan",
      message: "Repair requests require repair_plan metadata on the source artifact."
    });
  } else {
    const unknownNodeIssues = collectUnknownNodeIssues(artifact);
    const recommendationTriggers = new Set(
      artifact.repair_plan.recommendations.map((recommendation) => recommendation.trigger)
    );
    for (const issue of unknownNodeIssues) {
      if (!recommendationTriggers.has(`${issue.code} at ${issue.path}`)) {
        issues.push({
          code: "missing_repair_recommendation",
          message: `Repair plan must include a recommendation for ${issue.code} at ${issue.path}.`
        });
      }
    }
    const expectedRepairPlan = deriveExpectedRepairPlan(artifact);
    if (expectedRepairPlan && !repairPlansMatch(artifact.repair_plan, expectedRepairPlan)) {
      issues.push({
        code: "repair_plan_mismatch",
        message: "Repair request source repair_plan must match the semantic validation and candidate patch evidence."
      });
    }
  }

  const retryPolicy = artifact.retry_policy;
  if (!retryPolicy) {
    issues.push({
      code: "missing_retry_policy",
      message: "Repair requests require retry_policy metadata on the source artifact."
    });
  } else {
    if (retryPolicy.decision !== "allow_scoped_rerun" && retryPolicy.decision !== "widen_rerun_scope") {
      issues.push({
        code: "retry_policy_mismatch",
        message: "Repair request source retry_policy.decision must be allow_scoped_rerun or widen_rerun_scope."
      });
    }

    if (
      retryPolicy.recommended_rerun_from === "manual_review"
      || !retryPolicy.recommended_rerun_from
    ) {
      issues.push({
        code: "missing_recommended_rerun_from",
        message: "Repair request source retry_policy must expose a concrete rerun start role."
      });
    } else if (!isCurriculumAgentRole(retryPolicy.recommended_rerun_from)) {
      issues.push({
        code: "invalid_recommended_rerun_from",
        message: "Repair request source retry_policy recommended_rerun_from must be a known curriculum workflow role."
      });
    } else {
      const expectedRoles = deriveExpectedRerunRoles(retryPolicy.recommended_rerun_from);
      if (!expectedRoles || !rolesEqual(retryPolicy.recommended_rerun_roles, expectedRoles)) {
        issues.push({
          code: "recommended_rerun_roles_mismatch",
          message:
            "Repair request source retry_policy recommended_rerun_roles must match the contiguous tail slice from recommended_rerun_from."
        });
      }
    }

    if (
      artifact.repair_plan
      && (
        retryPolicy.recommended_rerun_from !== artifact.repair_plan.recommended_rerun_from
        || !rolesEqual(retryPolicy.recommended_rerun_roles, artifact.repair_plan.recommended_rerun_roles)
      )
    ) {
      issues.push({
        code: "repair_plan_retry_policy_mismatch",
        message: "Repair request source retry_policy must match repair_plan recommended rerun scope."
      });
    }
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

export function buildUnitReviewRepairRequest(artifact: UnitReviewArtifact): UnitReviewRepairRequest {
  const { startRole, retryPolicy } = resolveRepairRequestSource(artifact);
  const targetIssues = buildTargetIssues(artifact);
  const repairStrategy = chooseRepairStrategy(targetIssues, artifact);
  const repairAction: UnitReviewRepairRequestAction =
    repairStrategy === "manual_triage" ? "manual_triage_required" : "prepare_role_scoped_repair";
  const requestKey = buildRepairRequestKey(artifact.unit_id, repairStrategy, artifact.generated_at);
  const rootArtifactGeneratedAt =
    artifact.rerun_context?.rerun_root_artifact_generated_at ?? artifact.generated_at;

  return {
    schema_version: "content-pipeline-review-repair-request/v0.1",
    request_key: requestKey,
    chain_key: buildRepairRequestChainKey(artifact.unit_id, rootArtifactGeneratedAt),
    source_artifact_schema_version: artifact.schema_version,
    source_artifact_generated_at: artifact.generated_at,
    source_artifact_status: "blocked",
    unit_id: artifact.unit_id,
    repair_action: repairAction,
    repair_strategy: repairStrategy,
    requested_start_role: startRole,
    requested_roles: retryPolicy.recommended_rerun_roles,
    target_issues: targetIssues,
    review_mode: "llm_review_no_writeback",
    output_contract: "review_artifact_only",
    reason: buildRepairReason(repairStrategy, targetIssues),
    role_instructions: buildRoleInstructions(repairStrategy),
    execution_boundary: {
      requires_provider_execution: false,
      requires_source_writeback: false,
      blocked_artifact_approval_allowed: false
    },
    next_execution_request: {
      kind: repairAction === "prepare_role_scoped_repair" ? "review_only_rerun_candidate" : "manual_triage",
      command_hint:
        repairAction === "prepare_role_scoped_repair"
          ? {
              command: "run-llm-review",
              from_artifact_generated_at: artifact.generated_at,
              rerun_from: startRole
            }
          : null
    }
  };
}

export function validateUnitReviewRepairRequest(
  artifact: UnitReviewArtifact,
  request: unknown
): RepairRequestValidationResult {
  const issues: RepairRequestValidationIssue[] = [];
  const sourceValidation = validateUnitReviewRepairRequestSource(artifact);

  if (!sourceValidation.ok) {
    issues.push({
      code: "source_artifact_contract_mismatch",
      message:
        `Repair request source artifact failed validation: ${sourceValidation.issues.map((issue) => issue.code).join(", ")}.`
    });
  }

  const shapeIssues = validateRepairRequestShape(request);
  issues.push(...shapeIssues);

  const requestObject = isPlainObject(request) ? request : undefined;
  if (requestObject?.schema_version !== "content-pipeline-review-repair-request/v0.1") {
    issues.push({
      code: "invalid_request_schema_version",
      message: "Repair request schema_version must be content-pipeline-review-repair-request/v0.1."
    });
  }

  if (issues.length > 0) {
    return {
      ok: false,
      issues
    };
  }

  const expected = buildUnitReviewRepairRequest(artifact);
  const typedRequest = requestObject as unknown as UnitReviewRepairRequest;

  if (typedRequest.request_key !== expected.request_key) {
    issues.push({ code: "request_key_mismatch", message: "Repair request_key must match the derived source request key." });
  }

  if (typedRequest.chain_key !== expected.chain_key) {
    issues.push({ code: "chain_key_mismatch", message: "Repair chain_key must match the derived rerun lineage key." });
  }

  if (typedRequest.source_artifact_schema_version !== expected.source_artifact_schema_version) {
    issues.push({
      code: "source_artifact_schema_version_mismatch",
      message: "Repair source_artifact_schema_version must match the source artifact."
    });
  }

  if (typedRequest.source_artifact_generated_at !== expected.source_artifact_generated_at) {
    issues.push({
      code: "source_artifact_generated_at_mismatch",
      message: "Repair source_artifact_generated_at must match the source artifact timestamp."
    });
  }

  if (typedRequest.source_artifact_status !== expected.source_artifact_status) {
    issues.push({
      code: "source_artifact_status_mismatch",
      message: "Repair source_artifact_status must remain blocked."
    });
  }

  if (typedRequest.unit_id !== expected.unit_id) {
    issues.push({ code: "unit_id_mismatch", message: "Repair unit_id must match the source artifact." });
  }

  if (typedRequest.repair_action !== expected.repair_action) {
    issues.push({ code: "repair_action_mismatch", message: "Repair action must match the derived source strategy." });
  }

  if (typedRequest.repair_strategy !== expected.repair_strategy) {
    issues.push({ code: "repair_strategy_mismatch", message: "Repair strategy must match the derived source strategy." });
  }

  if (typedRequest.requested_start_role !== expected.requested_start_role) {
    issues.push({
      code: "requested_start_role_mismatch",
      message: "Repair requested_start_role must match the source retry policy recommended_rerun_from."
    });
  }

  if (!rolesEqual(typedRequest.requested_roles, expected.requested_roles)) {
    issues.push({
      code: "requested_roles_mismatch",
      message: "Repair requested_roles must match the contiguous rerun tail from requested_start_role."
    });
  }

  if (JSON.stringify(typedRequest.target_issues) !== JSON.stringify(expected.target_issues)) {
    issues.push({
      code: "target_issues_mismatch",
      message: "Repair target_issues must match the source unknown_node_reference issues."
    });
  }

  if (typedRequest.review_mode !== expected.review_mode) {
    issues.push({ code: "review_mode_mismatch", message: "Repair review_mode must remain llm_review_no_writeback." });
  }

  if (typedRequest.output_contract !== expected.output_contract) {
    issues.push({
      code: "output_contract_mismatch",
      message: "Repair output_contract must remain review_artifact_only."
    });
  }

  if (typedRequest.reason !== expected.reason) {
    issues.push({ code: "reason_mismatch", message: "Repair reason must match the derived source reason." });
  }

  if (JSON.stringify(typedRequest.role_instructions) !== JSON.stringify(expected.role_instructions)) {
    issues.push({
      code: "role_instructions_mismatch",
      message: "Repair role_instructions must match the derived safe repair guidance."
    });
  }

  if (
    typedRequest.execution_boundary.requires_provider_execution !== false
    || typedRequest.execution_boundary.requires_source_writeback !== false
    || typedRequest.execution_boundary.blocked_artifact_approval_allowed !== false
  ) {
    issues.push({
      code: "execution_boundary_mismatch",
      message:
        "Repair execution_boundary must forbid provider execution, source writeback, and blocked artifact approval."
    });
  }

  if (JSON.stringify(typedRequest.next_execution_request) !== JSON.stringify(expected.next_execution_request)) {
    issues.push({
      code: "next_execution_request_mismatch",
      message: "Repair next_execution_request must match the derived no-writeback rerun candidate."
    });
  }

  return {
    ok: issues.length === 0,
    issues
  };
}

function validateRepairRequestShape(request: unknown): RepairRequestValidationIssue[] {
  const issues: RepairRequestValidationIssue[] = [];
  if (!isPlainObject(request)) {
    return [
      {
        code: "request_shape_mismatch",
        message: "Repair request must be a JSON object."
      }
    ];
  }

  issues.push(
    ...collectUnknownFieldIssues(request, [
      "schema_version",
      "request_key",
      "chain_key",
      "source_artifact_schema_version",
      "source_artifact_generated_at",
      "source_artifact_status",
      "unit_id",
      "repair_action",
      "repair_strategy",
      "requested_start_role",
      "requested_roles",
      "target_issues",
      "review_mode",
      "output_contract",
      "reason",
      "role_instructions",
      "execution_boundary",
      "next_execution_request"
    ], "request")
  );

  if (!Array.isArray(request.requested_roles)) {
    issues.push({
      code: "request_shape_mismatch",
      message: "Repair request requested_roles must be an array."
    });
  }

  if (!Array.isArray(request.target_issues)) {
    issues.push({
      code: "request_shape_mismatch",
      message: "Repair request target_issues must be an array."
    });
  } else {
    for (const [index, targetIssue] of request.target_issues.entries()) {
      if (!isPlainObject(targetIssue)) {
        issues.push({
          code: "request_shape_mismatch",
          message: `Repair request target_issues[${index}] must be an object.`
        });
        continue;
      }

      issues.push(
        ...collectUnknownFieldIssues(targetIssue, [
          "code",
          "path",
          "message",
          "missing_node_id",
          "impacted_owner",
          "root_owner"
        ], `target_issues[${index}]`)
      );
    }
  }

  if (!Array.isArray(request.role_instructions)) {
    issues.push({
      code: "request_shape_mismatch",
      message: "Repair request role_instructions must be an array."
    });
  }

  if (!isPlainObject(request.execution_boundary)) {
    issues.push({
      code: "request_shape_mismatch",
      message: "Repair request execution_boundary must be an object."
    });
  } else {
    issues.push(
      ...collectUnknownFieldIssues(request.execution_boundary, [
        "requires_provider_execution",
        "requires_source_writeback",
        "blocked_artifact_approval_allowed"
      ], "execution_boundary")
    );
  }

  if (!isPlainObject(request.next_execution_request)) {
    issues.push({
      code: "request_shape_mismatch",
      message: "Repair request next_execution_request must be an object."
    });
  } else {
    issues.push(
      ...collectUnknownFieldIssues(request.next_execution_request, [
        "kind",
        "command_hint"
      ], "next_execution_request")
    );
    const commandHint = request.next_execution_request.command_hint;
    if (commandHint !== null && !isPlainObject(commandHint)) {
      issues.push({
        code: "request_shape_mismatch",
        message: "Repair request next_execution_request.command_hint must be an object or null."
      });
    } else if (isPlainObject(commandHint)) {
      issues.push(
        ...collectUnknownFieldIssues(commandHint, [
          "command",
          "from_artifact_generated_at",
          "rerun_from"
        ], "next_execution_request.command_hint")
      );
    }
  }

  return issues;
}

function resolveRepairRequestSource(artifact: UnitReviewArtifact): {
  startRole: CurriculumAgentRole;
  retryPolicy: NonNullable<UnitReviewArtifact["retry_policy"]> & {
    recommended_rerun_from: CurriculumAgentRole;
    recommended_rerun_roles: CurriculumAgentRole[];
  };
} {
  const validation = validateUnitReviewRepairRequestSource(artifact);
  if (!validation.ok) {
    throw new Error(
      `Repair request source artifact is invalid: ${validation.issues.map((issue) => issue.code).join(", ")}.`
    );
  }

  const retryPolicy = artifact.retry_policy;
  if (!retryPolicy || !isCurriculumAgentRole(retryPolicy.recommended_rerun_from)) {
    throw new Error("Repair request source artifact could not be narrowed after validation.");
  }

  return {
    startRole: retryPolicy.recommended_rerun_from,
    retryPolicy: retryPolicy as typeof retryPolicy & {
      recommended_rerun_from: CurriculumAgentRole;
      recommended_rerun_roles: CurriculumAgentRole[];
    }
  };
}

function buildTargetIssues(artifact: UnitReviewArtifact): UnitReviewRepairTargetIssue[] {
  const recommendations = artifact.repair_plan?.recommendations ?? [];
  return collectUnknownNodeIssues(artifact).map((issue) => {
    const recommendation = recommendations.find((candidate) => candidate.trigger === `${issue.code} at ${issue.path}`);
    return {
      code: "unknown_node_reference",
      path: issue.path,
      message: issue.message,
      missing_node_id: parseMissingNodeId(issue.message),
      impacted_owner: recommendation?.impacted_owner ?? "manual_review",
      root_owner: recommendation?.root_owner ?? "manual_review"
    };
  });
}

function deriveExpectedRepairPlan(artifact: UnitReviewArtifact): UnitReviewRepairPlan | undefined {
  if (!artifact.semantic_validation) {
    return undefined;
  }

  return deriveUnitReviewRepairPlan({
    semantic_validation: artifact.semantic_validation,
    candidate_patches: artifact.candidate_patches,
    invocations: []
  });
}

function repairPlansMatch(actual: UnitReviewRepairPlan, expected: UnitReviewRepairPlan): boolean {
  return (
    actual.source === expected.source
    && actual.recommended_rerun_from === expected.recommended_rerun_from
    && rolesEqual(actual.recommended_rerun_roles, expected.recommended_rerun_roles)
    && actual.recommendations.length === expected.recommendations.length
    && actual.recommendations.every((recommendation, index) => {
      const expectedRecommendation = expected.recommendations[index];
      return (
        expectedRecommendation !== undefined
        && recommendation.trigger === expectedRecommendation.trigger
        && recommendation.root_owner === expectedRecommendation.root_owner
        && recommendation.impacted_owner === expectedRecommendation.impacted_owner
        && recommendation.rerun_from === expectedRecommendation.rerun_from
        && rolesEqual(recommendation.rerun_roles, expectedRecommendation.rerun_roles)
      );
    })
  );
}

function collectUnknownNodeIssues(artifact: UnitReviewArtifact) {
  return (
    artifact.semantic_validation?.issues.filter(
      (issue) => issue.severity === "error" && issue.code === "unknown_node_reference"
    ) ?? []
  );
}

function chooseRepairStrategy(
  targetIssues: readonly UnitReviewRepairTargetIssue[],
  artifact: UnitReviewArtifact
): UnitReviewRepairStrategy {
  if (artifact.repair_plan?.recommended_rerun_from === "manual_review") {
    return "manual_triage";
  }

  if (targetIssues.some((issue) => issue.root_owner === "subject_expert")) {
    return "preserve_core_node_id";
  }

  return "fix_owned_section_reference";
}

function buildRepairReason(
  strategy: UnitReviewRepairStrategy,
  targetIssues: readonly UnitReviewRepairTargetIssue[]
): string {
  const issueSummary = targetIssues.map((issue) => issue.path).join(", ");
  if (strategy === "preserve_core_node_id") {
    return `Unknown node references were detected at ${issueSummary}. Preserve locked core knowledge node ids and regenerate downstream sections into a review artifact only.`;
  }

  if (strategy === "fix_owned_section_reference") {
    return `Unknown node references were detected at ${issueSummary}. Fix the owned section references so they point to existing knowledge nodes, producing a review artifact only.`;
  }

  return `Unknown node references were detected at ${issueSummary}. Manual triage is required before any automated repair attempt.`;
}

function buildRoleInstructions(strategy: UnitReviewRepairStrategy): string[] {
  const common = [
    "Do not write back to source unit.yaml.",
    "Produce a review artifact only.",
    "Do not approve a blocked artifact.",
    "Do not bypass schema, ownership, or semantic validation gates."
  ];

  if (strategy === "preserve_core_node_id") {
    return [
      ...common,
      "Preserve locked seed knowledge node ids unless a human explicitly approves a full-chain rename.",
      "Assessment, pedagogy, narrative, implementation, and runtime_content references must resolve to existing knowledge nodes."
    ];
  }

  if (strategy === "fix_owned_section_reference") {
    return [
      ...common,
      "Do not invent new knowledge nodes from a downstream section.",
      "Replace dangling references with existing knowledge node ids owned by the current unit graph."
    ];
  }

  return common;
}

function parseMissingNodeId(message: string): string | null {
  const quoted = message.match(/["'“”‘’]([A-Za-z0-9_-]+)["'“”‘’]/);
  if (quoted?.[1]) {
    return quoted[1];
  }

  const explicit = message.match(/\bnode(?:_id)?\s*[:=]\s*([A-Za-z0-9_-]+)/i);
  return explicit?.[1] ?? null;
}

function isCurriculumAgentRole(role: unknown): role is CurriculumAgentRole {
  return typeof role === "string" && curriculumAgentOrder.some((candidate) => candidate === role);
}

function deriveExpectedRerunRoles(startRole: CurriculumAgentRole): CurriculumAgentRole[] | null {
  const startIndex = curriculumAgentOrder.indexOf(startRole);
  return startIndex === -1 ? null : [...curriculumAgentOrder.slice(startIndex)];
}

function rolesEqual(left: readonly (CurriculumAgentRole | "manual_review")[], right: readonly CurriculumAgentRole[]): boolean {
  return left.length === right.length && left.every((role, index) => role === right[index]);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectUnknownFieldIssues(
  value: Record<string, unknown>,
  allowedKeys: readonly string[],
  path: string
): RepairRequestValidationIssue[] {
  const allowed = new Set(allowedKeys);
  return Object.keys(value)
    .filter((key) => !allowed.has(key))
    .map((key) => ({
      code: "unknown_request_field" as const,
      message: `Repair request ${path} contains unknown field "${key}".`
    }));
}

function buildRepairRequestKey(
  unitId: string,
  repairStrategy: UnitReviewRepairStrategy,
  sourceArtifactGeneratedAt: string
): string {
  return `content-pipeline:repair-request:${repairStrategy}:${unitId}:${sourceArtifactGeneratedAt}`;
}

function buildRepairRequestChainKey(unitId: string, rootArtifactGeneratedAt: string): string {
  return `content-pipeline:repair-chain:${unitId}:${rootArtifactGeneratedAt}`;
}
