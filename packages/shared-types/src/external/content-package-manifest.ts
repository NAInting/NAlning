import { z } from "zod";

import { IsoDateTimeSchema, NonEmptyStringSchema } from "../base";
import { UnitBlockTypeSchema, UnitSourceTraceSchema, UnitSpecIdSchema } from "../content/ai-native-unit";

export const ContentPackageSchemaVersionSchema = z.literal("edu-ai-content-package-v0.1");

export const ContentPackageTypeSchema = z.enum([
  "unit_runtime_package",
  "teacher_preview_package",
  "offline_campus_package"
]);

export const ContentPackageGeneratedBySchema = z.enum(["content_pipeline", "manual_export", "test_fixture"]);

export const ContentPackageCapabilitySchema = z.enum([
  "static_read",
  "interactive_runtime",
  "sandboxed_runtime",
  "teacher_led",
  "voice_runtime",
  "whiteboard_runtime",
  "pbl_runtime",
  "external_lrs_sync"
]);

export const ContentPackageEntrypointTypeSchema = z.enum([
  "student_page",
  "teacher_guide",
  "no_ai_task",
  "assessment",
  "offline_fallback",
  "interactive_runtime"
]);

export const ContentPackageAssetTypeSchema = z.enum([
  "runtime_json",
  "teacher_guide",
  "no_ai_task",
  "assessment",
  "media_image",
  "media_audio_stub",
  "media_video_stub",
  "interactive_bundle",
  "content_manifest",
  "source_trace_index"
]);

export const ContentPackageInteractionFamilySchema = z.enum([
  "static_read",
  "quiz_check",
  "simulation",
  "dialogue_prompt",
  "reflection",
  "practice",
  "concept_map",
  "code_lab"
]);

export const ContentPackageInputModeSchema = z.enum(["none", "text", "choice", "drawing", "voice_stub"]);
export const ContentPackageScoringModeSchema = z.enum(["none", "auto", "human_review", "hybrid"]);
export const ContentPackageFallbackModeSchema = z.enum(["none", "teacher_led", "static_readonly", "defer_until_online"]);

export const ContentPackageBlockedDataClassSchema = z.enum([
  "real_student_profile",
  "raw_dialogue",
  "voice_audio",
  "voice_transcript",
  "emotion_or_personal",
  "family_context",
  "teacher_private_note",
  "student_memory",
  "provider_log",
  "model_internal"
]);

export const ContentPackageRuntimeDomainSchema = z.enum(["content", "academic", "runtime", "system"]);
export const ContentPackageExportScopeSchema = z.enum(["public_content", "campus_internal_content"]);
export const ContentPackageLicenseTypeSchema = z.enum([
  "project_owned",
  "school_owned",
  "open_license",
  "third_party_reviewed",
  "unknown_blocked"
]);
export const ContentPackageLicenseStatusSchema = z.enum(["passed", "needs_review", "blocked"]);
export const ContentPackageReviewStatusSchema = z.enum(["draft", "needs_human_review", "approved", "blocked"]);
export const ContentPackageIssueSeveritySchema = z.enum(["low", "medium", "high", "blocking"]);
export const ContentPackageIssueStatusSchema = z.enum(["open", "resolved", "waived"]);

const Sha256Schema = z.string().regex(/^[a-f0-9]{64}$/);

const requiredBlockedDataClasses = [
  "real_student_profile",
  "raw_dialogue",
  "voice_audio",
  "voice_transcript",
  "emotion_or_personal",
  "family_context",
  "teacher_private_note",
  "student_memory",
  "provider_log",
  "model_internal"
] as const;

const forbiddenTeacherSignalFields = new Set([
  "raw_dialogue",
  "raw_response",
  "raw_audio",
  "raw_transcript",
  "full_transcript",
  "verbatim_transcript",
  "voice_audio",
  "voice_transcript",
  "student_memory",
  "emotion_or_personal",
  "family_context",
  "provider_log",
  "model_internal"
]);

