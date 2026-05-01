# Phase 2.5 Runtime Content Block Spec

版本：2026-04-25  
状态：DeepTutor-informed draft  
目标：把 Phase 2 的 `unit.yaml` 从“结构化课程文档”推进到“可被学生端渲染的 AI 原生学习体验”。

## 1. 背景

DeepTutor 的 Book Engine 给出的关键启发是：教材生产管线不能只停在 `knowledge / pedagogy / narrative / implementation / assessment / quality` 六个抽象 section。一个 AI 原生单元还需要落到可渲染对象：

```text
Unit -> Page -> Block -> Progress/Event
```

本阶段不引入 DeepTutor 代码，也不改变现有 Vue/Node/Postgres 主技术栈。我们只吸收它的 Page/Block 建模思想，并按本项目的隐私、审计和中国 K-12 课程约束重写 schema。

## 2. 新增顶层 section

`unit.yaml` 新增：

```yaml
runtime_content:
  meta: ...
  default_visible_to_roles: [student]
  pages:
    - page_id: page_slope_first_look
      title: 先看斜率的方向
      order: 0
      target_nodes: [lf_slope_meaning]
      blocks: [...]
```

`runtime_content` 是运行时渲染层，不替代以下 section：

- `knowledge` 仍是知识源头。
- `pedagogy` 仍是学习路径和活动设计源头。
- `narrative` 仍是情境和对话脚本源头。
- `implementation` 仍是组件、prompt 和 data hook 源头。
- `assessment` 仍是评估项源头。
- `quality` 仍是发布门禁源头。

## 3. 核心类型

代码位置：

- `packages/shared-types/src/content/ai-native-unit.ts`

新增类型：

| 类型 | 用途 |
| --- | --- |
| `RuntimeContentSection` | 顶层可渲染内容 section |
| `UnitPage` | 学习页，绑定一个或多个知识节点 |
| `UnitBlock` | 页面里的原子学习内容块 |
| `UnitBlockType` | block 类型枚举 |
| `UnitBlockStatus` | block 发布状态 |
| `UnitSourceAnchor` | block 级来源锚点 |

## 4. Block 类型

首版支持：

| 类型 | 说明 | 安全要求 |
| --- | --- | --- |
| `text` | 说明文本 | 静态 |
| `callout` | 提醒/提示/边界说明 | 静态 |
| `quiz` | 单题或小测 | 静态或表单 |
| `flash_cards` | 记忆卡片 | 静态交互 |
| `concept_graph` | 概念图 | 静态图或受控交互 |
| `figure` | 图示/图表 | 静态 |
| `interactive` | 交互演示 | 必须 sandbox |
| `animation` | 动画/视频/动态演示 | 必须 sandbox 或 server_rendered |
| `timeline` | 时间线/步骤线 | 静态 |
| `practice` | 练习任务 | 静态或表单 |
| `reflection` | 元认知反思 | 静态或表单 |
| `code` | 代码/可执行片段 | 必须 sandbox |

## 5. 每个 Block 的硬约束

每个 `UnitBlock` 必须有：

1. `block_id`：稳定机器 ID。
2. `type`：受控枚举。
3. `status`：`pending | ready | needs_review | hidden`。
4. `target_nodes`：必须引用 `knowledge.nodes[].node_id`。
5. `visibility_scope`：声明学生、教师、家长、管理员谁能看。
6. `privacy_level`：声明隐私等级。
7. `confidence_score`：0 到 1。
8. `source_trace`：至少 1 条来源锚点。
9. `sandbox`：声明渲染安全边界。
10. `payload`：结构化 payload，不允许塞不可解析的大段自由文本替代结构。

## 6. 隐私与可见性规则

首版 deterministic gate：

1. `student_private` block 只能对 `student` 或 `system` 可见。
2. `teacher_only` block 不能对 `student` 或 `guardian` 可见。
3. `interactive`、`animation`、`code` block 必须声明 active sandbox。
4. block 的 `source_trace` 不得使用 CCSS / Common Core 或等价外部课标替代中国课标来源。
5. runtime block 不得承载真实学生原始对话、情绪内容、家长信息或教师私密备注。

## 7. 语义校验

代码位置：

- `apps/content-pipeline/src/unit-semantic-validation.ts`

新增校验：

1. `runtime_content.pages[].page_id` 不重复。
2. `runtime_content.pages[].target_nodes[]` 必须存在。
3. `runtime_content.pages[].blocks[].block_id` 不重复。
4. `runtime_content.pages[].blocks[].target_nodes[]` 必须存在。
5. 每个 block 的 `source_trace` 不得引用未批准外部课标。
6. teacher-only/student-private 可见性不能越界。
7. executable block 必须 sandbox。

## 8. 当前样例

样例单元：

- `content/units/math-g8-s1-linear-function-concept/unit.yaml`

已加入一个最小 `runtime_content`：

- `page_slope_first_look`
- `block_slope_direction_prompt`
- `block_slope_quick_check`

这两个 block 只使用公开课程内容和已有 assessment/narrative 草案，不包含真实学生数据。

## 9. 非目标

本阶段不做：

1. 不引入 DeepTutor 代码。
2. 不运行 DeepTutor Book Engine。
3. 不增加真实 provider 调用。
4. 不重排 Phase 2 六角色 workflow。
5. 不把 blocked artifact 写回源 `unit.yaml`。
6. 不做学生端渲染 UI。

## 10. 验证命令

```powershell
pnpm --filter @edu-ai/shared-types test
pnpm --filter @edu-ai/shared-types typecheck
pnpm --filter @edu-ai/content-pipeline test
pnpm --filter @edu-ai/content-pipeline typecheck
```

跨包改动稳定后运行：

```powershell
pnpm run ci
```

