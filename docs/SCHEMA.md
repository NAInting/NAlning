# Shared Types Schema 总览

版本：2026-04-21  
代码来源：`packages/shared-types`

## 一、定位

`packages/shared-types` 是 AI 原生教育平台的数据契约源。它不是某个前端或后端的局部类型文件，而是后续模块共同依赖的 shared contract：

- 前端页面使用它约束 view model 和 API 响应。
- 后端使用它约束输入输出和 OpenAPI 生成。
- Agent 运行时使用它约束记忆、信号、模式和隐私边界。
- 教材生产管线使用它约束 Unit、KnowledgeNode、Scenario、Assessment 等内容结构。

## 二、全局约束

所有核心业务实体继承 `BaseEntity` 语义：

| 字段 | 含义 |
|---|---|
| `id` | UUID v4 |
| `created_at` | ISO 8601 timestamp with offset |
| `updated_at` | ISO 8601 timestamp with offset |
| `version` | 非负整数版本号 |
| `deleted_at` | 可选软删除时间 |

涉及隐私边界的实体使用 `VisibilityScope`：

| 字段 | 含义 |
|---|---|
| `visible_to_roles` | 可见角色 |
| `visible_to_relations` | 可见关系 |
| `excluded_fields_by_role` | 不同角色需要排除的字段 |

AI 生成内容使用 `AIGeneratedField<T>` 包装：

| 字段 | 含义 |
|---|---|
| `value` | AI 生成值 |
| `confidence` | 0 到 1 的置信度 |
| `model_version` | 模型版本 |
| `prompt_version` | Prompt 版本 |
| `generated_at` | 生成时间 |
| `human_reviewed` | 是否经过人工审阅 |
| `reviewer_id` | 可选审阅人 |

## 三、模块结构

```text
packages/shared-types/src/
├── base.ts
├── enums.ts
├── index.ts
├── identity/
├── content/
├── learning/
├── agent/
├── governance/
├── communication/
└── testing/
```

## 四、身份类实体

| 实体 | 文件 | 用途 |
|---|---|---|
| `User` | `identity/user.ts` | 所有登录账号基础实体 |
| `Student` | `identity/student.ts` | 学生实体，承载学籍、年级、班级等引用 |
| `Teacher` | `identity/teacher.ts` | 教师实体，承载学科、权限等级等 |
| `Guardian` | `identity/guardian.ts` | 监护人实体，承载通知偏好和关系信息 |
| `Admin` | `identity/admin.ts` | 管理员实体，承载作用域和权限 |
| `School` | `identity/school.ts` | 学校实体 |
| `Class` | `identity/class.ts` | 班级实体 |
| `TeacherStudentBinding` | `identity/relationships.ts` | 教师-学生绑定 |
| `GuardianStudentBinding` | `identity/relationships.ts` | 监护人-学生绑定 |

## 五、内容类实体

| 实体 | 文件 | 用途 |
|---|---|---|
| `Subject` | `content/subject.ts` | 学科枚举 |
| `Unit` | `content/unit.ts` | AI 原生教材单元 |
| `KnowledgeNode` | `content/knowledge-node.ts` | 知识节点 |
| `LearningPath` | `content/learning-path.ts` | 学习路径 |
| `Scenario` | `content/scenario.ts` | 情境设计 |
| `DialogueScript` | `content/dialogue-script.ts` | 对话脚本 |
| `Assessment` | `content/assessment.ts` | 评估集合 |
| `AssessmentItem` | `content/assessment.ts` | 单个题目或表现任务 |

## 六、学习记录类实体

| 实体 | 文件 | 用途 |
|---|---|---|
| `LearningEvent` | `learning/learning-event.ts` | 事件溯源核心事实表 |
| `Conversation` | `learning/conversation.ts` | 一次学生-Agent 会话 |
| `ConversationTurn` | `learning/conversation.ts` | 会话轮次 |
| `ConversationAccessRecord` | `learning/conversation.ts` | 会话访问记录 |
| `MasteryRecord` | `learning/mastery.ts` | 掌握度物化记录 |
| `MasteryHistory` | `learning/mastery.ts` | 掌握度历史 |

事件溯源原则：

- `LearningEvent` 是学习行为的事实源。
- `MasteryRecord` 和 `StudentMemorySnapshot` 是物化视图，不应反向替代事件事实。
- 后续后端索引设计应优先覆盖 `student_id`、`event_type`、`occurred_at`、`knowledge_node_id`、`unit_id`。

高敏学习数据可见性：

- `Conversation` 必须声明 `visibility_scope`。
- `MasteryRecord` 必须声明 `visibility_scope`。
- `MasteryHistory` 必须声明 `visibility_scope`。
- `LearningEvent` 必须声明 `visibility_scope`。

## 七、Agent 与记忆实体

