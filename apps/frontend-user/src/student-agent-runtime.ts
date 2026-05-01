import { buildDialogueModePlan, type DialogueAnswerPolicy } from "@edu-ai/agent-sdk/dialogue-modes";
import { decideStudentPrivacyRoute, type StudentRouteSelected } from "@edu-ai/privacy-filter/student-emotion-router";
import { AgentMode } from "@edu-ai/shared-types";

export interface StudentAgentTurnInput {
  message: string;
  requested_mode: AgentMode.MENTOR | AgentMode.TUTOR;
  previous_student_turns: number;
  detected_at?: string;
}

export interface StudentAgentTurnResult {
  route_selected: StudentRouteSelected;
  mode: AgentMode.MENTOR | AgentMode.TUTOR | AgentMode.COMPANION;
  answer_policy: DialogueAnswerPolicy;
  assistant_message: string;
  risk_level: "green" | "local_only" | "yellow" | "red";
  should_pause_academic_task: boolean;
  signal_ready_for_backend: boolean;
}

const demoStudentId = "11111111-1111-4111-8111-111111111111";
const demoSourceAgentId = "22222222-2222-4222-8222-222222222222";
const demoTargetAgentId = "33333333-3333-4333-8333-333333333333";
const demoAuditLogId = "44444444-4444-4444-8444-444444444444";

export function buildStudentAgentTurn(input: StudentAgentTurnInput): StudentAgentTurnResult {
  const routeDecision = decideStudentPrivacyRoute({
    student_id: demoStudentId,
    source_agent_id: demoSourceAgentId,
    target_agent_id: demoTargetAgentId,
    audit_log_id: demoAuditLogId,
    message: input.message,
    detected_at: input.detected_at ?? new Date().toISOString()
  });
  const plan = buildDialogueModePlan({
    student_message: input.message,
    requested_mode: input.requested_mode,
    current_mode: input.requested_mode,
    stuck_count: input.previous_student_turns,
    knowledge_node: {
      id: "math_g8_linear_function_slope_k",
      title: "斜率 k 的意义",
      mastery_criteria: "能解释 k 与图像倾斜方向的关系，并能用图像判断 k 的正负。",
      common_misconceptions: [
        {
          description: "把 k 和 b 的作用混淆",
          example: "认为 b 变大时直线会变得更陡。",
          correction_strategy: "先固定 k，只改变 b，观察整条直线的上下平移。"
        }
      ]
    }
  });
  const routeSelected: StudentRouteSelected = plan.privacy_flags.must_use_campus_local
    ? "campus_local"
    : routeDecision.route_selected;

  return {
    route_selected: routeSelected,
    mode: plan.mode,
    answer_policy: plan.answer_policy,
    assistant_message: assistantMessageFor(plan.answer_policy, routeDecision.should_pause_academic_task),
    risk_level: routeDecision.risk_level,
    should_pause_academic_task: routeDecision.should_pause_academic_task,
    signal_ready_for_backend: Boolean(routeDecision.signal)
  };
}

function assistantMessageFor(policy: DialogueAnswerPolicy, shouldPauseAcademicTask: boolean): string {
  if (shouldPauseAcademicTask || policy === "support_and_shrink_task") {
    return "先把任务缩小：现在只看图像是上升还是下降。这个判断不用算式，凭图像直觉先说一句就好。";
  }

  if (policy === "boundary_refusal_with_alternative") {
    return "我不能替你生成可提交答案，但可以陪你走第一步：先判断 k 是正数还是负数，再看图像朝哪个方向倾斜。";
  }

  if (policy === "clear_explanation_with_check") {
    return "可以。k 决定图像的倾斜方向和陡峭程度，b 决定图像与 y 轴的交点。你检查一下：如果 b 变大，整条直线会怎样移动？";
  }

  return "你先选一个入口：看图像的倾斜，还是看它和 y 轴的交点？我们只走一步。";
}
