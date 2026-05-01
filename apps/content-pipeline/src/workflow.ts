import type { CurriculumAgentRole, UnitSpecSection } from "./agent-specs";
import { agentSpecFor, validateAgentPatchOwnership } from "./agent-specs";

export type AgentRunStatus = "pending" | "running" | "passed" | "failed" | "requires_human_review";

export interface AgentRunState {
  role: CurriculumAgentRole;
  status: AgentRunStatus;
  attempts: number;
  last_error?: string;
  patch_sections: UnitSpecSection[];
}

export interface UnitWorkflowState {
  unit_id: string;
  max_attempts_per_agent: number;
  runs: AgentRunState[];
}

export const curriculumAgentOrder: readonly CurriculumAgentRole[] = [
  "subject_expert",
  "pedagogy_designer",
  "narrative_designer",
  "engineering_agent",
  "assessment_designer",
  "qa_agent"
];

export function createUnitWorkflowState(unitId: string, maxAttemptsPerAgent = 5): UnitWorkflowState {
  return {
    unit_id: unitId,
    max_attempts_per_agent: maxAttemptsPerAgent,
    runs: curriculumAgentOrder.map((role) => ({
      role,
      status: "pending",
      attempts: 0,
      patch_sections: []
    }))
  };
}

export function nextRunnableAgent(state: UnitWorkflowState): CurriculumAgentRole | undefined {
  const next = state.runs.find((run) => {
    if (run.status === "passed" || run.status === "requires_human_review") {
      return false;
    }

    return run.attempts < state.max_attempts_per_agent;
  });

  return next?.role;
}

export function recordAgentPatch(
  state: UnitWorkflowState,
  role: CurriculumAgentRole,
  patch: Partial<Record<UnitSpecSection, unknown>>,
  result: { passed: boolean; error?: string }
): UnitWorkflowState {
  const ownership = validateAgentPatchOwnership(role, patch);
  if (!ownership.passed) {
    throw new Error(`Agent ${role} attempted to write unowned sections: ${ownership.violations.join(", ")}`);
  }

  const runs = state.runs.map((run) => {
    if (run.role !== role) {
      return run;
    }

    const attempts = run.attempts + 1;
    const patchSections = Object.keys(patch) as UnitSpecSection[];
    if (result.passed) {
      const { last_error: _lastError, ...clearedRun } = run;
      return {
        ...clearedRun,
        status: "passed" as const,
        attempts,
        patch_sections: patchSections
      };
    }

    return {
      ...run,
      status: attempts >= state.max_attempts_per_agent ? "requires_human_review" as const : "failed" as const,
      attempts,
      patch_sections: patchSections,
      last_error: result.error ?? "agent failed without a structured error"
    };
  });

  return {
    ...state,
    runs
  };
}

export function readableAgentStep(role: CurriculumAgentRole): string {
  const spec = agentSpecFor(role);
  return `${role} -> ${spec.owns_section}`;
}
