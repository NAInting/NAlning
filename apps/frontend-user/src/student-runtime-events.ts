import type {
  AgentRuntimeEventProjection,
  AgentRuntimeEventPayload,
  AgentRuntimeEventType
} from "@edu-ai/shared-types";
import { PrivacyLevel } from "@edu-ai/shared-types";

export interface RuntimeTimelineItem {
  id: string;
  event_type: AgentRuntimeEventType;
  badge: string;
  title: string;
  body: string;
  occurred_at: string;
  progress_label?: string;
  source_reference?: string;
  result_code?: string;
}

export function buildStudentRuntimeProjectionDemo(): readonly AgentRuntimeEventProjection[] {
  return [
    createProjection(0, "stage_start", "academic", {
      title: "Nova 开始这一小步",
      summary: "学习焦点：斜率 k 的意义。"
    }),
    createProjection(1, "progress", "academic", {
      progress: {
        current: 1,
        total: 3,
        label: "先把概念锚点和当前练习块对齐"
      }
    }),
    createProjection(2, "source_anchor", "content", {
      source_anchor: {
        source_id: "lf_slope_meaning",
        source_type: "knowledge_node",
        reference: "knowledge.nodes.lf_slope_meaning"
      }
    }),
    createProjection(3, "result", "academic", {
      result: {
        result_code: "mock_student_agent_guidance_ready",
        summary: "下一步可以进入一次 No-AI 口头解释检查。"
      }
    }),
    createProjection(4, "done", "runtime", {
      title: "本轮引导完成",
      summary: "这里只展示学生可见的结构化运行轨迹。"
    })
  ];
}

export function formatRuntimeProjectionTimeline(
  events: readonly AgentRuntimeEventProjection[]
): RuntimeTimelineItem[] {
  return events.map((event) => {
    const payload = event.payload;
    const item: RuntimeTimelineItem = {
      id: event.id,
      event_type: event.event_type,
      badge: badgeForEvent(event.event_type),
      title: titleForEvent(event.event_type, payload),
      body: bodyForPayload(payload),
      occurred_at: event.occurred_at
    };

    const progressLabel = formatProgress(payload);
    if (progressLabel) {
      item.progress_label = progressLabel;
    }

    if (payload.source_anchor) {
      item.source_reference = `${sourceTypeLabel(payload.source_anchor.source_type)} · ${payload.source_anchor.reference}`;
    }

    if (payload.result) {
      item.result_code = payload.result.result_code;
    }

    return item;
  });
}

function badgeForEvent(eventType: AgentRuntimeEventType): string {
  switch (eventType) {
    case "stage_start":
      return "开始";
    case "progress":
      return "推进";
    case "source_anchor":
      return "依据";
    case "result":
      return "结果";
    case "done":
      return "完成";
    case "error":
      return "需处理";
    case "blocked":
      return "暂停";
    case "stage_end":
      return "阶段完成";
    case "tool_call":
      return "工具调用";
    case "tool_result":
      return "工具结果";
    case "content_delta":
      return "生成中";
  }
}

function titleForEvent(eventType: AgentRuntimeEventType, payload: AgentRuntimeEventPayload): string {
  if (payload.title) {
    return payload.title;
  }

  switch (eventType) {
    case "stage_start":
      return "Nova 开始这一小步";
    case "progress":
      return "Nova 正在推进学习路径";
    case "source_anchor":
      return "Nova 找到了本轮依据";
    case "result":
      return "Nova 准备好下一步";
    case "done":
      return "本轮引导完成";
    case "error":
      return "这一小步需要重新尝试";
    case "blocked":
      return "这一小步先暂停";
    case "stage_end":
      return "阶段已经收束";
    case "tool_call":
      return "Nova 正在使用学习工具";
    case "tool_result":
      return "学习工具返回结果";
    case "content_delta":
      return "Nova 正在组织表达";
  }
}

function bodyForPayload(payload: AgentRuntimeEventPayload): string {
  if (payload.summary) {
    return payload.summary;
  }

  if (payload.progress?.label) {
    return payload.progress.label;
  }

  if (payload.source_anchor) {
    return `依据已锚定到 ${sourceTypeLabel(payload.source_anchor.source_type)}。`;
  }

  if (payload.result) {
    return payload.result.summary;
  }

  if (payload.error) {
    return payload.error.safe_message;
  }

  if (payload.blocked) {
    return payload.blocked.safe_message;
  }

  if (payload.tool) {
    return `${payload.tool.tool_name}：${payload.tool.status}`;
  }

  if (payload.content_delta?.text_delta) {
    return payload.content_delta.text_delta;
  }

  return "Nova 正在处理这个学习步骤。";
}

function formatProgress(payload: AgentRuntimeEventPayload): string | undefined {
  if (!payload.progress) {
    return undefined;
  }

  const { current, total, label } = payload.progress;
  if (current !== undefined && total !== undefined) {
    return `${current}/${total}${label ? ` · ${label}` : ""}`;
  }

  return label;
}

function sourceTypeLabel(sourceType: string): string {
  switch (sourceType) {
    case "knowledge_node":
      return "知识节点";
    case "runtime_block":
      return "学习块";
    case "assessment_item":
      return "评估项";
    case "memory_summary":
      return "记忆摘要";
    case "tool_result":
      return "工具结果";
    case "unit":
      return "课程单元";
    default:
      return "来源";
  }
}

function createProjection(
  sequence: number,
  eventType: AgentRuntimeEventType,
  domain: AgentRuntimeEventProjection["domain"],
  payload: AgentRuntimeEventPayload
): AgentRuntimeEventProjection {
  return {
    id: `00000000-0000-4000-8000-${(sequence + 1).toString().padStart(12, "0")}`,
    trace_id: "trace_frontend_student_runtime_demo",
    run_id: "run_frontend_student_runtime_demo",
    sequence,
    event_type: eventType,
    domain,
    privacy_level: PrivacyLevel.STUDENT_PRIVATE,
    occurred_at: "2026-04-25T12:30:00.000Z",
    payload
  };
}
