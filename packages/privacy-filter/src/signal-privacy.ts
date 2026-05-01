import { InterAgentSignalSchema, type InterAgentSignal } from "@edu-ai/shared-types";

import type { SignalPrivacyValidation } from "./types";

export const PRIVACY_FILTER_VERSION = "privacy-filter-v0.1";

const FORBIDDEN_SIGNAL_KEYS = new Set([
  "content",
  "conversation_text",
  "conversation_excerpt",
  "raw_text",
  "full_transcript",
  "transcript",
  "student_answer",
  "student_response",
  "agent_response",
  "rationale_summary",
  "source_turn_range",
  "conversation_id",
  "turn_id",
  "message_id",
  "keyword_hit"
]);

export function validateSignalPrivacy(signal: InterAgentSignal): SignalPrivacyValidation {
  const violations = findForbiddenKeys(signal.payload);
  const schemaResult = InterAgentSignalSchema.safeParse(signal);

  if (!schemaResult.success) {
    return {
      passed: false,
      violations: [
        ...violations,
        ...schemaResult.error.issues.map((issue) => issue.path.join(".") || issue.message)
      ]
    };
  }

  return {
    passed: violations.length === 0,
    violations
  };
}

function findForbiddenKeys(input: unknown, path = "payload"): string[] {
  if (Array.isArray(input)) {
    return input.flatMap((item, index) => findForbiddenKeys(item, `${path}[${index}]`));
  }

  if (!input || typeof input !== "object") {
    return [];
  }

  return Object.entries(input as Record<string, unknown>).flatMap(([key, value]) => {
    const currentPath = `${path}.${key}`;
    const self = FORBIDDEN_SIGNAL_KEYS.has(key) ? [currentPath] : [];
    return [...self, ...findForbiddenKeys(value, currentPath)];
  });
}
