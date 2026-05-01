import { z } from "zod";

import { NonEmptyStringSchema } from "../base";
import { UnitSourceTraceSchema, UnitSpecIdSchema } from "./ai-native-unit";

export const ClassroomActionPlanSchemaVersionSchema = z.literal("edu-ai-classroom-action-plan-v0.1");

export const ClassroomTeacherControlModeSchema = z.enum([
  "teacher_confirm_each_action",
  "teacher_preview_then_auto_advance",
  "teacher_led_only"
]);

export const ClassroomActionPhaseSchema = z.enum([
  "scenario_wakeup",
  "teacher_framing",
  "ai_exploration",
  "block_focus",
  "whiteboard_action",
  "voice_exchange",
  "peer_discussion",
  "pbl_issue_open",
  "quiz_prompt",
  "no_ai_baseline",
  "teacher_synthesis",
  "reflection_trace"
]);

export const ClassroomActionTriggerTypeSchema = z.enum([
  "time",
  "teacher_manual",
  "class_signal",
  "block_completion",
  "misconception_cluster",
  "no_ai_result"
]);

export const ClassroomRuntimeEventTypeSchema = z.enum([
  "stage_start",
  "stage_end",
  "progress",
  "source_anchor",
  "content_delta",
  "result",
  "blocked",
  "error",
  "done",
  "future_voice_turn",
  "future_whiteboard_action",
  "future_pbl_action"
]);

export const ClassroomRuntimeEventDomainSchema = z.enum(["academic", "content", "runtime", "emotion", "system"]);
export const ClassroomRuntimeEventPrivacyLevelSchema = z.enum([
  "public",
  "academic",
  "student_sensitive",
  "campus_local_only"
]);

export const TeacherCheckpointTypeSchema = z.enum([
  "observe",
  "ask_student",
  "collect_no_ai_evidence",
  "mini_explain",
  "decide_intervention"
]);

export const ClassroomActionVisibilityScopeSchema = z.enum(["student", "teacher", "classroom", "admin_audit"]);

export const ClassroomEvidenceTypeSchema = z.enum([
  "class_poll",
  "student_prediction",
  "peer_explanation",
  "no_ai_output",
  "oral_summary",
  "teacher_observation",
  "runtime_completion"
]);

export const ClassroomProviderUnavailableFallbackSchema = z.enum(["teacher_led", "static_content", "no_ai_task"]);
export const ClassroomNetworkUnavailableFallbackSchema = z.enum(["teacher_led", "printed_material", "local_package"]);
export const ClassroomVoiceUnavailableFallbackSchema = z.literal("text_or_teacher_read");
export const ClassroomWhiteboardUnavailableFallbackSchema = z.literal("static_diagram_or_teacher_draw");

export const TeacherControlPolicySchema = z
  .object({
    default_mode: ClassroomTeacherControlModeSchema,
    teacher_can_pause: z.literal(true),
    teacher_can_skip: z.literal(true),
    teacher_can_override: z.literal(true),
    student_individual_action_requires_confirmation: z.literal(true)
  })
  .strict();

export const ClassroomActionTriggerSchema = z
  .object({
    trigger_type: ClassroomActionTriggerTypeSchema,
    trigger_description: NonEmptyStringSchema.max(1000),
    auto_start_allowed: z.boolean()
  })
  .strict();

export const ClassroomRuntimeEventSuggestionSchema = z
  .object({
    event_type: ClassroomRuntimeEventTypeSchema,
    domain: ClassroomRuntimeEventDomainSchema,
    privacy_level: ClassroomRuntimeEventPrivacyLevelSchema,
    safe_summary: NonEmptyStringSchema.max(800)
  })
  .strict()
  .superRefine((event, ctx) => {
    if (event.domain === "emotion" && event.privacy_level !== "campus_local_only") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["privacy_level"],
        message: "emotion-domain classroom runtime events must be campus_local_only"
      });
    }
  });

export const TeacherCheckpointSchema = z
  .object({
    checkpoint_type: TeacherCheckpointTypeSchema,
    teacher_prompt: NonEmptyStringSchema.max(1000),
    evidence_to_review: z.array(NonEmptyStringSchema.max(160)).max(30),
    decision_required: z.boolean()
  })
  .strict();

