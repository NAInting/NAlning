# `@edu-ai/shared-types`

阶段 `0.1` 的统一数据模型包。这个包为前端、后端、内容生产管线、治理层和 Agent 运行时提供同一套类型与 schema 基础。

## 目标

- 用一套 `TypeScript interface + Zod schema` 描述系统核心实体
- 把隐私、可见性、置信度、事件溯源这些底层约束前置到模型层
- 为后续 `backend / llm-gateway / content-pipeline / frontend-*` 提供共享契约

## 目录

```text
packages/shared-types/
├── src/
│   ├── identity/
│   ├── content/
│   ├── learning/
│   ├── agent/
│   ├── governance/
│   ├── communication/
│   ├── testing/
│   ├── base.ts
│   ├── enums.ts
│   └── index.ts
├── tests/
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

## 核心设计

### 1. 事件溯源优先

`LearningEvent` 是学习运行时的核心事实表。`MasteryRecord`、`MasteryHistory`、`StudentMemorySnapshot` 等实体在设计上都可视为事件派生出来的物化视图。

### 2. 三层记忆

- `WorkingMemory`：当前会话上下文
- `EpisodicMemoryEntry`：历史情节摘要
- `StudentMemorySnapshot`：稳定语义画像

其中情节记忆按 `academic | emotional | personal` 三桶隔离。

### 3. 隐私硬约束

- 所有涉及可见性的实体使用 `visibility_scope`
- `EmotionBaseline.storage_location` 被强制约束为 `campus_local_only`
- `InterAgentSignalSchema` 内置对“原始对话内容泄漏”的校验，并将干预建议收紧为结构化 reason/action codes

### 4. AI 生成字段可追溯

对需要标记 AI 生成来源的字段，统一使用 `AIGeneratedField<T>`，显式携带：

- `confidence`
- `model_version`
- `prompt_version`
- `generated_at`
- `human_reviewed`

## 快速使用

```ts
import {
  StudentSchema,
  LearningEventSchema,
  InterAgentSignalSchema
} from "@edu-ai/shared-types";

const student = StudentSchema.parse(input);
const event = LearningEventSchema.parse(eventPayload);
const signal = InterAgentSignalSchema.parse(signalPayload);
```

## 开发命令

```bash
npm install
npm run typecheck
npm test
```

## 当前覆盖

- 身份类：`User / Student / Teacher / Guardian / Admin / Class / School`
- 关系类：`TeacherStudentBinding / GuardianStudentBinding`
- 内容类：`Subject / Unit / KnowledgeNode / LearningPath / Scenario / DialogueScript / Assessment`
- 学习记录类：`LearningEvent / Conversation / MasteryRecord / MasteryHistory`
- Agent 类：`AgentProfile / WorkingMemory / EpisodicMemoryEntry / StudentMemorySnapshot`
- 治理类：`ConsentRecord / AuditLogEntry / AppealTicket / ConfidenceScore / AccessScope`
- 通讯类：`InterAgentSignal / PrivacyFilterRule / EmotionBaseline`

## 测试

当前包含三类测试：

- `schemas.spec.ts`：schema 有效样本/无效样本校验
- `relationships.spec.ts`：关系约束与跨实体一致性检查
- `privacy.spec.ts`：隐私与 signal 泄漏防护校验

## 种子数据

`src/testing/seed-generator.ts` 提供 `buildSeedDataset()`，用于：

- schema 回归测试
- 前后端联调初期的稳定样本
- 后续阶段的 demo / contract 测试

## 与当前前端的接入

当前 `edu_ai_frontend_v1` 已通过本地 `file:` 依赖接入本包，并在 `src/types/demo.ts` 中开始用共享模型类型替代本地重复定义。

阶段 `0.2` 完成 monorepo 迁移后，这个接入方式会自然演化成 workspace 依赖。
