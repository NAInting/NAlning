import { describe, expect, it } from "vitest";

import {
  buildUnitReviewProviderExecutionRequest,
  type UnitReviewArtifact,
  validateUnitReviewProviderExecutionRequest,
  validateUnitReviewProviderExecutionRequestSource
} from "../src";

describe("provider execution request", () => {
  const baseArtifact: UnitReviewArtifact = {
    schema_version: "content-pipeline-review-artifact/v0.1",
    mode: "llm_review_no_writeback",
    generated_at: "2026-04-23T18:00:00.000Z",
    unit_id: "math_g8_linear_function_intro",
    status: "blocked",
    writeback_performed: false,
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
    retry_policy: {
      decision: "allow_scoped_rerun",
      reason: "First blocked artifact in current scope.",
      recommended_rerun_from: "assessment_designer",
      recommended_rerun_roles: ["assessment_designer", "qa_agent"]
    },
    orchestration_guidance: {
      action: "prepare_scoped_rerun",
      reason: "A review-only scoped rerun is structurally allowed, but it still requires an explicit decision before spending provider execution.",
      requires_provider_execution: true,
      requires_human_decision: true,
      human_queue: "rerun_decision_queue",
      automation_step: "open_inbox_item",
      provider_execution_allowed_without_human: false,
      primary_human_action: "decide_scoped_rerun",
      inbox_title: "[Rerun Decision] math_g8_linear_function_intro",
      inbox_summary:
        "Blocked artifact can attempt a review-only scoped rerun from assessment_designer, but provider execution still requires an explicit human decision.",
      recommended_rerun_from: "assessment_designer",
      rerun_chain_depth: 0
    },
    workflow_runs: [],
    invocation_logs: [],
    candidate_patches: []
  };

  it("builds a scoped provider execution request from a blocked artifact", () => {
    const request = buildUnitReviewProviderExecutionRequest(baseArtifact);

    expect(request).toMatchObject({
      schema_version: "content-pipeline-review-provider-execution-request/v0.1",
      source_artifact_status: "blocked",
      execution_action: "run_scoped_review_rerun",
      requested_start_role: "assessment_designer",
      requested_roles: ["assessment_designer", "qa_agent"],
      estimated_provider_call_count: 2,
      review_mode: "llm_review_no_writeback",
      output_contract: "review_artifact_only",
      source_retry_decision: "allow_scoped_rerun",
      human_queue: "rerun_decision_queue",
      primary_human_action: "decide_scoped_rerun",
      gating_requirements: {
        requires_explicit_human_approval: true,
        requires_budget_policy_check: true,
        requires_real_provider_credentials: true
      },
      decision_boundary: {
        requires_provider_execution: true,
        requires_human_decision: true,
        provider_execution_allowed_without_human: false
      }
    });
  });

  it("builds a widened provider execution request with rerun lineage anchors", () => {
    const artifact: UnitReviewArtifact = {
      ...baseArtifact,
      generated_at: "2026-04-23T19:00:00.000Z",
      repair_plan: {
        ...baseArtifact.repair_plan!,
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
            trigger: "unknown_node_reference at pedagogy.activities[0].target_nodes[0]",
            root_owner: "subject_expert",
            impacted_owner: "pedagogy_designer",
            rerun_from: "subject_expert",
            rerun_roles: [
              "subject_expert",
              "pedagogy_designer",
              "narrative_designer",
              "engineering_agent",
              "assessment_designer",
              "qa_agent"
            ],
            reason: "Knowledge graph changed and stranded downstream references."
          }
        ]
      },
      retry_policy: {
        decision: "widen_rerun_scope",
        reason: "An earlier owner must rerun.",
        recommended_rerun_from: "subject_expert",
        recommended_rerun_roles: [
          "subject_expert",
          "pedagogy_designer",
          "narrative_designer",
          "engineering_agent",
          "assessment_designer",
          "qa_agent"
        ],
        prior_rerun_from: "assessment_designer"
      },
      orchestration_guidance: {
        ...baseArtifact.orchestration_guidance!,
        action: "prepare_widened_rerun",
        primary_human_action: "decide_widened_rerun",
        inbox_title: "[Widened Rerun Decision] math_g8_linear_function_intro",
        inbox_summary:
          "Blocked artifact now points to an earlier owner and should widen rerun scope from subject_expert, pending explicit human/provider-budget approval.",
        recommended_rerun_from: "subject_expert",
        rerun_chain_depth: 1
      },
      rerun_context: {
        source_artifact_generated_at: "2026-04-23T18:00:00.000Z",
        source_artifact_status: "blocked",
        start_from_role: "assessment_designer",
        inherited_roles: ["subject_expert", "pedagogy_designer", "narrative_designer", "engineering_agent"],
        rerun_chain_depth: 1,
        rerun_root_artifact_generated_at: "2026-04-23T18:00:00.000Z",
        source_retry_decision: "allow_scoped_rerun",
        source_recommended_rerun_from: "assessment_designer"
      }
    };

    const request = buildUnitReviewProviderExecutionRequest(artifact);

    expect(request).toMatchObject({
      execution_action: "run_widened_review_rerun",
      requested_start_role: "subject_expert",
      estimated_provider_call_count: 6,
      rerun_chain_depth: 1,
      rerun_root_artifact_generated_at: "2026-04-23T18:00:00.000Z",
      source_retry_decision: "widen_rerun_scope",
      primary_human_action: "decide_widened_rerun"
    });
    expect(request.requested_roles).toEqual([
      "subject_expert",
      "pedagogy_designer",
      "narrative_designer",
      "engineering_agent",
      "assessment_designer",
      "qa_agent"
    ]);
  });

  it("rejects a blocked artifact that is already in manual triage instead of provider spend preparation", () => {
    const artifact: UnitReviewArtifact = {
      ...baseArtifact,
      retry_policy: {
        decision: "manual_review_required",
        reason: "Provider instability persisted after rerun.",
        recommended_rerun_from: "assessment_designer",
        recommended_rerun_roles: ["assessment_designer", "qa_agent"],
        prior_rerun_from: "assessment_designer"
      },
      orchestration_guidance: {
        ...baseArtifact.orchestration_guidance!,
        action: "manual_triage_required",
        requires_provider_execution: false,
        human_queue: "manual_triage_queue",
        primary_human_action: "perform_manual_triage",
        inbox_title: "[Manual Triage] math_g8_linear_function_intro",
        inbox_summary:
          "Retry policy already requires manual review. Route this blocked artifact to human triage instead of attempting another automated rerun.",
        recommended_rerun_from: "assessment_designer"
      }
    };

    const validation = validateUnitReviewProviderExecutionRequestSource(artifact);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "orchestration_action_not_provider_request" }),
        expect.objectContaining({ code: "retry_policy_mismatch" })
      ])
    );
  });

  it("rejects an invalid recommended_rerun_from role instead of silently deriving a qa-only tail", () => {
    const artifact = {
      ...baseArtifact,
      retry_policy: {
        ...baseArtifact.retry_policy!,
        recommended_rerun_from: "bogus_role"
      }
    } as unknown as UnitReviewArtifact;

    const validation = validateUnitReviewProviderExecutionRequestSource(artifact);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid_recommended_rerun_from" })
      ])
    );
  });

  it("fails closed when a caller tries to build a provider execution request from an invalid source artifact", () => {
    const artifact: UnitReviewArtifact = {
      ...baseArtifact,
      status: "ready_for_human_review",
      orchestration_guidance: {
        ...baseArtifact.orchestration_guidance!,
        action: "notify_human_for_approval",
        requires_provider_execution: false,
        human_queue: "approval_queue",
        primary_human_action: "approve_review_artifact"
      }
    };

    expect(() => buildUnitReviewProviderExecutionRequest(artifact)).toThrow(
      /Provider execution request source artifact is invalid/
    );
  });

  it("fails validation when provider-call estimate diverges from requested roles", () => {
    const request = buildUnitReviewProviderExecutionRequest(baseArtifact);
    request.estimated_provider_call_count = 1;

    const validation = validateUnitReviewProviderExecutionRequest(baseArtifact, request);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "estimated_provider_call_count_mismatch",
      message: "Provider execution request estimated_provider_call_count must equal requested_roles.length."
    });
  });

  it("fails validation closed when the source artifact contract is invalid even if the request shape looks plausible", () => {
    const invalidSource = {
      ...baseArtifact,
      status: "ready_for_human_review",
      orchestration_guidance: {
        ...baseArtifact.orchestration_guidance!,
        action: "notify_human_for_approval",
        requires_provider_execution: false,
        human_queue: "approval_queue",
        primary_human_action: "approve_review_artifact"
      }
    } as UnitReviewArtifact;
    const request = {
      ...buildUnitReviewProviderExecutionRequest(baseArtifact),
      source_artifact_generated_at: invalidSource.generated_at
    };

    const validation = validateUnitReviewProviderExecutionRequest(invalidSource, request);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "source_artifact_contract_mismatch" })
      ])
    );
  });
});
