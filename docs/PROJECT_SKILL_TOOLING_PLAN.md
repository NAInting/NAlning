# Project Skill Tooling Plan

Date: 2026-04-23
Status: current working plan

## 1. Purpose

Before advancing major engineering phases, prepare reusable Codex skills instead of rediscovering patterns each time.

This document records:

- Installed skills already available.
- New skills to create.
- GitHub references to consult.
- When each skill should be used.
- What each skill must prevent.

The project specs remain the source of truth. GitHub repositories are engineering references, not product requirements.

## 2. Installed Skill Added Today

### `system-design-primer-review`

Path:

```text
C:\Users\User\.codex\skills\system-design-primer-review\SKILL.md
```

Primary reference:

- https://github.com/donnemartin/system-design-primer

Use when reviewing:

- LLM Gateway.
- Backend service boundaries.
- Memory store and pgvector design.
- Content-pipeline workflow reliability.
- Cache, queue, retry, timeout, circuit-breaker, and observability design.
- Pilot deployment readiness.

Key rule:

- Use it as an engineering checklist only. Do not let generic system-design advice override the project privacy, education, and China K-12 constraints.

Validation:

```powershell
python C:\Users\User\.codex\skills\.system\skill-creator\scripts\quick_validate.py C:\Users\User\.codex\skills\system-design-primer-review
```

Result:

- Skill is valid.

### `llm-gateway-provider-review`

Path:

```text
C:\Users\User\.codex\skills\llm-gateway-provider-review\SKILL.md
```

Primary references:

- https://github.com/BerriAI/litellm
- https://github.com/songquanpeng/one-api
- https://github.com/langfuse/langfuse
- https://github.com/promptfoo/promptfoo

Use when reviewing:

- Provider routing.
- OpenAI-compatible endpoints.
- Official provider versus aggregator usage.
- Timeout, retry, fallback, cache, and cost-ledger behavior.
- Prompt versioning and LLM observability.
- Privacy-safe logging and review artifacts.

Validation:

```powershell
python C:\Users\User\.codex\skills\.system\skill-creator\scripts\quick_validate.py C:\Users\User\.codex\skills\llm-gateway-provider-review
```

Result:

- Skill is valid.

### `hono-fastify-prisma-backend-review`

Path:

```text
C:\Users\User\.codex\skills\hono-fastify-prisma-backend-review\SKILL.md
```

Primary references:

- https://github.com/honojs/hono
- https://github.com/fastify/fastify
- https://github.com/prisma/prisma-examples
- https://github.com/OWASP/ASVS
- https://github.com/OWASP/API-Security

Use when reviewing:

- Backend route groups.
- Auth/session/JWT middleware.
- RBAC and data-scope checks.
- Prisma transactions.
- OpenAPI schemas.
- Idempotent writes.
- Audit logging.
- Consent and privacy gates.

Validation:

```powershell
python C:\Users\User\.codex\skills\.system\skill-creator\scripts\quick_validate.py C:\Users\User\.codex\skills\hono-fastify-prisma-backend-review
```

Result:

- Skill is valid.

### `pgvector-memory-review`

Path:

```text
C:\Users\User\.codex\skills\pgvector-memory-review\SKILL.md
```

Primary references:

- https://github.com/pgvector/pgvector
- https://github.com/pgvector/pgvector-node
- https://github.com/donnemartin/system-design-primer

Use when reviewing:

- Student memory embeddings.
- Content embeddings.
- Conversation/episodic memory embeddings.
- pgvector schema and index choices.
- Retrieval filters and evaluation fixtures.
- Memory deletion, retention, and privacy buckets.

Validation:

```powershell
python C:\Users\User\.codex\skills\.system\skill-creator\scripts\quick_validate.py C:\Users\User\.codex\skills\pgvector-memory-review
```

Result:

- Skill is valid.

### `agent-workflow-eval-review`

Path:

```text
C:\Users\User\.codex\skills\agent-workflow-eval-review\SKILL.md
```

Primary references:

- https://github.com/promptfoo/promptfoo
- https://github.com/langfuse/langfuse
- https://github.com/vercel/ai
- https://github.com/langchain-ai/langgraphjs

Use when reviewing:

- Multi-Agent workflow ownership.
- Structured LLM output contracts.
- Semantic gates.
- Real-provider review artifacts.
- Prompt regression tests.
- Human approval and writeback gates.
- Red-team/eval fixtures.

