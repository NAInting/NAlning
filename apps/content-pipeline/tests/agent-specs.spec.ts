import { describe, expect, it } from "vitest";

import { agentSpecFor, curriculumAgentSpecs, validateAgentPatchOwnership } from "../src";

describe("curriculum agent specs", () => {
  it("defines the phase 2.2 curriculum agents in production order", () => {
    expect(curriculumAgentSpecs.map((spec) => spec.role)).toEqual([
      "subject_expert",
      "pedagogy_designer",
      "narrative_designer",
      "engineering_agent",
      "assessment_designer",
      "qa_agent"
    ]);
  });

  it("assigns each agent to one owned section", () => {
    expect(agentSpecFor("subject_expert").owns_section).toBe("knowledge");
    expect(agentSpecFor("pedagogy_designer").owns_section).toBe("pedagogy");
    expect(agentSpecFor("narrative_designer").owns_section).toBe("narrative");
    expect(agentSpecFor("engineering_agent").owns_section).toBe("implementation");
    expect(agentSpecFor("assessment_designer").owns_section).toBe("assessment");
    expect(agentSpecFor("qa_agent").owns_section).toBe("quality");
  });

  it("allows an agent to patch only its owned section", () => {
    expect(validateAgentPatchOwnership("subject_expert", { knowledge: {} }).passed).toBe(true);
    expect(validateAgentPatchOwnership("assessment_designer", { assessment: {} }).passed).toBe(true);
    expect(validateAgentPatchOwnership("qa_agent", { quality: {} }).passed).toBe(true);
  });

  it("rejects cross-section writes", () => {
    const result = validateAgentPatchOwnership("subject_expert", {
      knowledge: {},
      narrative: {}
    });

    expect(result.passed).toBe(false);
    expect(result.violations).toEqual(["narrative"]);
  });

  it("requires prompt assets and hard rules for every agent", () => {
    for (const spec of curriculumAgentSpecs) {
      expect(spec.prompt_asset_id).toMatch(/^prompt_/);
      expect(spec.hard_rules.length).toBeGreaterThanOrEqual(3);
      expect(spec.output_contract).toContain(spec.owns_section);
    }
  });

  it("requires subject experts to keep knowledge edges internally referential", () => {
    expect(agentSpecFor("subject_expert").hard_rules.join("\n")).toContain(
      "every knowledge edge endpoint references a node_id present in the same knowledge.nodes output"
    );
  });

  it("keeps every agent constrained to China K-12 curriculum context", () => {
    for (const spec of curriculumAgentSpecs) {
      const rules = spec.hard_rules.join("\n");

      expect(rules).toContain("China K-12 private-school pilot");
      expect(rules).toContain("Simplified Chinese");
      expect(rules).toContain("US Common Core, CCSS");
    }
  });
});
