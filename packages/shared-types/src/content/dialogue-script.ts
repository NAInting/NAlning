import { z } from "zod";

import { BaseEntitySchema, NonEmptyStringSchema } from "../base";
import { AgentMode, AgentTone, DialogueNodeType, DialogueVariableType } from "../enums";

/**
 * 对话节点。
 */
export interface DialogueNode {
  node_id: string;
  type: DialogueNodeType;
  agent_template?: string;
  agent_tone?: AgentTone;
  expected_intents?: string[];
  fallback_prompt?: string;
  branch_logic?: string;
  assessment_node_id?: string;
}

/**
 * 对话节点 schema。
 */
export const DialogueNodeSchema = z.object({
  node_id: z.string().uuid(),
  type: z.nativeEnum(DialogueNodeType),
  agent_template: NonEmptyStringSchema.max(4000).optional(),
  agent_tone: z.nativeEnum(AgentTone).optional(),
  expected_intents: z.array(NonEmptyStringSchema.max(120)).max(30).optional(),
  fallback_prompt: NonEmptyStringSchema.max(1000).optional(),
  branch_logic: NonEmptyStringSchema.max(1000).optional(),
  assessment_node_id: z.string().uuid().optional()
});

/**
 * 对话边。
 */
export interface DialogueEdge {
  from_node_id: string;
  to_node_id: string;
  condition?: string;
  priority: number;
}

/**
 * 对话边 schema。
 */
export const DialogueEdgeSchema = z.object({
  from_node_id: z.string().uuid(),
  to_node_id: z.string().uuid(),
  condition: NonEmptyStringSchema.max(1000).optional(),
  priority: z.number().int().nonnegative()
});

/**
 * 对话变量。
 */
export interface DialogueVariable {
  name: string;
  type: DialogueVariableType;
  initial_value: unknown;
  description: string;
}

/**
 * 对话变量 schema。
 */
export const DialogueVariableSchema = z.object({
  name: NonEmptyStringSchema.max(80),
  type: z.nativeEnum(DialogueVariableType),
  initial_value: z.unknown(),
  description: NonEmptyStringSchema.max(1000)
});

/**
 * 对话脚本实体。
 */
export interface DialogueScript {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  title: string;
  mode: AgentMode;
  target_node_ids: string[];
  nodes: DialogueNode[];
  edges: DialogueEdge[];
  start_node_id: string;
  variables: DialogueVariable[];
}

/**
 * 对话脚本实体 schema。
 */
export const DialogueScriptSchema = BaseEntitySchema.extend({
  title: NonEmptyStringSchema.max(200),
  mode: z.nativeEnum(AgentMode),
  target_node_ids: z.array(z.string().uuid()).min(1).max(100),
  nodes: z.array(DialogueNodeSchema).min(1).max(500),
  edges: z.array(DialogueEdgeSchema).max(1000),
  start_node_id: z.string().uuid(),
  variables: z.array(DialogueVariableSchema).max(100)
});
