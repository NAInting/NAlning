# 阶段 0.2 Monorepo 结构搭建 Spec

版本：2026-04-21

## 一、目标

用 pnpm workspace + Turborepo 把当前项目整理为可长期演进的 monorepo。

阶段 0.2 的核心目标：

1. 让现有 `edu_ai_frontend_v1` 成功迁入 `apps/frontend-governance`。
2. 让 `packages/shared-types` 成为 workspace 内的基础包。
3. 为后续 `frontend-user`、`backend`、`content-pipeline`、`llm-gateway`、`privacy-filter` 预留结构。
4. 统一根目录的构建、测试、类型检查命令。
5. 保持现有治理前端零回归。

## 二、非目标

本阶段不做：

- 不实现真实后端业务。
- 不实现 LLM Gateway。
- 不接入 pgvector。
- 不重构现有治理前端 UI。
- 不替换现有前端 API mock。
- 不删除旧目录，除非迁移验证通过并经用户确认。

## 三、目标目录结构

```text
edu-ai-platform/
├── apps/
│   ├── frontend-governance/
│   ├── frontend-user/
│   ├── backend/
│   └── content-pipeline/
├── packages/
│   ├── shared-types/
│   ├── agent-sdk/
│   ├── llm-gateway/
│   ├── privacy-filter/
│   └── ui-kit/
├── content/
│   ├── curriculum-standards/
│   ├── units/
│   └── pedagogy-library/
├── docs/
│   ├── PROJECT_EXECUTION_PLAYBOOK.md
│   ├── REVIEW_AND_SELF_CHECK_PROCESS.md
│   ├── PHASE_0_STATUS_AND_NEXT_STEPS.md
│   ├── PHASE_0_2_MONOREPO_SPEC.md
│   ├── GOVERNANCE.md
│   ├── AGENT_PROTOCOL.md
│   ├── UNIT_SPEC.md
│   └── SCHEMA.md
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── tsconfig.base.json
```

说明：

- 当前仓库根目录就是工作区根，不额外创建一层 `edu-ai-platform` 目录。
- `edu_ai_frontend_v1` 迁入 `apps/frontend-governance` 后，旧目录先保留为迁移备份。
- `packages/shared-types` 保持现有实现，只调整 package 管理方式。

## 四、根配置要求

### 1. `pnpm-workspace.yaml`

必须覆盖：

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 2. 根 `package.json`

建议脚本：

```json
{
  "private": true,
  "packageManager": "pnpm@9.15.0",
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "typecheck": "turbo typecheck",
    "test": "turbo test",
    "lint": "turbo lint",
    "clean": "turbo clean"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.0.0"
  }
}
```

版本可按本机可用环境微调，但必须写入 `IMPLEMENTATION_REPORT`。

### 3. `turbo.json`

最小 pipeline：

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "typecheck": {
      "dependsOn": ["^typecheck"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
```

### 4. `tsconfig.base.json`

根 TypeScript 配置只放公共规则，不强迫所有 app 使用同一个 module target。各 package 可继承。

## 五、迁移步骤

### Step 1：创建 monorepo 根配置

新增：

- `package.json`
- `pnpm-workspace.yaml`
- `turbo.json`
- `tsconfig.base.json`

验收：

```powershell
pnpm --version
pnpm install
```

### Step 2：创建 app/package/content 占位目录

新增目录：

- `apps/frontend-user`
- `apps/backend`
- `apps/content-pipeline`
- `packages/agent-sdk`
- `packages/llm-gateway`
- `packages/privacy-filter`
- `packages/ui-kit`
- `content/curriculum-standards`
- `content/units`
- `content/pedagogy-library`

占位 package 可以只放 `README.md`，避免过早引入无用依赖。

### Step 3：迁移治理前端

执行策略：

1. 复制 `edu_ai_frontend_v1` 到 `apps/frontend-governance`。
2. 修改 `apps/frontend-governance/package.json`：
   - package name 建议改为 `@edu-ai/frontend-governance`。
   - `@edu-ai/shared-types` 从 `file:../packages/shared-types` 改为 `workspace:*`。
3. 检查 Vite、TypeScript、路径别名不受目录层级影响。
4. 运行构建。

验收：

```powershell
pnpm --filter @edu-ai/frontend-governance typecheck
pnpm --filter @edu-ai/frontend-governance build
```

### Step 4：纳入 shared-types

检查 `packages/shared-types/package.json`：

- package name 保持 `@edu-ai/shared-types`。
- scripts 保持 `typecheck`、`test`、`build`。
- 不引入前端依赖。

验收：

```powershell
pnpm --filter @edu-ai/shared-types typecheck
pnpm --filter @edu-ai/shared-types test
```

### Step 5：根命令验收

运行：

```powershell
pnpm typecheck
pnpm test
pnpm build
```

通过标准：

- `shared-types` 类型检查通过。
- `shared-types` 测试通过。
- `frontend-governance` 类型检查通过。
- `frontend-governance` build 通过。

## 六、回滚策略

阶段 0.2 是结构迁移，必须低风险：

1. 迁移前不删除 `edu_ai_frontend_v1`。
2. 如果 `apps/frontend-governance` 构建失败，旧目录仍可继续作为工作版本。
3. 根配置失败时，只回退新增 monorepo 配置，不影响旧前端。
4. 只有在 Claude Code 审核 8.5 定版后，才讨论是否归档旧目录。

## 七、完工检查清单

| 检查项 | 命令或证据 | 必须通过 |
|---|---|---|
| pnpm workspace 安装 | `pnpm install` | 是 |
| shared-types 类型检查 | `pnpm --filter @edu-ai/shared-types typecheck` | 是 |
| shared-types 测试 | `pnpm --filter @edu-ai/shared-types test` | 是 |
| governance 前端类型检查 | `pnpm --filter @edu-ai/frontend-governance typecheck` | 是 |
| governance 前端构建 | `pnpm --filter @edu-ai/frontend-governance build` | 是 |
| 根类型检查 | `pnpm typecheck` | 是 |
| 根测试 | `pnpm test` | 是 |
| 根构建 | `pnpm build` | 是 |
| 旧目录未破坏 | `edu_ai_frontend_v1` 仍可 build 或被明确标记为备份 | 是 |
| 报告生成 | `docs/PHASE_0_2_IMPLEMENTATION_REPORT.md` | 是 |

## 八、Codex 自查重点

迁移完成后，Codex 必须检查：

- 是否有硬编码旧路径。
- 是否有两个不同版本的 `@edu-ai/shared-types`。
- 是否生成了重复 lockfile。
- 是否引入了不必要的大依赖。
- 是否能从根目录执行统一命令。
- 是否所有新增占位 package 都明确标注“未实现”。

## 九、Claude Code 复查重点

请 Claude 重点审：

- Monorepo 结构是否忠实于项目规划。
- `frontend-governance` 是否零回归。
- `shared-types` 是否仍是基础包，而不是被前端反向依赖。
- 根命令是否真实可用。
- 旧目录保留策略是否清楚。
- 是否存在未来 0.3/0.4/0.5 会被当前结构卡住的问题。

## 十、下一阶段出口

0.2 定版后进入：

- `0.3 LLM Gateway`：统一模型调用入口。
- 可并行起草 `0.4 向量数据库 + 记忆系统基础` Spec。

但不建议在 0.2 未锁定前开始大量业务编码。否则 workspace 迁移会放大冲突。
