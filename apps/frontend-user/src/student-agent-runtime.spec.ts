import { AgentMode, PrivacyLevel, type AgentRuntimeEventProjection } from "@edu-ai/shared-types";
import { describe, expect, it } from "vitest";

import {
  canShowEvidenceAiPrompts,
  chineseL001DemoCourse,
  findDemoCoursePrivacyLeaks,
  isNoAiDemoPage,
  type DemoPage
} from "./chinese-l001-demo-course";
import { buildStudentAgentTurn } from "./student-agent-runtime";
import { buildStudentRuntimeProjectionDemo, formatRuntimeProjectionTimeline } from "./student-runtime-events";

describe("student agent runtime bridge", () => {
  it("keeps ordinary mentor questions on controlled cloud with Socratic policy", () => {
    const result = buildStudentAgentTurn({
      message: "这题应该怎么想？",
      requested_mode: AgentMode.MENTOR,
      previous_student_turns: 0,
      detected_at: "2026-04-22T08:00:00.000Z"
    });

    expect(result.route_selected).toBe("controlled_cloud");
    expect(result.answer_policy).toBe("socratic_prompt");
    expect(result.signal_ready_for_backend).toBe(false);
  });

  it("uses tutor explanation policy when the student asks for why", () => {
    const result = buildStudentAgentTurn({
      message: "为什么意象会影响情感基调？",
      requested_mode: AgentMode.TUTOR,
      previous_student_turns: 0,
      detected_at: "2026-04-22T08:00:00.000Z"
    });

    expect(result.answer_policy).toBe("clear_explanation_with_check");
    expect(result.assistant_message).toContain("意象不是孤立景物");
  });

  it("refuses submittable answer requests while offering a first step", () => {
    const result = buildStudentAgentTurn({
      message: "直接给答案，我要抄答案",
      requested_mode: AgentMode.TUTOR,
      previous_student_turns: 0,
      detected_at: "2026-04-22T08:00:00.000Z"
    });

    expect(result.answer_policy).toBe("boundary_refusal_with_alternative");
    expect(result.assistant_message).toContain("不能替你生成可提交赏析段");
  });

  it("routes frustration to campus local without queuing a cross-agent signal", () => {
    const result = buildStudentAgentTurn({
      message: "太难了，我不想学了",
      requested_mode: AgentMode.MENTOR,
      previous_student_turns: 1,
      detected_at: "2026-04-22T08:00:00.000Z"
    });

    expect(result.route_selected).toBe("campus_local");
    expect(result.risk_level).toBe("local_only");
    expect(result.signal_ready_for_backend).toBe(false);
    expect(result.assistant_message).toContain("只选一个文本锚点");
  });

  it("keeps yellow risk local and only exposes abstract signal readiness", () => {
    const result = buildStudentAgentTurn({
      message: "我有点崩溃，真的撑不住了",
      requested_mode: AgentMode.MENTOR,
      previous_student_turns: 2,
      detected_at: "2026-04-22T08:00:00.000Z"
    });

    expect(result.route_selected).toBe("campus_local");
    expect(result.risk_level).toBe("yellow");
    expect(result.should_pause_academic_task).toBe(true);
    expect(result.signal_ready_for_backend).toBe(true);
    expect(JSON.stringify(result)).not.toContain("崩溃");
  });

  it("keeps red risk local and does not expose the triggering phrase", () => {
    const result = buildStudentAgentTurn({
      message: "我不想活了",
      requested_mode: AgentMode.MENTOR,
      previous_student_turns: 2,
      detected_at: "2026-04-22T08:00:00.000Z"
    });

    expect(result.route_selected).toBe("campus_local");
    expect(result.risk_level).toBe("red");
    expect(result.signal_ready_for_backend).toBe(true);
    expect(JSON.stringify(result)).not.toContain("不想活");
  });

  it("formats student runtime projections into a safe visible timeline", () => {
    const projections = buildStudentRuntimeProjectionDemo();
    const timeline = formatRuntimeProjectionTimeline(projections);

    expect(projections).toHaveLength(5);
    expect(timeline.map((item) => item.event_type)).toEqual([
      "stage_start",
      "progress",
      "source_anchor",
      "result",
      "done"
    ]);
    expect(timeline[2]).toMatchObject({
      event_type: "source_anchor",
      source_reference: "知识节点 · authorized_text_anchor.T2"
    });
    expect(JSON.stringify(timeline)).not.toContain("prompt_id");
    expect(JSON.stringify(timeline)).not.toContain("local_mock");
  });

  it("does not render admin-only internal metadata even if an audit projection is passed in", () => {
    const auditProjection: AgentRuntimeEventProjection = {
      id: "00000000-0000-4000-8000-000000000001",
      trace_id: "trace_admin_projection",
      run_id: "run_admin_projection",
      sequence: 0,
      event_type: "stage_start",
      domain: "academic",
      privacy_level: PrivacyLevel.STUDENT_PRIVATE,
      occurred_at: "2026-04-25T12:30:00.000Z",
      payload: {
        title: "Nova started",
        summary: "Student-visible summary."
      },
      internal_metadata: {
        prompt_id: "mock_student_agent_runtime",
        provider_id: "local_mock"
      }
    };
    const timeline = formatRuntimeProjectionTimeline([auditProjection]);

    expect(auditProjection.internal_metadata).toMatchObject({
      prompt_id: "mock_student_agent_runtime",
      provider_id: "local_mock"
    });
    expect(JSON.stringify(timeline)).not.toContain("prompt_id");
    expect(JSON.stringify(timeline)).not.toContain("local_mock");
    expect(JSON.stringify(timeline)).not.toContain("internal_metadata");
  });

  it("keeps the Chinese L001 demo course locked to mock-only safe defaults", () => {
    expect(chineseL001DemoCourse.mode).toBe("mock_only_frontend_prototype");
    expect(findDemoCoursePrivacyLeaks()).toEqual([]);
    expect(chineseL001DemoCourse.authorizedTextAnchorPolicy.fullTextEmbedded).toBe(false);
    expect(chineseL001DemoCourse.authorizedTextAnchorPolicy.textbookScanEmbedded).toBe(false);
    expect(chineseL001DemoCourse.pages).toHaveLength(7);
  });

  it("keeps No-AI pages closed to AI prompts", () => {
    const noAiPages = (chineseL001DemoCourse.pages as readonly DemoPage[]).filter((page) => isNoAiDemoPage(page));

    expect(noAiPages.map((page) => page.pageId)).toEqual(["P01", "P07"]);
    noAiPages.forEach((page) => {
      expect(page.allowedAiPrompts).toBeUndefined();
    });
  });

  it("does not open evidence-card AI prompts until two anchors are present", () => {
    expect(canShowEvidenceAiPrompts(0)).toBe(false);
    expect(canShowEvidenceAiPrompts(1)).toBe(false);
    expect(canShowEvidenceAiPrompts(2)).toBe(true);
  });

  it("keeps teacher preview to aggregate signals and suggested actions", () => {
    const teacherVisiblePayload = JSON.stringify({
      classSummary: chineseL001DemoCourse.teacherPreview.classSummary,
      suggestedTeacherActions: chineseL001DemoCourse.teacherPreview.suggestedTeacherActions,
      pageSignals: chineseL001DemoCourse.pages.map((page) => page.teacherSignals)
    });

    expect(teacherVisiblePayload).not.toContain("raw_student_text");
    expect(teacherVisiblePayload).not.toContain("raw_audio");
    expect(teacherVisiblePayload).not.toContain("full_transcript");
    expect(teacherVisiblePayload).not.toContain("raw_ai_dialogue");
    expect(teacherVisiblePayload).not.toContain("emotion_original");
    expect(teacherVisiblePayload).not.toContain("family_experience");
  });
});
