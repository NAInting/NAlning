# DeepTutor 外部参照分析与项目结合方案

分析日期：2026-04-25  
参照仓库：https://github.com/HKUDS/DeepTutor  
本地审阅快照：`%TEMP%/deeptutor-analysis` shallow clone  
适用项目：AI 时代新教育平台

## 1. 结论先行

DeepTutor 对我们项目有较高参考价值，但不建议直接作为主工程底座引入。

推荐定位：

1. 作为 Agent runtime、能力插件、教材 Book Engine、知识库/RAG、CLI 工具化的参考实现。
2. 不作为学生/教师/家长生产系统的直接依赖。
3. 不直接复用其记忆系统、用户数据流和 provider routing，因为它面向个人学习工具，我们面向 K-12 学校试点、未成年人数据、家校治理和可审计运行时。
4. 短期结合点应落在文档与类型层：把 DeepTutor 中验证过的“能力/工具/内容块/Book pipeline”抽象映射到我们的 `shared-types`、`agent-sdk`、`content-pipeline`、`llm-gateway`。
5. 中期可以做一个隔离 spike：用非学生、非真实隐私数据跑 DeepTutor CLI/Book Engine，验证它的教材生成与互动内容结构是否值得被我们 Phase 2 管线吸收。

综合评分：

| 维度 | 判断 |
| --- | --- |
| 作为外部参考 | 8.5/10 |
| 直接并入主工程 | 4/10 |
| 受控吸收架构模式 | 8/10 |
| 对 Phase 2 教材管线帮助 | 高 |
| 对 Phase 1 学生 Agent 帮助 | 中高 |
| 对治理/隐私层可直接复用度 | 低 |

## 2. DeepTutor 的核心架构观察

### 2.1 技术栈

DeepTutor 当前 README 标注 Python 3.11+、Next.js 16、Apache 2.0。后端是 Python 包，服务层包含 FastAPI、WebSocket、Typer CLI、Pydantic、SQLite、RAG、LLM provider registry 等；前端是 Next.js/React。

这与我们当前规划存在栈差异：

| 项目 | DeepTutor | 我们项目 |
| --- | --- | --- |
| 前端 | Next.js 16 / React | Vue 3 / Vite，已定版治理前端 |
| 后端 | Python / FastAPI 可选服务 | Node + Hono/Fastify + Prisma |
| 数据 | 文件 + SQLite + 本地目录为主 | Postgres + pgvector + 审计表 |
| 场景 | 个人学习/本地或自部署学习助手 | K-12 私立学校实验班，多角色治理 |
| 隐私目标 | 用户个人控制 | 未成年人、家校、教师边界、审计合规 |

结论：不能做“替换式采用”，只能做“模式借鉴 + 独立实现”。

### 2.2 两层 Agent 插件模型

DeepTutor 的 `AGENTS.md` 明确采用两层模型：

1. Tools：RAG、web search、code execution、reason、brainstorm、paper search、GeoGebra analysis 等原子工具。
2. Capabilities：Chat、Deep Solve、Deep Question 等多步骤能力。

其 `UnifiedContext` 会把 session、user message、history、enabled tools、active capability、knowledge bases、attachments、memory context、skills context 等统一传入所有 capability/tool。`ChatOrchestrator` 决定路由到默认 chat 或指定 deep capability，并输出统一 `StreamEvent`。

这对我们很重要。它说明 Agent runtime 不应该写成“一个巨大 prompt”，而应拆成：

| DeepTutor 概念 | 我们应吸收为 |
| --- | --- |
| `UnifiedContext` | `AgentInvocationContext` |
| `BaseCapability` | `AgentCapability` |
| `ToolRegistry` | `AgentToolRegistry` |
| `CapabilityRegistry` | `AgentCapabilityRegistry` |
| `StreamEvent` | `AgentRuntimeEvent` |
| `active_capability` | `AgentMode` / `TutorMode` |
| `knowledge_bases` | `KnowledgeBaseRef[]` |
| `memory_context` | 经过隐私过滤后的 memory projection |

关键改造：我们必须在 context 层加入 `tenant_id`、`school_id`、`actor_user_id`、`student_token`、`visibility_scope`、`privacy_level`、`consent_snapshot_id`、`audit_correlation_id`、`purpose`。DeepTutor 的 context 不足以承载学校治理边界。

### 2.3 流式事件协议

DeepTutor 的 `StreamEvent` 类型包括：

- `stage_start`
- `stage_end`
- `thinking`
- `observation`
- `content`
- `tool_call`
- `tool_result`
- `progress`
- `sources`
- `result`
- `error`
- `session`
- `done`

这套协议很适合我们未来做：

1. 学生端“正在思考/正在检索教材/正在生成提示”的可解释反馈。
2. 教师端日报生成进度。
3. 4-Agent 教材生产管线的阶段可视化。
4. Prompt/eval 审计日志。

