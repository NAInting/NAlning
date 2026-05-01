import { resolve } from "node:path";

import type { GatewayCompleteResponse } from "@edu-ai/llm-gateway";
import { describe, expect, it } from "vitest";

import {
  buildAgentGatewayRequest,
  buildAgentInvocationFailure,
  buildAgentInvocationSuccess,
  loadUnitSpecFromFile,
  summarizeInvocationForLog
} from "../src";

const sampleUnitPath = resolve(process.cwd(), "../../content/units/math-g8-s1-linear-function-concept/unit.yaml");

const gatewayResponse: GatewayCompleteResponse = {
  request_id: "req_content_001",
  content: "RAW MODEL CONTENT SHOULD NOT BE LOGGED",
  provider: "claude_mock",
  model: "claude-deep-mock",
  route_selected: "controlled_cloud",
  prompt_id: "prompt_subject_expert_unit_knowledge_v0_1",
  prompt_version: "1.0.0",
  prompt_source_trace: ["docs/UNIT_SPEC.md"],
  usage: {
    input_tokens: 120,
    output_tokens: 80,
    total_tokens: 200
  },
  cost: {
    estimated_cost_cny: 0.42,
    input_cost_cny: 0.12,
    output_cost_cny: 0.3
  },
  cache_hit: false,
  privacy: {
    route_selected: "controlled_cloud",
    sensitive_keyword_hit: false,
    reason: "standard_policy"
  }
};

describe("agent invocation contract", () => {
  it("builds a content-generation gateway request without student identifiers or raw unit sections", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const request = buildAgentGatewayRequest(unit, "subject_expert", 2);
    const serializedMessages = JSON.stringify(request.messages);

    expect(request).toMatchObject({
      purpose: "content_generation",
      prompt_id: "prompt_subject_expert_unit_knowledge_v0_1",
      request_id: "math_g8_linear_function_intro_subject_expert_attempt_2",
      privacy_level: "public",
      model_preference: "deep",
      user_context: {
        role: "system",
        subject: "math"
      }
    });
    expect(serializedMessages).toContain("Write only the knowledge section");
    expect(serializedMessages).toContain("node_id");
    expect(serializedMessages).toContain("from_node_id");
    expect(serializedMessages).toContain("Every edge from_node_id and to_node_id must reference");
    expect(serializedMessages).toContain("UnitSpecId format");
    expect(serializedMessages).toContain("lf_slope_meaning");
    expect(serializedMessages).toContain("Grade: g8");
    expect(serializedMessages).toContain("G8-FUNC-DRAFT");
    expect(serializedMessages).toContain("Existing knowledge source_trace to preserve or refine");
    expect(serializedMessages).toContain("math-standard-2022-function");
    expect(serializedMessages).toContain("curriculum_standard");
    expect(serializedMessages).toContain("Hard rules");
    expect(serializedMessages).toContain("China K-12 private-school pilot");
    expect(serializedMessages).toContain("Simplified Chinese");
    expect(serializedMessages).toContain("do not invent or substitute US Common Core, CCSS");
    expect(serializedMessages).toContain("preserve Chinese curriculum/textbook/teacher-note provenance");
    expect(serializedMessages).toContain("Provided standard alignment");
    expect(serializedMessages).not.toContain("student_id");
    expect(serializedMessages).not.toContain("校车路线费用");
  });

  it("creates success results with gateway cost trace but no raw response in log summary", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const result = buildAgentInvocationSuccess(unit, "subject_expert", { knowledge: unit.knowledge }, gatewayResponse);
    const summary = summarizeInvocationForLog(result);

    expect(result.patch_sections).toEqual(["knowledge"]);
    expect(summary.gateway).toMatchObject({
      request_id: "req_content_001",
      provider: "claude_mock",
      prompt_id: "prompt_subject_expert_unit_knowledge_v0_1",
      estimated_cost_cny: 0.42
    });
    expect(JSON.stringify(summary)).not.toContain(gatewayResponse.content);
  });

  it("rejects successful invocation results with unowned patch sections", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);

    expect(() => buildAgentInvocationSuccess(unit, "subject_expert", { narrative: unit.narrative }, gatewayResponse)).toThrow(
      /unowned sections/
    );
  });

  it("summarizes failures without logging full error text", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const result = buildAgentInvocationFailure(unit, "qa_agent", "schema_validation", "full parser stack trace", true);
    const summary = summarizeInvocationForLog(result);

    expect(result.failure?.message).toBe("full parser stack trace");
    expect(summary).toEqual({
      unit_id: "math_g8_linear_function_intro",
      role: "qa_agent",
      status: "failed_retryable",
      patch_sections: [],
      failure: {
        category: "schema_validation",
        retryable: true
      }
    });
  });
});