Validation:

```powershell
python C:\Users\User\.codex\skills\.system\skill-creator\scripts\quick_validate.py C:\Users\User\.codex\skills\agent-workflow-eval-review
```

Result:

- Skill is valid.

### `vue-frontend-product-review`

Path:

```text
C:\Users\User\.codex\skills\vue-frontend-product-review\SKILL.md
```

Primary references:

- https://github.com/vbenjs/vue-vben-admin
- https://github.com/antfu/vitesse
- https://github.com/vueuse/vueuse
- https://github.com/alan2207/bulletproof-react

Use when reviewing:

- Vue/Vite route and page structure.
- Student/teacher/guardian/admin feature boundaries.
- Route guards and role navigation.
- Loading/error/empty states.
- Privacy-safe UI rendering.
- Responsive and accessibility quality.
- MSW/mock-to-API transitions.

Validation:

```powershell
python C:\Users\User\.codex\skills\.system\skill-creator\scripts\quick_validate.py C:\Users\User\.codex\skills\vue-frontend-product-review
```

Result:

- Skill is valid.

### `owasp-education-privacy-review`

Path:

```text
C:\Users\User\.codex\skills\owasp-education-privacy-review\SKILL.md
```

Primary references:

- https://github.com/OWASP/ASVS
- https://github.com/OWASP/API-Security
- https://github.com/donnemartin/system-design-primer

Use when reviewing:

- API authorization.
- Consent lifecycle.
- Student/minor data handling.
- Emotional and privacy-layer boundaries.
- Audit/export workflows.
- Provider privacy routing.
- Pilot readiness abuse scenarios.

Validation:

```powershell
python C:\Users\User\.codex\skills\.system\skill-creator\scripts\quick_validate.py C:\Users\User\.codex\skills\owasp-education-privacy-review
```

Result:

- Skill is valid.

### `observability-cost-review`

Path:

```text
C:\Users\User\.codex\skills\observability-cost-review\SKILL.md
```

Primary references:

- https://github.com/langfuse/langfuse
- https://github.com/open-telemetry/opentelemetry-js
- https://github.com/prometheus/prometheus
- https://github.com/grafana/grafana
- https://github.com/donnemartin/system-design-primer

Use when reviewing:

- LLM Gateway traces and cost ledger.
- Provider/model latency, timeout, fallback, and token dashboards.
- Backend route metrics.
- Content-pipeline role duration and artifact status.
- Queue depth, retry, and alerting.
- Privacy-safe logs and dashboard redaction.

Validation:

```powershell
python C:\Users\User\.codex\skills\.system\skill-creator\scripts\quick_validate.py C:\Users\User\.codex\skills\observability-cost-review
```

Result:

- Skill is valid.

## 3. Skill Needs By Project Area

| Area | Skill Need | Create Now? | Why |
| --- | --- | --- | --- |
| System architecture | `system-design-primer-review` | Done | Needed across backend, gateway, memory, deployment |
| Monorepo and build | `pnpm-turbo-monorepo-review` | Before next monorepo refactor | Prevent dependency/build graph drift |
| Frontend architecture | `vue-frontend-product-review` | Done | We use Vue/Vite, not React-first assumptions |
| Backend API | `hono-fastify-prisma-backend-review` | Done | API contracts, auth, audit, idempotency |
| LLM Gateway | `llm-gateway-provider-review` | Done | Routing, cost, timeout, fallback, privacy |
| Content pipeline | `agent-workflow-eval-review` | Done | Multi-agent workflow, evals, prompt regression |
| Memory/RAG | `pgvector-memory-review` | Done | Embedding schema, retrieval quality, privacy buckets |
| Security/privacy | `owasp-education-privacy-review` | Done | ASVS/API security plus project-specific minor privacy |
| Testing/CI | `test-ci-quality-gate-review` | Before CI hardening | Vitest, Playwright, MSW, smoke tests, regression suites |
| Observability | `observability-cost-review` | Done | Logs, traces, costs, queue depth, privacy-safe metrics |

## 4. GitHub References To Use

### 4.1 System Design And Scalability

- https://github.com/donnemartin/system-design-primer
- https://github.com/ByteByteGoHq/system-design-101

Use for:

