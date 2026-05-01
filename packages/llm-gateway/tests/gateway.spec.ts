import { describe, expect, it } from "vitest";

import { createLlmGateway, createMockAdapter, createOpenAiCompatibleAdapter } from "../src";
import type { GatewayCompleteRequest } from "../src";

const baseRequest: GatewayCompleteRequest = {
  purpose: "student_dialogue",
  messages: [{ role: "user", content: "请用提示引导我理解一次函数。" }],
  user_context: { role: "student", student_id: "stu_tok_demo", subject: "math" },
  privacy_level: "private",
  model_preference: "fast"
};

describe("llm gateway", () => {
  it("routes fast student dialogue to qianfan mock by default", async () => {
    const gateway = createLlmGateway();
    const response = await gateway.complete(baseRequest);

    expect(response.provider).toBe("qianfan_mock");
    expect(response.model).toBe("qianfan-fast-mock");
    expect(response.route_selected).toBe("controlled_cloud");
    expect(response.prompt_id).toBe("student_dialogue_default");
    expect(response.prompt_version).toBe("1.0.0");
    expect(response.prompt_source_trace).toContain("docs/AGENT_PROTOCOL.md");
    expect(response.cache_hit).toBe(false);
  });

  it("routes deep content generation to claude mock", async () => {
    const gateway = createLlmGateway();
    const response = await gateway.complete({
      ...baseRequest,
      purpose: "content_generation",
      messages: [{ role: "user", content: "生成一次函数导入单元。" }],
      model_preference: "deep"
    });

    expect(response.provider).toBe("claude_mock");
    expect(response.model).toBe("claude-deep-mock");
  });

  it("forces campus-local routing when privacy level is campus_local_only", async () => {
    const gateway = createLlmGateway();
    const response = await gateway.complete({
      ...baseRequest,
      privacy_level: "campus_local_only",
      model_preference: "deep"
    });

    expect(response.provider).toBe("campus_local_mock");
    expect(response.route_selected).toBe("campus_local");
    expect(response.privacy.reason).toBe("explicit_campus_local_only");
  });

  it("forces campus-local routing when sensitive keywords are detected", async () => {
    const gateway = createLlmGateway();
    const response = await gateway.complete({
      ...baseRequest,
      messages: [{ role: "user", content: "我最近很崩溃，不想活了。" }],
      model_preference: "deep"
    });

    expect(response.provider).toBe("campus_local_mock");
    expect(response.route_selected).toBe("campus_local");
    expect(response.privacy.sensitive_keyword_hit).toBe(true);
  });

  it("falls back to the configured cloud model when the primary cloud model fails", async () => {
    const gateway = createLlmGateway({
      adapters: [
        createMockAdapter({
          provider: "qianfan_mock",
          model: "qianfan-fast-mock",
          deployment: "controlled_cloud",
          fail: true
        }),
        createMockAdapter({
          provider: "claude_mock",
          model: "claude-fast-mock",
          deployment: "controlled_cloud"
        })
      ]
    });

    const response = await gateway.complete(baseRequest);

    expect(response.provider).toBe("claude_mock");
    expect(response.model).toBe("claude-fast-mock");
  });

  it("does not fallback to cloud when campus-local route fails", async () => {
    const gateway = createLlmGateway({
      adapters: [
        createMockAdapter({
          provider: "campus_local_mock",
          model: "campus-local-safety-v1",
          deployment: "campus_local",
          fail: true
        }),
        createMockAdapter({
          provider: "claude_mock",
          model: "claude-deep-mock",
          deployment: "controlled_cloud"
        })
      ]
    });

    await expect(
      gateway.complete({
        ...baseRequest,
        privacy_level: "campus_local_only",
        model_preference: "deep"
      })
    ).rejects.toThrow("Mock adapter failed");
  });

  it("rejects an adapter whose deployment does not match the selected route", async () => {
    const gateway = createLlmGateway({
      adapters: [
        createMockAdapter({
          provider: "campus_local_mock",
          model: "campus-local-safety-v1",
          deployment: "controlled_cloud"
        })
      ]
    });

    await expect(
      gateway.complete({
        ...baseRequest,
        privacy_level: "campus_local_only"
      })
    ).rejects.toThrow("deployment mismatch");
  });

  it("uses cache for identical requests without adding token cost twice", async () => {
    const gateway = createLlmGateway();

    const first = await gateway.complete(baseRequest);
    const second = await gateway.complete(baseRequest);
    const summary = gateway.summarizeCostByPurpose().find((item) => item.purpose === "student_dialogue");

    expect(first.cache_hit).toBe(false);
    expect(second.cache_hit).toBe(true);
    expect(summary?.calls).toBe(2);
    expect(summary?.input_tokens).toBe(first.usage.input_tokens);
    expect(summary?.estimated_cost_cny).toBe(first.cost.estimated_cost_cny);
  });

  it("does not cache campus-local responses", async () => {
    const gateway = createLlmGateway();

    const request: GatewayCompleteRequest = {
      ...baseRequest,
      privacy_level: "campus_local_only"
    };
    const first = await gateway.complete(request);
    const second = await gateway.complete(request);
    const summary = gateway.summarizeCostByPurpose().find((item) => item.purpose === "student_dialogue");

    expect(first.cache_hit).toBe(false);
    expect(second.cache_hit).toBe(false);
    expect(summary?.calls).toBe(2);
    expect(summary?.input_tokens).toBe(first.usage.input_tokens + second.usage.input_tokens);
  });

  it("records cost metadata without raw message content", async () => {
    const gateway = createLlmGateway();
    await gateway.complete(baseRequest);

    const entry = gateway.listCostEntries()[0];

    expect(entry).toMatchObject({
      purpose: "student_dialogue",
      provider: "qianfan_mock",
      route_selected: "controlled_cloud",
      prompt_id: "student_dialogue_default",
      prompt_version: "1.0.0"
    });
    expect(entry?.prompt_source_trace).toContain("docs/AGENT_PROTOCOL.md");
    expect(JSON.stringify(entry)).not.toContain(baseRequest.messages[0]!.content);
  });

  it("can route content generation to an OpenAI-compatible adapter through an explicit selector", async () => {
    const calls: Array<{ input: string; body: string; authorization: string | undefined }> = [];
    const gateway = createLlmGateway({
      adapters: [
        createOpenAiCompatibleAdapter({
          api_key: "test-key",
          model: "content-review-model",
          base_url: "https://llm.example/v1",
          fetch_impl: async (input, init) => {
            calls.push({
              input,
              body: init.body,
              authorization: init.headers.authorization
            });

            return {
              ok: true,
              status: 200,
              statusText: "OK",
              async json() {
                return {
                  choices: [
                    {
                      message: {
                        content: "{\"section\":\"knowledge\",\"patch\":{\"nodes\":[]}}"
                      }
                    }
                  ],
                  usage: {
                    prompt_tokens: 12,
                    completion_tokens: 6,
                    total_tokens: 18
                  }
                };
              }
            };
          }
        })
      ],
      routeSelector: () => ({
        provider: "openai_compatible",
        model: "content-review-model",
        deployment: "controlled_cloud",
        reason: "test_explicit_selector"
      })
    });

    const response = await gateway.complete({
      ...baseRequest,
      purpose: "content_generation",
      messages: [{ role: "user", content: "Return structured JSON." }],
      privacy_level: "public",
      model_preference: "deep"
    });

    expect(response.provider).toBe("openai_compatible");
    expect(response.model).toBe("content-review-model");
    expect(response.content).toContain("\"section\":\"knowledge\"");
    expect(response.usage.total_tokens).toBe(18);
    expect(calls).toHaveLength(1);
    expect(calls[0]?.input).toBe("https://llm.example/v1/chat/completions");
    expect(calls[0]?.authorization).toBe("Bearer test-key");
    expect(JSON.parse(calls[0]?.body ?? "{}")).toMatchObject({
      model: "content-review-model",
      response_format: {
        type: "json_object"
      }
    });
  });

  it("fails closed when an adapter is not allowed to handle the request privacy level", async () => {
    const gateway = createLlmGateway({
      adapters: [
        createOpenAiCompatibleAdapter({
          api_key: "test-key",
          model: "public-only-model",
          base_url: "https://llm.example/v1",
          fetch_impl: async () => {
            throw new Error("fetch should not be called for disallowed privacy");
          }
        })
      ],
      routeSelector: () => ({
        provider: "openai_compatible",
        model: "public-only-model",
        deployment: "controlled_cloud",
        reason: "test_explicit_selector"
      })
    });

    await expect(
      gateway.complete({
        ...baseRequest,
        privacy_level: "private",
        purpose: "student_dialogue"
      })
    ).rejects.toThrow("privacy mismatch");
  });

  it("times out slow OpenAI-compatible provider requests", async () => {
    const adapter = createOpenAiCompatibleAdapter({
      api_key: "test-key",
      model: "slow-model",
      base_url: "https://llm.example/v1",
      timeout_ms: 5,
      fetch_impl: async (_input, init) =>
        await new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => reject(new Error("aborted")));
        })
    });

    await expect(
      adapter.complete({
        purpose: "content_generation",
        request_id: "req_timeout",
        prompt: {
          prompt_id: "prompt_timeout",
          prompt_version: "0.1.0",
          purpose: "content_generation",
          content: "Return JSON.",
          source_trace: ["tests/gateway.spec.ts"],
          active: true
        },
        messages: [{ role: "user", content: "Please respond." }]
      })
    ).rejects.toThrow("timed out after 5ms");
  });
});
