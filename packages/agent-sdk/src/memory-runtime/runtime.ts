import type { MemoryStore, VectorSearchResult } from "@edu-ai/memory-store";
import type { StudentMemorySnapshot, WorkingMemory } from "@edu-ai/shared-types";

import { MemoryDeletionService } from "./deletion";
import { EpisodicMemoryPipeline } from "./episodic-memory";
import { assertTeacherEvidenceReference } from "./policy";
import { buildStudentMemorySnapshot } from "./semantic-snapshot";
import { MemoryTransparencyService } from "./transparency";
import type {
  AppendTurnInput,
  BuildSnapshotInput,
  EndConversationInput,
  EpisodicMemoryWriteResult,
  MemoryDeletionInput,
  MemoryDeletionResult,
  MemoryTransparencyInput,
  MemoryTransparencyView,
  StudentMemoryRuntime,
  StudentRecallInput,
  StudentRecallResult,
  TeacherEvidenceReference
} from "./types";
import { WorkingMemoryManager } from "./working-memory";

export interface StudentMemoryRuntimeOptions {
  store: MemoryStore;
  now?: () => Date;
}

export class DefaultStudentMemoryRuntime implements StudentMemoryRuntime {
  private readonly store: MemoryStore;
  private readonly workingMemory: WorkingMemoryManager;
  private readonly episodicMemory: EpisodicMemoryPipeline;
  private readonly deletion: MemoryDeletionService;
  private readonly transparency: MemoryTransparencyService;
  private readonly now: () => Date;

  constructor(options: StudentMemoryRuntimeOptions) {
    this.store = options.store;
    this.now = options.now ?? (() => new Date());
    this.workingMemory = new WorkingMemoryManager({ now: this.now });
    this.episodicMemory = new EpisodicMemoryPipeline({ store: this.store, now: this.now });
    this.deletion = new MemoryDeletionService(this.episodicMemory, this.store);
    this.transparency = new MemoryTransparencyService(this.episodicMemory);
  }

  async appendTurn(input: AppendTurnInput): Promise<WorkingMemory> {
    return this.workingMemory.appendTurn(input);
  }

  async endConversation(input: EndConversationInput): Promise<EpisodicMemoryWriteResult> {
    return this.episodicMemory.endConversation(input);
  }

  async recallForStudent(input: StudentRecallInput): Promise<StudentRecallResult> {
    const academic = await this.queryActive(input, "academic");
    const personal = await this.queryActive(input, "personal");
    const emotionalForSafety = input.include_emotional_for_local_safety
      ? await this.queryActive(input, "emotional")
      : [];

    return {
      academic,
      personal,
      emotional_for_safety: emotionalForSafety
    };
  }

  async buildSemanticSnapshot(input: BuildSnapshotInput): Promise<StudentMemorySnapshot> {
    return buildStudentMemorySnapshot(input, this.now);
  }

  async buildTransparencyView(input: MemoryTransparencyInput): Promise<MemoryTransparencyView> {
    return this.transparency.buildView(input);
  }

  async requestDeletion(input: MemoryDeletionInput): Promise<MemoryDeletionResult> {
    return this.deletion.requestDeletion(input);
  }

  assertTeacherEvidenceReference(reference: TeacherEvidenceReference): void {
    assertTeacherEvidenceReference(reference);
  }

  private async queryActive(input: StudentRecallInput, memoryBucket: "academic" | "emotional" | "personal"): Promise<readonly VectorSearchResult[]> {
    const query = {
      tenant_id: input.tenant_id,
      student_id: input.student_id,
      requester_role: memoryBucket === "emotional" ? "system" : "student_agent",
      query_text: input.query_text,
      memory_bucket: memoryBucket
    } as const;
    const results = await this.store.query(input.limit ? { ...query, limit: input.limit } : query);

    return results;
  }
}

export function createStudentMemoryRuntime(options: StudentMemoryRuntimeOptions): DefaultStudentMemoryRuntime {
  return new DefaultStudentMemoryRuntime(options);
}
