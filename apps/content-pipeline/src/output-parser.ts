import { agentSpecFor, validateAgentPatchOwnership, type CurriculumAgentRole, type UnitSpecSection } from "./agent-specs";

export interface AgentJsonPatchEnvelope {
  section: UnitSpecSection;
  patch: unknown;
}

const unitSpecSections: readonly UnitSpecSection[] = [
  "knowledge",
  "pedagogy",
  "narrative",
  "implementation",
  "assessment",
  "quality"
];

export function parseAgentJsonPatch(role: CurriculumAgentRole, content: string): Partial<Record<UnitSpecSection, unknown>> {
  const parsed = parseJsonObject(extractJsonPayload(content));
  const envelope = parsePatchEnvelope(parsed);
  const patch = {
    [envelope.section]: envelope.patch
  } as Partial<Record<UnitSpecSection, unknown>>;
  const ownership = validateAgentPatchOwnership(role, patch);

  if (!ownership.passed) {
    throw new Error(`Agent output attempted to write unowned sections: ${ownership.violations.join(", ")}`);
  }

  return patch;
}

export function expectedPatchEnvelopeInstruction(role: CurriculumAgentRole): string {
  const section = agentSpecFor(role).owns_section;
  return `Return JSON only: {"section":"${section}","patch":{...${section} section...}}`;
}

function extractJsonPayload(content: string): string {
  const trimmed = content.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(trimmed);
  return fenced?.[1]?.trim() ?? trimmed;
}

function parseJsonObject(payload: string): unknown {
  try {
    return JSON.parse(payload);
  } catch {
    throw new Error("Agent output is not valid JSON.");
  }
}

function parsePatchEnvelope(value: unknown): AgentJsonPatchEnvelope {
  if (!isRecord(value)) {
    throw new Error("Agent output must be a JSON object.");
  }

  const section = value["section"];
  if (typeof section !== "string" || !unitSpecSections.includes(section as UnitSpecSection)) {
    throw new Error("Agent output section is not a known unit spec section.");
  }

  if (!("patch" in value) || !isRecord(value["patch"])) {
    throw new Error("Agent output patch must be a JSON object.");
  }

  return {
    section: section as UnitSpecSection,
    patch: value["patch"]
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

