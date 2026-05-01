import type { InterAgentSignal, PrivacyLevel, TargetAgentType } from "@edu-ai/shared-types";

export type StudentSafetyRiskLevel = "green" | "local_only" | "yellow" | "red";
export type StudentRouteSelected = "controlled_cloud" | "campus_local";

export interface StudentPrivacyRouteInput {
  student_id: string;
  source_agent_id: string;
  target_agent_id: string;
  audit_log_id: string;
  message: string;
  detected_at: string;
  target_agent_type?: TargetAgentType;
}

export interface StudentPrivacyRouteDecision {
  risk_level: StudentSafetyRiskLevel;
  route_selected: StudentRouteSelected;
  privacy_level: PrivacyLevel;
  keyword_hits: readonly string[];
  should_pause_academic_task: boolean;
  signal?: InterAgentSignal;
}

export interface SignalPrivacyValidation {
  passed: boolean;
  violations: readonly string[];
}
