import { z } from "zod";

import { BaseEntitySchema, IsoDateTimeSchema, NonEmptyStringSchema } from "../base";
import { ConsentStatus, ConsentType, SignatureMethod } from "../enums";

/**
 * 同意书作用域。
 */
export interface ConsentScope {
  data_categories: string[];
  purposes: string[];
  retention_period_days?: number;
  third_parties_allowed?: string[];
}

/**
 * 同意书作用域 schema。
 */
export const ConsentScopeSchema = z.object({
  data_categories: z.array(NonEmptyStringSchema.max(120)).min(1).max(100),
  purposes: z.array(NonEmptyStringSchema.max(200)).min(1).max(100),
  retention_period_days: z.number().int().positive().optional(),
  third_parties_allowed: z.array(NonEmptyStringSchema.max(200)).max(100).optional()
});

/**
 * 同意记录实体。
 */
export interface ConsentRecord {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  subject_user_id: string;
  consenter_user_id: string;
  consent_type: ConsentType;
  policy_version: string;
  policy_text_hash: string;
  status: ConsentStatus;
  granted_at: string;
  revoked_at?: string;
  expires_at?: string;
  scope: ConsentScope;
  signature_method: SignatureMethod;
  ip_address?: string;
  device_fingerprint?: string;
  witness_admin_id?: string;
}

/**
 * 同意记录实体 schema。
 */
export const ConsentRecordSchema = BaseEntitySchema.extend({
  subject_user_id: z.string().uuid(),
  consenter_user_id: z.string().uuid(),
  consent_type: z.nativeEnum(ConsentType),
  policy_version: NonEmptyStringSchema.max(60),
  policy_text_hash: NonEmptyStringSchema.max(256),
  status: z.nativeEnum(ConsentStatus),
  granted_at: IsoDateTimeSchema,
  revoked_at: IsoDateTimeSchema.optional(),
  expires_at: IsoDateTimeSchema.optional(),
  scope: ConsentScopeSchema,
  signature_method: z.nativeEnum(SignatureMethod),
  ip_address: NonEmptyStringSchema.max(64).optional(),
  device_fingerprint: NonEmptyStringSchema.max(256).optional(),
  witness_admin_id: z.string().uuid().optional()
});
