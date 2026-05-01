import type { AiNativeUnitSpec } from "@edu-ai/shared-types";

import type { CurriculumAgentRole } from "./agent-specs";
import { mergeAgentPatchIntoUnit } from "./unit-io";
import type { UnitReviewArtifact } from "./review-runner";
import type { UnitReviewRetryDecision } from "./retry-policy";
import { curriculumAgentOrder } from "./workflow";

export interface ReviewRerunContext {
  source_artifact_generated_at: string;
  source_artifact_status: UnitReviewArtifact["status"];
  start_from_role: CurriculumAgentRole;
  inherited_roles: CurriculumAgentRole[];
  rerun_chain_depth: number;
  rerun_root_artifact_generated_at: string;
  source_retry_decision?: UnitReviewRetryDecision;
  source_recommended_rerun_from?: NonNullable<UnitReviewArtifact["repair_plan"]>["recommended_rerun_from"];
}

export interface PreparedScopedRerun {
  unit: AiNativeUnitSpec;
  context: ReviewRerunContext;
}

export function prepareScopedReviewRerun(
  unit: AiNativeUnitSpec,
  artifact: UnitReviewArtifact,
  explicitStartFrom?: CurriculumAgentRole
): PreparedScopedRerun {
  if (artifact.unit_id !== unit.metadata.unit_id) {
    throw new Error(`Review artifact unit_id mismatch: ${artifact.unit_id} !== ${unit.metadata.unit_id}`);
  }

  if (artifact.status !== "blocked") {
    throw new Error("Scoped rerun requires a blocked review artifact. Ready artifacts should go through approval instead.");
  }

  const startFrom = resolveScopedRerunRole(artifact, explicitStartFrom);
  const startIndex = curriculumAgentOrder.indexOf(startFrom);
  if (startIndex === -1) {
    throw new Error(`Unsupported rerun role: ${startFrom}`);
  }

  let currentUnit = unit;
  const inheritedRoles: CurriculumAgentRole[] = [];
  const orderedCandidates = artifact.candidate_patches
    .slice()
    .sort((left, right) => curriculumAgentOrder.indexOf(left.role) - curriculumAgentOrder.indexOf(right.role));

  for (const candidate of orderedCandidates) {
    if (curriculumAgentOrder.indexOf(candidate.role) >= startIndex) {
      continue;
    }

    currentUnit = mergeAgentPatchIntoUnit(currentUnit, candidate.role, candidate.patch);
    if (!inheritedRoles.includes(candidate.role)) {
      inheritedRoles.push(candidate.role);
    }
  }

  return {
    unit: currentUnit,
    context: {
      source_artifact_generated_at: artifact.generated_at,
      source_artifact_status: artifact.status,
      start_from_role: startFrom,
      inherited_roles: inheritedRoles,
      rerun_chain_depth: (artifact.rerun_context?.rerun_chain_depth ?? 0) + 1,
      rerun_root_artifact_generated_at: artifact.rerun_context?.rerun_root_artifact_generated_at ?? artifact.generated_at,
      ...(artifact.retry_policy?.decision ? { source_retry_decision: artifact.retry_policy.decision } : {}),
      ...(artifact.repair_plan?.recommended_rerun_from
        ? { source_recommended_rerun_from: artifact.repair_plan.recommended_rerun_from }
        : {})
    }
  };
}

export function resolveScopedRerunRole(
  artifact: UnitReviewArtifact,
  explicitStartFrom?: CurriculumAgentRole
): CurriculumAgentRole {
  const retryDecision = artifact.retry_policy?.decision;
  if (retryDecision === "manual_review_required") {
    throw new Error("Scoped rerun blocked by retry policy: manual review is required before another automated rerun.");
  }

  if (explicitStartFrom) {
    assertExplicitRerunDoesNotNarrowScope(artifact, explicitStartFrom);
    return explicitStartFrom;
  }

  const recommended = artifact.repair_plan?.recommended_rerun_from;
  if (!recommended || recommended === "manual_review") {
    throw new Error("Blocked review artifact does not have an automatic rerun role. Manual review is required.");
  }

  return recommended;
}

function assertExplicitRerunDoesNotNarrowScope(
  artifact: UnitReviewArtifact,
  explicitStartFrom: CurriculumAgentRole
): void {
  const recommended = artifact.repair_plan?.recommended_rerun_from;
  if (!recommended || recommended === "manual_review") {
    return;
  }

  const explicitIndex = curriculumAgentOrder.indexOf(explicitStartFrom);
  const recommendedIndex = curriculumAgentOrder.indexOf(recommended);
  if (explicitIndex === -1 || recommendedIndex === -1) {
    return;
  }

  if (explicitIndex > recommendedIndex) {
    const retryDecision = artifact.retry_policy?.decision;
    const retryPolicyHint = retryDecision ? ` Retry policy: ${retryDecision}.` : "";
    throw new Error(
      `Explicit rerun role ${explicitStartFrom} is narrower than the recommended rerun start ${recommended}.${retryPolicyHint}`
    );
  }
}
