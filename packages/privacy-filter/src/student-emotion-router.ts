import {
  InterAgentSignalType,
  PrivacyLevel,
  RiskCategory,
  SeverityLevel,
  SignalUrgency,
  TargetAgentType,
  type InterAgentSignal
} from "@edu-ai/shared-types";

import { PRIVACY_FILTER_VERSION, validateSignalPrivacy } from "./signal-privacy";
import type { StudentPrivacyRouteDecision, StudentPrivacyRouteInput, StudentSafetyRiskLevel } from "./types";

export type { StudentRouteSelected } from "./types";

const RED_PATTERNS = ["自杀", "不想活", "想死", "活不下去", "自残", "伤害自己", "伤害别人"];
const YELLOW_PATTERNS = ["崩溃", "撑不住", "家暴", "被打", "害怕回家", "不想回家"];
const LOCAL_ONLY_PATTERNS = ["烦死", "不想学", "学不会", "太难了", "压力好大"];

export function decideStudentPrivacyRoute(input: StudentPrivacyRouteInput): StudentPrivacyRouteDecision {
  const redHits = keywordHits(input.message, RED_PATTERNS);
  if (redHits.length > 0) {
    const signal = buildRiskAlertSignal(input);
    assertSignalIsPrivate(signal);
    return routeDecision("red", redHits, true, signal);
  }

  const yellowHits = keywordHits(input.message, YELLOW_PATTERNS);
  if (yellowHits.length > 0) {
    const signal = buildEmotionAnomalySignal(input);
    assertSignalIsPrivate(signal);
    return routeDecision("yellow", yellowHits, true, signal);
  }

  const localOnlyHits = keywordHits(input.message, LOCAL_ONLY_PATTERNS);
  if (localOnlyHits.length > 0) {
    return routeDecision("local_only", localOnlyHits, false);
  }

  return {
    risk_level: "green",
    route_selected: "controlled_cloud",
    privacy_level: PrivacyLevel.STUDENT_PRIVATE,
    keyword_hits: [],
    should_pause_academic_task: false
  };
}

function routeDecision(
  riskLevel: Exclude<StudentSafetyRiskLevel, "green">,
  keywordHitsValue: readonly string[],
  shouldPauseAcademicTask: boolean,
  signal?: InterAgentSignal
): StudentPrivacyRouteDecision {
  return {
    risk_level: riskLevel,
    route_selected: "campus_local",
    privacy_level: PrivacyLevel.CAMPUS_LOCAL_ONLY,
    keyword_hits: keywordHitsValue,
    should_pause_academic_task: shouldPauseAcademicTask,
    ...(signal ? { signal } : {})
  };
}

function buildEmotionAnomalySignal(input: StudentPrivacyRouteInput): InterAgentSignal {
  const now = input.detected_at;
  return {
    id: newSignalId(),
    created_at: now,
    updated_at: now,
    version: 1,
    source_agent_id: input.source_agent_id,
    source_agent_type: "student_agent",
    source_student_id: input.student_id,
    target_agent_type: input.target_agent_type ?? TargetAgentType.TEACHER_AGENT,
    target_agent_id: input.target_agent_id,
    signal_type: InterAgentSignalType.EMOTION_ANOMALY,
    payload: {
      student_id: input.student_id,
      severity: SeverityLevel.MEDIUM,
      suggested_action: "gentle_check_in",
      detected_at: now
    },
    privacy_filter_passed: true,
    privacy_filter_version: PRIVACY_FILTER_VERSION,
    urgency: SignalUrgency.MEDIUM,
    audit_log_id: input.audit_log_id
  };
}

function buildRiskAlertSignal(input: StudentPrivacyRouteInput): InterAgentSignal {
  const now = input.detected_at;
  return {
    id: newSignalId(),
    created_at: now,
    updated_at: now,
    version: 1,
    source_agent_id: input.source_agent_id,
    source_agent_type: "student_agent",
    source_student_id: input.student_id,
    target_agent_type: input.target_agent_type ?? TargetAgentType.TEACHER_AGENT,
    target_agent_id: input.target_agent_id,
    signal_type: InterAgentSignalType.RISK_ALERT,
    payload: {
      student_id: input.student_id,
      risk_category: RiskCategory.SAFETY,
      severity: SignalUrgency.CRITICAL,
      requires_immediate_action: true,
      escalation_path: ["school_safety_protocol"]
    },
    privacy_filter_passed: true,
    privacy_filter_version: PRIVACY_FILTER_VERSION,
    urgency: SignalUrgency.CRITICAL,
    audit_log_id: input.audit_log_id
  };
}

function keywordHits(message: string, patterns: readonly string[]): string[] {
  return patterns.filter((pattern) => message.includes(pattern));
}

function assertSignalIsPrivate(signal: InterAgentSignal): void {
  const result = validateSignalPrivacy(signal);
  if (!result.passed) {
    throw new Error(`Inter-agent signal failed privacy validation: ${result.violations.join(", ")}`);
  }
}

function newSignalId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `sig_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
