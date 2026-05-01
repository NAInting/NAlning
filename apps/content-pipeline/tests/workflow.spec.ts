import { describe, expect, it } from "vitest";

import { createUnitWorkflowState, nextRunnableAgent, readableAgentStep, recordAgentPatch } from "../src";

describe("unit workflow state machine", () => {
  it("starts with subject expert and follows the curriculum agent order", () => {
    let state = createUnitWorkflowState("math_g8_linear_function_intro");

    expect(nextRunnableAgent(state)).toBe("subject_expert");
    state = recordAgentPatch(state, "subject_expert", { knowledge: {} }, { passed: true });
    expect(nextRunnableAgent(state)).toBe("pedagogy_designer");
    state = recordAgentPatch(state, "pedagogy_designer", { pedagogy: {} }, { passed: true });
    expect(nextRunnableAgent(state)).toBe("narrative_designer");
    state = recordAgentPatch(state, "narrative_designer", { narrative: {} }, { passed: true });
    expect(nextRunnableAgent(state)).toBe("engineering_agent");
    state = recordAgentPatch(state, "engineering_agent", { implementation: {} }, { passed: true });
    expect(nextRunnableAgent(state)).toBe("assessment_designer");
    state = recordAgentPatch(state, "assessment_designer", { assessment: {} }, { passed: true });
    expect(nextRunnableAgent(state)).toBe("qa_agent");
  });

  it("rejects unowned patch sections before recording a result", () => {
    const state = createUnitWorkflowState("math_g8_linear_function_intro");

    expect(() => recordAgentPatch(state, "subject_expert", { narrative: {} }, { passed: true })).toThrow(
      /unowned sections/
    );
  });

  it("moves an agent to human review after max failed attempts", () => {
    let state = createUnitWorkflowState("math_g8_linear_function_intro", 2);

    state = recordAgentPatch(state, "subject_expert", { knowledge: {} }, { passed: false, error: "missing standards" });
    expect(state.runs[0]?.status).toBe("failed");
    expect(nextRunnableAgent(state)).toBe("subject_expert");

    state = recordAgentPatch(state, "subject_expert", { knowledge: {} }, { passed: false, error: "still missing standards" });
    expect(state.runs[0]?.status).toBe("requires_human_review");
    expect(nextRunnableAgent(state)).toBe("pedagogy_designer");
  });

  it("provides readable step labels for logs", () => {
    expect(readableAgentStep("engineering_agent")).toBe("engineering_agent -> implementation");
    expect(readableAgentStep("assessment_designer")).toBe("assessment_designer -> assessment");
  });
});
