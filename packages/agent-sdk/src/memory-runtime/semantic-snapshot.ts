import { randomUUID } from "node:crypto";

import { UserRole, type StudentMemorySnapshot } from "@edu-ai/shared-types";

import { assertSemanticConfidence, assertSemanticEvidenceGate } from "./policy";
import type { BuildSnapshotInput } from "./types";

export function buildStudentMemorySnapshot(input: BuildSnapshotInput, now: () => Date = () => new Date()): StudentMemorySnapshot {
  assertSemanticConfidence(input.confidence);
  assertSemanticEvidenceGate(input);
  if (input.emotion_baseline.student_id !== input.student_id) {
    throw new Error("Emotion baseline student_id must match snapshot student_id");
  }

  const nowIso = now().toISOString();
  const snapshot: StudentMemorySnapshot = {
    id: randomUUID(),
    created_at: nowIso,
    updated_at: nowIso,
    version: 1,
    student_id: input.student_id,
    agent_id: input.agent_id,
    knowledge_profile: input.knowledge_profile,
    learning_style_profile: input.learning_style_profile,
    interest_profile: input.interest_profile,
    emotion_baseline: input.emotion_baseline,
    snapshot_version: input.snapshot_version,
    is_viewable_by_student: true,
    visibility_scope: {
      visible_to_roles: [UserRole.STUDENT],
      excluded_fields_by_role: {
        [UserRole.TEACHER]: ["emotion_baseline", "interest_profile"],
        [UserRole.GUARDIAN]: ["emotion_baseline", "interest_profile"]
      }
    }
  };

  if (input.prior_snapshot_id) {
    snapshot.prior_snapshot_id = input.prior_snapshot_id;
  }
  if (input.change_summary) {
    snapshot.change_summary = input.change_summary;
  }

  return snapshot;
}
