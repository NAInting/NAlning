import { PromptRegistry, type PromptTemplate } from "@edu-ai/llm-gateway";

import { curriculumAgentSpecs } from "./agent-specs";

export function buildContentPipelinePromptTemplates(): readonly PromptTemplate[] {
  return curriculumAgentSpecs.map((spec) => ({
    prompt_id: spec.prompt_asset_id,
    prompt_version: "0.1.0",
    purpose: "content_generation",
    content: [
      `Role: ${spec.role}`,
      `Owned section: ${spec.owns_section}`,
      `Output contract: ${spec.output_contract}`,
      "Hard rules:",
      ...spec.hard_rules.map((rule) => `- ${rule}`)
    ].join("\n"),
    source_trace: ["docs/UNIT_SPEC.md", "docs/PHASE_2_2_AGENT_SPECS_IMPLEMENTATION_REPORT.md"],
    active: true
  }));
}

export function createContentPipelinePromptRegistry(): PromptRegistry {
  return new PromptRegistry(buildContentPipelinePromptTemplates());
}

