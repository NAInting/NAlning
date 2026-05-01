import type {
  GatewayDeployment,
  GatewayPrivacyLevel,
  GatewayProvider,
  ProviderAdapter,
  ProviderCompletionInput,
  ProviderCompletionOutput
} from "../types";

export interface MockAdapterOptions {
  provider: GatewayProvider;
  model: string;
  deployment: GatewayDeployment;
  allowed_privacy_levels?: readonly GatewayPrivacyLevel[];
  fail?: boolean;
}

export function createMockAdapter(options: MockAdapterOptions): ProviderAdapter {
  return {
    provider: options.provider,
    model: options.model,
    deployment: options.deployment,
    allowed_privacy_levels: options.allowed_privacy_levels ?? defaultAllowedPrivacyLevels(options.deployment),
    async complete(input: ProviderCompletionInput): Promise<ProviderCompletionOutput> {
      if (options.fail === true) {
        throw new Error(`Mock adapter failed: ${options.provider}/${options.model}`);
      }

      const inputTokens = estimateTokens([
        input.prompt.content,
        ...input.messages.map((message) => message.content)
      ]);
      const content = `[${options.provider}/${options.model}] ${input.purpose} mock response`;
      const outputTokens = estimateTokens([content]);

      return {
        content,
        usage: {
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          total_tokens: inputTokens + outputTokens
        }
      };
    }
  };
}

export function createDefaultMockAdapters(): readonly ProviderAdapter[] {
  return [
    createMockAdapter({
      provider: "claude_mock",
      model: "claude-deep-mock",
      deployment: "controlled_cloud"
    }),
    createMockAdapter({
      provider: "claude_mock",
      model: "claude-fast-mock",
      deployment: "controlled_cloud"
    }),
    createMockAdapter({
      provider: "qianfan_mock",
      model: "qianfan-balanced-mock",
      deployment: "controlled_cloud"
    }),
    createMockAdapter({
      provider: "qianfan_mock",
      model: "qianfan-fast-mock",
      deployment: "controlled_cloud"
    }),
    createMockAdapter({
      provider: "campus_local_mock",
      model: "campus-local-safety-v1",
      deployment: "campus_local"
    })
  ];
}

function defaultAllowedPrivacyLevels(deployment: GatewayDeployment): readonly GatewayPrivacyLevel[] {
  return deployment === "campus_local" ? ["public", "private", "campus_local_only"] : ["public", "private"];
}

function estimateTokens(parts: readonly string[]): number {
  const characters = parts.join("\n").length;
  return Math.max(1, Math.ceil(characters / 4));
}
