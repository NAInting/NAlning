import { z } from "zod";

export const MemoryBucketSchema = z.union([z.literal("academic"), z.literal("emotional"), z.literal("personal")]);

export const VectorSourceTypeSchema = z.union([
  z.literal("student_memory"),
  z.literal("content"),
  z.literal("conversation")
]);

export const VectorPrivacyLevelSchema = z.union([
  z.literal("public"),
  z.literal("private"),
  z.literal("campus_local_only")
]);

export const VectorDeploymentScopeSchema = z.union([z.literal("controlled_cloud"), z.literal("campus_local")]);

export const MemoryRequesterRoleSchema = z.union([
  z.literal("student_agent"),
  z.literal("teacher_agent"),
  z.literal("guardian_agent"),
  z.literal("admin"),
  z.literal("system")
]);

export const UpsertVectorInputSchema = z
  .object({
    id: z.string().min(1).max(160).optional(),
    tenant_id: z.string().min(1).max(160),
    student_id: z.string().min(1).max(160).optional(),
    source_id: z.string().min(1).max(160),
    source_type: VectorSourceTypeSchema,
    summary_text: z.string().min(1).max(4000),
    memory_bucket: MemoryBucketSchema,
    privacy_level: VectorPrivacyLevelSchema,
    deployment_scope: VectorDeploymentScopeSchema,
    source_trace: z.array(z.string().min(1).max(240)).min(1).max(50)
  })
  .strict();

export const QueryVectorInputSchema = z
  .object({
    tenant_id: z.string().min(1).max(160),
    requester_role: MemoryRequesterRoleSchema,
    query_text: z.string().min(1).max(4000),
    source_type: VectorSourceTypeSchema.optional(),
    student_id: z.string().min(1).max(160).optional(),
    memory_bucket: MemoryBucketSchema.optional(),
    limit: z.number().int().positive().max(100).optional()
  })
  .strict();
