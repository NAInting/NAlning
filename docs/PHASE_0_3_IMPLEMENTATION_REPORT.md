# 阶段 0.3 LLM Gateway 实施报告

日期：2026-04-22

## 一、执行范围

本轮按 `docs/PHASE_0_3_LLM_GATEWAY_SPEC.md` 实施阶段 `0.3` 的最小可用 LLM Gateway。

已完成：

- 新增 `@edu-ai/llm-gateway` workspace package。
- 新增统一入口 `createLlmGateway().complete()`。
- 新增 mock adapter 机制，当前包含 Claude / 千帆 / Campus Local 三类模拟模型。
- 新增隐私优先路由。
- 新增敏感关键词检测。
- 新增云模型失败后的安全降级。
- 新增 campus-local 路由禁止云端降级测试。
- 新增 adapter deployment 校验，防止自定义 adapter 将本地模型槽位误接到云端。
- 新增 in-memory completion cache。
- campus-local 路由默认不进入 completion cache。
- 新增 in-memory cost ledger，并支持按 `purpose` 聚合。
- 新增 prompt registry，支持 `prompt_id` / `prompt_version` / `source_trace`，并在 response / cost entry 中回传追溯字段。
- 新增 LLM Gateway 类型、Zod request schema、测试与 README。

## 二、非目标确认

本阶段未做：

- 未接真实 Claude / 千帆 / 本地模型 API。
- 未引入外部模型 SDK。
- 未保存真实学生对话。
- 未做数据库落库。
- 未做 Dashboard UI。
- 未做 streaming。
- 未做 embedding。

这些能力分别归入后续 `0.3.x`、`0.4`、`0.5` 或阶段 1。

## 三、核心文件

| 文件 | 作用 |
|---|---|
| `packages/llm-gateway/src/types.ts` | Gateway SDK 类型契约 |
| `packages/llm-gateway/src/schemas.ts` | Zod request schema |
| `packages/llm-gateway/src/gateway.ts` | `complete()` 主流程 |
| `packages/llm-gateway/src/privacy.ts` | 敏感关键词与隐私路由 |
| `packages/llm-gateway/src/router.ts` | 模型路由策略 |
| `packages/llm-gateway/src/adapters/mock-adapter.ts` | 三类 mock 模型 |
| `packages/llm-gateway/src/cache.ts` | 内存缓存 |
| `packages/llm-gateway/src/cost-ledger.ts` | 成本记录与 purpose 聚合 |
| `packages/llm-gateway/src/prompt-registry.ts` | Prompt 版本注册 |
| `packages/llm-gateway/tests/gateway.spec.ts` | Gateway contract 测试 |

## 四、能力覆盖

| 能力 | 当前状态 |
|---|---|
| 统一入口 | `createLlmGateway().complete()` 已实现 |
| 三类模型模拟 | `claude_mock` / `qianfan_mock` / `campus_local_mock` 已实现 |
| 隐私路由 | `campus_local_only` 强制本地模型 |
| 敏感关键词路由 | 命中高敏关键词强制本地模型 |
| 模型偏好 | `fast` 默认千帆 mock，`deep` / content generation 默认 Claude mock |
| 降级 | 云模型主路由失败时可降级到同为云端的候选模型 |
| 安全降级边界 | campus-local 路由失败时不会降级到云端 |
| Adapter 部署校验 | adapter 的 `deployment` 必须匹配路由期望 |
| 缓存 | controlled-cloud 相同 prompt + message + route 输入可命中 cache；campus-local 默认不缓存 |
| 成本追踪 | cost entry 不记录原文，可按 `purpose` 聚合 |
| Prompt 版本 | response / cost entry 返回 `prompt_id`、`prompt_version`、`prompt_source_trace` |

## 五、验证结果

### Filter 命令

```powershell
pnpm --filter @edu-ai/llm-gateway typecheck
pnpm --filter @edu-ai/llm-gateway test
pnpm --filter @edu-ai/llm-gateway build
```

结果：

- 类型检查通过。
- 1 个测试文件通过。
- 10 条测试通过。
- declaration-only 构建通过。

