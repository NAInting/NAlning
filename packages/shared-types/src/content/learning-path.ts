import { z } from "zod";

import { BaseEntitySchema } from "../base";
import { CompletionCriteriaType, LearningActivityType, PedagogyType } from "../enums";

/**
 * 学习路径通过条件。
 */
export interface CompletionCriteria {
  type: CompletionCriteriaType;
  threshold?: number;
  min_duration_minutes?: number;
}

/**
 * 学习路径通过条件 schema。
 */
export const CompletionCriteriaSchema = z.object({
  type: z.nativeEnum(CompletionCriteriaType),
  threshold: z.number().nonnegative().optional(),
  min_duration_minutes: z.number().int().positive().optional()
});

/**
 * 学习路径步骤。
 */
export interface LearningPathStep {
  step_id: string;
  order: number;
  target_node_ids: string[];
  pedagogy: PedagogyType;
  activity_type: LearningActivityType;
  estimated_duration_minutes: number;
  scenario_id?: string;
  dialogue_script_id?: string;
  assessment_id?: string;
  completion_criteria: CompletionCriteria;
}

/**
 * 学习路径步骤 schema。
 */
export const LearningPathStepSchema = z.object({
  step_id: z.string().uuid(),
  order: z.number().int().nonnegative(),
  target_node_ids: z.array(z.string().uuid()).min(1).max(100),
  pedagogy: z.nativeEnum(PedagogyType),
  activity_type: z.nativeEnum(LearningActivityType),
  estimated_duration_minutes: z.number().int().positive().max(10000),
  scenario_id: z.string().uuid().optional(),
  dialogue_script_id: z.string().uuid().optional(),
  assessment_id: z.string().uuid().optional(),
  completion_criteria: CompletionCriteriaSchema
});

/**
 * 学习路径实体。
 */
export interface LearningPath {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  unit_id: string;
  steps: LearningPathStep[];
  is_personalized: boolean;
  personalized_for_student_id?: string;
}

/**
 * 学习路径实体 schema。
 */
export const LearningPathSchema = BaseEntitySchema.extend({
  unit_id: z.string().uuid(),
  steps: z.array(LearningPathStepSchema).min(1).max(200),
  is_personalized: z.boolean(),
  personalized_for_student_id: z.string().uuid().optional()
});
