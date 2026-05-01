import { describe, expect, it } from "vitest";

import {
  ConversationSchema,
  EmotionBaselineSchema,
  EpisodicMemoryEntrySchema,
  InterAgentSignalSchema,
  InterAgentSignalType,
  InterventionActionCode,
  InterventionReasonCode,
  MilestoneDisplayCode,
  MilestoneType,
  MasteryHistorySchema,
  MasteryRecordSchema,
  SignalUrgency,
  StudentMemorySnapshotSchema,
  TargetAgentType
} from "../src";
import { buildSeedDataset } from "../src/testing/seed-generator";

describe("privacy constraints", () => {
  it("rejects raw dialogue content in inter-agent signal payload", () => {
    const dataset = buildSeedDataset();
    const invalidSignal = {
      ...dataset.inter_agent_signals[0],
      payload: {
        ...dataset.inter_agent_signals[0]!.payload,
        content: "学生原始对话全文"
      }
    };

    expect(() => InterAgentSignalSchema.parse(invalidSignal)).toThrow();
  });

  it("keeps emotion baseline campus-local only", () => {
    const dataset = buildSeedDataset();
    expect(dataset.emotion_baselines[0]!.storage_location).toBe("campus_local_only");
  });

  it("requires visibility_scope on high-sensitivity student data entities", () => {
    const dataset = buildSeedDataset();
    const cases = [
      { schema: ConversationSchema, sample: dataset.conversations[0] },
      { schema: MasteryRecordSchema, sample: dataset.mastery_records[0] },
      { schema: MasteryHistorySchema, sample: dataset.mastery_history[0] },
      { schema: EpisodicMemoryEntrySchema, sample: dataset.episodic_memories[0] },
      { schema: StudentMemorySnapshotSchema, sample: dataset.student_memory_snapshots[0] },
      { schema: EmotionBaselineSchema, sample: dataset.emotion_baselines[0] }
    ];

    for (const testCase of cases) {
      const { visibility_scope: _visibilityScope, ...withoutVisibility } = testCase.sample as unknown as Record<
        string,
        unknown
      >;
      expect(() => testCase.schema.parse(withoutVisibility)).toThrow();
    }
  });

  it("accepts structured intervention signals without free-text rationale", () => {
    const dataset = buildSeedDataset();
    const signal = {
      ...dataset.inter_agent_signals[0],
      target_agent_type: TargetAgentType.TEACHER_AGENT,
      signal_type: InterAgentSignalType.INTERVENTION_SUGGESTED,
      urgency: SignalUrgency.MEDIUM,
      payload: {
        student_id: dataset.students[0]!.id,
        intervention_type: "targeted_review",
        reason_codes: [InterventionReasonCode.CONCEPT_MISCONCEPTION],
        evidence_signal_ids: [dataset.inter_agent_signals[0]!.id],
        suggested_action_codes: [InterventionActionCode.TARGETED_REVIEW]
      }
    };

    expect(() => InterAgentSignalSchema.parse(signal)).not.toThrow();
  });

  it("rejects legacy free-text intervention signal fields", () => {
    const dataset = buildSeedDataset();
    const invalidSignal = {
      ...dataset.inter_agent_signals[0],
      signal_type: InterAgentSignalType.INTERVENTION_SUGGESTED,
      payload: {
        student_id: dataset.students[0]!.id,
        intervention_type: "targeted_review",
        rationale_summary: "学生原话：我完全不想学了",
        evidence_signal_ids: [dataset.inter_agent_signals[0]!.id],
        suggested_actions: ["把这段原话发给老师"]
      }
    };

    expect(() => InterAgentSignalSchema.parse(invalidSignal)).toThrow();
  });

  it("rejects legacy free-text milestone signal descriptions", () => {
    const dataset = buildSeedDataset();
    const invalidSignal = {
      ...dataset.inter_agent_signals[0],
      signal_type: InterAgentSignalType.MILESTONE_REACHED,
      payload: {
        student_id: dataset.students[0]!.id,
        milestone_type: MilestoneType.MASTERY_THRESHOLD,
        display_code: MilestoneDisplayCode.MASTERY_THRESHOLD_GENERIC,
        description: "瀛︾敓鍘熻瘽锛氭垜杩欐缁堜簬浼氫簡",
        celebrate: true
      }
    };

    expect(() => InterAgentSignalSchema.parse(invalidSignal)).toThrow();
  });
});
