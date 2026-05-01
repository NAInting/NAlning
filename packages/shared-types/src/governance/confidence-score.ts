import { z } from "zod";

/**
 * 置信度细分维度。
 */
export interface ConfidenceDimensions {
  data_sufficiency: number;
  signal_consistency: number;
  model_certainty: number;
  temporal_stability: number;
}

/**
 * 置信度细分维度 schema。
 */
export const ConfidenceDimensionsSchema = z.object({
  data_sufficiency: z.number().min(0).max(1),
  signal_consistency: z.number().min(0).max(1),
  model_certainty: z.number().min(0).max(1),
  temporal_stability: z.number().min(0).max(1)
});

/**
 * 置信度门禁实体。
 */
export interface ConfidenceScore {
  composite_confidence: number;
  dimensions: ConfidenceDimensions;
  visibility_threshold: number;
  recording_threshold: number;
  intervention_threshold: number;
  evidence_count: number;
  calculation_method: string;
  calculated_at: string;
}

/**
 * 置信度门禁实体 schema。
 */
export const ConfidenceScoreSchema = z.object({
  composite_confidence: z.number().min(0).max(1),
  dimensions: ConfidenceDimensionsSchema,
  visibility_threshold: z.number().min(0).max(1),
  recording_threshold: z.number().min(0).max(1),
  intervention_threshold: z.number().min(0).max(1),
  evidence_count: z.number().int().nonnegative(),
  calculation_method: z.string().trim().min(1).max(200),
  calculated_at: z.string().datetime({ offset: true })
});
