# Phase 1.2 Student Agent Memory Runtime Spec

版本：2026-04-22  
状态：Draft for implementation review  
上游依赖：Phase 0.1 / 0.4 / 0.5 / 0.6、Phase 1.1

## 一、阶段定位

阶段 1.2 的目标是把阶段 0.4 的 `@edu-ai/memory-store` 从“向量记忆基础设施”推进到“Student Agent 可用的三层记忆运行时”。

阶段 0.4 已经解决：

1. 向量记录如何写入和召回。
2. academic / emotional / personal 三桶如何隔离。
3. emotional bucket 必须 campus-local。
4. teacher_agent 只能查询 academic。

阶段 1.2 要解决：

1. 当前对话中，哪些 turn 留在 Working Memory。
2. 会话结束后，如何生成 Episodic Memory 摘要。
3. 摘要如何分入 academic / emotional / personal 三桶。
4. 多次会话后，如何生成 Semantic Memory 快照。
5. 学生如何查看、解释和删除自己的记忆。
6. 教师侧如何只拿到不可逆、脱敏后的信号或摘要。

本阶段不是“让 Agent 更聪明”的花活，而是决定系统是否值得被学生长期信任的地基。

## 二、输入依据

| 来源 | 继承内容 |
|---|---|
| `docs/AGENT_PERSONA.md` | 记忆必须服务成长，不把学生表达变成标签；低置信度不进长期画像 |
| `docs/AGENT_PROTOCOL.md` | 只传结构化信号、情绪 campus-local、教师证据引用不可逆 |
| `docs/SCHEMA.md` | `WorkingMemory`、`EpisodicMemoryEntry`、`StudentMemorySnapshot`、`EmotionBaseline` |
| `docs/PHASE_0_4_VECTOR_MEMORY_SPEC.md` | `@edu-ai/memory-store` 桶隔离和向量召回约束 |
| `packages/shared-types/src/agent/agent-memory.ts` | 记忆实体 TypeScript / Zod contract |
| `packages/memory-store/src/privacy.ts` | runtime 必须复用的 bucket 查询边界 |

## 三、非目标

本阶段不做：

1. 不接真实 LLM 摘要模型，先定义接口和可测试 contract。
2. 不做真实心理风险评估产品。
3. 不把 Red 高危接收人写死，真实接收人属于学校运营决策。
4. 不做教师 Agent 日报生成，那属于阶段 4。
5. 不做家长周报，那属于阶段 5。
6. 不改 shared-types schema，除非实现时发现 P0/P1 contract 缺口。
7. 不启动真实 pgvector，本阶段可继续用 in-memory adapter 做 contract。

## 四、建议落点

阶段 1.2 有三个实现落点选项：

| 选项 | 说明 | 取舍 |
|---|---|---|
| A. `packages/agent-sdk/src/memory-runtime` | 作为所有 Agent 共享运行时能力 | 推荐。Student Agent 先用，后续 Teacher / Guardian 可复用 policy guard |
| B. `apps/backend/src/services/student-memory-runtime` | 只服务当前后端 | 快，但会把 Agent 能力锁死在 backend |
| C. 新包 `packages/student-agent-runtime` | 专门为 Student Agent 建包 | 现在偏早，容易和 agent-sdk 重叠 |

推荐：选项 A。  
理由：记忆运行时属于 Agent 通用能力，但阶段 1.2 只开放 Student Agent 路径；未来教师 Agent 可复用 policy guard 和透明性 view model，但不能复用学生私有桶读取权限。

## 五、核心模块

```text
packages/agent-sdk/src/memory-runtime/
├── types.ts
├── policy.ts
├── working-memory.ts
├── episodic-memory.ts
├── semantic-snapshot.ts
├── deletion.ts
├── transparency.ts
└── index.ts
```

### 5.1 `MemoryPolicyGuard`

职责：

1. 所有写入前检查 bucket、privacy_level、deployment_scope。
2. 所有读取前检查 requester_role、student_id、tenant_id。
3. 阻止 teacher_agent / guardian_agent 访问 emotional / personal。
4. 阻止任何教师可见响应暴露可逆 conversation locator。
5. 阻止低置信度内容进入 Semantic Memory。

### 5.2 `WorkingMemoryManager`

职责：

1. 维护当前会话最近 N 轮，默认 40 轮，最大不得超过 shared-types 的 100 turn schema 上限。
2. 只服务当前会话上下文。
3. 不写入向量库。
4. 不形成长期画像。
5. 会话结束后交给 Episodic pipeline 处理。

### 5.3 `EpisodicMemoryPipeline`

职责：

1. 接收结束后的 `Conversation`。
2. 生成摘要候选，不保存原文。
3. 对摘要候选做 bucket 分类：academic / emotional / personal。
4. 只把符合 policy 的摘要写入 `@edu-ai/memory-store`。
5. 写入后生成 `EpisodicMemoryEntry` metadata。

