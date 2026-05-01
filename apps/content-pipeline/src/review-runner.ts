import {
  createLlmGateway,
  createOpenAiCompatibleAdapter,
  type LlmGateway,
  type OpenAiCompatibleAdapterOptions
} from "@edu-ai/llm-gateway";
import type { AgentRuntimeEventProjection, AiNativeUnitSpec } from "@edu-ai/shared-types";

import type { UnitSpecSection } from "./agent-specs";
import { jsonPatchFromGatewayResponseParser, runLlmMockUnitWorkflow, type LlmUnitWorkflowResult } from "./agent-runtime";
import type { AgentInvocationLogSummary } from "./agent-invocation";
import {
  deriveUnitReviewOrchestrationGuidance,
  type UnitReviewOrchestrationGuidance
} from "./orchestration-guidance";
import { createContentPipelinePromptRegistry } from "./prompt-assets";
import { deriveUnitReviewRepairPlan, type UnitReviewRepairPlan } from "./repair-plan";
import { deriveUnitReviewRetryPolicy, type UnitReviewRetryPolicy } from "./retry-policy";
import { prepareScopedReviewRerun, type ReviewRerunContext } from "./review-rerun";
import { mergeAgentPatchIntoUnit } from "./unit-io";
import { validateUnitSemanticIntegrity, type UnitSemanticValidationResult } from "./unit-semantic-validation";
import type { AgentRunState } from "./workflow";
import type { CurriculumAgentRole } from "./agent-specs";

export interface ContentPipelineReviewEnv {
  CONTENT_PIPELINE_REVIEW_PROVIDER?: string;
  CONTENT_PIPELINE_OPENAI_API_KEY?: string;
  CONTENT_PIPELINE_OPENAI_MODEL?: string;
  CONTENT_PIPELINE_OPENAI_BASE_URL?: string;
  CONTENT_PIPELINE_OPENAI_ORGANIZATION?: string;
  CONTENT_PIPELINE_ZHIPU_API_KEY?: string;
  CONTENT_PIPELINE_ZHIPU_MODEL?: string;
  CONTENT_PIPELINE_ZHIPU_BASE_URL?: string;
  CONTENT_PIPELINE_AGGREGATOR_API_KEY?: string;
  CONTENT_PIPELINE_AGGREGATOR_MODEL?: string;
  CONTENT_PIPELINE_AGGREGATOR_BASE_URL?: string;
  CONTENT_PIPELINE_AGGREGATOR_ORGANIZATION?: string;
  CONTENT_PIPELINE_REVIEW_TIMEOUT_MS?: string;
}

export interface OpenAiCompatibleReviewGatewayOptions {
  api_key: string;
  model: string;
  base_url?: string;
  organization?: string;
  route_reason?: string;
  timeout_ms?: number;
  fetch_impl?: OpenAiCompatibleAdapterOptions["fetch_impl"];
}

export interface UnitReviewArtifact {
  schema_version: "content-pipeline-review-artifact/v0.1";
  mode: "llm_review_no_writeback";
  generated_at: string;
  unit_id: string;
  status: "ready_for_human_review" | "blocked";
  writeback_performed: false;
  approval?: UnitReviewApproval;
  semantic_validation?: UnitSemanticValidationResult;
  repair_plan?: UnitReviewRepairPlan;
  retry_policy?: UnitReviewRetryPolicy;
  orchestration_guidance?: UnitReviewOrchestrationGuidance;
  rerun_context?: ReviewRerunContext;
  runtime_projection_summary?: UnitReviewRuntimeProjectionSummary;
  runtime_admin_audit_projection?: readonly AgentRuntimeEventProjection[];
  workflow_runs: Array<Pick<AgentRunState, "role" | "status" | "attempts" | "patch_sections">>;
  invocation_logs: AgentInvocationLogSummary[];
  candidate_patches: Array<{
    role: AgentRunState["role"];
    patch_sections: UnitSpecSection[];
    patch: Partial<Record<UnitSpecSection, unknown>>;
    diff: UnitReviewDiffChange[];
  }>;
}

export interface UnitReviewRuntimeProjectionSummary {
  total_events: number;
  student_projection_count: number;
  teacher_projection_count: number;
  guardian_projection_count: number;
  admin_audit_projection_count: number;
}

export interface UnitReviewApproval {
  status: "approved" | "rejected";
  reviewer_id: string;
  reviewed_at: string;
  notes?: string;
}

