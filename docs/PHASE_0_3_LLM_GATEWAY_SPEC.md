# 阶段 0.3 LLM Gateway Spec

版本：2026-04-22

## 一、目标

建立统一的 LLM 调用入口，确保所有后续业务模块不直接调用模型 API，而是通过 `@edu-ai/llm-gateway`。

阶段 `0.3` 的核心目标：

1. 提供统一 `gateway.complete()` 接口。
2. 支持模型路由、隐私路由、成本追踪、缓存、重试/降级、Prompt 版本管理。
3. 用 mock/local adapters 建立可测试契约，不要求接入真实外部模型密钥。
4. 给后续 `student-agent`、`teacher-agent`、`content-pipeline`、`backend` 提供稳定 SDK。

## 二、非目标

本阶段不做：

- 不接真实 Claude / 千帆 / 本地模型 API。
- 不保存真实学生对话。
- 不实现数据库落库。
- 不实现管理 Dashboard UI。
- 不做 streaming。
- 不做向量 embedding。

## 三、核心架构决策

### 1. 所有调用必须走 Gateway

业务代码只允许调用：

```ts
gateway.complete({
  purpose: "student_dialogue",
  messages,
  user_context: { role: "student", student_id: "..." },
  privacy_level: "private",
  model_preference: "fast"
});
```

不得在业务模块内直接使用模型 SDK。

### 2. 隐私优先于模型偏好

如果 `privacy_level = "campus_local_only"`，或输入文本命中高敏关键词，必须路由到本地模型。

即使调用方传入 `model_preference = "deep"`，也不能覆盖隐私路由。

### 3. Prompt 是版本化资产

每次调用必须能记录：

- `prompt_id`
- `prompt_version`
- `purpose`
- `source_trace`

### 4. 成本记录必须按 purpose 聚合

每次调用生成一条 `cost_entry`，至少包含：

- `request_id`
- `purpose`
- `provider`
- `model`
- `input_tokens`
- `output_tokens`
- `estimated_cost_cny`

## 四、目录结构

```text
packages/llm-gateway/
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── schemas.ts
│   ├── gateway.ts
│   ├── router.ts
│   ├── privacy.ts
│   ├── cache.ts
│   ├── cost-ledger.ts
│   ├── prompt-registry.ts
│   └── adapters/
│       └── mock-adapter.ts
├── tests/
│   └── gateway.spec.ts
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── vitest.config.ts
└── README.md
```

## 五、完工检查清单

| 检查项 | 通过标准 |
|---|---|
| 统一入口 | `createLlmGateway().complete()` 可调用 |
| 三类模型模拟 | 至少存在 `claude_mock`、`qianfan_mock`、`campus_local_mock` 三个 adapter |
| 隐私路由 | 高敏关键词或 `campus_local_only` 必须选本地模型 |
| 降级 | 主模型失败时能降级到候选模型 |
| 缓存 | 相同 prompt + message + 路由输入可命中缓存 |
| 成本追踪 | 调用后可按 `purpose` 聚合成本 |
| Prompt 版本 | 调用结果包含 `prompt_id` / `prompt_version` |
| 类型检查 | `pnpm --filter @edu-ai/llm-gateway typecheck` 通过 |
| 测试 | `pnpm --filter @edu-ai/llm-gateway test` 通过 |
| 根构建 | `pnpm build` 通过 |
| 报告 | `docs/PHASE_0_3_IMPLEMENTATION_REPORT.md` 存在 |

## 六、自查重点

- 是否存在绕过 Gateway 的模型调用。
- `campus_local_only` 是否无法被模型偏好覆盖。
- `InterAgentSignal` 或高敏文本是否可能被写入 cost/prompt log。
- cache key 是否包含 privacy/model/purpose，避免跨隐私等级复用。
- 降级是否会从本地模型降级到云模型。

## 七、复审重点

请重点审查：

- 隐私路由是否真正优先于模型偏好。
- 成本记录是否只记录元数据，不记录原文。
- Prompt registry 是否有版本概念。
- 降级策略是否会造成高敏数据外发。
- SDK 边界是否足够简单，后续业务模块是否容易遵守。
