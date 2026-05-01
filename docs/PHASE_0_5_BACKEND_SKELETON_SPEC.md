# Phase 0.5 Minimal Backend Skeleton Spec

Date: 2026-04-22

## Goal

Create the first real HTTP backend entry point for the platform so Phase 1+ code does not keep growing around frontend-only mocks.

This phase is a skeleton, not the final production backend. It must prove the API shape, auth boundary, unified errors, audit logging, OpenAPI exposure, and smoke-test workflow.

## Scope

Implement `apps/backend` as a workspace app.

Required capabilities:

1. Hono HTTP app that can run locally.
2. Health endpoint.
3. Minimal login endpoint that returns a bearer token for demo roles.
4. Bearer-auth middleware for `/api/v1/*`.
5. Unified JSON error response.
6. In-memory demo repository with the same pilot IDs used by frontend/governance demos.
7. In-memory audit ledger for write / export actions.
8. Static OpenAPI document exposed at `/openapi.json`.
9. Ten core API paths from the existing OpenAPI draft:
   - `GET /api/v1/students/:studentToken/mastery`
   - `POST /api/v1/student-agent/sessions`
   - `GET /api/v1/students/:studentToken/my-profile`
   - `POST /api/v1/teacher-agent/reports/daily`
   - `POST /api/v1/interventions`
   - `POST /api/v1/audit/export-requests`
   - `GET /api/v1/consents/:studentToken/status`
   - `POST /api/v1/consents`
   - `POST /api/v1/consents/:consentId/withdraw`
   - `POST /api/v1/auth/login`
10. Smoke tests covering login, authenticated read, write audit, and OpenAPI availability.

## Non-goals

- No real Postgres connection yet.
- No Prisma migrations yet.
- No replacement of frontend API files yet.
- No production JWT signing yet.
- No real password storage.
- No LLM calls.
- No persistent audit table.

These are deliberate deferrals to keep 0.5 focused on backend shape and contracts.

## Directory

```text
apps/backend/
├── src/
│   ├── app.ts
│   ├── index.ts
│   ├── auth.ts
│   ├── errors.ts
│   ├── openapi.ts
│   ├── routes/
│   │   ├── audit.ts
│   │   ├── auth.ts
│   │   ├── consents.ts
│   │   ├── students.ts
│   │   └── teacher.ts
│   └── services/
│       ├── audit-ledger.ts
│       └── demo-repository.ts
├── tests/
│   └── backend.spec.ts
├── package.json
├── tsconfig.json
├── tsconfig.build.json
└── vitest.config.ts
```

## Done Criteria

- `pnpm --filter @edu-ai/backend typecheck` passes.
- `pnpm --filter @edu-ai/backend test` passes.
- `pnpm --filter @edu-ai/backend build` passes.
- Root `pnpm typecheck`, `pnpm test`, `pnpm build` remain green.
- `docs/PHASE_0_5_IMPLEMENTATION_REPORT.md` exists and states all deviations from production intent.

