import type { CostEntry, CostSummary, GatewayCost, GatewayProvider, GatewayUsage, LlmPurpose } from "./types";

const PRICE_CNY_PER_1K: Record<GatewayProvider, { input: number; output: number }> = {
  claude_mock: { input: 0.02, output: 0.08 },
  qianfan_mock: { input: 0.012, output: 0.04 },
  campus_local_mock: { input: 0.004, output: 0.004 },
  openai_compatible: { input: 0, output: 0 }
};

export function estimateCost(provider: GatewayProvider, usage: GatewayUsage): GatewayCost {
  const price = PRICE_CNY_PER_1K[provider];
  const inputCost = (usage.input_tokens / 1000) * price.input;
  const outputCost = (usage.output_tokens / 1000) * price.output;

  return {
    estimated_cost_cny: roundCost(inputCost + outputCost),
    input_cost_cny: roundCost(inputCost),
    output_cost_cny: roundCost(outputCost)
  };
}

export class InMemoryCostLedger {
  private readonly entries: CostEntry[] = [];

  record(entry: CostEntry): void {
    this.entries.push(entry);
  }

  listEntries(): readonly CostEntry[] {
    return [...this.entries];
  }

  summarizeByPurpose(): readonly CostSummary[] {
    const summaries = new Map<LlmPurpose, CostSummary>();

    for (const entry of this.entries) {
      const existing =
        summaries.get(entry.purpose) ??
        ({
          purpose: entry.purpose,
          calls: 0,
          input_tokens: 0,
          output_tokens: 0,
          estimated_cost_cny: 0
        } satisfies CostSummary);

      existing.calls += 1;
      existing.input_tokens += entry.input_tokens;
      existing.output_tokens += entry.output_tokens;
      existing.estimated_cost_cny = roundCost(existing.estimated_cost_cny + entry.estimated_cost_cny);
      summaries.set(entry.purpose, existing);
    }

    return [...summaries.values()];
  }

  clear(): void {
    this.entries.length = 0;
  }
}

function roundCost(value: number): number {
  return Number(value.toFixed(6));
}
