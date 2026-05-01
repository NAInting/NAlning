import { z } from "zod";

import { BaseEntitySchema, NonEmptyStringSchema } from "../base";
import { InterAgentSignalType, ViolationAction } from "../enums";

/**
 * 隐私过滤规则实体。
 */
export interface PrivacyFilterRule {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  rule_name: string;
  rule_version: string;
  applies_to_signal_types: InterAgentSignalType[];
  forbidden_fields: string[];
  forbidden_patterns: string[];
  required_fields: string[];
  hash_fields?: string[];
  redact_fields?: string[];
  on_violation: ViolationAction;
  is_active: boolean;
}

/**
 * 隐私过滤规则实体 schema。
 */
export const PrivacyFilterRuleSchema = BaseEntitySchema.extend({
  rule_name: NonEmptyStringSchema.max(120),
  rule_version: NonEmptyStringSchema.max(80),
  applies_to_signal_types: z.array(z.nativeEnum(InterAgentSignalType)).min(1).max(20),
  forbidden_fields: z.array(NonEmptyStringSchema.max(120)).max(200),
  forbidden_patterns: z.array(NonEmptyStringSchema.max(500)).max(200),
  required_fields: z.array(NonEmptyStringSchema.max(120)).max(200),
  hash_fields: z.array(NonEmptyStringSchema.max(120)).max(100).optional(),
  redact_fields: z.array(NonEmptyStringSchema.max(120)).max(100).optional(),
  on_violation: z.nativeEnum(ViolationAction),
  is_active: z.boolean()
});
