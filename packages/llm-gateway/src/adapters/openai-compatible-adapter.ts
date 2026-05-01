import type { GatewayPrivacyLevel, ProviderAdapter, ProviderCompletionInput, ProviderCompletionOutput } from "../types";

export interface OpenAiCompatibleAdapterOptions {
  api_key: string;
  model: string;
  base_url?: string;
  organization?: string;
  deployment?: "controlled_cloud";
  allowed_privacy_levels?: readonly GatewayPrivacyLevel[];
  temperature?: number;
  timeout_ms?: number;
  response_format_json?: boolean;
  fetch_impl?: FetchLike;
}

interface FetchLikeResponse {
  ok: boolean;
  status: number;
  statusText: string;
  json(): Promise<unknown>;
}

type FetchLike = (
  input: string,
  init: {
    method: "POST";
    headers: Record<string, string>;
    body: string;
    signal?: AbortSignal;
  }
) => Promise<FetchLikeResponse>;

interface OpenAiCompatibleResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export function createOpenAiCompatibleAdapter(options: OpenAiCompatibleAdapterOptions): ProviderAdapter {
  const fetchImpl = options.fetch_impl ?? globalThis.fetch;
  if (!fetchImpl) {
    throw new Error("OpenAI-compatible adapter requires a fetch implementation");
  }

  return {
    provider: "openai_compatible",
    model: options.model,
    deployment: options.deployment ?? "controlled_cloud",
    allowed_privacy_levels: options.allowed_privacy_levels ?? ["public"],
    async complete(input: ProviderCompletionInput): Promise<ProviderCompletionOutput> {
      const endpoint = `${(options.base_url ?? "https://api.openai.com/v1").replace(/\/+$/, "")}/chat/completions`;
      const headers: Record<string, string> = {
        "content-type": "application/json",
        authorization: `Bearer ${options.api_key}`
      };

      if (options.organization) {
        headers["openai-organization"] = options.organization;
      }

      const payload = {
        model: options.model,
        temperature: options.temperature ?? 0.2,
        messages: [
          {
            role: "system",
            content: input.prompt.content
          },
          ...input.messages
        ],
        ...(options.response_format_json === false
          ? {}
          : {
              response_format: {
                type: "json_object"
              }
            })
      };
      const timeoutMs = options.timeout_ms;
      const controller = timeoutMs ? new AbortController() : undefined;
      let timeout: ReturnType<typeof setTimeout> | undefined;

      let response: FetchLikeResponse;
      try {
        const fetchPromise = fetchImpl(endpoint, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
          ...(controller ? { signal: controller.signal } : {})
        });

        response = timeoutMs
          ? await Promise.race([
              fetchPromise,
              new Promise<never>((_resolve, reject) => {
                timeout = setTimeout(() => {
                  controller?.abort();
                  reject(new Error(`OpenAI-compatible provider request timed out after ${timeoutMs}ms`));
                }, timeoutMs);
              })
            ])
          : await fetchPromise;
      } catch (error) {
        if (controller?.signal.aborted || (error instanceof Error && error.message.includes("timed out after"))) {
          throw new Error(`OpenAI-compatible provider request timed out after ${timeoutMs}ms`);
        }

        throw error;
      } finally {
        if (timeout) {
          clearTimeout(timeout);
        }
      }

      if (!response.ok) {
        throw new Error(`OpenAI-compatible provider failed with HTTP ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as OpenAiCompatibleResponse;
      const content = data.choices?.[0]?.message?.content?.trim();
      if (!content) {
        throw new Error("OpenAI-compatible provider returned empty content");
      }

      const fallbackInputTokens = estimateTokens([
        input.prompt.content,
        ...input.messages.map((message) => message.content)
      ]);
      const fallbackOutputTokens = estimateTokens([content]);
      const inputTokens = data.usage?.prompt_tokens ?? fallbackInputTokens;
      const outputTokens = data.usage?.completion_tokens ?? fallbackOutputTokens;

      return {
        content,
        usage: {
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          total_tokens: data.usage?.total_tokens ?? inputTokens + outputTokens
        }
      };
    }
  };
}

function estimateTokens(parts: readonly string[]): number {
  const characters = parts.join("\n").length;
  return Math.max(1, Math.ceil(characters / 4));
}
