import { z } from "zod";

import { IsoDateTimeSchema, NonEmptyStringSchema } from "../base";
import { AccessAction, UserRole } from "../enums";

/**
 * 访问范围限制。
 */
export interface ScopeConstraints {
  own_data_only?: boolean;
  bound_students_only?: boolean;
  own_class_only?: boolean;
  school_only?: boolean;
}

/**
 * 访问范围限制 schema。
 */
export const ScopeConstraintsSchema = z.object({
  own_data_only: z.boolean().optional(),
  bound_students_only: z.boolean().optional(),
  own_class_only: z.boolean().optional(),
  school_only: z.boolean().optional()
});

/**
 * 时间窗口限制。
 */
export interface AccessActiveWindow {
  start: string;
  end: string;
}

/**
 * 时间窗口限制 schema。
 */
export const AccessActiveWindowSchema = z.object({
  start: IsoDateTimeSchema,
  end: IsoDateTimeSchema
});

/**
 * 访问范围实体。
 */
export interface AccessScope {
  role: UserRole;
  resource_type: string;
  allowed_actions: AccessAction[];
  allowed_fields?: string[];
  excluded_fields?: string[];
  scope_constraints: ScopeConstraints;
  active_during?: AccessActiveWindow;
}

/**
 * 访问范围实体 schema。
 */
export const AccessScopeSchema = z.object({
  role: z.nativeEnum(UserRole),
  resource_type: NonEmptyStringSchema.max(120),
  allowed_actions: z.array(z.nativeEnum(AccessAction)).min(1).max(10),
  allowed_fields: z.array(NonEmptyStringSchema.max(120)).max(500).optional(),
  excluded_fields: z.array(NonEmptyStringSchema.max(120)).max(500).optional(),
  scope_constraints: ScopeConstraintsSchema,
  active_during: AccessActiveWindowSchema.optional()
});
