import { describe, expect, it } from "vitest";

import { deriveUnitReviewRepairPlan } from "../src/repair-plan";

describe("review repair plan", () => {
  it("recommends rerunning from subject_expert when knowledge node churn strands downstream references", () => {
    const plan = deriveUnitReviewRepairPlan({
      semantic_validation: {
        passed: false,
        error_count: 1,
        warning_count: 0,
        issues: [
          {
            severity: "error",
            code: "unknown_node_reference",
            path: "assessment.items[0].target_nodes[0]",
            message: "Referenced knowledge node is not defined."
          }
        ]
      },
      candidate_patches: [
        {
          role: "subject_expert",
          patch_sections: ["knowledge"],
          diff: [
            {
              path: "knowledge.nodes[0].node_id",
              change_type: "changed"
            }
          ]
        }
      ],
      invocations: []
    });

    expect(plan).toMatchObject({
      source: "semantic_validation",
      recommended_rerun_from: "subject_expert",
      recommended_rerun_roles: [
        "subject_expert",
        "pedagogy_designer",
        "narrative_designer",
        "engineering_agent",
        "assessment_designer",
        "qa_agent"
      ]
    });
    expect(plan?.recommendations[0]).toMatchObject({
      root_owner: "subject_expert",
      impacted_owner: "assessment_designer"
    });
  });

  it("falls back to manual review for ownership violations", () => {
    const plan = deriveUnitReviewRepairPlan({
      candidate_patches: [],
      invocations: [
        {
          unit_id: "math_g8_linear_function_intro",
          role: "pedagogy_designer",
          status: "failed_blocking",
          patch_sections: [],
          failure: {
            category: "ownership_violation",
            message: "Agent pedagogy_designer attempted to write unowned sections: assessment",
            retryable: false
          }
        }
      ]
    });

    expect(plan).toMatchObject({
      source: "invocation_failure",
      recommended_rerun_from: "manual_review",
      recommended_rerun_roles: []
    });
    expect(plan?.recommendations[0]).toMatchObject({
      root_owner: "manual_review"
    });
  });
});
