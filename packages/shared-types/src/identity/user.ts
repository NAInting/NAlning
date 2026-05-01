import { z } from "zod";

import { BaseEntitySchema, IsoDateTimeSchema, NonEmptyStringSchema } from "../base";
import { AuthProvider, UserRole, UserStatus } from "../enums";

/**
 * 基础用户实体。
 */
export interface User {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  role: UserRole;
  display_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  locale: string;
  timezone: string;
  last_active_at?: string;
  auth_provider: AuthProvider;
  auth_external_id?: string;
  status: UserStatus;
}

/**
 * 基础用户实体 schema。
 */
export const UserSchema = BaseEntitySchema.extend({
  role: z.nativeEnum(UserRole),
  display_name: NonEmptyStringSchema.max(100),
  email: z.string().email().optional(),
  phone: NonEmptyStringSchema.max(30).optional(),
  avatar_url: z.string().url().optional(),
  locale: NonEmptyStringSchema.max(20),
  timezone: NonEmptyStringSchema.max(100),
  last_active_at: IsoDateTimeSchema.optional(),
  auth_provider: z.nativeEnum(AuthProvider),
  auth_external_id: NonEmptyStringSchema.max(120).optional(),
  status: z.nativeEnum(UserStatus)
});
