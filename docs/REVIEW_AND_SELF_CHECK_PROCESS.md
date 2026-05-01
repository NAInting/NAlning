# Review And Self-Check Process

Version: 2026-04-26
Status: current authoritative process

## 1. Purpose

Every important project change must pass through a repeatable review loop:

1. Spec first.
2. Implementation second.
3. Local verification.
4. Governance check.
5. Cross review.
6. Gap repair.
7. Lock only after 8.5 or higher.

## 2. Required Gates

| Gate | Name | Required Evidence |
| --- | --- | --- |
| A | Spec Ready | Goals, non-goals, data shape, privacy boundary, completion criteria |
| B | Implementation Ready | Files, dependencies, test plan, rollback path |
| C | Local Verified | Typecheck, tests, build, CLI or E2E smoke |
| D | Governance Check | Who can see, who can change, audit trail, privacy leak risk |
| E | Cross Review | Claude Code review, or Codex sub-agent cold review when Claude is unavailable |
| F | Locked | All blocking and medium gaps fixed; score >= 8.5 |

## 3. Claude Unavailable Fallback

When Claude Code is unavailable:

1. Codex main thread must run local verification.
2. Codex must spawn or reuse an independent read-only sub-agent for cold review when the user has authorized sub-agents.
3. The sub-agent must not edit files.
4. Main thread merges findings and fixes blocking/medium gaps.
5. The final report must state which checks were run and what residual risks remain.

## 4. Content Pipeline Checklist

Current Phase 2 workflow roles:

```text
subject_expert -> pedagogy_designer -> narrative_designer -> engineering_agent -> assessment_designer -> qa_agent
```

Self-check:

