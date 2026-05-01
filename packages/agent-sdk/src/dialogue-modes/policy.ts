import { AgentMode } from "@edu-ai/shared-types";

import type { DialogueAnswerPolicy, DialogueIntent } from "./types";

export function detectDialogueIntent(message: string): DialogueIntent {
  const normalized = message.trim().toLowerCase();

  if (containsAny(normalized, ["可提交答案", "直接给答案", "帮我写完", "替我写", "代写", "抄答案"])) {
    return "submittable_answer_request";
  }

  if (containsAny(normalized, ["烦死", "不想学", "崩溃", "太难了", "学不会", "不学了"])) {
    return "frustration";
  }

  if (containsAny(normalized, ["只想知道", "直接告诉", "为什么", "讲清楚", "答案是什么"])) {
    return "direct_explanation_request";
  }

  if (containsAny(normalized, ["怎么做", "怎么想", "不会", "看不懂", "这题"])) {
    return "concept_question";
  }

  return "unknown";
}

export function selectDialogueMode(input: {
  intent: DialogueIntent;
  requested_mode?: AgentMode.MENTOR | AgentMode.TUTOR;
  current_mode?: AgentMode.MENTOR | AgentMode.TUTOR | AgentMode.COMPANION;
}): AgentMode.MENTOR | AgentMode.TUTOR | AgentMode.COMPANION {
  if (input.intent === "frustration") {
    return AgentMode.COMPANION;
  }

  if (input.intent === "submittable_answer_request") {
    return input.requested_mode ?? input.current_mode ?? AgentMode.MENTOR;
  }

  if (input.requested_mode) {
    return input.requested_mode;
  }

  if (input.intent === "direct_explanation_request") {
    return AgentMode.TUTOR;
  }

  return input.current_mode ?? AgentMode.MENTOR;
}

export function answerPolicyForMode(input: {
  mode: AgentMode.MENTOR | AgentMode.TUTOR | AgentMode.COMPANION;
  intent: DialogueIntent;
}): DialogueAnswerPolicy {
  if (input.intent === "submittable_answer_request") {
    return "boundary_refusal_with_alternative";
  }

  if (input.mode === AgentMode.TUTOR) {
    return "clear_explanation_with_check";
  }

  if (input.mode === AgentMode.COMPANION) {
    return "support_and_shrink_task";
  }

  return "socratic_prompt";
}

export function shouldOfferHint(input: {
  mode: AgentMode.MENTOR | AgentMode.TUTOR | AgentMode.COMPANION;
  stuck_count?: number;
}): boolean {
  return input.mode === AgentMode.MENTOR && (input.stuck_count ?? 0) >= 3;
}

export function mustUseCampusLocal(intent: DialogueIntent): boolean {
  return intent === "frustration";
}

function containsAny(value: string, keywords: readonly string[]): boolean {
  return keywords.some((keyword) => value.includes(keyword.toLowerCase()));
}
