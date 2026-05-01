import type { AiNativeUnitSpec } from "@edu-ai/shared-types";

import { agentSpecFor, type CurriculumAgentRole, type UnitSpecSection } from "./agent-specs";
import { buildWorkflowLogEntry, mergeAgentPatchIntoUnit, type WorkflowLogEntry } from "./unit-io";
import { createUnitWorkflowState, curriculumAgentOrder, recordAgentPatch, type UnitWorkflowState } from "./workflow";
import {
  collectContentPipelineRuntimeEventViews,
  createContentPipelineRuntimeEmitter,
  emitWorkflowStageEnd,
  emitWorkflowStageStart,
  type ContentPipelineRuntimeEventViews,
  type ContentPipelineRuntimeEventsOptions
} from "./workflow-runtime-events";

export interface MockAgentPatchInput {
  unit: AiNativeUnitSpec;
  role: CurriculumAgentRole;
  attempt: number;
}

export type MockAgentPatchProducer = (input: MockAgentPatchInput) => Partial<Record<UnitSpecSection, unknown>>;

export interface MockUnitWorkflowResult extends ContentPipelineRuntimeEventViews {
  unit: AiNativeUnitSpec;
  state: UnitWorkflowState;
  logs: WorkflowLogEntry[];
}

export interface MockUnitWorkflowOptions extends ContentPipelineRuntimeEventsOptions {
  producer?: MockAgentPatchProducer;
  start_from_role?: CurriculumAgentRole;
}

export function replayOwnedSectionPatch({ unit, role }: MockAgentPatchInput): Partial<Record<UnitSpecSection, unknown>> {
  const section = agentSpecFor(role).owns_section;
  return {
    [section]: unit[section]
  } as Partial<Record<UnitSpecSection, unknown>>;
}

export function runMockUnitWorkflow(unit: AiNativeUnitSpec, options: MockUnitWorkflowOptions = {}): MockUnitWorkflowResult {
  const producer = options.producer ?? replayOwnedSectionPatch;
  let currentUnit = unit;
  let state = createUnitWorkflowState(unit.metadata.unit_id);
  const logs: WorkflowLogEntry[] = [];
  const runtimeEmitter = options.emit_runtime_events
    ? createContentPipelineRuntimeEmitter(unit.metadata.unit_id, options)
    : undefined;
  const startIndex = options.start_from_role ? curriculumAgentOrder.indexOf(options.start_from_role) : 0;

  if (startIndex === -1) {
    throw new Error(`Unsupported workflow start role: ${options.start_from_role}`);
  }

  for (const role of curriculumAgentOrder.slice(0, startIndex)) {
    const patch = replayOwnedSectionPatch({
      unit: currentUnit,
      role,
      attempt: 1
    });
    state = recordAgentPatch(state, role, patch, { passed: true });
  }

  for (const role of curriculumAgentOrder.slice(startIndex)) {
    const currentRun = state.runs.find((run) => run.role === role);
    const attempt = (currentRun?.attempts ?? 0) + 1;
    emitWorkflowStageStart(runtimeEmitter, currentUnit.metadata.unit_id, role, attempt, {
      provider_id: "local_mock"
    });

    const patch = producer({
      unit: currentUnit,
      role,
      attempt
    });

    currentUnit = mergeAgentPatchIntoUnit(currentUnit, role, patch);
    state = recordAgentPatch(state, role, patch, { passed: true });
    logs.push(buildWorkflowLogEntry(state, role, patch, options.created_at));
    emitWorkflowStageEnd(
      runtimeEmitter,
      currentUnit.metadata.unit_id,
      role,
      attempt,
      Object.keys(patch) as UnitSpecSection[],
      {
        provider_id: "local_mock"
      }
    );
  }

  return {
    unit: currentUnit,
    state,
    logs,
    ...collectContentPipelineRuntimeEventViews(runtimeEmitter)
  };
}
