import type { AgentInvocationResult } from "./agent-invocation";
import type { CurriculumAgentRole, UnitSpecSection } from "./agent-specs";
import type { UnitSemanticValidationResult } from "./unit-semantic-validation";
import { curriculumAgentOrder } from "./workflow";

export interface ReviewArtifactCandidatePatch {
  role: CurriculumAgentRole;
  patch_sections: UnitSpecSection[];
  diff: Array<{
    path: string;
    change_type: "added" | "removed" | "changed";
  }>;
}

export interface ReviewRepairRecommendation {
  trigger: string;
  root_owner: CurriculumAgentRole | "manual_review";
  impacted_owner: CurriculumAgentRole | "manual_review";
  rerun_from: CurriculumAgentRole | "manual_review";
  rerun_roles: CurriculumAgentRole[];
  reason: string;
}

export interface UnitReviewRepairPlan {
  source: "semantic_validation" | "invocation_failure";
  recommended_rerun_from: CurriculumAgentRole | "manual_review";
  recommended_rerun_roles: CurriculumAgentRole[];
  recommendations: ReviewRepairRecommendation[];
}

export function deriveUnitReviewRepairPlan(input: {
  semantic_validation?: UnitSemanticValidationResult;
  candidate_patches: ReviewArtifactCandidatePatch[];
  invocations: AgentInvocationResult[];
}): UnitReviewRepairPlan | undefined {
  const semanticIssues = input.semantic_validation?.issues.filter((issue) => issue.severity === "error") ?? [];
  if (semanticIssues.length > 0) {
    return buildRepairPlan(
      "semantic_validation",
      semanticIssues.map((issue) => deriveSemanticIssueRecommendation(issue, input.candidate_patches))
    );
  }

  const failedInvocation = input.invocations.find((invocation) => invocation.status !== "succeeded" && invocation.failure);
  if (!failedInvocation?.failure) {
    return undefined;
  }

  return buildRepairPlan("invocation_failure", [deriveInvocationFailureRecommendation(failedInvocation)]);
}

function buildRepairPlan(
  source: UnitReviewRepairPlan["source"],
  recommendations: ReviewRepairRecommendation[]
): UnitReviewRepairPlan {
  const rerunRoles = recommendations
    .flatMap((recommendation) => recommendation.rerun_roles)
    .filter((role, index, roles) => roles.indexOf(role) === index);
  const earliestRole = rerunRoles
    .slice()
    .sort((left, right) => curriculumAgentOrder.indexOf(left) - curriculumAgentOrder.indexOf(right))[0];

  return {
    source,
    recommended_rerun_from: earliestRole ?? "manual_review",
    recommended_rerun_roles: earliestRole ? [...curriculumAgentOrder.slice(curriculumAgentOrder.indexOf(earliestRole))] : [],
    recommendations
  };
}

function deriveSemanticIssueRecommendation(
  issue: NonNullable<UnitSemanticValidationResult["issues"]>[number],
  candidatePatches: ReviewArtifactCandidatePatch[]
): ReviewRepairRecommendation {
  const impactedSection = sectionForPath(issue.path);
  const impactedOwner = impactedSection ? ownerForSection(impactedSection) : "manual_review";
  const knowledgeGraphChanged = candidatePatches.some(
    (candidate) =>
      candidate.role === "subject_expert"
      && candidate.diff.some(
        (change) =>
          change.path.startsWith("knowledge.nodes")
          || change.path.startsWith("knowledge.edges")
          || change.path === "knowledge"
      )
  );

  if (issue.code === "unknown_node_reference") {
    if (impactedSection && impactedSection !== "knowledge" && knowledgeGraphChanged) {
      return rerunRecommendation(
        issue,
        "subject_expert",
        impactedOwner,
        `The knowledge patch changed node anchors and stranded downstream references at ${issue.path}. Regenerate from subject_expert so dependent sections share the same node graph.`
      );
    }

    if (impactedOwner !== "manual_review") {
      return rerunRecommendation(
        issue,
        impactedOwner,
        impactedOwner,
        `The owned section ${impactedSection ?? "unknown"} contains a reference that no longer resolves at ${issue.path}. Regenerate from ${impactedOwner} and rerun downstream review.`
      );
    }
  }

  if (
    issue.code === "duplicate_id"
    || issue.code === "forbidden_foreign_standard_source_trace"
    || issue.code === "open_quality_blocker"
    || issue.code === "quality_pass_with_open_blockers"
  ) {
    const rootOwner =
      issue.code === "open_quality_blocker" || issue.code === "quality_pass_with_open_blockers"
        ? "qa_agent"
        : impactedOwner;

    if (rootOwner !== "manual_review") {
      return rerunRecommendation(
        issue,
        rootOwner,
        impactedOwner,
        `The ${issue.code} error is owned by ${rootOwner}. Fix that section and rerun downstream validation before promotion.`
      );
    }
  }

  if (issue.code === "candidate_merge_failed") {
    const parsedOwner = parseOwnerFromMergeFailure(issue.message);
    if (parsedOwner) {
      return rerunRecommendation(
        issue,
        parsedOwner,
        impactedOwner,
        `The workflow could not merge the ${parsedOwner} patch cleanly. Regenerate from ${parsedOwner} after fixing the contract or semantic issue.`
      );
    }
  }

  return {
    trigger: `${issue.code} at ${issue.path}`,
    root_owner: "manual_review",
    impacted_owner: impactedOwner,
    rerun_from: "manual_review",
    rerun_roles: [],
    reason: `The issue at ${issue.path} needs manual engineering review before another automated rerun.`
  };
}

