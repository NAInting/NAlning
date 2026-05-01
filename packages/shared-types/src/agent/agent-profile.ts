import { z } from "zod";

import { BaseEntitySchema } from "../base";
import { AgentMode, AgentType } from "../enums";

/**
 * Agent 隐私设置。
 */
export interface AgentPrivacySettings {
  allow_emotion_detection: boolean;
  allow_cloud_processing: boolean;
  allow_sharing_with_teacher: boolean;
  allow_sharing_with_guardian: boolean;
}

/**
 * Agent 隐私设置 schema。
 */
export const AgentPrivacySettingsSchema = z.object({
  allow_emotion_detection: z.boolean(),
  allow_cloud_processing: z.boolean(),
  allow_sharing_with_teacher: z.boolean(),
  allow_sharing_with_guardian: z.boolean()
});

/**
 * Agent 配置实体。
 */
export interface AgentProfile {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  agent_type: AgentType;
  owner_id: string;
  persona_version: string;
  display_name?: string;
  enabled_modes: AgentMode[];
  memory_enabled: boolean;
  memory_retention_days: number;
  privacy_settings: AgentPrivacySettings;
}

/**
 * Agent 配置实体 schema。
 */
export const AgentProfileSchema = BaseEntitySchema.extend({
  agent_type: z.nativeEnum(AgentType),
  owner_id: z.string().uuid(),
  persona_version: z.string().trim().min(1).max(120),
  display_name: z.string().trim().min(1).max(100).optional(),
  enabled_modes: z.array(z.nativeEnum(AgentMode)).min(1).max(10),
  memory_enabled: z.boolean(),
  memory_retention_days: z.number().int().nonnegative().max(3650),
  privacy_settings: AgentPrivacySettingsSchema
});