export const ClassroomActionSafetySchema = z
  .object({
    visibility_scope: ClassroomActionVisibilityScopeSchema,
    forbidden_payloads: z.array(NonEmptyStringSchema.max(160)).min(1).max(30),
    high_stakes_decision_allowed: z.literal(false),
    audit_required: z.boolean()
  })
  .strict()
  .superRefine((safety, ctx) => {
    const forbiddenPayloads = new Set(safety.forbidden_payloads.map((payload) => payload.toLowerCase()));
    for (const requiredPayload of ["raw_dialogue", "voice_transcript", "emotion_or_personal", "family_context"]) {
      if (!forbiddenPayloads.has(requiredPayload)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["forbidden_payloads"],
          message: `classroom action safety.forbidden_payloads must include ${requiredPayload}`
        });
      }
    }
  });

export const ClassroomActionSchema = z
  .object({
    action_id: UnitSpecIdSchema,
    start_min: z.number().min(0).max(600),
    end_min: z.number().min(0).max(600),
    phase: ClassroomActionPhaseSchema,
    trigger: ClassroomActionTriggerSchema,
    teacher_action: NonEmptyStringSchema.max(1200),
    student_action: NonEmptyStringSchema.max(1200),
    ai_action: NonEmptyStringSchema.max(1200),
    target_page_id: UnitSpecIdSchema.optional(),
    target_block_ids: z.array(UnitSpecIdSchema).max(80),
    target_knowledge_node_ids: z.array(UnitSpecIdSchema).min(1).max(60),
    runtime_event_suggestions: z.array(ClassroomRuntimeEventSuggestionSchema).max(30),
    teacher_checkpoint: TeacherCheckpointSchema,
    safety: ClassroomActionSafetySchema
  })
  .strict()
  .superRefine((action, ctx) => {
    if (action.end_min <= action.start_min) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_min"],
        message: "action end_min must be greater than start_min"
      });
    }
  });

export const ClassroomEvidencePlanSchema = z
  .object({
    evidence_ids: z.array(UnitSpecIdSchema).min(1).max(100),
    evidence_types: z.array(ClassroomEvidenceTypeSchema).min(1).max(20),
    mastery_update_allowed: z.boolean(),
    teacher_dashboard_projection: z.array(NonEmptyStringSchema.max(300)).min(1).max(50)
  })
  .strict();

export const ClassroomFallbackPlanSchema = z
  .object({
    provider_unavailable: ClassroomProviderUnavailableFallbackSchema,
    network_unavailable: ClassroomNetworkUnavailableFallbackSchema,
    voice_unavailable: ClassroomVoiceUnavailableFallbackSchema,
    whiteboard_unavailable: ClassroomWhiteboardUnavailableFallbackSchema
  })
  .strict();

export const ClassroomActionPlanSchema = z
  .object({
    schema_version: ClassroomActionPlanSchemaVersionSchema,
    plan_id: UnitSpecIdSchema,
    unit_id: UnitSpecIdSchema,
    lesson_duration_min: z.number().positive().max(600),
    teacher_control_policy: TeacherControlPolicySchema,
    actions: z.array(ClassroomActionSchema).min(1).max(120),
    evidence_plan: ClassroomEvidencePlanSchema,
    fallback_plan: ClassroomFallbackPlanSchema,
    source_trace: z.array(UnitSourceTraceSchema).min(1).max(80)
  })
  .strict()
  .superRefine((plan, ctx) => {
    plan.actions.forEach((action, index) => {
      if (action.end_min > plan.lesson_duration_min) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["actions", index, "end_min"],
          message: "action end_min cannot exceed lesson_duration_min"
        });
      }
    });
  });

export const ClassroomActionPlanListSchema = z.array(ClassroomActionPlanSchema).min(1).max(100);

export type TeacherControlPolicy = z.infer<typeof TeacherControlPolicySchema>;
export type ClassroomActionTrigger = z.infer<typeof ClassroomActionTriggerSchema>;
export type ClassroomRuntimeEventSuggestion = z.infer<typeof ClassroomRuntimeEventSuggestionSchema>;
export type TeacherCheckpoint = z.infer<typeof TeacherCheckpointSchema>;
export type ClassroomActionSafety = z.infer<typeof ClassroomActionSafetySchema>;
export type ClassroomAction = z.infer<typeof ClassroomActionSchema>;
export type ClassroomEvidencePlan = z.infer<typeof ClassroomEvidencePlanSchema>;
export type ClassroomFallbackPlan = z.infer<typeof ClassroomFallbackPlanSchema>;
export type ClassroomActionPlan = z.infer<typeof ClassroomActionPlanSchema>;
