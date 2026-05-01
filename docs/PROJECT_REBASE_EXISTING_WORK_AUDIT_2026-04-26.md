# 现有项目资产回头审计与整合建议

日期：2026-04-26  
依据：新版总规划 `docs/PROJECT_MASTER_PLAN_REBASE_2026-04-26.md`  
目的：根据 DeepTutor、OpenMAIC、GitHub 外部项目雷达带来的新认知，审查已经完成的项目资产是否需要修改、合并、补强或暂缓。

---

## 0. 总体判断

现有项目不需要推倒重来。相反，它已经打下了比多数开源 AI tutor 更厚的地基：

1. 已有 monorepo。
2. 已有 `shared-types` 数据模型。
3. 已有 LLM Gateway。
4. 已有 memory-store。
5. 已有后端骨架。
6. 已有 CI/test 基础。
7. 已有 content-pipeline。
8. 已有 runtime_content Page/Block。
9. 已有 AgentRuntimeEvent 和隐私投影。
10. 已有课程设计总提示和 OpenMAIC 增强版提示。

最新认知带来的变化不是“换方向”，而是“补横切接口”：

1. 外部标准适配：xAPI / H5P / content package / offline channel。
2. 实时语音伴学：LiveKit / Pipecat 方向的 spike。
3. 课程体验强化：misconception feedback、classroom action、PBL issueboard。
4. 内容包和离线部署：Kolibri 式校园内容频道。
5. 记忆评估：Mem0 / Letta 式 memory regression。

---

## 1. 当前资产分级

### 1.1 应继续作为主线保留

| 资产 | 判断 | 理由 |
| --- | --- | --- |
| `packages/shared-types` | 保留 | 统一数据模型是正确地基，已承载 privacy/source_trace/runtime_content |
| `packages/llm-gateway` | 保留 | provider routing、成本、隐私路由是长期核心 |
| `packages/memory-store` | 保留 | 三桶记忆和 pgvector 方向正确 |
| `packages/privacy-filter` | 保留 | Inter-Agent 和情绪数据边界必须独立 |
| `apps/content-pipeline` | 保留但收敛 | 安全链很强，但 provider follow-up 层级已明显变复杂 |
| `apps/frontend-user` | 保留 | 是学生/老师/家长真实端基础 |
| `apps/frontend-governance` | 保留 | 治理控制台仍是合规展示和管理员工作台 |
| `apps/backend` | 保留 | Hono/Fastify/Postgres 方向适合我们的栈 |
| `content/units/math-g8-s1-linear-function-concept/unit.yaml` | 保留 | 当前示例单元是 Phase 2 验证锚点 |

### 1.2 应补强但不立刻改代码

| 方向 | 需要补强 | 推荐动作 |
| --- | --- | --- |
| 外部标准 | 缺少 xAPI/content package/H5P/offline channel spec | 新增 `EXTERNAL_STANDARDS_ADAPTER_SPEC.md` |
| 实时语音 | 现有 Student Agent 偏文字/事件，缺 voice runtime | 新增 `VOICE_RUNTIME_SPIKE_SPEC.md` |
| 课程设计接入 | 新对话产出的课程设计尚未成为机器合同 | 新增 `CURRICULUM_DESIGN_IMPORT_CONTRACT.md` |
| Unit Spec | 尚未表达误区反馈图、课堂动作计划、PBL issueboard | 先更新文档预留，后改 schema |
| AgentRuntimeEvent | 目前是通用事件，还未覆盖 speech/whiteboard/PBL/action | 先写扩展 spec，不急改 enum |
| 内容包 | 课程不可打包分发 | 新增 manifest 草案 |
| memory eval | 记忆可见/删除已有方向，但缺回归测试规划 | 新增 memory regression spec |

### 1.3 应谨慎收敛

| 资产 | 风险 | 收敛建议 |
| --- | --- | --- |
| content-pipeline provider follow-up N-depth contract | 文件和文档已非常深，可能维护成本高于收益 | 做一次 `SAFE_EXECUTION_CONTRACT_COMPACTION_ADR.md`，把重复层级抽象成通用状态机 |
| 自动化心跳推进 | 长期很有价值，但容易把小任务拆太碎 | 更新自动化提示，优先完成 spec -> implementation -> verification 的闭环 |
| 外部项目参考 | 项目越找越多会稀释主线 | 只保留“影响路线图”的项目，其他进 parking lot |

