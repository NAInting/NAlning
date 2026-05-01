import type { EpisodicMemoryPipeline } from "./episodic-memory";
import type { MemoryTransparencyInput, MemoryTransparencyView } from "./types";

export class MemoryTransparencyService {
  private readonly episodicMemory: EpisodicMemoryPipeline;

  constructor(episodicMemory: EpisodicMemoryPipeline) {
    this.episodicMemory = episodicMemory;
  }

  buildView(input: MemoryTransparencyInput): MemoryTransparencyView {
    const items = this.episodicMemory
      .listEntries()
      .filter((entry) => entry.student_id === input.student_id && !entry.deleted_by_student)
      .map((entry) => ({
        memory_id: entry.id,
        bucket: entry.privacy_bucket,
        title: entry.topic,
        why_it_matters: buildWhyItMatters(entry.privacy_bucket),
        last_updated_at: entry.updated_at,
        can_delete: true
      }));

    return {
      student_id: input.student_id,
      items
    };
  }
}

function buildWhyItMatters(bucket: "academic" | "emotional" | "personal"): string {
  if (bucket === "academic") {
    return "这能帮助学伴下次更准确地选择讲解方式。";
  }

  if (bucket === "personal") {
    return "这能帮助学伴使用你更容易理解的例子。";
  }

  return "这只用于本地安全判断，不会作为普通学习标签展示给老师。";
}
