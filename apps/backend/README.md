# backend

Minimal Hono HTTP backend for phase 0.5.

Status: first skeleton implemented.

Capabilities:

- `GET /healthz`
- `GET /openapi.json`
- demo bearer login
- bearer-auth middleware for `/api/v1/*`
- unified error response
- student mastery / profile endpoints
- student-agent session endpoint
- teacher daily report endpoint
- intervention create endpoint
- consent lifecycle endpoints
- audit export request endpoint

Non-goals:

- no real Postgres / Prisma connection yet
- no production JWT signing yet
- no frontend API replacement yet
- no persistent audit table yet

Local checks:

```powershell
pnpm --filter @edu-ai/backend typecheck
pnpm --filter @edu-ai/backend test
pnpm --filter @edu-ai/backend build
```
