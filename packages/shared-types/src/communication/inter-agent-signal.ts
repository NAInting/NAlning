import { z } from "zod";

import { BaseEntitySchema, IsoDateTimeSchema, NonEmptyStringSchema } from "../base";
import {
  HelpTopicCategory,
  InterAgentSignalType,
  InterventionActionCode,
  InterventionReasonCode,
  MilestoneDisplayCode,
  MilestoneType,
  RecommendedResponder,
  RiskCategory,
  SeverityLevel,
  SignalUrgency,
  TargetAgentType,
  TrendDirection
} from "../enums";

/**
 * 掌握度更新信号载荷。
 */
export interface MasteryUpdatePayload {
  student_id: string;
  knowledge_node_id: string;
  previous_mastery: number;
  current_mastery: number;
  confidence: number;
  evidence_count: number;
  trend: TrendDirection;
}

/**
 * 掌握度更新信号载荷 schema。
 */
export const MasteryUpdatePayloadSchema = z
  .object({
    student_id: z.string().uuid(),
    knowledge_node_id: z.string().uuid(),
    previous_mastery: z.number().min(0).max(1),
    current_mastery: z.number().min(0).max(1),
    confidence: z.number().min(0).max(1),
    evidence_count: z.number().int().nonnegative(),
    trend: z.nativeEnum(TrendDirection)
  })
  .strict();

/**
 * 参与度变化信号载荷。
 */
export interface EngagementChangePayload {
  student_id: string;
  trend: TrendDirection;
  duration_days: number;
  severity: SeverityLevel.MILD | SeverityLevel.MODERATE | SeverityLevel.SEVERE;
}

/**
 * 参与度变化信号载荷 schema。
 */
export const EngagementChangePayloadSchema = z
  .object({
    student_id: z.string().uuid(),
    trend: z.nativeEnum(TrendDirection),
    duration_days: z.number().int().positive(),
    severity: z.union([
      z.literal(SeverityLevel.MILD),
      z.literal(SeverityLevel.MODERATE),
      z.literal(SeverityLevel.SEVERE)
    ])
  })
  .strict();

/**
 * 情绪异常信号载荷。
 */
export interface EmotionAnomalyPayload {
  student_id: string;
  severity: SeverityLevel.LOW | SeverityLevel.MEDIUM | SeverityLevel.HIGH;
  suggested_action: "observe" | "gentle_check_in" | "escalate_to_counselor";
  detected_at: string;
}

/**
 * 情绪异常信号载荷 schema。
 */
export const EmotionAnomalyPayloadSchema = z
  .object({
    student_id: z.string().uuid(),
    severity: z.union([
      z.literal(SeverityLevel.LOW),
      z.literal(SeverityLevel.MEDIUM),
      z.literal(SeverityLevel.HIGH)
    ]),
    suggested_action: z.union([
      z.literal("observe"),
      z.literal("gentle_check_in"),
      z.literal("escalate_to_counselor")
    ]),
    detected_at: IsoDateTimeSchema
  })
  .strict();

/**
 * 求助信号载荷。
 */
export interface HelpRequestSignalPayload {
  student_id: string;
  topic_category: HelpTopicCategory;
  urgency: SignalUrgency.LOW | SignalUrgency.MEDIUM | SignalUrgency.HIGH;
  recommended_responder: RecommendedResponder;
}

/**
 * 求助信号载荷 schema。
 */
export const HelpRequestSignalPayloadSchema = z
  .object({
    student_id: z.string().uuid(),
    topic_category: z.nativeEnum(HelpTopicCategory),
    urgency: z.union([
      z.literal(SignalUrgency.LOW),
      z.literal(SignalUrgency.MEDIUM),
      z.literal(SignalUrgency.HIGH)
    ]),
    recommended_responder: z.nativeEnum(RecommendedResponder)
  })
  .strict();

/**
 * 建议干预信号载荷。
 */
export interface InterventionSuggestedPayload {
  student_id: string;
  intervention_type: string;
  reason_codes: InterventionReasonCode[];
  evidence_signal_ids: string[];
  suggested_action_codes: InterventionActionCode[];
}

/**
 * 建议干预信号载荷 schema。
 */
export const InterventionSuggestedPayloadSchema = z
  .object({
    student_id: z.string().uuid(),
    intervention_type: NonEmptyStringSchema.max(120),
    reason_codes: z.array(z.nativeEnum(InterventionReasonCode)).min(1).max(20),
    evidence_signal_ids: z.array(z.string().uuid()).max(100),
    suggested_action_codes: z.array(z.nativeEnum(InterventionActionCode)).min(1).max(20)
  })
  .strict();

/**
 * 里程碑达成信号载荷。
 */