function deriveInvocationFailureRecommendation(invocation: AgentInvocationResult): ReviewRepairRecommendation {
  const role = invocation.role;
  const failure = invocation.failure;
  if (!failure) {
    return {
      trigger: `unknown failure at ${role}`,
      root_owner: "manual_review",
      impacted_owner: role,
      rerun_from: "manual_review",
      rerun_roles: [],
      reason: "No structured failure details were recorded. Manual review is required."
    };
  }

  if (failure.category === "model_unavailable") {
    return rerunRecommendation(
      {
        code: failure.category,
        path: role,
        message: failure.message
      },
      role,
      role,
      `The provider failed while running ${role}. Retry from the same role after provider/model availability is stable.`
    );
  }

  if (failure.category === "schema_validation") {
    const parsedOwner = parseOwnerFromMergeFailure(failure.message) ?? role;
    return rerunRecommendation(
      {
        code: failure.category,
        path: role,
        message: failure.message
      },
      parsedOwner,
      role,
      `The ${parsedOwner} output failed schema or semantic merge checks. Fix the owned-section contract and rerun from ${parsedOwner}.`
    );
  }

  if (failure.category === "ownership_violation") {
    return {
      trigger: `${failure.category} at ${role}`,
      root_owner: "manual_review",
      impacted_owner: role,
      rerun_from: "manual_review",
      rerun_roles: [],
      reason: `The ${role} output wrote an unowned section. This needs prompt or parser repair before another automated rerun.`
    };
  }

  return {
    trigger: `${failure.category} at ${role}`,
    root_owner: "manual_review",
    impacted_owner: role,
    rerun_from: "manual_review",
    rerun_roles: [],
    reason: `The ${role} invocation failed with ${failure.category}. Review the failure before rerunning automatically.`
  };
}

function rerunRecommendation(
  issue: { code: string; path: string; message?: string },
  rootOwner: CurriculumAgentRole,
  impactedOwner: CurriculumAgentRole | "manual_review",
  reason: string
): ReviewRepairRecommendation {
  const rerunRoles = [...curriculumAgentOrder.slice(curriculumAgentOrder.indexOf(rootOwner))];
  return {
    trigger: `${issue.code} at ${issue.path}`,
    root_owner: rootOwner,
    impacted_owner: impactedOwner,
    rerun_from: rootOwner,
    rerun_roles: rerunRoles,
    reason
  };
}

function sectionForPath(path: string): UnitSpecSection | undefined {
  const sections: UnitSpecSection[] = ["knowledge", "pedagogy", "narrative", "implementation", "assessment", "quality"];
  return sections.find((section) => path === section || path.startsWith(`${section}.`) || path.startsWith(`${section}[`));
}

function ownerForSection(section: UnitSpecSection): CurriculumAgentRole {
  switch (section) {
    case "knowledge":
      return "subject_expert";
    case "pedagogy":
      return "pedagogy_designer";
    case "narrative":
      return "narrative_designer";
    case "implementation":
      return "engineering_agent";
    case "assessment":
      return "assessment_designer";
    case "quality":
      return "qa_agent";
  }
}

function parseOwnerFromMergeFailure(message: string): CurriculumAgentRole | undefined {
  const matched = message.match(/Agent ([a-z_]+) semantic validation failed/i)?.[1];
  if (!matched) {
    return undefined;
  }

  return curriculumAgentOrder.find((role) => role === matched);
}
