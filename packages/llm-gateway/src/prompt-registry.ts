import type { LlmPurpose, PromptTemplate } from "./types";

const DEFAULT_PROMPTS: readonly PromptTemplate[] = [
  {
    prompt_id: "student_dialogue_default",
    prompt_version: "1.0.0",
    purpose: "student_dialogue",
    content: "Use Socratic guidance. Do not provide direct homework answers.",
    source_trace: ["docs/AGENT_PROTOCOL.md"],
    active: true
  },
  {
    prompt_id: "teacher_daily_report_default",
    prompt_version: "1.0.0",
    purpose: "teacher_daily_report",
    content: "Summarize structured learning signals without exposing raw student dialogue.",
    source_trace: ["docs/GOVERNANCE.md", "docs/AGENT_PROTOCOL.md"],
    active: true
  },
  {
    prompt_id: "content_generation_default",
    prompt_version: "1.0.0",
    purpose: "content_generation",
    content: "Generate curriculum content aligned to unit spec and source traces.",
    source_trace: ["docs/UNIT_SPEC.md"],
    active: true
  },
  {
    prompt_id: "guardian_weekly_report_default",
    prompt_version: "1.0.0",
    purpose: "guardian_weekly_report",
    content: "Use reassuring language. Do not include rankings, raw dialogue, or emotion details.",
    source_trace: ["docs/GOVERNANCE.md"],
    active: true
  },
  {
    prompt_id: "memory_summary_default",
    prompt_version: "1.0.0",
    purpose: "memory_summary",
    content: "Summarize only the allowed memory bucket and preserve privacy scope.",
    source_trace: ["docs/SCHEMA.md"],
    active: true
  },
  {
    prompt_id: "prompt_test_default",
    prompt_version: "1.0.0",
    purpose: "prompt_test",
    content: "Return a deterministic test response.",
    source_trace: ["packages/llm-gateway/tests"],
    active: true
  }
];

export class PromptRegistry {
  private readonly prompts = new Map<string, PromptTemplate>();

  constructor(seedPrompts: readonly PromptTemplate[] = DEFAULT_PROMPTS) {
    for (const prompt of seedPrompts) {
      this.register(prompt);
    }
  }

  register(prompt: PromptTemplate): void {
    this.prompts.set(prompt.prompt_id, prompt);
  }

  getActivePrompt(purpose: LlmPurpose, promptId?: string): PromptTemplate {
    if (promptId) {
      const prompt = this.prompts.get(promptId);
      if (!prompt || prompt.purpose !== purpose || !prompt.active) {
        throw new Error(`Active prompt not found for purpose ${purpose}: ${promptId}`);
      }

      return prompt;
    }

    const prompt = [...this.prompts.values()].find((candidate) => candidate.purpose === purpose && candidate.active);
    if (!prompt) {
      throw new Error(`Active prompt not found for purpose ${purpose}`);
    }

    return prompt;
  }

  list(): readonly PromptTemplate[] {
    return [...this.prompts.values()];
  }
}