export interface MilestoneReachedPayload {
  student_id: string;
  milestone_type: MilestoneType;
  display_code: MilestoneDisplayCode;
  celebrate: boolean;
}

/**
 * 里程碑达成信号载荷 schema。
 */
export const MilestoneReachedPayloadSchema = z
  .object({
    student_id: z.string().uuid(),
    milestone_type: z.nativeEnum(MilestoneType),
    display_code: z.nativeEnum(MilestoneDisplayCode),
    celebrate: z.boolean()
  })
  .strict();

/**
 * 风险告警信号载荷。
 */
export interface RiskAlertPayload {
  student_id: string;
  risk_category: RiskCategory;
  severity: SignalUrgency.MEDIUM | SignalUrgency.HIGH | SignalUrgency.CRITICAL;
  requires_immediate_action: boolean;
  escalation_path: string[];
}

/**
 * 风险告警信号载荷 schema。
 */
export const RiskAlertPayloadSchema = z
  .object({
    student_id: z.string().uuid(),
    risk_category: z.nativeEnum(RiskCategory),
    severity: z.union([
      z.literal(SignalUrgency.MEDIUM),
      z.literal(SignalUrgency.HIGH),
      z.literal(SignalUrgency.CRITICAL)
    ]),
    requires_immediate_action: z.boolean(),
    escalation_path: z.array(NonEmptyStringSchema.max(120)).min(1).max(20)
  })
  .strict();

/**
 * Agent 间信号载荷联合。
 */
export type InterAgentSignalPayload =
  | MasteryUpdatePayload
  | EngagementChangePayload
  | EmotionAnomalyPayload
  | HelpRequestSignalPayload
  | InterventionSuggestedPayload
  | MilestoneReachedPayload
  | RiskAlertPayload;

/**
 * Agent 间信号载荷联合 schema。
 */
export const InterAgentSignalPayloadSchema = z.union([
  MasteryUpdatePayloadSchema,
  EngagementChangePayloadSchema,
  EmotionAnomalyPayloadSchema,
  HelpRequestSignalPayloadSchema,
  InterventionSuggestedPayloadSchema,
  MilestoneReachedPayloadSchema,
  RiskAlertPayloadSchema
]);

/**
 * Agent 间信号实体。
 */
export interface InterAgentSignal {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  source_agent_id: string;
  source_agent_type: "student_agent";
  source_student_id: string;
  target_agent_type: TargetAgentType;
  target_agent_id: string;
  signal_type: InterAgentSignalType;
  payload: InterAgentSignalPayload;
  privacy_filter_passed: boolean;
  privacy_filter_version: string;
  urgency: SignalUrgency;
  delivered_at?: string;
  acknowledged_at?: string;
  acted_upon_at?: string;
  audit_log_id: string;
}

const FORBIDDEN_SIGNAL_KEYS = new Set([
  "content",
  "conversation_text",
  "conversation_excerpt",
  "raw_text",
  "full_transcript",
  "transcript",
  "student_response",
  "agent_response",
  "rationale_summary",
  "suggested_actions",
  "description"
]);

function hasForbiddenSignalKeys(input: unknown): boolean {
  if (Array.isArray(input)) {
    return input.some((item) => hasForbiddenSignalKeys(item));
  }

  if (!input || typeof input !== "object") {
    return false;
  }

  return Object.entries(input as Record<string, unknown>).some(([key, value]) => {
    if (FORBIDDEN_SIGNAL_KEYS.has(key)) {
      return true;
    }

    return hasForbiddenSignalKeys(value);
  });
}

/**
 * Agent 间信号实体 schema。
 */
export const InterAgentSignalSchema = BaseEntitySchema.extend({
  source_agent_id: z.string().uuid(),
  source_agent_type: z.literal("student_agent"),
  source_student_id: z.string().uuid(),
  target_agent_type: z.nativeEnum(TargetAgentType),
  target_agent_id: z.string().uuid(),
  signal_type: z.nativeEnum(InterAgentSignalType),
  payload: InterAgentSignalPayloadSchema,
  privacy_filter_passed: z.boolean(),
  privacy_filter_version: NonEmptyStringSchema.max(80),
  urgency: z.nativeEnum(SignalUrgency),
  delivered_at: IsoDateTimeSchema.optional(),
  acknowledged_at: IsoDateTimeSchema.optional(),
  acted_upon_at: IsoDateTimeSchema.optional(),
  audit_log_id: z.string().uuid()
}).superRefine((value, ctx) => {
  if (hasForbiddenSignalKeys(value.payload)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["payload"],
      message: "InterAgentSignal payload must not contain raw conversation content"
    });
  }
});
