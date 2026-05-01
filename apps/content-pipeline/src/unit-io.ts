import { readFile } from "node:fs/promises";

import { AiNativeUnitSpecSchema, type AiNativeUnitSpec } from "@edu-ai/shared-types";
import { parse, stringify } from "yaml";

import type { CurriculumAgentRole, UnitSpecSection } from "./agent-specs";
import { validateAgentPatchOwnership } from "./agent-specs";
import { validateUnitSectionSemanticIntegrity } from "./unit-semantic-validation";
import type { AgentRunStatus, UnitWorkflowState } from "./workflow";
import { readableAgentStep } from "./workflow";

export interface WorkflowLogEntry {
  unit_id: string;
  role: CurriculumAgentRole;
  step: string;
  status: AgentRunStatus;
  attempt: number;
  patch_sections: UnitSpecSection[];
  created_at: string;
  message?: string;
}

export async function loadUnitSpecFromFile(filePath: string): Promise<AiNativeUnitSpec> {
  const raw = await readFile(filePath, "utf8");
  return parseUnitSpecYaml(raw);
}

export function parseUnitSpecYaml(rawYaml: string): AiNativeUnitSpec {
  const parsed = parse(rawYaml);
  return AiNativeUnitSpecSchema.parse(parsed);
}

export function serializeUnitSpecToYaml(unit: AiNativeUnitSpec): string {
  const validated = AiNativeUnitSpecSchema.parse(unit);
  return stringify(validated, {
    lineWidth: 120
  });
}

export function mergeAgentPatchIntoUnit(
  unit: AiNativeUnitSpec,
  role: CurriculumAgentRole,
  patch: Partial<Record<UnitSpecSection, unknown>>
): AiNativeUnitSpec {
  const ownership = validateAgentPatchOwnership(role, patch);
  if (!ownership.passed) {
    throw new Error(`Agent ${role} attempted to write unowned sections: ${ownership.violations.join(", ")}`);
  }

  const merged = AiNativeUnitSpecSchema.parse({
    ...unit,
    ...patch
  });

  for (const section of Object.keys(patch) as UnitSpecSection[]) {
    const semantic = validateUnitSectionSemanticIntegrity(merged, section);
    if (!semantic.passed) {
      const firstIssue = semantic.issues[0];
      throw new Error(
        `Agent ${role} semantic validation failed for ${section}: ${firstIssue?.code ?? "unknown_semantic_issue"} at ${firstIssue?.path ?? section}: ${firstIssue?.message ?? "Unknown semantic validation error."}`
      );
    }
  }

  return merged;
}

export function buildWorkflowLogEntry(
  state: UnitWorkflowState,
  role: CurriculumAgentRole,
  patch: Partial<Record<UnitSpecSection, unknown>>,
  createdAt = new Date().toISOString()
): WorkflowLogEntry {
  const run = state.runs.find((item) => item.role === role);
  if (!run) {
    throw new Error(`Cannot log unknown workflow role: ${role}`);
  }

  const baseEntry = {
    unit_id: state.unit_id,
    role,
    step: readableAgentStep(role),
    status: run.status,
    attempt: run.attempts,
    patch_sections: Object.keys(patch) as UnitSpecSection[],
    created_at: createdAt
  };

  if (run.last_error) {
    return {
      ...baseEntry,
      message: run.last_error
    };
  }

  return baseEntry;
}
