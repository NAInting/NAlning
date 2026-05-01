import { randomUUID } from "node:crypto";

import { buildCacheKey, InMemoryCompletionCache } from "./cache";
import { estimateCost, InMemoryCostLedger } from "./cost-ledger";
import { createDefaultMockAdapters } from "./adapters/mock-adapter";
import { decidePrivacyRoute } from "./privacy";
import { PromptRegistry } from "./prompt-registry";
import { selectModelRoute } from "./router";
import { GatewayCompleteRequestSchema } from "./schemas";
import type {
  CostEntry,
  CostSummary,
  GatewayCompleteRequest,
  GatewayCompleteResponse,
  GatewayPrivacyLevel,
  GatewayProvider,
  ModelRoute,
  ProviderAdapter,
  ProviderCompletionOutput
} from "./types";

export interface LlmGatewayOptions {
  adapters?: readonly ProviderAdapter[];
  cache?: InMemoryCompletionCache;
  costLedger?: InMemoryCostLedger;
  promptRegistry?: PromptRegistry;
  routeSelector?: ModelRouteSelector;
  now?: () => Date;
}

export type ModelRouteSelector = (request: GatewayCompleteRequest, privacy: ReturnType<typeof decidePrivacyRoute>) => ModelRoute;

export class LlmGateway {
  private readonly adapters = new Map<string, ProviderAdapter>();
  private readonly cache: InMemoryCompletionCache;
  private readonly costLedger: InMemoryCostLedger;
  private readonly promptRegistry: PromptRegistry;
  private readonly routeSelector: ModelRouteSelector;
  private readonly now: () => Date;

  constructor(options: LlmGatewayOptions = {}) {
    const adapters = options.adapters ?? createDefaultMockAdapters();
    for (const adapter of adapters) {
      this.adapters.set(adapterKey(adapter.provider, adapter.model), adapter);
    }

    this.cache = options.cache ?? new InMemoryCompletionCache();
    this.costLedger = options.costLedger ?? new InMemoryCostLedger();
    this.promptRegistry = options.promptRegistry ?? new PromptRegistry();
    this.routeSelector = options.routeSelector ?? selectModelRoute;
    this.now = options.now ?? (() => new Date());
  }

  async complete(input: GatewayCompleteRequest): Promise<GatewayCompleteResponse> {
    const parsed = GatewayCompleteRequestSchema.parse(input) as GatewayCompleteRequest;
    const requestId = parsed.request_id ?? randomUUID();
    const prompt = this.promptRegistry.getActivePrompt(parsed.purpose, parsed.prompt_id);
    const privacy = decidePrivacyRoute(parsed);
    const route = this.routeSelector(parsed, privacy);
    const cacheEnabled = parsed.cache !== false && privacy.route_selected !== "campus_local";
    const cacheKey = buildCacheKey(parsed, prompt, route);

    if (cacheEnabled) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        const response: GatewayCompleteResponse = {
          ...cached,
          request_id: requestId,
          cache_hit: true
        };
        this.recordCost(parsed.purpose, response);
        return response;
      }
    }

    const completion = await this.completeWithRoute(route, parsed.privacy_level, {
      messages: parsed.messages,
      prompt,
      purpose: parsed.purpose,
      request_id: requestId
    });
    const cost = estimateCost(completion.provider, completion.output.usage);
    const response: GatewayCompleteResponse = {
      request_id: requestId,
      content: completion.output.content,
      provider: completion.provider,
      model: completion.model,
      route_selected: completion.deployment,
      prompt_id: prompt.prompt_id,
      prompt_version: prompt.prompt_version,
      prompt_source_trace: prompt.source_trace,
      usage: completion.output.usage,
      cost,
      cache_hit: false,
      privacy
    };

    if (cacheEnabled) {
      this.cache.set(cacheKey, response);
    }

    this.recordCost(parsed.purpose, response);
    return response;
  }

  listCostEntries(): readonly CostEntry[] {
    return this.costLedger.listEntries();
  }

  summarizeCostByPurpose(): readonly CostSummary[] {
    return this.costLedger.summarizeByPurpose();
  }

  getPrompts() {
    return this.promptRegistry.list();
  }

  private async completeWithRoute(
    route: ModelRoute,
    privacyLevel: GatewayPrivacyLevel,
    input: Parameters<ProviderAdapter["complete"]>[0]
  ): Promise<{
    provider: GatewayProvider;
    model: string;
    deployment: ModelRoute["deployment"];
    output: ProviderCompletionOutput;
  }> {
    const primary = this.requireAdapter(route.provider, route.model, route.deployment);
    this.assertAdapterAllowsPrivacy(primary, privacyLevel);

    try {
      return {
        provider: primary.provider,
        model: primary.model,
        deployment: primary.deployment,
        output: await primary.complete(input)
      };
    } catch (error) {
      if (!route.fallback) {
        throw error;
      }

      if (route.deployment === "campus_local" && route.fallback.deployment !== "campus_local") {
        throw new Error("Campus-local routes cannot fallback to cloud providers");
      }

      const fallback = this.requireAdapter(route.fallback.provider, route.fallback.model, route.fallback.deployment);
      this.assertAdapterAllowsPrivacy(fallback, privacyLevel);
      return {
        provider: fallback.provider,
        model: fallback.model,
        deployment: fallback.deployment,
        output: await fallback.complete(input)
      };
    }
  }

  private assertAdapterAllowsPrivacy(adapter: ProviderAdapter, privacyLevel: GatewayPrivacyLevel): void {
    if (!adapter.allowed_privacy_levels.includes(privacyLevel)) {
      throw new Error(
        `LLM adapter privacy mismatch: ${adapter.provider}/${adapter.model} does not allow ${privacyLevel} requests`
      );
    }
  }

  private requireAdapter(provider: GatewayProvider, model: string, expectedDeployment: ModelRoute["deployment"]): ProviderAdapter {
    const adapter = this.adapters.get(adapterKey(provider, model));
    if (!adapter) {
      throw new Error(`LLM adapter not registered: ${provider}/${model}`);
    }

    if (adapter.deployment !== expectedDeployment) {
      throw new Error(
        `LLM adapter deployment mismatch: ${provider}/${model} expected ${expectedDeployment} but got ${adapter.deployment}`
      );
    }

    return adapter;
  }

  private recordCost(purpose: GatewayCompleteRequest["purpose"], response: GatewayCompleteResponse): void {
    this.costLedger.record({
      request_id: response.request_id,
      purpose,
      provider: response.provider,
      model: response.model,
      route_selected: response.route_selected,
      prompt_id: response.prompt_id,
      prompt_version: response.prompt_version,
      prompt_source_trace: response.prompt_source_trace,
      input_tokens: response.cache_hit ? 0 : response.usage.input_tokens,
      output_tokens: response.cache_hit ? 0 : response.usage.output_tokens,
      estimated_cost_cny: response.cache_hit ? 0 : response.cost.estimated_cost_cny,
      cache_hit: response.cache_hit,
      created_at: this.now().toISOString()
    });
  }
}

export function createLlmGateway(options: LlmGatewayOptions = {}): LlmGateway {
  return new LlmGateway(options);
}

function adapterKey(provider: GatewayProvider, model: string): string {
  return `${provider}:${model}`;
}
