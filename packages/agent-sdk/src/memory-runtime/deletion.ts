import type { MemoryStore } from "@edu-ai/memory-store";

import type { EpisodicMemoryPipeline } from "./episodic-memory";
import type { MemoryDeletionInput, MemoryDeletionResult } from "./types";

export class MemoryDeletionService {
  private readonly episodicMemory: EpisodicMemoryPipeline;
  private readonly store: MemoryStore;

  constructor(episodicMemory: EpisodicMemoryPipeline, store: MemoryStore) {
    this.episodicMemory = episodicMemory;
    this.store = store;
  }

  async requestDeletion(input: MemoryDeletionInput): Promise<MemoryDeletionResult> {
    const entry = this.episodicMemory.markDeleted(input.memory_id, input.student_id, input.reason);
    if (entry) {
      await this.store.tombstone(entry.embedding_id, input.reason ? { reason: input.reason } : {});
    }

    return {
      memory_id: input.memory_id,
      deleted: Boolean(entry),
      audit_required: true
    };
  }
}
