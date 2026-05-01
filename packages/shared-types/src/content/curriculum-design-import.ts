import { z } from "zod";

import { IsoDateTimeSchema, NonEmptyStringSchema } from "../base";
import { Grade, Subject } from "../enums";
import { ConfidenceValueSchema, UnitSpecIdSchema } from "./ai-native-unit";

export const CurriculumImportSchemaVersionSchema = z.literal("edu-ai-curriculum-import-v0.1");
export const CurriculumImportReviewSchemaVersionSchema = z.literal("edu-ai-curriculum-import-review-v0.1");

export const CurriculumImportSourceTraceSchema = z
  .object({
    source_id: NonEmptyStringSchema.max(160),
    source_type: z.enum([
      "curriculum_standard",
      "textbook",
      "teacher_note",
      "pedagogy_library",
      "agent_output",
      "human_review",
      "source_material"
    ]),
    reference: NonEmptyStringSchema.max(1000),
    source_file: NonEmptyStringSchema.max(260).optional(),
    retrieved_at: IsoDateTimeSchema.optional()
  })
  .strict();

export const CurriculumUnitOverviewSchema = z
  .object({
    unit_id_suggestion: UnitSpecIdSchema,
    subject: z.nativeEnum(Subject),
    grade: z.nativeEnum(Grade),
    title: NonEmptyStringSchema.max(200),
    duration_hours: z.number().positive().max(100),
    source_textbook: NonEmptyStringSchema.max(200).optional(),
    source_chapter: NonEmptyStringSchema.max(200).optional(),
    standard_alignment: z
      .array(
        z
          .object({
            standard_system: NonEmptyStringSchema.max(200),
            standard_code: NonEmptyStringSchema.max(120).optional(),
            description: NonEmptyStringSchema.max(1000),
            confidence: ConfidenceValueSchema,
            needs_human_verification: z.boolean()
          })
          .strict()
      )
      .min(1)
      .max(50),
    ai_native_big_question: NonEmptyStringSchema.max(500),
    knowledge_goals: z.array(NonEmptyStringSchema.max(500)).min(1).max(80),
    capability_goals: z.array(NonEmptyStringSchema.max(500)).min(1).max(80),
    student_experience_thesis: NonEmptyStringSchema.max(1000),
    teacher_teaching_thesis: NonEmptyStringSchema.max(1000),
    no_ai_principles: z.array(NonEmptyStringSchema.max(500)).min(1).max(30)
  })
  .strict();

export const StudentPageTypeSchema = z.enum([
  "scenario_entry",
  "observation_discovery",
  "concept_construction",
  "interactive_simulation",
  "character_dialogue",
  "misconception_challenge",
  "no_ai_baseline",
  "transfer_application",
  "reflection_review",
  "portfolio_output"
]);

export const StudentBlockDraftTypeSchema = z.enum([
  "story_scene",
  "character_dialogue",
  "socratic_prompt",
  "student_prediction",
  "interactive_simulation",
  "concept_graph",
  "worked_example_challenge",
  "misconception_probe",
  "misconception_feedback_route",
  "voice_dialogue",
  "whiteboard_action",
  "pbl_issueboard",
  "no_ai_task",
  "peer_discussion",
  "oral_explanation",
  "reflection_card",
  "teacher_checkpoint",
  "portfolio_output"
]);

export const StudentBlockDraftSchema = z
  .object({
    block_id: UnitSpecIdSchema,
    block_type: StudentBlockDraftTypeSchema,
    target_knowledge_nodes: z.array(UnitSpecIdSchema).min(1).max(30),
    student_action: NonEmptyStringSchema.max(1200),
    ai_role: NonEmptyStringSchema.max(500),
    ai_prompt_draft: NonEmptyStringSchema.max(2000).optional(),
    voice_or_text: z.enum(["text", "voice", "either", "none"]),
    whiteboard_or_simulation: NonEmptyStringSchema.max(1000).optional(),
    no_ai_boundary: NonEmptyStringSchema.max(1000),
    output_evidence: z.array(NonEmptyStringSchema.max(300)).min(1).max(30),
    teacher_visible_signal: z.array(NonEmptyStringSchema.max(300)).max(30),
    privacy_boundary: z.array(NonEmptyStringSchema.max(500)).min(1).max(30),
    assessment_hook: NonEmptyStringSchema.max(300).optional(),
    source_trace: z.array(CurriculumImportSourceTraceSchema).min(1).max(20)
  })
  .strict();

export const StudentPageDraftSchema = z
  .object({
    page_id: UnitSpecIdSchema,
    page_title: NonEmptyStringSchema.max(200),
    page_type: StudentPageTypeSchema,
    learning_goal: NonEmptyStringSchema.max(500),
    student_experience: NonEmptyStringSchema.max(1000),
    teacher_purpose: NonEmptyStringSchema.max(1000),
    blocks: z.array(StudentBlockDraftSchema).min(1).max(80)
  })
  .strict();

