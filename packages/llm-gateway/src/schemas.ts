import { z } from "zod";

export const LlmPurposeSchema = z.union([
  z.literal("student_dialogue"),
  z.literal("teacher_daily_report"),
  z.literal("content_generation"),
  z.literal("guardian_weekly_report"),
  z.literal("memory_summary"),
  z.literal("prompt_test")
]);

export const GatewayUserRoleSchema = z.union([
  z.literal("student"),
  z.literal("teacher"),
  z.literal("guardian"),
  z.literal("admin"),
  z.literal("system")
]);

export const GatewayPrivacyLevelSchema = z.union([
  z.literal("public"),
  z.literal("private"),
  z.literal("campus_local_only")
]);

export const GatewayMessageSchema = z
  .object({
    role: z.union([z.literal("system"), z.literal("user"), z.literal("assistant")]),
    content: z.string().min(1).max(20_000)
  })
  .strict();

export const GatewayCompleteRequestSchema = z
  .object({
    purpose: LlmPurposeSchema,
    messages: z.array(GatewayMessageSchema).min(1).max(80),
    user_context: z
      .object({
        role: GatewayUserRoleSchema,
        tenant_id: z.string().min(1).max(120).optional(),
        student_id: z.string().min(1).max(120).optional(),
        subject: z.string().min(1).max(120).optional()
      })
      .strict(),
    privacy_level: GatewayPrivacyLevelSchema,
    model_preference: z.union([z.literal("fast"), z.literal("deep")]).optional(),
    prompt_id: z.string().min(1).max(120).optional(),
    request_id: z.string().min(1).max(160).optional(),
    cache: z.boolean().optional()
  })
  .strict();
