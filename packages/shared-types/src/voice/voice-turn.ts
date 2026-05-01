import { z } from "zod";

import { IsoDateTimeSchema, NonEmptyStringSchema } from "../base";

export const VoiceProviderClassSchema = z.enum(["browser", "approved_cloud", "campus_local", "synthetic_test"]);
export type VoiceProviderClass = z.infer<typeof VoiceProviderClassSchema>;

export const VoicePrivacyClassSchema = z.enum([
  "public_content",
  "academic",
  "student_sensitive",
  "campus_local_only"
]);
export type VoicePrivacyClass = z.infer<typeof VoicePrivacyClassSchema>;

export const VoiceRouteSelectedSchema = z.enum([
  "approved_cloud",
  "student_safe_cloud",
  "campus_local",
  "safe_fallback"
]);
export type VoiceRouteSelected = z.infer<typeof VoiceRouteSelectedSchema>;

export const VoiceTranscriptHandlingSchema = z.enum(["ephemeral", "student_owned_only", "blocked"]);
export type VoiceTranscriptHandling = z.infer<typeof VoiceTranscriptHandlingSchema>;

export const VoiceLatencySchema = z
  .object({
    vad_ms: z.number().int().nonnegative().optional(),
    stt_first_partial_ms: z.number().int().nonnegative().optional(),
    stt_final_ms: z.number().int().nonnegative().optional(),
    privacy_classification_ms: z.number().int().nonnegative().optional(),
    agent_first_token_ms: z.number().int().nonnegative().optional(),
    tts_first_audio_ms: z.number().int().nonnegative().optional(),
    barge_in_stop_ms: z.number().int().nonnegative().optional(),
    total_turn_ms: z.number().int().nonnegative().optional()
  })
  .strict();
export type VoiceLatency = z.infer<typeof VoiceLatencySchema>;

export const VoiceFailureSchema = z
  .object({
    code: NonEmptyStringSchema.max(120),
    safe_message: NonEmptyStringSchema.max(1000),
    retryable: z.boolean()
  })
  .strict();
export type VoiceFailure = z.infer<typeof VoiceFailureSchema>;

export const VoiceRuntimeFlagsSchema = z
  .object({
    barge_in_detected: z.boolean(),
    fallback_used: z.boolean(),
    durable_learning_event_created: z.boolean(),
    teacher_projection_allowed: z.boolean()
  })
  .strict();
export type VoiceRuntimeFlags = z.infer<typeof VoiceRuntimeFlagsSchema>;

export interface VoiceTurnDraft {
  voice_turn_id: string;
  session_id: string;
  student_token: string;
  unit_id?: string | undefined;
  page_id?: string | undefined;
  block_id?: string | undefined;
  started_at: string;
  ended_at?: string | undefined;
  input_mode: "voice";
  stt_provider_class: VoiceProviderClass;
  tts_provider_class: VoiceProviderClass;
  privacy_class: VoicePrivacyClass;
  route_selected: VoiceRouteSelected;
  transcript_handling: VoiceTranscriptHandling;
  safe_summary: string;
  target_knowledge_node_ids: string[];
  latency: VoiceLatency;
  runtime_flags: VoiceRuntimeFlags;
  failure?: VoiceFailure | undefined;
}

export const VoiceTurnDraftSchema = z
  .object({
    voice_turn_id: NonEmptyStringSchema.max(160),
    session_id: NonEmptyStringSchema.max(160),
    student_token: NonEmptyStringSchema.max(160),
    unit_id: NonEmptyStringSchema.max(160).optional(),
    page_id: NonEmptyStringSchema.max(160).optional(),
    block_id: NonEmptyStringSchema.max(160).optional(),
    started_at: IsoDateTimeSchema,
    ended_at: IsoDateTimeSchema.optional(),
    input_mode: z.literal("voice"),
    stt_provider_class: VoiceProviderClassSchema,
    tts_provider_class: VoiceProviderClassSchema,
    privacy_class: VoicePrivacyClassSchema,
    route_selected: VoiceRouteSelectedSchema,
    transcript_handling: VoiceTranscriptHandlingSchema,
    safe_summary: NonEmptyStringSchema.max(1000),
    target_knowledge_node_ids: z.array(NonEmptyStringSchema.max(160)).max(50),
    latency: VoiceLatencySchema,
    runtime_flags: VoiceRuntimeFlagsSchema,
    failure: VoiceFailureSchema.optional()
  })
  .strict()
  .superRefine((value, ctx) => {
    if (hasForbiddenVoiceRuntimeKeys(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "VoiceTurnDraft must not carry raw audio, raw transcript, raw prompts, or raw model outputs."
      });
    }

    if (value.privacy_class === "campus_local_only") {
      if (value.route_selected !== "campus_local" && value.route_selected !== "safe_fallback") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["route_selected"],
          message: "campus_local_only voice turns cannot route to cloud providers."
        });
      }

      if (value.stt_provider_class === "approved_cloud" || value.tts_provider_class === "approved_cloud") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["stt_provider_class"],
          message: "campus_local_only voice turns cannot use approved_cloud STT/TTS providers."
        });
      }

      if (value.transcript_handling !== "blocked") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["transcript_handling"],
          message: "campus_local_only voice turns must block transcript retention by default."
        });
      }
    }

    if (
      value.route_selected === "approved_cloud" &&
      value.privacy_class !== "public_content" &&
      value.privacy_class !== "academic"
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["route_selected"],
        message: "approved_cloud route is limited to public_content or academic voice turns."
      });
    }
  });