### 5.4 `MemoryBucketClassifier`

分类规则：

| bucket | 进入条件 | 禁止 |
|---|---|---|
| academic | 知识卡点、误区、题型、学习策略、反思质量 | 不得混入情绪原文或私人生活细节 |
| emotional | 持续强烈挫败、异常波动、高危前兆的抽象摘要 | 不得写入 controlled_cloud，不得传给教师全文 |
| personal | 兴趣、偏好、学生主动表达的学习相关生活线索 | 不得默认给教师或家长使用 |

分类必须保守。无法判断时默认不写长期记忆，或只保留在 Working Memory。

### 5.5 `SemanticSnapshotBuilder`

职责：

1. 按周或配置窗口聚合 academic episodic memory、mastery records、learning events。
2. 生成 `StudentMemorySnapshot`。
3. `snapshot_version` 递增。
4. 记录 `prior_snapshot_id` 和 `change_summary`。
5. `is_viewable_by_student` 默认必须为 true。
6. 只有达到最低置信度的稳定信息才能进入 semantic profile。

建议默认阈值：

| 项 | 默认 |
|---|---|
| semantic update window | 7 天 |
| minimum evidence count | 3 |
| minimum confidence | 0.7 |
| emotional baseline storage | campus-local only |

### 5.6 `MemoryDeletionService`

职责：

1. 接收学生删除或修正请求。
2. 将对应 `EpisodicMemoryEntry.deleted_by_student` 设为 true。
3. 从普通个性化召回中排除该记忆。
4. 删除或废止关联向量记录，或标记为不可用于 personalization。
5. 保留最小必要审计记录。
6. 不允许因为学生删除记忆而降低服务质量或惩罚学生。

注意：法定安全审计记录不属于普通个性化记忆，删除路径必须和治理层规则区分。

### 5.7 `MemoryTransparencyService`

职责：

1. 给学生展示“系统记住了什么”。
2. 解释“为什么记住”和“最近一次如何更新”。
3. 展示删除/修正入口。
4. 隐藏 Agent 内部推理链。
5. 不展示其他学生信息。
6. 不展示教师内部判断链。

学生可见示例：

```json
{
  "memory_id": "mem_001",
  "bucket": "academic",
  "title": "一次函数图像平移仍需练习",
  "why_it_matters": "这会影响你判断 k 和 b 的作用。",
  "last_updated_at": "2026-04-22T10:00:00+08:00",
  "can_delete": true
}
```

## 六、运行时主流程

### 6.1 会话开始

1. 根据 `tenant_id`、`student_id`、`agent_id` 创建或恢复 Working Memory。
2. 从 memory-store 召回学生可用的 academic / personal 记忆。
3. emotional 记忆仅在 campus-local 上下文下可用于安全判断，不进入普通 prompt 背景；底层 `student_agent` 不得直接查询 emotional bucket。
4. 召回结果必须经过 `MemoryPolicyGuard`。

### 6.2 会话中

1. 每轮 turn 追加到 Working Memory。
2. 检测到情绪风险时，只触发本地路由和安全判断。
3. 不在每轮对话后立即更新 Semantic Memory，避免抖动和标签化。
4. 对话中可生成临时学习提示，但不等于长期记忆。

### 6.3 会话结束

1. 触发 EpisodicMemoryPipeline。
2. 将 conversation turns 压缩为若干摘要候选。
3. 每个摘要候选独立分类 bucket。
4. 每个候选分别计算 confidence 和 importance。
5. 低置信度候选丢弃或仅保留为非长期临时观察。
6. 写入 memory-store 的 `summary_text` 只能是摘要，不能包含原文摘录。
7. `source_id` 和 `source_trace` 不得包含 conversation ID、turn ID、turn range 或关键词命中 ID。
8. `source_trace` 只用于内部审计，不暴露给教师日常界面。

### 6.4 周期性快照

1. 每周或指定窗口运行 SemanticSnapshotBuilder。
2. 聚合稳定 academic 证据。
3. personal 只用于学生体验，不进入教师视图。
4. emotional baseline 保持 campus-local only。
5. 生成学生可见 `change_summary`。

### 6.5 学生查看与删除

1. 学生进入透明性页面。
2. MemoryTransparencyService 返回可解释 view model。
3. 学生可发起删除/修正请求。
4. 删除后该记忆不再参与召回和个性化。
5. 系统保留最小必要审计。

## 七、隐私规则

### 7.1 Bucket 可见性矩阵

