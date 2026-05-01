# Phase 0.6 Test and CI Foundation Spec

Date: 2026-04-22

## Goal

Establish the minimum quality gate for all future phases: every meaningful change must be able to run local checks and the same checks in CI.

## Scope

Implement:

1. Root `pnpm run ci` command that runs lint, typecheck, unit tests, E2E smoke tests, and build.
2. Non-empty `lint` scripts for active packages.
3. Playwright E2E smoke tests.
4. GitHub Actions workflow.
5. Review/self-check documentation for Claude Code + Codex substitute reviews.

## Non-goals

- No full ESLint ruleset yet.
- No coverage threshold yet.
- No browser UI E2E yet; current E2E targets backend HTTP flow because frontend still uses local mocks.
- No deployment pipeline.

## Required Local Commands

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm e2e
pnpm build
pnpm run ci
```

## E2E Smoke Coverage

At minimum:

1. Login as student.
2. Call protected student mastery endpoint.
3. Login as teacher.
4. Create intervention through protected endpoint.

## CI Order

GitHub Actions must run:

1. install
2. lint
3. typecheck
4. unit tests
5. E2E smoke tests
6. build

## Done Criteria

- Root `pnpm run ci` passes locally.
- GitHub Actions workflow exists at `.github/workflows/ci.yml`.
- Playwright smoke tests exist under `tests/e2e`.
- `docs/PHASE_0_6_IMPLEMENTATION_REPORT.md` exists.
- `docs/REVIEW_AND_SELF_CHECK_PROCESS.md` includes the 0.6 gate.
