import { describe, expect, it } from "vitest";

import { deriveUnitReviewRetryPolicy } from "../src/retry-policy";

describe("review retry policy", () => {
  it("allows a first scoped rerun when a blocked artifact has a deterministic rerun owner", () => {
    const policy = deriveUnitReviewRetryPolicy({
      repair_plan: {
        source: "invocation_failure",
        recommended_rerun_from: "assessment_designer",
        recommended_rerun_roles: ["assessment_designer", "qa_agent"],
        recommendations: [
          {
            trigger: "schema_validation at assessment_designer",
            root_owner: "assessment_designer",
            impacted_owner: "assessment_designer",
            rerun_from: "assessment_designer",
            rerun_roles: ["assessment_designer", "qa_agent"],
            reason: "Assessment section must be regenerated from its owner."
          }
        ]
      },
      workflow_runs: [
        { role: "assessment_designer", status: "failed", attempts: 1 },
        { role: "qa_agent", status: "pending", attempts: 0 }
      ],
      invocation_logs: [
        {
          unit_id: "math_g8_linear_function_intro",
          role: "assessment_designer",
          status: "failed_retryable",
          patch_sections: [],
          failure: {
            category: "schema_validation",
            retryable: true
          }
        }
      ]
    });

    expect(policy).toMatchObject({
      decision: "allow_scoped_rerun",
      recommended_rerun_from: "assessment_designer",
      failed_role: "assessment_designer",
      failure_category: "schema_validation",
      failed_role_attempts: 1
    });
  });

  it("widens rerun scope when a rerun artifact now points to an earlier owner", () => {
    const policy = deriveUnitReviewRetryPolicy({
      repair_plan: {
        source: "semantic_validation",
        recommended_rerun_from: "subject_expert",
        recommended_rerun_roles: [
          "subject_expert",
          "pedagogy_designer",
          "narrative_designer",
          "engineering_agent",
          "assessment_designer",
          "qa_agent"
        ],
        recommendations: [
          {
            trigger: "unknown_node_reference at assessment.items[0].target_nodes[0]",
            root_owner: "subject_expert",
            impacted_owner: "assessment_designer",
            rerun_from: "subject_expert",
            rerun_roles: [
              "subject_expert",
              "pedagogy_designer",
              "narrative_designer",
              "engineering_agent",
              "assessment_designer",
              "qa_agent"
            ],
            reason: "Knowledge node anchors changed and stranded downstream references."
          }
        ]
      },
      workflow_runs: [
        { role: "assessment_designer", status: "passed", attempts: 1 },
        { role: "qa_agent", status: "failed", attempts: 1 }
      ],
      invocation_logs: [],
      rerun_context: {
        source_artifact_generated_at: "2026-04-23T09:00:00.000Z",
        source_artifact_status: "blocked",
        start_from_role: "assessment_designer",
        inherited_roles: ["subject_expert", "pedagogy_designer", "narrative_designer", "engineering_agent"],
        rerun_chain_depth: 1,
        rerun_root_artifact_generated_at: "2026-04-23T09:00:00.000Z",
        source_retry_decision: "allow_scoped_rerun",
        source_recommended_rerun_from: "assessment_designer"
      }
    });

    expect(policy).toMatchObject({
      decision: "widen_rerun_scope",
      recommended_rerun_from: "subject_expert",
      prior_rerun_from: "assessment_designer"
    });
  });

  it("requires manual review when provider instability persists after a scoped rerun", () => {
    const policy = deriveUnitReviewRetryPolicy({
      repair_plan: {
        source: "invocation_failure",
        recommended_rerun_from: "qa_agent",
        recommended_rerun_roles: ["qa_agent"],
        recommendations: [
          {
            trigger: "model_unavailable at qa_agent",
            root_owner: "qa_agent",
            impacted_owner: "qa_agent",
            rerun_from: "qa_agent",
            rerun_roles: ["qa_agent"],
            reason: "Provider failed during qa_agent."
          }
        ]
      },
      workflow_runs: [{ role: "qa_agent", status: "failed", attempts: 2 }],
      invocation_logs: [
        {
          unit_id: "math_g8_linear_function_intro",
          role: "qa_agent",
          status: "failed_retryable",
          patch_sections: [],
          failure: {
            category: "model_unavailable",
            retryable: true
          }
        }
      ],
      rerun_context: {
        source_artifact_generated_at: "2026-04-23T09:30:00.000Z",
        source_artifact_status: "blocked",
        start_from_role: "qa_agent",
        inherited_roles: [
          "subject_expert",
          "pedagogy_designer",
          "narrative_designer",
          "engineering_agent",
          "assessment_designer"
        ],
        rerun_chain_depth: 1,
        rerun_root_artifact_generated_at: "2026-04-23T09:30:00.000Z",
        source_retry_decision: "allow_scoped_rerun",
        source_recommended_rerun_from: "qa_agent"
      }
    });

    expect(policy).toMatchObject({
      decision: "manual_review_required",
      recommended_rerun_from: "qa_agent",
      failure_category: "model_unavailable",
      failed_role_attempts: 2,
      prior_rerun_from: "qa_agent"
    });
  });
});