### 1.4 暂不建议做

| 动作 | 原因 |
| --- | --- |
| 直接引入 OpenMAIC 代码 | AGPL-3.0 + React/Next 栈不匹配 + 治理不足 |
| 直接引入 Oppia/Kolibri/Open edX | 平台太重，会吞掉主线 |
| 立即接入 H5P runtime | 首版会增加复杂度，先做兼容思维 |
| 立即选择 LiveKit/Pipecat 进生产 | 需要 spike 后决策 |
| 立即把 Unit Spec 大改 | 先让文档和示例跑通，再逐步 schema 化 |
| 直接使用真实学生语音/对话测试 | 隐私风险高，必须用合成数据 |

---

## 2. 已有阶段审计

### 2.1 Phase 0 地基

状态：基本正确，需新增 `0.7`。

通过项：

1. Monorepo 已存在。
2. `shared-types` 已覆盖身份、内容、学习记录、agent、治理、通讯。
3. LLM Gateway 已有 provider/privacy/cost/cache/prompt registry 方向。
4. memory-store 已有 embedding、privacy、similarity、in-memory store。
5. backend skeleton 已有 Hono。
6. CI scripts 已存在。

缺口：

1. 当前目录不是 Git repo，`git status` 报错。这与“可回滚、Prompt 版本化、PR 审查”纪律冲突。
2. 缺少外部标准适配层。
3. 缺少 content package/offline channel spec。
4. 后端还不是完整真实业务后端，仍处骨架阶段。

建议：

1. `P1`：恢复或初始化 Git 工作树，并建立 `codex/` 分支工作流。
2. `P1`：新增 `Phase 0.7` spec。
3. `P2`：后端进入真实 API 前，补 idempotency/error/audit checklist。

### 2.2 Phase 1 学生 Agent

状态：规格和最小实现方向正确，但需要语音和 workspace 升级。

通过项：

1. Persona、记忆、知识图谱、掌握度、对话模式、隐私路由、学生 UI、内测文档已经成链。
2. `agent-sdk` 中已有 dialogue-modes、mastery-evaluator、memory-runtime、student-agent-runtime。
3. `AgentRuntimeEvent` 已经为 runtime telemetry 打基础。

缺口：

1. 语音仍未上升到独立 runtime。
2. 学生端还需要从 chat UI 升级为 learning workspace。
3. memory regression 和 transparency eval 还不够明确。

建议：

1. `P1`：新增 `VOICE_RUNTIME_SPIKE_SPEC.md`。
2. `P1`：新增 `STUDENT_LEARNING_WORKSPACE_SPEC.md`。
3. `P2`：新增 memory regression cases。

### 2.3 Phase 2 内容生产管线

状态：当前主战场，方向正确但需要把“可运行课程”继续下钻。

通过项：

1. Unit Spec 已有顶层 section。
2. runtime_content 已加入。
3. semantic validator 已覆盖 target node 和可见性。
4. provider execution review artifact 很谨慎，失败能 fail closed。
5. AgentRuntimeEvent 已与 content-pipeline workflow 有集成。

缺口：

1. Unit Spec 还缺 `misconception_feedback_routes`。
2. Unit Spec 还缺 `classroom_action_plan`。
3. Unit Spec 还缺 `voice_script`。
4. Unit Spec 还缺 `pbl_issueboard`。
5. Unit Spec 还缺 `content_package_manifest`。
6. Option A 仍可继续，但升级 Option B 的阈值应写入 ADR。
7. content-pipeline provider follow-up 文件膨胀明显，需抽象收敛。

建议：

1. `P0`：继续保留现有 Unit Spec，不立刻大改。
2. `P1`：新增 `CURRICULUM_DESIGN_IMPORT_CONTRACT.md`。
3. `P1`：新增 `CLASSROOM_ACTION_PLAN_SPEC.md`。
4. `P1`：新增 `MISCONCEPTION_FEEDBACK_ROUTE_SPEC.md`。
5. `P1`：新增 `SAFE_EXECUTION_CONTRACT_COMPACTION_ADR.md`。

### 2.4 Phase 3 批量课程

状态：尚未真正进入；必须等待 Phase 2 可运行课程对象稳定。

