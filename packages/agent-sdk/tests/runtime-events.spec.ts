import { randomUUID } from "node:crypto";

import { AgentType, PrivacyLevel, UserRole } from "@edu-ai/shared-types";
import { describe, expect, it } from "vitest";

import { createInMemoryAgentRuntimeEventEmitter } from "../src";

const fixedNow = () => new Date("2026-04-25T12:00:00.000Z");

describe("agent runtime event emitter", () => {
  it("emits schema-valid structured events with deterministic sequence ordering", () => {
    const emitter = createInMemoryAgentRuntimeEventEmitter({
      source_agent_id: randomUUID(),
      source_agent_type: AgentType.STUDENT_AGENT,
      trace_id: "trace_demo",
      run_id: "run_demo",
      now: fixedNow
    });

    const first = emitter.emit({
      event_type: "stage_start",
      domain: "academic",
      payload: {
        title: "开始讲解斜率"
      }
    });
    const second = emitter.emit({
      event_type: "progress",
      domain: "academic",
      payload: {
        progress: {
          current: 1,
          total: 3,
          label: "观察图像方向"
        }
      }
    });

    expect(first.sequence).toBe(0);
    expect(second.sequence).toBe(1);
    expect(emitter.list().map((event) => event.event_type)).toEqual(["stage_start", "progress"]);
  });

  it("projects only visible events and hides internal metadata from student views", () => {
    const emitter = createInMemoryAgentRuntimeEventEmitter({
      source_agent_id: randomUUID(),
      source_agent_type: AgentType.STUDENT_AGENT,
      default_visibility_scope: {
        visible_to_roles: [UserRole.STUDENT, UserRole.ADMIN]
      },
      now: fixedNow
    });

    emitter.emit({
      event_type: "tool_call",
      domain: "runtime",
      payload: {
        tool: {
          tool_name: "knowledge_node_lookup",
          invocation_id: "tool_001",
          status: "started"
        }
      },
      internal_metadata: {
        prompt_id: "student_agent_runtime",
        prompt_version: "v1",
        provider_id: "local_mock"
      }
    });

    const studentProjection = emitter.project("student");
    const teacherProjection = emitter.project("teacher");
    const adminProjection = emitter.project("admin_audit");

    expect(studentProjection).toHaveLength(1);
    expect(studentProjection[0]!.internal_metadata).toBeUndefined();
    expect(teacherProjection).toHaveLength(0);
    expect(adminProjection[0]!.internal_metadata).toMatchObject({
      prompt_id: "student_agent_runtime"
    });
  });

  it("fails closed when an event payload contains raw prompt or raw dialogue keys", () => {
    const emitter = createInMemoryAgentRuntimeEventEmitter({
      source_agent_id: randomUUID(),
      source_agent_type: AgentType.STUDENT_AGENT,
      now: fixedNow
    });

    expect(() =>
      emitter.emit({
        event_type: "content_delta",
        domain: "academic",
        payload: {
          content_delta: {
            text_delta: "安全的增量文本"
          },
          raw_prompt: "不允许记录完整 prompt"
        } as never
      })
    ).toThrow();

    expect(emitter.list()).toHaveLength(0);
  });

  it("requires emotion-domain events to remain campus-local", () => {
    const emitter = createInMemoryAgentRuntimeEventEmitter({
      source_agent_id: randomUUID(),
      source_agent_type: AgentType.STUDENT_AGENT,
      now: fixedNow
    });

    expect(() =>
      emitter.emit({
        event_type: "blocked",
        domain: "emotion",
        privacy_level: PrivacyLevel.STUDENT_PRIVATE,
        visibility_scope: {
          visible_to_roles: [UserRole.STUDENT]
        },
        payload: {
          blocked: {
            reason_code: "emotion_safety_route",
            safe_message: "这段会留在校内本地处理。"
          }
        }
      })
    ).toThrow();
  });

  it("accepts campus-local emotion events without exposing them to teachers or guardians", () => {
    const emitter = createInMemoryAgentRuntimeEventEmitter({
      source_agent_id: randomUUID(),
      source_agent_type: AgentType.STUDENT_AGENT,
      now: fixedNow
    });

    emitter.emit({
      event_type: "blocked",
      domain: "emotion",
      privacy_level: PrivacyLevel.CAMPUS_LOCAL_ONLY,
      visibility_scope: {
        visible_to_roles: [UserRole.SYSTEM, UserRole.ADMIN]
      },
      payload: {
        blocked: {
          reason_code: "emotion_safety_route",
          safe_message: "已切换到校内本地安全路径。"
        }
      }
    });

    expect(emitter.project("teacher")).toHaveLength(0);
    expect(emitter.project("guardian")).toHaveLength(0);
    expect(emitter.project("admin_audit")).toHaveLength(1);
  });
});
