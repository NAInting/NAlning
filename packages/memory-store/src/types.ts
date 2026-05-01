export type MemoryBucket = "academic" | "emotional" | "personal";

export type VectorSourceType = "student_memory" | "content" | "conversation";

export type VectorPrivacyLevel = "public" | "private" | "campus_local_only";

export type VectorDeploymentScope = "controlled_cloud" | "campus_local";

export type MemoryRequesterRole = "student_agent" | "teacher_agent" | "guardian_agent" | "admin" | "system";

export interface VectorRecord {
  id: string;
  tenant_id: string;
  student_id?: string;
  source_id: string;
  source_type: VectorSourceType;
  summary_text: string;
  embedding: readonly number[];
  memory_bucket: MemoryBucket;
  privacy_level: VectorPrivacyLevel;
  deployment_scope: VectorDeploymentScope;
  source_trace: readonly string[];
  created_at: string;
  updated_at: string;
  version: number;
  deleted_at?: string;
  tombstone_reason?: string;
}

export interface UpsertVectorInput {
  id?: string;
  tenant_id: string;
  student_id?: string;
  source_id: string;
  source_type: VectorSourceType;
  summary_text: string;
  memory_bucket: MemoryBucket;
  privacy_level: VectorPrivacyLevel;
  deployment_scope: VectorDeploymentScope;
  source_trace: readonly string[];
}

export interface QueryVectorInput {
  tenant_id: string;
  requester_role: MemoryRequesterRole;
  query_text: string;
  source_type?: VectorSourceType;
  student_id?: string;
  memory_bucket?: MemoryBucket;
  limit?: number;
}

export interface TombstoneVectorInput {
  reason?: string;
}

export interface VectorSearchResult {
  record: VectorRecord;
  similarity: number;
}

export interface EmbeddingProvider {
  dimension: number;
  embed(text: string): readonly number[];
}

export interface MemoryStore {
  upsert(input: UpsertVectorInput): Promise<VectorRecord>;
  tombstone(id: string, input?: TombstoneVectorInput): Promise<VectorRecord | undefined>;
  query(input: QueryVectorInput): Promise<readonly VectorSearchResult[]>;
  list(): readonly VectorRecord[];
}
