import { z } from "zod";

import {
  BaseEntitySchema,
  IsoDateTimeSchema,
  NonEmptyStringSchema,
  VisibilityScopeSchema,
  type BaseEntity,
  type VisibilityScope
} from "../base";
import { AgentType, PrivacyLevel, UserRole } from "../enums";

export const AgentRuntimeEventTypeSchema = z.enum([
  "stage_start",
  "stage_end",
  "progress",
  "tool_call",
  "tool_result",
  "source_anchor",
  "content_delta",
  "result",
  "blocked",
  "error",
  "done"
]);

export type AgentRuntimeEventType = z.infer<typeof AgentRuntimeEventTypeSchema>;

export const AgentRuntimeEventDomainSchema = z.enum(["academic", "content", "runtime", "emotion", "system"]);
export type AgentRuntimeEventDomain = z.infer<typeof AgentRuntimeEventDomainSchema>;

export const AgentRuntimeEventProjectionViewSchema = z.enum(["student", "teacher", "guardian", "admin_audit"]);
export type AgentRuntimeEventProjectionView = z.infer<typeof AgentRuntimeEventProjectionViewSchema>;

export interface AgentRuntimeProgressPayload {
  current?: number | undefined;
  total?: number | undefined;
  label?: string | undefined;
}

export const AgentRuntimeProgressPayloadSchema = z
  .object({
    current: z.number().int().nonnegative().optional(),
    total: z.number().int().positive().optional(),
    label: NonEmptyStringSchema.max(200).optional()
  })
  .strict();

export interface AgentRuntimeToolPayload {
  tool_name: string;
  invocation_id: string;
  status: "started" | "succeeded" | "failed";
  capability?: string | undefined;
}

export const AgentRuntimeToolPayloadSchema = z
  .object({
    tool_name: NonEmptyStringSchema.max(120),
    invocation_id: NonEmptyStringSchema.max(160),
    status: z.enum(["started", "succeeded", "failed"]),
    capability: NonEmptyStringSchema.max(120).optional()
  })
  .strict();

export interface AgentRuntimeSourceAnchorPayload {
  source_id: string;
  source_type: "unit" | "knowledge_node" | "runtime_block" | "assessment_item" | "memory_summary" | "tool_result";
  reference: string;
}

export const AgentRuntimeSourceAnchorPayloadSchema = z
  .object({
    source_id: NonEmptyStringSchema.max(160),
    source_type: z.enum(["unit", "knowledge_node", "runtime_block", "assessment_item", "memory_summary", "tool_result"]),
    reference: NonEmptyStringSchema.max(1000)
  })
  .strict();

export interface AgentRuntimeContentDeltaPayload {
  text_delta?: string | undefined;
  block_id?: string | undefined;
  sequence?: number | undefined;
}

export const AgentRuntimeContentDeltaPayloadSchema = z
  .object({
    text_delta: NonEmptyStringSchema.max(4000).optional(),
    block_id: NonEmptyStringSchema.max(160).optional(),
    sequence: z.number().int().nonnegative().optional()
  })
  .strict();

export interface AgentRuntimeResultPayload {
  result_code: string;
  summary: string;
}

export const AgentRuntimeResultPayloadSchema = z
  .object({
    result_code: NonEmptyStringSchema.max(120),
    summary: NonEmptyStringSchema.max(1000)
  })
  .strict();

export interface AgentRuntimeErrorPayload {
  error_code: string;
  safe_message: string;
  retryable: boolean;
}

export const AgentRuntimeErrorPayloadSchema = z
  .object({
    error_code: NonEmptyStringSchema.max(120),
    safe_message: NonEmptyStringSchema.max(1000),
    retryable: z.boolean()
  })
  .strict();

export interface AgentRuntimeBlockedPayload {
  reason_code: string;
  safe_message: string;
  next_human_action?: string | undefined;
}

