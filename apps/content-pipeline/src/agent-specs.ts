import type { AiNativeUnitSpec } from "@edu-ai/shared-types";

export type CurriculumAgentRole =
  | "subject_expert"
  | "pedagogy_designer"
  | "narrative_designer"
  | "engineering_agent"
  | "assessment_designer"
  | "qa_agent";

export type UnitSpecSection = Exclude<keyof AiNativeUnitSpec, "schema_version" | "metadata" | "runtime_content">;

export interface CurriculumAgentSpec {
  role: CurriculumAgentRole;
  owns_section: UnitSpecSection;
  reads_sections: readonly (keyof AiNativeUnitSpec)[];
  prompt_asset_id: string;
  output_contract: string;
  hard_rules: readonly string[];
}

const commonHardRules = [
  "this project targets a China K-12 private-school pilot; keep curriculum context local to China unless the provided unit metadata explicitly says otherwise",
  "write learner-facing and teacher-facing prose in Simplified Chinese; keep stable ids lowercase ASCII only",
  "do not invent or substitute US Common Core, CCSS, or other foreign standard codes when the provided standard_alignment/source_trace is Chinese curriculum context"
] as const;

export const curriculumAgentSpecs: readonly CurriculumAgentSpec[] = [
  {
    role: "subject_expert",
    owns_section: "knowledge",
    reads_sections: ["metadata"],
    prompt_asset_id: "prompt_subject_expert_unit_knowledge_v0_1",
    output_contract: "write knowledge.nodes, knowledge.edges, knowledge.global_misconceptions",
    hard_rules: [
      ...commonHardRules,
      "strictly align every node with curriculum standards",
      "mark draft standard codes as draft until human subject review",
      "preserve Chinese curriculum/textbook/teacher-note provenance in source_trace; do not replace it with CCSS or English-only references",
      "ensure every knowledge edge endpoint references a node_id present in the same knowledge.nodes output",
      "do not write pedagogy, narrative, implementation, assessment, or quality sections"
    ]
  },
  {
    role: "pedagogy_designer",
    owns_section: "pedagogy",
    reads_sections: ["metadata", "knowledge"],
    prompt_asset_id: "prompt_pedagogy_designer_unit_path_v0_1",
    output_contract: "write pedagogy.learning_path, pedagogy.activities, cognitive_load_estimate",
    hard_rules: [
      ...commonHardRules,
      "choose pedagogy patterns based on node difficulty and misconceptions",
      "avoid using only one pedagogy type across the unit",
      "do not alter knowledge nodes"
    ]
  },
  {
    role: "narrative_designer",
    owns_section: "narrative",
    reads_sections: ["metadata", "knowledge", "pedagogy"],
    prompt_asset_id: "prompt_narrative_designer_unit_story_v0_1",
    output_contract: "write narrative.scenarios, characters, dialogue_scripts, gamification",
    hard_rules: [
      ...commonHardRules,
      "make scenarios concrete and age-appropriate",
      "avoid AI-sounding fake dialogue",
      "do not produce submittable homework answers"
    ]
  },
  {
    role: "engineering_agent",
    owns_section: "implementation",
    reads_sections: ["metadata", "knowledge", "pedagogy", "narrative"],
    prompt_asset_id: "prompt_engineering_agent_unit_assets_v0_1",
    output_contract: "write implementation.components, prompts, data_hooks",
    hard_rules: [
      ...commonHardRules,
      "every prompt asset must have a stable version",
      "every data hook must include a privacy note",
      "do not bypass privacy-filter or LLM gateway contracts"
    ]
  },
  {
    role: "assessment_designer",
    owns_section: "assessment",
    reads_sections: ["metadata", "knowledge", "pedagogy", "narrative", "implementation"],
    prompt_asset_id: "prompt_assessment_designer_unit_items_v0_1",
    output_contract: "write assessment.items and assessment.min_confidence_threshold",
    hard_rules: [
      ...commonHardRules,
      "align every assessment item to existing knowledge node ids",
      "cover core mastery criteria and misconceptions, not just recall",
      "mark items requiring teacher judgment with requires_human_review"
    ]
  },
  {
    role: "qa_agent",
    owns_section: "quality",
    reads_sections: ["metadata", "knowledge", "pedagogy", "narrative", "implementation", "assessment"],
    prompt_asset_id: "prompt_qa_agent_unit_review_v0_1",
    output_contract: "write quality.checklist_pass, issues, reviewer_notes",
    hard_rules: [
      ...commonHardRules,
      "fail the unit on unresolved blocking issues",
      "surface owner_agent for every issue",
      "prefer false negatives over shipping unsafe or incorrect content"
    ]
  }
] as const;

export function agentSpecFor(role: CurriculumAgentRole): CurriculumAgentSpec {
  const spec = curriculumAgentSpecs.find((item) => item.role === role);
  if (!spec) {
    throw new Error(`Unknown curriculum agent role: ${role}`);
  }

  return spec;
}

export function validateAgentPatchOwnership(
  role: CurriculumAgentRole,
  patch: Partial<Record<UnitSpecSection, unknown>>
): { passed: boolean; violations: string[] } {
  const spec = agentSpecFor(role);
  const violations = Object.keys(patch).filter((section) => section !== spec.owns_section);
  return {
    passed: violations.length === 0,
    violations
  };
}
