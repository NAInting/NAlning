import {
  createLlmGateway,
  type GatewayCompleteRequest,
  type GatewayCompleteResponse,
  type LlmGateway
} from "@edu-ai/llm-gateway";
import type { AiNativeUnitSpec } from "@edu-ai/shared-types";

import { agentSpecFor, type CurriculumAgentRole, type UnitSpecSection } from "./agent-specs";
import {
  buildAgentGatewayRequest,
  buildAgentInvocationFailure,
  buildAgentInvocationSuccess,
  summarizeInvocationForLog,
  type AgentInvocationLogSummary,
  type AgentInvocationResult
} from "./agent-invocation";
import { parseAgentJsonPatch } from "./output-parser";
import { createContentPipelinePromptRegistry } from "./prompt-assets";
import { mergeAgentPatchIntoUnit } from "./unit-io";
import { createUnitWorkflowState, curriculumAgentOrder, recordAgentPatch, type UnitWorkflowState } from "./workflow";
import {
  collectContentPipelineRuntimeEventViews,
  createContentPipelineRuntimeEmitter,
  emitWorkflowStageEnd,
  emitWorkflowStageError,
  emitWorkflowStageStart,
  type ContentPipelineRuntimeEventViews,
  type ContentPipelineRuntimeEventsOptions,
  type WorkflowStageRuntimeMetadata
} from "./workflow-runtime-events";

export interface AgentOutputParserInput {
  unit: AiNativeUnitSpec;
  role: CurriculumAgentRole;
  response: GatewayCompleteResponse;
}

export type AgentOutputParser = (input: AgentOutputParserInput) => Partial<Record<UnitSpecSection, unknown>>;

export interface LlmUnitWorkflowResult extends ContentPipelineRuntimeEventViews {
  unit: AiNativeUnitSpec;
  state: UnitWorkflowState;
  invocations: AgentInvocationResult[];
  logs: AgentInvocationLogSummary[];
}

export interface LlmUnitWorkflowOptions extends ContentPipelineRuntimeEventsOptions {
  gateway?: Pick<LlmGateway, "complete">;
  parser?: AgentOutputParser;
  max_attempts_per_agent?: number;
  start_from_role?: CurriculumAgentRole;
}

export function replayOwnedSectionFromUnitParser({
  unit,
  role
}: AgentOutputParserInput): Partial<Record<UnitSpecSection, unknown>> {
  const section = curriculumAgentOrder.includes(role) ? ownedSectionForRole(role) : undefined;
  if (!section) {
    throw new Error(`Unknown curriculum agent role: ${role}`);
  }

  return {
    [section]: unit[section]
  } as Partial<Record<UnitSpecSection, unknown>>;
}

export function jsonPatchFromGatewayResponseParser({
  role,
  response
}: AgentOutputParserInput): Partial<Record<UnitSpecSection, unknown>> {
  return parseAgentJsonPatch(role, response.content);
}

