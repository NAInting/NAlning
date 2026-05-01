# Phase 1.7 Implementation Report

## 1. 交付摘要

Phase 1.7 已建立 `apps/frontend-user` 的最小 Vue + Vite 学生端应用，用于承载 Student Agent MVP 的第一块真实 UI 切片。

本次交付从空占位应用推进到可构建、可运行、可演示的学生对话界面：

- 新增 `@edu-ai/frontend-user` package 配置。
- 新增 Vite/Vue 入口文件。
- 新增学生端对话主界面。
- 新增学生端视觉系统 CSS。
- 更新 README，删除 Phase 0.2 旧占位口径。
- 接入 `@edu-ai/agent-sdk/dialogue-modes`，由共享策略决定回答政策。
- 接入 `@edu-ai/privacy-filter/student-emotion-router`，由共享策略决定路径状态。

## 2. 文件变更

新增或更新：

- `apps/frontend-user/package.json`
- `apps/frontend-user/index.html`
- `apps/frontend-user/tsconfig.json`
- `apps/frontend-user/tsconfig.build.json`
- `apps/frontend-user/vite.config.ts`
- `apps/frontend-user/src/main.ts`
- `apps/frontend-user/src/App.vue`
- `apps/frontend-user/src/styles.css`
- `apps/frontend-user/README.md`
- `packages/agent-sdk/package.json`
- `packages/agent-sdk/src/mastery-evaluator/evaluator.ts`
- `packages/privacy-filter/package.json`
- `packages/privacy-filter/src/student-emotion-router.ts`

新增文档：

- `docs/PHASE_1_7_STUDENT_DIALOGUE_UI_SPEC.md`
- `docs/PHASE_1_7_IMPLEMENTATION_REPORT.md`
- `docs/PHASE_1_7_SELF_REVIEW.md`

## 3. 关键实现

### 3.1 学生 Agent 对话界面

`App.vue` 实现了单页学生 Agent UI：

- 初始 Agent 引导语。
- 学生输入与消息追加。
- Mentor/Tutor 模式切换。
- 简单情绪/压力关键词演示路由。
- `controlled_cloud` / `campus_local` 路径状态展示。
- No-AI 区入口。

### 3.2 模式差异与策略接线

前端现在调用 `buildDialogueModePlan()` 生成 `answer_policy`：

- `socratic_prompt` 映射为导师式追问。
- `clear_explanation_with_check` 映射为答疑式解释 + 检查问题。
- `boundary_refusal_with_alternative` 映射为拒绝可提交答案 + 给第一步。
- `support_and_shrink_task` 映射为缩小任务。

### 3.3 路由边界接线

前端现在调用 `decideStudentPrivacyRoute()`：

- `green` 显示 `controlled_cloud`。
- `local_only` / `yellow` / `red` 显示 `campus_local`。
- UI 不展示 `keyword_hits`，只展示抽象 route。

黄色/红色路径在包内会生成抽象信号，但当前前端不会对外发送这些信号。真实跨 Agent 信号流必须由后端 runtime 执行。

### 3.4 视觉系统

`styles.css` 使用：

- 温暖纸感背景。
- 低饱和绿色作为唯一主行动色。
- 本地路径使用棕橙色作为安全边界提示。
- 轻微入场与消息动效。
- 移动端单列回退。

目标是让学生端区别于治理控制台，避免 dashboard 感和考试感。

## 4. 偏离 Spec 的地方

没有偏离 Phase 1.7 Spec 的地方。

有一个刻意保留的限制：

- 当前只接入 deterministic strategy，不接入真实 LLM、真实后端或数据库。
- `App.vue` 仍是单文件切片，后续应拆分组件。

额外兼容性修复：

- `privacy-filter` 的信号 ID 生成从 Node-only `node:crypto` 改为 `globalThis.crypto.randomUUID()` 优先，浏览器和 Node 均可用。
- `agent-sdk` 的 mastery record ID 生成同样移除 Node-only `node:crypto`，避免前端消费子路径时被 Node 类型污染。
- `agent-sdk` / `privacy-filter` 增加窄子路径 exports，前端可只导入所需策略入口。

## 5. 验证记录

已执行：

```powershell
pnpm install
pnpm --filter @edu-ai/frontend-user typecheck
pnpm --filter @edu-ai/frontend-user build
pnpm --filter @edu-ai/agent-sdk test
pnpm --filter @edu-ai/privacy-filter test
```

结果：

- workspace install 正常。
- `vue-tsc --noEmit` 通过。
- Vite production build 通过。
- `agent-sdk` 测试通过。
- `privacy-filter` 测试通过。

根级 CI 已执行：

```powershell
pnpm run ci
```

结果：

- lint 通过。
- typecheck 通过。
- test 通过。
- e2e 通过。
- build 通过。
- `@edu-ai/frontend-user` 已进入根级 turbo pipeline。

第二轮策略接线后，根级 CI 再次执行并通过。

视觉浏览器冒烟检查尝试：

```powershell
pnpm exec playwright screenshot --viewport-size "1440,1000" http://127.0.0.1:4177 <temp-png>
```

结果：

- 本机 Playwright Chromium 未安装。
- 已尝试 `pnpm exec playwright install chromium`，但下载在 5 分钟超时内未完成。
- 因此本阶段视觉浏览器检查暂记为环境限制，代码级与构建级验证已完成。

## 6. 下一步建议

Phase 1.7 之后最自然的推进顺序：

1. 将 `App.vue` 拆成页面与组件结构。
2. 把本地状态迁移为会话 store。
3. 接入真实后端 Student Agent session API。
4. 增加会话历史与学习痕迹卡片。
5. 增加移动端真实设备视觉验收。
