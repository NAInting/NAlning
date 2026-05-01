# Phase 0.1 Implementation Report

## 范围

本次实现覆盖 `DATA_MODEL_SPEC.md` 对阶段 `0.1` 的核心要求：

- 在 `packages/shared-types/` 下生成统一数据模型
- 每个核心实体同时提供 `TypeScript interface + Zod schema`
- 支持测试、种子数据、包级导出
- 让现有前端开始从共享模型包导入类型

## 已完成内容

### 1. 模型模块落地

已按 spec 的核心域完成以下模块：

- `identity`
- `content`
- `learning`
- `agent`
- `governance`
- `communication`

### 2. 关键架构决策已落地

- 事件溯源：`LearningEvent` 作为核心事实实体
- 三层记忆：`WorkingMemory / EpisodicMemoryEntry / StudentMemorySnapshot`
- 三桶隔离：`academic / emotional / personal`
- 情绪基线本地约束：`EmotionBaseline.storage_location = campus_local_only`
- 跨 Agent 泄漏防护：`InterAgentSignalSchema` 禁止原始对话字段穿透

### 3. 验证能力

- `npm run typecheck` 通过
- `npm test` 通过（108 tests）
- 提供 `buildSeedDataset()` 作为 contract 测试样本源

### 4. 前端接入

当前 `edu_ai_frontend_v1` 已通过本地依赖接入：

- `package.json` 增加 `@edu-ai/shared-types`
- `src/types/demo.ts` 开始使用共享模型中的治理/审计/申诉/置信度类型

## 与 Spec 的偏离 / 解释性实现

### 偏离 1：枚举集中在 `src/enums.ts`

**说明**  
Spec 重点强调了实体与 schema，没有强制要求枚举拆分粒度。实现中选择将跨模块复用的枚举统一集中在 `src/enums.ts`。

**原因**  
这样更适合阶段 `0.1` 的共享包定位，后续前后端都能稳定复用，避免多个模块重复声明同一业务字面量。

### 偏离 2：`EmotionBaseline` 放在 `communication/`

**说明**  
Spec 的模块树将 `EmotionBaseline` 放在 `communication/emotion-baseline.ts`，但正文又把它和记忆系统一起提及，语义上有一点跨域。

**最终选择**  
实现采用模块树里的 canonical 位置：`src/communication/emotion-baseline.ts`。

**原因**  
这个实体主要服务于 Agent 间路由与隐私边界判断，而不是单纯的画像展示，因此放在 communication 更稳定。

### 偏离 3：前端接入方式使用本地 `file:` 依赖

**说明**  
当前项目尚未进入阶段 `0.2` 的 monorepo/workspace 改造，因此暂未使用 `pnpm workspace` 方式接入。

**最终选择**  
`edu_ai_frontend_v1/package.json` 使用：

```json
"@edu-ai/shared-types": "file:../packages/shared-types"
```

**原因**  
这样能在不提前做 0.2 的前提下，先完成 0.1 的“共享类型真实接入”目标。

## 本轮未完成但不属于 0.1 阻断项

- 根级 monorepo 结构迁移（属于阶段 `0.2`）
- 后端 CRUD / OpenAPI / CI 流水线（属于后续 0.5 / 0.6）

## 建议的下一步

1. 继续推进阶段 `0.2`，建立 workspace 和 monorepo 根配置
2. 在前端中逐步用共享包替代更多本地重复类型
3. 阶段 `0.5` 建后端时直接以本包为 contract source

## 本轮检查结果

- `shared-types` 安装：通过
- `shared-types` 类型检查：通过
- `shared-types` 测试：通过
- 前端接入：已验证
- `docs/SCHEMA.md`：已补齐
- 后续仍需执行：进入阶段 `0.2` 后切换为 workspace 依赖

## 2026-04-21 补充复核

本轮按项目工程闸门重新复核了阶段 `0.1` 的真实状态，并补齐根目录文档。

### 复核结果

- `packages/shared-types`：`npm run typecheck` 通过
- `packages/shared-types`：`npm test` 通过，108 tests passed
- `packages/shared-types/src`：未发现 `any` 命中
- `edu_ai_frontend_v1`：`npm run typecheck` 通过
- `edu_ai_frontend_v1`：`npm run build` 通过

### 新增文档

- `docs/PROJECT_EXECUTION_PLAYBOOK.md`：项目工程执行总规划
- `docs/REVIEW_AND_SELF_CHECK_PROCESS.md`：Codex 自查与 Claude 交叉复查流程
- `docs/PHASE_0_STATUS_AND_NEXT_STEPS.md`：阶段 0 当前状态与下一步
- `docs/PHASE_0_2_MONOREPO_SPEC.md`：阶段 0.2 Monorepo 结构搭建 Spec
- `docs/SCHEMA.md`：shared-types schema 总览

### 更新后的判断

阶段 `0.1` 已具备交叉复查条件。当前剩余事项不再属于 `0.1` 阻断项，而是进入阶段 `0.2` 的 workspace/monorepo 迁移范围。

## 2026-04-21 0.1.1 隐私契约补丁

替代复查发现两个 P1：

1. 高敏学生数据实体的 `visibility_scope` 覆盖不足。
2. `InterAgentSignal` 的自由文本字段存在语义泄露空间。

本补丁已完成：

- `Conversation` 增加 `visibility_scope`
- `MasteryRecord` 增加 `visibility_scope`
- `MasteryHistory` 增加 `visibility_scope`
- `EpisodicMemoryEntry` 增加 `visibility_scope`
- `StudentMemorySnapshot` 增加 `visibility_scope`
- `EmotionBaseline` 增加 `visibility_scope`
- `InterventionSuggestedPayload` 移除 `rationale_summary` / `suggested_actions`
- 新增 `InterventionReasonCode` / `InterventionActionCode`
- `MilestoneReachedPayload` 移除 `description`，改为 `display_code`
- 新增 `MilestoneDisplayCode`
- 隐私测试增加高敏实体缺失 `visibility_scope` 失败用例
- 隐私测试增加结构化干预信号通过、旧式自由文本信号失败用例
- 轻量复审后补充旧式里程碑 `description` 自由文本字段失败用例

补丁后验证：

- `npm run typecheck` 通过
- `npm test` 通过，108 tests passed

当前判断：两个 P1 与轻量复审 P2 均已修复，阶段 `0.1` 可锁定为 8.5，并进入 `0.2 Monorepo`。
