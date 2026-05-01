import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { loadUnitSpecFromFile, prepareScopedReviewRerun, type UnitReviewArtifact } from "../src";

const sampleUnitPath = resolve(process.cwd(), "../../content/units/math-g8-s1-linear-function-concept/unit.yaml");

describe("review rerun gate", () => {
  it("blocks scoped rerun when retry policy requires manual review", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const artifact: UnitReviewArtifact = {
      schema_version: "content-pipeline-review-artifact/v0.1",
      mode: "llm_review_no_writeback",
      generated_at: "2026-04-24T00:00:00.000Z",
      unit_id: unit.metadata.unit_id,
      status: "blocked",
      writeback_performed: false,
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
      retry_policy: {
        decision: "manual_review_required",
        reason: "Provider instability persisted after a rerun.",
        recommended_rerun_from: "qa_agent",
        recommended_rerun_roles: ["qa_agent"],
        prior_rerun_from: "qa_agent"
      },
      workflow_runs: [],
      invocation_logs: [],
      candidate_patches: []
    };

    expect(() => prepareScopedReviewRerun(unit, artifact)).toThrow(
      "Scoped rerun blocked by retry policy: manual review is required"
    );
  });

  it("blocks explicit rerun roles that narrow the recommended scope", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const artifact: UnitReviewArtifact = {
      schema_version: "content-pipeline-review-artifact/v0.1",
      mode: "llm_review_no_writeback",
      generated_at: "2026-04-24T00:00:00.000Z",
      unit_id: unit.metadata.unit_id,
      status: "blocked",
      writeback_performed: false,
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
      retry_policy: {
        decision: "widen_rerun_scope",
        reason: "The rerun must widen back to the earlier owner.",
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
      workflow_runs: [],
      invocation_logs: [],
      candidate_patches: []
    };

    expect(() => prepareScopedReviewRerun(unit, artifact, "qa_agent")).toThrow(
      "Explicit rerun role qa_agent is narrower than the recommended rerun start subject_expert"
    );
  });

  it("allows blocked artifacts with a valid rerun recommendation", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const artifact: UnitReviewArtifact = {
      schema_version: "content-pipeline-review-artifact/v0.1",
      mode: "llm_review_no_writeback",
      generated_at: "2026-04-24T00:00:00.000Z",
      unit_id: unit.metadata.unit_id,
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
      workflow_runs: [],
      invocation_logs: [],
      candidate_patches: []
    };

    const prepared = prepareScopedReviewRerun(unit, artifact);

    expect(prepared.context).toMatchObject({
      start_from_role: "assessment_designer",
      inherited_roles: [],
      rerun_chain_depth: 1,
      rerun_root_artifact_generated_at: "2026-04-24T00:00:00.000Z",
      source_retry_decision: "allow_scoped_rerun",
      source_recommended_rerun_from: "assessment_designer"
    });
  });

  it("increments rerun lineage when the source artifact is already a rerun artifact", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const artifact: UnitReviewArtifact = {
      schema_version: "content-pipeline-review-artifact/v0.1",
      mode: "llm_review_no_writeback",
      generated_at: "2026-04-24T02:00:00.000Z",
      unit_id: unit.metadata.unit_id,
      status: "blocked",
      writeback_performed: false,
      repair_plan: {
        source: "invocation_failure",
        recommended_rerun_from: "qa_agent",
        recommended_rerun_roles: ["qa_agent"],
        recommendations: [
          {
            trigger: "schema_validation at qa_agent",
            root_owner: "qa_agent",
            impacted_owner: "qa_agent",
            rerun_from: "qa_agent",
            rerun_roles: ["qa_agent"],
            reason: "QA section must be regenerated from its owner."
          }
        ]
      },
      retry_policy: {
        decision: "widen_rerun_scope",
        reason: "The rerun needs to widen back to the earlier owner.",
        recommended_rerun_from: "qa_agent",
        recommended_rerun_roles: ["qa_agent"],
        prior_rerun_from: "assessment_designer"
      },
      rerun_context: {
        source_artifact_generated_at: "2026-04-24T01:00:00.000Z",
        source_artifact_status: "blocked",
        start_from_role: "assessment_designer",
        inherited_roles: ["subject_expert", "pedagogy_designer", "narrative_designer", "engineering_agent"],
        rerun_chain_depth: 1,
        rerun_root_artifact_generated_at: "2026-04-24T01:00:00.000Z",
        source_retry_decision: "allow_scoped_rerun",
        source_recommended_rerun_from: "assessment_designer"
      },
      workflow_runs: [],
      invocation_logs: [],
      candidate_patches: []
    };

    const prepared = prepareScopedReviewRerun(unit, artifact);

    expect(prepared.context).toMatchObject({
      start_from_role: "qa_agent",
      rerun_chain_depth: 2,
      rerun_root_artifact_generated_at: "2026-04-24T01:00:00.000Z",
      source_retry_decision: "widen_rerun_scope",
      source_recommended_rerun_from: "qa_agent"
    });
  });
});