export interface UnitReviewDiffChange {
  path: string;
  change_type: "added" | "removed" | "changed";
  before?: unknown;
  after?: unknown;
}

export interface LlmReviewWorkflowOptions {
  gateway?: Pick<LlmGateway, "complete">;
  now?: () => Date;
  rerun?: {
    from_artifact: UnitReviewArtifact;
    start_from_role?: CurriculumAgentRole;
  };
}

export function createOpenAiCompatibleReviewGateway(options: OpenAiCompatibleReviewGatewayOptions): LlmGateway {
  const adapterOptions: OpenAiCompatibleAdapterOptions = {
    api_key: options.api_key,
    model: options.model
  };

  if (options.base_url) {
    adapterOptions.base_url = options.base_url;
  }

  if (options.organization) {
    adapterOptions.organization = options.organization;
  }

  if (options.timeout_ms) {
    adapterOptions.timeout_ms = options.timeout_ms;
  }

  if (options.fetch_impl) {
    adapterOptions.fetch_impl = options.fetch_impl;
  }

  return createLlmGateway({
    adapters: [createOpenAiCompatibleAdapter(adapterOptions)],
    promptRegistry: createContentPipelinePromptRegistry(),
    routeSelector: (_request, privacy) => {
      if (privacy.route_selected === "campus_local") {
        throw new Error("Content-pipeline review mode refuses campus-local routing with a cloud provider");
      }

      return {
        provider: "openai_compatible",
        model: options.model,
        deployment: "controlled_cloud",
        reason: options.route_reason ?? "content_pipeline_review_openai_compatible"
      };
    }
  });
}

export function createContentPipelineReviewGatewayFromEnv(env: ContentPipelineReviewEnv = process.env): LlmGateway {
  const provider = env.CONTENT_PIPELINE_REVIEW_PROVIDER ?? "openai-compatible";
  const timeoutMs = parseReviewTimeoutMs(env.CONTENT_PIPELINE_REVIEW_TIMEOUT_MS);
  if (provider === "openai-compatible") {
    const apiKey = env.CONTENT_PIPELINE_OPENAI_API_KEY;
    const model = env.CONTENT_PIPELINE_OPENAI_MODEL;
    if (!apiKey || !model) {
      throw new Error(
        "Missing CONTENT_PIPELINE_OPENAI_API_KEY or CONTENT_PIPELINE_OPENAI_MODEL for llm review mode"
      );
    }

    return createOpenAiCompatibleReviewGateway({
      api_key: apiKey,
      model,
      ...(timeoutMs ? { timeout_ms: timeoutMs } : {}),
      route_reason: "content_pipeline_review_openai_compatible",
      ...(env.CONTENT_PIPELINE_OPENAI_BASE_URL ? { base_url: env.CONTENT_PIPELINE_OPENAI_BASE_URL } : {}),
      ...(env.CONTENT_PIPELINE_OPENAI_ORGANIZATION ? { organization: env.CONTENT_PIPELINE_OPENAI_ORGANIZATION } : {})
    });
  }

  if (provider === "zhipu-openai-compatible" || provider === "zhipu") {
    const apiKey = env.CONTENT_PIPELINE_ZHIPU_API_KEY;
    const model = env.CONTENT_PIPELINE_ZHIPU_MODEL;
    if (!apiKey || !model) {
      throw new Error(
        "Missing CONTENT_PIPELINE_ZHIPU_API_KEY or CONTENT_PIPELINE_ZHIPU_MODEL for zhipu review mode"
      );
    }

    return createOpenAiCompatibleReviewGateway({
      api_key: apiKey,
      model,
      base_url: env.CONTENT_PIPELINE_ZHIPU_BASE_URL ?? "https://open.bigmodel.cn/api/paas/v4/",
      ...(timeoutMs ? { timeout_ms: timeoutMs } : {}),
      route_reason: "content_pipeline_review_trusted_official_zhipu"
    });
  }

  if (provider === "aggregator-openai-compatible" || provider === "aggregator" || provider === "4sapi") {
    const apiKey = env.CONTENT_PIPELINE_AGGREGATOR_API_KEY;
    const model = env.CONTENT_PIPELINE_AGGREGATOR_MODEL;
    const baseUrl = env.CONTENT_PIPELINE_AGGREGATOR_BASE_URL;
    if (!apiKey || !model || !baseUrl) {
      throw new Error(
        "Missing CONTENT_PIPELINE_AGGREGATOR_API_KEY, CONTENT_PIPELINE_AGGREGATOR_MODEL, or CONTENT_PIPELINE_AGGREGATOR_BASE_URL for aggregator review mode"
      );
    }

    return createOpenAiCompatibleReviewGateway({
      api_key: apiKey,
      model,
      base_url: baseUrl,
      ...(timeoutMs ? { timeout_ms: timeoutMs } : {}),
      route_reason: "content_pipeline_review_aggregator_cloud",
      ...(env.CONTENT_PIPELINE_AGGREGATOR_ORGANIZATION
        ? { organization: env.CONTENT_PIPELINE_AGGREGATOR_ORGANIZATION }
        : {})
    });
  }

  {
    throw new Error(`Unsupported content-pipeline review provider: ${provider}`);
  }
}