export const AgentRuntimeBlockedPayloadSchema = z
  .object({
    reason_code: NonEmptyStringSchema.max(120),
    safe_message: NonEmptyStringSchema.max(1000),
    next_human_action: NonEmptyStringSchema.max(400).optional()
  })
  .strict();

export interface AgentRuntimeEventPayload {
  title?: string | undefined;
  summary?: string | undefined;
  progress?: AgentRuntimeProgressPayload | undefined;
  tool?: AgentRuntimeToolPayload | undefined;
  source_anchor?: AgentRuntimeSourceAnchorPayload | undefined;
  content_delta?: AgentRuntimeContentDeltaPayload | undefined;
  result?: AgentRuntimeResultPayload | undefined;
  error?: AgentRuntimeErrorPayload | undefined;
  blocked?: AgentRuntimeBlockedPayload | undefined;
}

export const AgentRuntimeEventPayloadSchema = z
  .object({
    title: NonEmptyStringSchema.max(200).optional(),
    summary: NonEmptyStringSchema.max(1000).optional(),
    progress: AgentRuntimeProgressPayloadSchema.optional(),
    tool: AgentRuntimeToolPayloadSchema.optional(),
    source_anchor: AgentRuntimeSourceAnchorPayloadSchema.optional(),
    content_delta: AgentRuntimeContentDeltaPayloadSchema.optional(),
    result: AgentRuntimeResultPayloadSchema.optional(),
    error: AgentRuntimeErrorPayloadSchema.optional(),
    blocked: AgentRuntimeBlockedPayloadSchema.optional()
  })
  .strict();

export interface AgentRuntimeInternalMetadata {
  prompt_id?: string | undefined;
  prompt_version?: string | undefined;
  provider_id?: string | undefined;
  model_id?: string | undefined;
  latency_ms?: number | undefined;
  input_tokens?: number | undefined;
  output_tokens?: number | undefined;
  cost_micro_usd?: number | undefined;
}

export const AgentRuntimeInternalMetadataSchema = z
  .object({
    prompt_id: NonEmptyStringSchema.max(160).optional(),
    prompt_version: NonEmptyStringSchema.max(80).optional(),
    provider_id: NonEmptyStringSchema.max(120).optional(),
    model_id: NonEmptyStringSchema.max(120).optional(),
    latency_ms: z.number().int().nonnegative().optional(),
    input_tokens: z.number().int().nonnegative().optional(),
    output_tokens: z.number().int().nonnegative().optional(),
    cost_micro_usd: z.number().int().nonnegative().optional()
  })
  .strict();

export interface AgentRuntimeEvent extends BaseEntity {
  trace_id: string;
  run_id: string;
  sequence: number;
  event_type: AgentRuntimeEventType;
  domain: AgentRuntimeEventDomain;
  source_agent_id: string;
  source_agent_type: AgentType;
  session_id?: string | undefined;
  student_id?: string | undefined;
  unit_id?: string | undefined;
  stage_id?: string | undefined;
  privacy_level: PrivacyLevel;
  visibility_scope: VisibilityScope;
  occurred_at: string;
  payload: AgentRuntimeEventPayload;
  internal_metadata?: AgentRuntimeInternalMetadata | undefined;
}

const FORBIDDEN_RUNTIME_EVENT_KEYS = new Set([
  "raw_prompt",
  "prompt",
  "prompt_messages",
  "raw_output",
  "raw_response",
  "chain_of_thought",
  "thinking",
  "internal_reasoning",
  "student_message",
  "student_response",
  "conversation_text",
  "conversation_excerpt",
  "full_transcript",
  "transcript",
  "emotion_text",
  "emotion_detail",
  "guardian_private_note",
  "teacher_private_note"
]);

function hasForbiddenRuntimeEventKeys(input: unknown): boolean {
  if (Array.isArray(input)) {
    return input.some((item) => hasForbiddenRuntimeEventKeys(item));
  }

  if (!input || typeof input !== "object") {
    return false;
  }

  return Object.entries(input as Record<string, unknown>).some(([key, value]) => {
    if (FORBIDDEN_RUNTIME_EVENT_KEYS.has(key)) {
      return true;
    }

    return hasForbiddenRuntimeEventKeys(value);
  });
}

