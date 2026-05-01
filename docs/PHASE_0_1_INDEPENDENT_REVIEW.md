# 阶段 0.1 独立替代复查报告

版本：2026-04-21  
复查方式：Codex 主线程证据审计 + 独立 Codex 子代理冷读复审  
适用场景：Claude Code 暂不可用时的 Gate E 替代流程

## 一、复查范围

本轮复查覆盖：

- `docs/PROJECT_EXECUTION_PLAYBOOK.md`
- `docs/REVIEW_AND_SELF_CHECK_PROCESS.md`
- `docs/PHASE_0_STATUS_AND_NEXT_STEPS.md`
- `docs/PHASE_0_2_MONOREPO_SPEC.md`
- `docs/SCHEMA.md`
- `packages/shared-types`
- `课程设计/_visual_boards/DATA_MODEL_SPEC.md`

重点审查：

1. 新增工程文档是否忠实于总体项目规划。
2. `packages/shared-types` 是否满足阶段 `0.1` 关键要求。
3. 隐私字段可见性约束是否足够。
4. `InterAgentSignal` 是否可能泄露原始对话内容。
5. 事件溯源与三层记忆是否正确落地。
6. 阶段 `0.2` Monorepo Spec 是否可执行。

## 二、验证命令

已执行：

```powershell
cd packages/shared-types
npm run typecheck
npm test
```

结果：

- TypeScript 类型检查通过。
- Vitest 3 个测试文件通过。
- 104 条测试通过。

已执行：

```powershell
Get-ChildItem -Path .\packages\shared-types\src -Recurse -File |
  Select-String -Pattern '\bany\b'
```

结果：

- 无输出，源码未命中 `any`。

已执行：

```powershell
cd edu_ai_frontend_v1
npm run typecheck
npm run build
```

结果：

- `vue-tsc --noEmit` 通过。
- `vite build` 通过。

## 三、通过项

| 维度 | 结论 |
|---|---|
| 工程文档与总体规划 | 基本一致，五层架构、十阶段依赖、阶段 0 顺序均已覆盖 |
| shared-types 模块 | 覆盖 identity、content、learning、agent、governance、communication |
| TypeScript + Zod | 核心实体均有接口与 schema |
| 事件溯源 | `LearningEvent` 为事实源，`MasteryRecord`、`StudentMemorySnapshot` 被定位为物化视图 |
| EmotionBaseline | `storage_location` 被 schema 强制为 `PrivacyLevel.CAMPUS_LOCAL_ONLY` |
| 三层记忆 | Working Memory、Episodic Memory、StudentMemorySnapshot 已落地 |
| 三桶隔离 | `MemoryPrivacyBucket` 覆盖 academic、emotional、personal |
| InterAgentSignal 字段名防泄露 | schema 禁止 `content`、`conversation_text`、`raw_text`、`transcript` 等字段名穿透 |
| 0.2 Spec | 迁移目标、非目标、目录结构、验证命令、回滚策略清楚 |

## 四、P1 Gap

### P1-1：用户数据实体的 `visibility_scope` 覆盖不足

`DATA_MODEL_SPEC.md` 的全局规则要求所有涉及用户数据的实体声明 `visibility_scope`。当前代码中只有 `Student` 和 `LearningEvent` 显式包含该字段。

已确认存在用户数据但缺少 `visibility_scope` 的关键实体：

| 实体 | 当前替代字段 | 风险 |
|---|---|---|
| `Conversation` | `privacy_level` | 有粗粒度隐私等级，但缺字段级可见性和角色排除规则 |
| `EpisodicMemoryEntry` | `privacy_bucket` | 有 academic/emotional/personal 分桶，但缺角色可见性 |
| `StudentMemorySnapshot` | `is_viewable_by_student` | 只能表达学生是否可见，不能表达教师/家长/管理员边界 |
| `EmotionBaseline` | `storage_location` | 能保证本地存储，但不能表达谁可读取摘要或状态 |
| `MasteryRecord` | `is_visible_to_student` | 能表达学生是否可见，但不能表达教师/家长字段级边界 |
| `MasteryHistory` | 无 | 历史趋势是学生数据，后续教师/学生端都会读取 |

影响：

- 后续教师端、家长端、Agent 间通讯和后端 API 难以统一按 `visibility_scope` 做字段级裁决。
- 当前代码满足部分具体实体示例，但没有完全满足全局隐私约束。

建议修复：

1. 做 `0.1.1 隐私契约补丁`。
2. 给上述实体增加 `visibility_scope: VisibilityScope`。
3. 更新 Zod schema、seed 数据和测试。
4. 增加测试：高敏实体缺少 `visibility_scope` 时必须 parse 失败。

### P1-2：`InterAgentSignal` 自由文本字段仍有语义泄露空间

当前 `InterAgentSignalSchema` 能拦截危险字段名，例如：

```text
content
conversation_text
conversation_excerpt
raw_text
full_transcript
transcript
student_response
agent_response
```

这能防止“字段名泄露”，但不能完全防止“把原始对话塞进允许的 summary 字段”。

存在风险的字段：

| Payload | 字段 | 风险 |
|---|---|---|
| `InterventionSuggestedPayload` | `rationale_summary` | 可能被写入学生原话或对话摘录 |
| `InterventionSuggestedPayload` | `suggested_actions` | 可能被写入带原始内容的行动建议 |
| `MilestoneReachedPayload` | `description` | 可能被写入学生原始表达 |

影响：

- schema 层无法保证 Agent 间“只传信号，不传内容”。
- 后续教师日报可能在字段名合规的情况下泄露学生原始对话。

建议修复：

