# Phase 2.2 Agent Specs Implementation Report

Date: 2026-04-23
Status: current authoritative report

## 1. Summary

Phase 2.2 defines the content-pipeline agent contract for AI-native unit production.

The current workflow has six roles:

1. `subject_expert` owns `knowledge`.
2. `pedagogy_designer` owns `pedagogy`.
3. `narrative_designer` owns `narrative`.
4. `engineering_agent` owns `implementation`.
5. `assessment_designer` owns `assessment`.
6. `qa_agent` owns `quality`.

`assessment_designer` was added after semantic validation proved that assessment cannot remain a passive carry-over section. Assessment items must be regenerated after knowledge, pedagogy, narrative, and implementation are known.

## 2. Implemented Files

Core source:

- `apps/content-pipeline/src/agent-specs.ts`
- `apps/content-pipeline/src/prompt-assets.ts`
- `apps/content-pipeline/src/index.ts`

Tests:

- `apps/content-pipeline/tests/agent-specs.spec.ts`

Shared type contract:

- `packages/shared-types/src/content/ai-native-unit.ts`

## 3. Agent Contract

| Role | Owns | Reads |
| --- | --- | --- |
| `subject_expert` | `knowledge` | `metadata` |
| `pedagogy_designer` | `pedagogy` | `metadata`, `knowledge` |
| `narrative_designer` | `narrative` | `metadata`, `knowledge`, `pedagogy` |
| `engineering_agent` | `implementation` | `metadata`, `knowledge`, `pedagogy`, `narrative` |
| `assessment_designer` | `assessment` | `metadata`, `knowledge`, `pedagogy`, `narrative`, `implementation` |
| `qa_agent` | `quality` | `metadata`, `knowledge`, `pedagogy`, `narrative`, `implementation`, `assessment` |

Every role has:

- `prompt_asset_id`
- `output_contract`
- `hard_rules`
- `owns_section`
- `reads_sections`

The `subject_expert` hard rules now explicitly require every `knowledge.edges[].from_node_id` and `knowledge.edges[].to_node_id` to reference a `node_id` present in the same `knowledge.nodes` output.

## 4. Ownership Guard

Implemented API:

- `validateAgentPatchOwnership(role, patch)`

Behavior:

- Allows a role to write only its owned section.
- Rejects any patch that writes another role's section.
- Keeps section ownership one-to-one.
- Hands valid owned-section patches to section-level semantic validation before later roles run.

Examples:

- `assessment_designer` writing `assessment`: allowed.
- `assessment_designer` writing `knowledge`: rejected.
- `qa_agent` writing `quality`: allowed.

## 5. Why `assessment_designer` Exists

Assessment drives:

- Mastery scoring.
- Confidence thresholds.
- Teacher reports.
- Intervention triggers.
- Student memory snapshots.

The first real Zhipu review candidate changed the knowledge graph while leaving stale assessment references behind. Semantic validation caught the issue. The durable fix is explicit assessment ownership.

## 6. Verification

Executed:

```powershell
pnpm --filter @edu-ai/content-pipeline typecheck
pnpm --filter @edu-ai/content-pipeline test
pnpm --filter @edu-ai/shared-types typecheck
pnpm --filter @edu-ai/shared-types test
pnpm run ci
```

Results:

- content-pipeline typecheck passed.
- content-pipeline tests passed: 12 files, 61 tests.
- shared-types typecheck passed.
- shared-types tests passed: 4 files, 111 tests.
- root CI passed: lint, typecheck, test, e2e, build.

## 7. Current Limits

- This phase defines contracts and guards; it does not certify subject quality.
- Source `unit.yaml` writeback remains disabled.
- Real provider output must still pass semantic validation and human review before promotion.
