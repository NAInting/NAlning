# Phase 1.2 Independent Review

日期：2026-04-22  
审核方式：Codex 主线程 + 独立子代理冷读复审  
审核对象：`packages/agent-sdk/src/memory-runtime`、`packages/memory-store/src`、Phase 1.2 文档

## 一、冷审结论

替代冷审最初不建议 8.5 定版，原因是发现 2 个 P1 和 2 个 P2。

| 等级 | 问题 | 风险 |
|---|---|---|
| P1 | episodic vector `source_id` 拼入 `conversation.id` | recall 返回 `VectorSearchResult` 时可暴露原始对话定位 |
| P1 | 删除只存在于当前 runtime 内存集合 | 换 runtime 实例后，已删除向量可能重新参与 recall |
| P2 | `student_agent` 可直接查询 emotional bucket | 绕过 runtime 包装层时，底层访问边界偏宽 |
| P2 | semantic snapshot 只有 confidence gate | 不足以代表“周级稳定画像” |

## 二、修复记录

| 问题 | 修复 |
|---|---|
| `source_id` 可逆 | `EpisodicMemoryPipeline` 改为写入不可逆 `episodic-${randomUUID()}`，`source_trace` 保持 `sanitized:*` |
| 删除不持久 | `MemoryStore` 新增 `tombstone()`，`InMemoryMemoryStore.query()` 默认排除 `deleted_at` 记录 |
| emotional 底层访问过宽 | `canRequesterAccessBucket("student_agent", "emotional")` 改为拒绝；runtime local safety 路径用受控 system 查询 |
| semantic gate 偏软 | `BuildSnapshotInput` 增加 `evidence_count` 和 `observation_window_days`，分别要求至少 3 条证据和 7 天观察窗口 |

## 三、补充测试

新增或强化的测试：

1. episodic vector `source_id` 不包含 `conversation.id`。
2. `source_trace` 仅包含 `sanitized:*`。
3. 删除后底层 vector 存在 `deleted_at`。
4. 换一个 runtime 实例后，已删除 vector 仍不会被 recall。
5. `student_agent` 直接查询 emotional bucket 被拒绝。
6. evidence 不足的 semantic snapshot 被拒绝。

## 四、验证命令

已通过：

```powershell
pnpm --filter @edu-ai/memory-store typecheck
pnpm --filter @edu-ai/memory-store test
pnpm --filter @edu-ai/agent-sdk typecheck
pnpm --filter @edu-ai/agent-sdk test
pnpm run ci
```

## 五、当前判定

替代冷审发现的 P1/P2 已修复，根目录 CI 全绿。Phase 1.2 可按 8.5 锁定，并进入 Phase 1.3 初二数学知识图谱。
