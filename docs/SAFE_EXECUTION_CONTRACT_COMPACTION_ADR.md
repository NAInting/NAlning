# ADR: Safe Execution Contract Compaction

Version: 2026-04-26
Status: proposed
Owner: content-pipeline / platform architecture
Related docs:

- `docs/PROJECT_REBASE_EXISTING_WORK_AUDIT_2026-04-26.md`
- `docs/REVIEW_AND_SELF_CHECK_PROCESS.md`
- `apps/content-pipeline`

---

## 1. Context

The content-pipeline has strong fail-closed safety around review artifacts, provider execution requests, budget/human decisions, delivery plans, receipts, reconciliation, and follow-up routing.

This safety is valuable. However, the current provider execution follow-up chain has grown into many hand-written N-depth layers. The result is:

1. High maintenance cost.
2. Harder review readability.
3. Repeated contract language in process docs.
4. More opportunities for inconsistent validators.
5. Slower onboarding for future engineers or agents.

The 2026-04-26 Rebase explicitly recommends compaction: keep fail-closed guarantees, but move repeated depth-specific behavior into schema, validators, tests, and a small generic state machine.

---

## 2. Decision

Adopt a generic safe execution state-machine model for future provider/review/inbox follow-up depth.

Do not add new unbounded N-depth checklist lines to `REVIEW_AND_SELF_CHECK_PROCESS.md`.

Future safe execution layers should be represented as:

```text
source_contract
  -> source validator
  -> transition builder
  -> transition artifact
  -> transition validator
  -> optional executor plan
  -> receipt
  -> reconciliation
  -> closure routing
```

The state machine is a design direction. It does not remove existing tests or contracts until a separate migration plan exists.

---

## 3. Goals

1. Preserve fail-closed behavior.
2. Preserve no-spend default.
3. Preserve no source writeback from review artifacts.
4. Preserve explicit human/provider-spend decisions.
5. Reduce repeated N-depth code and documentation.
6. Make validators source-aware and reusable.
7. Keep orchestration understandable.

---

## 4. Non-Goals

This ADR does not:

1. Delete existing provider execution files immediately.
2. Rewrite content-pipeline in this step.
3. Change provider strategy.
4. Allow real provider spend.
5. Allow blocked artifacts to be approved.
6. Change source `unit.yaml`.
7. Initialize Git or restructure repository.

---

## 5. Proposed State Model

```ts
type SafeExecutionState =
  | "draft"
  | "source_validated"
  | "blocked"
  | "needs_human_decision"
  | "approved_no_spend"
  | "authorized_pending_execution"
  | "executed"
  | "reconciled"
  | "handoff_ready"
  | "manual_triage_required"
  | "repair_required"
  | "closed";
```

```ts
type SafeExecutionTransition =
  | "validate_source"
  | "render_repair_request"
  | "render_human_decision"
  | "authorize_attempt"
  | "record_receipt"
  | "reconcile_result"
  | "route_follow_up"
  | "render_delivery_plan"
  | "record_delivery_receipt"
  | "close_or_repair";
```

Each transition must declare:

1. Allowed source states.
2. Required source schema versions.
3. Privacy and provider-spend permissions.
4. Output schema version.
5. Failure behavior.
6. Audit/log-safe fields.

---

## 6. Required Invariants

Every current and future implementation must preserve:

1. Blocked artifacts cannot be approved.
2. Provider spend is forbidden unless a human/budget decision grants it.
3. Review artifacts do not write back to `unit.yaml`.
4. Apply requires explicit approved artifact and target path.
5. Invalid source chains clear untrusted downstream metadata.
6. Builders validate source contracts themselves.
7. CLI wrappers cannot be the only safety layer.
8. Receipts cannot mint success from malformed plans.
9. Manual triage payloads use deterministic keys.
10. Logs do not contain raw prompts, raw model outputs, raw student data, or hidden reasoning.

---

