# Phase 1.8 Implementation Report

## 1. 交付摘要

Phase 1.8 已完成第一块自动化回归骨架：`frontend-user` 现在有一个独立的 `student-agent-runtime` 薄桥和 6 条学生 Agent 行为回归测试。

这让后续真实对话可以持续沉淀为自动化测试，而不是停留在人工复盘文档里。

## 2. 文件变更

新增：

- `apps/frontend-user/src/student-agent-runtime.ts`
- `apps/frontend-user/src/student-agent-runtime.spec.ts`
- `docs/PHASE_1_8_INTERNAL_TESTING_SPEC.md`
- `docs/PHASE_1_8_IMPLEMENTATION_REPORT.md`
- `docs/PHASE_1_8_SELF_REVIEW.md`

更新：

- `apps/frontend-user/package.json`
- `apps/frontend-user/src/App.vue`

## 3. 关键实现

### 3.1 Runtime bridge

`buildStudentAgentTurn()` 负责把学生输入转换为 UI 安全结果：

- `route_selected`
- `mode`
- `answer_policy`
- `assistant_message`
- `risk_level`
- `should_pause_academic_task`
- `signal_ready_for_backend`

它刻意不返回：

- `keyword_hits`
- signal payload
- raw prompt
- reasoning chain
- conversation locator

### 3.2 回归用例

当前 6 条用例覆盖：

- 普通导师问题保持 `controlled_cloud` + `socratic_prompt`。
- 答疑请求使用 `clear_explanation_with_check`。
- 抄答案请求使用 `boundary_refusal_with_alternative`。
- 挫败请求进入 `campus_local` 且不排队跨 Agent 信号。
- 黄色风险进入 `campus_local`，暂停学业任务，只暴露抽象 signal readiness。
- 红色风险进入 `campus_local`，只暴露抽象 signal readiness，不暴露触发语。

### 3.3 意外发现与修复

回归测试首次覆盖黄/红路径时发现：`privacy-filter` 生成的 `InterAgentSignal` 使用了非 UUID demo id，导致 shared-types schema 校验失败。

修复：

- `student-agent-runtime.ts` 的 demo id 改为 schema 合规 UUID。
- 保持前端仍不发送真实信号。

## 4. 验证记录

已执行：

```powershell
pnpm install
pnpm --filter @edu-ai/frontend-user typecheck
pnpm --filter @edu-ai/frontend-user test
pnpm --filter @edu-ai/frontend-user build
pnpm run ci
```

结果：

- `frontend-user` typecheck 通过。
- `frontend-user` 6 条测试通过。
- `frontend-user` build 通过。
- 根级 CI 通过。

## 5. 偏离计划说明

阶段 1.8 原计划中“100+ 条真实对话回归集”需要真实内测数据，本次不能也不应伪造。

本次交付的是承接真实语料的自动化骨架，属于 Phase 1.8 的工程前置条件。

## 6. 下一步建议

1. 建立 `content/regression/student-agent/` 脱敏语料目录。
2. 定义真实对话转回归用例的模板。
3. 将前端 runtime bridge 迁移到后端 Student Agent session API。
4. 增加教师审阅标注字段。
5. 当真实语料达到 30/60/100 条时做三次阶段复核。

