import { randomUUID } from "node:crypto";

import {
  AgentMode,
  LearningEventType,
  MasteryLevel,
  MasteryRecordSchema,
  PrivacyLevel,
  RetentionPolicy,
  UserRole,
  type LearningEvent
} from "@edu-ai/shared-types";
import { describe, expect, it } from "vitest";

import { evaluateMastery, studentCanSeeMastery } from "../src";

const studentId = "11111111-1111-4111-8111-111111111111";
const otherStudentId = "22222222-2222-4222-8222-222222222222";
const nodeId = "33333333-3333-4333-8333-333333333333";
const otherNodeId = "44444444-4444-4444-8444-444444444444";
const nowIso = "2026-04-22T10:00:00.000Z";

describe("mastery evaluator", () => {
  it("aggregates multiple events into a schema-valid, student-visible mastery record", () => {
    const result = evaluateMastery(
      {
        student_id: studentId,
        knowledge_node_id: nodeId,
        evidence: [
          {
            event: exerciseEvent({ is_correct: true, assistanceNodeId: nodeId, occurred_at: "2026-04-22T09:00:00.000Z" }),
            assistance_level: "no_ai",
            source_quality: "direct_assessment"
          },
          {
            event: reflectionEvent({ reflection_quality_score: 0.76, occurred_at: "2026-04-22T09:30:00.000Z" }),
            assistance_level: "unknown",
            source_quality: "dialogue_inference"
          }
        ]
      },
      { now: () => new Date(nowIso) }
    );

    expect(() => MasteryRecordSchema.parse(result.record)).not.toThrow();
    expect(result.record.student_id).toBe(studentId);
    expect(result.record.knowledge_node_id).toBe(nodeId);
    expect(result.record.evidence_count).toBe(2);
    expect(result.record.confidence).toBeGreaterThanOrEqual(0.7);
    expect(result.record.is_acceptable_to_record).toBe(true);
    expect(result.record.is_visible_to_student).toBe(true);
    expect(studentCanSeeMastery(result.record)).toBe(true);
    expect([MasteryLevel.DEVELOPING, MasteryLevel.PROFICIENT, MasteryLevel.MASTERED]).toContain(result.record.current_level);
    expect(JSON.stringify(result.record)).not.toContain("student_answer");
    expect(JSON.stringify(result.record)).not.toContain("I think the answer is 42");
  });

  it("does not turn a single weak conversation turn into a recordable or visible mastery state", () => {
    const result = evaluateMastery(
      {
        student_id: studentId,
        knowledge_node_id: nodeId,
        evidence: [
          {
            event: conversationTurnEvent(),
            assistance_level: "ai_supported",
            source_quality: "dialogue_inference"
          }
        ]
      },
      { now: () => new Date(nowIso) }
    );

    expect(result.record.evidence_count).toBe(0);
    expect(result.used_event_ids).toHaveLength(0);
    expect(result.skipped_event_ids).toHaveLength(1);
    expect(result.record.is_acceptable_to_record).toBe(false);
    expect(result.record.is_visible_to_student).toBe(false);
    expect(result.record.visibility_scope.visible_to_roles).toEqual([UserRole.SYSTEM]);
    expect(studentCanSeeMastery(result.record)).toBe(false);
  });

  it("filters out events for other students, other nodes, and deleted evidence", () => {
    const relevant = exerciseEvent({ is_correct: true, assistanceNodeId: nodeId, occurred_at: "2026-04-22T08:00:00.000Z" });
    const wrongStudent = exerciseEvent({
      id: randomUUID(),
      student_id: otherStudentId,
      is_correct: false,
      assistanceNodeId: nodeId,
      occurred_at: "2026-04-22T08:05:00.000Z"
    });
    const wrongNode = exerciseEvent({
      id: randomUUID(),
      is_correct: false,
      assistanceNodeId: otherNodeId,
      occurred_at: "2026-04-22T08:10:00.000Z"
    });
    const deleted = exerciseEvent({
      id: randomUUID(),
      is_correct: false,
      assistanceNodeId: nodeId,
      occurred_at: "2026-04-22T08:15:00.000Z",
      deleted_at: "2026-04-22T08:16:00.000Z"
    });

    const result = evaluateMastery(
      {
        student_id: studentId,
        knowledge_node_id: nodeId,
        evidence: [
          { event: relevant, assistance_level: "no_ai", source_quality: "direct_assessment" },
          { event: wrongStudent, assistance_level: "no_ai", source_quality: "direct_assessment" },
          { event: wrongNode, assistance_level: "no_ai", source_quality: "direct_assessment" },
          { event: deleted, assistance_level: "no_ai", source_quality: "direct_assessment" }
        ]
      },
      { now: () => new Date(nowIso) }
    );

    expect(result.used_event_ids).toEqual([relevant.id]);
    expect(result.skipped_event_ids).toEqual([wrongStudent.id, wrongNode.id, deleted.id]);
    expect(result.record.evidence_count).toBe(1);
    expect(result.record.is_acceptable_to_record).toBe(false);
  });

  it("gives No-AI evidence more trust than equivalent AI-supported evidence without bypassing gates", () => {
    const noAiResult = evaluateMastery(
      {
        student_id: studentId,
        knowledge_node_id: nodeId,
        evidence: [
          {
            event: exerciseEvent({ id: randomUUID(), is_correct: true, assistanceNodeId: nodeId }),
            assistance_level: "no_ai",
            source_quality: "direct_assessment"
          },
          {
            event: reflectionEvent({ id: randomUUID(), reflection_quality_score: 0.55 }),
            assistance_level: "unknown",
            source_quality: "dialogue_inference"
          }
        ]
      },
      { now: () => new Date(nowIso) }
    );

    const aiSupportedResult = evaluateMastery(
      {
        student_id: studentId,
        knowledge_node_id: nodeId,
        evidence: [
          {
            event: exerciseEvent({ id: randomUUID(), is_correct: true, assistanceNodeId: nodeId }),
            assistance_level: "ai_supported",
            source_quality: "direct_assessment"
          },
          {
            event: reflectionEvent({ id: randomUUID(), reflection_quality_score: 0.55 }),
            assistance_level: "unknown",
            source_quality: "dialogue_inference"
          }
        ]
      },
      { now: () => new Date(nowIso) }
    );

    expect(noAiResult.record.current_mastery).toBeGreaterThan(aiSupportedResult.record.current_mastery);
    expect(noAiResult.record.confidence).toBeGreaterThan(aiSupportedResult.record.confidence);
    expect(aiSupportedResult.record.is_acceptable_to_record).toBe(false);
  });

  it("smooths with the previous materialized record instead of replacing event-sourced facts", () => {
    const baseline = evaluateMastery(
      {
        student_id: studentId,
        knowledge_node_id: nodeId,
        evidence: [
          {
            event: exerciseEvent({ id: randomUUID(), is_correct: true, assistanceNodeId: nodeId }),
            assistance_level: "no_ai",
            source_quality: "direct_assessment"
          },
          {
            event: reflectionEvent({ id: randomUUID(), reflection_quality_score: 0.8 }),
            assistance_level: "unknown",
            source_quality: "dialogue_inference"
          }
        ]
      },
      { now: () => new Date(nowIso) }
    );

    const declined = evaluateMastery(
      {
        student_id: studentId,
        knowledge_node_id: nodeId,
        previous_record: baseline.record,
        evidence: [
          {
            event: exerciseEvent({ id: randomUUID(), is_correct: false, assistanceNodeId: nodeId }),
            assistance_level: "no_ai",
            source_quality: "direct_assessment"
          },
          {
            event: reflectionEvent({ id: randomUUID(), reflection_quality_score: 0.4 }),
            assistance_level: "unknown",
            source_quality: "dialogue_inference"
          }
        ]
      },
      { now: () => new Date(nowIso) }
    );

    expect(declined.record.current_mastery).toBeGreaterThan(0.34);
    expect(declined.record.current_mastery).toBeLessThan(baseline.record.current_mastery);
    expect(declined.record.version).toBe(baseline.record.version + 1);
  });
});

