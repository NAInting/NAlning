# Phase 1.3 初二数学知识图谱 Spec

版本：2026-04-22  
状态：Draft for implementation review  
上游依赖：Phase 0.1 shared-types、Phase 1.1 Persona、Phase 1.2 Memory Runtime

## 一、阶段定位

阶段 1.3 的目标是为学生 Agent MVP 建立“单学科、单年级、可被对话和掌握度评估引用”的初二数学知识图谱。

这个阶段不追求一次性产出完整教材，而是先把知识图谱的工程规则定清楚：

1. 什么才算一个合格的知识节点。
2. 节点之间如何表示先修、支撑和相关关系。
3. 学生 Agent 如何在对话中引用节点。
4. MasteryRecord 如何把学习事件聚合到节点。
5. Teacher Agent 后续如何只看到节点级掌握信号，而不是学生原始对话。

阶段 1.3 的核心原则是：内容图谱是公共/课程资产，学生掌握度是个人学习记录，两者必须分开。

## 二、输入依据

| 来源 | 继承内容 |
|---|---|
| `packages/shared-types/src/content/knowledge-node.ts` | `KnowledgeNode` 运行时实体 |
| `packages/shared-types/src/content/unit.ts` | `Unit` 与课标对齐、节点列表、生产元数据 |
| `packages/shared-types/src/content/learning-path.ts` | `LearningPath` 与路径步骤 |
| `packages/shared-types/src/content/assessment.ts` | `Assessment` 与题目、评分策略 |
| `packages/shared-types/src/learning/learning-event.ts` | `LearningEvent.knowledge_node_ids` |
| `packages/shared-types/src/learning/mastery.ts` | `MasteryRecord.knowledge_node_id` |
| `docs/AGENT_PERSONA.md` | Agent 不能代写，优先引导学生形成理解 |
| `docs/PHASE_1_2_MEMORY_RUNTIME_SPEC.md` | 情节记忆可引用 `related_node_ids`，但不能泄露原始对话 |

## 三、非目标

本阶段不做：

1. 不产出完整一学期 60-100 个节点的最终版本。
2. 不替代学科顾问老师审阅。
3. 不做真实课标 RAG 检索库，那属于阶段 2.4。
4. 不做 4-Agent 教材生产管线，那属于阶段 2。
5. 不把学生个人掌握度写进内容节点。
6. 不在内容图谱中存储任何学生身份、情绪、对话内容或隐私标签。
7. 不改 shared-types，除非实现首批种子图时发现 P0/P1 contract 缺口。

## 四、范围切片

阶段 1.3 采用两层范围：

| 范围 | 内容 | 目标 |
|---|---|---|
| Semester Target | 初二数学一学期 60-100 个节点 | 作为阶段 1 的方向性目标 |
| MVP Seed Graph | “一次函数的概念”8-12 个核心节点 | 本阶段优先落地和验收 |

推荐 MVP Seed Graph 选题：初二数学《一次函数的概念》。

理由：

1. 一次函数适合用图像、表达式、表格、情境多表征教学。
2. 误区高发，便于体现 Student Agent 的苏格拉底式引导价值。
3. 后续掌握度可用练习结果和对话表现双重验证。
4. 教师热力图和学生掌握地图都容易解释给校长和家长。

## 五、运行时实体映射

### 5.1 `KnowledgeNode`

每个知识节点必须落到 `KnowledgeNode`。

必填语义：

| 字段 | 要求 |
|---|---|
| `id` | UUID v4，运行时唯一 ID |
| `subject` | `Subject.MATH` |
| `grade` | `Grade.G8` |
| `title` | 学生、老师都能理解的节点标题 |
| `description` | 说明节点边界，避免过宽 |
| `parent_node_ids` | 上位概念节点，可为空 |
| `prerequisite_node_ids` | 先修节点，必须无环 |
| `related_node_ids` | 非先修关系，可用于复习推荐 |
| `mastery_criteria` | 可观察、可评估的掌握标准 |
| `difficulty` | 1-5，给路径编排和掌握度评估使用 |
| `estimated_learning_minutes` | 初次学习估时 |
| `common_misconceptions` | 至少 2 条，含例子和纠偏策略 |
| `standard_alignments` | 至少 1 条课标对齐 |
| `unit_ids` | 归属单元 |