但面向学生和家长时，要默认隐藏 `thinking` 与内部工具 trace，只展示“安全摘要”。教师侧也不能看到学生原始对话 trace。

### 2.4 Book Engine

DeepTutor 的 Book Engine 是最值得借鉴的部分。它不是简单生成 Markdown，而是把学习内容拆成 Book、Spine、Chapter、Page、Block、Progress。

关键模型：

- `BookProposal`
- `Spine`
- `ConceptGraph`
- `ExplorationReport`
- `SourceChunk`
- `Page`
- `Block`
- `Progress`

Block 类型包括：

- `text`
- `callout`
- `quiz`
- `user_note`
- `figure`
- `interactive`
- `animation`
- `code`
- `timeline`
- `flash_cards`
- `deep_dive`
- `section`
- `concept_graph`

这与我们 Phase 2 “AI 原生教材单元”高度吻合。我们的 `unit.yaml` 目前强调 `knowledge/pedagogy/narrative/implementation/quality` 五段，但还缺少一个足够工程化的“可渲染内容块层”。DeepTutor 的 Page/Block 模型可以补上这个空位。

建议我们在 Phase 2.1 `UNIT_SPEC.md` 的后续版本加入：

```yaml
runtime_content:
  pages:
    - page_id: string
      title: string
      target_nodes: [knowledge_node_id]
      blocks:
        - block_id: string
          block_type: text | callout | quiz | flash_cards | concept_graph | interactive | animation | timeline
          visibility_scope: student | teacher | guardian | admin
          source_trace: [...]
          confidence_score: ...
          payload: {}
```

这会让“教材生产管线”真正落到“可被学生端渲染的学习体验”。

### 2.5 记忆系统

DeepTutor 的记忆系统目前是两文件公共记忆：

- `SUMMARY.md`
- `PROFILE.md`

它会从最近对话中用 LLM 改写 summary/profile，然后注入后续 prompt。这个方案对个人工具很轻巧，但对我们不够安全。

不能直接采用的原因：

1. 没有 academic/emotional/personal 三桶隔离。
2. 没有 `visibility_scope`。
3. 没有同意快照。
4. 没有审计链。
5. 没有情绪数据 campus_local_only 硬约束。
6. 没有按学生/教师/家长角色生成不同 memory projection。

可以吸收的部分：

1. 学生可见的“我的画像/学习摘要”透明入口。
2. `memory show/clear` 这种用户可操作记忆的交互理念。
3. 每轮对话后异步摘要的流程。
4. 把长期记忆注入 prompt 时进行长度裁剪和相关性控制。

我们应保留自己的三层记忆架构：

| 记忆层 | 可借鉴 DeepTutor | 我们必须增强 |
| --- | --- | --- |
| Working Memory | session history 注入 | token budget、敏感词实时路由 |
| Episodic Memory | 对话摘要生成 | academic/emotional/personal 分桶、pgvector、删除权 |
| Semantic Memory | profile 改写 | 版本化、可解释、学生可见、教师投影受限 |

### 2.6 RAG/知识库

DeepTutor 的 RAGService 通过统一接口管理 KB 初始化、搜索、智能多 query 检索、结果聚合。它有一个值得采用的思路：先做 `SourceExplorer` 多查询扫描，再把 `ExplorationReport` 持久化，后续 Book 生成阶段复用检索结果，降低成本并提高确定性。

这对我们 Phase 2 很关键：

1. 学科专家 Agent 先对课标/教材/误区库做多 query source exploration。
2. 生成 `SourceTrace` 和 `ExplorationReport`。
3. 教学法 Agent、对话设计 Agent、工程实现 Agent 都只读这个 report，不重复检索。
4. 质检 Agent 可检查每个知识点是否有 source anchor。

我们要避免的点：

1. 不用文件目录 KB 作为正式存储。
2. 不用无租户隔离的 KB namespace。
3. 不把学生对话混入课程 RAG。
4. 不允许情绪类 memory 进入教师/教材 RAG。

### 2.7 LLM Provider Registry

DeepTutor 的 provider registry 覆盖很多 provider，包括 Zhipu、DashScope、Qianfan、SiliconFlow、AiHubMix、Ollama、LM Studio、vLLM 等，且区分 gateway、standard、local、oauth/direct。

这对我们 `packages/llm-gateway` 很有参考意义：

1. provider metadata 应集中注册。
2. OpenAI-compatible provider 可以统一 adapter。
3. 本地模型 provider 应标记 `is_local`。
4. gateway provider 应标记 `is_gateway`。
5. model thinking 参数差异要抽象。

但 DeepTutor 的 telemetry 目前偏基础，只做 call 成功/失败日志。我们的 LLM Gateway 必须增加：

