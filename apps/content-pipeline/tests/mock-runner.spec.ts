import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { loadUnitSpecFromFile, runMockUnitWorkflow } from "../src";

const sampleUnitPath = resolve(process.cwd(), "../../content/units/math-g8-s1-linear-function-concept/unit.yaml");

describe("mock unit workflow runner", () => {
  it("runs all curriculum agents with deterministic owned-section patches", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const result = runMockUnitWorkflow(unit, { created_at: "2026-04-22T08:00:00.000Z" });

    expect(result.unit.metadata.unit_id).toBe("math_g8_linear_function_intro");
    expect(result.logs.map((entry) => entry.role)).toEqual([
      "subject_expert",
      "pedagogy_designer",
      "narrative_designer",
      "engineering_agent",
      "assessment_designer",
      "qa_agent"
    ]);
    expect(result.state.runs.every((run) => run.status === "passed")).toBe(true);
    expect(result.logs.every((entry) => entry.created_at === "2026-04-22T08:00:00.000Z")).toBe(true);
  });

  it("rejects custom producers that attempt cross-section writes", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);

    expect(() =>
      runMockUnitWorkflow(unit, {
        producer: () => ({
          narrative: unit.narrative
        })
      })
    ).toThrow(/unowned sections/);
  });

  it("can emit admin-only workflow stage runtime events for each mock agent stage", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const result = runMockUnitWorkflow(unit, {
      created_at: "2026-04-22T08:00:00.000Z",
      emit_runtime_events: true,
      runtime_id_generator: deterministicIdGenerator()
    });

    expect(result.runtime_events.map((event) => event.event_type)).toEqual([
      "stage_start",
      "stage_end",
      "stage_start",
      "stage_end",
      "stage_start",
      "stage_end",
      "stage_start",
      "stage_end",
      "stage_start",
      "stage_end",
      "stage_start",
      "stage_end"
    ]);
    expect(result.runtime_events.map((event) => event.sequence)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(result.runtime_events.map((event) => event.stage_id)).toEqual([
      "subject_expert",
      "subject_expert",
      "pedagogy_designer",
      "pedagogy_designer",
      "narrative_designer",
      "narrative_designer",
      "engineering_agent",
      "engineering_agent",
      "assessment_designer",
      "assessment_designer",
      "qa_agent",
      "qa_agent"
    ]);
    expect(result.runtime_student_projection).toHaveLength(0);
    expect(result.runtime_teacher_projection).toHaveLength(0);
    expect(result.runtime_guardian_projection).toHaveLength(0);
    expect(result.runtime_admin_audit_projection).toHaveLength(12);
    expect(result.runtime_admin_audit_projection[0]?.internal_metadata).toMatchObject({
      provider_id: "local_mock"
    });
  });

  it("keeps workflow runtime event payloads structured and free of raw provider output", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const result = runMockUnitWorkflow(unit, {
      emit_runtime_events: true,
      runtime_id_generator: deterministicIdGenerator()
    });
    const serializedEvents = JSON.stringify(result.runtime_events);

    expect(serializedEvents).not.toContain("raw_prompt");
    expect(serializedEvents).not.toContain("raw_output");
    expect(serializedEvents).not.toContain("student_message");
    expect(serializedEvents).not.toContain("mock response");
  });
});

function deterministicIdGenerator(): () => string {
  let next = 0;

  return () => {
    next += 1;
    return `00000000-0000-4000-8000-${next.toString().padStart(12, "0")}`;
  };
}