### 5.2 `Unit`

MVP Seed Graph 对应一个完整 `Unit`，必须能编译到 `UnitSchema`，不能只写标题和节点列表。

必填语义：

| 字段 | 建议值 |
|---|---|
| `id` | UUID v4 |
| `subject` | `Subject.MATH` |
| `grade` | `Grade.G8` |
| `title` | 一次函数的概念 |
| `description` | 单元边界、学习目标和非目标 |
| `duration_hours` | 4-6 |
| `standard_alignments` | 至少 1 条，单元级课标对齐 |
| `prerequisite_unit_ids` | 可为空；后续全学期图谱接入时补 |
| `prerequisite_node_ids` | 单元入口先修节点；本 seed graph 可为空 |
| `knowledge_node_ids` | 8-12 个节点 |
| `learning_path_id` | 指向本单元 `LearningPath` |
| `scenario_ids` | Phase 1.3 可为空数组，Phase 2 补情境 |
| `assessment_ids` | 至少 1 个 formative assessment |
| `production_metadata` | 人工草稿也必须填写，agent version 可用 `manual-draft` |
| `status` | `DRAFT` |
| `generated_by_agents` | `false`，阶段 1.3 由人工 + Codex 草拟 |
| `human_reviewers` | 学科顾问老师 UUID，未确定前为空数组 |

### 5.3 `LearningPath`

学习路径必须引用节点，而不是复制节点内容。

每个 `LearningPathStep` 必须落到 shared-types 字段：

| 字段 | 要求 |
|---|---|
| `step_id` | UUID v4 |
| `order` | 从 1 开始递增 |
| `target_node_ids` | 至少 1 个 UUID |
| `pedagogy` | 使用 `PedagogyType` 枚举 |
| `activity_type` | 使用 `LearningActivityType` 枚举 |
| `estimated_duration_minutes` | 正整数 |
| `scenario_id` | Phase 1.3 可选，Phase 2 接情境时补 |
| `dialogue_script_id` | Phase 1.3 可选，Phase 1.5/2 接 prompt 时补 |
| `assessment_id` | 评估步骤必须指向 assessment |
| `completion_criteria` | 必须写 `type`，必要时写 `threshold` 或 `min_duration_minutes` |

建议路径：

1. 情境引入：变量关系与变化趋势。
2. 概念形成：一次函数表达式 `y = kx + b`。
3. 多表征转换：表格、图像、表达式互转。
4. 误区诊断：斜率和截距混淆。
5. 无 AI 独立练习：给定情境建模。
6. 元认知反思：学生解释自己如何判断 `k` 与 `b`。

### 5.4 `Assessment`

每个核心节点必须至少有一个 assessment probe。

每个 seed graph 至少有一个 `Assessment`，并能编译到 `AssessmentSchema`。

`Assessment` 必填语义：

| 字段 | 要求 |
|---|---|
| `id` | UUID v4 |
| `title` | 评估标题 |
| `target_node_ids` | 覆盖本 assessment 对应节点 |
| `type` | MVP 用 `FORMATIVE` |
| `items` | 至少 1 个 `AssessmentItem` |
| `scoring_strategy.method` | MVP 可用 `HYBRID` 或 `RULE_BASED` |
| `scoring_strategy.mastery_threshold` | 默认 0.7 |
| `scoring_strategy.requires_human_review` | AI rubric 或开放题默认 true；简单客观题可 false |
| `min_confidence_threshold` | 默认 0.7 |

`AssessmentItem` probe 要求：

