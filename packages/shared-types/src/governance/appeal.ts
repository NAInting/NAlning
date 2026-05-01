import { z } from "zod";

import { BaseEntitySchema, IsoDateTimeSchema, NonEmptyStringSchema } from "../base";
import { AppealResolutionOutcome, AppealState, AppealType, UserRole } from "../enums";

/**
 * 申诉状态流转。
 */
export interface AppealStateTransition {
  from_state: AppealState;
  to_state: AppealState;
  transitioned_at: string;
  transitioned_by_user_id: string;
  reason: string;
}

/**
 * 申诉状态流转 schema。
 */
export const AppealStateTransitionSchema = z.object({
  from_state: z.nativeEnum(AppealState),
  to_state: z.nativeEnum(AppealState),
  transitioned_at: IsoDateTimeSchema,
  transitioned_by_user_id: z.string().uuid(),
  reason: NonEmptyStringSchema.max(1000)
});

/**
 * 申诉结论。
 */
export interface AppealResolution {
  outcome: AppealResolutionOutcome;
  remedy?: string;
  affected_records_updated: string[];
  reviewer_notes: string;
}

/**
 * 申诉结论 schema。
 */
export const AppealResolutionSchema = z.object({
  outcome: z.nativeEnum(AppealResolutionOutcome),
  remedy: NonEmptyStringSchema.max(2000).optional(),
  affected_records_updated: z.array(NonEmptyStringSchema.max(120)).max(500),
  reviewer_notes: NonEmptyStringSchema.max(4000)
});

/**
 * 申诉工单实体。
 */
export interface AppealTicket {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  submitter_user_id: string;
  submitter_role: UserRole;
  appeal_type: AppealType;
  target_resource_type: string;
  target_resource_id: string;
  title: string;
  description: string;
  evidence_refs: string[];
  state: AppealState;
  state_history: AppealStateTransition[];
  assigned_to_user_id?: string;
  resolution?: AppealResolution;
  submitted_at: string;
  sla_deadline: string;
  resolved_at?: string;
}

/**
 * 申诉工单实体 schema。
 */
export const AppealTicketSchema = BaseEntitySchema.extend({
  submitter_user_id: z.string().uuid(),
  submitter_role: z.nativeEnum(UserRole),
  appeal_type: z.nativeEnum(AppealType),
  target_resource_type: NonEmptyStringSchema.max(120),
  target_resource_id: NonEmptyStringSchema.max(120),
  title: NonEmptyStringSchema.max(200),
  description: NonEmptyStringSchema.max(4000),
  evidence_refs: z.array(NonEmptyStringSchema.max(120)).max(500),
  state: z.nativeEnum(AppealState),
  state_history: z.array(AppealStateTransitionSchema).min(1).max(100),
  assigned_to_user_id: z.string().uuid().optional(),
  resolution: AppealResolutionSchema.optional(),
  submitted_at: IsoDateTimeSchema,
  sla_deadline: IsoDateTimeSchema,
  resolved_at: IsoDateTimeSchema.optional()
});