function parseReviewTimeoutMs(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error("CONTENT_PIPELINE_REVIEW_TIMEOUT_MS must be a positive integer when provided");
  }

  return parsed;
}

export async function runLlmReviewUnitWorkflow(
  unit: AiNativeUnitSpec,
  options: LlmReviewWorkflowOptions = {}
): Promise<UnitReviewArtifact> {
  const generatedAt = options.now?.() ?? new Date();
  const preparedRerun = options.rerun
    ? prepareScopedReviewRerun(unit, options.rerun.from_artifact, options.rerun.start_from_role)
    : undefined;
  const gateway = options.gateway ?? createContentPipelineReviewGatewayFromEnv();
  const result = await runLlmMockUnitWorkflow(preparedRerun?.unit ?? unit, {
    gateway,
    parser: jsonPatchFromGatewayResponseParser,
    emit_runtime_events: true,
    created_at: generatedAt.toISOString(),
    ...(preparedRerun ? { start_from_role: preparedRerun.context.start_from_role } : {})
  });

  return createUnitReviewArtifact(result, () => generatedAt, preparedRerun?.unit ?? unit, preparedRerun?.context);
}

export function createUnitReviewArtifact(
  result: LlmUnitWorkflowResult,
  now: () => Date = () => new Date(),
  baseUnit: AiNativeUnitSpec = result.unit,
  rerunContext?: ReviewRerunContext
): UnitReviewArtifact {
  const candidatePatches = buildCandidatePatches(result, baseUnit);
  const workflowSucceeded = result.logs.every((entry) => entry.status === "succeeded");
  const semanticValidation = workflowSucceeded
    ? validateReviewCandidateSemanticIntegrity(baseUnit, candidatePatches)
    : undefined;
  const repairPlan = deriveUnitReviewRepairPlan({
    ...(semanticValidation ? { semantic_validation: semanticValidation } : {}),
    candidate_patches: candidatePatches,
    invocations: result.invocations
  });
  const retryPolicy = deriveUnitReviewRetryPolicy({
    ...(repairPlan ? { repair_plan: repairPlan } : {}),
    workflow_runs: result.state.runs.map((run) => ({
      role: run.role,
      status: run.status,
      attempts: run.attempts
    })),
    invocation_logs: result.logs,
    ...(rerunContext ? { rerun_context: rerunContext } : {})
  });
  const status = workflowSucceeded && semanticValidation?.passed !== false ? "ready_for_human_review" : "blocked";
  const orchestrationGuidance = deriveUnitReviewOrchestrationGuidance({
    unit_id: result.unit.metadata.unit_id,
    artifact_status: status,
    ...(repairPlan ? { repair_plan: repairPlan } : {}),
    ...(retryPolicy ? { retry_policy: retryPolicy } : {}),
    ...(rerunContext ? { rerun_context: rerunContext } : {})
  });
  const runtimeProjectionSummary = buildRuntimeProjectionSummary(result);

  return {
    schema_version: "content-pipeline-review-artifact/v0.1",
    mode: "llm_review_no_writeback",
    generated_at: now().toISOString(),
    unit_id: result.unit.metadata.unit_id,
    status,
    writeback_performed: false,
    ...(semanticValidation ? { semantic_validation: semanticValidation } : {}),
    ...(repairPlan ? { repair_plan: repairPlan } : {}),
    ...(retryPolicy ? { retry_policy: retryPolicy } : {}),
    orchestration_guidance: orchestrationGuidance,
    ...(rerunContext ? { rerun_context: rerunContext } : {}),
    ...(runtimeProjectionSummary.total_events > 0
      ? {
          runtime_projection_summary: runtimeProjectionSummary,
          runtime_admin_audit_projection: result.runtime_admin_audit_projection
        }
      : {}),
    workflow_runs: result.state.runs.map((run) => ({
      role: run.role,
      status: run.status,
      attempts: run.attempts,
      patch_sections: run.patch_sections
    })),
    invocation_logs: result.logs,
    candidate_patches: candidatePatches
  };
}