- Backend architecture review.
- Capacity and bottleneck thinking.
- Cache, database, queue, replication, availability, and failure-mode checklists.

Do not use for:

- Education pedagogy decisions.
- Privacy policy decisions.
- Agent persona decisions.

### 4.2 Frontend Architecture

- https://github.com/vbenjs/vue-vben-admin
- https://github.com/antfu/vitesse
- https://github.com/vueuse/vueuse
- https://github.com/alan2207/bulletproof-react

Use for:

- Vue 3 + Vite + TypeScript project structure.
- Admin console and dashboard patterns.
- Composable design.
- Feature-based frontend organization.

Notes:

- `bulletproof-react` is React-specific, but its feature-boundary and production frontend architecture ideas are transferable.
- Do not copy React-specific patterns into Vue without adapting them.

### 4.3 Backend API And Data Access

- https://github.com/honojs/hono
- https://github.com/fastify/fastify
- https://github.com/prisma/prisma-examples

Use for:

- Hono/Fastify route structure.
- Middleware patterns.
- TypeScript API ergonomics.
- Prisma schema and transaction examples.

Project constraints:

- Every sensitive endpoint must answer: who can see, who can change, who audits.
- Writes need idempotency where retries are possible.
- Audit and consent gates fail closed.

### 4.4 LLM Gateway, Provider Routing, And Evals

- https://github.com/BerriAI/litellm
- https://github.com/songquanpeng/one-api
- https://github.com/langfuse/langfuse
- https://github.com/promptfoo/promptfoo

Use for:

- OpenAI-compatible provider routing.
- Cost tracking.
- Timeout and fallback patterns.
- Prompt/version observability.
- LLM regression testing and red-team evaluation.

Project constraints:

- Aggregator-style platforms are allowed only for low-sensitivity content generation/review unless explicitly approved.
- Raw student dialogue, emotional signals, and long-term memory do not go through aggregators by default.

### 4.5 Memory Store, Vector Search, And RAG

- https://github.com/pgvector/pgvector
- https://github.com/pgvector/pgvector-node

Use for:

- pgvector schema and index choices.
- Node/TypeScript vector insertion and query patterns.
- Similarity search mechanics.

Project constraints:

- Academic, emotional, and personal memory buckets must remain separated.
- Emotional memory is campus-local only.
- Retrieval logs must not leak raw student content.

### 4.6 Security And API Privacy

- https://github.com/OWASP/ASVS
- https://github.com/OWASP/API-Security

Use for:

- Backend and API security review.
- Auth/session/JWT review.
- Access control test design.
- Pre-pilot security checklist.

Project constraints:

- OWASP is necessary but not sufficient. We also need China K-12, PIPL-style consent, guardian rights, audit export, and minor-data minimization.

### 4.7 Mocking, Testing, And E2E

- https://github.com/mswjs/msw
- https://github.com/vitest-dev/vitest
- https://github.com/microsoft/playwright

Use for:

- Frontend and backend test boundaries.
- Mock-first frontend development.
- E2E smoke tests.
- Regression test fixtures.

Project constraints:

- Consent, privacy, audit, and intervention flows must have regression coverage before pilot.

## 5. Skill Creation Backlog

### P0 Before Next Backend/Gateway Work

Done:

- `llm-gateway-provider-review`
- `hono-fastify-prisma-backend-review`

### P1 Before Memory/RAG Work

Done:

- `pgvector-memory-review`

Done:

- `agent-workflow-eval-review`
   - References: promptfoo, Langfuse, system-design-primer workflow reliability patterns.
   - Must cover: structured output, retries, artifact-only review, semantic gates, red-team evals.

### P1 Before Frontend User Product Deepening

Done:

- `vue-frontend-product-review`

### P2 Before Pilot Deployment

Done:

- `owasp-education-privacy-review`

Done:

- `observability-cost-review`
   - References: Langfuse, OpenTelemetry patterns, system-design-primer observability questions.
   - Must cover: trace id, token/cost dashboards, queue depth, gateway latency, privacy-safe log redaction.

## 6. Operating Rule

Before starting a new engineering slice:

1. Identify which area it belongs to.
2. Check whether an appropriate skill exists.
3. If not, create a compact skill first.
4. Use GitHub references only for engineering patterns.
5. Run local verification and cold review before lock.

This keeps the project moving while avoiding repeated architecture rediscovery.
