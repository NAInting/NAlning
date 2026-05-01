import { describe, expect, it } from "vitest";

import { buildUnitReviewInboxHandoff, type UnitReviewArtifact } from "../src";
import { loadUnknownNodeReviewArtifact } from "./fixtures";

describe("review inbox handoff", () => {
  it("builds a stable approval inbox handoff from a ready artifact", () => {
    const artifact: UnitReviewArtifact = {
      schema_version: "content-pipeline-review-artifact/v0.1",
      mode: "llm_review_no_writeback",
      generated_at: "2026-04-23T18:00:00.000Z",
      unit_id: "math_g8_linear_function_intro",
      status: "ready_for_human_review",
      writeback_performed: false,
      workflow_runs: [],
      invocation_logs: [],
      candidate_patches: []
    };

    const handoff = buildUnitReviewInboxHandoff(artifact);

    expect(handoff).toMatchObject({
      schema_version: "content-pipeline-review-inbox-item/v0.1",
      item_key: "content-pipeline:approval_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      predecessor_item_key: null,
      delivery_action: "create_inbox_item",
      unit_id: "math_g8_linear_function_intro",
      artifact_status: "ready_for_human_review",
      human_queue: "approval_queue",
      title: "[Approval] math_g8_linear_function_intro",
      primary_human_action: "approve_review_artifact",
      automation_step: "open_inbox_item",
      decision_boundary: {
        requires_provider_execution: false,
        requires_human_decision: true,
        provider_execution_allowed_without_human: false
      },
      metadata: {
        orchestration_action: "notify_human_for_approval",
        recommended_rerun_from: null,
        rerun_chain_depth: 0,
        retry_decision: null,
        repair_plan_source: null
      }
    });
    expect(handoff.labels).toEqual([
      "content_pipeline_review",
      "chain:2026-04-23T18:00:00.000Z",
      "artifact_status:ready_for_human_review",
      "queue:approval_queue",
      "action:notify_human_for_approval"
    ]);
  });

  it("builds a rerun-decision inbox handoff from a blocked artifact", () => {
    const artifact: UnitReviewArtifact = {
      schema_version: "content-pipeline-review-artifact/v0.1",
      mode: "llm_review_no_writeback",
      generated_at: "2026-04-23T18:30:00.000Z",
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
        reason: "First blocked artifact for this scope.",
        recommended_rerun_from: "assessment_designer",
        recommended_rerun_roles: ["assessment_designer", "qa_agent"]
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
      },
      workflow_runs: [],
      invocation_logs: [],
      candidate_patches: []
    };

    const handoff = buildUnitReviewInboxHandoff(artifact);

    expect(handoff).toMatchObject({
      item_key: "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:30:00.000Z",
      chain_key: "content-pipeline:chain:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      predecessor_item_key:
        "content-pipeline:rerun_decision_queue:math_g8_linear_function_intro:2026-04-23T18:00:00.000Z",
      delivery_action: "replace_predecessor_inbox_item",
      human_queue: "rerun_decision_queue",
      title: "[Rerun Decision] math_g8_linear_function_intro",
      primary_human_action: "decide_scoped_rerun",
      decision_boundary: {
        requires_provider_execution: true,
        requires_human_decision: true,
        provider_execution_allowed_without_human: false
      },
      metadata: {
        orchestration_action: "prepare_scoped_rerun",
        recommended_rerun_from: "assessment_designer",
        rerun_chain_depth: 1,
        retry_decision: "allow_scoped_rerun",
        repair_plan_source: "invocation_failure"
      }
    });
    expect(handoff.labels).toContain("retry_policy:allow_scoped_rerun");
    expect(handoff.labels).toContain("rerun_from:assessment_designer");
    expect(handoff.labels).toContain("chain:2026-04-23T18:00:00.000Z");
  });

  it("attaches a no-spend repair request summary to unknown-node handoffs", () => {
    const handoff = buildUnitReviewInboxHandoff(loadUnknownNodeReviewArtifact());

    expect(handoff).toMatchObject({
      human_queue: "rerun_decision_queue",
      primary_human_action: "decide_scoped_rerun",
      decision_boundary: {
        requires_provider_execution: true,
        requires_human_decision: true,
        provider_execution_allowed_without_human: false
      },
      metadata: {
        orchestration_action: "prepare_scoped_rerun",
        repair_plan_source: "semantic_validation",
        repair_request: {
          request_key:
            "content-pipeline:repair-request:preserve_core_node_id:math_g8_linear_function_intro:2026-04-25T10:00:00.000Z",
          repair_action: "prepare_role_scoped_repair",
          repair_strategy: "preserve_core_node_id",
          requested_start_role: "subject_expert",
          requested_role_count: 6,
          requires_provider_execution: false,
          requires_source_writeback: false,
          blocked_artifact_approval_allowed: false
        }
      }
    });
    expect(handoff.labels).toContain("repair_request:preserve_core_node_id");
    expect(handoff.labels).toContain("repair_action:prepare_role_scoped_repair");
  });
});