- Unit Spec schema validation passes.
- Semantic validation passes or fails closed.
- Every Agent patch passes ownership and owned-section semantic validation before the next Agent runs.
- Every Agent invocation sends role `hard_rules`, subject, grade, provided `standard_alignment`, and owned-section `source_trace` provenance.
- Each role writes only its owned section.
- Open `high` or `blocking` QA issues block promotion even when `quality.checklist_pass = false`.
- Section `meta.source_trace[]` does not substitute Chinese curriculum provenance with CCSS/Common Core or equivalent foreign-standard references.
- Workflow smoke completes six roles.
- LLM mock workflow completes six invocations.
- Review artifacts do not write back to `unit.yaml`.
- Blocked review artifacts expose `repair_plan` and `retry_policy` so retry scope and manual-review gates stay explicit.
- Blocked `unknown_node_reference` artifacts can be reduced into a no-spend repair request contract before any provider execution request, and that repair request must forbid provider execution, source writeback, and blocked-artifact approval.
- Scoped rerun artifacts expose lineage context (`rerun_chain_depth`, root/source artifact anchors, source retry decision) so future automation never guesses rerun history.
- Review artifacts expose orchestration guidance so automation can distinguish notify-only steps, provider-spending rerun candidates, and manual-triage stops without inferring policy from free text.
- Blocked rerun artifacts that still require provider spend can be exported as a machine-readable provider execution request, so future human/budget gates approve explicit rerun scope instead of parsing prose summaries.
- Provider execution request builders and validators must validate the blocked-artifact source contract themselves, including a concrete `recommended_rerun_from` workflow role and its contiguous tail-role slice, so downstream callers fail closed even if they skip a separate CLI/source-validation step.
- Provider execution requests can also be reduced into a machine-readable human/budget decision contract, and that decision layer must validate the source request plus budget/approval semantics before any later automation treats provider spend as allowed.
- Provider execution decision validation must also reject tampered contract-critical request fields (`request_key`, `chain_key`, `review_mode`, `output_contract`, rerun messaging) plus blank/malformed reviewer and timestamp fields as structured issues.
- Approved provider execution decisions can then be reduced into a machine-readable `authorized_pending_execution` attempt contract, but that attempt layer must still remain no-spend and fail closed on any non-approved / non-granted / non-passed source decision.
- Authorized pending provider execution attempts can then be reduced into a machine-readable provider execution receipt contract, but that receipt layer must still fail closed on any non-authorized attempt source and on artifact-vs-failure branch mismatches.
- Provider execution receipts can then be reduced into a machine-readable reconciliation/result-summary contract, but that reconciliation layer must null untrusted downstream metadata whenever receipt validation fails instead of restating possibly forged artifact/failure fields.
- Provider execution reconciliation must also preserve its own canonical `source_*_schema_version` literals even when it summarizes malformed upstream request/decision/attempt/receipt contracts, so contract drift is reported through structured issue codes rather than leaking malformed schema strings into exported reconciliation payloads.
- Provider execution reconciliation can then be reduced into a machine-readable post-execution follow-up contract, but artifact-recorded cases must hand off to the actual result review artifact contract instead of guessing approval routing from receipt metadata alone.
- Provider execution follow-up source validation must first shape-guard reconciliation payloads, and direct follow-up builders must fail closed on invalid source chains instead of letting malformed reconciliation JSON crash validation or mint a fake success handoff.
- Any manual-triage labels derived from provider execution metadata, such as `failure_code`, must be sanitized into stable label-safe tokens before export so downstream `key:value` routing consumers do not ingest raw delimiters or multiline text.
- Orchestration guidance also identifies the target human queue (`approval_queue`, `rerun_decision_queue`, `manual_triage_queue`) and keeps unattended action limited to opening an inbox item.
- Orchestration guidance includes inbox-ready payload fields (`primary_human_action`, `inbox_title`, `inbox_summary`) so downstream automation does not assemble handoff text ad hoc.
- Review artifacts can also be exported as a stable inbox handoff JSON so downstream automation consumes one machine-readable contract instead of recombining queue and payload fields itself.
- Stable inbox handoff JSON carries rerun-chain dedupe fields (`chain_key`, `predecessor_item_key`) so later automation can supersede older human tasks instead of opening duplicate inbox items.
- Stable inbox handoff JSON also carries an explicit delivery action (`create_inbox_item` or `replace_predecessor_inbox_item`) so downstream automation does not infer create-vs-replace semantics from predecessor metadata alone.
- Review artifacts can also be exported as an executor-ready inbox delivery plan with explicit upsert/close operations, so downstream automation does not convert handoff metadata into action lists on its own.
- Executor-ready inbox delivery plans can be validated before execution so malformed create/replace semantics fail fast instead of being interpreted leniently by the automation worker.
- Executor-ready inbox delivery plans carry stable per-action operation keys so retrying the same `upsert` / `close` work does not create ambiguous duplicate delivery intent.
- Executor-ready inbox delivery plans can be paired with a delivery receipt contract that records per-operation outcome, aggregate execution status, and final active-item state for downstream reconciliation.
- Delivery plans plus receipts can be reduced into a reconciliation/result-summary contract so later automation can tell whether the inbox chain is closed or still needs cleanup/repair without replaying status logic itself.
- Reconciliation results can be reduced into a follow-up routing/closure-policy contract so later automation can distinguish fully closed delivery chains from cleanup, repair, and receipt-triage follow-up work without inventing queue semantics on its own.
- Any renderer that opens downstream follow-up work from reconciliation data must first validate that the reconciliation is source-consistent with its delivery plan, so malformed closure summaries fail closed instead of opening the wrong human task.
- Follow-up routing contracts can also be exported as executor-ready follow-up delivery plans, so later automation can open cleanup/repair/receipt-triage inbox work without reassembling manual-task payloads or losing preserved active-item semantics.
- Provider execution follow-up contracts can also be exported as executor-ready delivery plans, but successful execution branches must preserve pure result-artifact handoff semantics while manual triage branches emit deterministic inbox upsert payloads and operation keys.
- Provider execution follow-up delivery plans can also emit and validate provider-execution follow-up delivery receipts, but successful execution branches must remain pure no-op artifact handoff while manual triage branches record only deterministic follow-up upsert outcomes.
- Provider execution follow-up delivery plans plus receipts can also be reduced into a provider-execution follow-up reconciliation/result-summary contract, but invalid follow-up receipts must clear untrusted delivery status, final follow-up target, and artifact-handoff metadata before any later routing layer consumes them.
- Provider execution follow-up delivery reconciliation can also be reduced into a provider-side post-delivery closure/follow-up routing contract, but successful execution branches must still defer to the real result artifact contract while delivered manual triage, repair-required delivery failure, and receipt-triage states remain explicit and machine-readable.
- Provider execution post-delivery closure/follow-up routing can also be reduced into a downstream post-delivery routing contract, but receipt-triage branches must preserve trusted source-derived artifact handoff / active-follow-up context explicitly while still clearing untrusted current delivery metadata.
- Any executor builder downstream of that provider post-delivery routing layer must validate its source contract itself, so malformed source payloads fail closed even when callers bypass CLI wrappers.
- That downstream provider post-delivery routing contract can also be exported as an executor-ready delivery plan, but trusted `result_artifact_handoff_ready` / preserved no-op branches must stay pure handoff semantics while manual follow-up branches emit only deterministic upsert payloads and stable operation keys.
- Those downstream provider post-delivery delivery plans can also emit and validate delivery receipts, but successful handoff/no-op branches must remain pure no-op receipts while manual follow-up delivery branches record only deterministic executor outcomes.
- Those downstream provider post-delivery delivery plans plus receipts can also be reduced into a reconciliation/result-summary contract, but invalid receipts must clear untrusted final delivery status / target metadata before any later routing or closure layer consumes them.
- Those downstream provider post-delivery executor-ready plans plus reconciliations can also be reduced into one more post-delivery closure/follow-up routing contract, and that newest routing layer can then be exported as another executor-ready delivery plan/receipt/reconciliation trio, but trusted artifact-handoff and delivered-manual-follow-up branches must remain closed while repair-required and receipt-triage branches stay explicit and machine-readable for the next executor layer.
- That newest downstream provider post-delivery closure/follow-up routing contract can also be exported as another executor-ready delivery plan, but trusted handoff and delivered-manual-follow-up branches must stay pure no-op/closed semantics while repair and receipt-triage branches emit only deterministic downstream upsert payloads.
- Those newest downstream provider post-delivery delivery plans can also emit and validate delivery receipts, but trusted handoff/delivered-closed branches must remain no-op receipts while deeper manual-follow-up branches record only deterministic executor outcomes.
- Those newest downstream provider post-delivery delivery receipt validators must reject malformed operation status enums before reconciliation, so forged executor statuses cannot be treated as applied delivery.
- Those newest downstream provider post-delivery delivery plans plus receipts can also be reduced into one more reconciliation/result-summary contract, but invalid receipts must clear untrusted final delivery status / target metadata before any still-later closure or routing layer consumes them.
- The latest downstream provider post-delivery executor-ready trio can also be reduced into one more closure/follow-up routing contract, but source validation must verify the latest plan/receipt/reconciliation chain; trusted artifact handoff and delivered manual follow-up branches must remain closed/no-op while repair-required and receipt-triage branches use depth-disambiguated deterministic payloads.
- When that latest downstream provider post-delivery closure/follow-up routing contract is exported into another executor-ready delivery plan / receipt / reconciliation trio, trusted artifact-handoff and delivered-manual-follow-up branches must stay no-op/closed, while repair and receipt-triage branches emit deterministic downstream upsert payloads and invalid receipts clear untrusted final delivery metadata.
- That newest executor-ready delivery trio can also be reduced into another closure/follow-up routing contract, but the source validator must verify the full upstream source chain plus the newest plan/receipt/reconciliation trio before deriving closed, repair-required, or receipt-triage routing state.
- Direct builder and standalone source-contract paths for that newest routing layer must also reject mismatched plan/reconciliation scalar linkage and malformed receipt-triage structures, so bypassing the CLI cannot mint a routing contract from forged reconciliation metadata.
- That newest closure/follow-up routing contract can also be exported into one more executor-ready delivery plan / receipt / reconciliation trio, but trusted handoff and delivered-closed branches must remain no-op while repair and receipt-triage branches emit deterministic downstream upserts, and invalid receipts must clear untrusted final delivery metadata.
- That newest executor-ready delivery trio can also be reduced into another closure/follow-up routing contract, but its source validator must verify the full upstream chain plus the newest plan/receipt/reconciliation trio; trusted handoff and delivered-closed branches must remain no-op while repair and receipt-triage branches use depth-disambiguated deterministic payloads.
- The latest N=8 closure/follow-up routing contract can also be exported into another executor-ready delivery plan / receipt / reconciliation trio, but trusted handoff and delivered-closed branches must stay no-op while repair and receipt-triage branches emit deterministic downstream upserts, and invalid receipts must clear untrusted final delivery metadata.
- That latest N=8 executor-ready delivery trio can then be reduced into the next closure/follow-up routing contract, but its source validator must verify the full upstream chain plus the N=8 plan/receipt/reconciliation trio before deriving closed, repair-required, or receipt-triage routing state.
- That next closure/follow-up routing contract can also be exported into another executor-ready delivery plan / receipt / reconciliation trio, but trusted handoff and delivered-closed branches must remain no-op while repair and receipt-triage branches emit deterministic downstream upserts and invalid receipts clear untrusted final delivery metadata.
- That newest executor-ready delivery trio can then be reduced into the next closure/follow-up routing contract, but its source validator must verify the full upstream chain plus the newest plan/receipt/reconciliation trio before deriving closed, repair-required, or receipt-triage routing state.
- That latest N=9 executor-ready delivery trio can then be reduced into the next closure/follow-up routing contract, but its source validator must verify the full upstream chain plus the N=9 plan/receipt/reconciliation trio; trusted closed branches stay no-op, while repair and receipt-triage branches remain depth-disambiguated and machine-readable for the next executor layer.
- That newest N=10 closure/follow-up routing contract can also be exported into another executor-ready delivery plan / receipt / reconciliation trio, but trusted handoff and delivered-closed branches must stay no-op while repair and receipt-triage branches emit deterministic downstream upserts and invalid receipts clear untrusted final delivery metadata.
- That newest N=10 executor-ready delivery trio can also be reduced into the next N=11 closure/follow-up routing contract, but its source validator must verify the full upstream chain plus the N=10 plan/receipt/reconciliation trio before deriving closed, repair-required, or receipt-triage routing state.
- That newest N=11 closure/follow-up routing contract can also be exported into another executor-ready delivery plan / receipt / reconciliation trio, but trusted handoff and delivered-closed branches must remain no-op while repair and receipt-triage branches emit deterministic downstream upserts, and invalid receipts must clear untrusted final delivery metadata.
- That newest N=11 executor-ready delivery trio can also be reduced into the N=12 closure/follow-up routing contract, but its source validator must verify the full upstream source chain plus the N=11 plan/receipt/reconciliation trio; trusted handoff and delivered-closed branches must remain no-op while repair and receipt-triage branches use depth-disambiguated deterministic routing.
- That newest N=12 closure/follow-up routing contract can also be exported into another executor-ready delivery plan / receipt / reconciliation trio, but trusted handoff and delivered-closed branches must remain no-op while repair and receipt-triage branches emit deterministic downstream upserts, and invalid receipts must clear untrusted final delivery metadata.
- That newest N=12 executor-ready delivery trio can also be reduced into the N=13 closure/follow-up routing contract, but its source validator must verify the full upstream source chain plus the N=12 plan/receipt/reconciliation trio; trusted handoff and delivered-closed branches must remain no-op while repair and receipt-triage branches use depth-disambiguated deterministic routing.
- That newest N=13 closure/follow-up routing contract can also be exported into another executor-ready delivery plan / receipt / reconciliation trio, but trusted handoff and delivered-closed branches must remain no-op while repair and receipt-triage branches emit deterministic downstream upserts, and invalid receipts must clear untrusted final delivery metadata.
- That newest N=13 executor-ready delivery trio can also be reduced into the N=14 closure/follow-up routing contract, but its source validator must verify the full upstream source chain plus the N=13 plan/receipt/reconciliation trio; trusted handoff and delivered-closed branches must remain no-op while repair and receipt-triage branches use depth-disambiguated deterministic routing.
- That newest N=14 closure/follow-up routing contract can also be exported into another executor-ready delivery plan / receipt / reconciliation trio, but trusted handoff and delivered-closed branches must remain no-op while repair and receipt-triage branches emit deterministic downstream upserts, and invalid receipts must clear untrusted final delivery metadata.
- That newest N=14 executor-ready delivery trio can also be reduced into the N=15 closure/follow-up routing contract, but its source validator must verify the full upstream source chain plus the N=14 plan/receipt/reconciliation trio; trusted handoff and delivered-closed branches must remain no-op while repair and receipt-triage branches use depth-disambiguated deterministic routing.
- That newest N=15 closure/follow-up routing contract can also be exported into another executor-ready delivery plan / receipt / reconciliation trio, but trusted handoff and delivered-closed branches must remain no-op while repair and receipt-triage branches emit deterministic downstream upserts, and invalid receipts must clear untrusted final delivery metadata.
- That newest N=15 executor-ready delivery trio can also be reduced into the N=16 closure/follow-up routing contract, but its source validator must verify the full upstream source chain plus the N=15 plan/receipt/reconciliation trio before deriving closed, repair-required, or receipt-triage routing state.
- That newest N=16 closure/follow-up routing contract can also be exported into another executor-ready delivery plan / receipt / reconciliation trio, but trusted handoff and delivered-closed branches must remain no-op while repair and receipt-triage branches emit deterministic downstream upserts, and invalid receipts must clear untrusted final delivery metadata.
- That newest N=16 executor-ready delivery trio can also be reduced into the N=17 closure/follow-up routing contract, but its source validator must verify the full upstream source chain plus the N=16 plan/receipt/reconciliation trio before deriving closed, repair-required, or receipt-triage routing state.
- That newest N=17 closure/follow-up routing contract can also be exported into another executor-ready delivery plan / receipt / reconciliation trio, but trusted handoff and delivered-closed branches must remain no-op while repair and receipt-triage branches emit deterministic downstream upserts, and invalid receipts must clear untrusted final delivery metadata.
- Latest-depth executor-ready trio render commands must call safe source validators, so malformed/null source chains return structured validation issues instead of raw TypeError stderr.
- Latest-depth closure/follow-up routing validators must also shape-guard the follow-up payload itself, so a valid source chain plus malformed current routing JSON fails as structured validation issues instead of raw TypeError stderr.
- Latest-depth delivery receipt validators must shape-guard individual `operations[]` entries before reading fields, so malformed entries such as `null` reconcile into manual receipt triage with untrusted final metadata cleared.
- Delivered manual-follow-up routing branches must trust the source reconciliation final delivery target (`final_follow_up_item_key` / `final_follow_up_queue`) as the active item; preserved prior active-item context may be empty and must not be required for newly delivered upserts.
- When receipt-triage routing payloads are validated without their full source receipt context, standalone validators may accept source-aware `receipt_validation:*` labels structurally, but they must still enforce deterministic item key, queue, title, action, automation step, stable labels, and no provider-execution permission.
- Executor-ready follow-up delivery plans can also emit and validate follow-up delivery receipts, so later automation can tell whether cleanup/repair/receipt-triage tasks were actually opened without inferring status from logs.
- Any renderer or validator downstream of follow-up routing must first validate the source follow-up contract itself, so malformed follow-up state/action payloads fail closed before follow-up plan or receipt execution is attempted.
- Receipt-triage follow-up contracts must null untrusted active-item metadata before any downstream summary, label, plan, or receipt rendering occurs.
- Follow-up delivery plans plus receipts can also be reduced into a follow-up reconciliation/result-summary contract, so later automation can tell whether the follow-up task was actually opened or whether manual repair/receipt triage is still required.
- Real provider runs are explicit and review-only.

