# Phase 1.8 Internal Testing Spec

## 1. 阶段定位

Phase 1.8 的长期目标是把真实学生、种子老师和团队内部测试产生的对话沉淀为回归测试集，防止 Student Agent 在迭代中出现人格漂移、隐私边界倒退、学科错误或代写风险。

本次工程切片先交付自动化回归骨架，不伪造“100+ 真实对话”指标。

## 2. 本次切片范围

本次只覆盖第一批合成高风险用例：

- 普通导师式概念问题。
- 答疑模式解释请求。
- 可提交答案/抄答案请求。
- 挫败但未升级的本地处理请求。
- 黄色情绪风险。
- 红色安全风险。

## 3. 回归测试原则

- 回归用例必须结构化，不只存自然语言聊天记录。
- 每条用例必须验证至少一个产品或治理约束。
- 红/黄风险用例不得在测试结果对象中暴露触发原文。
- 真实对话进入回归集前必须脱敏。
- 测试应尽量命中共享策略包，而不是只测试 UI 字符串。

## 4. 工程落点

- `apps/frontend-user/src/student-agent-runtime.ts`
- `apps/frontend-user/src/student-agent-runtime.spec.ts`

`student-agent-runtime.ts` 是 UI 与前序策略包之间的薄桥：

- 调用 `@edu-ai/agent-sdk/dialogue-modes`。
- 调用 `@edu-ai/privacy-filter/student-emotion-router`。
- 返回 UI 可消费的安全摘要。
- 不返回 `keyword_hits`。
- 不返回 signal payload。

## 5. 完工指标

- `frontend-user` 有测试脚本。
- 首批不少于 6 条回归用例。
- 回归用例覆盖导师/答疑/拒绝代写/本地路由/黄风险/红风险。
- `pnpm --filter @edu-ai/frontend-user test` 通过。
- 根级 `pnpm run ci` 通过。

## 6. 明确非目标

- 不宣称已完成 100+ 真实对话回归集。
- 不替代真实学生内测。
- 不替代老师人工审阅。
- 不在前端发送真实跨 Agent 信号。
- 不把合成用例当作教育效果验证。

