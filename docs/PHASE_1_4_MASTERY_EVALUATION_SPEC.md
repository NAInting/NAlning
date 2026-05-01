# Phase 1.4 掌握度评估机制 Spec

版本：2026-04-22  
状态：Draft with minimal implementation  
上游依赖：Phase 1.2 Memory Runtime、Phase 1.3 Knowledge Graph

## 一、阶段定位

阶段 1.4 的目标是把学习事件聚合成可解释、可见性受控的 `MasteryRecord`。

核心原则：

1. `LearningEvent` 是事件溯源事实，不可被掌握度物化视图替代。
2. `MasteryRecord` 是从多个证据聚合出的物化结果。
3. 单轮对话、单次作答、低置信度判断不得直接变成稳定画像。
4. 学生展示边界由 `is_visible_to_student`、`is_acceptable_to_record`、`visibility_scope` 共同决定。
5. No-AI baseline 是高权重证据，但不能绕过证据数量和置信度门禁。

## 二、输入依据

| 来源 | 继承内容 |
|---|---|
| `packages/shared-types/src/learning/learning-event.ts` | 事件溯源输入 |
| `packages/shared-types/src/learning/mastery.ts` | `MasteryRecord` / `MasteryHistory` |
| `docs/PHASE_1_3_KNOWLEDGE_GRAPH_SPEC.md` | `knowledge_node_id` 是评估锚点 |
| `content/units/math-g8-s1-linear-function-concept/knowledge-graph.seed.json` | MVP 节点和 formative probes |
| `docs/PHASE_1_2_MEMORY_RUNTIME_SPEC.md` | 低置信度不进入长期画像 |

## 三、非目标

本阶段不做：

1. 不训练真实掌握度模型。
2. 不把评估结果写入数据库。
3. 不做教师日报。
4. 不做家长周报。
5. 不修改 shared-types。
6. 不把学生原始答案或对话内容写进 `MasteryRecord`。

## 四、输入与输出

### 4.1 输入

最小实现接受 `LearningEvent` 包装后的 evidence：

```ts
interface MasteryEvidenceInput {
  event: LearningEvent;
  assistance_level?: "no_ai" | "ai_supported" | "unknown";
  source_quality?: "direct_assessment" | "dialogue_inference" | "teacher_mark";
}
```

`assistance_level` 暂不写入 shared-types，因为现有 `LearningEvent` contract 没有该字段。Phase 1.4 先在 evaluator 输入层保留，后续如需持久化再进入 0.1/Schema 变更流程。

### 4.2 输出

输出 `MasteryRecord` 草案：

1. `student_id`
2. `knowledge_node_id`
3. `current_mastery`
4. `current_level`
5. `confidence`
6. `evidence_count`
7. `last_evidence_at`
8. `decay_factor`
9. `next_review_recommended_at`
10. `is_visible_to_student`
11. `is_acceptable_to_record`
12. `visibility_scope`
13. `ai_generated`

## 五、评估规则

### 5.1 证据筛选

事件必须同时满足：

1. `event.student_id === input.student_id`
2. `event.knowledge_node_ids` 包含目标 `knowledge_node_id`
3. `event.deleted_at` 不存在
4. 事件类型可被 evaluator 识别

### 5.2 事件得分

| 事件类型 | 默认处理 |
|---|---|
| `EXERCISE_ATTEMPT` | 正确高分，错误低分，提示次数扣分 |
| `SELF_REFLECTION` | 使用 `reflection_quality_score`，缺失时按低权重中性证据 |
| `NODE_MASTERED` | 高分证据 |
| `HELP_REQUESTED` | 低分但低权重信号 |
| `UNIT_COMPLETED` | 中等正向证据 |
| 其他事件 | 暂不参与 mastery 聚合 |

### 5.3 No-AI baseline

No-AI 证据权重高于 AI 辅助证据：

| assistance_level | 权重 |
|---|---|
| `no_ai` | 1.25 |
| `unknown` | 1.0 |
| `ai_supported` | 0.75 |

No-AI 只能提高 evidence 的权重和 confidence，不能单独绕过：

1. `evidence_count >= 2`
2. `confidence >= 0.7`

### 5.4 入档与展示门禁

默认门禁：

| 字段 | 规则 |
|---|---|
| `is_acceptable_to_record` | `confidence >= 0.7 && evidence_count >= 2` |
| `is_visible_to_student` | `is_acceptable_to_record === true` 且 visibility 允许学生 |
| `visibility_scope` | 可入档时学生和任课教师可见；不可入档时仅 system 可见 |

任何 teacher-only 或 restricted 记录，即使 confidence 高，也不得出现在学生透明视图。

## 六、实现落点

推荐落点：

```text
packages/agent-sdk/src/mastery-evaluator/
├── types.ts
├── policy.ts
├── evaluator.ts
└── index.ts
```

原因：

1. 掌握度评估属于 Agent SDK 的通用能力。
2. Student Agent、Teacher Agent 和后端都可能调用。
3. 可以复用 shared-types，不需要先接数据库。

## 七、测试清单

实现必须覆盖：

| 测试 | 通过标准 |
|---|---|
| 多事件聚合 | 同一 node 的多个事件生成一个 `MasteryRecord` |
| 事件过滤 | 不同学生或不同 node 的事件不参与 |
| No-AI 权重 | no_ai 正确证据比 ai_supported 同等证据得分/置信度更高 |
| 低证据不入档 | 单条证据不设置 `is_acceptable_to_record` |
| 低置信度不可见 | `confidence < 0.7` 时不展示给学生 |
| 可见性字段优先 | 学生展示必须由 `is_visible_to_student` 和 `visibility_scope` 控制 |
| 不泄露原文 | `MasteryRecord` 不包含 `student_answer` 或对话文本 |

## 八、完工指标

阶段 1.4 Spec 定版指标：

1. 本文件定义事件到掌握度的聚合规则。
2. 与 shared-types 的 `LearningEvent`、`MasteryRecord`、`MasteryHistory` 无冲突。
3. 明确 No-AI 权重。
4. 明确低置信度和可见性门禁。
5. 自查和验证通过。

阶段 1.4 实现定版指标：

1. `packages/agent-sdk/src/mastery-evaluator` 存在。
2. `pnpm --filter @edu-ai/agent-sdk test` 覆盖核心规则。
3. `pnpm run ci` 通过。
4. 无 P0/P1。

## 九、复查重点

1. 是否把单次事件当成稳定掌握度。
2. 是否把 confidence 当成唯一展示边界。
3. 是否泄露 `student_answer` 或原始对话。
4. 是否绕过 1.3 的 `knowledge_node_id`。
5. No-AI 权重是否只是加权，而不是安全门禁绕过。