export async function runLlmMockUnitWorkflow(
  unit: AiNativeUnitSpec,
  options: LlmUnitWorkflowOptions = {}
): Promise<LlmUnitWorkflowResult> {
  const gateway =
    options.gateway ??
    createLlmGateway({
      promptRegistry: createContentPipelinePromptRegistry()
    });
  const parser = options.parser ?? replayOwnedSectionFromUnitParser;
  let currentUnit = unit;
  let state = createUnitWorkflowState(unit.metadata.unit_id, options.max_attempts_per_agent);
  const invocations: AgentInvocationResult[] = [];
  const logs: AgentInvocationLogSummary[] = [];
  const runtimeEmitter = options.emit_runtime_events
    ? createContentPipelineRuntimeEmitter(unit.metadata.unit_id, options)
    : undefined;
  const startIndex = options.start_from_role ? curriculumAgentOrder.indexOf(options.start_from_role) : 0;

  if (startIndex === -1) {
    throw new Error(`Unsupported workflow start role: ${options.start_from_role}`);
  }

  for (const role of curriculumAgentOrder.slice(0, startIndex)) {
    const patch = replayOwnedSectionFromUnitParser({
      unit: currentUnit,
      role,
      response: createReplayGatewayResponse(unit.metadata.unit_id, role)
    });
    state = recordAgentPatch(state, role, patch, { passed: true });
  }

  for (const role of curriculumAgentOrder.slice(startIndex)) {
    const run = state.runs.find((item) => item.role === role);
    const attempt = (run?.attempts ?? 0) + 1;
    const request = buildAgentGatewayRequest(currentUnit, role, attempt);

    try {
      emitWorkflowStageStart(
        runtimeEmitter,
        currentUnit.metadata.unit_id,
        role,
        attempt,
        metadataFromGatewayRequest(request)
      );
      const response = await gateway.complete(request);
      const patch = parser({
        unit: currentUnit,
        role,
        response
      });
      const invocation = buildAgentInvocationSuccess(currentUnit, role, patch, response);

      currentUnit = mergeAgentPatchIntoUnit(currentUnit, role, patch);
      state = recordAgentPatch(state, role, patch, { passed: true });
      invocations.push(invocation);
      logs.push(summarizeInvocationForLog(invocation));
      emitWorkflowStageEnd(
        runtimeEmitter,
        currentUnit.metadata.unit_id,
        role,
        attempt,
        Object.keys(patch) as UnitSpecSection[],
        metadataFromGatewayResponse(response)
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const category = classifyInvocationError(message);
      const failure = buildAgentInvocationFailure(currentUnit, role, category, message, true);
      const patch: Partial<Record<UnitSpecSection, unknown>> = {};

      state = recordAgentPatch(state, role, patch, { passed: false, error: message });
      invocations.push(failure);
      logs.push(summarizeInvocationForLog(failure));
      emitWorkflowStageError(
        runtimeEmitter,
        currentUnit.metadata.unit_id,
        role,
        attempt,
        category,
        true,
        metadataFromGatewayRequest(request)
      );
      break;
    }
  }

  return {
    unit: currentUnit,
    state,
    invocations,
    logs,
    ...collectContentPipelineRuntimeEventViews(runtimeEmitter)
  };
}

function metadataFromGatewayRequest(request: GatewayCompleteRequest): WorkflowStageRuntimeMetadata {
  const metadata: WorkflowStageRuntimeMetadata = {
    prompt_version: "gateway_request",
    provider_id: "llm_gateway"
  };

  if (request.prompt_id) {
    metadata.prompt_id = request.prompt_id;
  }

  return metadata;
}

function metadataFromGatewayResponse(response: GatewayCompleteResponse): WorkflowStageRuntimeMetadata {
  return {
    prompt_id: response.prompt_id,
    prompt_version: response.prompt_version,
    provider_id: response.provider,
    model_id: response.model,
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens
  };
}

function createReplayGatewayResponse(unitId: string, role: CurriculumAgentRole): GatewayCompleteResponse {
  return {
    request_id: `${unitId}_${role}_replay`,
    provider: "claude_mock",
    model: "mock-content-review",
    route_selected: "controlled_cloud",
    prompt_id: agentSpecFor(role).prompt_asset_id,
    prompt_version: "replay",
    prompt_source_trace: ["scoped_rerun_replay"],
    content: "",
    usage: {
      input_tokens: 0,
      output_tokens: 0,
      total_tokens: 0
    },
    cost: {
      estimated_cost_cny: 0,
      input_cost_cny: 0,
      output_cost_cny: 0
    },
    cache_hit: true,
    privacy: {
      route_selected: "controlled_cloud",
      sensitive_keyword_hit: false,
      reason: "standard_policy"
    }
  };
}

function ownedSectionForRole(role: CurriculumAgentRole): UnitSpecSection {
  switch (role) {
    case "subject_expert":
      return "knowledge";
    case "pedagogy_designer":
      return "pedagogy";
    case "narrative_designer":
      return "narrative";
    case "engineering_agent":
      return "implementation";
    case "assessment_designer":
      return "assessment";
    case "qa_agent":
      return "quality";
  }
}

function classifyInvocationError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("unowned sections")) {
    return "ownership_violation" as const;
  }

  if (
    normalized.includes("schema") ||
    normalized.includes("parse") ||
    normalized.includes("validation") ||
    normalized.includes("valid json") ||
    normalized.includes("invalid input")
  ) {
    return "schema_validation" as const;
  }

  if (
    normalized.includes("llm adapter") ||
    normalized.includes("mock adapter failed") ||
    normalized.includes("provider request timed out") ||
    normalized.includes("timed out after")
  ) {
    return "model_unavailable" as const;
  }

  return "unknown" as const;
}
