import { z } from "zod";

import { BaseEntitySchema, NonEmptyStringSchema } from "../base";
import { PedagogyType } from "../enums";

/**
 * 情境角色。
 */
export interface ScenarioCharacter {
  character_id: string;
  name: string;
  role_in_scenario: string;
  personality: string;
  knowledge_scope: string;
  prompt_template: string;
}

/**
 * 情境角色 schema。
 */
export const ScenarioCharacterSchema = z.object({
  character_id: z.string().uuid(),
  name: NonEmptyStringSchema.max(100),
  role_in_scenario: NonEmptyStringSchema.max(50),
  personality: NonEmptyStringSchema.max(500),
  knowledge_scope: NonEmptyStringSchema.max(1000),
  prompt_template: NonEmptyStringSchema.max(4000)
});

/**
 * 情境道具。
 */
export interface ScenarioProp {
  prop_id: string;
  name: string;
  description: string;
  interaction_hint: string;
}

/**
 * 情境道具 schema。
 */
export const ScenarioPropSchema = z.object({
  prop_id: z.string().uuid(),
  name: NonEmptyStringSchema.max(100),
  description: NonEmptyStringSchema.max(1000),
  interaction_hint: NonEmptyStringSchema.max(1000)
});

/**
 * 情境分支。
 */
export interface ScenarioBranch {
  trigger_condition: string;
  next_scenario_id?: string;
  outcome_description: string;
}

/**
 * 情境分支 schema。
 */
export const ScenarioBranchSchema = z.object({
  trigger_condition: NonEmptyStringSchema.max(1000),
  next_scenario_id: z.string().uuid().optional(),
  outcome_description: NonEmptyStringSchema.max(1000)
});

/**
 * 情境实体。
 */
export interface Scenario {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  title: string;
  description: string;
  setting: string;
  student_role: string;
  goal: string;
  characters: ScenarioCharacter[];
  target_node_ids: string[];
  pedagogy: PedagogyType;
  initial_context: string;
  props: ScenarioProp[];
  branches?: ScenarioBranch[];
}

/**
 * 情境实体 schema。
 */
export const ScenarioSchema = BaseEntitySchema.extend({
  title: NonEmptyStringSchema.max(200),
  description: NonEmptyStringSchema.max(2000),
  setting: NonEmptyStringSchema.max(500),
  student_role: NonEmptyStringSchema.max(200),
  goal: NonEmptyStringSchema.max(500),
  characters: z.array(ScenarioCharacterSchema).min(1).max(20),
  target_node_ids: z.array(z.string().uuid()).min(1).max(100),
  pedagogy: z.nativeEnum(PedagogyType),
  initial_context: NonEmptyStringSchema.max(4000),
  props: z.array(ScenarioPropSchema).max(50),
  branches: z.array(ScenarioBranchSchema).max(50).optional()
});