const forbiddenTeacherSignalFieldFragments = [
  "raw_dialogue",
  "raw_response",
  "raw_audio",
  "raw_transcript",
  "full_transcript",
  "verbatim_transcript",
  "voice_audio",
  "voice_transcript",
  "student_memory",
  "emotion_or_personal",
  "family_context",
  "provider_log",
  "model_internal"
];

const networkBoundOfflineCapabilities = new Set(["voice_runtime", "external_lrs_sync"]);

const forbiddenAssetFilePathPatterns = [
  /(^|[/\\])raw[-_ ]?(dialogue|audio|transcript)(\.|[/\\]|$)/i,
  /(^|[/\\])full[-_ ]?transcript(\.|[/\\]|$)/i,
  /(^|[/\\])verbatim[-_ ]?transcript(\.|[/\\]|$)/i,
  /(^|[/\\])provider[-_ ]?log(\.|[/\\]|$)/i,
  /(^|[/\\])student[-_ ]?memory(\.|[/\\]|$)/i,
  /(^|[/\\])teacher[-_ ]?private[-_ ]?note(\.|[/\\]|$)/i,
  /(^|[/\\])model[-_ ]?internal(\.|[/\\]|$)/i,
  /(^|[/\\])emotion[-_ ]?or[-_ ]?personal(\.|[/\\]|$)/i,
  /(^|[/\\])family[-_ ]?context(\.|[/\\]|$)/i
];

const forbiddenAssetFilePathFragments = [
  "raw_dialogue",
  "raw_response",
  "raw_audio",
  "raw_transcript",
  "full_transcript",
  "verbatim_transcript",
  "voice_audio",
  "voice_playback",
  "voice_recording",
  "voice_transcript",
  "audio_playback",
  "provider_log",
  "student_memory",
  "teacher_private_note",
  "model_internal",
  "emotion_or_personal",
  "family_context"
];

const forbiddenPackagePathChinesePatterns = [
  /\u539f\u59cb\s*(\u97f3\u9891|\u8bed\u97f3|\u5f55\u97f3|\u8f6c\u5199|\u8f6c\u5f55|\u5bf9\u8bdd|\u56de\u7b54)/,
  /\u8bed\u97f3\s*(\u56de\u653e|\u64ad\u653e|\u5f55\u97f3|\u8f6c\u5199|\u8f6c\u5f55)/,
  /\u97f3\u9891\s*(\u56de\u653e|\u64ad\u653e|\u5f55\u97f3)/,
  /\u5b8c\u6574\s*(\u8f6c\u5199|\u8f6c\u5f55|\u9010\u5b57\u7a3f|\u5bf9\u8bdd|\u56de\u7b54|\u4f5c\u7b54)/,
  /\u9010\u5b57\u7a3f/,
  /\u5b66\u751f\s*(\u539f\u8bdd|\u8bed\u97f3\u8f6c\u5199|\u8bed\u97f3\u8f6c\u5f55|\u9010\u5b57|\u5b8c\u6574\u4f5c\u7b54)/,
  /\u5bb6\u5ead\s*(\u51b2\u7a81|\u7ec6\u8282|\u5185\u5bb9|\u60c5\u51b5)/,
  /\u60c5\u7eea\s*(\u539f\u6587|\u7ec6\u8282|\u5185\u5bb9)/,
  /\u6a21\u578b\s*(\u539f\u59cb\u8f93\u51fa|\u8f93\u51fa\u539f\u6587|\u63d0\u793a\u8bcd\u539f\u6587)/,
  /\u63d0\u793a\u8bcd\s*\u539f\u6587/
];

