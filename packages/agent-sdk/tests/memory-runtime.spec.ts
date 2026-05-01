import { randomUUID } from "node:crypto";

import { createInMemoryMemoryStore } from "@edu-ai/memory-store";
import {
  AgentMode,
  ConversationSpeaker,
  ConversationStatus,
  DifficultyProgression,
  EmotionCategory,
  PrivacyLevel,
  UserRole,
  type Conversation,
  type ConversationTurn,
  type EmotionBaseline
} from "@edu-ai/shared-types";
import { describe, expect, it } from "vitest";

import { createStudentMemoryRuntime } from "../src";

describe("student memory runtime", () => {
  it("keeps working memory bounded and does not write vectors per turn", async () => {
    const store = createInMemoryMemoryStore();
    const runtime = createStudentMemoryRuntime({ store });
    const conversationId = randomUUID();
    const agentId = randomUUID();

    let order = 0;
    for (; order < 5; order += 1) {
      await runtime.appendTurn({
        agent_id: agentId,
        conversation_id: conversationId,
        context_window_size: 3,
        turn: buildTurn(order, ConversationSpeaker.STUDENT, `第 ${order} 轮：我在看一次函数。`)
      });
    }

    const working = await runtime.appendTurn({
      agent_id: agentId,
      conversation_id: conversationId,
      context_window_size: 3,
      turn: buildTurn(order, ConversationSpeaker.AGENT, "我们继续看斜率。")
    });

    expect(working.recent_turns.map((turn) => turn.order)).toEqual([3, 4, 5]);
    expect(store.list()).toHaveLength(0);
  });

  it("writes academic episodic summaries without raw turn text", async () => {
    const store = createInMemoryMemoryStore();
    const runtime = createStudentMemoryRuntime({ store });
    const conversation = buildConversation();

    const result = await runtime.endConversation({
      tenant_id: "tenant_demo",
      agent_id: conversation.agent_id,
      conversation,
      summary_candidates: [
        {
          topic: "一次函数斜率",
          summary_text: "学生能说出斜率影响倾斜程度，但仍需练习从图像反推表达式。",
          memory_bucket: "academic",
          confidence: 0.82,
          importance_score: 0.7,
          related_node_ids: [randomUUID()],
          source_turn_range: { start: 0, end: 1 }
        }
      ]
    });

    expect(result.skipped_candidates).toHaveLength(0);
    expect(result.written_entries).toHaveLength(1);
    expect(store.list()[0]!.memory_bucket).toBe("academic");
    expect(store.list()[0]!.source_id).not.toContain(conversation.id);
    expect(store.list()[0]!.source_trace.every((trace) => trace.startsWith("sanitized:"))).toBe(true);
    expect(store.list()[0]!.summary_text).not.toContain(conversation.turns[0]!.content);
  });

  it("skips summaries that contain raw conversation text", async () => {
    const store = createInMemoryMemoryStore();
    const runtime = createStudentMemoryRuntime({ store });
    const conversation = buildConversation();

    const result = await runtime.endConversation({
      tenant_id: "tenant_demo",
      agent_id: conversation.agent_id,
      conversation,
      summary_candidates: [
        {
          topic: "原文泄露候选",
          summary_text: `学生原文：${conversation.turns[0]!.content}`,
          memory_bucket: "academic",
          confidence: 0.9,
          importance_score: 0.5,
          source_turn_range: { start: 0, end: 0 }
        }
      ]
    });

    expect(result.written_entries).toHaveLength(0);
    expect(result.skipped_candidates[0]!.reason).toBe("Memory summary must not contain raw conversation text");
    expect(store.list()).toHaveLength(0);
  });

  it("keeps emotional memory out of normal recall unless local safety asks for it", async () => {
    const store = createInMemoryMemoryStore();
    const runtime = createStudentMemoryRuntime({ store });
    const conversation = buildConversation();

    await runtime.endConversation({
      tenant_id: "tenant_demo",
      agent_id: conversation.agent_id,
      conversation,
      summary_candidates: [
        {
          topic: "持续挫败信号",
          summary_text: "学生连续表达强烈回避学习，需要校内本地安全判断关注。",
          memory_bucket: "emotional",
          confidence: 0.86,
          importance_score: 0.8,
          source_turn_range: { start: 0, end: 1 }
        }
      ]
    });

    const normalRecall = await runtime.recallForStudent({
      tenant_id: "tenant_demo",
      student_id: conversation.student_id,
      query_text: "回避学习"
    });
    const safetyRecall = await runtime.recallForStudent({
      tenant_id: "tenant_demo",
      student_id: conversation.student_id,
      query_text: "回避学习",
      include_emotional_for_local_safety: true
    });

    expect(normalRecall.emotional_for_safety).toHaveLength(0);
    expect(safetyRecall.emotional_for_safety).toHaveLength(1);
    expect(store.list()[0]!.privacy_level).toBe("campus_local_only");
    expect(store.list()[0]!.deployment_scope).toBe("campus_local");
  });

  it("removes deleted memories from personalization recall and transparency", async () => {
    const store = createInMemoryMemoryStore();
    const runtime = createStudentMemoryRuntime({ store });
    const conversation = buildConversation();
    const result = await runtime.endConversation({
      tenant_id: "tenant_demo",
      agent_id: conversation.agent_id,
      conversation,
      summary_candidates: [
        {
          topic: "图像平移",
          summary_text: "学生在图像平移方向上仍需短时复习。",
          memory_bucket: "academic",
          confidence: 0.8,
          importance_score: 0.6,
          source_turn_range: { start: 0, end: 1 }
        }
      ]
    });
    const memoryId = result.written_entries[0]!.id;

    expect((await runtime.buildTransparencyView({ student_id: conversation.student_id })).items).toHaveLength(1);
    expect(
      (
        await runtime.recallForStudent({
          tenant_id: "tenant_demo",
          student_id: conversation.student_id,
          query_text: "图像平移"
        })
      ).academic
    ).toHaveLength(1);

    const deletion = await runtime.requestDeletion({
      student_id: conversation.student_id,
      memory_id: memoryId,
      reason: "学生希望删除这段普通学习记忆"
    });

    expect(deletion.deleted).toBe(true);
    expect(store.list()[0]!.deleted_at).toBeDefined();
    expect((await runtime.buildTransparencyView({ student_id: conversation.student_id })).items).toHaveLength(0);
    expect(
      (
        await runtime.recallForStudent({
          tenant_id: "tenant_demo",
          student_id: conversation.student_id,
          query_text: "图像平移"
        })
      ).academic
    ).toHaveLength(0);
  });

  it("keeps deleted vectors out of recall across runtime instances", async () => {
    const store = createInMemoryMemoryStore();
    const firstRuntime = createStudentMemoryRuntime({ store });
    const conversation = buildConversation();
    const result = await firstRuntime.endConversation({
      tenant_id: "tenant_demo",
      agent_id: conversation.agent_id,
      conversation,
      summary_candidates: [
        {
          topic: "斜率复习",
          summary_text: "学生需要继续复习一次函数斜率和图像倾斜方向。",
          memory_bucket: "academic",
          confidence: 0.8,
          importance_score: 0.6,
          source_turn_range: { start: 0, end: 1 }
        }
      ]
    });

    await firstRuntime.requestDeletion({
      student_id: conversation.student_id,
      memory_id: result.written_entries[0]!.id,
      reason: "学生删除普通学习记忆"
    });

    const secondRuntime = createStudentMemoryRuntime({ store });
    const recall = await secondRuntime.recallForStudent({
      tenant_id: "tenant_demo",
      student_id: conversation.student_id,
      query_text: "斜率"
    });

    expect(recall.academic).toHaveLength(0);
  });

  it("rejects low-confidence semantic snapshots", async () => {
    const store = createInMemoryMemoryStore();
    const runtime = createStudentMemoryRuntime({ store });

    await expect(
      runtime.buildSemanticSnapshot({
        student_id: randomUUID(),
        agent_id: randomUUID(),
        knowledge_profile: {
          mastered_node_count: 1,
          developing_node_count: 2,
          struggling_node_ids: [],
          strong_subject_tags: ["linear_function"],
          weak_subject_tags: []
        },
        learning_style_profile: {
          preferred_pedagogies: [],
          typical_focus_duration_minutes: 25,
          peak_active_hours: [19],
          preferred_difficulty_progression: DifficultyProgression.GRADUAL
        },
        interest_profile: {
          frequently_asked_topics: [],
          voluntary_deep_dives: [],
          low_engagement_areas: []
        },
        emotion_baseline: buildEmotionBaseline(),
        snapshot_version: 1,
        confidence: 0.69,
        evidence_count: 3,
        observation_window_days: 7
      })
    ).rejects.toThrow("Semantic memory snapshot requires confidence >= 0.7");
  });

  it("rejects semantic snapshots without enough stable evidence", async () => {
    const store = createInMemoryMemoryStore();
    const runtime = createStudentMemoryRuntime({ store });
    const studentId = randomUUID();

    await expect(
      runtime.buildSemanticSnapshot({
        student_id: studentId,
        agent_id: randomUUID(),
        knowledge_profile: {
          mastered_node_count: 1,
          developing_node_count: 2,
          struggling_node_ids: [],
          strong_subject_tags: ["linear_function"],
          weak_subject_tags: []
        },
        learning_style_profile: {
          preferred_pedagogies: [],
          typical_focus_duration_minutes: 25,
          peak_active_hours: [19],
          preferred_difficulty_progression: DifficultyProgression.GRADUAL
        },
        interest_profile: {
          frequently_asked_topics: [],
          voluntary_deep_dives: [],
          low_engagement_areas: []
        },
        emotion_baseline: buildEmotionBaseline(studentId),
        snapshot_version: 1,
        confidence: 0.8,
        evidence_count: 2,
        observation_window_days: 7
      })
    ).rejects.toThrow("Semantic memory snapshot requires at least 3 evidence items");
  });

  it("rejects semantic snapshots with mismatched emotion baseline", async () => {
    const store = createInMemoryMemoryStore();
    const runtime = createStudentMemoryRuntime({ store });
    const studentId = randomUUID();

    await expect(
      runtime.buildSemanticSnapshot({
        student_id: studentId,
        agent_id: randomUUID(),
        knowledge_profile: {
          mastered_node_count: 1,
          developing_node_count: 2,
          struggling_node_ids: [],
          strong_subject_tags: ["linear_function"],
          weak_subject_tags: []
        },
        learning_style_profile: {
          preferred_pedagogies: [],
          typical_focus_duration_minutes: 25,
          peak_active_hours: [19],
          preferred_difficulty_progression: DifficultyProgression.GRADUAL
        },
        interest_profile: {
          frequently_asked_topics: [],
          voluntary_deep_dives: [],
          low_engagement_areas: []
        },
        emotion_baseline: buildEmotionBaseline(),
        snapshot_version: 1,
        confidence: 0.8,
        evidence_count: 3,
        observation_window_days: 7
      })
    ).rejects.toThrow("Emotion baseline student_id must match snapshot student_id");
  });

  it("keeps teacher evidence references non-reversible", () => {
    const store = createInMemoryMemoryStore();
    const runtime = createStudentMemoryRuntime({ store });

    expect(() =>
      runtime.assertTeacherEvidenceReference({
        evidence_id: "signal-safe-001",
        evidence_type: "signal",
        window_start: "2026-04-22T10:00:00+08:00",
        window_end: "2026-04-22T11:00:00+08:00"
      })
    ).not.toThrow();

    expect(() =>
      runtime.assertTeacherEvidenceReference({
        evidence_id: "conversation:raw-conv-id",
        evidence_type: "signal"
      })
    ).toThrow("Teacher evidence reference must not be reversible to raw conversation data");
  });
});

