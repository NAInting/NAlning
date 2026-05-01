import type { AiNativeUnitSpec } from "@edu-ai/shared-types";

import { mergeAgentPatchIntoUnit } from "./unit-io";
import type { UnitReviewApproval, UnitReviewArtifact } from "./review-runner";

export interface ApplyReviewedPatchResult {
  unit: AiNativeUnitSpec;
  applied_patch_count: number;
}

export interface ApproveReviewArtifactOptions {
  reviewer_id: string;
  reviewed_at?: string;
  notes?: string;
}

export function approveReviewArtifact(
  artifact: UnitReviewArtifact,
  options: ApproveReviewArtifactOptions
): UnitReviewArtifact {
  assertReviewArtifactReadyForApproval(artifact);

  const approval: UnitReviewApproval = {
    status: "approved",
    reviewer_id: options.reviewer_id,
    reviewed_at: options.reviewed_at ?? new Date().toISOString()
  };

  if (options.notes) {
    approval.notes = options.notes;
  }

  return {
    ...artifact,
    approval
  };
}

export function applyReviewedPatchesToUnit(
  unit: AiNativeUnitSpec,
  artifact: UnitReviewArtifact
): ApplyReviewedPatchResult {
  if (artifact.mode !== "llm_review_no_writeback") {
    throw new Error(`Unsupported review artifact mode: ${artifact.mode}`);
  }

  if (artifact.status !== "ready_for_human_review") {
    throw new Error(`Cannot apply blocked review artifact: ${artifact.status}`);
  }

  if (artifact.writeback_performed !== false) {
    throw new Error("Review artifact was already marked as written back");
  }

  if (artifact.approval?.status !== "approved") {
    throw new Error("Review artifact must include approval.status = approved before applying candidate patches");
  }

  if (artifact.unit_id !== unit.metadata.unit_id) {
    throw new Error(`Review artifact unit_id mismatch: ${artifact.unit_id} !== ${unit.metadata.unit_id}`);
  }

  let currentUnit = unit;
  for (const candidate of artifact.candidate_patches) {
    try {
      currentUnit = mergeAgentPatchIntoUnit(currentUnit, candidate.role, candidate.patch);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("semantic validation failed")) {
        throw new Error(["Candidate unit failed semantic validation.", message].join("\n"));
      }

      throw error;
    }
  }

  return {
    unit: currentUnit,
    applied_patch_count: artifact.candidate_patches.length
  };
}

function assertReviewArtifactReadyForApproval(artifact: UnitReviewArtifact): void {
  if (artifact.mode !== "llm_review_no_writeback") {
    throw new Error(`Unsupported review artifact mode: ${artifact.mode}`);
  }

  if (artifact.status !== "ready_for_human_review") {
    throw new Error(`Cannot approve blocked review artifact: ${artifact.status}`);
  }

  if (artifact.writeback_performed !== false) {
    throw new Error("Review artifact was already marked as written back");
  }
}