const unsafeSourceTraceReferencePatterns = [
  /\b(raw|original|full|complete|verbatim)\s+(provider\s+)?(output|prompt|completion|response|dialogue|transcript)\b/i,
  /\bprovider\s+(log|request|response|payload|prompt|completion)\b/i,
  /\bstudent'?s?\s+(exact|full|complete|original)\s+(answer|response|reply|words)\b/i,
  /\bvoice\s+(audio|recording|playback|transcript)\b/i,
  /\baudio\s+(recording|playback|transcript)\b/i,
  /\bemotion(al)?\s+(text|detail|content)\b/i,
  /\bfamily\s+(context|detail|content|conflict)\b/i,
  /\u539f\u59cb\s*(\u5bf9\u8bdd|\u56de\u7b54|\u8f6c\u5199|\u8bed\u97f3|\u97f3\u9891|\u6a21\u578b\u8f93\u51fa)/,
  /\u5b8c\u6574\s*(\u5bf9\u8bdd|\u56de\u7b54|\u8f6c\u5199|\u9010\u5b57\u7a3f|\u4f5c\u7b54)/,
  /\u5b66\u751f\s*(\u539f\u8bdd|\u9010\u5b57|\u4f5c\u7b54\u539f\u6587|\u5b8c\u6574\u4f5c\u7b54)/,
  /\u8bed\u97f3\s*(\u56de\u653e|\u64ad\u653e|\u8f6c\u5199|\u5f55\u97f3|\u97f3\u9891)/,
  /\u5bb6\u5ead\s*(\u60c5\u51b5|\u51b2\u7a81|\u7ec6\u8282|\u5185\u5bb9)/,
  /\u60c5\u7eea\s*(\u539f\u6587|\u7ec6\u8282|\u5185\u5bb9)/,
  /\u6a21\u578b\s*(\u539f\u59cb\u8f93\u51fa|\u8f93\u51fa\u539f\u6587|\u63d0\u793a\u8bcd\u539f\u6587)/
];

function addPrivacySensitivePackagePathIssue(filePath: string, owner: "asset" | "entrypoint", ctx: z.RefinementCtx): void {
  if (isPrivacySensitivePackagePath(filePath)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["file_path"],
      message: `Content package ${owner} file_path cannot point to privacy-sensitive package payload: ${filePath}`
    });
  }
}

function isPrivacySensitivePackagePath(filePath: string): boolean {
  if (forbiddenAssetFilePathPatterns.some((pattern) => pattern.test(filePath))) {
    return true;
  }

  if (forbiddenPackagePathChinesePatterns.some((pattern) => pattern.test(filePath))) {
    return true;
  }

  return filePath
    .split(/[/\\]+/)
    .map(normalizePackageField)
    .some((segment) => forbiddenAssetFilePathFragments.some((fragment) => segment.includes(fragment)));
}

function addSourceTraceReferenceIssues(sourceTrace: readonly { reference: string }[], ctx: z.RefinementCtx): void {
  sourceTrace.forEach((source, index) => {
    if (containsUnsafeSourceTraceReference(source.reference)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["source_trace", index, "reference"],
        message: "Content package source_trace.reference cannot include raw provider output, raw student content, voice transcripts, emotion details, or family context"
      });
    }
  });
}

function containsUnsafeSourceTraceReference(reference: string): boolean {
  const normalizedReference = reference.replace(/%20/gi, " ").replace(/[-_]+/g, " ");
  return unsafeSourceTraceReferencePatterns.some(
    (pattern) => pattern.test(reference) || pattern.test(normalizedReference)
  );
}

function addManifestTextPrivacyIssue(
  text: string | undefined,
  path: Array<string | number>,
  fieldLabel: string,
  ctx: z.RefinementCtx
): void {
  if (text && containsUnsafeSourceTraceReference(text)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path,
      message: `Content package ${fieldLabel} cannot include raw provider output, raw student content, voice transcripts, emotion details, or family context`
    });
  }
}