function buildRuntimeProjectionSummary(result: LlmUnitWorkflowResult): UnitReviewRuntimeProjectionSummary {
  return {
    total_events: result.runtime_events.length,
    student_projection_count: result.runtime_student_projection.length,
    teacher_projection_count: result.runtime_teacher_projection.length,
    guardian_projection_count: result.runtime_guardian_projection.length,
    admin_audit_projection_count: result.runtime_admin_audit_projection.length
  };
}

function buildCandidatePatches(
  result: LlmUnitWorkflowResult,
  baseUnit: AiNativeUnitSpec
): UnitReviewArtifact["candidate_patches"] {
  return result.invocations.flatMap((invocation) => {
    if (invocation.status !== "succeeded" || !invocation.patch) {
      return [];
    }

    return [
      {
        role: invocation.role,
        patch_sections: invocation.patch_sections,
        patch: invocation.patch,
        diff: buildPatchDiff(baseUnit, invocation.patch)
      }
    ];
  });
}

function validateReviewCandidateSemanticIntegrity(
  baseUnit: AiNativeUnitSpec,
  candidatePatches: UnitReviewArtifact["candidate_patches"]
): UnitSemanticValidationResult {
  try {
    let currentUnit = baseUnit;
    for (const candidate of candidatePatches) {
      currentUnit = mergeAgentPatchIntoUnit(currentUnit, candidate.role, candidate.patch);
    }

    return validateUnitSemanticIntegrity(currentUnit);
  } catch (error) {
    return {
      passed: false,
      error_count: 1,
      warning_count: 0,
      issues: [
        {
          severity: "error",
          code: "candidate_merge_failed",
          path: "candidate_patches",
          message: error instanceof Error ? error.message : String(error)
        }
      ]
    };
  }
}

export function buildPatchDiff(
  baseUnit: AiNativeUnitSpec,
  patch: Partial<Record<UnitSpecSection, unknown>>
): UnitReviewDiffChange[] {
  return Object.entries(patch).flatMap(([section, value]) => {
    const unitSection = section as UnitSpecSection;
    return diffJsonValues(baseUnit[unitSection], value, unitSection);
  });
}

function diffJsonValues(before: unknown, after: unknown, path: string): UnitReviewDiffChange[] {
  if (isRecord(before) && isRecord(after)) {
    const keys = new Set([...Object.keys(before), ...Object.keys(after)].sort());
    return [...keys].flatMap((key) => {
      const nextPath = `${path}.${key}`;
      if (!(key in before)) {
        return [withAfter(nextPath, "added", after[key])];
      }

      if (!(key in after)) {
        return [withBefore(nextPath, "removed", before[key])];
      }

      return diffJsonValues(before[key], after[key], nextPath);
    });
  }

  if (Array.isArray(before) && Array.isArray(after)) {
    const maxLength = Math.max(before.length, after.length);
    return Array.from({ length: maxLength }, (_, index) => {
      const nextPath = `${path}[${index}]`;
      if (index >= before.length) {
        return [withAfter(nextPath, "added", after[index])];
      }

      if (index >= after.length) {
        return [withBefore(nextPath, "removed", before[index])];
      }

      return diffJsonValues(before[index], after[index], nextPath);
    }).flat();
  }

  if (deepEqual(before, after)) {
    return [];
  }

  return [withBeforeAndAfter(path, before, after)];
}

function withBefore(path: string, changeType: "removed", before: unknown): UnitReviewDiffChange {
  return {
    path,
    change_type: changeType,
    before
  };
}

function withAfter(path: string, changeType: "added", after: unknown): UnitReviewDiffChange {
  return {
    path,
    change_type: changeType,
    after
  };
}

function withBeforeAndAfter(path: string, before: unknown, after: unknown): UnitReviewDiffChange {
  return {
    path,
    change_type: "changed",
    before,
    after
  };
}

function deepEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