## 7. Compaction Strategy

### 7.1 Keep

Keep existing:

1. Tests that prove fail-closed behavior.
2. Schema versions.
3. Source-aware validation.
4. No-spend repair request contracts.
5. Human decision contracts.
6. Receipt/reconciliation patterns.

### 7.2 Compact

Compact by introducing generic helpers later:

1. `validateSourceChain(source, expectedChainSpec)`.
2. `buildTransitionArtifact(source, transitionSpec)`.
3. `validateTransitionArtifact(artifact, transitionSpec)`.
4. `clearUntrustedMetadataOnInvalidSource(payload)`.
5. `deriveStableOperationKey(source, action)`.
6. `renderManualTriagePayload(issue, sourceContext)`.

### 7.3 Stop Doing

Stop adding:

1. New hand-written process checklist lines for each deeper follow-up layer.
2. New depth names as primary policy.
3. Prose-only routing decisions.
4. Builders that rely on callers to validate source first.

---

## 8. Documentation Policy

`REVIEW_AND_SELF_CHECK_PROCESS.md` should keep only:

1. High-level gates.
2. Core invariants.
3. Link to this ADR.
4. Commands to run.

Depth-specific behavior should live in:

1. Machine-readable schemas.
2. Validator tests.
3. Focused ADRs.
4. Implementation docs close to `apps/content-pipeline`.

---

## 9. Migration Plan

Migration should be incremental:

1. Add this ADR.
2. Add an informational compaction scan that identifies provider follow-up depth without failing CI.
3. Identify duplicated provider follow-up layers and group by transition shape.
4. Add generic transition helper tests without deleting current code.
5. Convert one low-risk latest-depth layer to generic helper.
6. Confirm all existing tests still pass.
7. Convert older/deeper repeated layers only when behavior is proven equivalent.
8. Update `REVIEW_AND_SELF_CHECK_PROCESS.md` to point to compacted contracts.

No migration step may reduce test coverage or remove fail-closed behavior.

Current informational scan command:

```powershell
pnpm --filter @edu-ai/content-pipeline safe-execution:compaction-scan
```

This command reports provider follow-up module depth and module names that exceed the default compaction threshold. It uses compact summary output by default. When file-level detail is needed, run:

```powershell
pnpm --filter @edu-ai/content-pipeline safe-execution:compaction-scan -- --include-module-details
```

Both forms must remain informational until a separate human decision turns compaction into a hard gate.

---

## 10. Acceptance Criteria

The compaction direction is acceptable when:

1. Existing content-pipeline tests still pass.
2. The informational compaction scan runs and reports current follow-up depth without mutating source files.
3. At least one repeated transition is represented by generic transition tests.
4. Invalid source chain still fails closed.
5. Blocked artifact still cannot be approved.
6. Provider spend still requires explicit human/budget approval.
7. Source writeback still requires explicit apply.
8. Review docs become shorter or stop growing with N-depth layers.

---

## 11. Risks

| Risk | Mitigation |
| --- | --- |
| Over-abstraction hides safety rules | Keep explicit invariants and golden tests |
| Migration breaks existing contracts | Convert one transition at a time |
| Generic state machine becomes another complex layer | Keep helper API small and source-aware |
| Engineers bypass validators | Builders must validate source themselves |
| Documentation loses detail | Move details to schema/tests, not prose |

---

## 12. Decision Gates

The following require user/human confirmation:

1. Deleting existing provider execution files.
2. Replacing the current contract chain wholesale.
3. Changing provider-spend approval semantics.
4. Changing blocked artifact approval rules.
5. Changing source writeback rules.
6. Starting a large refactor without Git/backup strategy.

---

## 13. Current Recommendation

Use this ADR as the stop sign against further unbounded checklist depth.

The current implementation step is an informational scan plus small helper tests. The next implementation step should still be a narrow generic transition helper experiment, not a broad rewrite or deletion of existing provider execution files.