Review focus:

- Subject quality and curriculum alignment.
- China K-12 curriculum context is preserved; no unapproved CCSS/Common Core or foreign standard substitution.
- Pedagogy fit.
- Dialogue quality.
- Assessment target node integrity.
- QA strictness.
- No raw model output or patch payloads in logs.

## 5. LLM Gateway / Agent Checklist

Self-check:

- Every call has `purpose`.
- Prompts are versioned.
- Token and cost traces are recorded.
- Privacy routing is explicit.
- Business code does not bypass the gateway.

Review focus:

- Emotional, identity, and student-personal data cannot leave approved routes.
- Aggregator platforms are limited to low-sensitivity content tasks unless explicitly approved.
- Fallback logic is safe, not merely available.

## 6. Data Model Checklist

Self-check:

- Every entity has `created_at`, `updated_at`, and `version`.
- Privacy-sensitive entities have `visibility_scope`.
- AI-generated content has `confidence_score` and `source_trace`.
- Event-sourced entities keep raw event and materialized view boundaries clear.

Review focus:

- InterAgentSignal payloads do not leak raw dialogue.
- EmotionBaseline is campus-local only.
- Memory buckets remain separated.
- Enums are complete and consistent.

## 7. Final Report Template

```md
# Phase X Lock Report

## Scope
- ...

## Outputs
- ...

## Verification
- `command`: passed

## Cross Review
- Reviewer: Claude Code / Codex sub-agent
- Score: 8.5
- Blocking gaps: none

## Residual Backlog
- P3: ...

## Next Entry Condition
- ...
```

