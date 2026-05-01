import type { GatewayCompleteRequest, GatewayCompleteResponse } from "@edu-ai/llm-gateway";
import type { AiNativeUnitSpec } from "@edu-ai/shared-types";

import { agentSpecFor, validateAgentPatchOwnership, type CurriculumAgentRole, type UnitSpecSection } from "./agent-specs";

export type AgentInvocationStatus = "succeeded" | "failed_retryable" | "failed_blocking" | "requires_human_review";

export type AgentInvocationFailureCategory =
  | "schema_validation"
  | "ownership_violation"
  | "model_unavailable"
  | "safety_block"
  | "empty_output"
  | "unknown";

export interface AgentInvocationGatewayTrace {
  request_id: string;
  provider: GatewayCompleteResponse["provider"];
  model: string;
  route_selected: GatewayCompleteResponse["route_selected"];
  prompt_id: string;
  prompt_version: string;
  prompt_source_trace: readonly string[];
  input_tokens: number;
  output_tokens: number;
  estimated_cost_cny: number;
  cache_hit: boolean;
}

export interface AgentInvocationResult {
  unit_id: string;
  role: CurriculumAgentRole;
  status: AgentInvocationStatus;
  patch_sections: UnitSpecSection[];
  patch?: Partial<Record<UnitSpecSection, unknown>>;
  gateway?: AgentInvocationGatewayTrace;
  failure?: {
    category: AgentInvocationFailureCategory;
    message: string;
    retryable: boolean;
  };
}

export interface AgentInvocationLogSummary {
  unit_id: string;
  role: CurriculumAgentRole;
  status: AgentInvocationStatus;
  patch_sections: UnitSpecSection[];
  gateway?: AgentInvocationGatewayTrace;
  failure?: {
    category: AgentInvocationFailureCategory;
    retryable: boolean;
  };
}

export function buildAgentGatewayRequest(
  unit: AiNativeUnitSpec,
  role: CurriculumAgentRole,
  attempt = 1
): GatewayCompleteRequest {
  const spec = agentSpecFor(role);
  const readableSections = spec.reads_sections.join(", ");
  const sectionSchema = schemaHintForSection(spec.owns_section);
  const knownNodeIds = unit.knowledge.nodes.map((node) => node.node_id).join(", ");
  const hardRules = spec.hard_rules.map((rule) => `- ${rule}`).join("\n");
  const standardAlignment = unit.metadata.standard_alignment
    .map(
      (standard) =>
        `- ${standard.standard_system} / ${standard.standard_code}: ${standard.description}`
    )
    .join("\n");
  const ownedSectionSourceTrace = sourceTraceHintForSection(unit, spec.owns_section);

  return {
    purpose: "content_generation",
    prompt_id: spec.prompt_asset_id,
    request_id: `${unit.metadata.unit_id}_${role}_attempt_${attempt}`,
    privacy_level: "public",
    model_preference: "deep",
    user_context: {
      role: "system",
      subject: unit.metadata.subject
    },
    messages: [
      {
        role: "system",
        content: [
          `You are ${role}.`,
          `Write only the ${spec.owns_section} section.`,
          `Return JSON only: {"section":"${spec.owns_section}","patch":{...${spec.owns_section} section...}}`,
          "The patch must be the complete section object, not a partial diff.",
          "Hard rules are mandatory and override model priors."
        ].join(" ")
      },
      {
        role: "user",
        content: [
          `Unit: ${unit.metadata.unit_id}`,
          `Title: ${unit.metadata.title}`,
          `Subject: ${unit.metadata.subject}`,
          `Grade: ${unit.metadata.grade}`,
          `Provided standard alignment:\n${standardAlignment}`,
          `Readable sections: ${readableSections}`,
          `Existing ${spec.owns_section} source_trace to preserve or refine:\n${ownedSectionSourceTrace}`,
          `Hard rules:\n${hardRules}`,
          `UnitSpecId format: lowercase ASCII only, must match /^[a-z0-9][a-z0-9_-]*$/.`,
          `Known valid node ids for references: ${knownNodeIds || "none"}`,
          `Output contract: ${spec.output_contract}`,
          `Exact section schema shape:\n${sectionSchema}`
        ].join("\n")
      }
    ]
  };
}

function sourceTraceHintForSection(unit: AiNativeUnitSpec, section: UnitSpecSection): string {
  return unit[section].meta.source_trace
    .map((source) => `- ${source.source_id} / ${source.source_type}: ${source.reference}`)
    .join("\n");
}

