# Phase 2.1 Unit Spec Implementation Report

Date: 2026-04-23
Status: current authoritative report

## 1. Summary

Phase 2.1 defines the machine-checkable AI-native unit contract.

The `unit.yaml` structure contains these top-level sections:

- `metadata`
- `knowledge`
- `pedagogy`
- `narrative`
- `implementation`
- `assessment`
- `quality`

This phase defines the data structure. Later phases assign section ownership to workflow roles.

## 2. Current Downstream Ownership

The current Phase 2 workflow has six roles:

| Section | Owner |
| --- | --- |
| `knowledge` | `subject_expert` |
| `pedagogy` | `pedagogy_designer` |
| `narrative` | `narrative_designer` |
| `implementation` | `engineering_agent` |
| `assessment` | `assessment_designer` |
| `quality` | `qa_agent` |

`assessment_designer` was added after semantic validation showed that assessment items must be regenerated when knowledge nodes change.

## 3. Implemented Contract

Implemented in:

- `packages/shared-types/src/content/ai-native-unit.ts`
- `packages/shared-types/tests/ai-native-unit.spec.ts`

The schema enforces:

- Stable ids.
- Generated section metadata.
- Confidence scores.
- Source traces.
- Unit section shape.
- QA issue ownership.

## 4. Verification

Executed:

```powershell
pnpm --filter @edu-ai/shared-types typecheck
pnpm --filter @edu-ai/shared-types test
pnpm run ci
```

Results:

- shared-types typecheck passed.
- shared-types tests passed: 4 files, 111 tests.
- root CI passed.

## 5. Current Limits

- Zod validates shape, not all cross-section references.
- Semantic validation is implemented in Phase 2.4 through `validateUnitSemanticIntegrity`.
- Subject-matter quality still requires human review.