## 8. CI Gate

Minimum local gate:

```powershell
pnpm run ci
```

This runs:

- lint
- typecheck
- test
- e2e
- build

If a narrower check is used during development, `pnpm run ci` must still pass before lock.

## 9. Automation Health Scan

Heartbeat runs should use the project-owned health scan before manual `TODO` or `GAP` searches:

```powershell
pnpm scan:project-health
```

This scan is informational and deliberately excludes dependency and build-output directories such as `node_modules`, `dist`, `.turbo`, Playwright reports, and test artifacts. It should be used to find project-owned follow-up signals without treating generated or third-party files as backlog.

By default it focuses on engineering-owned source, tests, scripts, packages, apps, and content. When a documentation audit is needed, run:

```powershell
pnpm scan:project-health:docs
```

Historical lock reports and prior review artifacts are still excluded unless explicitly requested:

```powershell
pnpm scan:project-health:history
```

## 10. 2026-04-26 Additional Review Gates

The 2026-04-26 rebase added external standards, real-time voice, and a separate curriculum-design conversation. These gates apply before implementation and before lock; they should be enforced as compact checklists or machine-readable validators instead of adding more open-ended manual checklist depth.

### 10.1 External Code And License Gate

Self-check:

- External repositories are used as references unless a specific import has passed source, license, security, and architecture review.
- No DeepTutor, OpenMAIC, Oppia, Kolibri, H5P, LiveKit, Pipecat, Mem0, Letta, or other third-party code is copied into the repo by default.
- Any direct external-code import records source URL, commit/version, license, files imported, reason for import, alternatives considered, and rollback plan.
- AGPL, unknown license, unclear dataset rights, commercial restrictions, or student-data provenance concerns stop the task and require a user decision.

