# Phase 0.3 Provider Privacy Class Update

Date: 2026-04-23
Status: implemented and locally verified

## 1. Summary

The LLM Gateway now requires every provider adapter to declare which request privacy levels it is allowed to handle.

This closes a routing safety gap: an explicit `routeSelector` can no longer accidentally send `private` or `campus_local_only` requests to a provider intended only for public content generation.

## 2. Implemented Change

Updated files:

- `packages/llm-gateway/src/types.ts`
- `packages/llm-gateway/src/gateway.ts`
- `packages/llm-gateway/src/adapters/mock-adapter.ts`
- `packages/llm-gateway/src/adapters/openai-compatible-adapter.ts`
- `packages/llm-gateway/tests/gateway.spec.ts`

New adapter contract:

```ts
allowed_privacy_levels: readonly GatewayPrivacyLevel[];
```

Default adapter behavior:

| Adapter | Default allowed privacy levels |
| --- | --- |
| controlled-cloud mock adapters | `public`, `private` |
| campus-local mock adapter | `public`, `private`, `campus_local_only` |
| OpenAI-compatible adapter | `public` |

The OpenAI-compatible default is intentionally conservative because it may represent either an official provider endpoint or an aggregator-style platform.

## 3. Runtime Gate

Before invoking the primary adapter or fallback adapter, `LlmGateway` now checks:

```text
adapter.allowed_privacy_levels includes request.privacy_level
```

If not, the Gateway fails closed with:

```text
LLM adapter privacy mismatch
```

This check runs before provider fetch execution, so a disallowed provider does not receive the request body.

## 4. Test Coverage

Added test:

- `fails closed when an adapter is not allowed to handle the request privacy level`

The test verifies that a `private` `student_dialogue` request routed to a default public-only OpenAI-compatible adapter is rejected before `fetch` is called.

## 5. Verification

Executed:

```powershell
pnpm --filter @edu-ai/llm-gateway test
pnpm --filter @edu-ai/llm-gateway typecheck
```

Results:

- llm-gateway tests passed: 1 file, 13 tests.
- llm-gateway typecheck passed.

## 6. Residual Notes

- Official providers that are explicitly approved for `private` data can opt in by passing `allowed_privacy_levels`.
- Aggregator-style platforms should remain `public` by default unless a separate privacy/legal decision approves a stricter usage class.
- This is a Gateway-level guard. Product modules must still set `privacy_level` correctly.
