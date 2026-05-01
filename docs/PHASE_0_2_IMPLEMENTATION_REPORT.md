# 阶段 0.2 Monorepo 结构搭建实施报告

日期：2026-04-21

## 一、执行范围

本轮按 `docs/PHASE_0_2_MONOREPO_SPEC.md` 执行阶段 `0.2` 的低风险 monorepo 迁移。

已完成：

- 新增 pnpm workspace 根配置。
- 新增 Turborepo 根任务配置。
- 新增根 TypeScript 公共配置。
- 新增根 `.gitignore`，忽略 workspace 的 `node_modules`、`dist`、`.turbo`。
- 复制 `edu_ai_frontend_v1` 到 `apps/frontend-governance`。
- 将迁入后的治理前端包名改为 `@edu-ai/frontend-governance`。
- 将迁入后的治理前端依赖 `@edu-ai/shared-types` 改为 `workspace:*`。
- 保留旧目录 `edu_ai_frontend_v1`，未删除、未归档。
- 创建后续 app/package/content 占位目录。
- 创建 `docs/GOVERNANCE.md`、`docs/AGENT_PROTOCOL.md`、`docs/UNIT_SPEC.md` 三个长期协议入口。
- 删除 workspace 包内残留的 `packages/shared-types/package-lock.json`，避免与根 `pnpm-lock.yaml` 形成重复 lockfile。
- 将 `@edu-ai/shared-types` 的 `build` 改为 declaration-only 构建，输出 `dist/`，避免 Turborepo build 无产物警告。

## 二、实际版本

| 项目 | Spec 建议 | 实际采用 | 原因 |
|---|---:|---:|---|
| pnpm | `pnpm@9.15.0` | `pnpm@10.33.0` | 本机当前可用版本，已写入根 `packageManager` |
| turbo | `^2.0.0` | `^2.6.1`，实际安装 `2.9.6` | pnpm 解析到兼容的最新 2.x 版本 |
| TypeScript | `^5.0.0` | `^5.9.3` | 与现有前端和 shared-types 保持一致 |

## 三、目录结构结果

新增根配置：

- `package.json`
- `.gitignore`
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.base.json`
- `pnpm-lock.yaml`

新增 app：

- `apps/frontend-governance`
- `apps/frontend-user`
- `apps/backend`
- `apps/content-pipeline`

新增 package：

- `packages/agent-sdk`
- `packages/llm-gateway`
- `packages/privacy-filter`
- `packages/ui-kit`

新增 content：

- `content/curriculum-standards`
- `content/units`
- `content/pedagogy-library`

## 四、验证结果

### 1. Workspace 安装

```powershell
pnpm install
```

结果：通过。pnpm 识别 3 个 workspace projects：根、`@edu-ai/shared-types`、`@edu-ai/frontend-governance`。

说明：pnpm 将此前 npm 安装的依赖移动到 `.ignored`，这是从 npm 目录切换到 pnpm workspace 时的正常迁移行为。

### 2. Filter 命令

```powershell
pnpm --filter @edu-ai/shared-types typecheck
pnpm --filter @edu-ai/shared-types test
pnpm --filter @edu-ai/frontend-governance typecheck
pnpm --filter @edu-ai/frontend-governance build
```

结果：

- `@edu-ai/shared-types` 类型检查通过。
- `@edu-ai/shared-types` 测试通过，108 tests passed。
- `@edu-ai/shared-types` 构建通过，并生成 declaration output。
- `@edu-ai/frontend-governance` 类型检查通过。
- `@edu-ai/frontend-governance` 构建通过。

### 3. 根命令

```powershell
pnpm typecheck
pnpm test
pnpm build
pnpm lint
```

结果：

- `pnpm typecheck` 通过，2 个任务成功。
- `pnpm test` 通过，2 个任务成功。
- `pnpm build` 通过，2 个任务成功。
- `pnpm lint` 通过，但当前为 Phase 0.2 占位 lint，不代表 ESLint 已配置。

### 4. 旧目录回归

```powershell
cd edu_ai_frontend_v1
npm run typecheck
npm run build
```

结果：旧目录仍可类型检查和构建，回滚路径未破坏。

## 五、已知观察项

| 观察项 | 影响 | 处理建议 |
|---|---|---|
| `pnpm install` 提示忽略 `esbuild`、`msw`、`vue-demi` build scripts | 当前构建已通过，不影响本轮验收 | 如后续依赖需要 postinstall，可执行 `pnpm approve-builds` |
| `pnpm lint` 为占位脚本 | 避免根命令失败，但不提供真实 lint 质量门 | 阶段 0.6 接入 ESLint/CI 时替换 |
| 旧目录 `edu_ai_frontend_v1/package-lock.json` 保留 | 旧目录作为回滚备份仍可用 npm 构建 | 只有在确认归档旧目录时再处理 |
| `_pdf_tools/package-lock.json` 保留 | 不属于 pnpm workspace 范围 | 不影响 0.2 |

### shared-types 运行时发布策略

替代复审提出 P2 观察：`@edu-ai/shared-types` 当前 `exports` 仍指向 `src/*.ts`，而 `build` 生成 declaration-only `dist/`。本阶段决定如下：

- 阶段 `0.2` 到 `0.3` 采用 workspace source-first 策略，消费者均应通过 TypeScript 工具链消费源码。
- declaration-only `dist/` 只作为类型产物和 Turborepo build output，不作为运行时入口。
- 阶段 `0.5` 后端骨架或首次 plain Node runtime 消费本包前，必须重新决定是否改为 JS + d.ts 双产物发布。

该策略不阻塞 `0.2` 定版，但已作为 `0.3/0.5` 前置注意事项记录。

## 六、完工清单

| 检查项 | 状态 |
|---|---|
| pnpm workspace 安装 | 通过 |
| shared-types 类型检查 | 通过 |
| shared-types 测试 | 通过 |
| governance 前端类型检查 | 通过 |
| governance 前端构建 | 通过 |
| 根类型检查 | 通过 |
| 根测试 | 通过 |
| 根构建 | 通过 |
| 旧目录未破坏 | 通过 |
| 报告生成 | 通过 |

## 七、当前结论

阶段 `0.2` 的主要工程目标已完成。替代独立复审结论为：

- P0：无。
- P1：无。
- P2：1 项，已记录为 shared-types 运行时发布策略注意事项。
- 评分建议：8.5/10。

当前可将阶段 `0.2` 定版为 8.5，并开始阶段 `0.3 LLM Gateway` Spec 或实现准备。