Review focus:

- Reference architecture does not silently replace internal `LearningEvent`, `AiNativeUnitSpec`, `AgentRuntimeEvent`, review artifact, or privacy model semantics.
- License obligations do not contaminate closed-source pilot delivery or school deployment assumptions.

### 10.2 External Standards Adapter Gate

Self-check:

- xAPI/LRS, H5P, Kolibri/content package, and similar standards are implemented as adapters/projections, not as internal source-of-truth models.
- Export payloads are data-minimized and pass the privacy deny-list before leaving internal boundaries.
- Lossy projections are marked as lossy in a manifest instead of pretending round-trip equivalence.

Review focus:

- Teacher, guardian, or external-system visibility is not expanded through adapter fields.
- External standards remain optional interoperability surfaces and do not force internal schema drift.

### 10.3 Voice Runtime Privacy Gate

Self-check:

- Voice Spike uses synthetic voice, fake students, fake teachers, and non-sensitive classroom scenarios unless the user explicitly approves otherwise.
- Raw audio is not persisted by default.
- Transcript retention is minimized to the learning-event or debug slice needed for the Spike.
- Emotional, identity, self-harm, family-conflict, or other sensitive speech routes to `campus_local_only`.
- Teacher and guardian outputs contain only structured signals and suggested actions, not replayable audio or raw sensitive transcript.