export const StudentMaterialDesignSchema = z
  .object({
    pages: z.array(StudentPageDraftSchema).min(1).max(120)
  })
  .strict();

export const InterventionLadderDraftSchema = z
  .object({
    level: z.enum(["L1", "L2", "L3", "L4", "L5"]),
    trigger: NonEmptyStringSchema.max(800),
    teacher_action: NonEmptyStringSchema.max(800),
    verification: NonEmptyStringSchema.max(800),
    close_condition: NonEmptyStringSchema.max(800)
  })
  .strict();

export const TeacherPlanDesignSchema = z
  .object({
    pre_class_setup: z.array(NonEmptyStringSchema.max(500)).min(1).max(30),
    opening_moves: z.array(NonEmptyStringSchema.max(500)).min(1).max(30),
    key_concept_explanations: z.array(NonEmptyStringSchema.max(800)).min(1).max(50),
    ai_interaction_plan: z.array(NonEmptyStringSchema.max(800)).min(1).max(50),
    peer_discussion_plan: z.array(NonEmptyStringSchema.max(800)).max(50),
    no_ai_verification_plan: z.array(NonEmptyStringSchema.max(800)).min(1).max(50),
    board_or_whiteboard_plan: z.array(NonEmptyStringSchema.max(800)).max(50),
    teacher_observation_points: z.array(NonEmptyStringSchema.max(800)).min(1).max(50),
    expected_heatmap_patterns: z.array(NonEmptyStringSchema.max(800)).max(50),
    intervention_ladder: z.array(InterventionLadderDraftSchema).min(1).max(5),
    after_class_tasks: z.array(NonEmptyStringSchema.max(800)).max(50),
    next_lesson_bridge: z.array(NonEmptyStringSchema.max(800)).max(20)
  })
  .strict();

export const RuntimeEventSuggestionDraftSchema = z
  .object({
    event_type: z.enum([
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
    ]),
    domain: z.enum(["academic", "content", "runtime", "emotion", "system"]),
    privacy_level: z.enum(["public", "academic", "student_sensitive", "campus_local_only"]),
    safe_summary: NonEmptyStringSchema.max(800)
  })
  .strict();

export const ClassroomRuntimeStepDraftSchema = z
  .object({
    step_id: UnitSpecIdSchema,
    start_min: z.number().min(0).max(600),
    end_min: z.number().min(0).max(600),
    phase: z.enum([
      "scenario_wakeup",
      "teacher_framing",
      "ai_exploration",
      "peer_discussion",
      "no_ai_baseline",
      "teacher_synthesis",
      "reflection_trace",
      "extension"
    ]),
    teacher_action: NonEmptyStringSchema.max(1000),
    student_action: NonEmptyStringSchema.max(1000),
    ai_action: NonEmptyStringSchema.max(1000),
    evidence_created: z.array(NonEmptyStringSchema.max(300)).min(1).max(30),
    runtime_event_suggestions: z.array(RuntimeEventSuggestionDraftSchema).max(20)
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.end_min <= value.start_min) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["end_min"],
        message: "end_min must be greater than start_min"
      });
    }
  });

export const ClassroomRuntimeScriptSchema = z
  .object({
    duration_min: z.number().positive().max(600),
    steps: z.array(ClassroomRuntimeStepDraftSchema).min(1).max(80)
  })
  .strict();

export const AiInteractionScriptDraftSchema = z
  .object({
    script_id: UnitSpecIdSchema,
    role_type: z.enum([
      "student_agent",
      "character_agent",
      "challenger_agent",
      "simulation_agent",
      "reflection_coach",
      "teacher_summary_agent"
    ]),
    target_knowledge_nodes: z.array(UnitSpecIdSchema).min(1).max(30),
    role_positioning: NonEmptyStringSchema.max(1000),
    hard_no: z.array(NonEmptyStringSchema.max(500)).min(1).max(30),
    opening_move: NonEmptyStringSchema.max(1000),
    follow_up_strategy: z.array(NonEmptyStringSchema.max(800)).min(1).max(30),
    hint_policy: NonEmptyStringSchema.max(800),
    no_ai_transition_rule: NonEmptyStringSchema.max(800),
    source_trace_required: z.boolean()
  })
  .strict();