1. 将自由文本字段改为更结构化的抽象字段，例如 `reason_codes`、`evidence_signal_ids`、`suggested_action_codes`。
2. 如保留文本字段，必须命名为 `abstract_*`，并增加更严格的隐私过滤测试。
3. `PrivacyFilterRule` 后续必须具备语义过滤能力，但 `0.1` 至少应收紧类型契约。

## 五、P2 Gap

### P2-1：AI 生成内容口径需要统一

总体规划原话提到 AI 生成内容必须有 `confidence_score` 和 `source_trace`。`DATA_MODEL_SPEC.md` 和当前实现采用的是 `AIGeneratedField`：

- `confidence`
- `model_version`
- `prompt_version`
- `generated_at`
- `human_reviewed`
- `reviewer_id`

当前实现可视为一种 source trace 包装，但命名与总体规划不同。后续进入 `0.3 LLM Gateway` 前应统一口径，避免 Gateway、Prompt 版本管理和 API 输出再次漂移。

### P2-2：数据库索引仍停留在文档层

`0.1` 是类型包，不需要真实 DDL。但事件溯源的索引设计进入 `0.5` 前必须落成迁移脚本，尤其是：

- `LearningEvent(student_id, occurred_at)`
- `LearningEvent(event_type, occurred_at)`
- `LearningEvent(knowledge_node_id, occurred_at)`
- `InterAgentSignal(source_student_id, signal_type, created_at)`

## 六、已顺手修复

本轮已修复文档口径：

- `docs/REVIEW_AND_SELF_CHECK_PROCESS.md` 中 AI 生成内容规则已从 `confidence_score/source_trace` 改为 `AIGeneratedField` 溯源包装。
- `docs/PROJECT_EXECUTION_PLAYBOOK.md` 与 `docs/REVIEW_AND_SELF_CHECK_PROCESS.md` 已增加 Claude 不可用时的替代复审流程。

## 七、评分

| 对象 | 评分 | 判定 |
|---|---:|---|
| 工程规划文档 | 8.5 | 已补 Claude fallback，可作为阶段流程基线 |
| `shared-types` 代码实现 | 8.0 | 类型/schema/测试扎实，但有 2 个 P1 |
| 阶段 0.1 综合 | 8.0 | 不建议直接锁定 8.5 |

## 八、最终结论

当前阶段 `0.1` 无 P0，工程基础扎实，验证通过。但由于 `visibility_scope` 覆盖不足和 `InterAgentSignal` 自由文本泄露风险仍存在，不建议直接定版为 8.5。

建议下一步不是进入 `0.2`，而是先做一个小型 `0.1.1 隐私契约补丁`：

1. 补齐高敏用户数据实体的 `visibility_scope`。
2. 收紧 `InterAgentSignal` payload 的自由文本字段。
3. 更新 seed 数据与测试。
4. 重新运行 `shared-types` typecheck/test 和前端 typecheck/build。

完成后再进行轻量替代复审，若无 P0/P1，即可进入 `0.2 Monorepo`。

## 九、0.1.1 隐私契约补丁修复确认

修复时间：2026-04-21

### P1-1 修复：`visibility_scope` 覆盖不足

已给以下高敏学生数据实体补齐 `visibility_scope`：

- `Conversation`
- `MasteryRecord`
- `MasteryHistory`
- `EpisodicMemoryEntry`
- `StudentMemorySnapshot`
- `EmotionBaseline`

同步更新：

- TypeScript interface
- Zod schema
- `buildSeedDataset()` 种子数据
- `privacy.spec.ts` 缺失 `visibility_scope` 失败测试

新增测试：高敏实体删除 `visibility_scope` 后，schema parse 必须失败。

### P1-2 修复：`InterAgentSignal` 自由文本泄露空间

已收紧干预与里程碑信号 payload：

- `InterventionSuggestedPayload.rationale_summary` 已移除。
- `InterventionSuggestedPayload.suggested_actions` 已移除。
- 新增 `InterventionReasonCode`。
- 新增 `InterventionActionCode`。
- `MilestoneReachedPayload.description` 已替换为 `display_code`。
- 新增 `MilestoneDisplayCode`。
- 黑名单补充 `rationale_summary`、`suggested_actions`、`description`。

新增测试：

- 结构化干预信号可通过。
- 旧式自由文本干预字段必须失败。

### 修复后验证

```powershell
cd packages/shared-types
npm run typecheck
npm test
```

结果：

- TypeScript 类型检查通过。
- 3 个测试文件通过。
- 108 条测试通过。

### 修复后评分

| 对象 | 修复前 | 修复后 | 判定 |
|---|---:|---:|---|
| 工程规划文档 | 8.5 | 8.5 | 已具备替代复审流程 |
| `shared-types` 代码实现 | 8.0 | 8.5 | 两个 P1 已修复 |
| 阶段 0.1 综合 | 8.0 | 8.5 | 可进入轻量复审与 0.2 准备 |

### 更新后的结论

阶段 `0.1` 的替代复查 P1 已完成修复。建议再跑一轮轻量冷读复审；若无新增 P0/P1，可将阶段 `0.1` 锁定为 8.5，并进入 `0.2 Monorepo`。

## 十、轻量复审 P2 补丁确认

轻量复审确认两个 P1 均已关闭，并提出一个非阻断 P2：`privacy.spec.ts` 缺少对旧式 `MilestoneReachedPayload.description` 自由文本字段的单独回归测试。

已补充测试：

- `rejects legacy free-text milestone signal descriptions`
- 验证里程碑信号必须使用 `display_code`，不能重新带入 `description` 自由文本。

补丁后验证：

- `npm run typecheck` 通过。
- `npm test` 通过，108 条测试通过。

最终判断：阶段 `0.1` 的 P1 与已知 P2 均已收口，可锁定为 8.5，并进入 `0.2 Monorepo` 准备。