function schemaHintForSection(section: UnitSpecSection): string {
  const meta =
    "meta: { author_agent: one of subject_expert|pedagogy_designer|narrative_designer|engineering_agent|assessment_designer|qa_agent, confidence_score: number 0..1, source_trace: [{ source_id: string, source_type: one of curriculum_standard|textbook|teacher_note|pedagogy_library|agent_output|human_review, reference: string, retrieved_at: ISO datetime }] }";

  switch (section) {
    case "knowledge":
      return [
        "{",
        `  ${meta},`,
        "  nodes: [{ node_id: string, title: string, mastery_criteria: string[], misconceptions: string[], difficulty: 1|2|3|4|5 }],",
        "  edges: [{ from_node_id: string, to_node_id: string, relation: one of prerequisite|supports|contrasts|extends }],",
        "  global_misconceptions: string[]",
        "}",
        "Use node_id/title/from_node_id/to_node_id/relation exactly. Do not use id/label/source/target/relationship.",
        "Every edge from_node_id and to_node_id must reference a node_id present in this same nodes array."
      ].join("\n");
    case "pedagogy":
      return [
        "{",
        `  ${meta},`,
        "  learning_path: UnitSpecId[] referencing known node_id values,",
        "  activities: [{ activity_id: UnitSpecId, type: one of socratic_dialogue|scenario_immersion|problem_based|project_based|peer_teaching|debate|metacognitive_reflection|direct_instruction|spaced_repetition, target_nodes: UnitSpecId[] referencing known node_id values, duration_min: positive integer, rationale: string }],",
        "  cognitive_load_estimate: one of low|medium|high,",
        "  differentiation_notes: string[]",
        "}"
      ].join("\n");
    case "narrative":
      return [
        "{",
        `  ${meta},`,
        "  scenarios: [{ scenario_id: UnitSpecId, title: string, target_nodes: UnitSpecId[] referencing known node_id values, setup: string }],",
        "  characters: [{ character_id: UnitSpecId, name: string, role: string, voice_notes: string }],",
        "  dialogue_scripts: [{ script_id: UnitSpecId, mode: one of mentor|tutor|peer|challenger|companion, target_nodes: UnitSpecId[] referencing known node_id values, opening_move: string, boundary_notes: string[] }],",
        "  gamification: string[]",
        "}"
      ].join("\n");
    case "implementation":
      return [
        "{",
        `  ${meta},`,
        "  components: string[],",
        "  prompts: [{ prompt_id: UnitSpecId, purpose: one of student_dialogue|teacher_daily_report|assessment_feedback|content_generation, version: string, target_nodes: UnitSpecId[] referencing known node_id values }],",
        "  data_hooks: [{ hook_id: UnitSpecId, event_type: string, target_nodes: UnitSpecId[] referencing known node_id values, privacy_note: string }]",
        "}"
      ].join("\n");
    case "assessment":
      return [
        "{",
        `  ${meta},`,
        "  items: [{ item_id: UnitSpecId, type: one of multiple_choice|short_answer|essay|construction|dialogue_performance, target_nodes: UnitSpecId[] referencing known node_id values, prompt: string, expected_signal: string, requires_human_review: boolean }],",
        "  min_confidence_threshold: number 0..1",
        "}"
      ].join("\n");
    case "quality":
      return [
        "{",
        `  ${meta},`,
        "  checklist_pass: boolean,",
        "  issues: [{ issue_id: UnitSpecId, severity: one of low|medium|high|blocking, owner_agent: one of subject_expert|pedagogy_designer|narrative_designer|engineering_agent|assessment_designer|qa_agent, description: string, status: one of open|resolved|waived }],",
        "  reviewer_notes: string[]",
        "}"
      ].join("\n");
  }
}

export function buildAgentInvocationSuccess(
  unit: AiNativeUnitSpec,
  role: CurriculumAgentRole,
  patch: Partial<Record<UnitSpecSection, unknown>>,
  response: GatewayCompleteResponse
): AgentInvocationResult {
  const ownership = validateAgentPatchOwnership(role, patch);
  if (!ownership.passed) {
    throw new Error(`Agent ${role} attempted to write unowned sections: ${ownership.violations.join(", ")}`);
  }

  return {
    unit_id: unit.metadata.unit_id,
    role,
    status: "succeeded",
    patch_sections: Object.keys(patch) as UnitSpecSection[],
    patch,
    gateway: toGatewayTrace(response)
  };
}

export function buildAgentInvocationFailure(
  unit: AiNativeUnitSpec,
  role: CurriculumAgentRole,
  category: AgentInvocationFailureCategory,
  message: string,
  retryable: boolean
): AgentInvocationResult {
  return {
    unit_id: unit.metadata.unit_id,
    role,
    status: retryable ? "failed_retryable" : "failed_blocking",
    patch_sections: [],
    failure: {
      category,
      message,
      retryable
    }
  };
}

export function summarizeInvocationForLog(result: AgentInvocationResult): AgentInvocationLogSummary {
  const base = {
    unit_id: result.unit_id,
    role: result.role,
    status: result.status,
    patch_sections: result.patch_sections
  };

  if (result.gateway) {
    return {
      ...base,
      gateway: result.gateway
    };
  }

  if (result.failure) {
    return {
      ...base,
      failure: {
        category: result.failure.category,
        retryable: result.failure.retryable
      }
    };
  }

  return base;
}

function toGatewayTrace(response: GatewayCompleteResponse): AgentInvocationGatewayTrace {
  return {
    request_id: response.request_id,
    provider: response.provider,
    model: response.model,
    route_selected: response.route_selected,
    prompt_id: response.prompt_id,
    prompt_version: response.prompt_version,
    prompt_source_trace: response.prompt_source_trace,
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
    estimated_cost_cny: response.cost.estimated_cost_cny,
    cache_hit: response.cache_hit
  };
}
