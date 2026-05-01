import { resolve } from "node:path";

import { createLlmGateway } from "@edu-ai/llm-gateway";
import type { GatewayCompleteRequest } from "@edu-ai/llm-gateway";
import { describe, expect, it } from "vitest";

import {
  createContentPipelinePromptRegistry,
  jsonPatchFromGatewayResponseParser,
  loadUnitSpecFromFile,
  runLlmMockUnitWorkflow,
  type AgentOutputParserInput
} from "../src";

const sampleUnitPath = resolve(process.cwd(), "../../content/units/math-g8-s1-linear-function-concept/unit.yaml");

describe("LLM mock unit workflow runtime", () => {
  it("runs all curriculum agents through the LLM Gateway mock adapters", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const gateway = createLlmGateway({
      promptRegistry: createContentPipelinePromptRegistry()
    });
    const result = await runLlmMockUnitWorkflow(unit, { gateway });

    expect(result.invocations).toHaveLength(6);
    expect(result.logs.map((entry) => entry.role)).toEqual([
      "subject_expert",
      "pedagogy_designer",
      "narrative_designer",
      "engineering_agent",
      "assessment_designer",
      "qa_agent"
    ]);
    expect(result.logs.every((entry) => entry.status === "succeeded")).toBe(true);
    expect(result.logs.every((entry) => entry.gateway?.prompt_id.startsWith("prompt_"))).toBe(true);
    expect(gateway.summarizeCostByPurpose()).toEqual([
      expect.objectContaining({
        purpose: "content_generation",
        calls: 6
      })
    ]);
  });

  it("does not include raw mock model content in invocation logs", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const result = await runLlmMockUnitWorkflow(unit);

    expect(JSON.stringify(result.logs)).not.toContain("mock response");
    expect(JSON.stringify(result.logs)).not.toContain("校车路线费用");
  });

  it("stops the workflow and records a sanitized failure when parser output is invalid", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const result = await runLlmMockUnitWorkflow(unit, {
      parser: ({ unit: currentUnit }: AgentOutputParserInput) => ({
        narrative: currentUnit.narrative
      })
    });

    expect(result.invocations).toHaveLength(1);
    expect(result.logs[0]).toEqual({
      unit_id: "math_g8_linear_function_intro",
      role: "subject_expert",
      status: "failed_retryable",
      patch_sections: [],
      failure: {
        category: "ownership_violation",
        retryable: true
      }
    });
    expect(result.state.runs[0]?.status).toBe("failed");
  });

  it("classifies provider timeouts as model unavailable", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const result = await runLlmMockUnitWorkflow(unit, {
      gateway: {
        async complete() {
          throw new Error("OpenAI-compatible provider request timed out after 90000ms");
        }
      }
    });

    expect(result.invocations).toHaveLength(1);
    expect(result.logs[0]).toMatchObject({
      role: "subject_expert",
      status: "failed_retryable",
      failure: {
        category: "model_unavailable",
        retryable: true
      }
    });
  });

  it("can parse structured JSON patches from gateway response content", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const sectionByPromptId = {
      prompt_subject_expert_unit_knowledge_v0_1: "knowledge",
      prompt_pedagogy_designer_unit_path_v0_1: "pedagogy",
      prompt_narrative_designer_unit_story_v0_1: "narrative",
      prompt_engineering_agent_unit_assets_v0_1: "implementation",
      prompt_assessment_designer_unit_items_v0_1: "assessment",
      prompt_qa_agent_unit_review_v0_1: "quality"
    } as const;
    const gateway = {
      async complete(request: GatewayCompleteRequest) {
        const section = sectionByPromptId[request.prompt_id as keyof typeof sectionByPromptId];
        return {
          request_id: request.request_id ?? "req_json_parser",
          content: JSON.stringify({
            section,
            patch: unit[section]
          }),
          provider: "claude_mock" as const,
          model: "claude-deep-mock",
          route_selected: "controlled_cloud" as const,
          prompt_id: request.prompt_id ?? "unknown_prompt",
          prompt_version: "0.1.0",
          prompt_source_trace: ["tests/agent-runtime.spec.ts"],
          usage: {
            input_tokens: 10,
            output_tokens: 5,
            total_tokens: 15
          },
          cost: {
            estimated_cost_cny: 0.01,
            input_cost_cny: 0.004,
            output_cost_cny: 0.006
          },
          cache_hit: false,
          privacy: {
            route_selected: "controlled_cloud" as const,
            sensitive_keyword_hit: false,
            reason: "standard_policy" as const
          }
        };
      }
    };

    const result = await runLlmMockUnitWorkflow(unit, {
      gateway,
      parser: jsonPatchFromGatewayResponseParser
    });

    expect(result.logs).toHaveLength(6);
    expect(result.logs.every((entry) => entry.status === "succeeded")).toBe(true);
    expect(result.unit.metadata.unit_id).toBe(unit.metadata.unit_id);
  });

  it("can emit admin-only runtime events for LLM mock workflow stages", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const result = await runLlmMockUnitWorkflow(unit, {
      emit_runtime_events: true,
      created_at: "2026-04-25T18:30:00.000Z",
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
    expect(result.runtime_student_projection).toHaveLength(0);
    expect(result.runtime_teacher_projection).toHaveLength(0);
    expect(result.runtime_guardian_projection).toHaveLength(0);
    expect(result.runtime_admin_audit_projection).toHaveLength(12);
    expect(result.runtime_admin_audit_projection[1]?.internal_metadata).toMatchObject({
      provider_id: "claude_mock",
      model_id: "claude-deep-mock",
      input_tokens: expect.any(Number),
      output_tokens: expect.any(Number)
    });
  });

  it("emits a sanitized runtime error event when the LLM mock workflow fails", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const result = await runLlmMockUnitWorkflow(unit, {
      emit_runtime_events: true,
      runtime_id_generator: deterministicIdGenerator(),
      gateway: {
        async complete() {
          throw new Error("OpenAI-compatible provider request timed out after 90000ms");
        }
      }
    });

    expect(result.runtime_events.map((event) => event.event_type)).toEqual(["stage_start", "error"]);
    expect(result.runtime_events[1]?.payload.error).toEqual({
      error_code: "model_unavailable",
      safe_message: "subject_expert failed attempt 1; see sanitized invocation log for triage category.",
      retryable: true
    });

    const serializedEvents = JSON.stringify(result.runtime_events);
    expect(serializedEvents).not.toContain("timed out after 90000ms");
    expect(serializedEvents).not.toContain("raw_output");
    expect(serializedEvents).not.toContain("student_message");
  });
});

function deterministicIdGenerator(): () => string {
  let next = 0;

  return () => {
    next += 1;
    return `00000000-0000-4000-8000-${next.toString().padStart(12, "0")}`;
  };
}
