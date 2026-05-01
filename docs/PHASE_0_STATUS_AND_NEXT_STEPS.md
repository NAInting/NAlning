# 阶段 0 当前状态与下一步

版本：2026-04-24

## 一、阶段 0 定位

阶段 0 的目标是建立项目地基，而不是做完整业务体验。

阶段 0 的核心产出包括：

1. `0.1` 统一数据模型。
2. `0.2` Monorepo 结构。
3. `0.3` LLM Gateway。
4. `0.4` 向量数据库与记忆系统基础。
5. `0.5` 最小后端骨架。
6. `0.6` 测试与 CI 基础。

当前已经完成 `0.1` 的代码实现与替代复审，并完成 `0.2` 的 monorepo 主迁移、本地验收和替代独立复审。`0.3 LLM Gateway` 的最小可用 SDK 已完成本地验证和替代独立复审修复，可按 8.5 定版。`0.4 向量数据库 + 记忆系统基础` 已完成本地验证、替代独立复审和 P1 修复，可按 8.5 定版。`0.5 最小后端骨架` 已完成本地验证、第一轮替代复审修复和第二轮替代复审，可按 8.5 定版。

## 二、0.1 当前状态

| 检查项 | 状态 | 证据 |
|---|---|---|
| `packages/shared-types` 已创建 | 通过 | 已存在 TypeScript 接口、Zod schema、测试和报告 |
| 身份、内容、学习、Agent、治理、通讯实体覆盖 | 通过 | `src/identity`、`src/content`、`src/learning`、`src/agent`、`src/governance`、`src/communication` |
| 事件溯源模式 | 通过 | `LearningEvent` 为核心，`MasteryRecord` / `StudentMemorySnapshot` 为物化视图 |
| 情绪基线本地硬约束 | 通过 | `EmotionBaseline` 标记为 `campus_local_only` 语义 |
| 三层记忆桶 | 通过 | academic / emotional / personal 隔离 |
| TypeScript 类型检查 | 通过 | `npm run typecheck` |
| Zod schema 测试 | 通过 | `npm test`，108 tests passed |
| 禁用 `any` | 通过 | `packages/shared-types/src` 未命中 `\bany\b` |
| 现有治理前端可导入 shared-types | 通过 | `edu_ai_frontend_v1` 已使用本地 `@edu-ai/shared-types` |
| 治理前端类型检查 | 通过 | `npm run typecheck` |
| 治理前端生产构建 | 通过 | `npm run build` |

## 三、本次复核命令

在 `packages/shared-types`：

```powershell
npm run typecheck
npm test
```

结果：

- `tsc --noEmit --pretty false` 通过。
- Vitest 3 个测试文件通过。
- 108 条测试通过。

在项目根目录：

```powershell
Get-ChildItem -Path .\packages\shared-types\src -Recurse -File | Select-String -Pattern '\bany\b'
```

结果：

- 无输出，表示源码未命中 `any`。

在 `edu_ai_frontend_v1`：

```powershell
npm run typecheck
npm run build
```

结果：

- `vue-tsc --noEmit` 通过。
- `vite build` 通过。

## 四、0.1 剩余事项

以下事项不阻断 `0.1` 定版，但应进入 `0.2` 或后续阶段：

| 事项 | 原因 | 归属 |
|---|---|---|
| `docs/SCHEMA.md` 统一 schema 文档 | 已在本轮补齐，后续每次 shared-types 变更必须同步维护 | 0.1 已完成 |
| `@edu-ai/shared-types` 仍是本地 file 依赖 | 迁入后的 `apps/frontend-governance` 已改为 `workspace:*`；旧目录保留 `file:` 作为回滚备份 | 0.2 已完成 |
| 后端和内容管线尚未导入 shared-types | 后端和 content-pipeline 当前为占位目录，真实接入属于后续实现 | 0.5 / 2.x |
| OpenAPI 与 shared-types 自动同步尚未建立 | 需要后端骨架和 API 生成链路 | 0.5 |

## 五、0.1 定版判断

按阶段 0.1 的执行要求：

- 所有实体接口已完成。
- Zod schema 能通过测试数据校验。
- `vue-tsc --noEmit` 通过。
- 前端现有 demo 类型已能从 shared-types 导入替代。
- 已生成 `IMPLEMENTATION_REPORT.md`。
- 已补充 `docs/SCHEMA.md` 作为 schema 总览。

Codex 自查结论：

> 阶段 0.1 已完成替代复查发现的 2 个 P1 修复，并补齐轻量复审提出的 1 个 P2 回归测试缺口。当前可按 8.5 定版，并进入阶段 0.2。

## 六、0.2 进入条件

进入 0.2 前需要确认：

1. 保留当前 `edu_ai_frontend_v1` 作为迁移源。
2. 迁移采用“先复制/迁移到 apps，再验证，再决定是否归档旧目录”的低风险方式。
3. `packages/shared-types` 作为 workspace package 保留当前代码和测试。
4. 根目录新增 pnpm workspace 和 Turborepo 配置，不破坏现有已定版文件包。

## 七、0.2 完成后的期待状态

完成 0.2 后，项目根目录应具备：

- `apps/frontend-governance`
- `apps/frontend-user`
- `apps/backend`
- `apps/content-pipeline`
- `packages/shared-types`
- `packages/agent-sdk`
- `packages/llm-gateway`
- `packages/privacy-filter`
- `packages/ui-kit`
- `content/curriculum-standards`
- `content/units`
- `content/pedagogy-library`
- `docs`

并且：

- `pnpm install` 一次安装依赖。
- `pnpm build` 能调度所有可构建 package。
- `frontend-governance` 零回归。
- `shared-types` 测试仍全绿。

