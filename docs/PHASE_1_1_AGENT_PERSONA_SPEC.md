# Phase 1.1 Student Agent Persona Spec

版本：2026-04-22  
状态：Draft for teacher review  
适用阶段：阶段 1.1 学生 Agent 的人格与边界设计

## 一、阶段定位

阶段 1.1 的目标不是写一个好听的聊天机器人设定，而是建立学生 Agent 的上位法。后续所有 Student Agent prompt、记忆摘要、模式切换、情绪路由、教师信号和产品文案，都必须能追溯到这份人格与边界定义。

本阶段服务于阶段 1 的核心目标：做出第一个真正有连续感、有学习价值、有隐私边界的 AI 学伴。阶段 1.1 必须先于记忆系统运行时、知识图谱对话、掌握度评估和学生端真实 UI 深化。

## 二、输入依据

本 Spec 读取并继承以下已定版或当前有效文件：

| 来源 | 继承内容 |
|---|---|
| `docs/PROJECT_EXECUTION_PLAYBOOK.md` | 十阶段依赖、全局 Gate A-F、替代复审规则 |
| `docs/SCHEMA.md` | `AgentProfile`、`AgentMode`、三层记忆、InterAgentSignal、EmotionBaseline 约束 |
| `docs/PHASE_0_STATUS_AND_NEXT_STEPS.md` | 阶段 0 已完成的 shared-types、LLM Gateway、memory-store、backend、CI 基座 |
| `学生Agent_教师Agent_四层记忆架构白皮书_2026-04-12.md` | 学生 Agent / 教师 Agent 权责、四层记忆、只传信号不传原文 |
| `packages/shared-types/src/enums.ts` | `AgentMode`、`PrivacyLevel`、`MemoryPrivacyBucket`、`InterAgentSignalType` 等枚举 |

## 三、范围

本阶段必须产出：

1. `docs/AGENT_PERSONA.md`：学生 Agent 人格宪法。
2. 模式边界：至少定义 `mentor` 和 `tutor`，并说明 `companion` 在阶段 1 中只作为轻量情绪支持语气，不作为心理服务。
3. 不做清单：明确学生 Agent 绝不做什么。
4. 安全与情绪升级流程：普通卡顿、情绪异常、高危信号分别如何处理。
5. 隐私边界：原始对话、情绪层、个人层记忆如何隔离，以及传给教师 Agent 的内容边界。
6. 种子老师评审清单：后续给 2 名种子老师审阅时使用。
7. 自查报告：记录本阶段是否达到可评审状态。

本阶段不做：

1. 不实现真实 LLM prompt 运行时。
2. 不实现记忆写入与召回逻辑。
3. 不实现知识图谱或掌握度评估。
4. 不实现心理危机干预产品，只定义校内人工升级边界。
5. 不把教师 Agent 或家长 Agent 的人格写完，只定义学生 Agent 对它们的通讯边界。

## 四、已确认架构决策

| 决策 | 本阶段落地方式 |
|---|---|
| 事件溯源 | 人格文档要求所有关键学习判断来自 `LearningEvent` 和后续物化视图，不凭单轮对话给永久标签 |
| 三层记忆 | Working / Episodic / Semantic 三层在文档中定义使用边界 |
| 情节记忆三桶 | academic / emotional / personal 三桶在对话策略和共享策略中显式区分 |
| 情绪基线本地硬约束 | `EmotionBaseline` 只允许 campus-local 使用，文档禁止向教师/家长展示情绪原文 |
| 只传信号不传内容 | 对教师 Agent 只允许 `InterAgentSignal` 式结构化信号，不允许原始对话、摘录、学生原话 |
| 老师最终责任 | Student Agent 不能代替老师评价、处分或做最终教育判断 |

## 五、完工指标

| 指标 | 通过标准 |
|---|---|
| Persona 完整 | `docs/AGENT_PERSONA.md` 覆盖人格定位、称呼、能做、绝不做、情绪升级、争执姿态 |
| 模式清晰 | `mentor` 与 `tutor` 响应风格差异可测试，`companion` 边界克制 |
| 隐私可审 | 明确 raw conversation 不传教师/家长，情绪异常只传抽象信号 |
| 与 schema 对齐 | 使用 shared-types 中已有枚举语义，不创造冲突的新运行模式 |
| 可 prompt 化 | 文档中包含可直接转为 system prompt 的宪法段落 |
| 可教师评审 | 包含种子老师评审问题和通过标准 |
| CI 不回归 | 文档变更后 `pnpm run ci` 通过 |

人工外部指标：

1. 至少 2 名种子老师审阅 `docs/AGENT_PERSONA.md`。
2. 老师反馈“这个 Agent 可以先进入受控内测对话设计”。
3. 若老师提出 P0/P1 边界风险，本阶段不能锁定。

## 六、自查流程

本阶段自查按以下顺序执行：

1. 完整性自查：检查人格、能力、不做清单、情绪升级、隐私边界、示例话术是否齐全。
2. 治理自查：逐条回答“谁能看、谁能改、是否留痕、是否可能泄露隐私”。
3. InterAgentSignal 自查：确认教师侧只收到结构化信号，不收到原始对话、关键词、摘录或自由文本理由。
4. 记忆自查：确认 academic / emotional / personal 三桶没有混用。
5. Prompt 风险自查：确认没有鼓励代写、讨好、心理诊断、政治讨论、教师评价、学生标签化。
6. 本地工程自查：运行 `pnpm run ci`，确认文档变更未造成工程回归。

## 七、替代复查流程

Claude Code 暂不可用时，阶段 1.1 允许使用替代复查：

1. Codex 主线程完成文档并做证据自查。
2. 可启动独立 Codex 子代理冷读复审，重点审人格边界、情绪升级、隐私泄露和教师可用性。
3. 若主线程或子代理发现 P0/P1，本阶段不得定版。
4. 复查结论写入 `docs/PHASE_1_1_SELF_REVIEW.md`，待 Claude 恢复后可补外部复核。

## 八、风险清单

| 风险 | 表现 | 本阶段防线 |
|---|---|---|
| Agent 讨好学生 | 学生要求答案、代写或辱骂时 Agent 退让 | 真相优先、边界清楚、温和但不迎合 |
| Agent 变成监控工具 | 老师/家长看到过多对话和情绪细节 | 只传抽象信号，不传原文 |
| Agent 伪心理咨询 | 对高危情绪做诊断或治疗建议 | 只做支持性回应和校内人工升级 |
| Agent 替代老师 | 自动处分、贴标签、最终评价 | 明确老师有解释权、覆盖权、否决权 |
| 学习体验太像软件 | 文案机械、只给分数和任务 | 人格强调伙伴感、好奇心、学习者主体性 |
| Prompt 漂移 | 后续 prompt 各写各的 | `persona_version` 绑定本文件版本 |

## 九、阶段出口

当前 Codex 可完成到“内部 8.5、可交种子老师审阅”。  
最终锁定仍需要人工老师反馈，因为人格边界不是纯工程问题，必须经过真实教育者判断。

