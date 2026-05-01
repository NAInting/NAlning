import { describe, expect, it } from "vitest";

import { runMockStudentAgentRuntime } from "../src";

const fixedNow = () => new Date("2026-04-25T12:30:00.000Z");
const sourceAgentId = "11111111-1111-4111-8111-111111111111";
const studentId = "22222222-2222-4222-8222-222222222222";
const sessionId = "33333333-3333-4333-8333-333333333333";

describe("mock student agent runtime run", () => {
  it("emits the E3 minimum event sequence through the shared emitter", () => {
    const run = runMockStudentAgentRuntime({
      source_agent_id: sourceAgentId,
      trace_id: "trace_student_mock",
      run_id: "run_student_mock",
      session_id: sessionId,
      student_id: studentId,
      unit_id: "math_g8_linear_function_intro",
      stage_id: "stage_slope_anchor",
      topic_label: "slope meaning",
      knowledge_node_id: "lf_slope_meaning",
      runtime_block_id: "block_slope_anchor",
      now: fixedNow,
      id_generator: deterministicIdGenerator()
    });

    expect(run.events.map((event) => event.event_type)).toEqual([
      "stage_start",
      "progress",
      "source_anchor",
      "result",
      "done"
    ]);
    expect(run.events.map((event) => event.sequence)).toEqual([0, 1, 2, 3, 4]);
    expect(run.events.every((event) => event.student_id === studentId)).toBe(true);
    expect(run.events.every((event) => event.session_id === sessionId)).toBe(true);
  });

  it("returns safe audience projections without exposing student-private traces to teacher or guardian", () => {
    const run = runMockStudentAgentRuntime({
      source_agent_id: sourceAgentId,
      trace_id: "trace_projection_mock",
      run_id: "run_projection_mock",
      unit_id: "math_g8_linear_function_intro",
      stage_id: "stage_slope_anchor",
      knowledge_node_id: "lf_slope_meaning",
      runtime_block_id: "block_slope_anchor",
      source_reference: "knowledge.nodes.lf_slope_meaning",
      now: fixedNow,
      id_generator: deterministicIdGenerator()
    });

    expect(run.student_projection).toHaveLength(5);
    expect(run.teacher_projection).toHaveLength(0);
    expect(run.guardian_projection).toHaveLength(0);
    expect(run.admin_audit_projection).toHaveLength(5);
    expect(run.student_projection[0]!.internal_metadata).toBeUndefined();
    expect(run.admin_audit_projection[0]!.internal_metadata).toMatchObject({
      prompt_id: "mock_student_agent_runtime",
      provider_id: "local_mock"
    });
  });

  it("uses structured source anchors and does not emit raw dialogue-shaped payload keys", () => {
    const run = runMockStudentAgentRuntime({
      source_agent_id: sourceAgentId,
      trace_id: "trace_payload_mock",
      run_id: "run_payload_mock",
      unit_id: "math_g8_linear_function_intro",
      knowledge_node_id: "lf_slope_meaning",
      runtime_block_id: "block_slope_anchor",
      source_reference: "knowledge.nodes.lf_slope_meaning",
      now: fixedNow,
      id_generator: deterministicIdGenerator()
    });

    const sourceAnchor = run.events.find((event) => event.event_type === "source_anchor");
    expect(sourceAnchor?.payload.source_anchor).toEqual({
      source_id: "lf_slope_meaning",
      source_type: "knowledge_node",
      reference: "knowledge.nodes.lf_slope_meaning"
    });

    const serializedPayloads = JSON.stringify(run.events.map((event) => event.payload));
    expect(serializedPayloads).not.toContain("raw_prompt");
    expect(serializedPayloads).not.toContain("raw_output");
    expect(serializedPayloads).not.toContain("student_message");
    expect(serializedPayloads).not.toContain("conversation_text");
  });
});

function deterministicIdGenerator(): () => string {
  let next = 0;

  return () => {
    next += 1;
    return `00000000-0000-4000-8000-${next.toString().padStart(12, "0")}`;
  };
}