- `purpose`
- `tenant_id`
- `student_token`
- `privacy_level`
- `provider_privacy_class`
- token/cost 统计
- prompt_version
- no raw student data logging
- campus_local_only 强制路由
- fallback/retry 审计

## 3. 与我们项目的结合点

### 3.1 阶段 0.1：统一数据模型

建议把 DeepTutor 触发的类型补强列入 0.1 后续增强，不要打断当前已定模型。

可新增或检查的 shared-types：

| 类型 | 作用 |
| --- | --- |
| `AgentCapability` | 描述能力模式，如 socratic_dialogue、deep_solve、quiz_generation |
| `AgentToolInvocation` | 工具调用事件，必须可审计 |
| `AgentRuntimeEvent` | 流式事件协议 |
| `KnowledgeBaseRef` | 指向课标、教材、单元、学生记忆等不同知识源 |
| `SourceTrace` | AI 内容来源追溯 |
| `UnitPage` | 单元内页面 |
| `UnitBlock` | 可渲染内容块 |
| `ContentBlockType` | text/quiz/flash_cards/concept_graph/interactive 等 |
| `ExplorationReport` | Phase 2 source exploration 的结构化结果 |
| `TutorWorkspace` | 学生 Agent 工作区，但必须绑定学生和隐私策略 |

0.1 审核重点：

1. 所有新增实体是否有 `created_at`、`updated_at`、`version`。
2. 所有会碰到学生数据的实体是否有 `visibility_scope`。
3. 所有 AI 生成内容是否有 `confidence_score` 和 `source_trace`。
4. `InterAgentSignal` 是否仍然只传信号，不传内容。

### 3.2 阶段 0.2：Monorepo

不建议把 DeepTutor repo 作为子模块放入主仓库。推荐创建：

```text
docs/external_references/
  DEEPTUTOR_INTEGRATION_ANALYSIS_2026-04-25.md

packages/
  agent-sdk/          # 吸收 Tools + Capabilities 思路，用 TypeScript 实现
  llm-gateway/        # 吸收 provider registry 思路
  privacy-filter/     # 强制过滤 DeepTutor 式 context/memory

apps/
  content-pipeline/   # 吸收 Book Engine pipeline 思路
```

如需实验 DeepTutor，应单独放在 `external-labs/` 或临时目录，不纳入生产构建。

### 3.3 阶段 0.3：LLM Gateway

DeepTutor provider registry 可以作为 provider metadata 的参考清单。我们应优先支持：

1. Zhipu：当前用户已配置，适合中国境内主力模型。
2. Qianfan：学校/政企场景可备选。
3. DashScope/Qwen：中文、教育和工具生态强。
4. SiliconFlow/4S API 类聚合平台：可以用于非隐私、非学生数据、内容生成和评测，不可默认用于 campus_local_only。
5. Ollama/vLLM/LM Studio：情绪与高敏本地降级路径。

### 3.4 阶段 0.4：向量记忆

DeepTutor 的 MemoryService 可作为“轻量透明 UX”参考，但正式架构必须走 pgvector + 三桶隔离：

| DeepTutor 做法 | 我们替代方案 |
| --- | --- |
| `SUMMARY.md` | `student_memory_snapshots` + version |
| `PROFILE.md` | `semantic_memory_records` |
| 文件读写 | Postgres + pgvector |
| 全局公共记忆 | academic/emotional/personal privacy bucket |
| 直接 prompt 注入 | 隐私过滤后的 memory projection |

### 3.5 阶段 1：学生 Agent MVP

DeepTutor 对 Phase 1 的可借鉴点：

1. 统一聊天工作台：同一会话内切换 Chat / Deep Solve / Quiz / Visualize。
2. 能力模式显式化：学生可以选择“导师模式/答疑模式”，系统也可以建议切换。
3. Knowledge Hub：学生对话可以引用当前单元、知识节点、错题、课标解释。
4. 记忆透明：学生能查看和清除某些记忆。
5. Trace UI：学生端只显示安全简化版，例如“正在查找课本内容”，不显示内部推理链。
6. Math Animator / Visualize：初二数学函数、几何可以用交互图形增强体验。

必须避免：

1. 不展示完整 reasoning/thinking。
2. 不把情绪内容上云。
3. 不把所有 memory 共享给 TutorBot。
4. 不允许老师看到学生原始问答。

### 3.6 阶段 2：4-Agent 教材生产管线

DeepTutor 的 Book Engine 是我们最该吸收的地方。

建议将 Phase 2 管线升级为：

```text
输入主题/课标
  -> Source Explorer：多 query 检索课标、教材、误区库
  -> 学科专家 Agent：生成 knowledge nodes + misconceptions
  -> 教学法 Agent：生成 learning path + activity design
  -> 对话/情境 Agent：生成 scenarios + dialogue scripts
  -> Block Planner：生成 UnitPage + UnitBlock
  -> 工程实现 Agent：生成 prompts/components/data hooks
  -> 质检 Agent：检查课标、隐私、教学法、可运行性、source trace
```

