import { z } from "zod";

import { BaseEntitySchema, NonEmptyStringSchema } from "../base";
import { Subject, TeacherPermissionLevel } from "../enums";

/**
 * 教师实体。
 */
export interface Teacher {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  user_id: string;
  school_id: string;
  subjects_taught: Subject[];
  classes_taught: string[];
  homeroom_class_id?: string;
  teaching_years?: number;
  certification?: string;
  permission_level: TeacherPermissionLevel;
}

/**
 * 教师实体 schema。
 */
export const TeacherSchema = BaseEntitySchema.extend({
  user_id: z.string().uuid(),
  school_id: z.string().uuid(),
  subjects_taught: z.array(z.nativeEnum(Subject)).min(1).max(20),
  classes_taught: z.array(z.string().uuid()).min(1).max(20),
  homeroom_class_id: z.string().uuid().optional(),
  teaching_years: z.number().int().min(0).max(80).optional(),
  certification: NonEmptyStringSchema.max(120).optional(),
  permission_level: z.nativeEnum(TeacherPermissionLevel)
});
