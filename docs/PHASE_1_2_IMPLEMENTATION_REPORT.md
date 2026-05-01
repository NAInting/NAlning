# Phase 1.2 Memory Runtime Implementation Report

日期：2026-04-22  
实现包：`@edu-ai/agent-sdk`

## 一、执行范围

本轮按 `docs/PHASE_1_2_MEMORY_RUNTIME_SPEC.md` 完成阶段 1.2 的最小可用记忆运行时实现。

已完成：

1. 激活 `packages/agent-sdk` workspace package。
2. 新增 `packages/agent-sdk/src/memory-runtime`。
3. 实现 Working Memory 窗口管理。
4. 实现 Episodic Memory 写入管线。
5. 实现 memory bucket policy：
   - academic 可用于普通学习记忆；
   - emotional 自动写入 `campus_local_only` + `campus_local`；
   - personal 默认只用于学生体验；
   - 教师证据引用不可逆。
6. 实现 Semantic Memory 快照 builder：
   - `confidence >= 0.7`；
   - `evidence_count >= 3`；
   - `observation_window_days >= 7`；
   - `is_viewable_by_student = true`；
   - `emotion_baseline.student_id` 必须匹配 snapshot student。
7. 实现学生删除普通记忆后不再参与 recall / transparency，并在 `memory-store` 层 tombstone 向量记录。
8. 实现学生透明性 view model。
9. 新增 Vitest contract 测试。

## 二、核心文件

| 文件 | 作用 |
|---|---|
| `packages/agent-sdk/package.json` | 激活 workspace package |
| `packages/agent-sdk/src/memory-runtime/types.ts` | Runtime contract |
| `packages/agent-sdk/src/memory-runtime/policy.ts` | 隐私、置信度、证据引用 guard |
| `packages/agent-sdk/src/memory-runtime/working-memory.ts` | Working Memory 窗口 |
| `packages/agent-sdk/src/memory-runtime/episodic-memory.ts` | 会话结束摘要写入 |
| `packages/agent-sdk/src/memory-runtime/semantic-snapshot.ts` | Semantic Snapshot builder |
| `packages/agent-sdk/src/memory-runtime/deletion.ts` | 学生删除请求 |
| `packages/agent-sdk/src/memory-runtime/transparency.ts` | 学生透明性视图 |
| `packages/agent-sdk/src/memory-runtime/runtime.ts` | 对外 runtime facade |
| `packages/agent-sdk/tests/memory-runtime.spec.ts` | Contract tests |

## 三、测试覆盖

当前 `agent-sdk` 测试覆盖：

1. Working Memory 超窗截断，且 append turn 不写向量库。
2. academic episodic summary 写入。
3. 原始 turn 文本不得进入 summary。
4. emotional memory 默认不进入普通 recall，只有 local safety 显式请求才返回。
5. `source_id` 和 `source_trace` 不暴露 conversation ID。
6. 删除记忆后不再出现在 personalization recall 和 transparency。
7. 删除后的底层向量 tombstone 跨 runtime 生效。
8. low-confidence semantic snapshot 被拒绝。
9. evidence 不足的 semantic snapshot 被拒绝。
10. emotion baseline student mismatch 被拒绝。
11. teacher evidence reference 禁止 `conversation:` 等可逆定位信息。

## 四、隐私边界落实

| 边界 | 实现 |
|---|---|
| Working Memory 不长期化 | `appendTurn()` 只更新内存窗口，不调用 memory-store |
| 原文不进向量摘要 | `assertNoRawTurnLeak()` 检查 summary 是否包含完整 turn content |
| 向量定位不可逆 | episodic vector `source_id` 使用随机不可逆 ID，`source_trace` 仅写 `sanitized:*` |
| emotional campus-local | `privacyForBucket("emotional")` 强制 local |
| 低置信度不进 semantic | `assertSemanticConfidence()` 阈值 0.7，且 evidence / observation window 达标 |
| 删除权 | `MemoryDeletionService` 标记 entry deleted，并 tombstone 关联向量 |
| 教师证据不可逆 | `assertTeacherEvidenceReference()` 禁止 raw conversation locator |

## 五、替代冷审修复

替代冷审发现两个 P1 和两个 P2，本轮已处理：

| Gap | 修复 |
|---|---|
| P1：episodic vector `source_id` 含 conversation ID | 改为 `episodic-${randomUUID()}`，测试验证不含 `conversation.id` |
| P1：删除状态只在当前 runtime 内生效 | `MemoryStore` 新增 `tombstone()`，query 默认排除 tombstoned vector，测试覆盖跨 runtime 删除 |
| P2：`student_agent` 可直接查 emotional bucket | `memory-store` 禁止 `student_agent` 直接查 emotional，runtime 仅在 local safety 路径用受控 system 查询 |
| P2：semantic snapshot evidence gate 偏软 | 新增 `evidence_count >= 3` 和 `observation_window_days >= 7` gate |

## 六、非目标确认

本轮未做：

1. 未接真实 LLM 摘要模型。
2. 未接真实 pgvector。
3. 未做 Teacher Agent 日报。
4. 未做家长视图。
5. 未设计 Red 高危接收人。
6. 未把 memory runtime 接入 backend API。

## 七、验证命令

已通过：

```powershell
pnpm --filter @edu-ai/agent-sdk typecheck
pnpm --filter @edu-ai/agent-sdk test
pnpm --filter @edu-ai/agent-sdk build
```

替代冷审修复后已通过：

```powershell
pnpm --filter @edu-ai/memory-store typecheck
pnpm --filter @edu-ai/memory-store test
pnpm --filter @edu-ai/agent-sdk typecheck
pnpm --filter @edu-ai/agent-sdk test
```

根目录 CI 已通过：

```powershell
pnpm run ci
```

执行结果：

- `pnpm lint` 通过，6 个 package。
- `pnpm typecheck` 通过，6 个 package。
- `pnpm test` 通过，包含 `agent-sdk` 10 tests。
- `pnpm e2e` 通过，2 tests。
- `pnpm build` 通过，6 个 package。

## 八、已知观察项

| 观察项 | 影响 | 后续归属 |
|---|---|---|
| 摘要候选当前由调用方传入 | 暂无真实 LLM summarizer | 1.5 / 1.6 接 LLM Gateway |
| `source_conversation_id` 仍存在于内部 metadata | 内部审计需要；不得返回教师日常界面 | 1.2 冷审 / 后续 API |
| 真实数据库 tombstone 尚未接入 | 当前已在 memory-store contract 层定义，真实持久化归 backend/Prisma 实现 | 0.5 后端持久化后续增强 |
| Transparency 当前展示所有未删除 entry | 后续需要更细学生文案和敏感展示策略 | 1.7 学生端 UI |

## 九、当前判断

阶段 1.2 已完成替代冷审 P1/P2 修复，定向类型检查与测试通过，根目录 `pnpm run ci` 已再次通过。当前可按 8.5 锁定并进入阶段 1.3。
