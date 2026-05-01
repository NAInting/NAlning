import { z } from "zod";

import { BaseEntitySchema, IsoDateTimeSchema, NonEmptyStringSchema, VisibilityScopeSchema } from "../base";
import type { VisibilityScope } from "../base";
import {
  AgentMode,
  HelpResolution,
  InterventionSource,
  LearningEventType,
  PrivacyLevel,
  RetentionPolicy
} from "../enums";

/**
 * 对话轮次事件载荷。
 */
export interface ConversationTurnPayload {
  conversation_id: string;
  turn_index: number;
  agent_mode: AgentMode;
  duration_seconds: number;
}

/**
 * 对话轮次事件载荷 schema。
 */
export const ConversationTurnPayloadSchema = z
  .object({
    conversation_id: z.string().uuid(),
    turn_index: z.number().int().nonnegative(),
    agent_mode: z.nativeEnum(AgentMode),
    duration_seconds: z.number().int().nonnegative()
  })
  .strict();

/**
 * 练习作答事件载荷。
 */
export interface ExerciseAttemptPayload {
  assessment_id: string;
  item_id: string;
  student_answer: string;
  is_correct: boolean;
  time_spent_seconds: number;
  hints_used: number;
}

/**
 * 练习作答事件载荷 schema。
 */
export const ExerciseAttemptPayloadSchema = z
  .object({
    assessment_id: z.string().uuid(),
    item_id: z.string().uuid(),
    student_answer: NonEmptyStringSchema.max(10000),
    is_correct: z.boolean(),
    time_spent_seconds: z.number().int().nonnegative(),
    hints_used: z.number().int().nonnegative()
  })
  .strict();

/**
 * 单元进度事件载荷。
 */
export interface UnitProgressPayload {
  progress_percentage: number;
  completed_step_ids: string[];
}

/**
 * 单元进度事件载荷 schema。
 */
export const UnitProgressPayloadSchema = z
  .object({
    progress_percentage: z.number().min(0).max(100),
    completed_step_ids: z.array(z.string().uuid()).max(500)
  })
  .strict();

/**
 * 求助事件载荷。
 */
export interface HelpRequestPayload {
  topic: string;
  resolution: HelpResolution;
}

/**
 * 求助事件载荷 schema。
 */
export const HelpRequestPayloadSchema = z
  .object({
    topic: NonEmptyStringSchema.max(500),
    resolution: z.nativeEnum(HelpResolution)
  })
  .strict();

/**
 * 干预事件载荷。
 */
export interface InterventionPayload {
  intervention_id: string;
  source: InterventionSource;
  action_type: string;
}

/**
 * 干预事件载荷 schema。
 */
export const InterventionPayloadSchema = z
  .object({
    intervention_id: z.string().uuid(),
    source: z.nativeEnum(InterventionSource),
    action_type: NonEmptyStringSchema.max(120)
  })
  .strict();

/**
 * 反思事件载荷。
 */
export interface ReflectionPayload {
  prompt: string;
  student_response: string;
  reflection_quality_score?: number;
}

/**
 * 反思事件载荷 schema。
 */
export const ReflectionPayloadSchema = z
  .object({
    prompt: NonEmptyStringSchema.max(4000),
    student_response: NonEmptyStringSchema.max(10000),
    reflection_quality_score: z.number().min(0).max(1).optional()
  })
  .strict();

/**
 * 学习事件载荷联合。
 */
export type LearningEventPayload =
  | ConversationTurnPayload
  | ExerciseAttemptPayload
  | UnitProgressPayload
  | HelpRequestPayload
  | InterventionPayload
  | ReflectionPayload;

/**
 * 学习事件载荷联合 schema。
 */
export const LearningEventPayloadSchema = z.union([
  ConversationTurnPayloadSchema,
  ExerciseAttemptPayloadSchema,
  UnitProgressPayloadSchema,
  HelpRequestPayloadSchema,
  InterventionPayloadSchema,
  ReflectionPayloadSchema
]);

/**
 * 学习事件实体。
 */
export interface LearningEvent {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  student_id: string;
  event_type: LearningEventType;
  unit_id?: string;
  knowledge_node_ids: string[];
  session_id: string;
  payload: LearningEventPayload;
  occurred_at: string;
  privacy_level: PrivacyLevel;
  visibility_scope: VisibilityScope;
  retention_policy: RetentionPolicy;
}

/**
 * 学习事件实体 schema。
 */
export const LearningEventSchema = BaseEntitySchema.extend({
  student_id: z.string().uuid(),
  event_type: z.nativeEnum(LearningEventType),
  unit_id: z.string().uuid().optional(),
  knowledge_node_ids: z.array(z.string().uuid()).max(100),
  session_id: z.string().uuid(),
  payload: LearningEventPayloadSchema,
  occurred_at: IsoDateTimeSchema,
  privacy_level: z.nativeEnum(PrivacyLevel),
  visibility_scope: VisibilityScopeSchema,
  retention_policy: z.nativeEnum(RetentionPolicy)
});
