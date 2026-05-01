# GitHub 教育 AI / 互动学习项目雷达

日期：2026-04-26  
目的：从 GitHub 开源项目中寻找能启发“AI 时代新教育”项目规划、架构、课程设计和工程路线的参考。  
使用方式：本文件不是“直接照抄清单”，而是项目路线图的外部参照雷达。任何代码引入前必须先做 license、技术栈、隐私和商业策略审查。

---

## 0. 总结结论

我们现在不缺“再找一个 AI 聊天 tutor”。真正值得吸收的是不同项目里的成熟模块思想：

1. OpenMAIC 证明“多 Agent 课堂 + 语音 + 白板 + PBL + 可播放动作层”已经是可行体验，提醒我们语音不是唯一护城河，长期记忆和学校治理才是护城河。
2. Oppia 证明“互动探索 + 误区反馈 + learner-centered authoring”比普通课件更适合 AI 原生教材。
3. Kolibri 证明“离线优先 + 内容频道 + 校园低资源部署”是教育落地的硬能力，不是边缘功能。
4. H5P / Lumi 证明互动内容应该有可复用、可打包、可嵌入的内容类型体系。
5. xAPI / LRS 证明学习事件可以标准化表达，我们的 `LearningEvent` 可以保留项目内事实源，同时提供 xAPI 导出适配。
6. LiveKit / Pipecat 证明实时语音 Agent 的工程路径已经清晰，未来学生伴学语音不应停留在“按钮录音 -> 转文字”。
7. Mem0 / Letta 证明长期记忆需要可见、可测试、可删除、可评估，不只是把聊天记录塞进向量库。
8. PedagogicalRL / multi-agent eval 项目提醒我们：学生 Agent 必须被“是否促进学习”评估，而不是只评估回答是否正确。

路线图建议：

1. 短期不直接引入任何大型外部代码库。
2. 新增一个 `Phase 0.7 外部标准与参考适配层`，包括 xAPI 导出、内容包 manifest、H5P 兼容评估、Kolibri 式离线包策略。
3. 新增一个 `Phase 1.7B 实时语音伴学 Spike`，对 LiveKit / Pipecat / OpenAI-compatible streaming provider 做小型验证。
4. Phase 2 课程生产管线吸收 Oppia 的 misconception feedback、OpenMAIC 的 scene/action、H5P 的 interactive content type。
5. Phase 3 批量课程生产前，建立“课程包格式 + 离线校园分发 + 互动块运行时”。

---

## 1. 值得重点跟踪的项目

### 1.1 Open TutorAI CE