export const LearningTaskDraftSchema = z
  .object({
    task_id: UnitSpecIdSchema,
    task_type: z.enum([
      "exploration_task",
      "practice_task",
      "transfer_challenge",
      "correction_task",
      "portfolio_task",
      "no_ai_baseline_task",
      "ai_collaboration_task"
    ]),
    purpose: NonEmptyStringSchema.max(1000),
    student_submission: z.array(NonEmptyStringSchema.max(500)).min(1).max(30),
    ai_allowed: z.boolean(),
    target_knowledge_nodes: z.array(UnitSpecIdSchema).min(1).max(30),
    evaluation_criteria: z.array(NonEmptyStringSchema.max(500)).min(1).max(30),
    teacher_visible_signal: z.array(NonEmptyStringSchema.max(300)).max(30),
    privacy_boundary: z.array(NonEmptyStringSchema.max(500)).min(1).max(30)
  })
  .strict();

export const CapabilityCertificationDraftSchema = z
  .object({
    certification_id: UnitSpecIdSchema,
    certification_type: z.enum([
      "no_ai_baseline",
      "transfer_challenge",
      "oral_explanation",
      "process_evidence",
      "portfolio",
      "ai_collaboration"
    ]),
    capability_goal: NonEmptyStringSchema.max(1000),
    evidence_required: z.array(NonEmptyStringSchema.max(500)).min(1).max(30),
    pass_criteria: z.array(NonEmptyStringSchema.max(500)).min(1).max(30),
    human_review_required: z.boolean(),
    target_knowledge_nodes: z.array(UnitSpecIdSchema).min(1).max(30)
  })
  .strict();

export const TeacherDashboardSignalDraftSchema = z
  .object({
    signal_id: UnitSpecIdSchema,
    signal_type: z.enum([
      "knowledge_heat",
      "misconception_cluster",
      "no_ai_baseline_weakness",
      "question_quality",
      "reflection_quality",
      "transfer_readiness",
      "ai_dependency_risk",
      "intervention_suggestion"
    ]),
    source_evidence: z.array(NonEmptyStringSchema.max(300)).min(1).max(30),
    visible_summary: NonEmptyStringSchema.max(1000),
    blocked_raw_fields: z.array(NonEmptyStringSchema.max(160)).min(1).max(30),
    suggested_intervention_level: z.enum(["L1", "L2", "L3", "L4", "L5"]).optional()
  })
  .strict();

export const PrivacyBoundaryDraftSchema = z
  .object({
    boundary_id: UnitSpecIdSchema,
    data_class: z.enum([
      "academic_response",
      "raw_dialogue",
      "voice_audio",
      "voice_transcript",
      "emotion_or_personal",
      "family_context",
      "teacher_private_note",
      "model_internal"
    ]),
    student_visible: z.boolean(),
    teacher_visible: z.boolean(),
    guardian_visible: z.boolean(),
    admin_audit_visible: z.boolean(),
    retention_note: NonEmptyStringSchema.max(1000),
    projection_rule: NonEmptyStringSchema.max(1000)
  })
  .strict();

export const UnitRuntimeContractPageDraftSchema = z
  .object({
    page_id: UnitSpecIdSchema,
    block_ids: z.array(UnitSpecIdSchema).max(120),
    target_knowledge_nodes: z.array(UnitSpecIdSchema).max(60)
  })
  .strict();

export const UnitRuntimeContractDraftSchema = z
  .object({
    unit_id: UnitSpecIdSchema,
    pages: z.array(UnitRuntimeContractPageDraftSchema).max(120)
  })
  .strict();

export const CurriculumRiskDraftSchema = z
  .object({
    risk_id: UnitSpecIdSchema,
    risk: NonEmptyStringSchema.max(1000),
    mitigation: NonEmptyStringSchema.max(1000)
  })
  .strict();

export const CurriculumDesignImportDraftSchema = z
  .object({
    schema_version: CurriculumImportSchemaVersionSchema,
    import_id: UnitSpecIdSchema,
    created_at: IsoDateTimeSchema,
    source_conversation: z
      .object({
        conversation_id: UnitSpecIdSchema.optional(),
        author: z.enum(["human", "ai_assistant", "mixed"]),
        source_file: NonEmptyStringSchema.max(260).optional(),
        source_material_summary: NonEmptyStringSchema.max(1500)
      })
      .strict(),
    unit_overview: CurriculumUnitOverviewSchema,
    student_material: StudentMaterialDesignSchema,
    teacher_plan: TeacherPlanDesignSchema,
    classroom_script: ClassroomRuntimeScriptSchema,
    ai_interaction_scripts: z.array(AiInteractionScriptDraftSchema).min(1).max(100),
    learning_tasks: z.array(LearningTaskDraftSchema).min(1).max(200),
    capability_certifications: z.array(CapabilityCertificationDraftSchema).min(1).max(100),
    teacher_dashboard_signals: z.array(TeacherDashboardSignalDraftSchema).min(1).max(100),
    privacy_boundaries: z.array(PrivacyBoundaryDraftSchema).min(1).max(50),
    runtime_contract: UnitRuntimeContractDraftSchema,
    risks: z.array(CurriculumRiskDraftSchema).max(100),
    source_trace: z.array(CurriculumImportSourceTraceSchema).min(1).max(80)
  })
  .strict();