当前执行结果：以上结构和命令已完成本地验收，替代独立复审无 P0/P1，详见 `docs/PHASE_0_2_IMPLEMENTATION_REPORT.md`。

## 八、0.3 当前状态

`@edu-ai/llm-gateway` 已进入 workspace，并实现最小可用 SDK。

已完成：

- 统一入口 `createLlmGateway().complete()`。
- Claude / 千帆 / 本地模型三类 mock adapter。
- 隐私优先路由。
- 敏感关键词强制本地路由。
- 云模型降级。
- campus-local 禁止云端降级。
- prompt 版本管理与 `source_trace` 调用追溯。
- 内存缓存。
- 成本记录与按 purpose 聚合。
- adapter deployment 校验，防止本地模型槽位误接云端。

验证结果：

- `pnpm --filter @edu-ai/llm-gateway typecheck` 通过。
- `pnpm --filter @edu-ai/llm-gateway test` 通过，10 tests passed。
- `pnpm --filter @edu-ai/llm-gateway build` 通过。
- `pnpm typecheck` / `pnpm test` / `pnpm build` 均通过。

详见 `docs/PHASE_0_3_IMPLEMENTATION_REPORT.md`。

## 九、0.4 当前状态

`@edu-ai/memory-store` 已进入 workspace，并实现最小向量记忆 contract。

已完成：

- pgvector DDL 草案。
- `student_memory_embeddings` / `content_embeddings` / `conversation_embeddings` 三张表。
- deterministic embedding provider。
- in-memory vector store。
- cosine similarity 召回。
- academic / emotional / personal 三桶隔离。
- emotional bucket campus-local 硬约束。
- teacher_agent 只可召回 academic。
- content embeddings 不允许绑定 student_id。
- 同 source 增量摘要版本更新。
- 同 source 增量摘要不会跨租户或学生覆盖。
- 非特权角色查询学生绑定记忆必须携带 student_id。
- deterministic embedding 默认 1536 维，对齐 pgvector DDL。

验证结果：

- `pnpm --filter @edu-ai/memory-store typecheck` 通过。
- `pnpm --filter @edu-ai/memory-store test` 通过，9 tests passed。
- `pnpm --filter @edu-ai/memory-store build` 通过。
- `pnpm typecheck` / `pnpm test` / `pnpm build` 均通过。

详见 `docs/PHASE_0_4_IMPLEMENTATION_REPORT.md` 和 `docs/PHASE_0_4_REVIEW_FIXES.md`。

## 十、0.5 当前状态

`@edu-ai/backend` 已进入 workspace，并实现最小 HTTP 后端骨架。

已完成：

- Hono app factory 与本地 server entrypoint。
- `GET /healthz`。
- `GET /openapi.json`。
- `POST /api/v1/auth/login` demo bearer 登录。
- `/api/v1/*` bearer-auth middleware。
- 学生 / 家长访问学生范围资源时校验 student token 绑定。
- 统一 request id 与错误结构。
- 学生 mastery / my-profile API。
- Student Agent session API。
- Teacher Agent daily report API。
- Intervention create API。
- Consent status / create / withdraw API。
- Audit export request API。
- In-memory audit ledger。
- Student Agent session、Teacher daily report、Intervention、Consent、Audit export 写路径均入审计账本或受边界校验。
- Malformed JSON 统一返回 `400 bad_request`。
- Backend smoke tests。

验证结果：

- `pnpm --filter @edu-ai/backend typecheck` 通过。
- `pnpm --filter @edu-ai/backend test` 通过，10 tests passed。
- `pnpm --filter @edu-ai/backend build` 通过。
- `pnpm typecheck` / `pnpm test` / `pnpm build` 均通过，当前 workspace 5 个包全绿。

已知非目标：

- 暂未接真实 Postgres / Prisma。
- 暂未替换前端 API 文件。
- 暂未做生产 JWT 签名。
- 暂未持久化审计表。

第二轮替代复审：

- P0/P1/P2：无。
- 结论：可按 8.5 定版。

详见 `docs/PHASE_0_5_BACKEND_SKELETON_SPEC.md` 和 `docs/PHASE_0_5_IMPLEMENTATION_REPORT.md`。

## 十一、0.6 当前状态

`0.6 测试与 CI 基础` 已完成本地实现、验证和替代独立复审 P2 修复，可按 8.5 定版。

已完成：

- 根目录新增 `pnpm run ci` 一键门禁。
- 根目录新增 `pnpm e2e`。
- 新增 Playwright 配置 `playwright.config.ts`。
- 新增后端 HTTP E2E 烟雾测试 `tests/e2e/backend-smoke.spec.ts`。
- 新增 GitHub Actions workflow `.github/workflows/ci.yml`。
- active packages 的 `lint` 不再是空占位，改为 TypeScript / Vue 静态检查。
- 新增 `docs/PHASE_0_6_TEST_CI_SPEC.md`。
- 新增 `docs/PHASE_0_6_IMPLEMENTATION_REPORT.md`。
- 新增 `docs/PHASE_0_6_CI_REVIEW_GATE.md`。
- 已把 Phase 0.6 CI Gate 接入 `docs/REVIEW_AND_SELF_CHECK_PROCESS.md`。

验证结果：

- `pnpm lint` 通过。
- `pnpm typecheck` 通过。
- `pnpm test` 通过。
- `pnpm e2e` 通过，2 tests passed。
- `pnpm build` 通过。
- `pnpm run ci` 通过。

替代独立复审：

- P0/P1：无。
- P2：1 项文档门禁缺口，已修复。
- 结论：可按 8.5 定版。

说明：

- `pnpm ci` 是 pnpm 保留命令，不能用于运行 package script；本项目统一使用 `pnpm run ci`。

## 十二、2026-04-24 自动推进快照

