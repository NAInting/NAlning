import {
  createInMemoryAgentRuntimeEventEmitter,
  type AgentRuntimeEventEmitterOptions,
  type InMemoryAgentRuntimeEventEmitter
} from "@edu-ai/agent-sdk";
import {
  AgentType,
  PrivacyLevel,
  UserRole,
  type AgentRuntimeEventProjection,
  type AgentRuntimeInternalMetadata,
  type ParsedAgentRuntimeEvent
} from "@edu-ai/shared-types";

import { agentSpecFor, type CurriculumAgentRole, type UnitSpecSection } from "./agent-specs";
import type { AgentInvocationFailureCategory } from "./agent-invocation";
import { curriculumAgentOrder } from "./workflow";

export interface ContentPipelineRuntimeEventsOptions {
  emit_runtime_events?: boolean;
  runtime_event_source_agent_id?: string;
  runtime_trace_id?: string;
  runtime_run_id?: string;
  runtime_now?: () => Date;
  runtime_id_generator?: () => string;
  created_at?: string;
}

export interface ContentPipelineRuntimeEventViews {
  runtime_events: readonly ParsedAgentRuntimeEvent[];
  runtime_student_projection: readonly AgentRuntimeEventProjection[];
  runtime_teacher_projection: readonly AgentRuntimeEventProjection[];
  runtime_guardian_projection: readonly AgentRuntimeEventProjection[];
  runtime_admin_audit_projection: readonly AgentRuntimeEventProjection[];
}

export interface WorkflowStageRuntimeMetadata {
  prompt_id?: string;
  prompt_version?: string;
  provider_id?: string;
  model_id?: string;
  input_tokens?: number;
  output_tokens?: number;
}

const DEFAULT_CONTENT_PIPELINE_AGENT_ID = "44444444-4444-4444-8444-444444444444";
const CONTENT_PIPELINE_RUNTIME_VISIBILITY = {
  visible_to_roles: [UserRole.SYSTEM, UserRole.ADMIN]
};

export function createContentPipelineRuntimeEmitter(
  unitId: string,
  options: ContentPipelineRuntimeEventsOptions
): InMemoryAgentRuntimeEventEmitter {
  const emitterOptions: AgentRuntimeEventEmitterOptions = {
    source_agent_id: options.runtime_event_source_agent_id ?? DEFAULT_CONTENT_PIPELINE_AGENT_ID,
    source_agent_type: AgentType.CONTENT_PIPELINE_AGENT,
    default_privacy_level: PrivacyLevel.PUBLIC,
    default_visibility_scope: CONTENT_PIPELINE_RUNTIME_VISIBILITY,
    trace_id: options.runtime_trace_id ?? `trace_content_pipeline_${unitId}`,
    run_id: options.runtime_run_id ?? `run_content_pipeline_${unitId}`
  };

  if (options.runtime_now) {
    emitterOptions.now = options.runtime_now;
  } else if (options.created_at) {
    const createdAt = options.created_at;
    emitterOptions.now = () => new Date(createdAt);
  }

  if (options.runtime_id_generator) {
    emitterOptions.id_generator = options.runtime_id_generator;
  }

  return createInMemoryAgentRuntimeEventEmitter(emitterOptions);
}

export function collectContentPipelineRuntimeEventViews(
  emitter: InMemoryAgentRuntimeEventEmitter | undefined
): ContentPipelineRuntimeEventViews {
  return {
    runtime_events: emitter?.list() ?? [],
    runtime_student_projection: emitter?.project("student") ?? [],
    runtime_teacher_projection: emitter?.project("teacher") ?? [],
    runtime_guardian_projection: emitter?.project("guardian") ?? [],
    runtime_admin_audit_projection: emitter?.project("admin_audit") ?? []
  };
}

export function emitWorkflowStageStart(
  emitter: InMemoryAgentRuntimeEventEmitter | undefined,
  unitId: string,
  role: CurriculumAgentRole,
  attempt: number,
  metadata?: WorkflowStageRuntimeMetadata
): void {
  if (!emitter) {
    return;
  }

  const spec = agentSpecFor(role);
  emitter.emit({
    event_type: "stage_start",
    domain: "content",
    unit_id: unitId,
    stage_id: role,
    payload: {
      title: "Content pipeline stage started",
      summary: `${role} started attempt ${attempt} for section ${spec.owns_section}.`,
      progress: {
        current: curriculumAgentOrder.indexOf(role) + 1,
        total: curriculumAgentOrder.length,
        label: role
      }
    },
    internal_metadata: buildStageMetadata(role, metadata)
  });
}

export function emitWorkflowStageEnd(
  emitter: InMemoryAgentRuntimeEventEmitter | undefined,
  unitId: string,
  role: CurriculumAgentRole,
  attempt: number,
  patchSections: UnitSpecSection[],
  metadata?: WorkflowStageRuntimeMetadata
): void {
  if (!emitter) {
    return;
  }

  emitter.emit({
    event_type: "stage_end",
    domain: "content",
    unit_id: unitId,
    stage_id: role,
    payload: {
      result: {
        result_code: "content_pipeline_stage_passed",
        summary: `${role} passed attempt ${attempt}; patched sections: ${patchSections.join(", ")}.`
      }
    },
    internal_metadata: buildStageMetadata(role, metadata)
  });
}

export function emitWorkflowStageError(
  emitter: InMemoryAgentRuntimeEventEmitter | undefined,
  unitId: string,
  role: CurriculumAgentRole,
  attempt: number,
  category: AgentInvocationFailureCategory,
  retryable: boolean,
  metadata?: WorkflowStageRuntimeMetadata
): void {
  if (!emitter) {
    return;
  }

  emitter.emit({
    event_type: "error",
    domain: "content",
    unit_id: unitId,
    stage_id: role,
    payload: {
      error: {
        error_code: category,
        safe_message: `${role} failed attempt ${attempt}; see sanitized invocation log for triage category.`,
        retryable
      }
    },
    internal_metadata: buildStageMetadata(role, metadata)
  });
}

function buildStageMetadata(
  role: CurriculumAgentRole,
  metadata: WorkflowStageRuntimeMetadata = {}
): AgentRuntimeInternalMetadata {
  const spec = agentSpecFor(role);
  const internalMetadata: AgentRuntimeInternalMetadata = {
    prompt_id: metadata.prompt_id ?? spec.prompt_asset_id,
    prompt_version: metadata.prompt_version ?? "mock"
  };

  if (metadata.provider_id) {
    internalMetadata.provider_id = metadata.provider_id;
  }

  if (metadata.model_id) {
    internalMetadata.model_id = metadata.model_id;
  }

  if (metadata.input_tokens !== undefined) {
    internalMetadata.input_tokens = metadata.input_tokens;
  }

  if (metadata.output_tokens !== undefined) {
    internalMetadata.output_tokens = metadata.output_tokens;
  }

  return internalMetadata;
}