function addPackageRelativeFilePathIssue(filePath: string, ctx: z.RefinementCtx): void {
  const normalizedPath = filePath.replace(/\\/g, "/");
  const hasScheme = /^[A-Za-z][A-Za-z0-9+.-]*:/.test(filePath);
  const escapesPackageRoot = normalizedPath.startsWith("/") || normalizedPath.split("/").includes("..");

  if (hasScheme || escapesPackageRoot) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["file_path"],
      message: `Content package file_path must be package-relative and cannot escape package root: ${filePath}`
    });
  }
}

function addRepositoryRelativeSourcePathIssue(sourcePath: string | undefined, ctx: z.RefinementCtx): void {
  if (!sourcePath) {
    return;
  }

  const normalizedPath = sourcePath.replace(/\\/g, "/");
  const hasScheme = /^[A-Za-z][A-Za-z0-9+.-]*:/.test(sourcePath);
  const escapesRepositoryRoot = normalizedPath.startsWith("/") || normalizedPath.split("/").includes("..");

  if (hasScheme || escapesRepositoryRoot) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["source_unit_path"],
      message: `Content package source_unit_path must be repository-relative and cannot escape source root: ${sourcePath}`
    });
  }

  if (!normalizedPath.startsWith("content/units/") || !/\.(ya?ml)$/i.test(normalizedPath)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["source_unit_path"],
      message: `Content package source_unit_path must point to an approved UnitSpec YAML under content/units/: ${sourcePath}`
    });
  }

  if (isPrivacySensitivePackagePath(sourcePath)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["source_unit_path"],
      message: `Content package source_unit_path cannot point to privacy-sensitive source payload: ${sourcePath}`
    });
  }
}

export const ContentPackageIdentitySchema = z
  .object({
    package_id: UnitSpecIdSchema,
    package_type: ContentPackageTypeSchema,
    package_version: NonEmptyStringSchema.max(80),
    unit_id: UnitSpecIdSchema,
    generated_at: IsoDateTimeSchema,
    generated_by: ContentPackageGeneratedBySchema,
    packager_version: NonEmptyStringSchema.max(80)
  })
  .strict();

export const ContentPackageSourceSchema = z
  .object({
    source_unit_id: UnitSpecIdSchema,
    source_unit_version: NonEmptyStringSchema.max(80).optional(),
    source_unit_path: NonEmptyStringSchema.max(500).optional(),
    source_review_artifact_id: UnitSpecIdSchema.optional(),
    source_trace: z.array(UnitSourceTraceSchema).min(1).max(200)
  })
  .strict()
  .superRefine((source, ctx) => {
    addRepositoryRelativeSourcePathIssue(source.source_unit_path, ctx);
    addSourceTraceReferenceIssues(source.source_trace, ctx);
  });

export const ContentPackageEntrypointSchema = z
  .object({
    entrypoint_id: UnitSpecIdSchema,
    entrypoint_type: ContentPackageEntrypointTypeSchema,
    page_id: UnitSpecIdSchema.optional(),
    block_ids: z.array(UnitSpecIdSchema).max(120),
    file_path: NonEmptyStringSchema.max(500),
    required_capabilities: z.array(ContentPackageCapabilitySchema).min(1).max(20)
  })
  .strict()
  .superRefine((entrypoint, ctx) => {
    addPackageRelativeFilePathIssue(entrypoint.file_path, ctx);
    addPrivacySensitivePackagePathIssue(entrypoint.file_path, "entrypoint", ctx);
  });

export const ContentPackageAssetSchema = z
  .object({
    asset_id: UnitSpecIdSchema,
    asset_type: ContentPackageAssetTypeSchema,
    file_path: NonEmptyStringSchema.max(500),
    sha256: Sha256Schema,
    byte_size: z.number().int().nonnegative(),
    related_page_id: UnitSpecIdSchema.optional(),
    related_block_id: UnitSpecIdSchema.optional(),
    source_trace_ids: z.array(NonEmptyStringSchema.max(160)).max(120),
    contains_personal_data: z.literal(false),
    license_ref: UnitSpecIdSchema
  })
  .strict()
  .superRefine((asset, ctx) => {
    addPackageRelativeFilePathIssue(asset.file_path, ctx);
    addPrivacySensitivePackagePathIssue(asset.file_path, "asset", ctx);
  });

