import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildWorkflowLogEntry,
  createUnitWorkflowState,
  loadUnitSpecFromFile,
  mergeAgentPatchIntoUnit,
  recordAgentPatch,
  serializeUnitSpecToYaml
} from "../src";

const sampleUnitPath = resolve(process.cwd(), "../../content/units/math-g8-s1-linear-function-concept/unit.yaml");

describe("unit yaml IO and patch merge", () => {
  it("loads the sample unit yaml through the shared schema", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);

    expect(unit.schema_version).toBe("ai-native-unit-v0.1");
    expect(unit.metadata.unit_id).toBe("math_g8_linear_function_intro");
    expect(unit.knowledge.nodes[0]?.node_id).toBe("lf_slope_meaning");
  });

  it("serializes validated unit specs back to yaml", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const yaml = serializeUnitSpecToYaml(unit);

    expect(yaml).toContain("schema_version: ai-native-unit-v0.1");
    expect(yaml).toContain("unit_id: math_g8_linear_function_intro");
  });

  it("merges only the owned section for an agent", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const merged = mergeAgentPatchIntoUnit(unit, "qa_agent", {
      quality: {
        ...unit.quality,
        checklist_pass: true,
        issues: unit.quality.issues.map((issue) => ({
          ...issue,
          status: "resolved" as const
        })),
        reviewer_notes: [...unit.quality.reviewer_notes, "Phase 2.3 patch merge smoke test."]
      }
    });

    expect(merged.quality.checklist_pass).toBe(true);
    expect(merged.metadata.unit_id).toBe(unit.metadata.unit_id);
  });

  it("rejects invalid merged unit specs", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);

    expect(() => mergeAgentPatchIntoUnit(unit, "qa_agent", { quality: { checklist_pass: true } })).toThrow();
  });

  it("rejects semantically invalid owned sections before later agents run", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);

    expect(() =>
      mergeAgentPatchIntoUnit(unit, "subject_expert", {
        knowledge: {
          ...unit.knowledge,
          edges: [
            {
              from_node_id: "missing_node",
              to_node_id: unit.knowledge.nodes[0]!.node_id,
              relation: "supports" as const
            }
          ]
        }
      })
    ).toThrow("semantic validation failed for knowledge");
  });

  it("builds workflow logs without storing raw patch payloads", () => {
    let state = createUnitWorkflowState("math_g8_linear_function_intro");
    state = recordAgentPatch(state, "subject_expert", { knowledge: {} }, { passed: true });

    const entry = buildWorkflowLogEntry(state, "subject_expert", { knowledge: {} }, "2026-04-22T08:00:00.000Z");

    expect(entry).toEqual({
      unit_id: "math_g8_linear_function_intro",
      role: "subject_expert",
      step: "subject_expert -> knowledge",
      status: "passed",
      attempt: 1,
      patch_sections: ["knowledge"],
      created_at: "2026-04-22T08:00:00.000Z"
    });
    expect(JSON.stringify(entry)).not.toContain("nodes");
  });
});
