# Phase 0.6 CI Review Gate

Date: 2026-04-22

## Required Local Gate

From Phase 0.6 onward, every code change that enters Codex self-check or substitute independent review must run:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
pnpm build
```

Recommended one-command local gate:

```powershell
pnpm run ci
```

## CI Order

The GitHub Actions workflow uses the same order:

1. install
2. lint
3. typecheck
4. unit tests
5. Playwright E2E smoke tests
6. build

## Current E2E Scope

Current Playwright E2E tests use backend HTTP flows because the frontend governance app still uses local mocks.

Covered now:

- student login
- protected student mastery API
- teacher login
- protected intervention creation API

Future browser UI E2E should be added after frontend API calls switch from local mocks to the real backend.
