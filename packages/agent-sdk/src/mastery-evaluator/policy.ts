import { LearningEventType, MasteryLevel, UserRole, type LearningEvent, type VisibilityScope } from "@edu-ai/shared-types";

import type { AssistanceLevel, EvidenceSourceQuality } from "./types";

export const MIN_ACCEPTABLE_MASTERY_CONFIDENCE = 0.7;
export const MIN_ACCEPTABLE_EVIDENCE_COUNT = 2;

export function scoreLearningEvent(event: LearningEvent): number | undefined {
  if (event.event_type === LearningEventType.EXERCISE_ATTEMPT && "is_correct" in event.payload) {
    const base = event.payload.is_correct ? 0.82 : 0.34;
    const hintPenalty = Math.min(event.payload.hints_used * 0.05, 0.25);
    return clamp01(base - hintPenalty);
  }

  if (event.event_type === LearningEventType.SELF_REFLECTION && "reflection_quality_score" in event.payload) {
    return event.payload.reflection_quality_score ?? 0.5;
  }

  if (event.event_type === LearningEventType.NODE_MASTERED) {
    return 0.92;
  }

  if (event.event_type === LearningEventType.UNIT_COMPLETED) {
    return 0.72;
  }

  if (event.event_type === LearningEventType.HELP_REQUESTED) {
    return 0.42;
  }

  return undefined;
}

export function assistanceWeight(level: AssistanceLevel = "unknown"): number {
  if (level === "no_ai") {
    return 1.25;
  }

  if (level === "ai_supported") {
    return 0.75;
  }

  return 1;
}

export function sourceQualityWeight(quality: EvidenceSourceQuality = "dialogue_inference"): number {
  if (quality === "direct_assessment") {
    return 1.2;
  }

  if (quality === "teacher_mark") {
    return 1.3;
  }

  return 0.7;
}

export function confidenceFromEvidence(evidenceCount: number, noAiEvidenceCount: number): number {
  return clamp01(0.45 + evidenceCount * 0.12 + noAiEvidenceCount * 0.08);
}

export function isAcceptableToRecord(confidence: number, evidenceCount: number): boolean {
  return confidence >= MIN_ACCEPTABLE_MASTERY_CONFIDENCE && evidenceCount >= MIN_ACCEPTABLE_EVIDENCE_COUNT;
}

export function masteryLevelFromValue(value: number): MasteryLevel {
  if (value < 0.2) {
    return MasteryLevel.NOT_STARTED;
  }

  if (value < 0.45) {
    return MasteryLevel.EMERGING;
  }

  if (value < 0.7) {
    return MasteryLevel.DEVELOPING;
  }

  if (value < 0.85) {
    return MasteryLevel.PROFICIENT;
  }

  return MasteryLevel.MASTERED;
}

export function visibilityForMastery(isAcceptable: boolean): VisibilityScope {
  if (!isAcceptable) {
    return {
      visible_to_roles: [UserRole.SYSTEM],
      excluded_fields_by_role: {
        [UserRole.STUDENT]: ["current_mastery", "current_level", "ai_generated"],
        [UserRole.TEACHER]: ["ai_generated"]
      }
    };
  }

  return {
    visible_to_roles: [UserRole.STUDENT, UserRole.TEACHER],
    excluded_fields_by_role: {
      [UserRole.GUARDIAN]: ["ai_generated"]
    }
  };
}

export function studentCanSeeMastery(record: { is_visible_to_student: boolean; is_acceptable_to_record: boolean; visibility_scope: VisibilityScope }): boolean {
  return (
    record.is_visible_to_student &&
    record.is_acceptable_to_record &&
    record.visibility_scope.visible_to_roles.includes(UserRole.STUDENT)
  );
}

export function reviewIntervalDays(masteryValue: number): number {
  if (masteryValue < 0.45) {
    return 1;
  }

  if (masteryValue < 0.7) {
    return 2;
  }

  if (masteryValue < 0.85) {
    return 4;
  }

  return 7;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}
