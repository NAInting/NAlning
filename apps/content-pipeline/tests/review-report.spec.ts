import { describe, expect, it } from "vitest";

import { renderUnitReviewMarkdownReport, type UnitReviewArtifact } from "../src";

describe("review report renderer", () => {
  it("renders a human-readable markdown report from review artifact diffs", () => {
    const artifact: UnitReviewArtifact = {
      schema_version: "content-pipeline-review-artifact/v0.1",
      mode: "llm_review_no_writeback",
      generated_at: "2026-04-23T08:00:00.000Z",
      unit_id: "math_g8_linear_function_intro",
      status: "ready_for_human_review",
      writeback_performed: false,
      approval: {
        status: "approved",
        reviewer_id: "teacher_math_001",
        reviewed_at: "2026-04-23T08:30:00.000Z"
      },
      semantic_validation: {
        passed: true,
        error_count: 0,
        warning_count: 0,
        issues: []
      },
      orchestration_guidance: {
        action: "notify_human_for_approval",
        reason: "Candidate patches are ready for human approval.",
        requires_provider_execution: false,
        requires_human_decision: true,
        human_queue: "approval_queue",
        automation_step: "open_inbox_item",
        provider_execution_allowed_without_human: false,
        primary_human_action: "approve_review_artifact",
        inbox_title: "[Approval] math_g8_linear_function_intro",
        inbox_summary: "Candidate patches are ready for human approval.",
        recommended_rerun_from: null,
        rerun_chain_depth: 0
      },
      workflow_runs: [
        {
          role: "subject_expert",
          status: "passed",
          attempts: 1,
          patch_sections: ["knowledge"]
        }
      ],
      invocation_logs: [
        {
          unit_id: "math_g8_linear_function_intro",
          role: "subject_expert",
          status: "succeeded",
          patch_sections: ["knowledge"]
        }
      ],
      candidate_patches: [
        {
          role: "subject_expert",
          patch_sections: ["knowledge"],
          patch: {
            knowledge: {
              global_misconceptions: ["新增审阅误区"]
            }
          },
          diff: [
            {
              path: "knowledge.global_misconceptions[0]",
              change_type: "added",
              after: "新增审阅误区"
            }
          ]
        }
      ]
    };

    const report = renderUnitReviewMarkdownReport(artifact);

    expect(report).toContain("# Unit Review Report: math_g8_linear_function_intro");
    expect(report).toContain("- Approval: `approved`");
    expect(report).toContain("- Reviewer: `teacher_math_001`");
    expect(report).toContain("- Semantic validation: `true`");
    expect(report).toContain("| `knowledge.global_misconceptions[0]` | `added` |");
    expect(report).toContain("This report does not imply approval");
    expect(report).not.toContain("RAW_MODEL_RESPONSE");
  });

  it("renders semantic validation issues for blocked artifacts", () => {
    const artifact: UnitReviewArtifact = {
      schema_version: "content-pipeline-review-artifact/v0.1",
      mode: "llm_review_no_writeback",
      generated_at: "2026-04-23T08:00:00.000Z",
      unit_id: "math_g8_linear_function_intro",
      status: "blocked",
      writeback_performed: false,
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
            reason: "Knowledge node ids changed and stranded downstream references."
          }
        ]
      },
      retry_policy: {
        decision: "manual_review_required",
        reason: "The artifact is still blocked after a scoped rerun at this depth.",
        recommended_rerun_from: "subject_expert",
        recommended_rerun_roles: [
          "subject_expert",
          "pedagogy_designer",
          "narrative_designer",
          "engineering_agent",
          "assessment_designer",
          "qa_agent"
        ],
        prior_rerun_from: "subject_expert"
      },
      orchestration_guidance: {
        action: "manual_triage_required",
        reason: "The retry policy already requires manual review.",
        requires_provider_execution: false,
        requires_human_decision: true,
        human_queue: "manual_triage_queue",
        automation_step: "open_inbox_item",
        provider_execution_allowed_without_human: false,
        primary_human_action: "perform_manual_triage",
        inbox_title: "[Manual Triage] math_g8_linear_function_intro",
        inbox_summary: "The retry policy already requires manual review.",
        recommended_rerun_from: "subject_expert",
        rerun_chain_depth: 2
      },
      rerun_context: {
        source_artifact_generated_at: "2026-04-23T07:30:00.000Z",
        source_artifact_status: "blocked",
        start_from_role: "subject_expert",
        inherited_roles: [],
        rerun_chain_depth: 2,
        rerun_root_artifact_generated_at: "2026-04-23T06:45:00.000Z",
        source_retry_decision: "widen_rerun_scope",
        source_recommended_rerun_from: "subject_expert"
      },
      workflow_runs: [],
      invocation_logs: [],
      candidate_patches: []
    };

    const report = renderUnitReviewMarkdownReport(artifact);

    expect(report).toContain("## Semantic Validation Issues");
    expect(report).toContain("## Suggested Repair Plan");
    expect(report).toContain("## Retry Policy");
    expect(report).toContain("## Orchestration Guidance");
    expect(report).toContain("## Rerun Context");
    expect(report).toContain("unknown_node_reference");
    expect(report).toContain("assessment.items[0].target_nodes[0]");
    expect(report).toContain("Recommended rerun from: `subject_expert`");
    expect(report).toContain("Scoped rerun start: `subject_expert`");
    expect(report).toContain("Rerun chain depth: 2");
    expect(report).toContain("Rerun root artifact generated at: 2026-04-23T06:45:00.000Z");
    expect(report).toContain("Source retry decision: `widen_rerun_scope`");
    expect(report).toContain("Decision: `manual_review_required`");
    expect(report).toContain("Action: `manual_triage_required`");
    expect(report).toContain("Human queue: `manual_triage_queue`");
    expect(report).toContain("Automation step: `open_inbox_item`");
    expect(report).toContain("Primary human action: `perform_manual_triage`");
    expect(report).toContain("Inbox title: [Manual Triage] math_g8_linear_function_intro");
  });
});