export const CurriculumImportIssueSchema = z
  .object({
    issue_id: UnitSpecIdSchema,
    severity: z.enum(["low", "medium", "high", "blocking"]),
    owner: z.enum([
      "curriculum_designer",
      "subject_expert",
      "pedagogy_designer",
      "engineering_agent",
      "qa_agent",
      "human_reviewer"
    ]),
    message: NonEmptyStringSchema.max(1000),
    repair_hint: NonEmptyStringSchema.max(1000)
  })
  .strict();

export const CurriculumImportReviewArtifactSchema = z
  .object({
    artifact_id: UnitSpecIdSchema,
    schema_version: CurriculumImportReviewSchemaVersionSchema,
    source_import_id: UnitSpecIdSchema,
    target_unit_id: UnitSpecIdSchema,
    status: z.enum(["passed", "blocked", "needs_human_review"]),
    candidate_patches: z
      .array(
        z
          .object({
            section: z.enum([
              "metadata",
              "knowledge",
              "pedagogy",
              "narrative",
              "implementation",
              "runtime_content",
              "assessment",
              "quality"
            ]),
            patch: z.unknown(),
            validation_status: z.enum(["passed", "blocked", "needs_human_review"]),
            issues: z.array(CurriculumImportIssueSchema).max(100)
          })
          .strict()
      )
      .max(20),
    future_extensions: z
      .array(
        z
          .object({
            extension_key: z.enum([
              "misconception_feedback_routes",
              "classroom_action_plan",
              "voice_script",
              "whiteboard_action_plan",
              "pbl_issueboard",
              "learning_task_evidence_plan",
              "content_package_manifest"
            ]),
            source_reference: NonEmptyStringSchema.max(500),
            reason_not_applied: NonEmptyStringSchema.max(1000)
          })
          .strict()
      )
      .max(100),
    validation_summary: z
      .object({
        shape_gate: z.enum(["passed", "blocked"]),
        curriculum_gate: z.enum(["passed", "blocked", "needs_human_review"]),
        pedagogy_gate: z.enum(["passed", "blocked", "needs_human_review"]),
        runtime_gate: z.enum(["passed", "blocked", "needs_human_review"]),
        governance_gate: z.enum(["passed", "blocked"])
      })
      .strict(),
    approval_required: z.boolean(),
    apply_allowed: z.boolean()
  })
  .strict()
  .superRefine((artifact, ctx) => {
    if (artifact.status === "blocked" && artifact.apply_allowed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["apply_allowed"],
        message: "blocked curriculum import review artifacts cannot be applied"
      });
    }
    if (artifact.status === "needs_human_review" && artifact.apply_allowed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["apply_allowed"],
        message: "curriculum import review artifacts requiring human review cannot be auto-applied"
      });
    }
  });

export type CurriculumImportSourceTrace = z.infer<typeof CurriculumImportSourceTraceSchema>;
export type CurriculumUnitOverview = z.infer<typeof CurriculumUnitOverviewSchema>;
export type StudentMaterialDesign = z.infer<typeof StudentMaterialDesignSchema>;
export type StudentPageDraft = z.infer<typeof StudentPageDraftSchema>;
export type StudentBlockDraft = z.infer<typeof StudentBlockDraftSchema>;
export type TeacherPlanDesign = z.infer<typeof TeacherPlanDesignSchema>;
export type ClassroomRuntimeScript = z.infer<typeof ClassroomRuntimeScriptSchema>;
export type RuntimeEventSuggestionDraft = z.infer<typeof RuntimeEventSuggestionDraftSchema>;
export type AiInteractionScriptDraft = z.infer<typeof AiInteractionScriptDraftSchema>;
export type LearningTaskDraft = z.infer<typeof LearningTaskDraftSchema>;
export type CapabilityCertificationDraft = z.infer<typeof CapabilityCertificationDraftSchema>;
export type TeacherDashboardSignalDraft = z.infer<typeof TeacherDashboardSignalDraftSchema>;
export type PrivacyBoundaryDraft = z.infer<typeof PrivacyBoundaryDraftSchema>;
export type UnitRuntimeContractDraft = z.infer<typeof UnitRuntimeContractDraftSchema>;
export type CurriculumRiskDraft = z.infer<typeof CurriculumRiskDraftSchema>;
export type CurriculumDesignImportDraft = z.infer<typeof CurriculumDesignImportDraftSchema>;
export type CurriculumImportIssue = z.infer<typeof CurriculumImportIssueSchema>;
export type CurriculumImportReviewArtifact = z.infer<typeof CurriculumImportReviewArtifactSchema>;
