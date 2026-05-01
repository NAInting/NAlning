import { randomUUID } from "node:crypto";

import { DeterministicEmbeddingProvider } from "./embedding";
import { assertSafeQuery, assertWritableMemory, isRecordVisibleToQuery } from "./privacy";
import { QueryVectorInputSchema, UpsertVectorInputSchema } from "./schemas";
import { cosineSimilarity } from "./similarity";
import type {
  EmbeddingProvider,
  MemoryStore,
  QueryVectorInput,
  UpsertVectorInput,
  VectorRecord,
  VectorSearchResult
} from "./types";

export interface InMemoryMemoryStoreOptions {
  embeddingProvider?: EmbeddingProvider;
  now?: () => Date;
}

export class InMemoryMemoryStore implements MemoryStore {
  private readonly records = new Map<string, VectorRecord>();
  private readonly embeddingProvider: EmbeddingProvider;
  private readonly now: () => Date;

  constructor(options: InMemoryMemoryStoreOptions = {}) {
    this.embeddingProvider = options.embeddingProvider ?? new DeterministicEmbeddingProvider();
    this.now = options.now ?? (() => new Date());
  }

  async upsert(input: UpsertVectorInput): Promise<VectorRecord> {
    const parsed = UpsertVectorInputSchema.parse(input) as UpsertVectorInput;
    assertWritableMemory(parsed);

    const existing = parsed.id
      ? assertSamePartition(this.records.get(parsed.id), parsed)
      : findLatestBySource(this.records, parsed);
    const nowIso = this.now().toISOString();
    const id = parsed.id ?? existing?.id ?? randomUUID();
    const record: VectorRecord = {
      id,
      tenant_id: parsed.tenant_id,
      source_id: parsed.source_id,
      source_type: parsed.source_type,
      summary_text: parsed.summary_text,
      embedding: this.embeddingProvider.embed(parsed.summary_text),
      memory_bucket: parsed.memory_bucket,
      privacy_level: parsed.privacy_level,
      deployment_scope: parsed.deployment_scope,
      source_trace: parsed.source_trace,
      created_at: existing?.created_at ?? nowIso,
      updated_at: nowIso,
      version: (existing?.version ?? 0) + 1
    };
    if (parsed.student_id) {
      record.student_id = parsed.student_id;
    }

    this.records.set(id, record);
    return record;
  }

  async tombstone(id: string, input: { reason?: string } = {}): Promise<VectorRecord | undefined> {
    const existing = this.records.get(id);
    if (!existing) {
      return undefined;
    }

    const nowIso = this.now().toISOString();
    const record: VectorRecord = {
      ...existing,
      updated_at: nowIso,
      version: existing.version + 1,
      deleted_at: existing.deleted_at ?? nowIso
    };
    if (input.reason) {
      record.tombstone_reason = input.reason;
    }

    this.records.set(id, record);
    return record;
  }

  async query(input: QueryVectorInput): Promise<readonly VectorSearchResult[]> {
    const parsed = QueryVectorInputSchema.parse(input) as QueryVectorInput;
    assertSafeQuery(parsed);

    const queryEmbedding = this.embeddingProvider.embed(parsed.query_text);
    const limit = parsed.limit ?? 10;

    return [...this.records.values()]
      .filter((record) => {
        if (record.deleted_at) {
          return false;
        }

        if (parsed.source_type && record.source_type !== parsed.source_type) {
          return false;
        }

        return isRecordVisibleToQuery(
          record,
          parsed.tenant_id,
          parsed.student_id,
          parsed.requester_role,
          parsed.memory_bucket
        );
      })
      .map((record) => ({
        record,
        similarity: cosineSimilarity(queryEmbedding, record.embedding)
      }))
      .sort((left, right) => right.similarity - left.similarity)
      .slice(0, limit);
  }

  list(): readonly VectorRecord[] {
    return [...this.records.values()];
  }
}

export function createInMemoryMemoryStore(options: InMemoryMemoryStoreOptions = {}): InMemoryMemoryStore {
  return new InMemoryMemoryStore(options);
}

function findLatestBySource(records: Map<string, VectorRecord>, input: UpsertVectorInput): VectorRecord | undefined {
  return [...records.values()]
    .filter((record) => !record.deleted_at && isSamePartition(record, input))
    .sort((left, right) => right.version - left.version)[0];
}

function assertSamePartition(record: VectorRecord | undefined, input: UpsertVectorInput): VectorRecord | undefined {
  if (record && !isSamePartition(record, input)) {
    throw new Error("Existing vector record partition does not match upsert input");
  }

  return record;
}

function isSamePartition(record: VectorRecord, input: UpsertVectorInput): boolean {
  if (record.tenant_id !== input.tenant_id) {
    return false;
  }

  if (record.source_type !== input.source_type || record.source_id !== input.source_id) {
    return false;
  }

  if (record.memory_bucket !== input.memory_bucket) {
    return false;
  }

  if (input.source_type !== "content" && record.student_id !== input.student_id) {
    return false;
  }

  return input.source_type === "content" || record.student_id === input.student_id;
}
