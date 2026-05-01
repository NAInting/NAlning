import type { LearningEvent, MasteryRecord } from "@edu-ai/shared-types";

import {
  assistanceWeight,
  confidenceFromEvidence,
  isAcceptableToRecord,
  masteryLevelFromValue,
  reviewIntervalDays,
  scoreLearningEvent,
  sourceQualityWeight,
  studentCanSeeMastery,
  visibilityForMastery
} from "./policy";
import type { EvaluateMasteryInput, EvaluateMasteryResult, MasteryEvidenceInput } from "./types";

export class MasteryEvaluator {
  private readonly now: () => Date;

  constructor(options: { now?: () => Date } = {}) {
    this.now = options.now ?? (() => new Date());
  }

  evaluate(input: EvaluateMasteryInput): EvaluateMasteryResult {
    const scored = input.evidence.flatMap((evidence) => {
      const event = evidence.event;
      if (!isRelevantEvent(event, input.student_id, input.knowledge_node_id)) {
        return [];
      }

      const score = scoreLearningEvent(event);
      if (score === undefined) {
        return [];
      }

      const weight = assistanceWeight(evidence.assistance_level) * sourceQualityWeight(evidence.source_quality);
      return [
        {
          event,
          score,
          weight,
          no_ai: evidence.assistance_level === "no_ai"
        }
      ];
    });

    const usedEventIds = scored.map((item) => item.event.id);
    const skippedEventIds = input.evidence
      .map((evidence) => evidence.event.id)
      .filter((eventId) => !usedEventIds.includes(eventId));
    const evidenceCount = scored.length;
    const weightedAverage = weightedScore(scored);
    const currentMastery = smoothWithPrevious(weightedAverage, input.previous_record);
    const noAiEvidenceCount = scored.filter((item) => item.no_ai).length;
    const confidence = confidenceFromEvidence(evidenceCount, noAiEvidenceCount);
    const acceptable = isAcceptableToRecord(confidence, evidenceCount);
    const visibilityScope = visibilityForMastery(acceptable);
    const nowIso = this.now().toISOString();
    const lastEvidenceAt = latestEvidenceAt(scored.map((item) => item.event)) ?? nowIso;
    const nextReview = addDays(lastEvidenceAt, reviewIntervalDays(currentMastery));

    const record: MasteryRecord = {
      id: newRecordId(),
      created_at: nowIso,
      updated_at: nowIso,
      version: (input.previous_record?.version ?? 0) + 1,
      student_id: input.student_id,
      knowledge_node_id: input.knowledge_node_id,
      current_mastery: currentMastery,
      current_level: masteryLevelFromValue(currentMastery),
      confidence,
      evidence_count: evidenceCount,
      last_evidence_at: lastEvidenceAt,
      last_activated_at: lastEvidenceAt,
      decay_factor: decayFactor(lastEvidenceAt, this.now()),
      next_review_recommended_at: nextReview,
      is_visible_to_student: acceptable,
      is_acceptable_to_record: acceptable,
      visibility_scope: visibilityScope,
      ai_generated: {
        value: currentMastery,
        confidence,
        model_version: input.model_version ?? "rule-based-mastery-evaluator-0.1",
        prompt_version: input.prompt_version ?? "no-prompt-rule-based-0.1",
        generated_at: nowIso,
        human_reviewed: false
      }
    };

    record.is_visible_to_student = studentCanSeeMastery(record);

    return {
      record,
      used_event_ids: usedEventIds,
      skipped_event_ids: skippedEventIds
    };
  }
}

export function evaluateMastery(input: EvaluateMasteryInput, options: { now?: () => Date } = {}): EvaluateMasteryResult {
  return new MasteryEvaluator(options).evaluate(input);
}

function isRelevantEvent(event: LearningEvent, studentId: string, knowledgeNodeId: string): boolean {
  return (
    !event.deleted_at &&
    event.student_id === studentId &&
    event.knowledge_node_ids.includes(knowledgeNodeId)
  );
}

function weightedScore(scored: readonly { score: number; weight: number }[]): number {
  if (scored.length === 0) {
    return 0;
  }

  const totalWeight = scored.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) {
    return 0;
  }

  return clamp01(scored.reduce((sum, item) => sum + item.score * item.weight, 0) / totalWeight);
}

function smoothWithPrevious(value: number, previous: MasteryRecord | undefined): number {
  if (!previous) {
    return round(value);
  }

  return round(previous.current_mastery * 0.3 + value * 0.7);
}

function latestEvidenceAt(events: readonly LearningEvent[]): string | undefined {
  return events
    .map((event) => event.occurred_at)
    .sort((left, right) => right.localeCompare(left))[0];
}

function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function decayFactor(lastEvidenceAt: string, now: Date): number {
  const ageMs = Math.max(0, now.getTime() - new Date(lastEvidenceAt).getTime());
  const ageDays = ageMs / (24 * 60 * 60 * 1000);
  return round(Math.min(1, ageDays * 0.02));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function newRecordId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `mastery_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
