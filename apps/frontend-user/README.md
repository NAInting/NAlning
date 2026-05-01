# @edu-ai/frontend-user

真实学生/老师/家长端前端应用。

Phase 1.7 当前状态：

- 已建立最小 Vite + Vue 学生端界面。
- 当前页面聚焦 Student Agent 对话 UI。
- 支持 Mentor/Tutor 模式切换、route indicator、知识点上下文、No-AI 入口和本地处理视觉提示。

运行：

```powershell
pnpm --filter @edu-ai/frontend-user dev
pnpm --filter @edu-ai/frontend-user build
```

说明：

- 这是面向真实学生/老师/家长端的产品应用，不是治理控制台。
- 当前只完成 Phase 1.7 的学生 Agent 对话 UI 起步面。
- 后续会继续接入真实 Agent runtime、语音输入、会话持久化、学习痕迹卡片和移动端体验打磨。
