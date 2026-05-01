import { z } from "zod";

import { NonEmptyStringSchema } from "../base";
import { UnitSourceTraceSchema, UnitSpecIdSchema } from "./ai-native-unit";

export const MisconceptionFeedbackRouteSchemaVersionSchema = z.literal("edu-ai-misconception-route-v0.1");

export const MisconceptionDetectionSignalSchema = z.enum([
  "selected_wrong_option",
  "free_text_pattern",
  "oral_explanation_pattern",
  "simulation_behavior",
  "no_ai_task_error",
  "teacher_marked"
]);

export const MisconceptionLowConfidenceBehaviorSchema = z.enum([
  "ask_clarifying_question",
  "route_to_teacher_review",
  "no_route"
]);

export const MisconceptionFeedbackStrategySchema = z.enum([
  "socratic_question",
  "contrast_cases",
  "counterexample",
  "visual_simulation",
  "worked_example_gap",
  "peer_explain",
  "teacher_checkpoint"
]);

export const MisconceptionRevealPolicySchema = z.enum([
  "do_not_reveal_answer_first",
  "hint_after_attempts",
  "teacher_mediated"
]);

export const MisconceptionAfterMaxRetrySchema = z.enum([
  "teacher_safe_signal",
  "different_representation",
  "no_ai_task"
]);

export const MisconceptionEvidenceTypeSchema = z.enum([
  "selected_choice",
  "short_explanation",
  "oral_summary",
  "simulation_trace",
  "no_ai_output",
  "teacher_observation"
]);

export const TeacherSafeMisconceptionSignalTypeSchema = z.enum([
  "misconception_cluster",
  "individual_learning_need",
  "no_ai_baseline_weakness"
]);

export const MisconceptionRawResponseRetentionSchema = z.enum([
  "none",
  "student_owned_only",
  "short_debug_window"
]);

export const MisconceptionInterventionLevelSchema = z.enum(["L1", "L2", "L3", "L4", "L5"]);
export const MisconceptionRawResponseAccessSchema = z.literal("denied");

export const MisconceptionDetectionRuleSchema = z
  .object({
    detection_signal: MisconceptionDetectionSignalSchema,
    pattern_description: NonEmptyStringSchema.max(1200),
    confidence_threshold: z.number().min(0).max(1),
    low_confidence_behavior: MisconceptionLowConfidenceBehaviorSchema
  })
  .strict();

export const MisconceptionFeedbackMoveSchema = z
  .object({
    feedback_strategy: MisconceptionFeedbackStrategySchema,
    student_facing_prompt: NonEmptyStringSchema.max(2000),
    reveal_policy: MisconceptionRevealPolicySchema,
    max_ai_hints: z.number().int().min(0).max(3)
  })
  .strict();

export const MisconceptionRetryPlanSchema = z
  .object({
    retry_block_id: UnitSpecIdSchema,
    retry_prompt: NonEmptyStringSchema.max(1200),
    no_ai_followup_task_id: UnitSpecIdSchema.optional(),
    max_retry_count: z.number().int().min(0).max(3),
    after_max_retry: MisconceptionAfterMaxRetrySchema
  })
  .strict();

export const MisconceptionEvidencePlanSchema = z
  .object({
    evidence_ids: z.array(UnitSpecIdSchema).min(1).max(30),
    evidence_types: z.array(MisconceptionEvidenceTypeSchema).min(1).max(10),
    mastery_update_allowed: z.boolean(),
    minimum_confidence_for_mastery_update: z.number().min(0).max(1)
  })
  .strict();

export const TeacherSafeMisconceptionSignalSchema = z
  .object({
    signal_type: TeacherSafeMisconceptionSignalTypeSchema,
    visible_summary_template: NonEmptyStringSchema.max(1000),
    blocked_raw_fields: z.array(NonEmptyStringSchema.max(160)).min(1).max(30),
    suggested_intervention_level: MisconceptionInterventionLevelSchema.optional()
  })
  .strict()
  .superRefine((signal, ctx) => {
    const blockedFields = new Set(signal.blocked_raw_fields.map((field) => field.toLowerCase()));
    for (const requiredField of ["raw_dialogue", "raw_response", "voice_transcript"]) {
      if (!blockedFields.has(requiredField)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["blocked_raw_fields"],
          message: `teacher_signal.blocked_raw_fields must include ${requiredField}`
        });
      }
    }
  });

export const MisconceptionPrivacyRuleSchema = z
  .object({
    student_visible: z.boolean(),
    teacher_visible: z.boolean(),
    guardian_visible: z.literal(false),
    raw_response_retention: MisconceptionRawResponseRetentionSchema,
    teacher_raw_response_access: MisconceptionRawResponseAccessSchema,
    guardian_raw_response_access: MisconceptionRawResponseAccessSchema
  })
  .strict();

export const MisconceptionFeedbackRouteSchema = z
  .object({
    route_id: UnitSpecIdSchema,
    schema_version: MisconceptionFeedbackRouteSchemaVersionSchema,
    unit_id: UnitSpecIdSchema,
    target_node_id: UnitSpecIdSchema,
    misconception_id: UnitSpecIdSchema,
    source_block_id: UnitSpecIdSchema,
    detection: MisconceptionDetectionRuleSchema,
    feedback: MisconceptionFeedbackMoveSchema,
    retry: MisconceptionRetryPlanSchema,
    evidence: MisconceptionEvidencePlanSchema,
    teacher_signal: TeacherSafeMisconceptionSignalSchema,
    privacy: MisconceptionPrivacyRuleSchema,
    source_trace: z.array(UnitSourceTraceSchema).min(1).max(40)
  })
  .strict()
  .superRefine((route, ctx) => {
    if (route.retry.after_max_retry === "no_ai_task" && !route.retry.no_ai_followup_task_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["retry", "no_ai_followup_task_id"],
        message: "after_max_retry=no_ai_task requires retry.no_ai_followup_task_id"
      });
    }

    if (route.evidence.mastery_update_allowed) {
      if (route.evidence.minimum_confidence_for_mastery_update < route.detection.confidence_threshold) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["evidence", "minimum_confidence_for_mastery_update"],
          message: "mastery updates require evidence confidence at least as high as the detection threshold"
        });
      }
      if (route.evidence.minimum_confidence_for_mastery_update < 0.7) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["evidence", "minimum_confidence_for_mastery_update"],
          message: "mastery updates require minimum confidence >= 0.7"
        });
      }
    }
  });

export const MisconceptionFeedbackRouteListSchema = z.array(MisconceptionFeedbackRouteSchema).min(1).max(200);

export type MisconceptionDetectionRule = z.infer<typeof MisconceptionDetectionRuleSchema>;
export type MisconceptionFeedbackMove = z.infer<typeof MisconceptionFeedbackMoveSchema>;
export type MisconceptionRetryPlan = z.infer<typeof MisconceptionRetryPlanSchema>;
export type MisconceptionEvidencePlan = z.infer<typeof MisconceptionEvidencePlanSchema>;
export type TeacherSafeMisconceptionSignal = z.infer<typeof TeacherSafeMisconceptionSignalSchema>;
export type MisconceptionPrivacyRule = z.infer<typeof MisconceptionPrivacyRuleSchema>;
export type MisconceptionFeedbackRoute = z.infer<typeof MisconceptionFeedbackRouteSchema>;