1. 能区分“会背定义”和“能用概念判断”。
2. 能映射到具体 `target_node_id`。
3. 有 `diagnostic_hints` 指向对应 misconception。
4. 明确 `type`，如 `SHORT_ANSWER`、`MULTIPLE_CHOICE` 或 `DIALOGUE_PERFORMANCE`。
5. 开放题必须有 `rubric` 或明确要求人工审阅。
6. 判定通过的机械规则必须可写进测试，例如：目标关键词、计算结果、rubric level 或人工审阅要求。
7. 若题目需要 AI rubric，必须有人工审阅或回归样例。

## 六、作者侧结构

shared-types 运行时全部使用 UUID。为了让学科老师和 Codex 能读写草稿，阶段 1.3 允许作者侧使用人类可读别名。

作者侧草稿建议结构：

```yaml
graph_id: math_g8_s1_linear_function_concept
subject: math
grade: g8
unit_alias: linear_function_concept
nodes:
  - alias: lf_variable_relation
    title: 变量关系
    runtime_id: "<uuid-v4>"
    prerequisites: []
    related: [lf_linear_expression]
    mastery_criteria:
      - 能用自己的话说明两个变量如何共同变化
    misconceptions:
      - id: "<uuid-v4>"
        description: 把任意两个同时出现的量都看成函数关系
        example: 认为“今天温度”和“作业页数”天然有关
        correction_strategy: 要求学生说明一个量变化时另一个量是否有确定对应
```

编译到运行时实体时：

1. `alias` 只在作者侧保留。
2. 所有关系转成 UUID。
3. 运行时 `KnowledgeNode` 不依赖 alias。
4. 对教师、学生、家长展示时只展示标题、描述、掌握标准和脱敏摘要。

## 七、MVP Seed Graph 节点建议

首批 10 个节点建议如下：

| alias | 节点标题 | 先修 | 评估重点 |
|---|---|---|---|
| `lf_variable_relation` | 变量关系 | 无 | 是否能判断两个量是否存在确定对应 |
| `lf_function_view` | 函数视角 | `lf_variable_relation` | 是否理解输入、输出和对应规则 |
| `lf_linear_expression` | 一次函数表达式 | `lf_function_view` | 是否识别 `y = kx + b` 的结构 |
| `lf_slope_meaning` | 斜率 k 的意义 | `lf_linear_expression` | 是否理解 k 代表变化率 |
| `lf_intercept_meaning` | 截距 b 的意义 | `lf_linear_expression` | 是否理解 b 与初始值/纵截距关系 |
| `lf_table_to_expression` | 表格到表达式 | `lf_slope_meaning`, `lf_intercept_meaning` | 是否能从表格提取 k 与 b |
| `lf_expression_to_graph` | 表达式到图像 | `lf_slope_meaning`, `lf_intercept_meaning` | 是否能解释图像倾斜和截距 |
| `lf_graph_to_expression` | 图像到表达式 | `lf_expression_to_graph` | 是否能从图像反推表达式 |
| `lf_context_modeling` | 情境建模 | `lf_variable_relation`, `lf_slope_meaning`, `lf_intercept_meaning` | 是否能从真实情境识别变量、变化率和初始值 |
| `lf_representation_consistency` | 多表征一致性检查 | `lf_table_to_expression`, `lf_expression_to_graph`, `lf_graph_to_expression`, `lf_context_modeling` | 是否能验证文字、表格、表达式、图像是否描述同一函数 |

每个节点最终必须补齐：

1. 课标对齐。
2. 掌握标准。
3. 至少 2 条 misconception。
4. 至少 1 个 formative probe。
5. 至少 1 条 Agent 引导句样例。

## 八、Agent 使用规则

Student Agent 可以使用知识图谱做三件事：

1. 在对话中选择当前目标节点。
2. 根据 misconception 选择引导问题。
3. 根据 LearningPath 推荐下一步。

Student Agent 不可以：

1. 把学生一次回答直接写成稳定掌握度。
2. 用节点标题给学生贴标签。
3. 给教师发送原始对话作为证据。
4. 因某节点掌握度低而贬低学生。

建议 Agent 引导句格式：

