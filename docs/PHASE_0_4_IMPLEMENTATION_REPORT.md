# 阶段 0.4 向量数据库 + 记忆系统基础实施报告

日期：2026-04-22

## 一、执行范围

本轮按 `docs/PHASE_0_4_VECTOR_MEMORY_SPEC.md` 实施阶段 `0.4` 的最小向量记忆基础。

已完成：

- 新增 `@edu-ai/memory-store` workspace package。
- 新增 pgvector DDL 草案 `packages/memory-store/sql/001_pgvector_memory.sql`。
- 新增三张向量表定义：
  - `student_memory_embeddings`
  - `content_embeddings`
  - `conversation_embeddings`
- 新增 `academic / emotional / personal` 记忆桶。
- 新增 `campus_local_only` + `campus_local` 的 emotional bucket 硬约束。
- 新增 HNSW `vector_cosine_ops` 向量索引草案。
- 新增 deterministic embedding provider。
- 新增 in-memory vector store。
- 新增 cosine similarity 召回。
- 新增 teacher_agent 只可召回 academic bucket 的访问约束。
- 新增 content embeddings 不允许绑定 student_id 的约束。
- 新增同 source 增量摘要版本更新。

## 二、非目标确认

本阶段未做：

- 未启动真实 Postgres。
- 未安装或运行 pgvector extension。
- 未接真实 embedding 模型。
- 未做 RAG 质量评测。
- 未做后端 API。
- 未做前端 UI。

当前实现是后端落库前的 SDK contract 和隐私边界验证层。

## 三、核心文件

| 文件 | 作用 |
|---|---|
| `packages/memory-store/sql/001_pgvector_memory.sql` | pgvector DDL 草案 |
| `packages/memory-store/src/types.ts` | 记忆向量类型契约 |
| `packages/memory-store/src/schemas.ts` | Zod 输入 schema |
| `packages/memory-store/src/embedding.ts` | deterministic embedding provider |
| `packages/memory-store/src/privacy.ts` | bucket 写入与查询权限 |
| `packages/memory-store/src/similarity.ts` | cosine similarity |
| `packages/memory-store/src/in-memory-store.ts` | in-memory adapter |
| `packages/memory-store/tests/memory-store.spec.ts` | contract 测试 |

## 四、能力覆盖

| 能力 | 当前状态 |
|---|---|
| 文本 embedding | deterministic embedding 已实现 |
| 学生记忆写入 | `student_memory` 支持 |
| 对话摘要写入 | `conversation` 支持 |
| 内容向量写入 | `content` 支持，且不能绑定 student_id |
| 相似度召回 | cosine similarity 排序 |
| 租户隔离 | query 按 `tenant_id` 过滤 |
| 学生隔离 | query 可按 `student_id` 过滤 |
| 记忆桶隔离 | academic / emotional / personal 支持 |
| 教师访问边界 | teacher_agent 只能查 academic |
| 情绪硬约束 | emotional 必须 campus local |
| 增量摘要 | 同 `source_id` 更新同一记录并递增 version |

## 五、验证结果

### Package 命令

```powershell
pnpm --filter @edu-ai/memory-store typecheck
pnpm --filter @edu-ai/memory-store test
pnpm --filter @edu-ai/memory-store build
```

结果：

- 类型检查通过。
- 1 个测试文件通过。
- 6 条测试通过。
- declaration-only 构建通过。

### 根命令

```powershell
pnpm typecheck
pnpm test
pnpm build
```

结果：

- `pnpm typecheck` 通过，4 个 package 成功。
- `pnpm test` 通过，`shared-types` 108 tests + `llm-gateway` 10 tests + `memory-store` 6 tests。
- `pnpm build` 通过，4 个 package 成功。

### 额外自查

```powershell
Get-ChildItem -Path packages/memory-store/src -Recurse -File | Select-String -Pattern '\bany\b'
```

结果：无输出，`memory-store` 源码未命中 `any`。

DDL 自查确认：

- 三张表均含 `embedding vector(1536)`。
- 三张表均含 `memory_bucket`。
- student / conversation 表均含 emotional campus-local check。
- content 表强制 `student_id is null`。
- 三张表均含 HNSW 向量索引。

## 六、设计取舍

### 1. 先做 in-memory adapter

原因：阶段 `0.4` 目标是定义向量记忆 contract 和隐私边界，不把本轮耦合到本地 Postgres 环境。真实 pgvector 连接将在 `0.5` 后端骨架中落地。

### 2. deterministic embedding 只用于测试

当前 embedding provider 通过 SHA-256 生成稳定向量，保证测试可重复。它不代表真实语义 embedding 质量。

### 3. emotional bucket 代码和 DDL 双重约束

代码层：

- `assertWritableMemory()` 要求 emotional 必须 `campus_local_only` + `campus_local`。
- `teacher_agent` 查询 emotional 会失败。

DDL 层：

- student / conversation embeddings 都有 emotional check constraint。

### 4. content embeddings 不绑定学生

内容向量属于教材/单元，不应绑定具体学生。代码和 DDL 均约束 `content_embeddings.student_id is null`。

## 七、已知观察项

| 观察项 | 影响 | 后续归属 |
|---|---|---|
| 未真实执行 DDL | 无法证明当前机器 pgvector 环境可用 | 0.5 后端骨架 / 数据库环境 |
| deterministic embedding 不代表真实语义质量 | 召回准确率不能作为产品指标 | 0.4.x / 1.2 |
| in-memory store 不持久化 | 进程重启丢失 | 0.5 后端骨架 |
| guardian_agent 当前完全不可查 | 保守策略，避免家长端越界 | 阶段 5 家长 Agent 设计 |
| 未做 RAG 资源评测 | 不能评估教材检索质量 | 阶段 2 / 3 |

## 八、完工清单

| 检查项 | 状态 |
|---|---|
| DDL 三张 pgvector 表 | 通过 |
| SDK 入口 | 通过 |
| 文本写入 | 通过 |
| 相似度召回 | 通过 |
| academic 可召回 | 通过 |
| emotional 隔离 | 通过 |
| emotional 本地硬约束 | 通过 |
| content 向量 | 通过 |
| incremental summary | 通过 |
| package typecheck | 通过 |
| package test | 通过 |
| package build | 通过 |
| root typecheck/test/build | 通过 |
| 报告生成 | 通过 |

## 九、当前结论

阶段 `0.4 向量数据库 + 记忆系统基础` 的最小 SDK 与 DDL 草案已完成本地验证。当前可进入替代独立复审，重点检查：

- DDL 与 TypeScript 字段是否一致。
- emotional bucket 是否真的无法被 teacher_agent 召回。
- emotional 写入是否被 campus-local 硬约束。
- content embeddings 是否不会绑定学生。
- tenant / student 查询边界是否足够。
- in-memory adapter 是否足以作为后端落库前的 contract。

若复审无 P0/P1，可将阶段 `0.4` 定为 8.5，并进入 `0.5 最小后端骨架` Spec。
