import type { LearningEvent, MasteryRecord } from "@edu-ai/shared-types";

export type AssistanceLevel = "no_ai" | "ai_supported" | "unknown";

export type EvidenceSourceQuality = "direct_assessment" | "dialogue_inference" | "teacher_mark";

export interface MasteryEvidenceInput {
  event: LearningEvent;
  assistance_level?: AssistanceLevel;
  source_quality?: EvidenceSourceQuality;
}

export interface EvaluateMasteryInput {
  student_id: string;
  knowledge_node_id: string;
  evidence: readonly MasteryEvidenceInput[];
  previous_record?: MasteryRecord;
  model_version?: string;
  prompt_version?: string;
}

export interface EvaluateMasteryResult {
  record: MasteryRecord;
  used_event_ids: readonly string[];
  skipped_event_ids: readonly string[];
}
