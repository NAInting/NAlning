import { z } from "zod";

import { BaseEntitySchema, NonEmptyStringSchema } from "../base";
import { DataResidency, Grade, SchoolType } from "../enums";

/**
 * 学段范围。
 */
export interface GradeRange {
  start: Grade;
  end: Grade;
}

/**
 * 学段范围 schema。
 */
export const GradeRangeSchema = z.object({
  start: z.nativeEnum(Grade),
  end: z.nativeEnum(Grade)
});

/**
 * 学校实体。
 */
export interface School {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  name: string;
  type: SchoolType;
  address: string;
  contact_email: string;
  data_residency: DataResidency;
  privacy_policy_version: string;
  enabled_features: string[];
  grade_range: GradeRange;
}

/**
 * 学校实体 schema。
 */
export const SchoolSchema = BaseEntitySchema.extend({
  name: NonEmptyStringSchema.max(200),
  type: z.nativeEnum(SchoolType),
  address: NonEmptyStringSchema.max(500),
  contact_email: z.string().email(),
  data_residency: z.nativeEnum(DataResidency),
  privacy_policy_version: NonEmptyStringSchema.max(60),
  enabled_features: z.array(NonEmptyStringSchema.max(80)).max(100),
  grade_range: GradeRangeSchema
});
