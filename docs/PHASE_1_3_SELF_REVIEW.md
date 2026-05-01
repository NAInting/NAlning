# Phase 1.3 Knowledge Graph Spec Self Review

版本：2026-04-22  
审核对象：`docs/PHASE_1_3_KNOWLEDGE_GRAPH_SPEC.md`

## 一、自查结论

阶段 1.3 已完成知识图谱 Spec 草案、作者侧种子图和增强 validator。当前文档把初二数学知识图谱从“一个学期 60-100 个节点”的大目标，切成了可执行的 MVP Seed Graph：一次函数的概念 10 个核心节点。

当前判断：替代冷审 P1 已修复，增强 validator 与根目录 CI 已通过。第二轮替代冷审因子代理连续超时未完成，已采用主线程严格复核替代补审。当前可按 8.5 锁定。

## 二、完工指标核验

| 指标 | 状态 | 证据 |
|---|---|---|
| 阶段定位清楚 | 通过 | 第一节 |
| 非目标清楚 | 通过 | 第三节 |
| MVP 范围清楚 | 通过 | 第四节 |
| shared-types 映射清楚 | 通过 | 第五节 |
| 作者侧结构清楚 | 通过 | 第六节 |
| 首批节点建议 | 通过 | 第七节 10 个节点 |
| Agent 使用边界 | 通过 | 第八节 |
| MasteryRecord 契约 | 通过 | 第九节 |
| 质量门禁 | 通过 | 第十节 |
| 实现完工指标 | 通过 | 第十一节 |
| 作者侧种子图 | 通过 | `content/units/math-g8-s1-linear-function-concept/knowledge-graph.seed.json` |
| 增强 validator | 通过 | `scripts/validate-knowledge-graph.mjs` |

## 三、治理自查

| 问题 | 判断 |
|---|---|
| 谁能看内容图谱？ | 内容图谱是课程资产，可对学生/老师展示；不含学生个人数据 |
| 谁能改内容图谱？ | 阶段 1.3 草稿由工程/学科顾问维护，正式发布需人工审阅 |
| 出事找谁？ | 内容错误归内容生产与学科审阅流程；学生掌握误判归 1.4 |
| 是否留痕？ | 后续作者侧草稿和 validator 进入 git；阶段 2 管线再补成本和 prompt trace |
| 是否涉及隐私？ | 不写学生 ID、情绪详情、对话原文；运行时只通过 node id 被事件引用 |

## 四、与上游一致性

| 上游 | 一致性 |
|---|---|
| `KnowledgeNode` | Spec 使用现有字段，不要求改 shared-types |
| `Unit` | 规定 MVP 单元映射，不把 Unit 当教材全文 |
| `LearningPath` | 只引用节点，不复制学生状态 |
| `Assessment` | 每个核心节点至少一个 formative probe |
| `LearningEvent` | 通过 `knowledge_node_ids` 引用节点 |
| `MasteryRecord` | 单条记录只绑定一个 `knowledge_node_id` |
| `EpisodicMemoryEntry` | 可通过 `related_node_ids` 引用节点，不反向暴露对话 |

## 五、风险与处理

| 风险 | 当前处理 | 是否阻断 |
|---|---|---|
| 课标条目未真实核对 | 明确需要学科顾问和后续 RAG 资源补齐 | 不阻断 Spec |
| UUID 不适合老师编辑 | 引入作者侧 alias，运行时编译为 UUID | 不阻断 |
| 10 节点可能不足以覆盖一次函数全部内容 | 定义为 MVP Seed Graph，不等于完整单元 | 不阻断 |
| assessment probe 还未完全编译成 shared-types `AssessmentItem` | 作者侧已补 `assessment` contract 和每节点 `formative_probe` | 不阻断，后续可加编译器 |
| 课标 code 是 draft | 标记为待学科顾问核对 | 不阻断工程验证 |

## 六、替代冷审修复

替代冷审发现 3 个 P1：

1. `Unit` 字段没有覆盖 shared-types `UnitSchema` 的完整必填契约。
2. `Assessment` 只写概念要求，缺 `AssessmentSchema`、`ScoringStrategy`、`AssessmentItem` 机械标准。
3. 掌握度展示规则只看 confidence，未绑定 `is_visible_to_student`、`is_acceptable_to_record`、`visibility_scope`。

已修复：

1. Spec 第 5.2 节补齐完整 Unit contract。
2. Spec 第 5.4 节补齐 Assessment / ScoringStrategy / AssessmentItem contract。
3. Spec 第九节改为以 shared-types 可见性字段为展示边界，confidence 只作为可记录性默认门槛。
4. 种子图补齐 unit、learning_path、assessment 作者侧字段。
5. 新增并增强 validator，通过 `pnpm run validate:knowledge-graph`。
6. 主线程严格复核确认无 P0/P1 残留。

## 七、验证

已通过：

```powershell
pnpm run validate:knowledge-graph
pnpm run ci
```

## 八、下一步建议

1. 锁定 1.3。
2. 进入 1.4 掌握度评估 Spec。
3. 学科顾问审阅时重点核对课标 code 和节点教学顺序。
