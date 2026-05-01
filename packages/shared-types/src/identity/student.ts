import { z } from "zod";

import { BaseEntitySchema, NonEmptyStringSchema, VisibilityScopeSchema } from "../base";
import type { VisibilityScope } from "../base";
import { Grade, Subject } from "../enums";

/**
 * 学生实体。
 */
export interface Student {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  user_id: string;
  school_id: string;
  class_ids: string[];
  grade: Grade;
  enrolled_subjects: Subject[];
  learning_style_tags?: string[];
  student_number?: string;
  memory_enabled: boolean;
  visibility_scope: VisibilityScope;
}

/**
 * 学生实体 schema。
 */
export const StudentSchema = BaseEntitySchema.extend({
  user_id: z.string().uuid(),
  school_id: z.string().uuid(),
  class_ids: z.array(z.string().uuid()).min(1).max(20),
  grade: z.nativeEnum(Grade),
  enrolled_subjects: z.array(z.nativeEnum(Subject)).min(1).max(20),
  learning_style_tags: z.array(NonEmptyStringSchema.max(50)).max(20).optional(),
  student_number: NonEmptyStringSchema.max(50).optional(),
  memory_enabled: z.boolean(),
  visibility_scope: VisibilityScopeSchema
});
