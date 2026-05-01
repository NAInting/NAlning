# Phase 0.5 Minimal Backend Skeleton Implementation Report

Date: 2026-04-22

## Scope Completed

Implemented `apps/backend` as the first real HTTP backend skeleton.

Delivered:

- Hono app factory in `apps/backend/src/app.ts`.
- Local server entrypoint in `apps/backend/src/index.ts`.
- Demo bearer login in `POST /api/v1/auth/login`.
- Auth middleware for protected `/api/v1/*` routes.
- Student / guardian token binding guard for student-scoped resources.
- Unified request id and error response handling.
- Static OpenAPI document at `GET /openapi.json`.
- Health endpoint at `GET /healthz`.
- In-memory demo repository with stable pilot IDs.
- In-memory audit ledger for intervention, consent, and audit export write actions.
- Binding guards for teacher intervention target, consent target, and student-scoped reads.
- Shared malformed JSON parser that returns `400 bad_request`.
- Smoke tests in `apps/backend/tests/backend.spec.ts`.

## Implemented API Paths

| Path | Method | Status |
|---|---:|---|
| `/healthz` | GET | implemented |
| `/openapi.json` | GET | implemented |
| `/api/v1/auth/login` | POST | implemented |
| `/api/v1/auth/me` | GET | implemented |
| `/api/v1/students/:studentToken/mastery` | GET | implemented |
| `/api/v1/student-agent/sessions` | POST | implemented |
| `/api/v1/students/:studentToken/my-profile` | GET | implemented |
| `/api/v1/teacher-agent/reports/daily` | POST | implemented |
| `/api/v1/interventions` | POST | implemented |
| `/api/v1/audit/export-requests` | POST | implemented |
| `/api/v1/consents/:studentToken/status` | GET | implemented |
| `/api/v1/consents` | POST | implemented |
| `/api/v1/consents/:consentId/withdraw` | POST | implemented |

## Intentional Deviations

| Production intent | Current implementation | Reason |
|---|---|---|
| Prisma + Postgres persistence | In-memory demo repository and audit ledger | Keep phase 0.5 focused on HTTP/API shape before database migration work |
| Production JWT | Base64url demo bearer token | Enough to test route guards without introducing secret management yet |
| OpenAPI auto-generation | Static OpenAPI document | Fastest verifiable skeleton; schema generation should follow once route schemas stabilize |
| Frontend API replacement | Not wired yet | Avoid destabilizing already verified frontend before backend contract review |
| Real audit table | In-memory append ledger | Demonstrates write-path audit contract; persistence belongs to database-backed 0.5.x |

## Verification

Package-level checks:

```powershell
pnpm --filter @edu-ai/backend typecheck
pnpm --filter @edu-ai/backend test
pnpm --filter @edu-ai/backend build
```

Results:

- Typecheck passed.
- Tests passed, 10 tests.
- Build passed.

Root-level checks:

```powershell
pnpm typecheck
pnpm test
pnpm build
```

Results:

- Root typecheck passed across 5 packages.
- Root test passed across 5 packages.
- Root build passed across 5 packages.

Current test counts:

- `@edu-ai/shared-types`: 108 tests.
- `@edu-ai/llm-gateway`: 10 tests.
- `@edu-ai/memory-store`: 9 tests.
- `@edu-ai/backend`: 10 tests.

## Review Focus

The substitute independent review should focus on:

- Whether `POST /api/v1/auth/login` being public while `/api/v1/auth/me` is protected is implemented correctly.
- Whether role guards are too broad or too narrow for the 10 core endpoints.
- Whether the OpenAPI path list matches the implemented routes.
- Whether write actions append audit entries.
- Whether static demo data preserves previously fixed privacy boundaries.
