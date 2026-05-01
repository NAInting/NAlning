import { z } from "zod";

import { BaseEntitySchema, NonEmptyStringSchema } from "../base";
import { NotificationChannel, ParentingStyleHint } from "../enums";

/**
 * 家长通知偏好。
 */
export interface NotificationPreferences {
  weekly_report: boolean;
  emergency_only: boolean;
  preferred_channel: NotificationChannel;
  quiet_hours?: { start: string; end: string };
}

/**
 * 家长通知偏好 schema。
 */
export const NotificationPreferencesSchema = z.object({
  weekly_report: z.boolean(),
  emergency_only: z.boolean(),
  preferred_channel: z.nativeEnum(NotificationChannel),
  quiet_hours: z
    .object({
      start: NonEmptyStringSchema.max(10),
      end: NonEmptyStringSchema.max(10)
    })
    .optional()
});

/**
 * 家长实体。
 */
export interface Guardian {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  user_id: string;
  notification_preferences: NotificationPreferences;
  parenting_style_hint?: ParentingStyleHint;
}

/**
 * 家长实体 schema。
 */
export const GuardianSchema = BaseEntitySchema.extend({
  user_id: z.string().uuid(),
  notification_preferences: NotificationPreferencesSchema,
  parenting_style_hint: z.nativeEnum(ParentingStyleHint).optional()
});
