# Phase 2.3 Workflow Implementation Report

Date: 2026-04-23
Status: current authoritative report

## 1. Summary

Phase 2.3 implements the deterministic content-pipeline workflow state machine.

Current workflow order:

```text
subject_expert -> pedagogy_designer -> narrative_designer -> engineering_agent -> assessment_designer -> qa_agent
```

The workflow runs six roles. `assessment_designer` runs after `engineering_agent` and before `qa_agent`, so assessment items can target the final generated knowledge nodes and implementation hooks.

## 2. Implemented Files

Core source:

- `apps/content-pipeline/src/workflow.ts`
- `apps/content-pipeline/src/unit-io.ts`
- `apps/content-pipeline/src/mock-runner.ts`
- `apps/content-pipeline/src/cli.ts`

Tests:

- `apps/content-pipeline/tests/workflow.spec.ts`
- `apps/content-pipeline/tests/unit-io.spec.ts`
- `apps/content-pipeline/tests/mock-runner.spec.ts`
- `apps/content-pipeline/tests/cli.spec.ts`

## 3. Core APIs

- `createUnitWorkflowState(unitId, maxAttemptsPerAgent = 5)`
- `nextRunnableAgent(state)`
- `recordAgentPatch(state, role, patch, result)`
- `readableAgentStep(role)`
- `loadUnitSpecFromFile(filePath)`
- `parseUnitSpecYaml(rawYaml)`
- `serializeUnitSpecToYaml(unit)`
- `mergeAgentPatchIntoUnit(unit, role, patch)`
- `buildWorkflowLogEntry(state, role, patch, createdAt)`
- `runMockUnitWorkflow(unit, options)`

## 4. Safety Boundaries

Every patch is checked through `validateAgentPatchOwnership` before it is recorded or merged.

This means:

- `subject_expert` can write only `knowledge`.
- `pedagogy_designer` can write only `pedagogy`.
- `narrative_designer` can write only `narrative`.
- `engineering_agent` can write only `implementation`.
- `assessment_designer` can write only `assessment`.
- `qa_agent` can write only `quality`.

Workflow logs record patch section names, not raw patch payloads.

## 5. CLI

Current CLI commands:

```powershell
tsx src/cli.ts validate-unit <unit.yaml>
tsx src/cli.ts run-workflow-smoke <unit.yaml> [--log <workflow-log.json>]
tsx src/cli.ts run-llm-mock <unit.yaml> [--log <invocation-log.json>]
```

Smoke workflow result must list six completed roles.

## 6. Verification

Executed:

```powershell
pnpm --filter @edu-ai/content-pipeline exec tsx src/cli.ts run-workflow-smoke ../../content/units/math-g8-s1-linear-function-concept/unit.yaml
pnpm --filter @edu-ai/content-pipeline exec tsx src/cli.ts run-llm-mock ../../content/units/math-g8-s1-linear-function-concept/unit.yaml
pnpm run ci
```

Results:

- `run-workflow-smoke` completed six roles.
- `run-llm-mock` completed six roles and reported `invocation_count = 6`.
- root CI passed.

## 7. Current Limits

- Mock workflows replay owned sections and do not prove generated content quality.
- QA fail routing back to the owning agent remains a later workflow enhancement.
- Source `unit.yaml` writeback remains disabled.
