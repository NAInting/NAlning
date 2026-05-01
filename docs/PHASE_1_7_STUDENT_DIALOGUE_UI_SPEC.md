# Phase 1.7 Student Dialogue UI Spec

## 1. 阶段定位

Phase 1.7 的目标是建立真实学生端 `frontend-user` 的第一条可运行 UI 切片，让 Student Agent MVP 从后端策略与类型定义进入学生可感知的产品界面。

本阶段不是完整学生端，也不替代 Phase 1.1-1.6 的 Agent runtime。它只负责把以下能力以产品界面形式露出：

- 学生能看到一个温暖、低压、不像传统学习软件的 AI 学伴界面。
- 学生能在导师模式和答疑模式之间切换。
- 学生能看到当前对话走受控云路径还是校内本地处理。
- 学生能看到当前知识点、掌握度提示和 No-AI 复盘入口。
- 情绪/压力类输入通过 `@edu-ai/privacy-filter` 的学生路由策略切换到 `campus_local`。

## 2. 视觉与交互原则

视觉 thesis：像一张安静的学习桌面，纸感、留白、低饱和绿色，让学生愿意把“还没想清楚”的话说出来。

内容 plan：

- Hero：Nova 学伴、当前路径状态、一次函数学习语境。
- Context：当前知识点、掌握度提示、模式规则、No-AI 入口。
- Dialogue：学生和 Nova 的对话流。
- Composer：轻量输入，不制造“考试提交”的压迫感。

交互 thesis：

- 首屏轻微上浮进入，减少工具感。
- 消息进入有短促、克制的动效，形成对话连续感。
- `campus_local` 通过路径 pill 和消息 outline 给出边界反馈。

## 3. 页面范围

本阶段只实现一个最小页面：

- `apps/frontend-user/src/App.vue`

页面内包含：

- `Nova 学伴` 品牌标识。
- `受控云路径 / 校内本地处理` route indicator。
- `导师 / 答疑` 模式切换。
- 当前知识点上下文：斜率 `k` 的意义。
- 掌握度与 No-AI 复盘提示。
- 对话消息列表。
- 输入框与发送按钮。

## 4. 数据与隐私边界

本阶段使用本地状态，不调用真实后端、不调用真实模型、不写入数据库。

本阶段已经接入两个前序策略包：

- `@edu-ai/agent-sdk/dialogue-modes`：生成导师/答疑/陪伴模式下的回答策略。
- `@edu-ai/privacy-filter/student-emotion-router`：生成学生消息的隐私路由结果。

隐私边界约束：

- UI 只展示 `route_selected` 的抽象结果，不展示关键词命中细节。
- UI 不展示 prompt、推理链、原始策略判断过程。
- 情绪/压力类输入由 `privacy-filter` 处理；UI 只消费抽象路由结果，不展示命中词。
- 黄色/红色风险路径仍只用于本地演示，不在前端发出真实跨 Agent 信号。
- No-AI 入口作为学生主动退出 AI 辅助的显性 affordance 保留。

## 5. 与前序阶段的关系

- 承接 Phase 1.1：保持“温暖、专业、有边界、不讨好”的 Agent 人格。
- 承接 Phase 1.4：展示掌握度但不在 UI 内计算掌握度。
- 承接 Phase 1.5：展示导师模式与答疑模式的风格差异。
- 承接 Phase 1.6：展示 `controlled_cloud` 与 `campus_local` 的路径差异。

## 6. 明确非目标

以下内容不在本阶段交付：

- 真实 LLM 调用。
- 流式输出。
- 语音输入。
- 会话持久化。
- 学习痕迹卡片。
- 学生登录与角色路由。
- 知识图谱可视化。
- 真实后端 Agent runtime 接线。

这些能力进入 Phase 1 后续 UI/runtime 集成阶段。

## 7. 完工指标

- `@edu-ai/frontend-user` 能被 pnpm workspace 识别。
- `pnpm --filter @edu-ai/frontend-user typecheck` 通过。
- `pnpm --filter @edu-ai/frontend-user build` 通过。
- 根级 `pnpm run ci` 通过。
- 页面中文文案 UTF-8 正常。
- `README.md` 不再保留 Phase 0.2 “未实现”旧口径。
- 自查报告确认没有 P0/P1 隐私边界问题。
