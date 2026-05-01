import { randomUUID } from "node:crypto";

import {
  InterAgentSignalType,
  PrivacyLevel,
  SignalUrgency,
  TargetAgentType,
  type InterAgentSignal
} from "@edu-ai/shared-types";
import { describe, expect, it } from "vitest";

import { decideStudentPrivacyRoute, validateSignalPrivacy } from "../src";

const studentId = "11111111-1111-4111-8111-111111111111";
const sourceAgentId = "22222222-2222-4222-8222-222222222222";
const targetAgentId = "33333333-3333-4333-8333-333333333333";
const auditLogId = "44444444-4444-4444-8444-444444444444";
const detectedAt = "2026-04-22T10:00:00.000Z";

describe("privacy filter", () => {
  it("keeps ordinary academic messages on the controlled cloud route", () => {
    const decision = decideStudentPrivacyRoute(baseInput("请帮我理解一次函数的斜率。"));

    expect(decision.risk_level).toBe("green");
    expect(decision.route_selected).toBe("controlled_cloud");
    expect(decision.privacy_level).toBe(PrivacyLevel.STUDENT_PRIVATE);
    expect(decision.should_pause_academic_task).toBe(false);
    expect(decision.signal).toBeUndefined();
  });

  it("routes mild frustration to campus local without sending an inter-agent signal", () => {
    const decision = decideStudentPrivacyRoute(baseInput("这题太难了，我学不会。"));

    expect(decision.risk_level).toBe("local_only");
    expect(decision.route_selected).toBe("campus_local");
    expect(decision.privacy_level).toBe(PrivacyLevel.CAMPUS_LOCAL_ONLY);
    expect(decision.should_pause_academic_task).toBe(false);
    expect(decision.signal).toBeUndefined();
  });

  it("turns yellow emotional language into an abstract emotion anomaly signal", () => {
    const decision = decideStudentPrivacyRoute(baseInput("我最近有点崩溃，也不想回家。"));

    expect(decision.risk_level).toBe("yellow");
    expect(decision.route_selected).toBe("campus_local");
    expect(decision.should_pause_academic_task).toBe(true);
    expect(decision.signal?.signal_type).toBe(InterAgentSignalType.EMOTION_ANOMALY);
    expect(decision.signal?.privacy_filter_passed).toBe(true);
    expect(JSON.stringify(decision.signal)).not.toContain("崩溃");
    expect(JSON.stringify(decision.signal)).not.toContain("不想回家");
    expect(JSON.stringify(decision.signal)).not.toContain("conversation_excerpt");
  });

  it("turns red safety language into a critical abstract risk alert", () => {
    const decision = decideStudentPrivacyRoute(baseInput("我不想活了，也想伤害自己。"));

    expect(decision.risk_level).toBe("red");
    expect(decision.route_selected).toBe("campus_local");
    expect(decision.should_pause_academic_task).toBe(true);
    expect(decision.signal?.signal_type).toBe(InterAgentSignalType.RISK_ALERT);
    expect(decision.signal?.urgency).toBe(SignalUrgency.CRITICAL);
    expect(decision.signal?.payload).toMatchObject({
      student_id: studentId,
      requires_immediate_action: true
    });
    expect(JSON.stringify(decision.signal)).not.toContain("不想活");
    expect(JSON.stringify(decision.signal)).not.toContain("伤害自己");
  });

  it("rejects inter-agent signals that carry raw conversation fields", () => {
    const signal = validSignalWithPayload({
      student_id: studentId,
      severity: "medium",
      suggested_action: "gentle_check_in",
      detected_at: detectedAt,
      conversation_excerpt: "raw student text must not pass"
    });

    const result = validateSignalPrivacy(signal);

    expect(result.passed).toBe(false);
    expect(result.violations.some((violation) => violation.includes("conversation_excerpt"))).toBe(true);
  });
});

function baseInput(message: string) {
  return {
    student_id: studentId,
    source_agent_id: sourceAgentId,
    target_agent_id: targetAgentId,
    target_agent_type: TargetAgentType.TEACHER_AGENT,
    audit_log_id: auditLogId,
    message,
    detected_at: detectedAt
  };
}

function validSignalWithPayload(payload: Record<string, unknown>): InterAgentSignal {
  return {
    id: randomUUID(),
    created_at: detectedAt,
    updated_at: detectedAt,
    version: 1,
    source_agent_id: sourceAgentId,
    source_agent_type: "student_agent",
    source_student_id: studentId,
    target_agent_type: TargetAgentType.TEACHER_AGENT,
    target_agent_id: targetAgentId,
    signal_type: InterAgentSignalType.EMOTION_ANOMALY,
    payload: payload as unknown as InterAgentSignal["payload"],
    privacy_filter_passed: true,
    privacy_filter_version: "privacy-filter-v0.1",
    urgency: SignalUrgency.MEDIUM,
    audit_log_id: auditLogId
  };
}