export const InteractiveBlockPackageProfileSchema = z
  .object({
    page_id: UnitSpecIdSchema,
    block_id: UnitSpecIdSchema,
    block_type: UnitBlockTypeSchema,
    interaction_family: ContentPackageInteractionFamilySchema,
    input_modes: z.array(ContentPackageInputModeSchema).min(1).max(8),
    scoring_mode: ContentPackageScoringModeSchema,
    sandbox_required: z.boolean(),
    offline_supported: z.boolean(),
    fallback_entrypoint_id: UnitSpecIdSchema.optional(),
    teacher_visible_signal_fields: z.array(NonEmptyStringSchema.max(160)).max(30)
  })
  .strict()
  .superRefine((profile, ctx) => {
    profile.teacher_visible_signal_fields.forEach((field, index) => {
      if (isForbiddenTeacherSignalField(field)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["teacher_visible_signal_fields", index],
          message: `Content package teacher projections cannot expose ${field}`
        });
      }
    });
  });

function isForbiddenTeacherSignalField(field: string): boolean {
  const normalizedField = normalizePackageField(field);
  return (
    forbiddenTeacherSignalFields.has(normalizedField) ||
    forbiddenTeacherSignalFieldFragments.some((fragment) => normalizedField.includes(fragment)) ||
    forbiddenPackagePathChinesePatterns.some((pattern) => pattern.test(field))
  );
}

function normalizePackageField(field: string): string {
  return field
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export const ContentPackageOfflinePolicySchema = z
  .object({
    can_run_offline: z.boolean(),
    fallback_mode: ContentPackageFallbackModeSchema,
    offline_allowed_entrypoint_ids: z.array(UnitSpecIdSchema).max(200),
    requires_network_for: z
      .array(z.enum(["live_ai_tutoring", "cloud_provider_calls", "speech_to_text", "text_to_speech", "external_lrs_sync"]))
      .max(30)
  })
  .strict();

export const ContentPackagePrivacyManifestSchema = z
  .object({
    contains_real_student_data: z.literal(false),
    contains_raw_provider_output: z.literal(false),
    export_scope: ContentPackageExportScopeSchema,
    privacy_filter_version: NonEmptyStringSchema.max(80),
    blocked_data_classes: z.array(ContentPackageBlockedDataClassSchema).min(1).max(20),
    allowed_runtime_event_domains: z.array(ContentPackageRuntimeDomainSchema).min(1).max(8),
    safe_for_student_device_cache: z.boolean(),
    safe_for_teacher_device_cache: z.boolean(),
    retention_note: NonEmptyStringSchema.max(1000)
  })
  .strict()
  .superRefine((manifest, ctx) => {
    for (const dataClass of requiredBlockedDataClasses) {
      if (!manifest.blocked_data_classes.includes(dataClass)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["blocked_data_classes"],
          message: `Content packages must explicitly block ${dataClass}`
        });
      }
    }

    if (manifest.safe_for_student_device_cache && manifest.export_scope !== "public_content") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["safe_for_student_device_cache"],
        message: "Student device cache requires export_scope=public_content"
      });
    }
  });

export const ContentPackageLicenseEntrySchema = z
  .object({
    license_ref: UnitSpecIdSchema,
    license_type: ContentPackageLicenseTypeSchema,
    attribution: NonEmptyStringSchema.max(1000).optional(),
    source_uri: NonEmptyStringSchema.max(1000).optional(),
    review_note: NonEmptyStringSchema.max(1000)
  })
  .strict()
  .superRefine((entry, ctx) => {
    addManifestTextPrivacyIssue(entry.attribution, ["attribution"], "license attribution", ctx);
    addManifestTextPrivacyIssue(entry.source_uri, ["source_uri"], "license source_uri", ctx);
    addManifestTextPrivacyIssue(entry.review_note, ["review_note"], "license review_note", ctx);
  });