缺口：

1. 单元生产排期还不是工程对象。
2. 内容包和离线分发还没定义。
3. 单元风格指南还没和外部课程设计 Agent 的输出格式对齐。

建议：

1. Phase 3 前先完成 `content_package_manifest`。
2. 先生产 3 个 math units skeleton，而不是一次铺 15 个完整单元。
3. 每个单元都必须有学生侧、教师侧、学习任务、能力认证、隐私边界。

### 2.5 Phase 4 教师 Agent

状态：前端治理原型和教师链路已有基础，但 Agent 闭环还没进入真实运行。

通过项：

1. 教师 dashboard / intervention 链路已推进。
2. 教师隐私边界在前端规格里已经有意识。
3. InterAgentSignal 的隐私边界是核心设计。

缺口：

1. 教师 Agent 未真正消费学生 Agent 的安全信号流。
2. 课堂动作计划还没有教师预览和控制权。
3. 教师日报还没有和 content package / runtime event 串联。

建议：

1. Phase 4 前先完成 `TeacherSignalProjection` spec。
2. 教师端新增“AI 本节课计划做什么”的预演视图。
3. 干预链路继续保留“老师确认”作为硬边界。

### 2.6 Phase 5 家长 Agent

状态：治理概念完整，但真实产品还在后续。

缺口：

1. 家长周报 schema 还需和 LearningEvent/Mastery/TaskEvidence 对齐。
2. 家长不能变成实时监控端，这点需要后端投影保障，而不只是文案。

建议：

1. 家长端只消费 `GuardianSummaryProjection`。
2. 不允许直接查询 raw ConversationTurn。

### 2.7 Phase 8 Pilot 部署

状态：现有文档已覆盖试点，但外部雷达后需要加强离线和内容包。

缺口：

1. 校园内容频道未定义。
2. 弱网/断网课程运行未定义。
3. provider 不可用时课堂如何继续未定义。

建议：

1. 引入 Kolibri 式内容包和同步思路。
2. 每个单元必须有 offline fallback。
3. Pilot 前做一次“断网课堂演练”。

---

## 3. 对已有文档的整合建议

### 3.1 需要成为权威入口的文档

建议把以下文档作为当前 single source of truth：

1. `docs/PROJECT_MASTER_PLAN_REBASE_2026-04-26.md`
2. `docs/REVIEW_AND_SELF_CHECK_PROCESS.md`
3. `docs/UNIT_SPEC.md`
4. `docs/DEEPTUTOR_INFORMED_PROJECT_PLAN_2026-04-25.md`
5. `docs/OPENMAIC_DEEP_DIVE_AND_INTEGRATION_PLAN_2026-04-26.md`
6. `docs/GITHUB_EDTECH_REFERENCE_RADAR_2026-04-26.md`
7. `课程设计/AI原生课程设计总提示_OpenMAIC增强版_给新对话.md`

### 3.2 需要更新引用的文档

| 文档 | 更新点 |
| --- | --- |
| `docs/UNIT_SPEC.md` | 增加未来扩展说明：misconception routes、classroom action、voice script、content package |
| `docs/DEEPTUTOR_INFORMED_PROJECT_PLAN_2026-04-25.md` | 增加指向新版 master plan 和 OpenMAIC/radar 的说明 |
| `docs/PROJECT_EXECUTION_PLAYBOOK.md` | 增加 Phase 0.7、1.7B、外部项目 license gate |
| `docs/REVIEW_AND_SELF_CHECK_PROCESS.md` | 增加外部代码引入 gate、content package gate、voice privacy gate |

### 3.3 不建议继续扩写的区域

`docs/REVIEW_AND_SELF_CHECK_PROCESS.md` 的 content-pipeline checklist 已经非常长，尤其 provider execution delivery/follow-up 链条出现多层 N-depth 描述。继续直接追加会降低可读性。

建议改法：

1. 把重复模式抽象成独立 ADR。
2. Review process 只保留原则和入口。
3. 具体 contract 层级放到 machine-readable schema 和测试，不再在总流程文档里无限展开。

---

## 4. 当前最高价值改动清单

### P0：必须先补

1. 新增 `EXTERNAL_STANDARDS_ADAPTER_SPEC.md`。
2. 新增 `VOICE_RUNTIME_SPIKE_SPEC.md`。
3. 新增 `CURRICULUM_DESIGN_IMPORT_CONTRACT.md`。

