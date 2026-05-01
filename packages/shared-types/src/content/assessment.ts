import { z } from "zod";

import { BaseEntitySchema, NonEmptyStringSchema } from "../base";
import { AssessmentItemType, AssessmentType, ScoringMethod } from "../enums";

/**
 * Rubric 评分层级。
 */
export interface RubricLevel {
  level: number;
  description: string;
  points: number;
}

/**
 * Rubric 评分层级 schema。
 */
export const RubricLevelSchema = z.object({
  level: z.number().int().nonnegative(),
  description: NonEmptyStringSchema.max(1000),
  points: z.number().nonnegative()
});

/**
 * Rubric 评分维度。
 */
export interface RubricCriterion {
  dimension: string;
  levels: { level: number; description: string; points: number }[];
}

/**
 * Rubric 评分维度 schema。
 */
export const RubricCriterionSchema = z.object({
  dimension: NonEmptyStringSchema.max(120),
  levels: z.array(RubricLevelSchema).min(1).max(10)
});

/**
 * 诊断提示。
 */
export interface DiagnosticHint {
  misconception_id: string;
  hint: string;
}

/**
 * 诊断提示 schema。
 */
export const DiagnosticHintSchema = z.object({
  misconception_id: z.string().uuid(),
  hint: NonEmptyStringSchema.max(1000)
});

/**
 * 评分策略。
 */
export interface ScoringStrategy {
  method: ScoringMethod;
  mastery_threshold: number;
  requires_human_review: boolean;
}

/**
 * 评分策略 schema。
 */
export const ScoringStrategySchema = z.object({
  method: z.nativeEnum(ScoringMethod),
  mastery_threshold: z.number().min(0).max(1),
  requires_human_review: z.boolean()
});

/**
 * 评估题目。
 */
export interface AssessmentItem {
  item_id: string;
  question: string;
  type: AssessmentItemType;
  correct_answer?: unknown;
  rubric?: RubricCriterion[];
  target_node_id: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  diagnostic_hints: DiagnosticHint[];
}

/**
 * 评估题目 schema。
 */
export const AssessmentItemSchema = z.object({
  item_id: z.string().uuid(),
  question: NonEmptyStringSchema.max(4000),
  type: z.nativeEnum(AssessmentItemType),
  correct_answer: z.unknown().optional(),
  rubric: z.array(RubricCriterionSchema).max(20).optional(),
  target_node_id: z.string().uuid(),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  diagnostic_hints: z.array(DiagnosticHintSchema).max(50)
});

/**
 * 评估实体。
 */
export interface Assessment {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  title: string;
  target_node_ids: string[];
  type: AssessmentType;
  items: AssessmentItem[];
  scoring_strategy: ScoringStrategy;
  min_confidence_threshold: number;
}

/**
 * 评估实体 schema。
 */
export const AssessmentSchema = BaseEntitySchema.extend({
  title: NonEmptyStringSchema.max(200),
  target_node_ids: z.array(z.string().uuid()).min(1).max(100),
  type: z.nativeEnum(AssessmentType),
  items: z.array(AssessmentItemSchema).min(1).max(500),
  scoring_strategy: ScoringStrategySchema,
  min_confidence_threshold: z.number().min(0).max(1)
});
