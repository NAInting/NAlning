# OpenMAIC 深度拆解与项目结合方案

日期：2026-04-26  
对象仓库：[THU-MAIC/OpenMAIC](https://github.com/THU-MAIC/OpenMAIC)  
代码证据来源：GitHub README、GitExtract 仓库快照（commit `ddfbc93bfde2`，512 files，约 3.7 MB）、关键源码文件抽样阅读。

> 结论先行：OpenMAIC 已经覆盖“AI 教师/同学 + 语音识别 + TTS + 白板 + PPT/Quiz/Interactive/PBL + 实时讨论”的课堂体验原型，所以“能语音问答”本身不是我们的唯一差异化。我们的真正优势应定义为：面向真实学校长期运行的“有长期记忆、有隐私边界、有教师/家长/治理闭环、可被课程生产管线持续供给”的 AI 原生教育系统。语音仍然是关键入口，但必须和长期学生画像、事件溯源、隐私路由、教师干预链绑定，才构成护城河。

## 1. OpenMAIC 是什么

OpenMAIC 的自我定位是 Open Multi-Agent Interactive Classroom。它把一个主题或文档转成沉浸式多智能体课堂：AI 教师、AI 同学、幻灯片、测验、HTML 交互模拟、PBL 项目制学习、白板绘图、语音讲解和实时讨论。

从 README 和源码目录看，它不是传统“聊天机器人”，而是一个“生成课堂 + 播放课堂 + 课堂中实时问答/讨论”的完整应用。

核心能力：

- 一键课程生成：输入主题、PDF 或材料，生成课堂大纲和多个场景。
- 多场景类型：`slide`、`quiz`、`interactive`、`pbl`。
- 多智能体课堂：教师 agent + 多个学生/助教 agent，由 director 决定谁发言。
- 课堂动作系统：speech、spotlight、laser、whiteboard draw、discussion、play video。
- 语音系统：浏览器 ASR、服务端 ASR、TTS，多 provider 支持。
- 白板和 PPT 渲染：AI 可以画图、公式、表格、图表。
- PBL 工作区：角色选择、issueboard、question agent、judge agent。
- OpenClaw 集成：从飞书/Slack/Telegram 等聊天应用触发课堂生成。

## 2. 技术栈与代码结构

OpenMAIC 是一个 Next.js/React 单仓项目，不是我们当前 Vue + Hono/Fastify + Prisma + Postgres 的主技术栈。

主要技术：

- `next 16.1.2`、`react 19.2.3`、TypeScript、Tailwind/shadcn/Radix。
- `ai` SDK、`@langchain/langgraph`、`@modelcontextprotocol/sdk`。
- Zustand 做前端状态，Dexie/IndexedDB 做本地持久化。
- 文件系统 JSON 做服务端课堂和 job 持久化。
- 内置 fork/工作区包：`pptxgenjs`、`mathml2omml`。
- License 是 `AGPL-3.0`，不能在我们商业闭源代码里直接复制粘贴核心代码，除非后续明确开源策略和合规边界。

源码分布（GitExtract 快照）：

- `app/api/*`：约 25 个 API 路由，包括生成、课堂 job、chat、transcription、tts、quiz-grade、pbl、web-search。
- `components/*`：约 193 个组件，包括 roundtable、stage、chat、whiteboard、slide-renderer、scene-renderers。
- `lib/*`：约 191 个核心库文件，包括 generation、orchestration、audio、playback、action、store、media、server。
- `lib/generation/*`：34 个文件，课程生成流水线。
- `lib/orchestration/*`：8 个文件，多智能体 director 和 stateless chat。
- `lib/audio/* + components/audio/*`：10 个文件，ASR/TTS。
- `lib/pbl/* + pbl renderers`：15 个文件，PBL 生成与运行时。
- `components/slide-renderer/*`：76 个文件，PPT/画布编辑与播放。

## 3. 底层架构拆解

### 3.1 课程生成流水线

OpenMAIC 的生成主线是两阶段：

1. `requirements -> scene outlines`
2. `scene outline -> scene content + actions`

关键文件：

- `lib/server/classroom-generation.ts`
- `lib/generation/outline-generator.ts`
- `lib/generation/scene-generator.ts`
- `lib/generation/prompts/templates/requirements-to-outlines/*`

输入是自由文本 `requirement`、可选 PDF 文本/图片、web search、teacher personas。输出是 `Stage` + `Scene[]`。

它的 `SceneOutline` 类型已经很接近我们当前 Phase 2 的 `runtime_content.pages[].blocks[]` 思路：

- `type: slide | quiz | interactive | pbl`
- `title`
- `description`
- `keyPoints`
- `quizConfig`
- `interactiveConfig`
- `pblConfig`
- `mediaGenerations`

差异在于：OpenMAIC 的单位是“课堂场景 Scene”，我们当前的单位是“AI 原生教材 Unit -> Runtime Page/Block”。我们的结构更适合长期课程资产和学校运行；OpenMAIC 的结构更适合快速生成一次可播放课堂。

### 3.2 多智能体运行时

OpenMAIC 的实时课堂不是后端长状态服务，而是“前端携带状态 + 服务端无状态生成”的模型。

关键文件：

- `app/api/chat/route.ts`
- `lib/orchestration/stateless-generate.ts`
- `lib/orchestration/director-graph.ts`
- `lib/orchestration/director-prompt.ts`
- `components/chat/use-chat-sessions.ts`

设计特征：

- `/api/chat` 接收完整 `messages + storeState + config + directorState`。
- 后端使用 LangGraph StateGraph，director 先决定哪个 agent 说话。
- agent 输出结构化 JSON array，格式混合 text 和 action。
- SSE 流式返回 `agent_start`、`text_delta`、`action`、`cue_user`、`done`。
- 前端 `runAgentLoop` 多轮调用 `/api/chat`，直到 director 返回 END/USER 或达到 maxTurns。

优点：

- 后端简单，无需维护会话状态。
- 中断靠 `AbortController`，实现成本低。
- teacher/student agent 的课堂讨论感比较强。

限制：

- 长期学生记忆不在后端原生管理。
- 隐私边界依赖 prompt 和前端/请求字段，而不是学校级治理策略。
- 不适合直接承载真实学校的跨天、跨学期学生画像。

### 3.3 课堂动作与播放系统

OpenMAIC 的精华之一是把“AI 说什么”和“AI 在课堂上做什么”统一成 Action。

关键文件：

- `lib/types/action.ts`
- `lib/action/engine.ts`
- `lib/playback/engine.ts`
- `lib/playback/derived-state.ts`
- `components/stage.tsx`
- `components/roundtable/index.tsx`

Action 类型包括：

- 讲解：`speech`
- 聚焦：`spotlight`
- 激光笔：`laser`
- 视频：`play_video`
- 白板：`wb_open`、`wb_draw_text`、`wb_draw_shape`、`wb_draw_chart`、`wb_draw_latex`、`wb_draw_table`、`wb_draw_line`、`wb_clear`、`wb_delete`、`wb_close`
- 讨论：`discussion`

它把同步动作和 fire-and-forget 动作分开：

- `spotlight/laser` 立即触发，随后自动清理。
- `speech/whiteboard/video/discussion` 是同步动作，需要等待完成。

这对我们非常有价值。我们当前的 `AgentRuntimeEvent` 已经开始抽象 `agent_message`、`tool_call`、`block_focus`、`assessment_prompt` 等运行时事件。OpenMAIC 证明了：如果课程要“像老师真的在讲”，就必须有一个可播放、可暂停、可中断、可恢复的动作/事件层。

### 3.4 语音系统

OpenMAIC 已经有语音，不是纯文字。

关键文件：

- `lib/hooks/use-browser-asr.ts`
- `lib/hooks/use-audio-recorder.ts`
- `components/audio/speech-button.tsx`
- `app/api/transcription/route.ts`
- `lib/audio/asr-providers.ts`
- `app/api/generate/tts/route.ts`
- `lib/audio/tts-providers.ts`
- `lib/audio/types.ts`

ASR 支持：

- Browser Native Web Speech API。
- OpenAI Whisper / `gpt-4o-mini-transcribe`。
- Qwen ASR / DashScope。

TTS 支持：

- OpenAI TTS。
- Azure TTS。
- GLM TTS。
- Qwen TTS。
- Browser Native TTS。

关键判断：OpenMAIC 的语音更像“按键/按钮触发的语音输入 + TTS 播放”，不是我们想象中的全天候、低延迟、可打断、持续陪伴式 voice agent。它具备“语音进入课堂”的能力，但还不是“长期实时语音伴学体”。

所以，用户提出的“开放权限后像真人一样实时语音沟通”仍然可以成为我们的优势，但必须升级为更明确的产品定义：

- 不是“有麦克风按钮”，而是“低摩擦、低延迟、可打断的常驻伴学入口”。
- 不是“语音转文字再问答”，而是“语音对话 + 学生长期记忆 + 学业事件溯源 + 情绪本地路由”。
- 不是“一次课堂讨论”，而是“跨天、跨单元、跨学期的连续陪伴”。

### 3.5 PBL 与新型作业/考试

OpenMAIC 的 PBL 模块对我们之前讨论的“新时代作业/考试”非常有启发。

关键文件：

- `lib/pbl/types.ts`
- `lib/pbl/generate-pbl.ts`
- `components/scene-renderers/pbl-renderer.tsx`
- `components/scene-renderers/pbl/use-pbl-chat.ts`
- `app/api/pbl/chat/route.ts`

它将 PBL 设计为：

- projectInfo：项目标题和说明。
- agents：项目角色 agent。
- issueboard：任务板/问题板。
- chat：学生与 question/judge agent 对话。
- selectedRole：学生选择角色。

这与我们“作业不再只是题目，考试不再只是背诵检验”的方向高度一致。我们可以把传统作业/考试重命名并重构为：

- 学习痕迹任务：记录学生如何探索、提问、修正。
- 理解证明：让学生用自己的语言、模型、图示证明理解。
- 迁移挑战：把知识迁移到新情境。
- 项目式任务板：类似 issueboard，拆成可追踪的探究任务。
- 口头解释/辩护：学生通过语音向 AI 或老师解释思路。
- 反思回路：AI 生成复盘卡，学生确认/补充。

OpenMAIC 已有 PBL/Quiz，但我们的优势在于把它接入 MasteryRecord、LearningEvent、TeacherSignal、GuardianSummary 和 AuditLog，而不是停留在一次性课堂互动。

### 3.6 数据和持久化

OpenMAIC 的持久化主要是：

- 服务端文件系统 JSON：`data/classrooms`、`data/classroom-jobs`。
- 客户端 IndexedDB/Dexie：stage、scenes、audioFiles、imageFiles、chatSessions、playbackState、outlines、mediaFiles、generatedAgents。

关键文件：

- `lib/server/classroom-storage.ts`
- `lib/server/classroom-job-store.ts`
- `lib/utils/database.ts`
- `lib/store/stage.ts`

这适合开源 demo 和个人学习工具，但不适合我们的学校级 SaaS / 校内部署：

- 没有 Postgres 作为主事实源。
- 没有事件溯源学习记录。
- 没有 tenant/school/class/student 权限模型。
- 没有 consent/appeal/audit 的不可篡改链。
- 没有情绪数据本地桶和跨 agent 隐私过滤。

因此 OpenMAIC 的持久化不能直接采用，但它的“本地草稿/离线播放/课堂资产缓存”可以借鉴到我们的学生端或教师备课端。

### 3.7 安全与治理

OpenMAIC 代码里有一些工程安全意识：

- `ssrf-guard.ts` 阻止生产环境下用户提供的 base URL 指向 localhost/private IP。
- provider key 可走 server config，避免全暴露给客户端。
- API 统一 `apiError/apiSuccess`。

但它不是 K-12 学校治理系统：

- 没有学生/家长/老师/管理员的强 RBAC/ABAC 模型。
- 没有未成年人数据生命周期、同意书版本、申诉状态机。
- 没有情绪信号“只传 signal 不传 content”的强规则。
- 没有审计 hash chain。
- 没有“教师不可看学生原始对话”的后端硬边界。

我们的项目不能把 OpenMAIC 作为治理参考，只能把它作为互动课堂体验参考。

## 4. 与我们项目的对比

| 维度 | OpenMAIC | 我们的项目 |
|---|---|---|
| 产品中心 | 一键生成互动课堂 | 学校级 AI 原生教育系统 |
| 用户关系 | 学习者与 AI 教师/同学 | 学生/教师/家长/管理员四端闭环 |
| 课程资产 | Scene-based classroom | Unit/Page/Block + 知识图谱 + 评估 + 记忆 |
| 运行时 | Stateless chat + 前端状态 | 事件溯源 + 长期记忆 + 后端治理 |
| 语音能力 | ASR + TTS + 课堂输入 | 应升级为实时陪伴式 voice agent |
| 多智能体 | 课堂 director + teacher/peers | 教材生产 5-agent + 学生/教师/家长 agent |
| 白板/讲解动作 | 很成熟，值得借鉴 | 当前刚进入 AgentRuntimeEvent 抽象 |
| PBL/Quiz | 有基本 PBL/Quiz | 应绑定掌握度、迁移能力、反思和审计 |
| 隐私治理 | 工程安全为主 | 项目核心护城河 |
| 存储 | 文件 + IndexedDB | Postgres/pgvector/审计/事件溯源 |

## 5. 对我们项目的直接启发

### 5.1 Runtime Content 应吸收 “Scene + Action” 思路

我们当前 Phase 2.5/2.6 已经有 `runtime_content` 和 `AgentRuntimeEvent`，OpenMAIC 说明这个方向是对的。

建议增强方向：

- `runtime_content.pages[].blocks[]` 继续保持教材结构。
- `agent_runtime_events[]` 负责讲解、聚焦、提问、白板、互动。
- 增加更清晰的 Action/Event 类型映射：
  - `speech`
  - `block_focus`
  - `whiteboard_open`
  - `whiteboard_draw`
  - `interactive_start`
  - `assessment_prompt`
  - `discussion_trigger`
  - `student_voice_turn`
  - `teacher_intervention_hint`

不要照搬 OpenMAIC 的 Action 类型，但可以吸收它“同步/异步动作区分”和“播放状态机”的设计。

### 5.2 课程生产管线要新增“课堂体验规划”层

当前我们还在决定 `runtime_content` 由谁生产：

- Option A：保持 6 agent，由 `engineering_agent` 同时拥有 `implementation + runtime_content`。
- Option B：新增 `block_planner` 或 `classroom_experience_planner`。

OpenMAIC 的代码证明“课堂体验规划”很快会变复杂：场景类型、互动模拟、白板、语音、Quiz/PBL、动作时序都不是普通工程字段。

因此建议：

- 短期仍用 Option A：不扩大 agent 数量，先让 `engineering_agent` 产出 `runtime_content`。
- 同时在文档里预留未来 Option B：当 runtime_content 复杂度超过阈值时，新增 `experience_planner_agent`。
- 阈值可以定义为：需要同时生成语音脚本、白板动作、互动 HTML、PBL issueboard、assessment rubric 中任意 3 项以上。

### 5.3 学生端语音不是“按钮”，而是产品形态

OpenMAIC 已经有按钮式语音输入，所以我们不能把“可以语音问答”当作独占优势。

我们应定义更高阶的语音伴学：

- 常驻：学生打开学习页后，AI 学伴像同桌一样在场。
- 可打断：学生能打断 AI，AI 能恢复上下文。
- 低延迟：首字/首音延迟要接近自然对话。
- 有记忆：能引用上周、上单元、上一题的学习痕迹。
- 有边界：情绪/家庭/隐私内容自动 campus_local_only，不进入云端。
- 有学习事件：语音对话不是聊天日志，而是生成 LearningEvent、ConversationTurn、MasteryEvidence。
- 有教师摘要：老师只看到必要信号，不看到原始语音/文本。

这才是“真人一样伴学”的优势。

### 5.4 新作业/新考试应走 PBL + 证据链

OpenMAIC 的 PBL issueboard 可以转化为我们的“学习任务/理解证明”体系。

建议命名：

- 作业 -> “学习任务”或“探究任务”
- 考试 -> “理解证明”或“能力认证”
- 练习 -> “迁移挑战”
- 错题本 -> “认知修复记录”
- 课堂测验 -> “即时理解检查”
- 大作业 -> “项目式证据包”

它们的目的从“检查是否背了”转为：

- 能否解释。
- 能否迁移。
- 能否质疑。
- 能否用多种表示法表达。
- 能否在 AI 帮助逐渐减少时独立完成。
- 能否留下可审计、可复盘的学习证据。

### 5.5 教师端应借鉴“可播放课堂”但保留教师主权

OpenMAIC 的 AI 教师可以讲课、画白板、发起讨论。我们的教师 Agent 不能让老师感觉被替代。

结合方式：

- AI 生成“课堂建议脚本”，由老师确认。
- AI 提供可播放的示范讲解，但老师可改写/跳过/插入。
- AI 同学可以在课堂里扮演常见误区学生，引出讨论。
- 教师端有“本节课 AI 计划做什么”的可视化预演。
- 所有自动发起讨论、测验、PBL，都要有老师的控制权和审计记录。

## 6. 不建议直接采用的部分

不建议直接并入 OpenMAIC 代码，原因：

- AGPL-3.0 license 可能影响我们后续商业闭源策略。
- 技术栈不同：OpenMAIC 是 Next/React，我们当前前端是 Vue，后端是 Hono/Fastify/Prisma/Postgres 方向。
- 存储不适合学校级部署：文件 JSON + IndexedDB 不足以支撑审计、权限和长期记忆。
- 缺少未成年人隐私治理闭环。
- Prompt/agent 输出没有我们当前 semantic gate / review artifact / blocked artifact 的严格流程。

可以借鉴但要重写的部分：

- Action/Playback 状态机。
- Whiteboard action 类型。
- Scene outline 生成 prompt 的结构。
- PBL issueboard 模型。
- ASR/TTS provider abstraction。
- Roundtable 课堂 UI 交互。

## 7. 建议并入我们的项目路线图

### 近期：Phase 2 runtime_content 决策

建议先采用 Option A：

- 继续保持 6-agent 生产管线。
- `engineering_agent` 拥有 `implementation + runtime_content`。
- 在 schema 中增加 `runtime_content_generation_notes`，记录块/事件规划依据。
- 在 semantic validator 中增加 “runtime_event -> block_id 可追溯”检查。

同时写入 ADR：

- 如果未来一个 unit 同时需要语音脚本、白板动作、互动 HTML、PBL issueboard、Quiz rubric 中 3 项以上，则升级为 `experience_planner_agent`。

### 中期：引入 Voice Runtime Spec

新增一份 `PHASE_1_7B_VOICE_RUNTIME_SPEC.md` 或 Phase 2 runtime extension：

- STT/TTS provider abstraction。
- low-latency voice session。
- barge-in/interrupt。
- voice turn -> ConversationTurn。
- private speech routing。
- local-only emotional voice path。
- teacher-safe signal projection。

### 中期：引入 Classroom Action Event

在 `AgentRuntimeEvent` 中扩展：

- `speech_segment`
- `whiteboard_action`
- `block_focus`
- `media_play`
- `discussion_trigger`
- `quiz_prompt`
- `pbl_issue_opened`
- `student_voice_turn`

注意：这些事件必须带：

- `visibility_scope`
- `source_trace`
- `confidence_score`（AI 生成时）
- `unit_id/page_id/block_id`
- `privacy_bucket`

### 中期：新作业/新考试模型

在 shared-types 中新增或扩展：

- `LearningTask`
- `UnderstandingProof`
- `TransferChallenge`
- `ProjectEvidencePack`
- `ReflectionCard`
- `NoAIBaselineAttempt`
- `OralExplanationTurn`

这会把传统“作业/考试”转成可被 AI 伴学、教师 Agent、家长摘要共同理解的证据链。

### 长期：借鉴 OpenMAIC 的课堂 UI，但重做为 Vue + 学校版

不迁移 React 代码，而是在 `frontend-user` 中重做：

- Roundtable-like voice companion。
- Teacher + peer personas。
- Whiteboard/interactive block renderer。
- Quiz/PBL block renderer。
- Playback/interrupt/resume 状态机。

## 8. 对“实时语音伴学是否是优势”的最终判断

答案：是，但要重新定义。

OpenMAIC 已经有：

- 麦克风输入。
- ASR。
- TTS。
- AI 教师/同学实时讨论。
- 白板和课堂讲解。

所以“能说话”不是优势。

我们的优势应该是：

- 长期陪伴：记得学生一周、一个月、一个学期的学习轨迹。
- 学校闭环：学生对话能变成教师可用但隐私安全的信号。
- 隐私治理：情绪/家庭/敏感数据默认本地，不上云，不给老师原文。
- AI 原生教材：不是把教材讲一遍，而是生成适合 AI 时代的互动学习单元。
- 教学证据链：每次语音、每次追问、每次独立完成都变成可审计的学习证据。
- 教师主权：AI 不是替代老师，而是让老师看见班级全貌和每个学生的最近发展区。

一句话：OpenMAIC 是“把内容变成一节生动 AI 课堂”；我们要做的是“把一所学校变成可长期运行、可治理、可验证效果的 AI 原生学习生态”。

## 9. 下一步建议

1. 继续当前 Option A 决策：先由 `engineering_agent` 负责 `runtime_content`，不立刻新增 agent。
2. 新增 ADR：记录 OpenMAIC 对 runtime_content/experience_planner 的启发和升级阈值。
3. 新增 Voice Runtime Spec：把“实时语音伴学”定义成独立能力，而不是前端按钮。
4. 扩展 `AgentRuntimeEvent` 的未来路线图：加入 whiteboard/action/playback 事件，但先不改代码。
5. 在课程设计侧新增“理解证明/迁移挑战/PBL 证据包”模型，与传统作业/考试区分。

## 10. 复查清单

后续如果要把 OpenMAIC 思路吸收进本项目，必须逐项检查：

- 是否直接复制了 AGPL 代码：禁止，除非单独做 license 决策。
- 是否改变主技术栈：禁止，除非用户明确决策。
- 是否引入真实 provider 调用：需要用户确认。
- 是否引入真实学生数据：禁止。
- 是否让教师看到学生原始对话/语音：禁止。
- 是否每个 runtime event 都有 `visibility_scope` 和 `source_trace`。
- 是否所有 AI 生成的学习判断都有 `confidence_score`。
- 是否所有跨 Agent 通讯只传 signal，不传 raw content。

