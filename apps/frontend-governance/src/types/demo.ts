import type {
  AppealTicket,
  AuditLogEntry,
  ConfidenceScore,
  ConsentRecord
} from "@edu-ai/shared-types";

export interface MasteryItem {
  knowledge_tag: string;
  mastery_level: number;
  evidence_count: number;
  last_event_at?: string;
  snapshot_at?: string;
  snapshot_source?: string;
}

export interface Last7dChange {
  knowledge_tag: string;
  delta: number;
  from_snapshot_at: string;
  to_snapshot_at: string;
}

export interface StudentMasteryResponse {
  student_token: string;
  course_id: string;
  generated_at: string;
  knowledge_map: readonly MasteryItem[];
  no_ai_baseline: {
    latest_completed_at: string;
    gap_score: number;
    notes: string;
  };
  last_7d_changes: readonly Last7dChange[];
}

export interface StudentProfileResponse {
  student_token: string;
  mastery_summary: readonly MasteryItem[];
  recent_process_summaries: readonly {
    summary_id: string;
    window_type: string;
    window_end: string;
    summary_text: string;
    ai_dependency_score: number;
    no_ai_gap_score: number;
  }[];
  has_active_emotion_signal: boolean;
  current_intervention: {
    status: string;
    current_level: string;
    verification_due_at: string;
  };
  retention_notice: readonly {
    layer: string;
    rule: string;
    note: string;
  }[];
  excluded_internal_fields: readonly string[];
}

export interface StudentAgentSessionResponse {
  session_id: string;
  route_selected: "campus_local" | "controlled_cloud";
  assistant_message: string;
  follow_up_suggestions: string[];
  request_id: string;
}

export interface RiskBreakdown {
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  resolved: number;
}

export interface TeacherDailyReportResponse {
  report_id: string;
  course_id: string;
  teacher_id: string;
  window: string;
  knowledge_heat: readonly {
    tag: string;
    risk_count: number;
    risk_breakdown?: RiskBreakdown;
  }[];
  priority_students: readonly {
    student_token: string;
    blockers: readonly string[];
    recommended_action: string;
    manual_review_required: boolean;
  }[];
  recommended_group_actions: readonly string[];
  generated_at: string;
}

export interface TeacherStudentDetailViewModel {
  studentToken: string;
  displayName: string;
  radarScores: readonly { axis: string; value: number }[];
  blockers: readonly string[];
  recentProcessSummaries: readonly {
    summaryId: string;
    summaryText: string;
    aiDependencyScore: number;
    noAiGapScore: number;
  }[];
  noAiRecommendation: string;
  currentIntervention?: {
    status: "open" | "verified" | "closed";
    current_level: "L1" | "L2" | "L3" | "L4" | "L5";
    linked_report_id?: string;
    trigger_type?: string;
    verification_due_at?: string;
    note?: string;
  };
  sourceReportId?: string;
  recommendedInterventionLevel?: "L1" | "L2" | "L3";
  recommendedTriggerType?: string;
}

export interface InterventionCreateResponse {
  intervention_id: string;
  status: string;
  verification_due_at: string;
  request_id: string;
}

export interface ConsentItem {
  consent_id: ConsentRecord["id"];
  consent_type: string;
  version: string;
  status: string;
  effective_at: string;
  expires_at: string;
}

export interface ConsentStatusResponse {
  student_token: string;
  items: readonly ConsentItem[];
}

export interface ConsentWriteResponse {
  consent_id: ConsentRecord["id"];
  consent_type: string;
  status: string;
  version: string;
  effective_at: string;
  expires_at: string;
  request_id: string;
}

export interface GuardianSummaryViewModel {
  studentToken: string;
  displayName: string;
  progressSignals: readonly string[];
  supportSuggestions: readonly string[];
  visibilityBoundary: readonly {
    label: string;
    items: readonly string[];
  }[];
}

export interface AdminPreflightSummary {
  pilot_id: string;
  school_id: string;
  generated_at: string;
  acceptance_total: number;
  acceptance_passed: number;
  acceptance_failed: number;
  must_have_states: readonly string[];
  check_groups: readonly {
    label: string;
    passed: number;
    total: number;
  }[];
}

export interface AdminComplianceSummary {
  generated_at: string;
  effective_consent_coverage_pct: number;
  acceptance_pass_rate_pct: number;
  restricted_access_count: number;
  boundary_summary: readonly string[];
  do_not_do_items: readonly string[];
}

export interface AdminAuditPreview {
  chain: readonly {
    audit_id: AuditLogEntry["id"];
    hash_prev?: AuditLogEntry["previous_entry_hash"];
    hash_current: AuditLogEntry["current_entry_hash"];
  }[];
  latestPrivacyReview: {
    case_id: string;
    operator_id: AuditLogEntry["actor_user_id"];
    action_type: AuditLogEntry["action"];
  };
}

export interface ActionItem {
  title: string;
  body: string;
}

export type AppealStatus = "submitted" | "under_review" | "resolved" | "escalated";
export type AppealTargetType = "ai_scoring" | "agent_behavior" | "teacher_intervention";

export interface AppealItem {
  appeal_id: AppealTicket["id"];
  guardian_id: string;
  student_token: string;
  target_type: AppealTargetType;
  target_ref: string;
  reason: string;
  status: AppealStatus;
  submitted_at: string;
  last_updated_at: string;
  resolution_note?: string;
  manual_review_required: boolean;
}

export interface AppealListResponse {
  guardian_id: string;
  items: readonly AppealItem[];
}

export interface AppealQueueResponse {
  generated_at: string;
  items: readonly AppealItem[];
}

export interface AppealCreateInput {
  guardian_id: string;
  student_token: string;
  target_type: AppealTargetType;
  target_ref: string;
  reason: string;
}

export interface AppealAdvanceInput {
  admin_id: string;
  appeal_id: string;
  next_status: Exclude<AppealStatus, "submitted">;
  resolution_note?: string;
  manual_review_confirmed?: boolean;
}

export interface AppealWriteResponse {
  appeal_id: string;
  status: AppealStatus;
  last_updated_at: string;
  request_id: string;
}

export type ScoreStatus = "draft" | "released" | "disputed" | "corrected";

export interface ScoreDimension {
  dimension: string;
  value: number;
  confidence: ConfidenceScore["composite_confidence"];
  evidence_ref: string;
}

export interface StudentScoreRecord {
  score_id: string;
  student_token: string;
  course_id: string;
  generated_at: string;
  status: ScoreStatus;
  composite_score: number;
  composite_confidence: ConfidenceScore["composite_confidence"];
  dimensions: readonly ScoreDimension[];
  diagnostics: readonly string[];
  added_to_record: boolean;
  added_to_record_at?: string;
  added_to_record_by?: string;
}

export interface StudentScoresResponse {
  student_token: string;
  range_days: number;
  items: readonly StudentScoreRecord[];
}

export interface AdminScoringOverview {
  generated_at: string;
  total_scores: number;
  released_count: number;
  added_to_record_count: number;
  items: readonly StudentScoreRecord[];
}

export interface ScoreAcceptResponse {
  score_id: string;
  added_to_record: boolean;
  added_to_record_at: string;
  request_id: string;
}
