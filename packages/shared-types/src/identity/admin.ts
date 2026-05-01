import { z } from "zod";

import { BaseEntitySchema } from "../base";
import { AdminPermission, AdminScope } from "../enums";

/**
 * 管理员实体。
 */
export interface Admin {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  user_id: string;
  admin_scope: AdminScope;
  school_id?: string;
  permissions: AdminPermission[];
}

/**
 * 管理员实体 schema。
 */
export const AdminSchema = BaseEntitySchema.extend({
  user_id: z.string().uuid(),
  admin_scope: z.nativeEnum(AdminScope),
  school_id: z.string().uuid().optional(),
  permissions: z.array(z.nativeEnum(AdminPermission)).min(1).max(20)
}).superRefine((value, ctx) => {
  if (value.admin_scope === AdminScope.SCHOOL && !value.school_id) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["school_id"],
      message: "school_id is required when admin_scope is school"
    });
  }
});