function buildConversation(): Conversation {
  const now = "2026-04-22T10:00:00+08:00";
  return {
    id: randomUUID(),
    created_at: now,
    updated_at: now,
    version: 1,
    student_id: randomUUID(),
    agent_id: randomUUID(),
    mode: AgentMode.MENTOR,
    knowledge_node_ids: [randomUUID()],
    turns: [
      buildTurn(0, ConversationSpeaker.STUDENT, "我完全看不懂一次函数图像往右平移时 b 到底怎么变。"),
      buildTurn(1, ConversationSpeaker.AGENT, "我们先只看图像和 y 轴交点的变化。")
    ],
    turn_count: 2,
    privacy_level: PrivacyLevel.STUDENT_PRIVATE,
    visibility_scope: {
      visible_to_roles: [UserRole.STUDENT]
    },
    was_routed_to_local_model: false,
    status: ConversationStatus.ENDED,
    started_at: now,
    ended_at: "2026-04-22T10:10:00+08:00",
    accessed_by: []
  };
}

function buildTurn(order: number, speaker: ConversationSpeaker, content: string): ConversationTurn {
  return {
    turn_id: randomUUID(),
    order,
    speaker,
    content,
    created_at: "2026-04-22T10:00:00+08:00"
  };
}

function buildEmotionBaseline(studentId: string = randomUUID()): EmotionBaseline {
  const now = "2026-04-22T10:00:00+08:00";
  return {
    id: randomUUID(),
    created_at: now,
    updated_at: now,
    version: 1,
    student_id: studentId,
    baseline_distribution: {
      [EmotionCategory.NEUTRAL]: 0.7,
      [EmotionCategory.POSITIVE]: 0.1,
      [EmotionCategory.FRUSTRATED]: 0.08,
      [EmotionCategory.ANXIOUS]: 0.04,
      [EmotionCategory.SAD]: 0.03,
      [EmotionCategory.ANGRY]: 0.03,
      [EmotionCategory.CRITICAL]: 0.02
    },
    sample_window_start: "2026-04-15T10:00:00+08:00",
    sample_window_end: now,
    sample_count: 20,
    deviation_threshold: 0.4,
    storage_location: PrivacyLevel.CAMPUS_LOCAL_ONLY,
    visibility_scope: {
      visible_to_roles: [UserRole.STUDENT]
    },
    last_updated_at: now
  };
}