function baseEvent(overrides: Partial<LearningEvent> = {}): LearningEvent {
  return {
    id: randomUUID(),
    created_at: nowIso,
    updated_at: nowIso,
    version: 1,
    student_id: studentId,
    event_type: LearningEventType.EXERCISE_ATTEMPT,
    knowledge_node_ids: [nodeId],
    session_id: randomUUID(),
    payload: {
      assessment_id: randomUUID(),
      item_id: randomUUID(),
      student_answer: "I think the answer is 42",
      is_correct: true,
      time_spent_seconds: 90,
      hints_used: 0
    },
    occurred_at: "2026-04-22T09:00:00.000Z",
    privacy_level: PrivacyLevel.CLASS_INTERNAL,
    visibility_scope: { visible_to_roles: [UserRole.STUDENT, UserRole.TEACHER] },
    retention_policy: RetentionPolicy.ACADEMIC_YEAR,
    ...overrides
  };
}

function exerciseEvent(options: {
  id?: string;
  student_id?: string;
  is_correct: boolean;
  assistanceNodeId: string;
  occurred_at?: string;
  deleted_at?: string;
}): LearningEvent {
  const overrides: Partial<LearningEvent> = {
    knowledge_node_ids: [options.assistanceNodeId],
    payload: {
      assessment_id: randomUUID(),
      item_id: randomUUID(),
      student_answer: "I think the answer is 42",
      is_correct: options.is_correct,
      time_spent_seconds: 90,
      hints_used: options.is_correct ? 0 : 2
    }
  };

  if (options.id) {
    overrides.id = options.id;
  }

  if (options.student_id) {
    overrides.student_id = options.student_id;
  }

  if (options.occurred_at) {
    overrides.occurred_at = options.occurred_at;
  }

  if (options.deleted_at) {
    overrides.deleted_at = options.deleted_at;
  }

  return baseEvent(overrides);
}

function reflectionEvent(options: { id?: string; reflection_quality_score: number; occurred_at?: string }): LearningEvent {
  const overrides: Partial<LearningEvent> = {
    event_type: LearningEventType.SELF_REFLECTION,
    payload: {
      prompt: "How did you solve this?",
      student_response: "I compared the slope and intercept.",
      reflection_quality_score: options.reflection_quality_score
    }
  };

  if (options.id) {
    overrides.id = options.id;
  }

  if (options.occurred_at) {
    overrides.occurred_at = options.occurred_at;
  }

  return baseEvent(overrides);
}

function conversationTurnEvent(): LearningEvent {
  return baseEvent({
    event_type: LearningEventType.CONVERSATION_TURN,
    payload: {
      conversation_id: randomUUID(),
      turn_index: 1,
      agent_mode: AgentMode.MENTOR,
      duration_seconds: 30
    }
  });
}
