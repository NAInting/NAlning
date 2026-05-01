import { z } from "zod";

import {
  BaseEntitySchema,
  IsoDateTimeSchema,
  NonEmptyStringSchema,
  VisibilityScopeSchema,
  type VisibilityScope
} from "../base";
import { DifficultyProgression, MemoryPrivacyBucket, PedagogyType } from "../enums";
import { EmotionBaselineSchema, type EmotionBaseline } from "../communication/emotion-baseline";
import { ConversationTurnSchema, type ConversationTurn } from "../learning/conversation";

/**
 * 工作记忆。
 */
export interface WorkingMemory {
  agent_id: string;
  conversation_id: string;
  recent_turns: ConversationTurn[];
  context_window_size: number;
  updated_at: string;
}

/**
 * 工作记忆 schema。
 */
export const WorkingMemorySchema = z.object({
  agent_id: z.string().uuid(),
  conversation_id: z.string().uuid(),
  recent_turns: z.array(ConversationTurnSchema).max(100),
  context_window_size: z.number().int().positive().max(200),
  updated_at: IsoDateTimeSchema
});

/**
 * 对话轮次范围。
 */
export interface SourceTurnRange {
  start: number;
  end: number;
}

/**
 * 对话轮次范围 schema。
 */
export const SourceTurnRangeSchema = z.object({
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative()
});

/**
 * 情节记忆条目。
 */
export interface EpisodicMemoryEntry {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  agent_id: string;
  student_id: string;
  summary: string;
  topic: string;
  related_node_ids: string[];
  embedding_id: string;
  privacy_bucket: MemoryPrivacyBucket;
  source_conversation_id: string;
  source_turn_range: SourceTurnRange;
  importance_score: number;
  visibility_scope: VisibilityScope;
  retention_until?: string;
  deleted_by_student: boolean;
  deletion_reason?: string;
}

/**
 * 情节记忆条目 schema。
 */
export const EpisodicMemoryEntrySchema = BaseEntitySchema.extend({
  agent_id: z.string().uuid(),
  student_id: z.string().uuid(),
  summary: NonEmptyStringSchema.max(4000),
  topic: NonEmptyStringSchema.max(200),
  related_node_ids: z.array(z.string().uuid()).max(100),
  embedding_id: z.string().uuid(),
  privacy_bucket: z.nativeEnum(MemoryPrivacyBucket),
  source_conversation_id: z.string().uuid(),
  source_turn_range: SourceTurnRangeSchema,
  importance_score: z.number().min(0).max(1),
  visibility_scope: VisibilityScopeSchema,
  retention_until: IsoDateTimeSchema.optional(),
  deleted_by_student: z.boolean(),
  deletion_reason: NonEmptyStringSchema.max(500).optional()
});

/**
 * 知识画像汇总。
 */
export interface KnowledgeProfile {
  mastered_node_count: number;
  developing_node_count: number;
  struggling_node_ids: string[];
  strong_subject_tags: string[];
  weak_subject_tags: string[];
}

/**
 * 知识画像汇总 schema。
 */
export const KnowledgeProfileSchema = z.object({
  mastered_node_count: z.number().int().nonnegative(),
  developing_node_count: z.number().int().nonnegative(),
  struggling_node_ids: z.array(z.string().uuid()).max(100),
  strong_subject_tags: z.array(NonEmptyStringSchema.max(120)).max(50),
  weak_subject_tags: z.array(NonEmptyStringSchema.max(120)).max(50)
});

/**
 * 学习风格画像。
 */
export interface LearningStyleProfile {
  preferred_pedagogies: PedagogyType[];
  typical_focus_duration_minutes: number;
  peak_active_hours: number[];
  preferred_difficulty_progression: DifficultyProgression;
}

/**
 * 学习风格画像 schema。
 */
export const LearningStyleProfileSchema = z.object({
  preferred_pedagogies: z.array(z.nativeEnum(PedagogyType)).max(20),
  typical_focus_duration_minutes: z.number().int().positive().max(1440),
  peak_active_hours: z.array(z.number().int().min(0).max(23)).max(24),
  preferred_difficulty_progression: z.nativeEnum(DifficultyProgression)
});

/**
 * 兴趣画像。
 */
export interface InterestProfile {
  frequently_asked_topics: string[];
  voluntary_deep_dives: string[];
  low_engagement_areas: string[];
}

/**
 * 兴趣画像 schema。
 */
export const InterestProfileSchema = z.object({
  frequently_asked_topics: z.array(NonEmptyStringSchema.max(200)).max(100),
  voluntary_deep_dives: z.array(NonEmptyStringSchema.max(200)).max(100),
  low_engagement_areas: z.array(NonEmptyStringSchema.max(200)).max(100)
});

/**
 * 学生记忆快照。
 */
export interface StudentMemorySnapshot {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  student_id: string;
  agent_id: string;
  knowledge_profile: KnowledgeProfile;
  learning_style_profile: LearningStyleProfile;
  interest_profile: InterestProfile;
  emotion_baseline: EmotionBaseline;
  snapshot_version: number;
  prior_snapshot_id?: string;
  change_summary?: string;
  is_viewable_by_student: boolean;
  visibility_scope: VisibilityScope;
}

/**
 * 学生记忆快照 schema。
 */
export const StudentMemorySnapshotSchema = BaseEntitySchema.extend({
  student_id: z.string().uuid(),
  agent_id: z.string().uuid(),
  knowledge_profile: KnowledgeProfileSchema,
  learning_style_profile: LearningStyleProfileSchema,
  interest_profile: InterestProfileSchema,
  emotion_baseline: EmotionBaselineSchema,
  snapshot_version: z.number().int().positive(),
  prior_snapshot_id: z.string().uuid().optional(),
  change_summary: NonEmptyStringSchema.max(2000).optional(),
  is_viewable_by_student: z.boolean(),
  visibility_scope: VisibilityScopeSchema
});
