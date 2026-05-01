import { randomUUID } from "node:crypto";

import type { MemoryStore, VectorRecord } from "@edu-ai/memory-store";
import type { Conversation } from "@edu-ai/shared-types";

import {
  assertCandidatePolicy,
  assertNoRawTurnLeak,
  privacyForBucket,
  visibilityForBucket
} from "./policy";
import type {
  EndConversationInput,
  EpisodicMemoryWriteResult,
  MemorySummaryCandidate,
  RuntimeEpisodicMemoryEntry,
  SkippedMemoryCandidate
} from "./types";

export class EpisodicMemoryPipeline {
  private readonly store: MemoryStore;
  private readonly entries = new Map<string, RuntimeEpisodicMemoryEntry>();
  private readonly now: () => Date;

  constructor(options: { store: MemoryStore; now?: () => Date }) {
    this.store = options.store;
    this.now = options.now ?? (() => new Date());
  }

  async endConversation(input: EndConversationInput): Promise<EpisodicMemoryWriteResult> {
    const writtenEntries: RuntimeEpisodicMemoryEntry[] = [];
    const skippedCandidates: SkippedMemoryCandidate[] = [];

    for (const candidate of input.summary_candidates) {
      try {
        const entry = await this.writeCandidate(input.tenant_id, input.agent_id, input.conversation, candidate);
        writtenEntries.push(entry);
      } catch (error) {
        skippedCandidates.push({
          topic: candidate.topic,
          memory_bucket: candidate.memory_bucket,
          reason: error instanceof Error ? error.message : "Unknown memory write error"
        });
      }
    }

    return {
      written_entries: writtenEntries,
      skipped_candidates: skippedCandidates
    };
  }

  listEntries(): readonly RuntimeEpisodicMemoryEntry[] {
    return [...this.entries.values()];
  }

  markDeleted(memoryId: string, studentId: string, reason: string | undefined): RuntimeEpisodicMemoryEntry | undefined {
    const entry = this.entries.get(memoryId);
    if (!entry || entry.student_id !== studentId) {
      return undefined;
    }

    const updated: RuntimeEpisodicMemoryEntry = {
      ...entry,
      updated_at: this.now().toISOString(),
      version: entry.version + 1,
      deleted_by_student: true
    };
    if (reason) {
      updated.deletion_reason = reason;
    }
    this.entries.set(memoryId, updated);
    return updated;
  }

  private async writeCandidate(
    tenantId: string,
    agentId: string,
    conversation: Conversation,
    candidate: MemorySummaryCandidate
  ): Promise<RuntimeEpisodicMemoryEntry> {
    assertCandidatePolicy(candidate);
    assertNoRawTurnLeak(candidate.summary_text, conversation.turns);

    const privacy = privacyForBucket(candidate.memory_bucket);
    const evidenceRef = `evidence-${randomUUID()}`;
    const vectorRecord = await this.store.upsert({
      tenant_id: tenantId,
      student_id: conversation.student_id,
      source_id: `episodic-${randomUUID()}`,
      source_type: "conversation",
      summary_text: candidate.summary_text,
      memory_bucket: candidate.memory_bucket,
      privacy_level: privacy.privacy_level,
      deployment_scope: privacy.deployment_scope,
      source_trace: [`sanitized:${evidenceRef}`]
    });

    const entry = buildRuntimeEntry(agentId, conversation, candidate, vectorRecord, this.now().toISOString());
    this.entries.set(entry.id, entry);
    return entry;
  }
}

function buildRuntimeEntry(
  agentId: string,
  conversation: Conversation,
  candidate: MemorySummaryCandidate,
  vectorRecord: VectorRecord,
  nowIso: string
): RuntimeEpisodicMemoryEntry {
  return {
    id: randomUUID(),
    created_at: nowIso,
    updated_at: nowIso,
    version: 1,
    agent_id: agentId,
    student_id: conversation.student_id,
    summary: candidate.summary_text,
    topic: candidate.topic,
    related_node_ids: [...(candidate.related_node_ids ?? [])],
    embedding_id: vectorRecord.id,
    privacy_bucket: candidate.memory_bucket,
    source_conversation_id: conversation.id,
    source_turn_range: candidate.source_turn_range,
    importance_score: candidate.importance_score,
    confidence: candidate.confidence,
    visibility_scope: visibilityForBucket(candidate.memory_bucket),
    deleted_by_student: false
  };
}
