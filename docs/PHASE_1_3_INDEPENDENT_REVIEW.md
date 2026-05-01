# Phase 1.3 Independent Review

日期：2026-04-22  
审核方式：Codex 主线程 + 独立子代理冷读复审  
审核对象：`docs/PHASE_1_3_KNOWLEDGE_GRAPH_SPEC.md`

## 一、冷审结论

替代冷审最初不建议 8.5 定版，原因是发现 3 个 P1 和 2 个 P2。

| 等级 | 问题 | 风险 |
|---|---|---|
| P1 | `Unit` 只写了少数字段，没有覆盖 shared-types `UnitSchema` | 按 Spec 产不出合法 Unit |
| P1 | assessment probe 没有绑定 `AssessmentSchema`、`ScoringStrategy`、`AssessmentItem` 的机械标准 | 后续 1.4 掌握度评估缺可测试输入 |
| P1 | 学生掌握度展示规则主要绑在 confidence | 可能绕过 `is_visible_to_student`、`is_acceptable_to_record`、`visibility_scope` |
| P2 | `lf_representation_switching` 节点过宽 | 单一 probe 容易失真 |
| P2 | `LearningPath` 缺少 step contract | 不足以作为阶段 2 管线锚点 |

## 二、修复记录

| 问题 | 修复 |
|---|---|
| Unit contract 不完整 | Spec 第 5.2 节补齐 `description`、`standard_alignments`、`learning_path_id`、`scenario_ids`、`assessment_ids`、`production_metadata` 等必填字段 |
| Assessment contract 不完整 | Spec 第 5.4 节补齐 `Assessment`、`AssessmentItem`、`ScoringStrategy` 和机械通过规则 |
| Mastery visibility 边界偏差 | Spec 第九节改为以 `is_visible_to_student`、`is_acceptable_to_record`、`visibility_scope` 为展示边界，confidence 只作为默认记录门槛 |
| 总括节点过宽 | 将 `lf_representation_switching` 调整为 `lf_representation_consistency`，聚焦“一致性检查”而非所有转换能力 |
| LearningPath contract 不足 | Spec 第 5.3 节补齐 `LearningPathStep` 字段要求 |

## 三、实现补强

本轮在 Spec 修复之外，新增了作者侧种子图和 validator：

1. `content/units/math-g8-s1-linear-function-concept/knowledge-graph.seed.json`
2. `scripts/validate-knowledge-graph.mjs`
3. `package.json` 新增 `validate:knowledge-graph`

Validator 当前检查：

1. Unit / learning path / assessment / node 必填字段。
2. UUID v4。
3. alias 引用有效。
4. prerequisite DAG 无环。
5. core node 不孤立。
6. 每节点至少 2 条 misconception。
7. 每节点至少 1 个 formative probe。
8. 禁止 `student_id`、`student_token`、`conversation_id` 等隐私定位 key。
9. shared-types 相关枚举值。
10. threshold、difficulty、estimated minutes 范围。
11. assessment target 与 node set 全量一致。
12. production metadata 必填字段。

## 四、验证命令

已通过：

```powershell
pnpm run validate:knowledge-graph
pnpm run ci
```

## 五、当前判定

冷审 P1 已修复，作者侧种子图可被增强 validator 验证，根目录 CI 已通过。第二轮替代冷审因子代理连续超时未完成，本次采用主线程严格复核替代补审，不伪造外部结论。

当前无 P0/P1 残留。Phase 1.3 可按 8.5 锁定。

## 六、剩余 P3

| 项 | 后续归属 |
|---|---|
| 课标 code 仍为 draft，需要学科顾问核对精确条目 | 学科顾问审阅 / Phase 2.4 RAG 资源 |
| 作者侧 JSON 尚未编译成 runtime `KnowledgeNode` / `Unit` / `LearningPath` / `Assessment` 文件 | Phase 1.4 或 Phase 2 content compiler |