export type ParsedVoiceTurnDraft = z.infer<typeof VoiceTurnDraftSchema>;

export const VoiceTeacherSignalTypeSchema = z.enum([
  "none",
  "academic_signal",
  "oral_baseline_completed",
  "needs_human_workflow"
]);
export type VoiceTeacherSignalType = z.infer<typeof VoiceTeacherSignalTypeSchema>;

export const VoiceOralQualityBandSchema = z.enum(["not_evaluated", "emerging", "developing", "clear"]);
export type VoiceOralQualityBand = z.infer<typeof VoiceOralQualityBandSchema>;

export interface VoiceTeacherProjection {
  voice_turn_id: string;
  session_id: string;
  student_token: string;
  unit_id?: string | undefined;
  page_id?: string | undefined;
  block_id?: string | undefined;
  target_knowledge_node_ids: string[];
  teacher_signal_type: VoiceTeacherSignalType;
  oral_explanation_quality_band: VoiceOralQualityBand;
  no_ai_oral_baseline_completed: boolean;
  safe_summary: string;
  raw_audio_available: false;
  raw_transcript_available: false;
}

export const VoiceTeacherProjectionSchema = z
  .object({
    voice_turn_id: NonEmptyStringSchema.max(160),
    session_id: NonEmptyStringSchema.max(160),
    student_token: NonEmptyStringSchema.max(160),
    unit_id: NonEmptyStringSchema.max(160).optional(),
    page_id: NonEmptyStringSchema.max(160).optional(),
    block_id: NonEmptyStringSchema.max(160).optional(),
    target_knowledge_node_ids: z.array(NonEmptyStringSchema.max(160)).max(50),
    teacher_signal_type: VoiceTeacherSignalTypeSchema,
    oral_explanation_quality_band: VoiceOralQualityBandSchema,
    no_ai_oral_baseline_completed: z.boolean(),
    safe_summary: NonEmptyStringSchema.max(1000),
    raw_audio_available: z.literal(false),
    raw_transcript_available: z.literal(false)
  })
  .strict()
  .superRefine((value, ctx) => {
    if (hasForbiddenVoiceRuntimeKeys(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "VoiceTeacherProjection must not carry raw audio, raw transcript, emotional detail, or family detail."
      });
    }
  });

const FORBIDDEN_VOICE_RUNTIME_KEYS = new Set([
  "raw_audio",
  "audio_blob",
  "audio_buffer",
  "audio_playback_url",
  "raw_transcript",
  "full_transcript",
  "verbatim_transcript",
  "transcript_text",
  "raw_prompt",
  "prompt_messages",
  "raw_model_output",
  "raw_provider_output",
  "hidden_reasoning",
  "emotion_text",
  "emotion_detail",
  "family_detail"
]);

function hasForbiddenVoiceRuntimeKeys(input: unknown): boolean {
  if (Array.isArray(input)) {
    return input.some((item) => hasForbiddenVoiceRuntimeKeys(item));
  }

  if (!input || typeof input !== "object") {
    return false;
  }

  return Object.entries(input as Record<string, unknown>).some(([key, value]) => {
    if (FORBIDDEN_VOICE_RUNTIME_KEYS.has(key)) {
      return true;
    }

    return hasForbiddenVoiceRuntimeKeys(value);
  });
}
