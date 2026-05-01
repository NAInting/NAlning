import { describe, expect, it } from "vitest";

import { createInMemoryMemoryStore, DeterministicEmbeddingProvider } from "../src";

describe("memory store", () => {
  it("stores text as deterministic embeddings and recalls by similarity", async () => {
    const store = createInMemoryMemoryStore();
    await store.upsert({
      tenant_id: "tenant_demo",
      student_id: "student_001",
      source_id: "summary_001",
      source_type: "student_memory",
      summary_text: "学生正在学习一次函数的斜率和截距。",
      memory_bucket: "academic",
      privacy_level: "private",
      deployment_scope: "controlled_cloud",
      source_trace: ["conversation:conv_001"]
    });
    await store.upsert({
      tenant_id: "tenant_demo",
      student_id: "student_001",
      source_id: "summary_002",
      source_type: "student_memory",
      summary_text: "学生喜欢用篮球场景理解数学问题。",
      memory_bucket: "personal",
      privacy_level: "private",
      deployment_scope: "controlled_cloud",
      source_trace: ["conversation:conv_002"]
    });

    const results = await store.query({
      tenant_id: "tenant_demo",
      student_id: "student_001",
      requester_role: "student_agent",
      query_text: "一次函数斜率",
      memory_bucket: "academic",
      limit: 1
    });

    expect(results).toHaveLength(1);
    expect(results[0]!.record.source_id).toBe("summary_001");
  });

  it("allows teacher agent to query academic memory only", async () => {
    const store = createInMemoryMemoryStore();
    await store.upsert({
      tenant_id: "tenant_demo",
      student_id: "student_001",
      source_id: "academic_001",
      source_type: "conversation",
      summary_text: "学生在函数图像平移上仍有表征混淆。",
      memory_bucket: "academic",
      privacy_level: "private",
      deployment_scope: "controlled_cloud",
      source_trace: ["conversation:conv_003"]
    });
    await store.upsert({
      tenant_id: "tenant_demo",
      student_id: "student_001",
      source_id: "emotion_001",
      source_type: "conversation",
      summary_text: "学生表达了强烈焦虑，需要本地导师关注。",
      memory_bucket: "emotional",
      privacy_level: "campus_local_only",
      deployment_scope: "campus_local",
      source_trace: ["conversation:conv_004"]
    });

    const academicResults = await store.query({
      tenant_id: "tenant_demo",
      student_id: "student_001",
      requester_role: "teacher_agent",
      query_text: "函数图像",
      memory_bucket: "academic"
    });

    await expect(
      store.query({
        tenant_id: "tenant_demo",
        student_id: "student_001",
        requester_role: "teacher_agent",
        query_text: "焦虑",
        memory_bucket: "emotional"
      })
    ).rejects.toThrow("teacher_agent cannot query emotional memory bucket");
    expect(academicResults.map((result) => result.record.memory_bucket)).toEqual(["academic"]);
  });

  it("does not let student_agent directly query emotional memory outside the safety runtime", async () => {
    const store = createInMemoryMemoryStore();
    await store.upsert({
      tenant_id: "tenant_demo",
      student_id: "student_001",
      source_id: "emotion_001",
      source_type: "conversation",
      summary_text: "学生表达了强烈挫败，需要校内安全判断关注。",
      memory_bucket: "emotional",
      privacy_level: "campus_local_only",
      deployment_scope: "campus_local",
      source_trace: ["sanitized:evidence_001"]
    });

    await expect(
      store.query({
        tenant_id: "tenant_demo",
        student_id: "student_001",
        requester_role: "student_agent",
        query_text: "挫败",
        memory_bucket: "emotional"
      })
    ).rejects.toThrow("student_agent cannot query emotional memory bucket");
  });

  it("requires emotional memory to stay campus local", async () => {
    const store = createInMemoryMemoryStore();

    await expect(
      store.upsert({
        tenant_id: "tenant_demo",
        student_id: "student_001",
        source_id: "emotion_bad",
        source_type: "student_memory",
        summary_text: "学生出现情绪波动。",
        memory_bucket: "emotional",
        privacy_level: "private",
        deployment_scope: "controlled_cloud",
        source_trace: ["emotion-baseline:demo"]
      })
    ).rejects.toThrow("Emotional memory must be campus_local_only and campus_local");
  });

  it("stores content embeddings without student binding", async () => {
    const store = createInMemoryMemoryStore();
    const record = await store.upsert({
      tenant_id: "tenant_demo",
      source_id: "unit_linear_function_intro",
      source_type: "content",
      summary_text: "一次函数单元介绍斜率、截距和图像。",
      memory_bucket: "academic",
      privacy_level: "public",
      deployment_scope: "controlled_cloud",
      source_trace: ["content/units/linear-function.yaml"]
    });

    await expect(
      store.upsert({
        tenant_id: "tenant_demo",
        student_id: "student_001",
        source_id: "unit_bad",
        source_type: "content",
        summary_text: "错误绑定学生的内容向量。",
        memory_bucket: "academic",
        privacy_level: "public",
        deployment_scope: "controlled_cloud",
        source_trace: ["content/units/bad.yaml"]
      })
    ).rejects.toThrow("Content embeddings must not bind to a student_id");
    expect(record.student_id).toBeUndefined();
  });

  it("updates the same source incrementally instead of creating a second active record", async () => {
    const store = createInMemoryMemoryStore();
    const first = await store.upsert({
      tenant_id: "tenant_demo",
      student_id: "student_001",
      source_id: "episodic_summary_001",
      source_type: "student_memory",
      summary_text: "第一版摘要：学生刚开始理解斜率。",
      memory_bucket: "academic",
      privacy_level: "private",
      deployment_scope: "controlled_cloud",
      source_trace: ["conversation:conv_005"]
    });
    const second = await store.upsert({
      tenant_id: "tenant_demo",
      student_id: "student_001",
      source_id: "episodic_summary_001",
      source_type: "student_memory",
      summary_text: "第二版摘要：学生能够解释斜率含义。",
      memory_bucket: "academic",
      privacy_level: "private",
      deployment_scope: "controlled_cloud",
      source_trace: ["conversation:conv_005", "conversation:conv_006"]
    });

    expect(second.id).toBe(first.id);
    expect(second.version).toBe(2);
    expect(store.list()).toHaveLength(1);
  });

  it("does not merge incremental summaries across tenant or student partitions", async () => {
    const store = createInMemoryMemoryStore();
    const first = await store.upsert({
      tenant_id: "tenant_a",
      student_id: "student_a",
      source_id: "shared_source",
      source_type: "student_memory",
      summary_text: "student a academic summary",
      memory_bucket: "academic",
      privacy_level: "private",
      deployment_scope: "controlled_cloud",
      source_trace: ["conversation:a"]
    });
    const second = await store.upsert({
      tenant_id: "tenant_b",
      student_id: "student_b",
      source_id: "shared_source",
      source_type: "student_memory",
      summary_text: "student b academic summary",
      memory_bucket: "academic",
      privacy_level: "private",
      deployment_scope: "controlled_cloud",
      source_trace: ["conversation:b"]
    });
    const third = await store.upsert({
      tenant_id: "tenant_a",
      student_id: "student_c",
      source_id: "shared_source",
      source_type: "student_memory",
      summary_text: "student c academic summary",
      memory_bucket: "academic",
      privacy_level: "private",
      deployment_scope: "controlled_cloud",
      source_trace: ["conversation:c"]
    });

    expect(second.id).not.toBe(first.id);
    expect(third.id).not.toBe(first.id);
    expect(first.version).toBe(1);
    expect(second.version).toBe(1);
    expect(third.version).toBe(1);
    expect(store.list()).toHaveLength(3);
  });

  it("requires student-bound memory queries to include student_id for non-privileged roles", async () => {
    const store = createInMemoryMemoryStore();
    await store.upsert({
      tenant_id: "tenant_demo",
      student_id: "student_001",
      source_id: "student_memory_001",
      source_type: "student_memory",
      summary_text: "student 001 academic summary",
      memory_bucket: "academic",
      privacy_level: "private",
      deployment_scope: "controlled_cloud",
      source_trace: ["conversation:student_001"]
    });

    await expect(
      store.query({
        tenant_id: "tenant_demo",
        requester_role: "student_agent",
        source_type: "student_memory",
        query_text: "academic summary",
        memory_bucket: "academic"
      })
    ).rejects.toThrow("student_memory queries require student_id");
  });

  it("uses the pgvector-compatible 1536 dimension by default", async () => {
    const provider = new DeterministicEmbeddingProvider();
    const store = createInMemoryMemoryStore({ embeddingProvider: provider });
    const record = await store.upsert({
      tenant_id: "tenant_demo",
      student_id: "student_001",
      source_id: "dimension_001",
      source_type: "student_memory",
      summary_text: "dimension compatibility summary",
      memory_bucket: "academic",
      privacy_level: "private",
      deployment_scope: "controlled_cloud",
      source_trace: ["conversation:dimension"]
    });

    expect(provider.dimension).toBe(1536);
    expect(record.embedding).toHaveLength(1536);
  });

  it("keeps tenant and student query boundaries", async () => {
    const store = createInMemoryMemoryStore();
    await store.upsert({
      tenant_id: "tenant_a",
      student_id: "student_a",
      source_id: "a_001",
      source_type: "student_memory",
      summary_text: "A 学生在一次函数上进步。",
      memory_bucket: "academic",
      privacy_level: "private",
      deployment_scope: "controlled_cloud",
      source_trace: ["conversation:a"]
    });
    await store.upsert({
      tenant_id: "tenant_b",
      student_id: "student_b",
      source_id: "b_001",
      source_type: "student_memory",
      summary_text: "B 学生在一次函数上进步。",
      memory_bucket: "academic",
      privacy_level: "private",
      deployment_scope: "controlled_cloud",
      source_trace: ["conversation:b"]
    });

    const results = await store.query({
      tenant_id: "tenant_a",
      student_id: "student_a",
      requester_role: "student_agent",
      query_text: "一次函数",
      memory_bucket: "academic"
    });

    expect(results.map((result) => result.record.tenant_id)).toEqual(["tenant_a"]);
    expect(results.map((result) => result.record.student_id)).toEqual(["student_a"]);
  });
});
