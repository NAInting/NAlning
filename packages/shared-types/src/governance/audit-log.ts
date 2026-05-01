import { z } from "zod";

import { IsoDateTimeSchema, NonEmptyStringSchema } from "../base";
import { AuditOutcome, UserRole } from "../enums";

/**
 * 审计日志实体。
 */
export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor_user_id: string;
  actor_role: UserRole;
  actor_ip?: string;
  action: string;
  resource_type: string;
  resource_id: string;
  outcome: AuditOutcome;
  denial_reason?: string;
  before_state?: unknown;
  after_state?: unknown;
  previous_entry_hash?: string;
  current_entry_hash: string;
  related_appeal_id?: string;
  related_signal_id?: string;
}

/**
 * 审计日志实体 schema。
 */
export const AuditLogEntrySchema = z.object({
  id: z.string().uuid(),
  timestamp: IsoDateTimeSchema,
  actor_user_id: z.string().uuid(),
  actor_role: z.nativeEnum(UserRole),
  actor_ip: NonEmptyStringSchema.max(64).optional(),
  action: NonEmptyStringSchema.max(120),
  resource_type: NonEmptyStringSchema.max(120),
  resource_id: NonEmptyStringSchema.max(120),
  outcome: z.nativeEnum(AuditOutcome),
  denial_reason: NonEmptyStringSchema.max(1000).optional(),
  before_state: z.unknown().optional(),
  after_state: z.unknown().optional(),
  previous_entry_hash: NonEmptyStringSchema.max(256).optional(),
  current_entry_hash: NonEmptyStringSchema.max(256),
  related_appeal_id: z.string().uuid().optional(),
  related_signal_id: z.string().uuid().optional()
});
