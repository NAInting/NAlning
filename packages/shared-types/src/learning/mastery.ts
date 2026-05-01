import { z } from "zod";

import {
  BaseEntitySchema,
  buildAIGeneratedFieldSchema,
  IsoDateTimeSchema,
  NonEmptyStringSchema,
  VisibilityScopeSchema,
  type VisibilityScope
} from "../base";
import { MasteryLevel } from "../enums";

/**
 * 掌握度记录实体。
 */
export interface MasteryRecord {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  student_id: string;
  knowledge_node_id: string;
  current_mastery: number;
  current_level: MasteryLevel;
  confidence: number;
  evidence_count: number;
  last_evidence_at: string;
  last_activated_at: string;
  decay_factor: number;
  next_review_recommended_at?: string;
  is_visible_to_student: boolean;
  is_acceptable_to_record: boolean;
  visibility_scope: VisibilityScope;
  ai_generated: {
    value: number;
    confidence: number;
    model_version: string;
    prompt_version: string;
    generated_at: string;
    human_reviewed: boolean;
    reviewer_id?: string;
  };
}

/**
 * 掌握度记录实体 schema。
 */
export const MasteryRecordSchema = BaseEntitySchema.extend({
  student_id: z.string().uuid(),
  knowledge_node_id: z.string().uuid(),
  current_mastery: z.number().min(0).max(1),
  current_level: z.nativeEnum(MasteryLevel),
  confidence: z.number().min(0).max(1),
  evidence_count: z.number().int().nonnegative(),
  last_evidence_at: IsoDateTimeSchema,
  last_activated_at: IsoDateTimeSchema,
  decay_factor: z.number().min(0),
  next_review_recommended_at: IsoDateTimeSchema.optional(),
  is_visible_to_student: z.boolean(),
  is_acceptable_to_record: z.boolean(),
  visibility_scope: VisibilityScopeSchema,
  ai_generated: buildAIGeneratedFieldSchema(z.number().min(0).max(1))
});

/**
 * 掌握度历史快照。
 */
export interface MasteryHistory {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  student_id: string;
  knowledge_node_id: string;
  snapshot_at: string;
  mastery_value: number;
  trigger_event_id: string;
  change_reason: string;
  visibility_scope: VisibilityScope;
}

/**
 * 掌握度历史快照 schema。
 */
export const MasteryHistorySchema = BaseEntitySchema.extend({
  student_id: z.string().uuid(),
  knowledge_node_id: z.string().uuid(),
  snapshot_at: IsoDateTimeSchema,
  mastery_value: z.number().min(0).max(1),
  trigger_event_id: z.string().uuid(),
  change_reason: NonEmptyStringSchema.max(1000),
  visibility_scope: VisibilityScopeSchema
});
