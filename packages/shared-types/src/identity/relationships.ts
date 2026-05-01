import { z } from "zod";

import { BaseEntitySchema, IsoDateTimeSchema } from "../base";
import { GuardianRelationship, RelationType, Subject, VerificationMethod, VerificationStatus } from "../enums";

/**
 * 教师-学生绑定关系。
 */
export interface TeacherStudentBinding {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  teacher_id: string;
  student_id: string;
  relation_type: RelationType;
  subjects?: Subject[];
  class_id: string;
  active_from: string;
  active_until?: string;
}

/**
 * 教师-学生绑定关系 schema。
 */
export const TeacherStudentBindingSchema = BaseEntitySchema.extend({
  teacher_id: z.string().uuid(),
  student_id: z.string().uuid(),
  relation_type: z.nativeEnum(RelationType),
  subjects: z.array(z.nativeEnum(Subject)).max(20).optional(),
  class_id: z.string().uuid(),
  active_from: IsoDateTimeSchema,
  active_until: IsoDateTimeSchema.optional()
});

/**
 * 家长-学生绑定关系。
 */
export interface GuardianStudentBinding {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  guardian_id: string;
  student_id: string;
  relationship: GuardianRelationship;
  can_view_reports: boolean;
  can_handle_appeals: boolean;
  can_give_consent: boolean;
  verification_status: VerificationStatus;
  verification_method?: VerificationMethod;
}

/**
 * 家长-学生绑定关系 schema。
 */
export const GuardianStudentBindingSchema = BaseEntitySchema.extend({
  guardian_id: z.string().uuid(),
  student_id: z.string().uuid(),
  relationship: z.nativeEnum(GuardianRelationship),
  can_view_reports: z.boolean(),
  can_handle_appeals: z.boolean(),
  can_give_consent: z.boolean(),
  verification_status: z.nativeEnum(VerificationStatus),
  verification_method: z.nativeEnum(VerificationMethod).optional()
});