### P1：短期补强

1. 新增 `CONTENT_PACKAGE_MANIFEST_SPEC.md`。
2. 新增 `MISCONCEPTION_FEEDBACK_ROUTE_SPEC.md`。
3. 新增 `CLASSROOM_ACTION_PLAN_SPEC.md`。
4. 新增 `SAFE_EXECUTION_CONTRACT_COMPACTION_ADR.md`。
5. 更新 `UNIT_SPEC.md` 的未来扩展段落。
6. 更新自动化任务提示词，让它优先处理新版 master plan。

### P2：中期补强

1. Open TutorAI CE 代码级深审。
2. Oppia exploration/feedback 结构深审。
3. Kolibri 内容频道深审。
4. LiveKit/Pipecat spike 前置研究。
5. xAPI vs Caliper 对比。

### P3：暂存

1. H5P runtime 实际接入。
2. Open edX/Moodle/Canvas 等 LMS 深接入。
3. 完整白板系统。
4. 生产级实时语音服务。

---

## 5. 风险清单

### R1：范围膨胀

外部项目越看越多，容易让项目同时想做 LMS、内容平台、AI classroom、voice agent、知识图谱、学校治理。

缓解：

1. 每个外部项目只吸收一个主启发。
2. 不引入大型依赖。
3. 先 spec，后 spike，再决定是否实现。

### R2：内容管线过度工程化

provider execution / inbox follow-up 已经非常安全，但复杂度可能超出当前团队维护能力。

缓解：

1. 抽象成通用状态机。
2. 减少 N-depth 手写重复文件。
3. 把复杂 contract 放测试和 schema，不堆在主流程文档。

### R3：课程设计和工程接口脱节

另一个课程设计 Agent 可能产出很漂亮但不可运行的课程。

缓解：

1. 用 `CURRICULUM_DESIGN_IMPORT_CONTRACT.md` 约束输出。
2. 每个课程设计必须产 `unit_runtime_contract.yaml`。
3. Codex 再转成正式 `unit.yaml`。

### R4：语音优势被误判

OpenMAIC 已有语音，普通语音问答不是护城河。

缓解：

1. 把语音定位为长期、低延迟、可打断、隐私路由、学习事件化。
2. 把语音能力和学生画像、无 AI 口头解释、教师安全摘要绑定。

### R5：隐私边界被体验需求冲击

实时语音、多 Agent 课堂、PBL 讨论会产生更多敏感数据。

缓解：

1. 所有语音/对话进入 privacy router。
2. 情绪/家庭/敏感内容 campus_local_only。
3. 教师/家长只看投影，不看原文。

### R6：缺少 Git 工作树

当前目录 `git status` 报错，不是 Git repo。这会影响可回滚、审查、分支和提交纪律。

缓解：

1. 明确当前项目是否应初始化 Git。
2. 若是正式工程，应建立 Git repo 和远端备份。
3. 在 Git 恢复前，任何大改动都应保持小文件、小步、可人工 diff。

---

## 6. 审计结论

当前项目评分：`8.2 / 10`

加分项：

1. 地基厚，隐私和治理意识明显强于多数开源项目。
2. shared-types、LLM Gateway、memory-store、content-pipeline 已经有真实工程形态。
3. DeepTutor 和 OpenMAIC 启发已经被吸收到 Page/Block 和 AgentRuntimeEvent。
4. 自查流程严格，fail-closed 意识好。

扣分项：

1. 外部标准适配和内容包尚未落地。
2. 实时语音伴学还停留在规划层。
3. 内容管线执行合同链过深，存在维护风险。
4. 当前目录不是 Git repo，工程纪律闭环不完整。
5. 课程设计 Agent 的输出尚未通过机器合同接入主系统。

升到 `8.5+` 的最短路径：

1. 完成 `EXTERNAL_STANDARDS_ADAPTER_SPEC.md`。
2. 完成 `VOICE_RUNTIME_SPIKE_SPEC.md`。
3. 完成 `CURRICULUM_DESIGN_IMPORT_CONTRACT.md`。
4. 更新 `UNIT_SPEC.md` 的未来扩展段。
5. 明确 Git 工作树/备份策略。