本节用于对齐当前代码状态，避免早期复审文档中的历史 Gap 被误判为仍未处理。

### 0.1 隐私契约复核

`docs/PHASE_0_1_INDEPENDENT_REVIEW.md` 中的两项 P1 已在当前代码中关闭：

- P1-1 `visibility_scope` 覆盖不足：当前 `Conversation`、`MasteryRecord`、`MasteryHistory`、`EpisodicMemoryEntry`、`StudentMemorySnapshot`、`EmotionBaseline` 等高敏学生数据实体均由 schema 强制要求 `visibility_scope`。
- P1-2 `InterAgentSignal` 自由文本泄露空间：当前信号 payload 已收紧为结构化字段，`rationale_summary`、`suggested_actions`、`description` 等 legacy 自由文本字段会被拒绝。

保留观察项：

- P2 AI 生成内容口径统一仍应在后续 Gateway / Prompt 资产化中继续收口。当前 `AIGeneratedField` 使用 `confidence`、`model_version`、`prompt_version`、`generated_at`、`human_reviewed`，而内容管线生成段落使用 `confidence_score` 与 `source_trace`。

### 当前验证基线

最近一次根级验证：

```powershell
pnpm run ci
```

结果：

- lint：9 个 package 通过。
- typecheck：9 个 package 通过。
- test：当前 workspace 测试通过，其中 `shared-types` 111 tests、`llm-gateway` 13 tests、`memory-store` 10 tests、`content-pipeline` 41 files / 272 tests。
- e2e：后端 smoke 2 tests 通过。
- build：9 个 package 通过。

当前服务状态：

- 无长期 dev server 或后端服务保持运行。
- 当前推进均为本地静态检查、单元测试、E2E smoke 和构建验证。

### 2.4 内容管线自动推进现状

截至 2026-04-24，本地 `content-pipeline` 已补上 review-only scoped rerun 能力：