export const ContentPackageLicenseManifestSchema = z
  .object({
    package_license_status: ContentPackageLicenseStatusSchema,
    license_entries: z.array(ContentPackageLicenseEntrySchema).min(1).max(200)
  })
  .strict()
  .superRefine((manifest, ctx) => {
    const hasUnknownLicense = manifest.license_entries.some((entry) => entry.license_type === "unknown_blocked");
    if (hasUnknownLicense && manifest.package_license_status === "passed") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["package_license_status"],
        message: "Content packages with unknown_blocked licenses cannot have passed license status"
      });
    }
  });

export const ContentPackageIntegritySchema = z
  .object({
    build_input_hash: Sha256Schema,
    asset_index_hash: Sha256Schema,
    manifest_hash: Sha256Schema.optional()
  })
  .strict();

export const ContentPackageReviewIssueSchema = z
  .object({
    issue_id: UnitSpecIdSchema,
    severity: ContentPackageIssueSeveritySchema,
    status: ContentPackageIssueStatusSchema,
    message: NonEmptyStringSchema.max(1000),
    repair_hint: NonEmptyStringSchema.max(1000)
  })
  .strict()
  .superRefine((issue, ctx) => {
    addManifestTextPrivacyIssue(issue.message, ["message"], "review issue message", ctx);
    addManifestTextPrivacyIssue(issue.repair_hint, ["repair_hint"], "review issue repair_hint", ctx);
  });

export const ContentPackageReviewSchema = z
  .object({
    status: ContentPackageReviewStatusSchema,
    reviewed_by: NonEmptyStringSchema.max(160).optional(),
    reviewed_at: IsoDateTimeSchema.optional(),
    issues: z.array(ContentPackageReviewIssueSchema).max(200)
  })
  .strict();

