import { describe, expect, it } from "vitest";

import {
  AgentRuntimeEventSchema,
  AgentType,
  PrivacyLevel,
  UserRole,
  projectAgentRuntimeEvent,
  type AgentRuntimeEvent
} from "../src";

const baseEvent: AgentRuntimeEvent = {
  id: "2b2f6e88-4a8e-4d2a-8d1c-2f2a4e8b9f01",
  created_at: "2026-04-25T08:00:00.000Z",
  updated_at: "2026-04-25T08:00:00.000Z",
  version: 1,
  trace_id: "trace_student_agent_001",
  run_id: "run_student_agent_001",
  sequence: 1,
  event_type: "progress",
  domain: "academic",
  source_agent_id: "1a2b3c4d-1111-4aaa-8bbb-123456789abc",
  source_agent_type: AgentType.STUDENT_AGENT,
  session_id: "1a2b3c4d-2222-4aaa-8bbb-123456789abc",
  student_id: "1a2b3c4d-3333-4aaa-8bbb-123456789abc",
  unit_id: "math_g8_linear_function_intro",
  stage_id: "mentor_turn_001",
  privacy_level: PrivacyLevel.PUBLIC,
  visibility_scope: {
    visible_to_roles: [UserRole.STUDENT, UserRole.ADMIN]
  },
  occurred_at: "2026-04-25T08:00:00.000Z",
  payload: {
    title: "正在整理你的思路",
    summary: "Agent 正在基于当前知识点生成下一步追问。",
    progress: {
      current: 1,
      total: 3,
      label: "准备追问"
    }
  },
  internal_metadata: {
    prompt_id: "student_mentor_turn",
    prompt_version: "v1",
    provider_id: "local_mock",
    model_id: "local-safe",
    latency_ms: 42,
    input_tokens: 128,
    output_tokens: 64,
    cost_micro_usd: 0
  }
};

describe("AgentRuntimeEvent", () => {
  it("accepts a structured runtime event with safe internal metadata", () => {
    expect(() => AgentRuntimeEventSchema.parse(baseEvent)).not.toThrow();
  });

  it("rejects raw prompt, raw model output, raw dialogue, or emotional detail keys", () => {
    const invalid = {
      ...baseEvent,
      payload: {
        ...baseEvent.payload,
        raw_prompt: "不要把完整 prompt 放进 runtime event"
      }
    };

    expect(() => AgentRuntimeEventSchema.parse(invalid)).toThrow();
  });

  it("requires emotion runtime events to stay campus-local only", () => {
    const invalid = {
      ...baseEvent,
      domain: "emotion" as const,
      privacy_level: PrivacyLevel.STUDENT_PRIVATE
    };

    expect(() => AgentRuntimeEventSchema.parse(invalid)).toThrow();
  });

  it("removes internal metadata from student, teacher, and guardian projections", () => {
    const parsed = AgentRuntimeEventSchema.parse(baseEvent);
    const studentProjection = projectAgentRuntimeEvent(parsed, "student");
    const teacherProjection = projectAgentRuntimeEvent(
      {
        ...parsed,
        visibility_scope: {
          visible_to_roles: [UserRole.TEACHER, UserRole.ADMIN]
        }
      },
      "teacher"
    );
    const guardianProjection = projectAgentRuntimeEvent(
      {
        ...parsed,
        visibility_scope: {
          visible_to_roles: [UserRole.GUARDIAN, UserRole.ADMIN]
        }
      },
      "guardian"
    );

    expect(studentProjection?.internal_metadata).toBeUndefined();
    expect(teacherProjection?.internal_metadata).toBeUndefined();
    expect(guardianProjection?.internal_metadata).toBeUndefined();
  });

  it("preserves safe internal metadata for admin audit projections", () => {
    const parsed = AgentRuntimeEventSchema.parse(baseEvent);
    const projection = projectAgentRuntimeEvent(parsed, "admin_audit");

    expect(projection?.internal_metadata).toMatchObject({
      prompt_id: "student_mentor_turn",
      prompt_version: "v1"
    });
  });

  it("returns null when a role is outside the event visibility scope", () => {
    const parsed = AgentRuntimeEventSchema.parse(baseEvent);

    expect(projectAgentRuntimeEvent(parsed, "teacher")).toBeNull();
  });

  it("rejects student-private runtime events exposed beyond student or system", () => {
    const invalid = {
      ...baseEvent,
      privacy_level: PrivacyLevel.STUDENT_PRIVATE,
      visibility_scope: {
        visible_to_roles: [UserRole.STUDENT, UserRole.TEACHER]
      }
    };

    expect(() => AgentRuntimeEventSchema.parse(invalid)).toThrow();
  });
});