Review focus:

- Real-time voice improves student experience without weakening the project’s “only signal crosses Agent boundary” rule.
- Voice fallback is safe: failed STT/TTS/VAD must degrade to text or retry guidance without exposing hidden sensitive data.

### 10.4 Curriculum Design Import Gate

Self-check:

- A curriculum-design conversation output never writes directly to production `unit.yaml`.
- The path is: design brief -> `CurriculumDesignImportDraft` -> schema validation -> semantic validation -> review artifact -> human approval -> explicit apply.
- Imported drafts map student-side materials, teacher-side classroom plan, AI interaction scripts, learning tasks/capability certification, evidence collection, privacy boundaries, and classroom fallback.
- Blocked review artifacts open repair or human-review work only; they do not approve or apply source changes.

Review focus:

- Course design can be imaginative and AI-native while still becoming structured `Unit/Page/Block/runtime_content/assessment/evidence` data.
- New “assignment/exam” replacements verify capability and evidence instead of rote memorization alone.

### 10.5 Blocked Artifact And Checklist Compaction Gate

Self-check:

- Blocked artifacts remain blocked until a valid repair, rerun, or explicit human decision changes state.
- Automation may open or update inbox items, but must not infer approval from prose summaries.
- New workflow depth should be represented through schema, validators, tests, or ADRs rather than by extending this document with unbounded N-depth checklist lines.
- When touching provider execution follow-up or Safe Execution compaction paths, run:

```powershell
pnpm --filter @edu-ai/content-pipeline safe-execution:compaction-scan
```

- Use `pnpm --filter @edu-ai/content-pipeline safe-execution:compaction-scan -- --include-module-details` only when file-level detail is needed.
- The compaction scan is informational. Existing deep follow-up modules reported by the scan are backlog evidence, not an automatic CI failure or migration approval.
- Deleting, bulk-renaming, or replacing existing provider execution follow-up files remains a human decision point.

Review focus:

- The review system stays fail-closed and understandable.
- Human decision points remain explicit: real provider spend, architecture/provider change, privacy-visibility change, external code import, production unit writeback, real user/voice data, and repository strategy.
