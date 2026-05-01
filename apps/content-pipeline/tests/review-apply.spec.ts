import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { applyReviewedPatchesToUnit, approveReviewArtifact, loadUnitSpecFromFile, type UnitReviewArtifact } from "../src";

const sampleUnitPath = resolve(process.cwd(), "../../content/units/math-g8-s1-linear-function-concept/unit.yaml");

describe("apply reviewed patch", () => {
  it("applies candidate patches to an in-memory unit only after artifact checks pass", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const nextMisconception = "新增审阅误区：把函数图像截距当作单价";
    const artifact: UnitReviewArtifact = {
      schema_version: "content-pipeline-review-artifact/v0.1",
      mode: "llm_review_no_writeback",
      generated_at: "2026-04-23T08:00:00.000Z",
      unit_id: unit.metadata.unit_id,
      status: "ready_for_human_review",
      writeback_performed: false,
      workflow_runs: [],
      invocation_logs: [],
      candidate_patches: [
        {
          role: "subject_expert",
          patch_sections: ["knowledge"],
          patch: {
            knowledge: {
              ...unit.knowledge,
              global_misconceptions: [...unit.knowledge.global_misconceptions, nextMisconception]
            }
          },
          diff: [
            {
              path: `knowledge.global_misconceptions[${unit.knowledge.global_misconceptions.length}]`,
              change_type: "added",
              after: nextMisconception
            }
          ]
        }
      ]
    };

    const approvedArtifact = approveReviewArtifact(artifact, {
      reviewer_id: "teacher_math_001",
      reviewed_at: "2026-04-23T08:30:00.000Z"
    });
    const result = applyReviewedPatchesToUnit(unit, approvedArtifact);

    expect(result.applied_patch_count).toBe(1);
    expect(approvedArtifact.approval).toEqual({
      status: "approved",
      reviewer_id: "teacher_math_001",
      reviewed_at: "2026-04-23T08:30:00.000Z"
    });
    expect(result.unit.knowledge.global_misconceptions).toContain(nextMisconception);
    expect(unit.knowledge.global_misconceptions).not.toContain(nextMisconception);
  });

  it("rejects blocked artifacts", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const artifact: UnitReviewArtifact = {
      schema_version: "content-pipeline-review-artifact/v0.1",
      mode: "llm_review_no_writeback",
      generated_at: "2026-04-23T08:00:00.000Z",
      unit_id: unit.metadata.unit_id,
      status: "blocked",
      writeback_performed: false,
      workflow_runs: [],
      invocation_logs: [],
      candidate_patches: []
    };

    expect(() => applyReviewedPatchesToUnit(unit, artifact)).toThrow("Cannot apply blocked review artifact");
  });

  it("rejects ready artifacts that have not been approved", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const artifact: UnitReviewArtifact = {
      schema_version: "content-pipeline-review-artifact/v0.1",
      mode: "llm_review_no_writeback",
      generated_at: "2026-04-23T08:00:00.000Z",
      unit_id: unit.metadata.unit_id,
      status: "ready_for_human_review",
      writeback_performed: false,
      workflow_runs: [],
      invocation_logs: [],
      candidate_patches: []
    };

    expect(() => applyReviewedPatchesToUnit(unit, artifact)).toThrow("approval.status = approved");
  });
});
