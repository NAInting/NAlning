import { describe, expect, it } from "vitest";

import { expectedPatchEnvelopeInstruction, parseAgentJsonPatch } from "../src";

describe("agent output parser", () => {
  it("parses a plain JSON patch envelope for the owned section", () => {
    const patch = parseAgentJsonPatch(
      "qa_agent",
      JSON.stringify({
        section: "quality",
        patch: {
          checklist_pass: false,
          issues: [],
          reviewer_notes: []
        }
      })
    );

    expect(patch).toEqual({
      quality: {
        checklist_pass: false,
        issues: [],
        reviewer_notes: []
      }
    });
  });

  it("parses fenced JSON output", () => {
    const patch = parseAgentJsonPatch(
      "engineering_agent",
      [
        "```json",
        JSON.stringify({
          section: "implementation",
          patch: {
            components: ["StudentAgentChat"],
            prompts: [],
            data_hooks: []
          }
        }),
        "```"
      ].join("\n")
    );

    expect(Object.keys(patch)).toEqual(["implementation"]);
  });

  it("rejects unowned sections without echoing raw model output", () => {
    const content = JSON.stringify({
      section: "narrative",
      patch: {
        secret_model_text: "do not echo me"
      }
    });

    expect(() => parseAgentJsonPatch("subject_expert", content)).toThrow(/unowned sections: narrative/);
    expect(() => parseAgentJsonPatch("subject_expert", content)).not.toThrow(/do not echo me/);
  });

  it("rejects invalid JSON without echoing raw content", () => {
    const content = "Here is my patch: not-json secret narrative text";

    expect(() => parseAgentJsonPatch("qa_agent", content)).toThrow("Agent output is not valid JSON.");
    expect(() => parseAgentJsonPatch("qa_agent", content)).not.toThrow(/secret narrative text/);
  });

  it("generates role-specific JSON-only instructions", () => {
    expect(expectedPatchEnvelopeInstruction("pedagogy_designer")).toContain('"section":"pedagogy"');
  });
});

