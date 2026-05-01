import { z } from "zod";

import { NonEmptyStringSchema, VisibilityScopeSchema } from "../base";
import { AgentMode, AssessmentItemType, Grade, PedagogyType, PrivacyLevel, Subject, UserRole } from "../enums";
import { StandardAlignmentSchema } from "./unit";

export const UnitSpecIdSchema = NonEmptyStringSchema.regex(/^[a-z0-9][a-z0-9_-]*$/).max(120);
export const ConfidenceValueSchema = z.number().min(0).max(1);

export const UnitSourceTraceSchema = z
  .object({
    source_id: NonEmptyStringSchema.max(160),
    source_type: z.enum(["curriculum_standard", "textbook", "teacher_note", "pedagogy_library", "agent_output", "human_review"]),
    reference: NonEmptyStringSchema.max(1000),
    retrieved_at: z.string().datetime()
  })
  .strict();

export const GeneratedSectionMetaSchema = z
  .object({
    author_agent: z.enum([
      "subject_expert",
      "pedagogy_designer",
      "narrative_designer",
      "engineering_agent",
      "assessment_designer",
      "qa_agent"
    ]),
    confidence_score: ConfidenceValueSchema,
    source_trace: z.array(UnitSourceTraceSchema).min(1).max(80)
  })
  .strict();

export const UnitSpecMetadataSchema = z
  .object({
    unit_id: UnitSpecIdSchema,
    subject: z.nativeEnum(Subject),
    grade: z.nativeEnum(Grade),
    title: NonEmptyStringSchema.max(200),
    duration_hours: z.number().positive().max(100),
    standard_alignment: z.array(StandardAlignmentSchema).min(1).max(50),
    prerequisites: z.array(UnitSpecIdSchema).max(100)
  })
  .strict();

export const UnitSpecKnowledgeNodeSchema = z
  .object({
    node_id: UnitSpecIdSchema,
    title: NonEmptyStringSchema.max(200),
    mastery_criteria: z.array(NonEmptyStringSchema.max(500)).min(1).max(20),
    misconceptions: z.array(NonEmptyStringSchema.max(500)).max(20),
    difficulty: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
  })
  .strict();

export const UnitSpecKnowledgeEdgeSchema = z
  .object({
    from_node_id: UnitSpecIdSchema,
    to_node_id: UnitSpecIdSchema,
    relation: z.enum(["prerequisite", "supports", "contrasts", "extends"])
  })
  .strict();

export const UnitSpecKnowledgeSchema = z
  .object({
    meta: GeneratedSectionMetaSchema,
    nodes: z.array(UnitSpecKnowledgeNodeSchema).min(1).max(200),
    edges: z.array(UnitSpecKnowledgeEdgeSchema).max(400),
    global_misconceptions: z.array(NonEmptyStringSchema.max(800)).max(50)
  })
  .strict();

export const UnitSpecLearningActivitySchema = z
  .object({
    activity_id: UnitSpecIdSchema,
    type: z.nativeEnum(PedagogyType),
    target_nodes: z.array(UnitSpecIdSchema).min(1).max(30),
    duration_min: z.number().int().positive().max(240),
    rationale: NonEmptyStringSchema.max(1000)
  })
  .strict();

export const UnitSpecPedagogySchema = z
  .object({
    meta: GeneratedSectionMetaSchema,
    learning_path: z.array(UnitSpecIdSchema).min(1).max(100),
    activities: z.array(UnitSpecLearningActivitySchema).min(1).max(100),
    cognitive_load_estimate: z.enum(["low", "medium", "high"]),
    differentiation_notes: z.array(NonEmptyStringSchema.max(800)).max(50)
  })
  .strict();

export const UnitSpecScenarioSchema = z
  .object({
    scenario_id: UnitSpecIdSchema,
    title: NonEmptyStringSchema.max(200),
    target_nodes: z.array(UnitSpecIdSchema).min(1).max(30),
    setup: NonEmptyStringSchema.max(3000)
  })
  .strict();

export const UnitSpecCharacterSchema = z
  .object({
    character_id: UnitSpecIdSchema,
    name: NonEmptyStringSchema.max(80),
    role: NonEmptyStringSchema.max(200),
    voice_notes: NonEmptyStringSchema.max(800)
  })
  .strict();

export const UnitSpecDialogueScriptSchema = z
  .object({
    script_id: UnitSpecIdSchema,
    mode: z.nativeEnum(AgentMode),
    target_nodes: z.array(UnitSpecIdSchema).min(1).max(30),
    opening_move: NonEmptyStringSchema.max(1000),
    boundary_notes: z.array(NonEmptyStringSchema.max(800)).max(20)
  })
  .strict();

export const UnitSpecNarrativeSchema = z
  .object({
    meta: GeneratedSectionMetaSchema,
    scenarios: z.array(UnitSpecScenarioSchema).min(1).max(50),
    characters: z.array(UnitSpecCharacterSchema).max(50),
    dialogue_scripts: z.array(UnitSpecDialogueScriptSchema).min(1).max(100),
    gamification: z.array(NonEmptyStringSchema.max(800)).max(30)
  })
  .strict();

export const UnitSpecPromptAssetSchema = z
  .object({
    prompt_id: UnitSpecIdSchema,
    purpose: z.enum(["student_dialogue", "teacher_daily_report", "assessment_feedback", "content_generation"]),
    version: NonEmptyStringSchema.max(80),
    target_nodes: z.array(UnitSpecIdSchema).max(30)
  })
  .strict();

