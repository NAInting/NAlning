import type { MemoryBucket, VectorSearchResult } from "@edu-ai/memory-store";
import type {
  Conversation,
  ConversationTurn,
  EmotionBaseline,
  InterestProfile,
  KnowledgeProfile,
  LearningStyleProfile,
  SourceTurnRange,
  StudentMemorySnapshot,
  VisibilityScope,
  WorkingMemory
} from "@edu-ai/shared-types";

export interface AppendTurnInput {
  agent_id: string;
  conversation_id: string;
  turn: ConversationTurn;
  context_window_size?: number;
}

export interface MemorySummaryCandidate {
  topic: string;
  summary_text: string;
  memory_bucket: MemoryBucket;
  confidence: number;
  importance_score: number;
  related_node_ids?: readonly string[];
  source_turn_range: SourceTurnRange;
}

export interface EndConversationInput {
  tenant_id: string;
  agent_id: string;
  conversation: Conversation;
  summary_candidates: readonly MemorySummaryCandidate[];
}

export interface EpisodicMemoryWriteResult {
  written_entries: readonly RuntimeEpisodicMemoryEntry[];
  skipped_candidates: readonly SkippedMemoryCandidate[];
}

export interface RuntimeEpisodicMemoryEntry {
  id: string;
  created_at: string;
  updated_at: string;
  version: number;
  agent_id: string;
  student_id: string;
  summary: string;
  topic: string;
  related_node_ids: readonly string[];
  embedding_id: string;
  privacy_bucket: MemoryBucket;
  source_conversation_id: string;
  source_turn_range: SourceTurnRange;
  importance_score: number;
  confidence: number;
  visibility_scope: VisibilityScope;
  deleted_by_student: boolean;
  deletion_reason?: string;
}

export interface SkippedMemoryCandidate {
  topic: string;
  memory_bucket: MemoryBucket;
  reason: string;
}

export interface StudentRecallInput {
  tenant_id: string;
  student_id: string;
  query_text: string;
  limit?: number;
  include_emotional_for_local_safety?: boolean;
}

export interface StudentRecallResult {
  academic: readonly VectorSearchResult[];
  personal: readonly VectorSearchResult[];
  emotional_for_safety: readonly VectorSearchResult[];
}

export interface BuildSnapshotInput {
  student_id: string;
  agent_id: string;
  knowledge_profile: KnowledgeProfile;
  learning_style_profile: LearningStyleProfile;
  interest_profile: InterestProfile;
  emotion_baseline: EmotionBaseline;
  snapshot_version: number;
  prior_snapshot_id?: string;
  change_summary?: string;
  confidence: number;
  evidence_count: number;
  observation_window_days: number;
}

export interface MemoryTransparencyInput {
  student_id: string;
}

export interface MemoryTransparencyItem {
  memory_id: string;
  bucket: MemoryBucket;
  title: string;
  why_it_matters: string;
  last_updated_at: string;
  can_delete: boolean;
}

export interface MemoryTransparencyView {
  student_id: string;
  items: readonly MemoryTransparencyItem[];
}

export interface MemoryDeletionInput {
  student_id: string;
  memory_id: string;
  reason?: string;
}

export interface MemoryDeletionResult {
  memory_id: string;
  deleted: boolean;
  audit_required: true;
}

export type TeacherEvidenceType = "signal" | "aggregate_summary" | "audit_summary";

export interface TeacherEvidenceReference {
  evidence_id: string;
  evidence_type: TeacherEvidenceType;
  window_start?: string;
  window_end?: string;
}

export interface StudentMemoryRuntime {
  appendTurn(input: AppendTurnInput): Promise<WorkingMemory>;
  endConversation(input: EndConversationInput): Promise<EpisodicMemoryWriteResult>;
  recallForStudent(input: StudentRecallInput): Promise<StudentRecallResult>;
  buildSemanticSnapshot(input: BuildSnapshotInput): Promise<StudentMemorySnapshot>;
  buildTransparencyView(input: MemoryTransparencyInput): Promise<MemoryTransparencyView>;
  requestDeletion(input: MemoryDeletionInput): Promise<MemoryDeletionResult>;
}
