import { createHash } from "node:crypto";

import type { GatewayCompleteRequest, GatewayCompleteResponse, ModelRoute, PromptTemplate } from "./types";

export class InMemoryCompletionCache {
  private readonly entries = new Map<string, GatewayCompleteResponse>();

  get(key: string): GatewayCompleteResponse | undefined {
    return this.entries.get(key);
  }

  set(key: string, value: GatewayCompleteResponse): void {
    this.entries.set(key, value);
  }

  clear(): void {
    this.entries.clear();
  }
}

export function buildCacheKey(request: GatewayCompleteRequest, prompt: PromptTemplate, route: ModelRoute): string {
  const normalized = {
    messages: request.messages,
    model: route.model,
    privacy_level: request.privacy_level,
    prompt_id: prompt.prompt_id,
    prompt_version: prompt.prompt_version,
    purpose: request.purpose,
    route_selected: route.deployment,
    user_context: request.user_context
  };

  return createHash("sha256").update(JSON.stringify(normalized)).digest("hex");
}
