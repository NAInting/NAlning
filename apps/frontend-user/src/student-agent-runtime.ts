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
      id: "cn_l001_imagery_emotional_tone",
      title: "意象、动作色彩空间与情感基调",
      mastery_criteria: "能用文本锚点说明意象如何通过动作、色彩或空间关系形成精神气象。",
      common_misconceptions: [
        {
          description: "只背主题，没有回到文本证据",
          example: "直接说昂扬向上，但没有说明来自哪个意象和中间层。",
          correction_strategy: "先补一个文本锚点，再追问动作、色彩或空间关系。"
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
    return "先把任务缩小：现在只选一个文本锚点，说清你看见了什么。暂时不用概括主题。";
  }

  if (policy === "boundary_refusal_with_alternative") {
    return "我不能替你生成可提交赏析段，但可以陪你走第一步：先选一个锚点，再说它的动作、色彩或空间感。";
  }

  if (policy === "clear_explanation_with_check") {
    return "可以。意象不是孤立景物，要经过动作、色彩或空间关系，才会形成情感基调。你检查一下：你的判断来自哪个中间层？";
  }

  return "你先选一个文本锚点：它让你看见了什么动作、色彩或空间关系？我们只走这一步。";
}
