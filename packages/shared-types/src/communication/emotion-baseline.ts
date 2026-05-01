import { z } from "zod";

import { BaseEntitySchema, IsoDateTimeSchema, VisibilityScopeSchema, type VisibilityScope } from "../base";
import { EmotionCategory, PrivacyLevel } from "../enums";

/**
 * 情绪基线实体。
 */
export interface EmotionBaseline {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  student_id: string;
  baseline_distribution: Record<EmotionCategory, number>;
  sample_window_start: string;
  sample_window_end: string;
  sample_count: number;
  deviation_threshold: number;
  storage_location: PrivacyLevel.CAMPUS_LOCAL_ONLY;
  visibility_scope: VisibilityScope;
  last_updated_at: string;
}

/**
 * 情绪基线实体 schema。
 */
export const EmotionBaselineSchema = BaseEntitySchema.extend({
  student_id: z.string().uuid(),
  baseline_distribution: z.record(z.nativeEnum(EmotionCategory), z.number().min(0).max(1)),
  sample_window_start: IsoDateTimeSchema,
  sample_window_end: IsoDateTimeSchema,
  sample_count: z.number().int().nonnegative(),
  deviation_threshold: z.number().min(0).max(1),
  storage_location: z.literal(PrivacyLevel.CAMPUS_LOCAL_ONLY),
  visibility_scope: VisibilityScopeSchema,
  last_updated_at: IsoDateTimeSchema
});
