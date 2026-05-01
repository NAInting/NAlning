# 阶段 0.4 向量数据库 + 记忆系统基础 Spec

版本：2026-04-22

## 一、目标

建立学生长期记忆和教材内容检索的最小基础能力，为阶段 1 学生 Agent、阶段 2 教材生产管线、阶段 4 教师 Agent 提供统一记忆检索边界。

阶段 `0.4` 的核心目标：

1. 定义 pgvector 记忆表结构。
2. 提供 `@edu-ai/memory-store` SDK 契约。
3. 支持三类向量记录：学生记忆、教材内容、历史对话摘要。
4. 支持 academic / emotional / personal 三桶隔离。
5. 支持相似度召回。
6. 支持增量摘要写入，不要求每次全量重算。
7. 用 in-memory adapter 建立可测试契约，不要求本机真实 Postgres。

## 二、非目标

本阶段不做：

- 不启动真实 Postgres。
- 不安装或运行 pgvector extension。
- 不接真实 embedding 模型。
- 不做 RAG 质量评测。
- 不做后端 API。
- 不做前端 UI。

## 三、核心架构决策

### 1. 记忆默认按桶隔离

记忆桶：

- `academic`：学业记忆，可用于学生 Agent 和教师 Agent 的汇总信号。
- `emotional`：情绪记忆，只允许 campus-local 范围使用，绝不跨到教师 Agent。
- `personal`：个人偏好/兴趣，只可在学生自身体验中使用，默认不跨 Agent。

### 2. 教师 Agent 只能召回 academic

教师 Agent 不允许召回 `emotional` 或 `personal` bucket。

### 3. 情绪 bucket 必须 campus-local

所有 `emotional` bucket 的 vector record 必须满足：

- `privacy_level = "campus_local_only"`
- `deployment_scope = "campus_local"`

### 4. 向量记录只保存摘要，不保存原始对话全文

`conversation_embeddings` 存的是会话摘要，不是原始 turns。

### 5. 0.4 先用 deterministic embedding

本阶段的 embedding provider 是 deterministic mock，用于稳定测试。真实 embedding 模型归入后续阶段。

## 四、目录结构

```text
packages/memory-store/
├── sql/
│   └── 001_pgvector_memory.sql
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── schemas.ts
│   ├── embedding.ts
│   ├── privacy.ts
│   ├── similarity.ts
│   └── in-memory-store.ts
├── tests/
│   └── memory-store.spec.ts
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── vitest.config.ts
└── README.md
```

## 五、pgvector 表

DDL 必须覆盖：

- `student_memory_embeddings`
- `content_embeddings`
- `conversation_embeddings`

共同字段：

- `id`
- `tenant_id`
- `student_id` 可选，内容向量可为空
- `source_id`
- `source_type`
- `summary_text`
- `embedding vector(1536)`
- `memory_bucket`
- `privacy_level`
- `deployment_scope`
- `source_trace`
- `created_at`
- `updated_at`
- `version`

索引：

- HNSW 或 IVFFLAT 向量索引。
- `tenant_id + student_id + memory_bucket` 普通索引。
- `source_id` 普通索引。

## 六、完工检查清单

| 检查项 | 通过标准 |
|---|---|
| DDL | 三张 pgvector 表存在，含隐私桶与索引 |
| SDK 入口 | `createInMemoryMemoryStore()` 可用 |
| 写入 | 文本可 deterministic embedding 并存储 |
| 召回 | 按 cosine similarity 返回排序结果 |
| academic 可召回 | teacher_agent 可召回 academic bucket |
| emotional 隔离 | teacher_agent 召回 emotional 必须失败或返回空 |
| emotional 本地硬约束 | emotional 写入非 campus-local 必须失败 |
| content 向量 | 内容向量可写入和召回 |
| incremental summary | 同一 source 可追加新版本摘要 |
| 类型检查 | `pnpm --filter @edu-ai/memory-store typecheck` 通过 |
| 测试 | `pnpm --filter @edu-ai/memory-store test` 通过 |
| 根构建 | `pnpm build` 通过 |
| 报告 | `docs/PHASE_0_4_IMPLEMENTATION_REPORT.md` 存在 |

## 七、自查重点

- 是否能绕过 bucket 召回 emotional 记忆。
- 是否把原始对话全文写进 `summary_text`。
- cache / query 是否跨 tenant 或跨 student 泄露。
- teacher_agent 是否只能请求 `academic`。
- emotional bucket 是否强制 `campus_local_only`。

## 八、复审重点

请重点审查：

- DDL 是否真的支持 pgvector。
- TypeScript SDK 与 DDL 字段是否一致。
- 隐私桶隔离是否由代码和测试双重约束。
- teacher_agent 是否无法召回 emotional / personal。
- content embeddings 是否不错误绑定 student_id。
- 当前 in-memory adapter 是否足以作为后端实现前的 contract。