```json
{
  "node_alias": "lf_slope_meaning",
  "mode": "mentor",
  "prompt": "你先不急着算。我们只看 x 每增加 1，y 会怎么变？"
}
```

## 九、掌握度评估接口契约

阶段 1.4 会基于本图谱实现掌握度评估。阶段 1.3 需预留以下契约：

1. 所有 `LearningEvent` 必须能引用 `knowledge_node_ids`。
2. 所有 `MasteryRecord` 必须只引用一个 `knowledge_node_id`。
3. 如果一次作答涉及多个节点，先写事件多节点引用，再由 1.4 拆分评估。
4. 学生展示边界以 `is_visible_to_student`、`is_acceptable_to_record` 和 `visibility_scope` 为准，不能只看 confidence。
5. `confidence < 0.7` 默认不得把 `is_acceptable_to_record` 置为 true，除非后续人工审阅明确覆盖。
6. teacher-only 或 restricted 的 `MasteryRecord` 即使 confidence 高，也不得出现在学生透明视图里。
7. assessment probe 必须能产生 evidence_count。

## 十、质量门禁

知识图谱定版前必须通过以下检查：

| 检查 | 通过标准 |
|---|---|
| 节点边界 | 每个节点标题和描述不重叠、不泛化 |
| 先修无环 | `prerequisite_node_ids` 构成 DAG |
| 无孤立核心节点 | MVP seed graph 核心节点至少有一条入边或出边，起点除外 |
| 课标对齐 | 每个节点至少 1 条 `standard_alignments` |
| 掌握标准可测 | `mastery_criteria` 能被题目、对话或老师观察验证 |
| 误区可诊断 | 每个节点至少 2 条 misconception，含 example 和 correction_strategy |
| 评估探针 | 每个核心节点至少 1 个 formative assessment item |
| 评分策略 | assessment 必须声明 method、mastery_threshold、requires_human_review |
| 学生可见性 | 掌握度展示必须同时检查 `is_visible_to_student`、`is_acceptable_to_record`、`visibility_scope` |
| 隐私隔离 | 内容图谱不含学生 ID、情绪详情、对话原文 |
| Agent 可用 | 每个节点至少 1 条 mentor-mode 引导句 |
| 教师可读 | 节点标题和掌握标准能被数学老师快速理解 |

## 十一、完工指标

阶段 1.3 Spec 定版指标：

1. 本文件定义知识节点、单元、路径、评估的映射。
2. MVP Seed Graph 范围明确。
3. 质量门禁明确。
4. 与 shared-types 无冲突。
5. 与 1.2 memory runtime 的 `related_node_ids` 和 `LearningEvent.knowledge_node_ids` 对齐。
6. 自查报告完成。
7. 替代冷审或 Claude 复审无 P0/P1。

阶段 1.3 实现定版指标：

1. `content/units/math-g8-s1-linear-function-concept/` 下有作者侧知识图谱草稿。
2. 至少 10 个 MVP 节点完成。
3. 每个节点有课标对齐、掌握标准、误区、评估探针和 Agent 引导句。
4. 可通过脚本或测试校验先修无环、无孤立核心节点、UUID 引用有效。
5. 学科顾问老师完成第一轮审阅，或明确标记为待人工审阅。

## 十二、复查重点

后续 Claude 或替代冷审重点审：

1. 知识图谱是否混入学生个人数据。
2. 节点是否过宽，导致掌握度不可测。
3. 先修边是否有环或遗漏关键依赖。
4. assessment probe 是否真的能验证 mastery criteria。
5. misconception 是否具体到可被 Agent 引导，而不是泛泛描述。
6. 是否为阶段 2 的 4-Agent 教材管线留下可复用结构。

## 十三、下一步建议

1. 先按本 Spec 创建 `math-g8-s1-linear-function-concept` 作者侧草稿。
2. 给 10 个节点分配 UUID。
3. 为每个节点补齐最小字段。
4. 写一个 lightweight validator，先检查无环、引用有效和必填项。
5. 进入替代冷审，再决定是否扩大到 60-100 个 semester target 节点。