| requester | academic | emotional | personal |
|---|---|---|---|
| student_agent | 可用 | 不可直接查询；仅 runtime local safety 受控路径可用 | 可用 |
| teacher_agent | 仅脱敏摘要/信号 | 不可用 | 不可用 |
| guardian_agent | 不直接查询 | 不可用 | 不可用 |
| admin | 受限审计 | 受限审计 | 受限审计 |
| system | 后台任务可用，但必须留痕 | campus-local only | 受限 |

### 7.2 禁止写入长期记忆的内容

1. 可直接识别第三方的个人隐私。
2. 学生辱骂、情绪宣泄的原文。
3. 未经证实的心理、人格、家庭判断。
4. 教师或同学的评价性描述。
5. 单轮对话中的低置信度判断。
6. 可提交作业答案全文。

### 7.3 教师证据引用不可逆

教师侧 evidence reference 只能是脱敏 signal ID、聚合窗口 ID 或审计摘要 ID。

禁止：

1. `conversation_id`
2. `turn_id`
3. `source_turn_range`
4. `message_id`
5. `keyword_hit_id`
6. 任何可直接定位到原始对话的字段

## 八、接口草案

以下接口是实现阶段的 TypeScript contract 草案，不代表最终 API。

```ts
interface StudentMemoryRuntime {
  appendTurn(input: AppendTurnInput): Promise<WorkingMemory>;
  endConversation(input: EndConversationInput): Promise<EpisodicMemoryWriteResult>;
  recallForStudent(input: StudentRecallInput): Promise<StudentRecallResult>;
  buildSemanticSnapshot(input: BuildSnapshotInput): Promise<StudentMemorySnapshot>;
  buildTransparencyView(input: TransparencyInput): Promise<MemoryTransparencyView>;
  requestDeletion(input: MemoryDeletionInput): Promise<MemoryDeletionResult>;
}
```

关键约束：

1. `recallForStudent` 必须要求 `student_id`。
2. `endConversation` 不得把原始 turns 写进 `summary_text`。
3. `buildSemanticSnapshot` 必须带 confidence gate。
4. `requestDeletion` 必须让后续 recall 看不到该记忆。
5. 所有写路径必须输出 audit event 或 audit hook。

## 九、测试清单

实现阶段必须至少覆盖以下测试：

| 测试 | 通过标准 |
|---|---|
| Working Memory 截断 | 超过窗口后只保留最近 N 轮 |
| Working Memory 不写向量 | append turn 不触发 memory-store upsert |
| Academic episodic 写入 | 学业摘要写入 academic bucket |
| Emotional campus-local | emotional 摘要非 campus-local 写入失败 |
| Personal 不给教师 | teacher_agent 无法召回 personal |
| Teacher 只见 academic | teacher_agent 只能通过脱敏摘要或信号看到 academic |
| 原文不入 summary_text | 摘要写入前检测禁止原文摘录 |
| 低置信度不进 semantic | confidence < 0.7 不进入 StudentMemorySnapshot |
| 稳定证据不足不进 semantic | evidence_count < 3 或 observation_window_days < 7 不进入 StudentMemorySnapshot |
| snapshot 版本递增 | 新快照引用 prior_snapshot_id |
| 删除后不可召回 | deleted memory 不再出现在 recall / transparency active list，且底层向量 tombstone 后跨 runtime 不再召回 |
| source locator 不可逆 | vector `source_id` / `source_trace` 不含原始 conversation 定位 |
| 学生透明视图 | 返回 title / why_it_matters / last_updated_at / can_delete |
| evidence 不可逆 | teacher-facing evidence 不含 conversation_id / turn_id / range |

## 十、完工指标

阶段 1.2 Spec 定版指标：

1. 本文件覆盖三层记忆、删除权、透明性、隐私边界和测试清单。
2. 与 `docs/AGENT_PERSONA.md` 无冲突。
3. 与 `@edu-ai/memory-store` 0.4 contract 无冲突。
4. 与 `InterAgentSignal` 不传原文原则无冲突。
5. `pnpm run ci` 通过。

阶段 1.2 实现定版指标：

1. `packages/agent-sdk` 不再是占位包，提供 memory runtime。
2. TypeScript 接口和 Zod schema 完整。
3. Runtime 测试覆盖第九节全部检查。
4. `pnpm --filter @edu-ai/agent-sdk typecheck/test/build` 通过。
5. 根目录 `pnpm run ci` 通过。
6. 自查报告和替代复审无 P0/P1。

## 十一、复查重点

后续 Claude 或替代 Codex 冷审必须重点审：

1. emotional bucket 是否可能被普通 prompt 或教师信号读到。
2. personal bucket 是否可能进入教师/家长视图。
3. source_trace / evidence_ref 是否可能变相还原原始对话。
4. 删除记忆后是否仍被向量召回。
5. low confidence 是否被挡在 semantic snapshot 外。
6. Working Memory 是否被错误当成长期画像。
7. 透明性页面是否过度暴露隐私或内部推理链。