| 实体 | 文件 | 用途 |
|---|---|---|
| `AgentProfile` | `agent/agent-profile.ts` | Agent 人格、能力、隐私设置 |
| `AgentPrivacySettings` | `agent/agent-profile.ts` | Agent 隐私设置 |
| `AgentMode` | `agent/agent-mode.ts` | Agent 模式 |
| `WorkingMemory` | `agent/agent-memory.ts` | 当前对话工作记忆 |
| `EpisodicMemoryEntry` | `agent/agent-memory.ts` | 情节记忆 |
| `StudentMemorySnapshot` | `agent/agent-memory.ts` | 学生稳定画像快照 |
| `KnowledgeProfile` | `agent/agent-memory.ts` | 知识掌握画像 |
| `LearningStyleProfile` | `agent/agent-memory.ts` | 学习偏好画像 |
| `InterestProfile` | `agent/agent-memory.ts` | 兴趣画像 |

三层记忆原则：

- Working Memory：当前会话最近 N 轮。
- Episodic Memory：历史会话摘要，按 `academic`、`emotional`、`personal` 三桶隔离。
- Semantic Memory：学生稳定画像，由 `StudentMemorySnapshot` 表达，按版本记录。
- `EpisodicMemoryEntry` 和 `StudentMemorySnapshot` 必须声明 `visibility_scope`。

## 八、治理实体

| 实体 | 文件 | 用途 |
|---|---|---|
| `ConsentRecord` | `governance/consent.ts` | 同意书记录 |
| `ConsentScope` | `governance/consent.ts` | 同意授权范围 |
| `AuditLogEntry` | `governance/audit-log.ts` | 审计日志 |
| `AppealTicket` | `governance/appeal.ts` | 申诉单 |
| `AppealStateTransition` | `governance/appeal.ts` | 申诉状态流转 |
| `AppealResolution` | `governance/appeal.ts` | 申诉处理结论 |
| `ConfidenceScore` | `governance/confidence-score.ts` | 置信度评分 |
| `AccessScope` | `governance/access-scope.ts` | 权限作用域 |

治理原则：

- 任何关键数据访问都应能关联 `AuditLogEntry`。
- 任何 AI 评分展示前应具备置信度判断。
- 同意书必须版本化，撤回和过期不可被覆盖。
- 申诉状态必须可追踪，不允许只存当前状态而丢失流转。

## 九、通讯与隐私实体

| 实体 | 文件 | 用途 |
|---|---|---|
| `InterAgentSignal` | `communication/inter-agent-signal.ts` | Agent 间结构化信号 |
| `PrivacyFilterRule` | `communication/privacy-filter-rule.ts` | 隐私过滤规则 |
| `EmotionBaseline` | `communication/emotion-baseline.ts` | 情绪基线 |

Agent 间通讯原则：

- 只传信号，不传原始内容。
- `source_agent_type` 当前限定为 `student_agent`。
- `payload` 严禁包含原始对话相关字段。
- 信号必须记录 `privacy_filter_passed`、`privacy_filter_version` 和 `audit_log_id`。
- 干预建议使用 `reason_codes` 和 `suggested_action_codes`，不允许 `rationale_summary` / `suggested_actions` 这类自由文本字段。
- 里程碑信号使用 `display_code`，不允许 `description` 自由文本字段。

当前 schema 明确禁止以下 payload key 穿透：

```text
content
conversation_text
conversation_excerpt
raw_text
full_transcript
transcript
student_response
agent_response
rationale_summary
suggested_actions
description
```

情绪基线原则：

- `EmotionBaseline.storage_location` 强制为 `PrivacyLevel.CAMPUS_LOCAL_ONLY`。
- `EmotionBaseline` 必须声明 `visibility_scope`。
- 情绪基线只服务本地判断和高敏路由，不应跨 Agent 暴露明细。

## 十、核心枚举族

枚举集中在 `src/enums.ts`，便于前端、后端和 Agent 共享。

关键枚举包括：

- 身份与权限：`UserRole`、`RelationType`、`AdminPermission`、`AdminScope`
- 学校与学科：`SchoolType`、`Grade`、`Subject`
- Agent：`AgentType`、`AgentMode`、`AgentTone`
- 隐私与治理：`PrivacyLevel`、`ConsentType`、`ConsentStatus`、`AppealState`、`AuditOutcome`
- 学习记录：`LearningEventType`、`MasteryLevel`、`RetentionPolicy`
- 内容生产：`UnitStatus`、`PedagogyType`、`AssessmentType`、`ScoringMethod`
- 通讯信号：`InterAgentSignalType`、`SignalUrgency`、`TrendDirection`、`RiskCategory`

## 十一、测试与种子数据

测试入口：

```powershell
cd packages/shared-types
npm run typecheck
npm test
```

当前验证结果：

- TypeScript 类型检查通过。
- Vitest 108 条测试通过。
- `buildSeedDataset()` 可作为 contract 测试样本源。

## 十二、后续演进规则

新增实体或字段时必须遵守：

1. 先改 TypeScript interface。
2. 再改 Zod schema。
3. 再补测试样本。
4. 再导出到 `src/index.ts`。
5. 再更新本文件。
6. 涉及隐私或 AI 生成内容时，必须同步更新自查报告。

禁止：

- 禁止用 `any` 绕过 schema。
- 禁止在业务 app 内复制 shared-types 中已有实体。
- 禁止 InterAgentSignal 携带原始对话内容。
- 禁止情绪基线出 campus local 边界。
