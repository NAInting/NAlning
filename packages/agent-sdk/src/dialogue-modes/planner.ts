import { AgentMode } from "@edu-ai/shared-types";

import { studentCanSeeMastery } from "../mastery-evaluator";
import {
  answerPolicyForMode,
  detectDialogueIntent,
  mustUseCampusLocal,
  selectDialogueMode,
  shouldOfferHint
} from "./policy";
import {
  STUDENT_DIALOGUE_POLICY_VERSION,
  STUDENT_DIALOGUE_PROMPT_VERSION,
  type BuildDialogueModePlanInput,
  type DialogueModePlan
} from "./types";

export function buildDialogueModePlan(input: BuildDialogueModePlanInput): DialogueModePlan {
  const intent = detectDialogueIntent(input.student_message);
  const modeInput: Parameters<typeof selectDialogueMode>[0] = { intent };
  if (input.requested_mode) {
    modeInput.requested_mode = input.requested_mode;
  }

  if (input.current_mode) {
    modeInput.current_mode = input.current_mode;
  }

  const mode = selectDialogueMode(modeInput);
  const answerPolicy = answerPolicyForMode({ mode, intent });
  const campusLocal = mustUseCampusLocal(intent);
  const { memorySummaries, blockedMemoryReasons } = safeMemorySummaries(input.memory_context ?? []);
  const { masterySummary, masteryBlockedReason } = safeMasterySummary(input.mastery_record);
  const hintInput: Parameters<typeof shouldOfferHint>[0] = { mode };
  if (input.stuck_count !== undefined) {
    hintInput.stuck_count = input.stuck_count;
  }

  const blockedContextReasons = [
    ...blockedMemoryReasons,
    ...(masteryBlockedReason ? [masteryBlockedReason] : [])
  ];

  return {
    mode,
    intent,
    answer_policy: answerPolicy,
    policy_version: STUDENT_DIALOGUE_POLICY_VERSION,
    prompt_version: STUDENT_DIALOGUE_PROMPT_VERSION,
    should_offer_hint: shouldOfferHint(hintInput),
    must_not: mustNotRules(answerPolicy),
    response_moves: responseMoves(answerPolicy),
    safe_context: {
      ...(input.knowledge_node ? { knowledge_node_id: input.knowledge_node.id, knowledge_node_title: input.knowledge_node.title } : {}),
      ...(masterySummary ? { mastery_summary: masterySummary } : {}),
      memory_summaries: memorySummaries
    },
    blocked_context_reasons: blockedContextReasons,
    privacy_flags: {
      must_use_campus_local: campusLocal,
      expose_raw_memory: false,
      expose_reasoning_chain: false,
      reasons: campusLocal ? ["frustration intent requires local handling until Phase 1.6 routing is attached"] : []
    }
  };
}

function safeMemorySummaries(context: readonly { bucket: string; summary: string }[]): {
  memorySummaries: string[];
  blockedMemoryReasons: string[];
} {
  const memorySummaries: string[] = [];
  const blockedMemoryReasons: string[] = [];

  for (const item of context) {
    if (item.bucket === "emotional") {
      blockedMemoryReasons.push("emotional memory is not allowed in normal dialogue prompt context");
      continue;
    }

    memorySummaries.push(item.summary);
  }

  return { memorySummaries, blockedMemoryReasons };
}

function safeMasterySummary(record: BuildDialogueModePlanInput["mastery_record"]): {
  masterySummary?: string;
  masteryBlockedReason?: string;
} {
  if (!record) {
    return {};
  }

  if (!studentCanSeeMastery(record)) {
    return { masteryBlockedReason: "mastery record is blocked by visibility or confidence gates" };
  }

  return {
    masterySummary: `node=${record.knowledge_node_id};level=${record.current_level};confidence=${record.confidence};evidence_count=${record.evidence_count}`
  };
}

function mustNotRules(policy: string): string[] {
  const base = [
    "do not expose raw conversation text",
    "do not expose hidden reasoning chains",
    "do not label the student as lazy or incapable",
    "do not compare the student with classmates",
    "do not diagnose mental health"
  ];

  if (policy === "boundary_refusal_with_alternative") {
    return [...base, "do not provide a submittable homework answer"];
  }

  if (policy === "socratic_prompt") {
    return [...base, "do not give the final answer before the student attempts the next step"];
  }

  return base;
}

function responseMoves(policy: string): string[] {
  if (policy === "boundary_refusal_with_alternative") {
    return [
      "acknowledge the student's desire for speed",
      "state the boundary against submittable answers",
      "offer a first step, hint, or parallel example"
    ];
  }

  if (policy === "clear_explanation_with_check") {
    return [
      "give a concise explanation",
      "connect it to the current knowledge node when safe",
      "ask one small check question"
    ];
  }

  if (policy === "support_and_shrink_task") {
    return [
      "acknowledge frustration without diagnosis",
      "shrink the task to one observable next action",
      "avoid long explanation"
    ];
  }

  return [
    "acknowledge the question",
    "ask one focused Socratic question",
    "wait for the student's attempt before explaining further"
  ];
}
