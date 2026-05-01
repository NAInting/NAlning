import { z } from "zod";

import {
  BaseEntitySchema,
  IsoDateTimeSchema,
  NonEmptyStringSchema,
  VisibilityScopeSchema,
  type VisibilityScope
} from "../base";
import { AgentMode, ConversationSpeaker, ConversationStatus, EmotionCategory, PrivacyLevel } from "../enums";

/**
 * 对话访问记录。
 */
export interface ConversationAccessRecord {
  user_id: string;
  accessed_at: string;
  reason: string;
}

/**
 * 对话访问记录 schema。
 */
export const ConversationAccessRecordSchema = z.object({
  user_id: z.string().uuid(),
  accessed_at: IsoDateTimeSchema,
  reason: NonEmptyStringSchema.max(500)
});

/**
 * 对话轮次。
 */
export interface ConversationTurn {
  turn_id: string;
  order: number;
  speaker: ConversationSpeaker;
  content: string;
  model_version?: string;
  prompt_version?: string;
  detected_intent?: string;
  detected_emotion?: EmotionCategory;
  detected_knowledge_nodes?: string[];
  created_at: string;
  response_latency_ms?: number;
}

/**
 * 对话轮次 schema。
 */
export const ConversationTurnSchema = z.object({
  turn_id: z.string().uuid(),
  order: z.number().int().nonnegative(),
  speaker: z.nativeEnum(ConversationSpeaker),
  content: NonEmptyStringSchema.max(10000),
  model_version: NonEmptyStringSchema.max(120).optional(),
  prompt_version: NonEmptyStringSchema.max(120).optional(),
  detected_intent: NonEmptyStringSchema.max(120).optional(),
  detected_emotion: z.nativeEnum(EmotionCategory).optional(),
  detected_knowledge_nodes: z.array(z.string().uuid()).max(100).optional(),
  created_at: IsoDateTimeSchema,
  response_latency_ms: z.number().int().nonnegative().optional()
});

/**
 * 对话实体。
 */
export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  student_id: string;
  agent_id: string;
  mode: AgentMode;
  topic?: string;
  unit_id?: string;
  knowledge_node_ids: string[];
  turns: ConversationTurn[];
  turn_count: number;
  privacy_level: PrivacyLevel;
  visibility_scope: VisibilityScope;
  was_routed_to_local_model: boolean;
  routing_reason?: string;
  status: ConversationStatus;
  started_at: string;
  ended_at?: string;
  accessed_by: ConversationAccessRecord[];
}

/**
 * 对话实体 schema。
 */
export const ConversationSchema = BaseEntitySchema.extend({
  student_id: z.string().uuid(),
  agent_id: z.string().uuid(),
  mode: z.nativeEnum(AgentMode),
  topic: NonEmptyStringSchema.max(200).optional(),
  unit_id: z.string().uuid().optional(),
  knowledge_node_ids: z.array(z.string().uuid()).max(100),
  turns: z.array(ConversationTurnSchema).max(1000),
  turn_count: z.number().int().nonnegative(),
  privacy_level: z.nativeEnum(PrivacyLevel),
  visibility_scope: VisibilityScopeSchema,
  was_routed_to_local_model: z.boolean(),
  routing_reason: NonEmptyStringSchema.max(500).optional(),
  status: z.nativeEnum(ConversationStatus),
  started_at: IsoDateTimeSchema,
  ended_at: IsoDateTimeSchema.optional(),
  accessed_by: z.array(ConversationAccessRecordSchema).max(500)
});
