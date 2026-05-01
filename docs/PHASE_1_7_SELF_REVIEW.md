# Phase 1.7 Self Review

## 1. 审核结论

Phase 1.7 当前达到“学生端 UI 起步切片”标准。

它可以作为真实 `frontend-user` 的第一块产品界面进入后续迭代，但不能被误解为完整 Student Agent。真实 Agent runtime、语音输入、会话持久化、学习痕迹卡片和后端接线仍在后续阶段。

综合评分：8.5 / 10。

## 2. 完工指标核验

| 检查项 | 结果 |
| --- | --- |
| `@edu-ai/frontend-user` 被 workspace 识别 | 通过 |
| `pnpm install` | 通过 |
| 单包 typecheck | 通过 |
| 单包 build | 通过 |
| 根级 `pnpm run ci` | 通过 |
| 中文文案 UTF-8 正常 | 通过 |
| README 删除旧占位口径 | 通过 |
| 隐私边界无 P0/P1 问题 | 通过 |
| UI 接入 dialogue-modes 策略 | 通过 |
| UI 接入 privacy-filter 路由策略 | 通过 |

## 3. 隐私边界审查

通过项：

- 只展示 `controlled_cloud` / `campus_local` 抽象路径。
- 不展示关键词命中细节。
- 不展示 prompt、推理链或内部判断过程。
- 情绪/压力输入通过 `privacy-filter` 判定本地处理。
- 前端不会发送真实跨 Agent 信号。
- No-AI 入口明确存在。

观察项：

- 当前仍是本地会话状态，真实信号发送必须等待后端 runtime。

## 4. 产品体验审查

通过项：

- 首屏以 Nova 学伴为核心，不像治理后台。
- 文案鼓励学生表达中间想法，不把答案作为第一目标。
- Mentor/Tutor 模式差异可见。
- 路径状态在顶部可见。
- 移动端有单列布局。

观察项：

- 当前对话回复仍是模板逻辑，缺少流式输出和真实连续感。
- No-AI 入口尚未连接独立任务页。
- 学习痕迹卡片尚未实现。

## 5. 工程审查

通过项：

- package 脚本与 monorepo 约定一致。
- Vue 入口清晰。
- 没有新增外部 UI 依赖。
- 没有公网 CDN。
- CSS 独立且范围可控。
- `agent-sdk` 与 `privacy-filter` 已提供前端可消费的窄 exports。
- Node-only ID 生成已替换为浏览器兼容实现。

观察项：

- 当前 `App.vue` 承担页面、状态和 UI 逻辑，后续应拆分组件。
- 当前没有单元测试；本阶段以 typecheck/build/CI 为准。

## 6. 风险登记

| 风险 | 级别 | 处理 |
| --- | --- | --- |
| 前端误发送黄色/红色跨 Agent 信号 | 中 | 当前只消费 route，不发送 signal；真实发送留给后端 runtime |
| 单文件 App 后续膨胀 | 小 | 下一阶段拆组件 |
| No-AI 入口未接真实页面 | 小 | 后续学生端学习任务页实现 |

## 7. 定版条件

根级 `pnpm run ci` 已通过，本阶段定为 8.5。

视觉浏览器检查说明：

- 已尝试使用 Playwright 截图做 UI 冒烟检查。
- 当前本机 Playwright Chromium 未安装，浏览器下载在 5 分钟超时内未完成。
- 该问题属于本机验证环境限制，不影响本阶段代码进入 CI 绿灯状态。
