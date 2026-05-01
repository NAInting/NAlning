import type { KnowledgeNode, MasteryRecord } from "@edu-ai/shared-types";
import { AgentMode } from "@edu-ai/shared-types";

export type DialogueIntent =
  | "concept_question"
  | "direct_explanation_request"
  | "submittable_answer_request"
  | "frustration"
  | "unknown";

export type DialogueAnswerPolicy =
  | "socratic_prompt"
  | "clear_explanation_with_check"
  | "support_and_shrink_task"
  | "boundary_refusal_with_alternative";

export type DialogueMemoryBucket = "academic" | "personal" | "emotional";

export interface DialogueMemoryContext {
  bucket: DialogueMemoryBucket;
  summary: string;
}

export interface BuildDialogueModePlanInput {
  student_message: string;
  requested_mode?: AgentMode.MENTOR | AgentMode.TUTOR;
  current_mode?: AgentMode.MENTOR | AgentMode.TUTOR | AgentMode.COMPANION;
  stuck_count?: number;
  knowledge_node?: Pick<KnowledgeNode, "id" | "title" | "mastery_criteria" | "common_misconceptions">;
  mastery_record?: MasteryRecord;
  memory_context?: readonly DialogueMemoryContext[];
}

export interface DialogueModePlan {
  mode: AgentMode.MENTOR | AgentMode.TUTOR | AgentMode.COMPANION;
  intent: DialogueIntent;
  answer_policy: DialogueAnswerPolicy;
  policy_version: string;
  prompt_version: string;
  should_offer_hint: boolean;
  must_not: readonly string[];
  response_moves: readonly string[];
  safe_context: {
    knowledge_node_id?: string;
    knowledge_node_title?: string;
    mastery_summary?: string;
    memory_summaries: readonly string[];
  };
  blocked_context_reasons: readonly string[];
  privacy_flags: {
    must_use_campus_local: boolean;
    expose_raw_memory: false;
    expose_reasoning_chain: false;
    reasons: readonly string[];
  };
}

export const STUDENT_DIALOGUE_POLICY_VERSION = "student-dialogue-modes-v0.1";
export const STUDENT_DIALOGUE_PROMPT_VERSION = "student-dialogue-prompt-contract-v0.1";
