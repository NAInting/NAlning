import type { WorkingMemory } from "@edu-ai/shared-types";

import { DEFAULT_WORKING_MEMORY_WINDOW, assertWorkingMemoryWindow } from "./policy";
import type { AppendTurnInput } from "./types";

export class WorkingMemoryManager {
  private readonly sessions = new Map<string, WorkingMemory>();
  private readonly now: () => Date;

  constructor(options: { now?: () => Date } = {}) {
    this.now = options.now ?? (() => new Date());
  }

  appendTurn(input: AppendTurnInput): WorkingMemory {
    const contextWindowSize = input.context_window_size ?? DEFAULT_WORKING_MEMORY_WINDOW;
    assertWorkingMemoryWindow(contextWindowSize);

    const existing = this.sessions.get(input.conversation_id);
    const recentTurns = [...(existing?.recent_turns ?? []), input.turn].slice(-contextWindowSize);
    const memory: WorkingMemory = {
      agent_id: input.agent_id,
      conversation_id: input.conversation_id,
      recent_turns: recentTurns,
      context_window_size: contextWindowSize,
      updated_at: this.now().toISOString()
    };

    this.sessions.set(input.conversation_id, memory);
    return memory;
  }

  get(conversationId: string): WorkingMemory | undefined {
    return this.sessions.get(conversationId);
  }
}
