import { z } from "zod";

import { RelationType, UserRole } from "./enums";

/**
 * UUID v4 字符串校验。
 */
export const UuidV4Schema = z
  .string()
  .uuid()
  .regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    "Expected UUID v4"
  );

/**
 * ISO 8601 时间戳校验。
 */
export const IsoDateTimeSchema = z.string().datetime({ offset: true });

/**
 * 非空字符串校验。
 */
export const NonEmptyStringSchema = z.string().trim().min(1);

/**
 * 可见性边界定义。
 */
export interface VisibilityScope {
  visible_to_roles: UserRole[];
  visible_to_relations?: RelationType[];
  excluded_fields_by_role?: Partial<Record<UserRole, string[]>>;
}

/**
 * 可见性边界运行时 schema。
 */
export const VisibilityScopeSchema = z
  .object({
    visible_to_roles: z.array(z.nativeEnum(UserRole)).min(1).max(10),
    visible_to_relations: z.array(z.nativeEnum(RelationType)).max(20).optional(),
    excluded_fields_by_role: z.record(z.string(), z.array(NonEmptyStringSchema).max(100)).optional()
  })
  .superRefine((value, ctx) => {
    if (!value.excluded_fields_by_role) {
      return;
    }

    for (const role of Object.keys(value.excluded_fields_by_role)) {
      if (!Object.values(UserRole).includes(role as UserRole)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["excluded_fields_by_role", role],
          message: `Unknown user role key: ${role}`
        });
      }
    }
  });

/**
 * 所有业务实体的基础字段。
 */
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
}

/**
 * 所有业务实体的基础字段 schema。
 */
export const BaseEntitySchema = z.object({
  id: UuidV4Schema,
  created_at: IsoDateTimeSchema,
  updated_at: IsoDateTimeSchema,
  version: z.number().int().nonnegative(),
  deleted_at: IsoDateTimeSchema.optional()
});

/**
 * AI 生成内容溯源包装。
 */
export interface AIGeneratedField<T = unknown> {
  value: T;
  confidence: number;
  model_version: string;
  prompt_version: string;
  generated_at: string;
  human_reviewed: boolean;
  reviewer_id?: string;
}

/**
 * AI 生成内容通用 schema。
 */
export const AIGeneratedFieldSchema = z.object({
  value: z.unknown(),
  confidence: z.number().min(0).max(1),
  model_version: NonEmptyStringSchema,
  prompt_version: NonEmptyStringSchema,
  generated_at: IsoDateTimeSchema,
  human_reviewed: z.boolean(),
  reviewer_id: UuidV4Schema.optional()
});

/**
 * 构建带值 schema 的 AI 生成字段 schema。
 */
export function buildAIGeneratedFieldSchema<TSchema extends z.ZodTypeAny>(valueSchema: TSchema) {
  return AIGeneratedFieldSchema.extend({
    value: valueSchema
  });
}