export const UnitSpecDataHookSchema = z
  .object({
    hook_id: UnitSpecIdSchema,
    event_type: NonEmptyStringSchema.max(120),
    target_nodes: z.array(UnitSpecIdSchema).max(30),
    privacy_note: NonEmptyStringSchema.max(800)
  })
  .strict();

export const UnitSpecImplementationSchema = z
  .object({
    meta: GeneratedSectionMetaSchema,
    components: z.array(NonEmptyStringSchema.max(160)).min(1).max(100),
    prompts: z.array(UnitSpecPromptAssetSchema).min(1).max(100),
    data_hooks: z.array(UnitSpecDataHookSchema).min(1).max(100)
  })
  .strict();

export const UnitBlockTypeSchema = z.enum([
  "text",
  "callout",
  "quiz",
  "flash_cards",
  "concept_graph",
  "figure",
  "interactive",
  "animation",
  "timeline",
  "practice",
  "reflection",
  "code"
]);

export const UnitBlockStatusSchema = z.enum(["pending", "ready", "needs_review", "hidden"]);

export const UnitSourceAnchorSchema = UnitSourceTraceSchema.extend({
  snippet: NonEmptyStringSchema.max(500).optional()
}).strict();

export const UnitBlockSandboxSchema = z
  .object({
    required: z.boolean(),
    runtime: z.enum(["none", "static", "iframe", "worker", "server_rendered"]),
    allowed_capabilities: z.array(NonEmptyStringSchema.max(80)).max(20)
  })
  .strict();

export const UnitBlockSchema = z
  .object({
    block_id: UnitSpecIdSchema,
    type: UnitBlockTypeSchema,
    status: UnitBlockStatusSchema,
    title: NonEmptyStringSchema.max(200),
    order: z.number().int().nonnegative(),
    target_nodes: z.array(UnitSpecIdSchema).min(1).max(30),
    visibility_scope: VisibilityScopeSchema,
    privacy_level: z.nativeEnum(PrivacyLevel),
    confidence_score: ConfidenceValueSchema,
    source_trace: z.array(UnitSourceAnchorSchema).min(1).max(40),
    sandbox: UnitBlockSandboxSchema,
    payload: z.record(z.string(), z.unknown())
  })
  .strict();

export const UnitPageSchema = z
  .object({
    page_id: UnitSpecIdSchema,
    title: NonEmptyStringSchema.max(200),
    order: z.number().int().nonnegative(),
    target_nodes: z.array(UnitSpecIdSchema).min(1).max(30),
    blocks: z.array(UnitBlockSchema).min(1).max(80)
  })
  .strict();

export const RuntimeContentSectionSchema = z
  .object({
    meta: GeneratedSectionMetaSchema,
    pages: z.array(UnitPageSchema).min(1).max(120),
    default_visible_to_roles: z.array(z.nativeEnum(UserRole)).min(1).max(5)
  })
  .strict();

export const UnitSpecAssessmentItemSchema = z
  .object({
    item_id: UnitSpecIdSchema,
    type: z.nativeEnum(AssessmentItemType),
    target_nodes: z.array(UnitSpecIdSchema).min(1).max(30),
    prompt: NonEmptyStringSchema.max(3000),
    expected_signal: NonEmptyStringSchema.max(1000),
    requires_human_review: z.boolean()
  })
  .strict();

export const UnitSpecAssessmentSchema = z
  .object({
    meta: GeneratedSectionMetaSchema,
    items: z.array(UnitSpecAssessmentItemSchema).min(1).max(200),
    min_confidence_threshold: ConfidenceValueSchema
  })
  .strict();

export const UnitSpecQualityIssueSchema = z
  .object({
    issue_id: UnitSpecIdSchema,
    severity: z.enum(["low", "medium", "high", "blocking"]),
    owner_agent: z.enum([
      "subject_expert",
      "pedagogy_designer",
      "narrative_designer",
      "engineering_agent",
      "assessment_designer",
      "qa_agent"
    ]),
    description: NonEmptyStringSchema.max(1000),
    status: z.enum(["open", "resolved", "waived"])
  })
  .strict();

export const UnitSpecQualitySchema = z
  .object({
    meta: GeneratedSectionMetaSchema,
    checklist_pass: z.boolean(),
    issues: z.array(UnitSpecQualityIssueSchema).max(200),
    reviewer_notes: z.array(NonEmptyStringSchema.max(1000)).max(100)
  })
  .strict();

export const AiNativeUnitSpecSchema = z
  .object({
    schema_version: z.literal("ai-native-unit-v0.1"),
    metadata: UnitSpecMetadataSchema,
    knowledge: UnitSpecKnowledgeSchema,
    pedagogy: UnitSpecPedagogySchema,
    narrative: UnitSpecNarrativeSchema,
    implementation: UnitSpecImplementationSchema,
    runtime_content: RuntimeContentSectionSchema,
    assessment: UnitSpecAssessmentSchema,
    quality: UnitSpecQualitySchema
  })
  .strict();

export type UnitSourceTrace = z.infer<typeof UnitSourceTraceSchema>;
export type UnitSourceAnchor = z.infer<typeof UnitSourceAnchorSchema>;
export type GeneratedSectionMeta = z.infer<typeof GeneratedSectionMetaSchema>;
export type UnitBlockType = z.infer<typeof UnitBlockTypeSchema>;
export type UnitBlockStatus = z.infer<typeof UnitBlockStatusSchema>;
export type UnitBlock = z.infer<typeof UnitBlockSchema>;
export type UnitPage = z.infer<typeof UnitPageSchema>;
export type RuntimeContentSection = z.infer<typeof RuntimeContentSectionSchema>;
export type AiNativeUnitSpec = z.infer<typeof AiNativeUnitSpecSchema>;