项目链接：[Open-TutorAi/open-tutor-ai-CE](https://github.com/Open-TutorAi/open-tutor-ai-CE)  
项目定位：开源个性化沉浸学习平台，支持 AI tutor、avatar、RAG、课程、工作区等。

对我们的启发：

1. 学生端可以从“聊天框”升级成“沉浸式 tutor workspace”。
2. 如果它的 avatar / workspace 设计成熟，可以作为学生伴学 UI 的参考，不直接拷代码。
3. 它可能比 OpenMAIC 更接近“个人长期学习空间”，值得后续做代码级深入审查。

对我们路线图的影响：

1. Phase 1 学生 Agent UI 可以新增“学习工作区”概念，而不是只有对话流。
2. Phase 1.7 语音 UI 可以参考 avatar / voice / workspace 的组合方式。
3. 但必须坚持我们的隐私边界、长期记忆、教师信号投影和无 AI 区。

风险：

1. 需要单独确认 license 和商业兼容性。
2. 若其存储/权限模型不足，不能作为我们学校级事实源。

### 1.2 Oppia

项目链接：[oppia/oppia](https://github.com/oppia/oppia)  
项目定位：开源互动学习平台，核心是“Exploration”式互动课程和反馈。

对我们的启发：

1. AI 原生教材不应只有线性 Page/Block，还应支持“学生回答 -> 误区识别 -> 分支反馈 -> 重新尝试”的探索图。
2. 每个知识节点可以有 misconception feedback rules，帮助学生暴露真实理解。
3. 课程作者工具很重要，未来不能只靠工程师写 `unit.yaml`。

对我们路线图的影响：

1. 在 `UnitSpec` 中增加或预留 `feedback_rules` / `misconception_routes`。
2. Phase 2 semantic validator 应检查每个关键误区是否至少有一个反馈路径。
3. Phase 3 批量生产时，应评估“AI 追问路径”而不是只评估静态内容。

风险：

1. Oppia 是成熟平台但栈很重，不适合直接合并。
2. 我们应借鉴课程交互模型，不引入整套平台。

### 1.3 Kolibri

项目链接：[learningequality/kolibri](https://github.com/learningequality/kolibri)  
项目定位：离线优先的开源教育平台，服务低资源、弱网络、校园本地部署场景。

对我们的启发：

1. 真实学校部署不能假设公网稳定。
2. AI 原生教材、视频、互动块、模型缓存、语音资源，都应该能打包为校园内容频道。
3. 学生设备、教室网络、校园服务器之间需要内容同步策略。

对我们路线图的影响：

1. Phase 0.2/0.5 之后新增“Campus Content Channel”设计。
2. Phase 3 批量课程单元产出时，同时产出 `content_package_manifest.json`。
3. Phase 8 pilot 部署前，要求一个班级可在校园内网访问核心课程包。

风险：

1. Kolibri 不是 AI 原生系统，不应照搬教学模型。
2. 它的价值主要在部署和内容分发，不在 Agent 逻辑。

### 1.4 H5P / Lumi / H5P Nodejs Library

项目链接：

1. [h5p/h5p-php-library](https://github.com/h5p/h5p-php-library)
2. [LumiEducation/H5P-Nodejs-library](https://github.com/LumiEducation/H5P-Nodejs-library)
3. [LumiEducation/Lumi](https://github.com/LumiEducation/Lumi)

项目定位：互动学习内容类型、编辑器、播放器和打包生态。

对我们的启发：

1. AI 原生课程里的互动块不应该每次从零定义。
2. `interactive_simulation`、`quiz_probe`、`drag_sort`、`timeline`、`hotspot`、`branching_scenario` 可以形成标准内容类型。
3. H5P 可以作为导入/导出或内容类型参考，而不是立即成为核心 runtime。

对我们路线图的影响：

1. `UnitBlock.type` 可继续扩展，但要避免变成自由文本泥潭。
2. 新增 `interactive_block_capabilities`，描述一个互动块需要拖拽、画图、选择、排序、模拟还是代码 sandbox。
3. 未来可以做 H5P adapter，把部分课程块导出为 H5P，方便学校或教师复用。

风险：

1. H5P 内容生态多，但和 AI 运行时、长期记忆、隐私边界没有天然集成。
2. 不建议第一阶段把 H5P runtime 作为硬依赖。

### 1.5 Open edX / Moodle / Canvas / Frappe LMS / LearnHouse

项目链接：

1. [openedx/edx-platform](https://github.com/openedx/edx-platform)
2. [moodle/moodle](https://github.com/moodle/moodle)
3. [instructure/canvas-lms](https://github.com/instructure/canvas-lms)
4. [frappe/lms](https://github.com/frappe/lms)
5. [learnhouse/learnhouse](https://github.com/learnhouse/learnhouse)

项目定位：LMS、课程管理、学习路径、作业、证书、机构运营。

对我们的启发：

1. 学校落地需要课程、班级、报名、进度、证书、报告等运营能力。
2. 我们现在聚焦 AI 原生学习和治理，后续仍需要 LMS 级工作流。
3. LearnHouse / Frappe LMS 更轻，可作为未来产品后台体验参考。

对我们路线图的影响：

1. 不要在 Phase 0 重造完整 LMS。
2. Phase 5/8 前补齐学校运营基本对象：course offering、class cohort、calendar、assignment window、teacher roster。
3. 管理员端未来要兼容学校已有 LMS，而不是强迫替换。

风险：

1. 这些平台很重，直接引入会吞掉主线。
2. 我们的差异化不在 LMS，而在 AI 原生教材 + 伴学 Agent + 教师信号闭环。

---

## 2. 实时语音 / 伴学 Agent 方向

### 2.1 LiveKit Agents

项目链接：[livekit/agents](https://github.com/livekit/agents)  
定位：实时语音、视频、WebRTC Agent 基础设施。

对我们的启发：

1. 如果要做“像真人一样实时语音伴学”，需要 WebRTC 级实时音频链路，而不是普通 HTTP 录音上传。
2. 学生打断 AI、AI 继续上下文、低延迟 TTS/ASR，都需要专门的 voice session runtime。
3. LiveKit 的价值在媒体通道和实时房间，不在教育逻辑。

建议：

1. Phase 1.7B 做 LiveKit spike。
2. 验证学生端 Vue 是否能稳定接入实时语音房间。
3. 不把学习记忆放进 LiveKit，只把它当实时音频通道。

### 2.2 Pipecat

项目链接：[pipecat-ai/pipecat](https://github.com/pipecat-ai/pipecat)  
定位：实时语音/多模态 Agent pipeline，连接 STT、LLM、TTS、VAD、transport。

对我们的启发：

1. 语音 Agent 应是 pipeline：VAD -> STT -> LLM -> TTS -> interruption -> event logging。
2. Provider abstraction 很重要，尤其我们会用国内模型、OpenAI-compatible 聚合平台、本地模型。
3. 语音事件必须落成 `ConversationTurn` 和 `LearningEvent`，不能只是播放音频。

建议：

1. Phase 1.7B 同时评估 Pipecat，尤其是 provider 可插拔性。
2. 如果最终后端是 Node/Hono，也可以把 Pipecat 作为独立 voice worker，而不是主后端。

### 2.3 我们的实时语音定位

OpenMAIC 已经有 ASR/TTS，但更像课堂内按键语音。我们的目标应该更高：

1. 常驻但可控：学生授权后进入低摩擦语音伴学，不是每次点按钮。
2. 可打断：学生可以自然打断 AI。
3. 有长期记忆：语音不是一次性对话，而会回到学生画像。
4. 有隐私路由：情绪、家庭、敏感内容 campus_local_only。
5. 可生成学习证据：口头解释、无 AI 口述、迁移讲解都能成为能力认证证据。

---

## 3. 长期记忆与 RAG 方向

### 3.1 Mem0

项目链接：[mem0ai/mem0](https://github.com/mem0ai/mem0)  
定位：面向 AI Agent 的长期记忆层。

对我们的启发：

1. 记忆需要显式抽取、更新、检索、遗忘、评估。
2. 记忆不是聊天记录，而是经过治理的学生画像和情节摘要。
3. memory eval 很关键，要测试 Agent 是否正确引用旧记忆、是否引用错人、是否泄漏隐私。

对我们路线图的影响：

1. Phase 1.2 记忆系统要新增 memory regression tests。
2. 对每个学生维护 academic / emotional / personal 三桶隔离。
3. 情绪桶不能跨 Agent 给教师，只能产生抽象 signal。

### 3.2 Letta

项目链接：[letta-ai/letta](https://github.com/letta-ai/letta)  
定位：带持久记忆和可管理状态的 Agent framework。

对我们的启发：

1. Agent 状态应该可见、可审查、可迁移。
2. 学生可以查看自己的画像变化，这和我们的透明性原则一致。
3. 记忆删除权需要从一开始就进入数据模型。

建议：

1. 不直接换 Agent framework。
2. 借鉴 memory block、agent state inspection、memory governance 的思想。

---

## 4. 学习事件标准与分析方向

### 4.1 xAPI / Learning Record Store

项目链接：

1. [adlnet/xAPI-Spec](https://github.com/adlnet/xAPI-Spec)
2. [LearningLocker/learninglocker](https://github.com/LearningLocker/learninglocker)

定位：学习活动事件标准和学习记录存储。

对我们的启发：

1. 我们的 `LearningEvent` 可以保持内部事件溯源，但提供 xAPI 兼容导出。
2. 这样未来可与学校、研究机构、第三方分析系统对接。
3. xAPI 的 actor / verb / object / result / context 可以帮助规范“学生做了什么”。

对路线图的影响：

1. Phase 0.1/0.5 后新增 `learning-event-xapi-adapter`。
2. 不使用 LRS 作为事实源，Postgres 事件表仍是事实源。
3. 输出给外部时必须经过隐私过滤和去标识化。

### 4.2 IMS Caliper

项目链接：[IMSGlobal/caliper-spec](https://github.com/IMSGlobal/caliper-spec)  
定位：学习分析事件标准。

建议：

1. Phase 0 不必实现。
2. 做一次 xAPI vs Caliper 对比，先选一个导出 profile。

---

## 5. 多 Agent / 教学质量评估方向

### 5.1 PedagogicalRL / 教学型 Agent 评估

项目链接：[thrunlab/PedagogicalRL](https://github.com/thrunlab/PedagogicalRL)  
定位：用教学目标评估/优化 tutor 行为的研究项目。

对我们的启发：

1. Tutor 不是回答越完整越好，而是越能促进学生学习越好。
2. 要评估 AI 是否过早给答案、是否追问有效、是否让学生自己表达。
3. 可以构建 synthetic student + judge 来跑 prompt regression。

对路线图的影响：

1. Phase 1.5 学生 Agent 模式测试必须包含“是否直接代答”。
2. Phase 2 QA Agent 不只检查事实正确，也检查教学行为是否合格。
3. 新增 eval case：学生问“直接告诉我答案”，Agent 是否按模式边界处理。

### 5.2 AG2 / AutoGen / CAMEL / MetaGPT

项目链接：

1. [ag2ai/ag2](https://github.com/ag2ai/ag2)
2. [microsoft/autogen](https://github.com/microsoft/autogen)
3. [camel-ai/camel](https://github.com/camel-ai/camel)
4. [geekan/MetaGPT](https://github.com/geekan/MetaGPT)

定位：多 Agent 编排、协作、工具调用、代码/任务生成。

对我们的启发：

1. 多 Agent 内容生产必须有 ownership、schema、review artifact、retry gate。
2. 不能让自然语言在 Agent 间随便传递，否则不可审查。
3. 需要可回放的 prompt、输出、成本和失败原因。

对路线图的影响：

1. 我们现有 `agent-workflow-eval-review` 方向是正确的。
2. 不建议直接引入大型 Agent framework。
3. 先保留我们自己的状态机和 schema gate，避免框架绑架教育逻辑。

---

## 6. 互动课堂与白板方向

### 6.1 Excalidraw / tldraw

项目链接：

1. [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw)
2. [tldraw/tldraw](https://github.com/tldraw/tldraw)

定位：开源白板/画布。

对我们的启发：

1. 数学、地理、科学都需要画图、标注、拖拽和空间理解。
2. AI 课堂动作层需要白板事件，而不是只生成静态图。
3. 老师也需要能接管白板。

建议：

1. Phase 1/2 不直接做完整白板。
2. 先把 `whiteboard_action` 事件放进 runtime contract。
3. 前端后续选择 tldraw 或自研轻量 SVG/canvas runtime。

### 6.2 Jupyter / Thebe / Observable 风格交互

项目链接：

1. [jupyterlab/jupyterlab](https://github.com/jupyterlab/jupyterlab)
2. [executablebooks/thebe](https://github.com/executablebooks/thebe)

对我们的启发：

1. 高中数学、物理、数据、地理可引入可执行互动块。
2. 但 K-12 场景必须有 sandbox 和教师审查。

建议：

1. `UnitBlock.sandbox` 已经是正确方向。
2. Phase 2 semantic validator 要继续禁止无 sandbox 的 executable block。

---

## 7. 对项目路线图的具体改造建议

### 7.1 新增 Phase 0.7：外部标准与参考适配层

目的：不改变主架构，但给未来兼容和扩展留下接口。

交付物：

1. `docs/EXTERNAL_STANDARDS_ADAPTER_SPEC.md`
2. `LearningEvent -> xAPI` 映射表。
3. `Unit Package Manifest` 草案。
4. `H5P compatibility notes`。
5. `Campus Content Channel` 包格式草案。

完工指标：

1. 一个示例 `LearningEvent` 能被映射为 xAPI-like statement。
2. 一个示例 `unit.yaml` 能生成 content package manifest。
3. 明确哪些字段不能导出给外部系统。

### 7.2 新增 Phase 1.7B：实时语音伴学 Spike

目的：验证“像真人一样实时沟通”的技术路径。

评估对象：

1. LiveKit Agents。
2. Pipecat。
3. OpenAI-compatible 国内 provider streaming。
4. 本地 VAD / STT / TTS 组合。

最小 POC：

1. 学生浏览器进入 voice session。
2. 可打断 AI。
3. 语音 turn 写成 `ConversationTurn`。
4. 口头解释写成 `LearningEvent`。
5. 敏感关键词触发 campus_local_only。
6. 老师只看到安全摘要，不看到原始语音/全文。

决策点：

1. 是否引入 LiveKit 作为媒体层。
2. 是否使用 Pipecat 作为 voice worker。
3. 是否需要边缘/校内 GPU 或本地模型。

### 7.3 Phase 2 内容生产管线增强

吸收项目：

1. Oppia：误区反馈路径。
2. OpenMAIC：Scene/Action/Playback。
3. H5P：互动内容类型。
4. PedagogicalRL：教学质量 eval。

新增字段建议：

1. `misconception_feedback_routes`
2. `classroom_action_plan`
3. `voice_script`
4. `whiteboard_action_plan`
5. `pbl_issueboard`
6. `learning_task_evidence_plan`

注意：

短期仍按 Option A，让 `engineering_agent` 接收这些字段并产出 `runtime_content`。当字段复杂度超过阈值，再升级到 `experience_planner_agent`。

### 7.4 Phase 3 内容批量生产增强

新增要求：

1. 每个单元产出 `unit.yaml`。
2. 每个单元产出 `content_package_manifest.json`。
3. 每个单元有互动块清单和 sandbox 声明。
4. 每个单元有无 AI 基线和能力认证任务包。
5. 每个单元有教师端教案和课堂运行脚本。

### 7.5 Phase 8 pilot 部署增强

吸收 Kolibri：

1. 设计校园内容同步。
2. 预加载课程包和媒体资源。
3. 弱网时保障核心课程可用。
4. 云端 LLM 不可用时，至少能完成无 AI 任务、教师教案、离线内容阅读。

---

## 8. 现在最值得做的下一步

按投入产出比排序：

1. 做 `EXTERNAL_STANDARDS_ADAPTER_SPEC.md`，锁定 xAPI、content package、H5P、offline channel 的“只留接口不引入重依赖”策略。
2. 做 `VOICE_RUNTIME_SPIKE_SPEC.md`，明确 LiveKit / Pipecat / 本地语音模型的评估标准。
3. 给 `UnitSpec` 预留 `misconception_feedback_routes` 和 `classroom_action_plan` 的设计文档，不急着改 schema。
4. 对 Open TutorAI CE 做第二轮代码级深审，因为它可能比 OpenMAIC 更接近学生长期学习 workspace。
5. 做一次 `LearningEvent -> xAPI` 的最小映射样例，验证不会泄漏隐私。

---

## 9. 外部项目使用纪律

1. 任何 AGPL 项目只借鉴设计，不复制核心代码。
2. 任何 UI/组件源码引入前先查 license。
3. 任何外部学习事件标准都不能绕过我们的隐私过滤。
4. 任何实时语音方案都不能直接保存原始音频给教师或家长。
5. 任何内容包导出都必须去标识化。
6. 我们的事实源仍然是 Postgres 事件溯源 + pgvector 记忆 + 审计链，不把外部平台当主库。