### 根命令

```powershell
pnpm typecheck
pnpm test
pnpm build
pnpm lint
```

结果：

- `pnpm typecheck` 通过，3 个 package 成功。
- `pnpm test` 通过，`shared-types` 108 tests + `llm-gateway` 10 tests。
- `pnpm build` 通过，3 个 package 成功。
- `pnpm lint` 通过，但当前仍是占位 lint。

## 六、设计取舍

### 1. 先用 mock adapter，不接真实模型

原因：阶段 `0.3` 的首要目标是统一调用边界和隐私路由契约，而不是外部 API 接入。真实模型 SDK 会引入密钥、网络、成本和供应商差异，不适合作为地基阶段的第一步。

### 2. 成本账本只记录元数据

`CostEntry` 只记录：

- `request_id`
- `purpose`
- `provider`
- `model`
- `route_selected`
- `prompt_id`
- `prompt_version`
- `prompt_source_trace`
- token 与费用估算
- `cache_hit`
- `created_at`

不记录 prompt 原文、学生消息、模型回复全文。

### 3. Cache key 使用哈希，且 campus-local 不缓存

缓存内部使用 SHA-256 哈希 key，不暴露原始消息文本。当前缓存仍为内存态，只用于 SDK contract 测试。为了避免高敏本地会话响应被复用，`campus_local` 路由默认绕过 completion cache。

### 4. Prompt registry 先内存化

当前 prompt 版本固定在代码中，并带 `source_trace`。后续接入真实 Prompt 版本管理时，应迁移到文件化或数据库化资产。

## 七、已知观察项

| 观察项 | 影响 | 后续归属 |
|---|---|---|
| 未接真实模型 API | 不能用于生产调用 | 0.3.x |
| 未做真实 tokenization | 成本为估算值 | 0.3.x / 0.5 |
| 敏感关键词规则仍是本地静态数组 | 覆盖面有限 | 1.6 隐私与情绪路由 |
| cache / cost / prompt registry 均为内存态 | 进程重启后丢失 | 0.5 后端骨架 |
| `pnpm lint` 仍是占位脚本 | 不代表真实 ESLint 门禁 | 0.6 测试与 CI |

## 八、完工清单

| 检查项 | 状态 |
|---|---|
| 统一入口 | 通过 |
| 三类模型模拟 | 通过 |
| 隐私路由 | 通过 |
| 敏感关键词路由 | 通过 |
| 云模型降级 | 通过 |
| campus-local 不外降 | 通过 |
| adapter deployment mismatch 拒绝 | 通过 |
| controlled-cloud 缓存 | 通过 |
| campus-local 不缓存 | 通过 |
| 成本追踪 | 通过 |
| Prompt 版本 | 通过 |
| package typecheck | 通过 |
| package test | 通过 |
| package build | 通过 |
| root typecheck/test/build | 通过 |
| 报告生成 | 通过 |

## 九、当前结论

阶段 `0.3 LLM Gateway` 的最小可用 SDK 已完成本地验证。替代独立复审发现 1 个 P1 和 1 个 P2：

- P1：自定义 adapter deployment mismatch 可能绕过 campus-local 路由。已修复并补回归测试。
- P2：单次调用元数据缺少 `source_trace`。已补入 response 与 cost entry。

修复后验证：

- `pnpm --filter @edu-ai/llm-gateway typecheck` 通过。
- `pnpm --filter @edu-ai/llm-gateway test` 通过，10 tests passed。
- `pnpm typecheck` 通过。
- `pnpm test` 通过。
- `pnpm build` 通过。

当前仍建议后续 Claude 恢复后补一轮外部复审，重点检查：

- 隐私路由是否真正优先于模型偏好。
- campus-local 是否不会降级到云模型。
- 成本记录是否不含原文。
- Prompt registry 是否足够版本化。
- SDK 边界是否足够简单，能阻止业务模块散落模型调用。

本地主线判断：已知 P1/P2 均已收口，可将阶段 `0.3` 定为 8.5，并进入 `0.4 向量数据库 + 记忆系统基础` Spec。
