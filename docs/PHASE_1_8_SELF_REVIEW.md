# Phase 1.8 Self Review

## 1. 审核结论

Phase 1.8 第一块自动化回归骨架通过。

它没有完成“真实内测”本身，但已经让 Student Agent 的关键安全与模式行为进入 CI。这个顺序是对的：先有测试容器，再承接真实对话。

综合评分：8.5 / 10。

## 2. 完工指标核验

| 检查项 | 结果 |
| --- | --- |
| `frontend-user` 有测试脚本 | 通过 |
| 首批不少于 6 条回归用例 | 通过，6 条 |
| 覆盖导师/答疑/拒绝代写 | 通过 |
| 覆盖本地路由/黄风险/红风险 | 通过 |
| 不暴露黄/红触发原文 | 通过 |
| `pnpm --filter @edu-ai/frontend-user test` | 通过 |
| 根级 `pnpm run ci` | 通过 |

## 3. 隐私审查

通过项：

- runtime result 不含 `keyword_hits`。
- runtime result 不含 signal payload。
- 黄/红测试断言 JSON 结果不包含触发短语。
- 前端只显示抽象 route。

观察项：

- `signal_ready_for_backend` 是一个布尔提示，后端 runtime 未来必须负责真实投递、审计和接收人选择。

## 4. 工程审查

通过项：

- `App.vue` 的策略逻辑已下沉到 `student-agent-runtime.ts`。
- 测试直接命中 runtime bridge，不依赖 DOM。
- 测试进入根级 turbo pipeline。
- 回归用例发现并修复了 UUID schema 问题，证明测试有效。

观察项：

- 当前合成用例仍少，不能代表真实学生语言分布。
- 没有浏览器 UI 截图测试，受本机 Playwright Chromium 未安装限制。

## 5. 风险登记

| 风险 | 级别 | 处理 |
| --- | --- | --- |
| 合成用例覆盖不足 | 中 | 后续真实内测逐步补入 |
| 前端 runtime bridge 与未来后端 runtime 分叉 | 中 | 下一步迁移到后端 Student Agent session API |
| 误把 6 条测试当成教育效果验证 | 中 | 文档明确这是安全/行为回归，不是效果评估 |

## 6. 定版条件

本切片已满足自动化回归骨架要求，定为 8.5。

真实 Phase 1.8 完整完成仍需：

- 真实学生/老师测试。
- 100+ 脱敏对话语料。
- P0/P1 bug 清零。
- 种子老师复核。