export const AgentRuntimeEventSchema = BaseEntitySchema.extend({
  trace_id: NonEmptyStringSchema.max(160),
  run_id: NonEmptyStringSchema.max(160),
  sequence: z.number().int().nonnegative(),
  event_type: AgentRuntimeEventTypeSchema,
  domain: AgentRuntimeEventDomainSchema,
  source_agent_id: z.string().uuid(),
  source_agent_type: z.nativeEnum(AgentType),
  session_id: z.string().uuid().optional(),
  student_id: z.string().uuid().optional(),
  unit_id: NonEmptyStringSchema.max(160).optional(),
  stage_id: NonEmptyStringSchema.max(160).optional(),
  privacy_level: z.nativeEnum(PrivacyLevel),
  visibility_scope: VisibilityScopeSchema,
  occurred_at: IsoDateTimeSchema,
  payload: AgentRuntimeEventPayloadSchema,
  internal_metadata: AgentRuntimeInternalMetadataSchema.optional()
}).superRefine((value, ctx) => {
  if (hasForbiddenRuntimeEventKeys(value.payload) || hasForbiddenRuntimeEventKeys(value.internal_metadata)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["payload"],
      message: "AgentRuntimeEvent must not carry raw prompts, raw model output, raw dialogue, or emotional details."
    });
  }

  if (value.domain === "emotion" && value.privacy_level !== PrivacyLevel.CAMPUS_LOCAL_ONLY) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["privacy_level"],
      message: "Emotion runtime events must be marked campus_local_only."
    });
  }

  if (value.privacy_level === PrivacyLevel.STUDENT_PRIVATE) {
    const invalidRoles = value.visibility_scope.visible_to_roles.filter(
      (role) => role !== UserRole.STUDENT && role !== UserRole.SYSTEM
    );
    if (invalidRoles.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["visibility_scope", "visible_to_roles"],
        message: `Student-private runtime events cannot be visible to: ${invalidRoles.join(", ")}.`
      });
    }
  }
});

export type ParsedAgentRuntimeEvent = z.infer<typeof AgentRuntimeEventSchema>;

export interface AgentRuntimeEventProjection {
  id: string;
  trace_id: string;
  run_id: string;
  sequence: number;
  event_type: AgentRuntimeEventType;
  domain: AgentRuntimeEventDomain;
  privacy_level: PrivacyLevel;
  occurred_at: string;
  payload: AgentRuntimeEventPayload;
  internal_metadata?: AgentRuntimeInternalMetadata | undefined;
}

const PROJECTION_VIEW_ROLE: Record<AgentRuntimeEventProjectionView, UserRole> = {
  student: UserRole.STUDENT,
  teacher: UserRole.TEACHER,
  guardian: UserRole.GUARDIAN,
  admin_audit: UserRole.ADMIN
};

export function projectAgentRuntimeEvent(
  event: ParsedAgentRuntimeEvent,
  view: AgentRuntimeEventProjectionView
): AgentRuntimeEventProjection | null {
  const role = PROJECTION_VIEW_ROLE[view];
  const canSee =
    event.visibility_scope.visible_to_roles.includes(role) ||
    (view === "admin_audit" && event.visibility_scope.visible_to_roles.includes(UserRole.SYSTEM));

  if (!canSee) {
    return null;
  }

  const projection: AgentRuntimeEventProjection = {
    id: event.id,
    trace_id: event.trace_id,
    run_id: event.run_id,
    sequence: event.sequence,
    event_type: event.event_type,
    domain: event.domain,
    privacy_level: event.privacy_level,
    occurred_at: event.occurred_at,
    payload: event.payload
  };

  if (view === "admin_audit" && event.internal_metadata) {
    projection.internal_metadata = event.internal_metadata;
  }

  return projection;
}
