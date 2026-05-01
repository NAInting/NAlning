import { z } from "zod";

import { BaseEntitySchema, NonEmptyStringSchema } from "../base";
import { Grade, Subject, UnitStatus } from "../enums";

/**
 * 课标对齐项。
 */
export interface StandardAlignment {
  standard_system: string;
  standard_code: string;
  description: string;
}

/**
 * 课标对齐项 schema。
 */
export const StandardAlignmentSchema = z.object({
  standard_system: NonEmptyStringSchema.max(120),
  standard_code: NonEmptyStringSchema.max(120),
  description: NonEmptyStringSchema.max(1000)
});

/**
 * 单元生产元数据。
 */
export interface UnitProductionMetadata {
  curriculum_agent_version: string;
  pedagogy_agent_version: string;
  narrative_agent_version: string;
  engineering_agent_version: string;
  qa_agent_version: string;
  iteration_count: number;
  total_cost_tokens: number;
  total_cost_cny: number;
  qa_pass: boolean;
  qa_issues: string[];
}

/**
 * 单元生产元数据 schema。
 */
export const UnitProductionMetadataSchema = z.object({
  curriculum_agent_version: NonEmptyStringSchema.max(80),
  pedagogy_agent_version: NonEmptyStringSchema.max(80),
  narrative_agent_version: NonEmptyStringSchema.max(80),
  engineering_agent_version: NonEmptyStringSchema.max(80),
  qa_agent_version: NonEmptyStringSchema.max(80),
  iteration_count: z.number().int().nonnegative(),
  total_cost_tokens: z.number().int().nonnegative(),
  total_cost_cny: z.number().nonnegative(),
  qa_pass: z.boolean(),
  qa_issues: z.array(NonEmptyStringSchema.max(500)).max(200)
});

/**
 * 单元实体。
 */
export interface Unit {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  subject: Subject;
  grade: Grade;
  title: string;
  description: string;
  duration_hours: number;
  standard_alignments: StandardAlignment[];
  prerequisite_unit_ids: string[];
  prerequisite_node_ids: string[];
  knowledge_node_ids: string[];
  learning_path_id: string;
  scenario_ids: string[];
  assessment_ids: string[];
  production_metadata: UnitProductionMetadata;
  status: UnitStatus;
  published_version?: string;
  generated_by_agents: boolean;
  human_reviewers: string[];
}

/**
 * 单元实体 schema。
 */
export const UnitSchema = BaseEntitySchema.extend({
  subject: z.nativeEnum(Subject),
  grade: z.nativeEnum(Grade),
  title: NonEmptyStringSchema.max(200),
  description: NonEmptyStringSchema.max(4000),
  duration_hours: z.number().positive().max(1000),
  standard_alignments: z.array(StandardAlignmentSchema).min(1).max(100),
  prerequisite_unit_ids: z.array(z.string().uuid()).max(100),
  prerequisite_node_ids: z.array(z.string().uuid()).max(100),
  knowledge_node_ids: z.array(z.string().uuid()).min(1).max(100),
  learning_path_id: z.string().uuid(),
  scenario_ids: z.array(z.string().uuid()).max(100),
  assessment_ids: z.array(z.string().uuid()).max(100),
  production_metadata: UnitProductionMetadataSchema,
  status: z.nativeEnum(UnitStatus),
  published_version: NonEmptyStringSchema.max(50).optional(),
  generated_by_agents: z.boolean(),
  human_reviewers: z.array(z.string().uuid()).max(50)
});
