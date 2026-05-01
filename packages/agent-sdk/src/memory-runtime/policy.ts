import type { MemoryBucket } from "@edu-ai/memory-store";
import { PrivacyLevel, UserRole, type ConversationTurn, type VisibilityScope } from "@edu-ai/shared-types";

import type { MemorySummaryCandidate, TeacherEvidenceReference } from "./types";

export const DEFAULT_WORKING_MEMORY_WINDOW = 40;
export const MAX_WORKING_MEMORY_WINDOW = 100;
export const MIN_EPISODIC_CONFIDENCE = 0.55;
export const MIN_SEMANTIC_CONFIDENCE = 0.7;
export const MIN_SEMANTIC_EVIDENCE_COUNT = 3;
export const MIN_SEMANTIC_OBSERVATION_DAYS = 7;

const FORBIDDEN_TEACHER_EVIDENCE_PATTERNS = [
  /^conversation:/i,
  /^turn:/i,
  /^message:/i,
  /^keyword:/i,
  /^range:/i,
  /conversation_id/i,
  /turn_id/i,
  /source_turn_range/i
];

export function assertWorkingMemoryWindow(size: number): void {
  if (!Number.isInteger(size) || size <= 0 || size > MAX_WORKING_MEMORY_WINDOW) {
    throw new Error(`Working memory window must be between 1 and ${MAX_WORKING_MEMORY_WINDOW}`);
  }
}

export function assertCandidatePolicy(candidate: MemorySummaryCandidate): void {
  if (candidate.confidence < MIN_EPISODIC_CONFIDENCE) {
    throw new Error("Memory summary confidence is too low for episodic storage");
  }

  if (candidate.memory_bucket === "emotional" && candidate.confidence < 0.7) {
    throw new Error("Emotional memory requires high confidence before storage");
  }
}

export function assertNoRawTurnLeak(summaryText: string, turns: readonly ConversationTurn[]): void {
  const normalizedSummary = normalize(summaryText);

  for (const turn of turns) {
    const normalizedTurn = normalize(turn.content);
    if (normalizedTurn.length >= 16 && normalizedSummary.includes(normalizedTurn)) {
      throw new Error("Memory summary must not contain raw conversation text");
    }
  }
}

export function privacyForBucket(bucket: MemoryBucket): {
  privacy_level: "private" | "campus_local_only";
  deployment_scope: "controlled_cloud" | "campus_local";
} {
  if (bucket === "emotional") {
    return {
      privacy_level: "campus_local_only",
      deployment_scope: "campus_local"
    };
  }

  return {
    privacy_level: "private",
    deployment_scope: "controlled_cloud"
  };
}

export function visibilityForBucket(bucket: MemoryBucket): VisibilityScope {
  if (bucket === "academic") {
    return {
      visible_to_roles: [UserRole.STUDENT, UserRole.TEACHER],
      excluded_fields_by_role: {
        [UserRole.TEACHER]: ["source_conversation_id", "source_turn_range", "summary_raw_basis"]
      }
    };
  }

  return {
    visible_to_roles: [UserRole.STUDENT],
    excluded_fields_by_role: {
      [UserRole.TEACHER]: ["summary", "source_conversation_id", "source_turn_range"],
      [UserRole.GUARDIAN]: ["summary", "source_conversation_id", "source_turn_range"]
    }
  };
}

export function assertSemanticConfidence(confidence: number): void {
  if (confidence < MIN_SEMANTIC_CONFIDENCE) {
    throw new Error("Semantic memory snapshot requires confidence >= 0.7");
  }
}

export function assertSemanticEvidenceGate(input: { evidence_count: number; observation_window_days: number }): void {
  if (input.evidence_count < MIN_SEMANTIC_EVIDENCE_COUNT) {
    throw new Error(`Semantic memory snapshot requires at least ${MIN_SEMANTIC_EVIDENCE_COUNT} evidence items`);
  }

  if (input.observation_window_days < MIN_SEMANTIC_OBSERVATION_DAYS) {
    throw new Error(`Semantic memory snapshot requires at least ${MIN_SEMANTIC_OBSERVATION_DAYS} observed days`);
  }
}

export function assertTeacherEvidenceReference(reference: TeacherEvidenceReference): void {
  for (const value of Object.values(reference)) {
    if (typeof value !== "string") {
      continue;
    }

    if (FORBIDDEN_TEACHER_EVIDENCE_PATTERNS.some((pattern) => pattern.test(value))) {
      throw new Error("Teacher evidence reference must not be reversible to raw conversation data");
    }
  }
}

export function emotionBaselineStorage(): PrivacyLevel.CAMPUS_LOCAL_ONLY {
  return PrivacyLevel.CAMPUS_LOCAL_ONLY;
}

function normalize(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}