export const ContentPackageManifestSchema = z
  .object({
    schema_version: ContentPackageSchemaVersionSchema,
    identity: ContentPackageIdentitySchema,
    source: ContentPackageSourceSchema,
    runtime_entrypoints: z.array(ContentPackageEntrypointSchema).min(1).max(200),
    assets: z.array(ContentPackageAssetSchema).min(1).max(500),
    interactive_blocks: z.array(InteractiveBlockPackageProfileSchema).max(500),
    offline_policy: ContentPackageOfflinePolicySchema,
    privacy_manifest: ContentPackagePrivacyManifestSchema,
    license_manifest: ContentPackageLicenseManifestSchema,
    integrity: ContentPackageIntegritySchema,
    review: ContentPackageReviewSchema
  })
  .strict()
  .superRefine((manifest, ctx) => {
    if (manifest.source.source_unit_id !== manifest.identity.unit_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["source", "source_unit_id"],
        message: "source_unit_id must match identity.unit_id"
      });
    }

    if (manifest.review.status === "approved" && manifest.license_manifest.package_license_status !== "passed") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["review", "status"],
        message: "approved content packages require passed license status"
      });
    }

    if (manifest.review.status === "approved" && !manifest.review.reviewed_by) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["review", "reviewed_by"],
        message: "approved content packages require reviewed_by audit metadata"
      });
    }

    if (manifest.review.status === "approved" && !manifest.review.reviewed_at) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["review", "reviewed_at"],
        message: "approved content packages require reviewed_at audit metadata"
      });
    }

    const hasOpenBlockingReviewIssue = manifest.review.issues.some(
      (issue) => issue.status === "open" && (issue.severity === "blocking" || issue.severity === "high")
    );
    if (manifest.review.status === "approved" && hasOpenBlockingReviewIssue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["review", "issues"],
        message: "approved content packages cannot contain open high or blocking review issues"
      });
    }

    const entrypointsById = new Map(manifest.runtime_entrypoints.map((entrypoint) => [entrypoint.entrypoint_id, entrypoint]));
    const entrypointIds = new Set(entrypointsById.keys());
    const offlineAllowedEntrypointIds = new Set(manifest.offline_policy.offline_allowed_entrypoint_ids);
    if (entrypointIds.size !== manifest.runtime_entrypoints.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["runtime_entrypoints"],
        message: "runtime_entrypoints must have unique entrypoint_id values"
      });
    }

    const packagedPageIds = new Set<string>();
    manifest.runtime_entrypoints.forEach((entrypoint) => {
      if (entrypoint.page_id) {
        packagedPageIds.add(entrypoint.page_id);
      }
    });
    const packagedBlockPageIds = new Map(manifest.interactive_blocks.map((block) => [block.block_id, block.page_id]));
    manifest.interactive_blocks.forEach((block) => packagedPageIds.add(block.page_id));
    const packagedBlockIds = new Set(packagedBlockPageIds.keys());
    manifest.runtime_entrypoints.forEach((entrypoint, entrypointIndex) => {
      entrypoint.block_ids.forEach((blockId, blockIndex) => {
        if (!packagedBlockIds.has(blockId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["runtime_entrypoints", entrypointIndex, "block_ids", blockIndex],
            message: `Unknown runtime entrypoint block_id: ${blockId}`
          });
        }
      });
    });

    manifest.interactive_blocks.forEach((block, blockIndex) => {
      if (block.fallback_entrypoint_id && !entrypointIds.has(block.fallback_entrypoint_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["interactive_blocks", blockIndex, "fallback_entrypoint_id"],
          message: `Unknown interactive block fallback_entrypoint_id: ${block.fallback_entrypoint_id}`
        });
      }

      if (manifest.identity.package_type === "offline_campus_package" && !block.offline_supported) {
        if (!block.fallback_entrypoint_id) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["interactive_blocks", blockIndex, "fallback_entrypoint_id"],
            message: `Offline campus block ${block.block_id} must define fallback_entrypoint_id when offline_supported=false`
          });
        } else if (!offlineAllowedEntrypointIds.has(block.fallback_entrypoint_id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["interactive_blocks", blockIndex, "fallback_entrypoint_id"],
            message: `Offline campus block ${block.block_id} fallback_entrypoint_id must be offline-allowed`
          });
        }
      }
    });

    const assetIds = new Set(manifest.assets.map((asset) => asset.asset_id));
    const assetFilePaths = new Set(manifest.assets.map((asset) => asset.file_path));
    if (assetIds.size !== manifest.assets.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["assets"],
        message: "assets must have unique asset_id values"
      });
    }

    const sourceTraceIds = new Set(manifest.source.source_trace.map((source) => source.source_id));
    const licenseRefs = new Set(manifest.license_manifest.license_entries.map((entry) => entry.license_ref));
    manifest.assets.forEach((asset, assetIndex) => {
      asset.source_trace_ids.forEach((sourceTraceId, sourceTraceIndex) => {
        if (!sourceTraceIds.has(sourceTraceId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["assets", assetIndex, "source_trace_ids", sourceTraceIndex],
            message: `Unknown asset source_trace_id: ${sourceTraceId}`
          });
        }
      });

      if (!licenseRefs.has(asset.license_ref)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["assets", assetIndex, "license_ref"],
          message: `Unknown asset license_ref: ${asset.license_ref}`
        });
      }

      if (asset.related_page_id && !packagedPageIds.has(asset.related_page_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["assets", assetIndex, "related_page_id"],
          message: `Unknown asset related_page_id: ${asset.related_page_id}`
        });
      }

      if (asset.related_block_id && !packagedBlockIds.has(asset.related_block_id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["assets", assetIndex, "related_block_id"],
          message: `Unknown asset related_block_id: ${asset.related_block_id}`
        });
      }

      const relatedBlockPageId = asset.related_block_id ? packagedBlockPageIds.get(asset.related_block_id) : undefined;
      if (asset.related_page_id && relatedBlockPageId && relatedBlockPageId !== asset.related_page_id) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["assets", assetIndex, "related_block_id"],
          message: `Asset related_block_id ${asset.related_block_id} belongs to page ${relatedBlockPageId}, not ${asset.related_page_id}`
        });
      }
    });

    manifest.runtime_entrypoints.forEach((entrypoint, entrypointIndex) => {
      if (!assetFilePaths.has(entrypoint.file_path)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["runtime_entrypoints", entrypointIndex, "file_path"],
          message: `Runtime entrypoint file_path must be backed by a packaged asset: ${entrypoint.file_path}`
        });
      }
    });

    if (manifest.identity.package_type === "offline_campus_package") {
      if (!manifest.offline_policy.can_run_offline) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["offline_policy", "can_run_offline"],
          message: "offline_campus_package must set offline_policy.can_run_offline=true"
        });
      }

      if (manifest.offline_policy.fallback_mode === "none") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["offline_policy", "fallback_mode"],
          message: "offline_campus_package must define a non-none fallback_mode"
        });
      }

      const hasOfflineNoAiTask = manifest.runtime_entrypoints.some(
        (entrypoint) => entrypoint.entrypoint_type === "no_ai_task" && offlineAllowedEntrypointIds.has(entrypoint.entrypoint_id)
      );
      const hasOfflineFallback = manifest.runtime_entrypoints.some(
        (entrypoint) => entrypoint.entrypoint_type === "offline_fallback" && offlineAllowedEntrypointIds.has(entrypoint.entrypoint_id)
      );

      if (!hasOfflineNoAiTask) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["offline_policy", "offline_allowed_entrypoint_ids"],
          message: "offline_campus_package must include an offline-allowed no_ai_task entrypoint"
        });
      }

      if (!hasOfflineFallback) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["offline_policy", "offline_allowed_entrypoint_ids"],
          message: "offline_campus_package must include an offline-allowed offline_fallback entrypoint"
        });
      }
    }

    if (manifest.offline_policy.can_run_offline && manifest.offline_policy.offline_allowed_entrypoint_ids.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["offline_policy", "offline_allowed_entrypoint_ids"],
        message: "offline content packages must define at least one offline-allowed entrypoint"
      });
    }

    manifest.offline_policy.offline_allowed_entrypoint_ids.forEach((entrypointId, index) => {
      const entrypoint = entrypointsById.get(entrypointId);
      if (!entrypoint) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["offline_policy", "offline_allowed_entrypoint_ids", index],
          message: `Unknown offline entrypoint id: ${entrypointId}`
        });
        return;
      }

      entrypoint.required_capabilities.forEach((capability) => {
        if (networkBoundOfflineCapabilities.has(capability)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["offline_policy", "offline_allowed_entrypoint_ids", index],
            message: `Offline-allowed entrypoint ${entrypointId} cannot require network-bound capability ${capability}`
          });
        }
      });
    });
  });

export type ContentPackageType = z.infer<typeof ContentPackageTypeSchema>;
export type ContentPackageGeneratedBy = z.infer<typeof ContentPackageGeneratedBySchema>;
export type ContentPackageCapability = z.infer<typeof ContentPackageCapabilitySchema>;
export type ContentPackageExportScope = z.infer<typeof ContentPackageExportScopeSchema>;
export type ContentPackageEntrypoint = z.infer<typeof ContentPackageEntrypointSchema>;
export type ContentPackageAsset = z.infer<typeof ContentPackageAssetSchema>;
export type InteractiveBlockPackageProfile = z.infer<typeof InteractiveBlockPackageProfileSchema>;
export type ContentPackagePrivacyManifest = z.infer<typeof ContentPackagePrivacyManifestSchema>;
export type ContentPackageLicenseManifest = z.infer<typeof ContentPackageLicenseManifestSchema>;
export type ContentPackageReview = z.infer<typeof ContentPackageReviewSchema>;
export type ContentPackageManifest = z.infer<typeof ContentPackageManifestSchema>;
