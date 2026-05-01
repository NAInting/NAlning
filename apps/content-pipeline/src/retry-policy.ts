import type { AgentInvocationFailureCategory, AgentInvocationLogSummary } from "./agent-invocation";
import type { CurriculumAgentRole } from "./agent-specs";
import type { UnitReviewRepairPlan } from "./repair-plan";
import type { ReviewRerunContext } from "./review-rerun";
import type { AgentRunState } from "./workflow";
import { curriculumAgentOrder } from "./workflow";

export type UnitReviewRetryDecision = "allow_scoped_rerun" | "widen_rerun_scope" | "manual_review_required";

export interface UnitReviewRetryPolicy {
  decision: UnitReviewRetryDecision;
  reason: string;
  recommended_rerun_from: UnitReviewRepairPlan["recommended_rerun_from"];
  recommended_rerun_roles: CurriculumAgentRole[];
  failed_role?: CurriculumAgentRole;
  failure_category?: AgentInvocationFailureCategory;
  failed_role_attempts?: number;
  prior_rerun_from?: CurriculumAgentRole;
}

export interface ReviewRetryPolicyInput {
  repair_plan?: UnitReviewRepairPlan;
  workflow_runs: Array<Pick<AgentRunState, "role" | "attempts" | "status">>;
  invocation_logs: AgentInvocationLogSummary[];
  rerun_context?: ReviewRerunContext;
}

export function deriveUnitReviewRetryPolicy(input: ReviewRetryPolicyInput): UnitReviewRetryPolicy | undefined {
  const repairPlan = input.repair_plan;
  if (!repairPlan) {
    return undefined;
  }

  const failedInvocation = input.invocation_logs.find((entry) => entry.failure);
  const failedRole = failedInvocation?.role;
  const failureCategory = failedInvocation?.failure?.category;
  const failedRoleAttempts = failedRole
    ? input.workflow_runs.find((run) => run.role === failedRole)?.attempts
    : undefined;
  const priorRerunFrom = input.rerun_context?.start_from_role;

  if (repairPlan.recommended_rerun_from === "manual_review") {
    return {
      decision: "manual_review_required",
      reason: "The repair plan itself requires manual review before another automated rerun.",
      recommended_rerun_from: "manual_review",
      recommended_rerun_roles: [],
      ...(failedRole ? { failed_role: failedRole } : {}),
      ...(failureCategory ? { failure_category: failureCategory } : {}),
      ...(typeof failedRoleAttempts === "number" ? { failed_role_attempts: failedRoleAttempts } : {}),
      ...(priorRerunFrom ? { prior_rerun_from: priorRerunFrom } : {})
    };
  }

  if (!priorRerunFrom) {
    if (failureCategory === "model_unavailable" && (failedRoleAttempts ?? 0) >= 2) {
      return {
        decision: "manual_review_required",
        reason: "Provider instability has already repeated on the same role. Stop automatic retries and review provider health first.",
        recommended_rerun_from: repairPlan.recommended_rerun_from,
        recommended_rerun_roles: repairPlan.recommended_rerun_roles,
        ...(failedRole ? { failed_role: failedRole } : {}),
        failure_category: failureCategory,
        ...(typeof failedRoleAttempts === "number" ? { failed_role_attempts: failedRoleAttempts } : {})
      };
    }

    return {
      decision: "allow_scoped_rerun",
      reason: "This is the first blocked artifact for the current scope, so a review-only scoped rerun is safe to try.",
      recommended_rerun_from: repairPlan.recommended_rerun_from,
      recommended_rerun_roles: repairPlan.recommended_rerun_roles,
      ...(failedRole ? { failed_role: failedRole } : {}),
      ...(failureCategory ? { failure_category: failureCategory } : {}),
      ...(typeof failedRoleAttempts === "number" ? { failed_role_attempts: failedRoleAttempts } : {})
    };
  }

  if (failureCategory === "model_unavailable") {
    return {
      decision: "manual_review_required",
      reason: "A rerun has already been attempted and the provider is still unstable. Escalate to manual review instead of repeated cloud retries.",
      recommended_rerun_from: repairPlan.recommended_rerun_from,
      recommended_rerun_roles: repairPlan.recommended_rerun_roles,
      ...(failedRole ? { failed_role: failedRole } : {}),
      failure_category: failureCategory,
      ...(typeof failedRoleAttempts === "number" ? { failed_role_attempts: failedRoleAttempts } : {}),
      prior_rerun_from: priorRerunFrom
    };
  }

  if (curriculumAgentOrder.indexOf(repairPlan.recommended_rerun_from) < curriculumAgentOrder.indexOf(priorRerunFrom)) {
    return {
      decision: "widen_rerun_scope",
      reason: "The new failure points to an earlier owner than the previous rerun scope. Widen the rerun start instead of repeating the same tail slice.",
      recommended_rerun_from: repairPlan.recommended_rerun_from,
      recommended_rerun_roles: repairPlan.recommended_rerun_roles,
      ...(failedRole ? { failed_role: failedRole } : {}),
      ...(failureCategory ? { failure_category: failureCategory } : {}),
      ...(typeof failedRoleAttempts === "number" ? { failed_role_attempts: failedRoleAttempts } : {}),
      prior_rerun_from: priorRerunFrom
    };
  }

  return {
    decision: "manual_review_required",
    reason: "The artifact is still blocked after a scoped rerun at this depth. Manual review should resolve the underlying contract or content issue before another retry.",
    recommended_rerun_from: repairPlan.recommended_rerun_from,
    recommended_rerun_roles: repairPlan.recommended_rerun_roles,
    ...(failedRole ? { failed_role: failedRole } : {}),
    ...(failureCategory ? { failure_category: failureCategory } : {}),
    ...(typeof failedRoleAttempts === "number" ? { failed_role_attempts: failedRoleAttempts } : {}),
    prior_rerun_from: priorRerunFrom
  };
}
