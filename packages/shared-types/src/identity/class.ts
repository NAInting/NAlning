import { z } from "zod";

import { BaseEntitySchema, NonEmptyStringSchema } from "../base";
import { Grade, Subject } from "../enums";

/**
 * 班级学科教师分配。
 */
export interface SubjectTeacherAssignment {
  subject: Subject;
  teacher_id: string;
}

/**
 * 班级学科教师分配 schema。
 */
export const SubjectTeacherAssignmentSchema = z.object({
  subject: z.nativeEnum(Subject),
  teacher_id: z.string().uuid()
});

/**
 * 班级实体。
 */
export interface Class {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  school_id: string;
  name: string;
  grade: Grade;
  academic_year: string;
  homeroom_teacher_id: string;
  subject_teachers: SubjectTeacherAssignment[];
  student_ids: string[];
  is_pilot_class: boolean;
  pilot_cohort_id?: string;
}

/**
 * 班级实体 schema。
 */
export const ClassSchema = BaseEntitySchema.extend({
  school_id: z.string().uuid(),
  name: NonEmptyStringSchema.max(100),
  grade: z.nativeEnum(Grade),
  academic_year: NonEmptyStringSchema.max(30),
  homeroom_teacher_id: z.string().uuid(),
  subject_teachers: z.array(SubjectTeacherAssignmentSchema).max(30),
  student_ids: z.array(z.string().uuid()).max(200),
  is_pilot_class: z.boolean(),
  pilot_cohort_id: z.string().uuid().optional()
});
