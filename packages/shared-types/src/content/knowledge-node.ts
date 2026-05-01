import { z } from "zod";

import { BaseEntitySchema, NonEmptyStringSchema } from "../base";
import { Grade, Subject } from "../enums";
import { StandardAlignmentSchema, type StandardAlignment } from "./unit";

/**
 * 常见误区。
 */
export interface Misconception {
  description: string;
  example: string;
  correction_strategy: string;
}

/**
 * 常见误区 schema。
 */
export const MisconceptionSchema = z.object({
  description: NonEmptyStringSchema.max(1000),
  example: NonEmptyStringSchema.max(1000),
  correction_strategy: NonEmptyStringSchema.max(1000)
});

/**
 * 知识节点实体。
 */
export interface KnowledgeNode {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  subject: Subject;
  grade: Grade;
  title: string;
  description: string;
  parent_node_ids: string[];
  prerequisite_node_ids: string[];
  related_node_ids: string[];
  mastery_criteria: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  estimated_learning_minutes: number;
  common_misconceptions: Misconception[];
  standard_alignments: StandardAlignment[];
  unit_ids: string[];
}

/**
 * 知识节点实体 schema。
 */
export const KnowledgeNodeSchema = BaseEntitySchema.extend({
  subject: z.nativeEnum(Subject),
  grade: z.nativeEnum(Grade),
  title: NonEmptyStringSchema.max(200),
  description: NonEmptyStringSchema.max(4000),
  parent_node_ids: z.array(z.string().uuid()).max(100),
  prerequisite_node_ids: z.array(z.string().uuid()).max(100),
  related_node_ids: z.array(z.string().uuid()).max(100),
  mastery_criteria: NonEmptyStringSchema.max(2000),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  estimated_learning_minutes: z.number().int().positive().max(10000),
  common_misconceptions: z.array(MisconceptionSchema).max(50),
  standard_alignments: z.array(StandardAlignmentSchema).min(1).max(100),
  unit_ids: z.array(z.string().uuid()).max(100)
});
