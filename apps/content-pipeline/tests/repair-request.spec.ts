import { describe, expect, it } from "vitest";

import {
  buildUnitReviewRepairRequest,
  type UnitReviewArtifact,
  validateUnitReviewRepairRequest,
  validateUnitReviewRepairRequestSource
} from "../src";
import { loadUnknownNodeReviewArtifact } from "./fixtures";

describe("review repair request", () => {
  const baseArtifact = loadUnknownNodeReviewArtifact();

  it("builds a no-spend role-scoped repair request for dangling knowledge node references", () => {
    const request = buildUnitReviewRepairRequest(baseArtifact);

    expect(request).toMatchObject({
      schema_version: "content-pipeline-review-repair-request/v0.1",
      source_artifact_status: "blocked",
      unit_id: "math_g8_linear_function_intro",
      repair_action: "prepare_role_scoped_repair",
      repair_strategy: "preserve_core_node_id",
      requested_start_role: "subject_expert",
      requested_roles: [
        "subject_expert",
        "pedagogy_designer",
        "narrative_designer",
        "engineering_agent",
        "assessment_designer",
        "qa_agent"
      ],
      target_issues: [
        {
          code: "unknown_node_reference",
          path: "assessment.items[0].target_nodes[0]",
          missing_node_id: "lf_slope_meaning",
          impacted_owner: "assessment_designer",
          root_owner: "subject_expert"
        }
      ],
      review_mode: "llm_review_no_writeback",
      output_contract: "review_artifact_only",
      execution_boundary: {
        requires_provider_execution: false,
        requires_source_writeback: false,
        blocked_artifact_approval_allowed: false
      },
      next_execution_request: {
        kind: "review_only_rerun_candidate",
        command_hint: {
          command: "run-llm-review",
          from_artifact_generated_at: "2026-04-25T10:00:00.000Z",
          rerun_from: "subject_expert"
        }
      }
    });
    expect(request.role_instructions).toEqual(
      expect.arrayContaining([
        "Do not write back to source unit.yaml.",
        "Produce a review artifact only.",
        "Preserve locked seed knowledge node ids unless a human explicitly approves a full-chain rename."
      ])
    );
  });

  it("uses owned-section reference repair when the knowledge graph did not cause the dangling reference", () => {
    const artifact: UnitReviewArtifact = {
      ...baseArtifact,
      repair_plan: {
        ...baseArtifact.repair_plan!,
        recommended_rerun_from: "assessment_designer",
        recommended_rerun_roles: ["assessment_designer", "qa_agent"],
        recommendations: [
          {
            trigger: "unknown_node_reference at assessment.items[0].target_nodes[0]",
            root_owner: "assessment_designer",
            impacted_owner: "assessment_designer",
            rerun_from: "assessment_designer",
            rerun_roles: ["assessment_designer", "qa_agent"],
            reason: "Assessment references must point to existing knowledge nodes."
          }
        ]
      },
      retry_policy: {
        decision: "allow_scoped_rerun",
        reason: "This is the first blocked artifact for the current scope.",
        recommended_rerun_from: "assessment_designer",
        recommended_rerun_roles: ["assessment_designer", "qa_agent"]
      },
      candidate_patches: []
    };

    const request = buildUnitReviewRepairRequest(artifact);

    expect(request).toMatchObject({
      repair_strategy: "fix_owned_section_reference",
      requested_start_role: "assessment_designer",
      requested_roles: ["assessment_designer", "qa_agent"]
    });
    expect(request.role_instructions).toEqual(
      expect.arrayContaining([
        "Do not invent new knowledge nodes from a downstream section.",
        "Replace dangling references with existing knowledge node ids owned by the current unit graph."
      ])
    );
  });

  it("rejects source artifacts that are not blocked unknown_node_reference failures", () => {
    const artifact: UnitReviewArtifact = {
      ...baseArtifact,
      semantic_validation: {
        passed: false,
        error_count: 1,
        warning_count: 0,
        issues: [
          {
            severity: "error",
            code: "forbidden_foreign_standard_source_trace",
            path: "knowledge.meta.source_trace[0]",
            message: "Source trace references Common Core."
          }
        ]
      }
    };

    const validation = validateUnitReviewRepairRequestSource(artifact);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "missing_unknown_node_reference",
      message: "This repair request contract currently covers unknown_node_reference semantic failures."
    });
  });

  it("rejects mixed semantic errors instead of reducing the artifact to unknown-node repair only", () => {
    const artifact: UnitReviewArtifact = {
      ...baseArtifact,
      semantic_validation: {
        passed: false,
        error_count: 2,
        warning_count: 0,
        issues: [
          ...baseArtifact.semantic_validation!.issues,
          {
            severity: "error",
            code: "forbidden_foreign_standard_source_trace",
            path: "knowledge.meta.source_trace[0]",
            message: "Source trace references Common Core."
          }
        ]
      }
    };

    const validation = validateUnitReviewRepairRequestSource(artifact);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "mixed_semantic_errors",
      message:
        "Repair request source contains unsupported semantic errors: forbidden_foreign_standard_source_trace."
    });
  });

  it("rejects source artifacts when repair_plan and retry_policy scopes diverge", () => {
    const artifact: UnitReviewArtifact = {
      ...baseArtifact,
      retry_policy: {
        decision: "allow_scoped_rerun",
        reason: "Tampered retry scope.",
        recommended_rerun_from: "assessment_designer",
        recommended_rerun_roles: ["assessment_designer", "qa_agent"]
      }
    };

    const validation = validateUnitReviewRepairRequestSource(artifact);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "repair_plan_retry_policy_mismatch",
      message: "Repair request source retry_policy must match repair_plan recommended rerun scope."
    });
  });

  it("rejects forged repair plans that disagree with candidate patch evidence", () => {
    const artifact: UnitReviewArtifact = {
      ...baseArtifact,
      repair_plan: {
        source: "semantic_validation",
        recommended_rerun_from: "assessment_designer",
        recommended_rerun_roles: ["assessment_designer", "qa_agent"],
        recommendations: [
          {
            trigger: "unknown_node_reference at assessment.items[0].target_nodes[0]",
            root_owner: "assessment_designer",
            impacted_owner: "assessment_designer",
            rerun_from: "assessment_designer",
            rerun_roles: ["assessment_designer", "qa_agent"],
            reason: "Forged downstream-only repair."
          }
        ]
      },
      retry_policy: {
        decision: "allow_scoped_rerun",
        reason: "Forged downstream-only retry.",
        recommended_rerun_from: "assessment_designer",
        recommended_rerun_roles: ["assessment_designer", "qa_agent"]
      }
    };

    const validation = validateUnitReviewRepairRequestSource(artifact);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "repair_plan_mismatch",
      message: "Repair request source repair_plan must match the semantic validation and candidate patch evidence."
    });
  });

  it("rejects source artifacts when an unknown node issue has no matching repair recommendation", () => {
    const artifact: UnitReviewArtifact = {
      ...baseArtifact,
      repair_plan: {
        ...baseArtifact.repair_plan!,
        recommendations: []
      }
    };

    const validation = validateUnitReviewRepairRequestSource(artifact);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "missing_repair_recommendation",
      message:
        "Repair plan must include a recommendation for unknown_node_reference at assessment.items[0].target_nodes[0]."
    });
  });

  it("fails validation when a request tries to enable provider execution", () => {
    const request = buildUnitReviewRepairRequest(baseArtifact);
    request.execution_boundary.requires_provider_execution = true as false;

    const validation = validateUnitReviewRepairRequest(baseArtifact, request);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "execution_boundary_mismatch",
      message:
        "Repair execution_boundary must forbid provider execution, source writeback, and blocked artifact approval."
    });
  });

  it("fails validation when a request smuggles unknown top-level fields", () => {
    const request = {
      ...buildUnitReviewRepairRequest(baseArtifact),
      approve_blocked_artifact: true
    };

    const validation = validateUnitReviewRepairRequest(baseArtifact, request);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "unknown_request_field",
      message: 'Repair request request contains unknown field "approve_blocked_artifact".'
    });
  });

  it("returns structured issues for malformed nested fields instead of throwing", () => {
    const request = {
      ...buildUnitReviewRepairRequest(baseArtifact),
      execution_boundary: null
    };

    const validation = validateUnitReviewRepairRequest(baseArtifact, request);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "request_shape_mismatch",
      message: "Repair request execution_boundary must be an object."
    });
  });

  it("fails validation closed when requested roles are tampered", () => {
    const request = buildUnitReviewRepairRequest(baseArtifact);
    request.requested_roles = ["assessment_designer", "qa_agent"];

    const validation = validateUnitReviewRepairRequest(baseArtifact, request);

    expect(validation.ok).toBe(false);
    expect(validation.issues).toContainEqual({
      code: "requested_roles_mismatch",
      message: "Repair requested_roles must match the contiguous rerun tail from requested_start_role."
    });
  });
});