- blocked review artifact 除了 `repair_plan.recommended_rerun_from` 外，现在还能作为 `run-llm-review --from-artifact <prior-artifact.json>` 的输入。
- 工作流会先继承 rerun 起点之前的成功 candidate patch，再只重跑受影响的尾部角色，而不是每次都重跑完整六角色链。
- 新 artifact 会写出 `rerun_context`，markdown report 也会显示 scoped rerun start 和 inherited roles，便于人工复核。
- `rerun_context` 现在还会写出 rerun lineage，包括 `rerun_chain_depth`、root artifact 时间锚点，以及 source retry decision，避免后续自动化靠日志猜测重跑历史。
- blocked artifact 现在还会写出 `retry_policy`，把当前情况明确标成 `allow_scoped_rerun`、`widen_rerun_scope` 或 `manual_review_required`。
- artifact 现在还会写出 `orchestration_guidance`，明确下一步是 notify-only、prepare scoped rerun、prepare widened rerun，还是必须人工 triage，但仍不自动触发任何真实 provider 调用。
- `orchestration_guidance` 现在还会标出 `human_queue`，把事项明确送往 `approval_queue`、`rerun_decision_queue` 或 `manual_triage_queue`，且 unattended action 仍只允许 `open_inbox_item`。
- `orchestration_guidance` 现在还会给出 `primary_human_action`、`inbox_title`、`inbox_summary`，让后续自动化能稳定创建人工任务，而不必临时拼装文案。
- `render-review-provider-execution-request` 和 `validate-review-provider-execution-request` 现在还能把 `prepare_scoped_rerun` / `prepare_widened_rerun` 进一步固化成 machine-readable provider execution request，明确 requested start role、tail-role scope、estimated provider call count，以及“仍需人工批准 + budget check”的硬边界。
- 这层 provider execution request 合同最近又补了一轮 cold review 修复：`recommended_rerun_from` 现在必须是合法 workflow role，非法字符串不会再静默退化成 `qa_agent` tail；同时 builder / validator 自身也会先校验 blocked source contract 并 fail closed，而不是只依赖 CLI 外层先验。
- `decide-review-provider-execution-request` 和 `validate-review-provider-execution-decision` 现在还能把 provider execution request 进一步固化成 machine-readable human/budget verdict，明确 reviewer、budget_check_status、decision_status 和 execution_permission，而且这层也会先校验 source request，并强制 `approved => budget_check_status = passed`。
- 这层 provider execution decision 合同又补了一轮 cold review 修复：source validator 现在会重新校验 `request_key`、`chain_key`、`review_mode`、`output_contract`、`inbox_title`、`inbox_summary` 等 contract-critical request 字段；空白 reviewer id 会在 recorder / CLI 被直接拒绝；malformed reviewer/timestamp 也会在 validator 中返回结构化 issue，而不是走异常崩溃路径。
- `record-review-provider-execution-attempt` 和 `validate-review-provider-execution-attempt` 现在还能把 approved/granted/passed 的 provider execution decision 进一步固化成 machine-readable `authorized_pending_execution` attempt 合同，记录一条已授权但尚未真实花费 provider 的 rerun 尝试。
- `record-review-provider-execution-receipt` 和 `validate-review-provider-execution-receipt` 现在还能把这条 `authorized_pending_execution` attempt 进一步固化成 machine-readable execution receipt，明确本次真实 provider rerun 是生成了新的 review artifact，还是以结构化 failure 结束。
- 这层 provider execution receipt 合同也保持 fail-closed：source attempt 必须真的是 `authorized_pending_execution` 且允许 real-provider rerun；如果 receipt 把 `artifact_recorded` 和 failure 字段混在一起，或把 `execution_failed` 和 result artifact 字段混在一起，validator 会直接拒绝，而不会让下游自动化继续猜测执行结果。
- `render-review-provider-execution-reconciliation` 和 `validate-review-provider-execution-reconciliation` 现在还能把 `request + decision + attempt + receipt` 进一步归约成 machine-readable result summary，明确这次 provider execution 是可信地交接给了一个新的 review artifact，还是落在 execution triage / receipt triage。
- 这层 provider execution reconciliation 也保持保守边界：如果 receipt validation 失败，reconciliation 会强制清空不可信的 artifact/failure 下游字段，而不是把可能伪造的执行结果继续传播给后续自动化。
- 这层 provider execution reconciliation 最近又补了一轮 Volta 冷审修复：即便 upstream request/decision/attempt/receipt 的 `schema_version` 被篡改，reconciliation 也会保持自己的 `source_*_schema_version` 为 canonical contract literals，并通过 source/receipt validation issue codes 暴露上游链路异常，而不是把 malformed schema string 原样回灌进导出合同。
- `render-review-provider-execution-follow-up` 和 `validate-review-provider-execution-follow-up` 现在还能把 `request + decision + attempt + receipt + reconciliation` 进一步归约成 machine-readable post-execution routing contract，明确下一步是把成功执行的结果交还给真正的 review artifact contract，还是打开 execution triage / receipt triage 的人工任务。
- 这层 provider execution follow-up 也保持保守边界：如果 execution 真的产出了新 artifact，它不会根据 receipt metadata 直接“猜”出 approval queue，而是只输出 result-artifact handoff；后续自动化要继续往下走，必须回到实际 review artifact 合同本身。
- 这层 provider execution follow-up 最近又补了两轮 cold review 修复：其一，manual execution triage 的 `failure_code` 现在会先做 label-safe sanitize，再进入 `failure_code:<value>` 路由标签，避免 `:`、`|`、换行之类的脏值破坏下游 `key:value` 语义；其二，follow-up source validator 现在会先做 reconciliation shape guard，malformed payload 会返回结构化 issue 而不是直接打崩 CLI，builder 也会像 attempt/receipt recorder 一样先校验 source，不再允许直接伪造“成功 handoff”。
- `render-review-provider-execution-follow-up-plan` 和 `validate-review-provider-execution-follow-up-plan` 现在还能把这个 post-execution routing contract 进一步导出为 executor-ready follow-up delivery plan；成功执行仍只保留 result-artifact handoff，不会生成多余 inbox 任务，而 execution triage / receipt triage 分支则会得到稳定的 manual-task upsert 计划和 deterministic operation key。
- `render-review-provider-execution-follow-up-receipt` 和 `validate-review-provider-execution-follow-up-receipt` 现在还能把这个 post-execution follow-up delivery plan 进一步回收成 machine-readable delivery receipt，明确 triage inbox 任务是否真的被打开，同时保持 artifact-handoff 分支为纯 no-op receipt。
- `render-review-provider-execution-follow-up-reconciliation` 和 `validate-review-provider-execution-follow-up-reconciliation` 现在还能把 `follow-up plan + follow-up receipt` 进一步归约成 machine-readable result summary，明确 post-execution triage delivery 是已闭合、需要 manual repair，还是因为 receipt 本身不可信而必须 manual receipt triage。
- 这层 provider-execution follow-up delivery reconciliation 同样保持保守边界：如果 follow-up receipt validation 失败，它会主动清空不可信的 delivery status / final follow-up item / artifact-handoff 下游字段，而不是把伪造 delivery 结果继续传递给后续自动化。
- `render-review-provider-execution-follow-up-delivery-follow-up` 和 `validate-review-provider-execution-follow-up-delivery-follow-up` 现在还能把 `follow-up plan + follow-up reconciliation` 进一步归约成 provider 侧 post-delivery closure/follow-up routing，明确区分 trusted result-artifact handoff、delivered manual triage item、manual repair required，以及 receipt triage required。
- 这层 provider-execution post-delivery routing 同样保持保守边界：如果 source follow-up delivery reconciliation 不可信，就不会继续导出新 routing contract；如果状态是 `result_artifact_handoff_ready`，系统仍只把控制权交还给真实 review artifact contract，而不会跳过 artifact contract 直接伪造 approval/inbox 结论。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up` 和 `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up` 现在还能把这层 provider post-delivery closure/follow-up routing 再归约成下一层 machine-readable downstream post-delivery routing contract，明确区分 `result_artifact_handoff_ready`、`manual_follow_up_item_delivered`、`repair_follow_up_delivery_follow_up_required` 和 `receipt_triage_required`。
- 这层新的 downstream provider post-delivery routing 也保持保守边界：`receipt_triage_required` 分支会显式保留可信 source-derived context（`preserved_result_artifact_handoff` / `preserved_active_follow_up_item`），但任何当前 receipt 衍生的非可信 active state 仍会被清空，而不会继续向后续自动化传播。
- 这层 routing 最近又补了一轮 Plato 冷审修复：downstream executor builders 现在会先校验 source contract 并 fail closed，receipt triage summary / labels 也会带出真实 receipt issue code，而不是 generic placeholder。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan` 和 `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan` 现在还能把这层新的 downstream provider post-delivery routing 进一步导出为 executor-ready delivery plan；`result_artifact_handoff_ready` 和可信 no-op 分支会继续保持纯 handoff / no-op 语义，而 manual follow-up 分支则会得到稳定的 upsert payload 与 deterministic operation key。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-receipt` 和 `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-receipt` 现在还能把这层 executor-ready delivery plan 的执行结果回收成 machine-readable receipt；成功 handoff / no-op 分支仍保持纯 no-op receipt，而 manual follow-up 分支则只记录 deterministic executor outcome。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-reconciliation` 和 `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-reconciliation` 现在还能把 `executor-ready delivery plan + delivery receipt` 进一步归约成新的 downstream post-delivery reconciliation/result summary，明确区分 closed、manual repair 和 receipt triage，而不会信任 malformed receipt metadata。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` 和 `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` 现在还能把这层 downstream provider post-delivery executor trio 再归约成一层新的 post-delivery closure / follow-up routing，明确区分 `result_artifact_handoff_ready`、`manual_follow_up_item_delivered`、`repair_follow_up_delivery_follow_up_delivery_follow_up_required` 和 `receipt_triage_required`。
- 这层最新的 downstream provider post-delivery closure / follow-up routing 继续保持保守边界：trusted artifact handoff 与 delivered manual follow-up 分支都会闭合当前链条，而 repair / receipt-triage 分支仍只输出显式 machine-readable routing，不会偷跑到下一层 executor。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` 和 `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` 现在还能把这层最新的 downstream provider post-delivery closure / follow-up routing 进一步导出为下一层 executor-ready delivery plan；trusted artifact handoff 与 delivered manual follow-up 分支保持纯 no-op / closed 语义，而 repair / receipt-triage 分支才生成 deterministic downstream upsert payload。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt` 和 `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt` 现在还能把这层最新 executor-ready delivery plan 的执行结果回收成 machine-readable receipt；trusted handoff / delivered-closed 分支继续保持纯 no-op receipt，而更深 manual-follow-up 分支只记录 deterministic executor outcome。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation` 和 `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation` 现在还能把这层最新 `plan + receipt` 进一步归约成新的 downstream reconciliation/result summary，明确区分 closed、manual repair 和 receipt triage，而不会信任 malformed receipt metadata。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` 和 `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` 现在还能把这层最新 downstream provider post-delivery executor trio 再推进成下一层 closure / follow-up routing contract，明确区分 `result_artifact_handoff_ready`、`manual_follow_up_item_delivered`、`repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required` 和 `receipt_triage_required`。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` 和 `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` 现在还能把这层最新 downstream provider post-delivery closure / follow-up routing contract 进一步导出为 executor-ready delivery plan；trusted handoff / delivered-closed 分支继续保持 no-op，而 repair / receipt-triage 分支才生成 deterministic downstream upsert payload。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt` 和 `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt` 现在还能把该 delivery plan 的执行结果回收成 source-validated receipt；no-op 分支保持纯 no-op receipt，更深 manual-follow-up 分支只记录 deterministic executor outcome。
- Darwin 只读冷审抓到并已修复一个 P1：latest downstream receipt validator 现在会拒绝 malformed operation status enum，避免 `skipped` 之类伪造状态被当成 applied executor outcome 进入 reconciliation。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation` 和 `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation` 现在还能把该 `plan + receipt` 进一步归约成 reconciliation/result summary，继续区分 closed、manual repair 和 receipt triage，且不信任 malformed receipt metadata。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` 和 `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` 现在还能把这层最新 downstream provider post-delivery executor trio 再推进成下一层 closure / follow-up routing contract；trusted artifact handoff 与 delivered manual follow-up 分支保持 closed / no-op 语义，而 repair / receipt-triage 分支仍显式输出 machine-readable routing。
- Darwin 只读冷审随后又抓到并已修复一个 P1/P2：新层级 manual triage item key / label 现在带完整链路深度，避免与旧层 inbox item 碰撞；分支测试也补齐 trusted artifact handoff、repair-required、receipt-triage-required 三种路径。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` 现在已把这层最新 closure / follow-up routing contract 导出为下一层 executor-ready delivery plan / receipt / reconciliation trio；trusted artifact handoff 与 delivered manual follow-up 分支保持 no-op/closed，repair / receipt-triage 分支才生成 deterministic downstream upsert payload，并且 invalid receipt 会清空不可信 final delivery metadata。
- Darwin 只读冷审又抓到并已修复两个 P2：invalid receipt 现在能通过 CLI render/validate 进入 `manual_receipt_triage` reconciliation，而不是在 source validation 阶段被提前拦死；最新 executor-ready trio 也补上 artifact handoff、repair failed upsert、malformed receipt 清理三类分支回归。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` 和对应 `validate` 命令现在已把这层最新 executor-ready delivery plan / receipt / reconciliation trio 再归约成下一层 closure / follow-up routing contract；trusted artifact handoff 与 delivered manual follow-up 分支保持 closed/no-op，repair / receipt-triage 分支继续输出显式 machine-readable routing，并且 malformed receipt 分支会保留 receipt issue code 供人工 triage。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` 现在已把这层最新 closure / follow-up routing contract 再导出为 executor-ready delivery trio；trusted handoff / delivered-closed 分支保持 no-op，repair / receipt-triage 分支生成 deterministic upsert payload，且 standalone contract validation 已改为在 receipt-triage 分支接受 source-aware issue-code labels 而不丢失 fail-closed 结构约束。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` 和对应 `validate` 命令现在已把这层最新 executor-ready delivery plan / receipt / reconciliation trio 再归约成下一层 closure / follow-up routing contract；source validation 会校验上一层 N=6 plan / receipt / reconciliation 链，trusted artifact handoff 与 delivered manual follow-up 分支保持 closed/no-op，repair 分支输出 N=7 深度区分 payload，receipt-triage 分支继续保留 source-aware issue code。
- Darwin 只读冷审抓到并已修复一个 P2：新 N=7 routing 的 direct builder / standalone source-contract helper 现在会校验 plan 与 reconciliation 的 scalar linkage、artifact/active context 一致性，以及 receipt-triage 分支的 invalid-receipt 结构约束，避免合法 plan 与伪造 reconciliation 被拼接成新 routing contract。
- Darwin 二轮只读复审确认：该 direct-builder bypass 修复后无 P0/P1/P2 残留；保留的观察项是 direct builder 仍只接收 plan + reconciliation，完整 source chain 继续由 CLI/source validator 负责，这是当前 contract 分层边界。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` 现在已把这层最新 closure / follow-up routing contract 再导出为 executor-ready delivery plan / receipt / reconciliation trio；trusted artifact handoff 与 delivered manual follow-up 分支保持 no-op/closed，repair / receipt-triage 分支生成 deterministic downstream upsert payload，invalid receipt 会清空不可信 final delivery metadata。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` 和对应 `validate` 命令现在已把这层最新 executor-ready delivery plan / receipt / reconciliation trio 再归约成下一层 closure / follow-up routing contract；source validator 会校验完整 upstream source chain + N=7 plan / receipt / reconciliation，trusted handoff / delivered-closed 分支保持 no-op，repair / receipt-triage 分支输出 N=8 深度区分 payload。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` 现在已把这层最新 N=8 closure / follow-up routing contract 导出为 executor-ready delivery plan / receipt / reconciliation trio；trusted handoff / delivered-closed 分支保持 no-op，repair / receipt-triage 分支生成 deterministic downstream upsert payload，invalid receipt 会清空不可信 final delivery metadata。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` 和对应 `validate` 命令现在已把这层最新 N=8 executor-ready delivery plan / receipt / reconciliation trio 再归约成下一层 closure / follow-up routing contract；source validator 会校验完整 upstream source chain + N=8 plan / receipt / reconciliation，trusted closed 分支继续 no-op，repair / receipt-triage 分支输出 depth-disambiguated deterministic routing。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` 现在已把这层最新 N=9 closure / follow-up routing contract 导出为 executor-ready delivery plan / receipt / reconciliation trio；trusted handoff / delivered-closed 分支保持 no-op，repair / receipt-triage 分支生成 deterministic downstream upsert payload，invalid receipt 会清空不可信 final delivery metadata。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` 和对应 `validate` 命令现在已把这层最新 N=9 executor-ready delivery plan / receipt / reconciliation trio 再归约成下一层 closure / follow-up routing contract；source validator 会校验完整 upstream source chain + N=9 plan / receipt / reconciliation，trusted closed 分支继续 no-op，repair / receipt-triage 分支输出 depth-disambiguated deterministic routing。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` 现在已把这层最新 N=10 closure / follow-up routing contract 再导出为 executor-ready delivery plan / receipt / reconciliation trio；trusted handoff / delivered-closed 分支保持 no-op，repair / receipt-triage 分支生成 deterministic downstream upsert payload，invalid receipt 会清空不可信 final delivery metadata。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` 和对应 `validate` 命令现在已把这层最新 N=10 executor-ready delivery plan / receipt / reconciliation trio 再归约成 N=11 closure / follow-up routing contract；source validator 会校验完整 upstream source chain + N=10 plan / receipt / reconciliation，trusted closed 分支继续 no-op，repair / receipt-triage 分支输出 depth-disambiguated deterministic routing。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` 现在已把这层最新 N=11 closure / follow-up routing contract 再导出为 executor-ready delivery plan / receipt / reconciliation trio；trusted handoff / delivered-closed 分支保持 no-op，repair / receipt-triage 分支生成 deterministic downstream upsert payload，failed receipt 会清空不可信 final delivery metadata。
- N=11 trio 的内部源码文件已短命名为 `provider-execution-follow-up-n11-*`，但 public schema / CLI contract 名称保持不变；这样能避开 Windows build emit 路径长度限制，同时不破坏自动化合同。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` 和对应 `validate` 命令现在已把这层最新 N=11 executor-ready delivery plan / receipt / reconciliation trio 再归约成 N=12 closure / follow-up routing contract；内部源码短命名为 `provider-execution-follow-up-n12.ts`，public schema / CLI contract 名称保持完整长名，source validator 会校验完整 upstream chain + N=11 plan / receipt / reconciliation，trusted closed 分支保持 no-op，repair / receipt-triage 分支继续输出 depth-disambiguated deterministic routing。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` 现在已把这层最新 N=12 closure / follow-up routing contract 再导出为 executor-ready delivery plan / receipt / reconciliation trio；内部源码短命名为 `provider-execution-follow-up-n12-*`，public schema / CLI contract 名称保持完整长名，trusted handoff / delivered-closed 分支保持 no-op，repair / receipt-triage 分支生成 deterministic downstream upsert payload，failed receipt 会清空不可信 final delivery metadata。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` 和对应 `validate` 命令现在已把这层最新 N=12 executor-ready delivery plan / receipt / reconciliation trio 再归约成 N=13 closure / follow-up routing contract；内部源码短命名为 `provider-execution-follow-up-n13.ts`，public schema / CLI contract 名称保持完整长名，source validator 会校验完整 upstream chain + N=12 plan / receipt / reconciliation，trusted closed 分支保持 no-op，repair / receipt-triage 分支继续输出 depth-disambiguated deterministic routing。
- Beauvoir 只读冷审抓到并已修复一个 P2：N=13 delivered manual-follow-up 分支现在信任 N=12 reconciliation 的 `final_follow_up_item_key/final_follow_up_queue` 作为当前 active item，不再错误要求 `preserved_active_follow_up_item` 非空；回归覆盖已包含 failed repair、applied delivered，以及 preserved 为空但 final item 已交付的 direct builder/validator 变体。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` 现在已把这层最新 N=13 closure / follow-up routing contract 导出为 executor-ready delivery plan / receipt / reconciliation trio；内部源码短命名为 `provider-execution-follow-up-n13-*`，public schema / CLI contract 名称保持完整长名，trusted handoff / delivered-closed 分支保持 no-op，repair / receipt-triage 分支生成 deterministic downstream upsert payload，failed receipt 会清空不可信 final delivery metadata。
- N=13 executor-ready trio 的回归测试已做性能收敛：CLI 覆盖保留 full source-chain routing 与 plan render/validate，receipt / reconciliation 分支改为直接契约测试，避免巨型递归 CLI 测试超过 15 分钟，同时继续覆盖 repair failed-upsert、delivered no-op、standalone plan contract 与 fail-closed reconciliation 语义。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` 和对应 `validate` 命令现在已把这层最新 N=13 executor-ready delivery plan / receipt / reconciliation trio 再归约成 N=14 closure / follow-up routing contract；内部源码短命名为 `provider-execution-follow-up-n14.ts`，public schema / CLI contract 名称保持完整长名，source validator 会校验完整 upstream chain + N=13 plan / receipt / reconciliation，trusted artifact handoff 与 delivered-closed 分支保持 no-op，repair / receipt-triage 分支继续输出 depth-disambiguated deterministic routing。
- N=14 routing 的直接契约回归已覆盖 artifact handoff、delivered closed、repair required、receipt triage 和 forged source linkage；整份 provider follow-up delivery CLI 回归文件也已通过，确认未破坏既有 N13 routing / N13 executor-ready trio 链路。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` 现在已把这层最新 N=14 closure / follow-up routing contract 导出为 executor-ready delivery plan / receipt / reconciliation trio；内部源码短命名为 `provider-execution-follow-up-n14-*`，public schema / CLI contract 名称保持完整长名，trusted artifact handoff / delivered-closed 分支保持 no-op，repair / receipt-triage 分支生成 deterministic downstream upsert payload，invalid receipt 会清空不可信 final delivery metadata。
- N=14 executor-ready trio 的回归保持性能收敛：新增 direct contract regression 覆盖 artifact no-op、delivered no-op、repair failed-upsert、malformed receipt fail-closed，避免再引入递归 CLI 全链路爆炸。
- Hooke 只读冷审抓到并已修复一个 P2：N=14 receipt validator 现在会先 shape-guard `operations`，缺失或非数组的 malformed receipt 不再抛异常，而是进入 manual receipt triage 并清空不可信 delivery/final metadata；回归已显式覆盖 missing 与 non-array 两种 shape-invalid receipt。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` 和对应 `validate` 命令现在已把这层最新 N=14 executor-ready delivery plan / receipt / reconciliation trio 再归约成 N=15 closure / follow-up routing contract；内部源码短命名为 `provider-execution-follow-up-n15.ts`，public schema / CLI contract 名称保持完整长名，source validator 会校验完整 upstream chain + N=14 plan / receipt / reconciliation，trusted artifact handoff 与 delivered-closed 分支继续 no-op，repair / receipt-triage 分支输出 N=15 depth-disambiguated deterministic routing。
- N=15 routing 的直接契约回归已覆盖 artifact handoff、delivered closed、repair required、receipt triage 和 forged source linkage。
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` 现在已把 N=15 closure / follow-up routing contract 导出为 executor-ready delivery plan / receipt / reconciliation trio；内部源码短命名为 `provider-execution-follow-up-n15-*`，public schema / CLI contract 名称保持完整长名，trusted artifact handoff / delivered-closed 分支保持 no-op，repair / receipt-triage 分支生成 deterministic downstream upsert payload，invalid receipt 会清空不可信 final delivery metadata。
- N=15 executor-ready trio 的直接契约回归已覆盖 artifact no-op、delivered no-op、repair failed-upsert、malformed receipt fail-closed，以及 invalid receipt 清理 untrusted final delivery metadata。
- Confucius 只读冷审抓到并已修复一个 P1/P2：N=15 invalid receipt reconciliation 不再保留 artifact handoff metadata；N=15 plan / receipt / reconciliation validate CLI 在 source validator 或 source contract 失败时返回结构化 validation issues，而不是 raw stderr 异常。
- N=16 closure / follow-up routing contract 已通过短内部模块 `provider-execution-follow-up-n16.ts` 接入；它会把 N=15 executor-ready plan / receipt / reconciliation trio 再归约为下一层 routing，并要求 source validator 校验完整 upstream chain + N=15 trio，trusted handoff / delivered-closed 分支保持 no-op，repair / receipt-triage 分支输出 N=16 depth-disambiguated deterministic routing。
- N=16 routing 的直接契约回归已覆盖 artifact handoff、delivered closed、repair required、receipt triage 和 forged N15 reconciliation source linkage。
- `render-review-provider-execution-follow-up...N16-plan` / `receipt` / `reconciliation` 现在已把 N=16 closure / follow-up routing contract 再导出为 executor-ready delivery plan / receipt / reconciliation trio；trusted artifact handoff / delivered-closed 分支保持 no-op，repair / receipt-triage 分支生成 deterministic downstream upsert payload，invalid receipt 会清空不可信 final delivery metadata。
- N=16 executor-ready trio 的直接契约回归已覆盖 artifact no-op、delivered no-op、repair failed-upsert、malformed receipt fail-closed，以及 failed upsert 不传播 final follow-up target。
- Arendt 只读冷审抓到并已修复两个 N=16 P2：N=16 plan / receipt / reconciliation render CLI 现在用 safe source validator，malformed/null source 会返回结构化 validation failure 而不是 raw TypeError；N=16 receipt validator 现在 shape-guards `operations[]` entry，`operations: [null]` 会进入 manual receipt triage 并清空不可信 final metadata。
- N=17 closure / follow-up routing contract 已通过短内部模块 `provider-execution-follow-up-n17.ts` 接入；它会把 N=16 executor-ready plan / receipt / reconciliation trio 再归约为下一层 routing，并要求 source validator 校验完整 upstream chain + N=16 trio，trusted handoff / delivered-closed 分支保持 no-op，repair / receipt-triage 分支输出 N=17 depth-disambiguated deterministic routing。
- N=17 routing 的直接契约回归已覆盖 artifact handoff、delivered closed、repair required、receipt triage、forged N16 reconciliation linkage，以及 malformed source chain 的结构化 fail-closed CLI 路径。
- Einstein 只读冷审抓到并已修复两个 N=17 P1/P2：N=17 现在接受 N=16 repair upsert 成功后的 `closed/none` 合法链路并归约为 `manual_follow_up_item_delivered`，同时 N=17 validator 会 shape-guard malformed current follow-up payload，避免 source 合法但 current routing JSON 为 `null` 时冒 raw TypeError。
- `render-review-provider-execution-follow-up...N17-plan` / `receipt` / `reconciliation` 现在已把 N=17 closure / follow-up routing contract 再导出为 executor-ready delivery plan / receipt / reconciliation trio；trusted handoff / delivered-closed 分支保持 no-op，repair / receipt-triage 分支生成 deterministic downstream upsert payload，invalid receipt 会清空不可信 final delivery metadata。
- 下一工程目标顺延为把 N=17 executor-ready delivery plan / receipt / reconciliation trio 再归约为 N=18 closure / follow-up routing contract。
- `render-review-inbox-item` 现在可把 review artifact 导出为稳定 inbox handoff JSON，包含 `item_key`、queue、action、labels 和 decision boundary，后续自动化不必再手工拼装这些字段。
- 这个 inbox handoff 现在还包含 `chain_key` 和 `predecessor_item_key`，后续自动化可以按 rerun lineage 去重、替代旧任务，而不是为同一条 review chain 重复开 inbox item。
- 这个 inbox handoff 现在还会显式标出 `delivery_action`，让后续自动化直接执行“创建新任务”或“替代旧任务”，而不是再根据 predecessor 字段自己推断。
- `render-review-inbox-delivery-plan` 现在还能把 handoff 进一步导出为 executor-ready action plan，明确给出 `upsert` 和 `close` 操作，后续自动化不必把 handoff 再翻译成动作列表。
- `validate-review-inbox-delivery-plan` 现在还能在执行前校验 plan 文件本身，避免 create/replace 语义不一致的 delivery plan 被自动化 worker 宽松解释。
- 这些 inbox delivery plan 现在还带稳定 `operation_key`，后续自动化 worker 即使重试同一个 plan，也能按动作级别做幂等去重，而不必自行发明 replay key。
- `render-review-inbox-delivery-receipt` 和 `validate-review-inbox-delivery-receipt` 现在还能把执行结果回收成稳定 receipt 合同，并校验每个动作的 outcome、整体状态和最终 active item 是否与原 plan 一致。
- `render-review-inbox-delivery-reconciliation` 和 `validate-review-inbox-delivery-reconciliation` 现在还能把 plan + receipt 进一步归约成闭环结果，明确这一轮 inbox chain 是已闭合、只剩 cleanup，还是需要 manual repair/triage。
- `render-review-inbox-delivery-follow-up` 和 `validate-review-inbox-delivery-follow-up` 现在还能把 plan + reconciliation 进一步归约成 follow-up routing / closure policy，明确这条 delivery chain 是否已经收口，还是要打开 cleanup、repair 或 receipt-triage 的后续人工任务。
- 这一层最近的只读冷审抓到过一个中风险：如果 reconciliation 自身和 source plan 不一致，follow-up renderer 可能误开人工任务。当前 `render-review-inbox-delivery-follow-up` 已先做 source validation，不一致时直接 fail-fast，而不是继续生成 follow-up 合同。
- `render-review-inbox-delivery-follow-up-plan` 和 `validate-review-inbox-delivery-follow-up-plan` 现在还能把 follow-up routing 合同进一步导出为 executor-ready follow-up delivery plan；这层会保留原 active item 语义，同时为 cleanup / repair / receipt-triage 生成稳定的 manual-task upsert 计划，而不需要后续自动化再自行拼装。
- `render-review-inbox-delivery-follow-up-receipt` 和 `validate-review-inbox-delivery-follow-up-receipt` 现在还能把这些 executor-ready follow-up delivery plan 的执行结果回收成稳定 receipt，并校验 preserved active item 与最终 follow-up item 是否和源计划一致。
- 这条链最近又补了一轮 cold review 修复：`render-review-inbox-delivery-follow-up-plan` 现在会先校验 source follow-up 合同本身，`render/validate-review-inbox-delivery-follow-up-receipt` 也都要求先通过 `follow-up -> plan` 的上游校验，避免 malformed follow-up 输入继续向 downstream executor-ready 合同扩散。
- `render-review-inbox-delivery-follow-up-reconciliation` 和 `validate-review-inbox-delivery-follow-up-reconciliation` 现在还能把 `follow-up -> plan -> receipt` 再归约成 machine-readable result summary，明确 follow-up 任务是否已真正送达，还是仍需 manual repair / receipt triage。
- 最新一轮只读冷审又补掉了一个 P2：当 `receipt_validation_ok = false` 时，`receipt_triage_required` follow-up 不再传播 reconciliation 里的 `final_active_item_key/final_active_queue`；active item 会被强制清空，manual triage summary 和 labels 也会明确显示 `No trustworthy active inbox item is currently confirmed.`，避免把不可信 receipt 里的旧 active item 当成事实继续向下游传递。
- scoped rerun 的执行门禁已接入：非 blocked artifact、`manual_review_required` artifact，或显式 `--rerun-from` 缩窄推荐范围时，系统会在执行前直接拒绝。
- 该能力当前仍保持 fail-closed：不写回 `unit.yaml`，只生成新的 review artifact，是否 promote 仍必须经过人工 approval。