其中 `Block Planner` 是 DeepTutor 启发出来的新增关键层。没有它，教材生产很容易停留在文档层，难以渲染成学生端体验。

### 3.7 阶段 4：教师 Agent

DeepTutor 的 deep question、RAG trace、source anchor 对教师日报有帮助，但要做强隐私切割。

可吸收：

1. 日报建议背后的 source anchors。
2. 工具调用 trace 转成“依据链”。
3. 教师反馈作为 capability eval 数据。

不可吸收：

1. 学生原始对话作为 teacher context。
2. 学生个人 profile 直接进入教师 Agent。
3. 情绪关键词或情绪原文进入 teacher report。

## 4. 风险清单

| 风险 | 等级 | 原因 | 建议 |
| --- | --- | --- | --- |
| 隐私边界不匹配 | 高 | DeepTutor 面向个人用户，不是学校未成年人治理系统 | 只借鉴结构，不复用 memory/data flow |
| 技术栈不一致 | 中高 | Python/Next.js vs Node/Vue/Postgres | 不迁移主栈，TypeScript 重写核心抽象 |
| Provider 合规风险 | 高 | 聚合平台和海外 provider 可能处理学生数据 | LLM Gateway 强制 provider privacy class |
| 数据存储不可直接生产化 | 中 | 文件/SQLite/local dirs 不适合多租户学校 | Postgres + pgvector + tenant isolation |
| 功能诱惑导致范围膨胀 | 中 | DeepTutor 功能很多，容易干扰 Phase 0/1 主线 | 只吸收 Phase 1/2 关键模式 |
| License/归因 | 低中 | Apache 2.0 可用但需保留声明 | 如引用代码必须做 NOTICE/attribution |

## 5. 推荐落地路线

### 立即做

1. 保留本分析文档作为外部参照。
2. 在 0.1 shared-types 审核中检查是否已有 `AgentRuntimeEvent`、`Capability`、`SourceTrace`、`UnitBlock` 等类型。
3. 在 Phase 2.1 Unit Spec 后续增强中加入 DeepTutor 启发的 Page/Block 层。
4. 在 `llm-gateway` 的 provider registry 中参考 DeepTutor provider metadata，但加入 privacy class。

### 短期 spike

用非真实学生数据跑 DeepTutor 的 CLI 或 Book Engine：

1. 创建一个假课标/假教材 KB。
2. 试跑 Book Engine 生成一次“初二数学一次函数概念” living book。
3. 观察 block 类型、source anchor、quiz、concept graph 的质量。
4. 记录哪些字段值得迁入我们的 Unit Spec。

注意：spike 不能使用真实学生对话、家长信息、教师数据、情绪内容。

### 中期吸收

1. `packages/agent-sdk` 实现 Tools + Capabilities 模型。
2. `apps/content-pipeline` 实现 Unit Page/Block planner。
3. `packages/privacy-filter` 拦截所有 Agent context projection。
4. `apps/frontend-user` 只渲染安全版本的 runtime events。

## 6. 对当前工程阶段的明确建议

当前项目不应因 DeepTutor 改变主路线。它应该帮助我们把后续设计做得更稳：

1. Phase 0.1：把可扩展的 Agent/Unit/SourceTrace 类型补齐。
2. Phase 0.3：LLM Gateway provider registry 借鉴它的 provider 分类，但隐私策略必须更严格。
3. Phase 0.4：记忆透明 UX 可参考，记忆实现不可参考。
4. Phase 1：学生 Agent 的能力模式、知识库引用、视觉反馈可参考。
5. Phase 2：Book Engine 的 Page/Block/Spine/ConceptGraph 是重点吸收对象。

最终判断：DeepTutor 是一个很好的“同行样本”和“架构灵感库”，但我们的项目要做的是学校级、治理级、教材级 AI 教育平台，必须保持自己的数据模型、隐私边界、审计链和多角色产品结构。

## 7. 参考来源

- DeepTutor GitHub: https://github.com/HKUDS/DeepTutor
- README: https://github.com/HKUDS/DeepTutor/blob/main/README.md
- Agent architecture: https://github.com/HKUDS/DeepTutor/blob/main/AGENTS.md
- Agent-operable CLI skill: https://github.com/HKUDS/DeepTutor/blob/main/SKILL.md
- Python package config: https://github.com/HKUDS/DeepTutor/blob/main/pyproject.toml
- Book Engine source: https://github.com/HKUDS/DeepTutor/tree/main/deeptutor/book
- Services source: https://github.com/HKUDS/DeepTutor/tree/main/deeptutor/services
