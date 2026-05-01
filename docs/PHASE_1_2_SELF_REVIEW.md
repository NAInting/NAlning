# Phase 1.2 Memory Runtime Spec Self Review

版本：2026-04-22  
审核对象：`docs/PHASE_1_2_MEMORY_RUNTIME_SPEC.md`

## 一、自查结论

阶段 1.2 已完成 Spec 草案和最小实现。当前实现激活了 `@edu-ai/agent-sdk`，提供 Student Agent 三层记忆运行时的 contract、policy 和 in-memory 测试路径。

当前判断：替代冷审发现的 P1/P2 已修复，定向验证和根目录 `pnpm run ci` 均通过；阶段 1.2 可按 8.5 锁定。

## 二、完工指标核验

| 指标 | 状态 | 证据 |
|---|---|---|
| 三层记忆覆盖 | 通过 | Working / Episodic / Semantic 均有单独章节 |
| 删除权覆盖 | 通过 | `MemoryDeletionService` 与删除流程 |
| 透明性覆盖 | 通过 | `MemoryTransparencyService` 与学生 view model |
| 隐私桶覆盖 | 通过 | academic / emotional / personal 分类和矩阵 |
| emotional campus-local | 通过 | 多处明确 emotional 仅 campus-local |
| 教师不可逆证据 | 通过 | 第 7.3 节禁止 conversation_id / turn_id / range |
| 与 0.4 memory-store 对齐 | 通过 | 复用 bucket、requester_role、student_id 边界 |
| 与 1.1 persona 对齐 | 通过 | 不标签化、低置信度不进长期画像、学生可删除 |
| 实现测试清单 | 通过 | 第九节列出 12 项实现测试 |
| 最小实现 | 通过 | `packages/agent-sdk/src/memory-runtime` |
| 定向验证 | 通过 | `agent-sdk` typecheck / test / build 已通过 |
| 根目录 CI | 通过 | `pnpm run ci` 已通过 |
| 替代冷审 P1 修复 | 通过 | `source_id` 不可逆；删除 tombstone 跨 runtime 生效 |

## 三、治理自查

| 问题 | 判断 |
|---|---|
| 谁能看 academic？ | student_agent 可用；teacher_agent 只能看脱敏摘要/信号 |
| 谁能看 emotional？ | 仅 campus-local 安全判断；`student_agent` 不能直接查 bucket，runtime safety 路径受控查询 |
| 谁能看 personal？ | 默认学生体验内部；教师/家长不能看 |
| 谁能改记忆？ | 学生可请求删除/修正，系统保留最小审计 |
| 是否留痕？ | 写路径和删除路径要求 audit hook，具体实现归实现阶段 |
| 是否可能泄露隐私？ | Spec 禁止教师证据引用包含可逆原始对话定位信息 |

## 四、残留风险

| 风险 | 当前处理 | 是否阻断 Spec |
|---|---|---|
| `source_trace` 内部审计字段可能被误返回给教师 | episodic vector 仅写 `sanitized:*`，教师 evidence 不可逆 | 不阻断，后续 API 仍需字段白名单 |
| Red 高危接收人未定 | 上游 1.1 已列为人工治理决策 | 不阻断技术 Spec |
| 摘要模型未实现 | 本阶段是 Spec，后续可用 stub | 不阻断 |
| 真实 pgvector 未运行 | 0.4 已定义为非目标 | 不阻断 |
| agent-sdk 仍是占位包 | 已解决，当前已有最小 memory runtime | 不阻断 |

## 五、实现自查

已覆盖：

1. Working Memory 只保留最近 N 轮，不写向量库。
2. Episodic Memory 写入前做 raw turn leak 检查。
3. Emotional memory 强制 local policy。
4. Student recall 默认不返回 emotional。
5. Deletion 后过滤 recall / transparency。
6. Deletion 会 tombstone memory-store 底层向量，跨 runtime 不再召回。
7. Semantic snapshot 有 confidence / evidence count / observation window gate 和 emotion baseline student match。
8. Teacher evidence reference 禁止 raw locator。

## 六、替代冷审结论

替代冷审发现：

1. P1：episodic vector `source_id` 可逆定位到原始 conversation。
2. P1：删除状态只在当前 runtime 实例中生效。
3. P2：`student_agent` 对 emotional bucket 的底层访问过宽。
4. P2：semantic snapshot gate 只有 confidence，不足以代表稳定证据。

本轮修复：

1. `source_id` 改为不可逆随机 `episodic-*`。
2. `MemoryStore` 新增 `tombstone()`，query 默认排除已删除向量。
3. `student_agent` 仅可直接查 academic / personal，emotional 只由 runtime local safety 受控路径查询。
4. `BuildSnapshotInput` 新增并强制 `evidence_count >= 3`、`observation_window_days >= 7`。
5. 新增对应测试，`memory-store` 10 tests、`agent-sdk` 10 tests 定向通过。

## 七、下一步建议

阶段 1.2 可锁定。下一步进入阶段 1.3 初二数学知识图谱 Spec。
