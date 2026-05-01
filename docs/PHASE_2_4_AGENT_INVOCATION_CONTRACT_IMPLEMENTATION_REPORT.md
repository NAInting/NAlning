# Phase 2.4 Agent Invocation Contract Implementation Report

Date: 2026-04-24
Status: current authoritative report

## 1. Summary

Phase 2.4 connects the content-pipeline workflow to the LLM Gateway invocation contract.

The current full invocation flow has six roles:

```text
subject_expert -> pedagogy_designer -> narrative_designer -> engineering_agent -> assessment_designer -> qa_agent
```

It supports:

- Mock LLM workflow runs.
- Explicit review-only real provider runs.
- Structured `{ section, patch }` parsing.
- Ownership validation before workflow merge.
- Section-level semantic validation immediately after each owned-section merge.
- Review artifacts with no source writeback.
- Blocked review artifacts now include a deterministic repair plan with a recommended rerun starting role.
- Blocked review artifacts can now seed a scoped review rerun that inherits earlier approved candidate patches and replays only the affected tail roles.
- Blocked review artifacts now include retry-policy guidance that distinguishes first safe reruns, widened rerun scope, and manual-review stop conditions.
- Scoped rerun execution is now gated by artifact status and retry policy, so blocked artifacts cannot be rerun when policy already says manual review.
- Scoped rerun artifacts now include rerun-lineage metadata so later automation can see chain depth, the root blocked artifact, and the source retry decision without inferring history from logs.
- Review artifacts now also include orchestration guidance that tells automation whether the next step is notify-only, a provider-spending rerun candidate, or a manual-triage stop.
- Blocked rerun artifacts can now also be exported as a machine-readable provider execution request, so future human/budget gates approve an explicit rerun start role and tail-role scope instead of parsing inbox prose.
- Provider execution request source validation now also rejects unknown rerun-start roles and builder/validator calls fail closed on invalid blocked-artifact sources, so forged JSON cannot mint spend-ready rerun requests by skipping the CLI guard.
- Provider execution requests can now also be reduced into a machine-readable provider execution decision contract, so explicit reviewer + budget verdicts are recorded before any future automation treats real rerun spend as permitted.
- Provider execution decision source validation now also rejects tampered request-mode/output/text fields, decision recording rejects blank reviewer identities, and malformed reviewer/timestamp fields now fail closed as structured issues instead of crashing validator commands.
- Approved provider execution decisions can now also be reduced into a machine-readable provider execution attempt contract, so later automation can record one authorized pending rerun attempt without yet triggering any real provider call.
- Authorized pending provider execution attempts can now also be reduced into a machine-readable provider execution receipt contract, so later automation can record whether a real-provider rerun produced a new review artifact or failed during execution without inferring outcome from logs.
- Provider execution receipts can now also be reduced into a machine-readable reconciliation/result-summary contract, so later automation can distinguish trusted artifact handoff, execution failure, and invalid-receipt triage without replaying execution policy from raw receipt fields.
- Provider execution follow-up source validation now shape-guards malformed reconciliation payloads, follow-up builders fail closed on invalid source chains, and manual-triage failure labels sanitize `failure_code` before exporting routing metadata.
- Provider execution follow-up contracts can now also be reduced into an executor-ready follow-up delivery plan, so later automation can deterministically upsert any post-execution triage inbox item without guessing payload fields from prose.
- Provider execution follow-up delivery plans can now also emit a machine-readable follow-up delivery receipt, so later automation can record whether post-execution triage work was actually opened without inferring status from logs.
- Provider execution follow-up delivery plans plus receipts can now also be reduced into a machine-readable follow-up reconciliation/result summary, so later automation can distinguish closed post-execution delivery chains, manual repair, and receipt-triage states without replaying delivery policy from raw operation fields.
- Provider execution follow-up delivery reconciliation can now also be reduced into a machine-readable post-delivery closure/follow-up routing contract, so later automation can distinguish trusted result-artifact handoff, delivered manual triage, manual repair, and receipt triage without replaying provider-side queue policy from raw delivery metadata.
- Provider execution post-delivery closure/follow-up routing can now also be reduced into a downstream post-delivery routing contract, so later automation can preserve trusted source-derived artifact handoff / active follow-up context while still fail-closing malformed delivery metadata before any later executor layer consumes it.
- Receipt-triage branches in that downstream provider post-delivery routing now keep trusted source-derived context explicit while clearing untrusted current receipt-derived state.
- The latest downstream provider post-delivery executor trio can now also be reduced into one more closure/follow-up routing contract, preserving trusted handoff and delivered-manual-follow-up closure while keeping repair and receipt-triage branches explicit.
- Latest-depth manual triage item keys, titles, and labels are now depth-disambiguated, and branch tests cover trusted artifact handoff, repair-required, and receipt-triage-required paths.
- Orchestration guidance now also points at the target human queue and keeps unattended action explicitly limited to `open_inbox_item`.
- Orchestration guidance now also carries inbox-ready payload fields (`primary_human_action`, `inbox_title`, `inbox_summary`) so future schedulers can open stable inbox items without generating prose on the fly.
- Review artifacts can now also be exported as a dedicated inbox handoff JSON, so queue routing and inbox payload fields travel as one stable automation contract.
- The inbox handoff export now also carries `chain_key` and `predecessor_item_key`, so future automation can dedupe or supersede prior inbox items inside the same rerun lineage.
- The inbox handoff export now also carries an explicit `delivery_action`, so later automation can execute create-vs-replace behavior directly instead of inferring it from predecessor presence.
- Review artifacts can now also be exported as an executor-ready inbox delivery plan with explicit `upsert` and `close` operations, so future automation can act on one stable action document instead of translating handoff metadata at execution time.
- Executor-ready inbox delivery plans now also have a dedicated validator and CLI check, so malformed create/replace plans fail closed before any automation worker executes them.
- Executor-ready inbox delivery plans now also carry stable per-action `operation_key` values, so later inbox executors can safely replay the same plan without guessing idempotency boundaries.
- Executor-ready inbox delivery plans can now also emit a matching delivery receipt contract, so later automation can record which `upsert` / `close` operations actually ran and what final active item state was produced.
- Delivery plans plus receipts can now also be reduced into a reconciliation contract, so later automation can see whether a chain is fully closed, cleanup is still pending, or manual repair is required without recomputing policy from raw operations.
- Reconciliation results can now also be reduced into a dedicated follow-up routing contract, so later automation can tell whether delivery is fully closed, or whether it should open a cleanup/repair/receipt-triage follow-up item while preserving any already-active human inbox item.
- Receipt-triage follow-up contracts now also clear untrusted active-item metadata before summary/labels/downstream rendering, so malformed receipts cannot restate a stale "current active inbox item" inside manual-triage payloads.
- The latest provider post-delivery closure/follow-up routing contract can now also be exported as its own executor-ready delivery plan / receipt / reconciliation trio; trusted handoff and delivered-manual-follow-up branches remain no-op/closed, while repair and receipt-triage branches emit only deterministic downstream upsert intent and fail closed on invalid receipts.
- The newest N=16 provider post-delivery closure/follow-up routing contract can now also be exported as another executor-ready delivery plan / receipt / reconciliation trio through short internal modules; trusted handoff and delivered-closed branches stay no-op while repair / receipt-triage branches emit deterministic downstream upserts, and failed/invalid receipts clear untrusted final delivery metadata.
- Semantic validation before candidate promotion.
- Configurable OpenAI-compatible provider request timeout.
- Deterministic promotion blockers for open high/blocking QA issues and forbidden CCSS/Common Core source-trace drift.

## 2. Implemented Files

Core source:

- `apps/content-pipeline/src/agent-invocation.ts`
- `apps/content-pipeline/src/agent-runtime.ts`
- `apps/content-pipeline/src/output-parser.ts`
- `apps/content-pipeline/src/prompt-assets.ts`
- `apps/content-pipeline/src/review-runner.ts`
- `apps/content-pipeline/src/provider-execution-request.ts`
- `apps/content-pipeline/src/provider-execution-decision.ts`
- `apps/content-pipeline/src/provider-execution-attempt.ts`
- `apps/content-pipeline/src/provider-execution-receipt.ts`
- `apps/content-pipeline/src/provider-execution-reconciliation.ts`
- `apps/content-pipeline/src/provider-execution-follow-up.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-plan.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-receipt.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-reconciliation.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-delivery-follow-up.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-delivery-follow-up-plan.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-delivery-follow-up-receipt.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-delivery-follow-up-reconciliation.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-delivery-follow-up-delivery-follow-up.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-n16-plan.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-n16-receipt.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-n16-reconciliation.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-n17.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-n17-plan.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-n17-receipt.ts`
- `apps/content-pipeline/src/provider-execution-follow-up-n17-reconciliation.ts`
- `apps/content-pipeline/src/review-rerun.ts`
- `apps/content-pipeline/src/review-report.ts`
- `apps/content-pipeline/src/review-apply.ts`
- `apps/content-pipeline/src/unit-semantic-validation.ts`

Gateway source:

- `packages/llm-gateway/src/adapters/openai-compatible-adapter.ts`
- `packages/llm-gateway/src/gateway.ts`
- `packages/llm-gateway/src/types.ts`
- `packages/llm-gateway/src/cost-ledger.ts`

Tests:

- `apps/content-pipeline/tests/agent-invocation.spec.ts`
- `apps/content-pipeline/tests/agent-runtime.spec.ts`
- `apps/content-pipeline/tests/output-parser.spec.ts`
- `apps/content-pipeline/tests/provider-execution-request.spec.ts`
- `apps/content-pipeline/tests/provider-execution-decision.spec.ts`
- `apps/content-pipeline/tests/provider-execution-attempt.spec.ts`
- `apps/content-pipeline/tests/provider-execution-receipt.spec.ts`
- `apps/content-pipeline/tests/provider-execution-reconciliation.spec.ts`
- `apps/content-pipeline/tests/provider-execution-follow-up.spec.ts`
- `apps/content-pipeline/tests/provider-execution-follow-up-plan.spec.ts`
- `apps/content-pipeline/tests/provider-execution-follow-up-receipt.spec.ts`
- `apps/content-pipeline/tests/provider-execution-follow-up-reconciliation.spec.ts`
- `apps/content-pipeline/tests/provider-execution-follow-up-cli.spec.ts`
- `apps/content-pipeline/tests/provider-execution-follow-up-delivery-follow-up.spec.ts`
- `apps/content-pipeline/tests/provider-execution-follow-up-delivery-follow-up-executor.spec.ts`
- `apps/content-pipeline/tests/provider-execution-follow-up-delivery-follow-up-cli.spec.ts`
- `apps/content-pipeline/tests/provider-execution-follow-up-delivery-follow-up-delivery-follow-up.spec.ts`
- `apps/content-pipeline/tests/review-runner.spec.ts`
- `apps/content-pipeline/tests/review-report.spec.ts`
- `apps/content-pipeline/tests/review-apply.spec.ts`
- `apps/content-pipeline/tests/unit-semantic-validation.spec.ts`

## 3. Invocation Contract

`buildAgentGatewayRequest`:

- Uses `purpose = content_generation`.
- Uses `privacy_level = public` for current sample units.
- Uses each role's `prompt_asset_id`.
- Sends schema hints and allowed enum values.
- Sends known knowledge node ids where needed.
- Sends each role's mandatory `hard_rules` into the model request.
- Sends unit subject, grade, and provided `standard_alignment` to preserve curriculum context.
- Sends the existing owned-section `source_trace` as provenance to preserve or refine.
- Does not send student ids.
- Does not send full raw unit sections.

`summarizeInvocationForLog`:

- Keeps provider, model, route, prompt id, prompt version, tokens, and cost summary.
- Does not log raw model content.
- Does not log raw patch payloads.
- Does not log full failure text.

## 4. Provider Modes

Supported review-only provider aliases include:

- `openai-compatible`
- `zhipu-openai-compatible`
- `zhipu`
- `aggregator-openai-compatible`
- `aggregator`
- `4sapi`

Provider runs are explicit only. They require `run-llm-review` and a `--review <artifact.json>` output path.

Aggregator-style platforms are allowed only for low-sensitivity content-pipeline review/generation tasks. They must not be used for real student raw dialogue, emotional/psychological signals, long-term student profiles, or identifiable minor data by default.

Provider request timeout can be configured with `CONTENT_PIPELINE_REVIEW_TIMEOUT_MS`. This prevents slow or stalled external model calls from leaving the review workflow waiting indefinitely.

## 5. Review Artifact Gate

`run-llm-review`:

- Produces a review artifact.
- Does not write back `unit.yaml`.
- Includes parsed candidate patches.
- Includes semantic validation status.
- Includes a repair plan when semantic validation fails or an invocation fails early.
- Includes retry-policy guidance when an artifact is blocked.
- Includes orchestration guidance so later automation can follow a machine-readable next-step contract instead of parsing markdown prose.
- Can optionally load a prior blocked review artifact and rerun only from the recommended owner role.
- Emits `rerun_context` so reviewers can see which prior roles were inherited versus rerun.
- `rerun_context` now also records `rerun_chain_depth`, the root blocked artifact timestamp, and the source artifact's retry decision/recommended scope.

`approve-review-artifact`:

- Refuses blocked artifacts.
- Adds explicit approval metadata only for ready artifacts.

`apply-reviewed-patch`:

- Requires `--confirm-reviewed`.
- Requires an approved artifact.
- Requires `--out <candidate-unit.yaml>`.
- Validates the integrated candidate before writing.
- Fails closed if semantic validation fails.

Repair-plan behavior:

- Semantic validation failures now map to a deterministic rerun hint.
- If knowledge node churn strands downstream references, the artifact recommends rerunning from `subject_expert`.
- If a later owned section fails its own semantic gate, the artifact recommends rerunning from that owner role.
- Provider/model unavailability recommends retrying from the failed role without bypassing downstream gates.
- Ownership violations remain manual-review issues rather than automatic rerun suggestions.

Scoped rerun execution:

- `run-llm-review <unit.yaml> --review <artifact.json> --from-artifact <blocked-artifact.json>` now reconstructs a review-only candidate by applying prior successful candidate patches before the rerun start role.
- The workflow then reruns only the affected tail roles, for example `assessment_designer -> qa_agent`, rather than replaying the entire six-role chain.
- The resulting artifact keeps `writeback_performed = false` and records `rerun_context.start_from_role` plus inherited earlier roles.
- The resulting artifact also records rerun-lineage anchors, so a later scheduler can tell whether this is the first rerun or a deeper retry chain.
- `--rerun-from <role>` can override the repair-plan hint when a reviewer wants to restart slightly earlier.
- Scoped rerun now refuses non-blocked source artifacts and refuses explicit rerun roles that narrow the recommended repair-plan scope.
- If `retry_policy.decision = manual_review_required`, `--from-artifact` fails closed before any provider call.

Retry-policy guidance:

- First blocked artifacts with a deterministic rerun owner are marked `allow_scoped_rerun`.
- If a rerun artifact later points to an earlier owner than the prior rerun scope, the policy upgrades to `widen_rerun_scope`.
- If provider instability repeats after a rerun, or the plan already says `manual_review`, the policy becomes `manual_review_required`.
- The policy is diagnostic only for now. It does not bypass human approval or trigger writeback.
- CLI review summaries now surface rerun-lineage fields (`rerun_chain_depth`, `rerun_root_artifact_generated_at`, `rerun_source_retry_decision`) for automation consumers.

Orchestration guidance:

- `notify_human_for_approval` means the artifact is ready and the next automation step is notification only.
- `prepare_scoped_rerun` means a review-only rerun is structurally allowed, but still requires an explicit human/provider-budget decision before execution.
- `prepare_widened_rerun` means the next rerun must restart from an earlier owner scope, and that widened rerun is still decision-gated.
- `manual_triage_required` means policy already says to stop automatic retries and route the artifact to human review.
- `blocked_without_guidance` is a fail-closed fallback when the artifact is blocked but retry metadata is incomplete.
- `human_queue` now tells automation whether the inbox item belongs in `approval_queue`, `rerun_decision_queue`, or `manual_triage_queue`.
- `automation_step = open_inbox_item` and `provider_execution_allowed_without_human = false` make the current decision boundary explicit for unattended consumers.
- `primary_human_action`, `inbox_title`, and `inbox_summary` now provide the minimal structured handoff payload for that inbox item.

## 6. Early Section Semantic Gate

After the first real Zhipu Option A run exposed a dangling `knowledge.edges[]` endpoint, semantic validation was moved earlier in the workflow:

- `mergeAgentPatchIntoUnit` still checks ownership first.
- The merged unit still passes the shared Zod schema before semantic checks.
- The patched section is then validated immediately with `validateUnitSectionSemanticIntegrity`.
- For `knowledge` patches, the gate also checks downstream node references, because knowledge node ids anchor pedagogy, narrative, implementation, and assessment.
- A semantically invalid section stops the workflow before the next Agent call.
- This prevents paying for later provider calls when the first patch is already impossible to integrate.

Example guarded issue:

- `knowledge.edges[].from_node_id` or `to_node_id` references a node id not present in the same merged `knowledge.nodes[]` section.

## 7. Real Zhipu Option A Verification

Executed after adding `assessment_designer`:

```powershell
pnpm --filter @edu-ai/content-pipeline exec tsx src/cli.ts run-llm-review ../../content/units/math-g8-s1-linear-function-concept/unit.yaml --review ../../content/units/math-g8-s1-linear-function-concept/review-artifact.zhipu-option-a-2026-04-23.json
pnpm --filter @edu-ai/content-pipeline exec tsx src/cli.ts render-review-report ../../content/units/math-g8-s1-linear-function-concept/review-artifact.zhipu-option-a-2026-04-23.json --out ../../content/units/math-g8-s1-linear-function-concept/review-report.zhipu-option-a-2026-04-23.md
```

Result:

- Artifact status: `blocked`.
- Candidate patches: 6.
- Roles completed: 6.
- Writeback performed: false.
- Semantic validation: failed closed.
- Semantic issue: `knowledge.edges[3].from_node_id` references missing node `lf_slope_meaning`.
- Token summary: input 2686, output 15705.

Interpretation:

- The six-role real provider path works.
- `assessment_designer` generated an `assessment` patch.
- The semantic gate correctly blocked a remaining knowledge-edge issue.
- The source `unit.yaml` remained unchanged.
- Follow-up implementation now catches the same class of knowledge-edge issue during section merge, before later Agent calls.

## 8. Real Zhipu Timeout Control Verification

After adding `CONTENT_PIPELINE_REVIEW_TIMEOUT_MS`, a short timeout control run was executed against Zhipu `glm-5.1`:

```powershell
$env:CONTENT_PIPELINE_REVIEW_TIMEOUT_MS = '15000'
pnpm --filter @edu-ai/content-pipeline exec tsx src/cli.ts run-llm-review ../../content/units/math-g8-s1-linear-function-concept/unit.yaml --review ../../content/units/math-g8-s1-linear-function-concept/review-artifact.zhipu-option-a-timeout-control-2026-04-23.json
```

Result:

- Artifact: `content/units/math-g8-s1-linear-function-concept/review-artifact.zhipu-option-a-timeout-control-2026-04-23.json`
- Report: `content/units/math-g8-s1-linear-function-concept/review-report.zhipu-option-a-timeout-control-2026-04-23.md`
- Artifact status: `blocked`
- Candidate patches: 0
- Writeback performed: false
- First failed role: `subject_expert`
- Failure category: `model_unavailable`
- Later roles invoked: 0

Interpretation:

- External provider timeout now fails closed and does not hang the workflow.
- The timeout path does not leak raw prompt, raw message, or raw model content into the review artifact.
- `glm-5.1` did not return the first role response within the configured control timeout; model/provider strategy needs a deliberate decision before another full real run.

The longer semantic-gated Zhipu run also produced a partial artifact:

- Artifact: `content/units/math-g8-s1-linear-function-concept/review-artifact.zhipu-option-a-semantic-gated-2026-04-23.json`
- Report: `content/units/math-g8-s1-linear-function-concept/review-report.zhipu-option-a-semantic-gated-2026-04-23.md`
- Artifact status: `blocked`
- Candidate patches: 2 (`subject_expert`, `pedagogy_designer`)
- First failed role: `narrative_designer`
- Failure category: `model_unavailable`
- Later roles invoked: 0
- Writeback performed: false

Quality observation:

- The `subject_expert` patch was structurally accepted, but it shifted source traces toward US CCSS-style references and English content. This is not acceptable for the China K-12 private-school pilot without prompt/RAG constraints and human subject review.

Follow-up prompt contract hardening:

- Every Agent now receives mandatory hard rules in the request body, not just in local spec metadata.
- All roles are constrained to the China K-12 private-school pilot context.
- All learner-facing and teacher-facing prose must be Simplified Chinese while stable ids remain lowercase ASCII.
- Agents are explicitly forbidden from inventing or substituting US Common Core, CCSS, or other foreign standard codes when the provided unit metadata/source traces are Chinese curriculum context.
- `subject_expert` has an additional rule to preserve Chinese curriculum/textbook/teacher-note provenance instead of replacing it with CCSS or English-only references.
- The request now includes existing owned-section `source_trace` so the model has concrete provenance to preserve instead of reconstructing it from memory.

Follow-up deterministic semantic gates:

- Any open `high` or `blocking` quality issue now blocks promotion even if `quality.checklist_pass = false`.
- `quality.checklist_pass = true` with open high/blocking issues remains an explicit inconsistent-state error.
- Section `meta.source_trace[]` now fails closed if it references CCSS, Common Core, Common Core State Standards, or Chinese translations of those foreign-standard labels.
- The source-trace check is intentionally scoped to provenance fields, not reviewer notes, so a QA note can mention "未引入 CCSS" without causing a false positive.
- Review artifacts now block when the QA Agent leaves an open blocking issue instead of being marked `ready_for_human_review`.

Regression against the previous localized Zhipu artifact:

- Artifact: `content/units/math-g8-s1-linear-function-concept/review-artifact.zhipu-option-a-localized-2026-04-23.json`
- Recomputed result under the new gate: blocked during QA merge.
- Blocking error: `open_quality_blocker` at `quality.issues[0]` for `unverified_curriculum_alignment`.
- Source `unit.yaml` remained unchanged.

## 9. Verification

Executed:

```powershell
pnpm --filter @edu-ai/content-pipeline typecheck
pnpm --filter @edu-ai/content-pipeline test
pnpm --filter @edu-ai/shared-types typecheck
pnpm --filter @edu-ai/shared-types test
pnpm run ci
```

Results:

- content-pipeline tests passed: 40 files, 252 tests.
- llm-gateway tests passed: 1 file, 13 tests.
- shared-types tests passed: 4 files, 111 tests.
- root CI passed: lint, typecheck, test, e2e, build.

Independent cold review:

- Reviewer: Codex sub-agent `Galileo`.
- Verdict: no P0/P1/P2 findings;可以锁.
- Residual P3 suggestions closed: added a negative regression proving QA notes may mention "CCSS" without triggering the source-trace gate, plus a positive regression for Chinese forbidden source-trace phrases.
- Follow-up cold review: Codex sub-agent `Confucius`.
- Finding: one medium risk in follow-up rendering, where malformed `plan + reconciliation` input could still open a wrong human task if callers skipped the separate validate step.
- Resolution: `render-review-inbox-delivery-follow-up` now runs source validation before emitting any follow-up contract, and fails fast on inconsistent reconciliation summaries.
- Follow-up cold review: Codex sub-agent `Franklin`.
- Finding: one medium risk in downstream follow-up plan/receipt CLI handling, where malformed `follow-up` input could still be rendered into a plan/receipt if callers skipped an upstream validation step.
- Resolution: downstream follow-up plan/receipt CLI paths now fail closed on invalid upstream `follow-up` input; `render-review-inbox-delivery-follow-up-plan` validates the source follow-up contract first, and follow-up receipt render/validate now require `follow-up -> plan -> receipt` source order.
- Follow-up cold review: Codex sub-agent `Ampere`.
- Finding: one P1 and one P2 in the new provider-execution-request layer, where unknown `recommended_rerun_from` values could silently collapse into a `qa_agent` tail slice and direct builder/validator callers could bypass blocked-only source gates.
- Resolution: provider execution request source validation now rejects non-role rerun starts, builder/validator now run source-contract validation themselves and fail closed, and new regression tests cover invalid rerun-role plus invalid-source direct-call paths.
- Follow-up cold review: Codex sub-agent `Kant`.
- Findings: one P1 and two P2s in the new provider-execution-decision layer, where source validation still allowed tampered request fields outside the documented review-only boundary, the recorder/CLI could emit blank-reviewer decisions, and malformed reviewer/timestamp fields could crash validation instead of returning structured issues.
- Resolution: provider execution decision source validation now rechecks contract-critical request fields (`request_key`, `chain_key`, `review_mode`, `output_contract`, rerun messaging), decision recording rejects whitespace-only reviewer ids, validator field checks now fail closed on malformed reviewer/timestamp input, and new regression tests cover each cold-review case.
- Follow-up cold review: Codex sub-agent `Volta`.
- Finding: one P1 in `provider-execution-reconciliation`, where malformed upstream request/decision/attempt/receipt `schema_version` fields could leak into fixed-literal `source_*_schema_version` reconciliation fields and still validate because the expected summary was derived from the same malformed source chain.
- Resolution: the reconciliation builder now always emits the canonical source schema-version literals for request/decision/attempt/receipt, malformed upstream chains are instead surfaced via receipt/source validation issue codes, and a regression test now covers malformed upstream schema-version input without allowing the exported reconciliation contract itself to drift.
- Follow-up cold review: Codex sub-agent `Peirce`.
- Finding: one P2 in `provider-execution-follow-up`, where unsanitized `failure_code` text could leak `:` / `|` / newline characters into manual-triage labels and break downstream `key:value` routing assumptions.
- Resolution: provider-execution follow-up labels now sanitize `failure_code` into a stable label-safe token before export, and regression tests cover delimiter-heavy failure-code input.
- Follow-up cold review: Codex sub-agent `Lovelace`.
- Findings: one P1 and one P2 in `provider-execution-follow-up`, where malformed reconciliation payloads could crash follow-up source/validate paths instead of returning structured issues, and direct builder callers could bypass source validation to mint a fake success handoff.
- Resolution: follow-up source validation now shape-guards reconciliation payloads before deeper comparison, validator returns early on invalid source chains, builder fails closed on invalid source input, and unknown follow-up enums now throw instead of silently degrading.
- Follow-up cold review: Codex sub-agent `Plato`.
- Findings: one P1 and two P2s in the new downstream provider post-delivery routing chain, where `receipt_triage_required` dropped trusted source-derived context, downstream executor builders still trusted callers to pre-validate source contracts, and receipt-triage summaries/labels did not carry actual receipt issue detail.
- Resolution: receipt-triage routing now preserves `preserved_result_artifact_handoff` / `preserved_active_follow_up_item` explicitly while clearing untrusted current receipt state, downstream builders now validate source contracts themselves and fail closed, and receipt-triage summaries/labels now surface real receipt validation issue codes.

Current local extension:

- Review artifacts now surface `repair_plan.source`, `recommended_rerun_from`, and `recommended_rerun_roles`.
- Markdown reports render a `Suggested Repair Plan` section for blocked artifacts.
- CLI `run-llm-review` now prints the recommended rerun starting role in machine-readable JSON and stderr hints.
- CLI and workflow now support `--from-artifact` scoped reruns and expose `scoped_rerun_from` / `rerun_context` in both JSON output and markdown reports.
- Blocked artifacts now also surface `retry_policy.decision`, allowing operators to distinguish safe first reruns, widened rerun scope, and manual-review stop conditions.
- Scoped rerun execution now consumes that policy: manual-review artifacts and narrowed explicit rerun scopes are rejected before execution.
- Scoped rerun metadata now exposes rerun lineage (`rerun_chain_depth`, root artifact anchor, source retry decision), so later unattended orchestration can reason over retry history without parsing logs.
- Review artifacts, reports, and CLI summaries now also expose `orchestration_guidance`, which keeps the next-step contract machine-readable while still respecting the current human decision boundary around real provider execution.
- The same guidance now includes queue routing metadata, so future inbox automation can route ready approvals, rerun decisions, and manual triage to different work buckets without parsing prose.
- The same guidance now includes inbox payload content, so later automation can open deterministic human tasks while still respecting the current no-provider-without-human boundary.
- `render-review-inbox-item` now exports that queue/action/title/summary bundle as a standalone handoff JSON with a stable `item_key`, labels, and decision-boundary metadata.
- The same inbox handoff now includes rerun-chain supersession metadata, so a later scheduler can close or replace the prior inbox item instead of opening parallel duplicate tasks for the same artifact chain.
- The same inbox handoff now also includes explicit delivery semantics (`create_inbox_item` vs `replace_predecessor_inbox_item`), keeping create/replace behavior machine-readable and deterministic.
- `render-review-inbox-delivery-plan` now turns that handoff into an executor-ready action plan with explicit `upsert` and `close` lists, so downstream automation can apply inbox state transitions without inventing its own orchestration layer.
- `validate-review-inbox-delivery-plan` now verifies schema/version, final active item consistency, create-vs-replace close semantics, and deterministic operation-key integrity before execution.
- `render-review-inbox-delivery-receipt` now creates a stable execution receipt from that plan, including per-operation outcome, aggregate status, and final active-item state.
- `validate-review-inbox-delivery-receipt` now verifies the receipt against its source plan, so downstream reconciliation fails closed if an executor reports impossible targets, impossible final state, or mismatched aggregate status.
- `render-review-inbox-delivery-reconciliation` now reduces a plan plus receipt into a machine-readable closure result with `reconciliation_status`, `recommended_follow_up`, and unresolved failed operations.
- `validate-review-inbox-delivery-reconciliation` now verifies that closure result against the source plan and receipt, so later automation cannot report a chain as closed when the raw receipt still implies cleanup or repair work.
- `render-review-inbox-delivery-follow-up` now reduces a plan plus reconciliation into a machine-readable follow-up routing/closure-policy contract, making closed delivery chains and cleanup/repair/receipt-triage branches explicit.
- `validate-review-inbox-delivery-follow-up` now verifies that follow-up contract against the source plan and reconciliation, so later automation cannot silently rewrite the intended closure policy or manual-routing path.
- `render-review-inbox-delivery-follow-up` now also validates the source reconciliation against its delivery plan before emitting anything, so invalid closure summaries fail closed instead of opening incorrect cleanup/repair/triage tasks.
- `render-review-inbox-delivery-follow-up-plan` now converts that follow-up routing contract into an executor-ready follow-up delivery plan, preserving the current active item state while deterministically defining any manual cleanup/repair/receipt-triage inbox upsert that automation may open next.
- `validate-review-inbox-delivery-follow-up-plan` now verifies that executor-ready follow-up plan against the source follow-up contract, including deterministic operation keys and preserved active-item semantics.
- `render-review-inbox-delivery-follow-up-receipt` now creates a stable execution receipt from that follow-up plan, recording whether the cleanup/repair/receipt-triage inbox item was actually opened.
- `validate-review-inbox-delivery-follow-up-receipt` now verifies that follow-up receipt against its source follow-up plan, including preserved active-item semantics and final follow-up item state.
- Downstream follow-up plan/receipt CLI paths now also validate the source follow-up contract itself before rendering or validating executor-ready artifacts, so malformed follow-up state/action payloads fail closed instead of propagating into later delivery contracts.
- `render-review-inbox-delivery-follow-up-reconciliation` now reduces a validated `follow-up + plan + receipt` chain into a machine-readable follow-up reconciliation/result-summary contract.
- `validate-review-inbox-delivery-follow-up-reconciliation` now verifies that follow-up reconciliation against the source follow-up plan/receipt chain, so later automation cannot silently report a failed follow-up delivery as closed.
- `decide-review-provider-execution-request` now records a machine-readable human/budget verdict from a validated provider execution request, without triggering any real provider execution.
- `validate-review-provider-execution-decision` now verifies that decision contract against the source request, including fail-closed source validation and the rule that `approved` decisions require `budget_check_status = passed`.
- `validate-review-provider-execution-decision` now also rejects tampered request-mode/output/text fields via the source validator, rejects blank reviewer identities, and reports malformed reviewer/timestamp values as structured issues instead of crashing.
- `record-review-provider-execution-attempt` now reduces an approved/granted/passed provider execution decision into an `authorized_pending_execution` attempt contract, without triggering any real provider spend.
- `validate-review-provider-execution-attempt` now verifies that attempt contract against the source request + decision chain, including the rule that only approved/granted/passed decisions can mint an authorized attempt.
- `record-review-provider-execution-receipt` now reduces an `authorized_pending_execution` attempt into a machine-readable execution receipt, capturing either `artifact_recorded` or `execution_failed` without triggering provider spend itself.
- `validate-review-provider-execution-receipt` now verifies that receipt contract against the full request + decision + attempt chain, including fail-closed source validation plus artifact/failure branch consistency.
- `render-review-provider-execution-reconciliation` now reduces request + decision + attempt + receipt into a stable result summary, distinguishing trusted artifact handoff, execution failure, and invalid-receipt triage.
- `validate-review-provider-execution-reconciliation` now verifies that result summary against the full request/decision/attempt/receipt chain, including the rule that invalid receipts must not propagate untrusted artifact/failure metadata.
- `provider-execution-reconciliation` now also keeps its own `source_*_schema_version` fields canonical even when the upstream request/decision/attempt/receipt chain is malformed, so reconciliation summaries surface source-contract mismatch through issue codes instead of violating the exported reconciliation contract.
- `render-review-provider-execution-follow-up` now reduces `request + decision + attempt + receipt + reconciliation` into a machine-readable post-execution routing contract that distinguishes result-artifact handoff, manual execution triage, and manual receipt triage.
- `validate-review-provider-execution-follow-up` now verifies that routing contract against the full provider-execution source chain, including the rule that successful execution should defer to the result artifact contract instead of inventing an approval queue directly from receipt metadata.
- `render-review-provider-execution-follow-up` now also shape-guards malformed reconciliation input before deeper validation, builder paths fail closed on invalid source chains, and manual-execution labels sanitize `failure_code` before exporting label metadata.
- `render-review-provider-execution-follow-up-plan` now converts that validated post-execution routing contract into an executor-ready delivery plan, preserving result-artifact handoff for successful executions and emitting deterministic manual-triage upsert payloads only when the follow-up contract explicitly requires them.
- `validate-review-provider-execution-follow-up-plan` now verifies that delivery plan against the full provider-execution source chain plus the follow-up contract, so tampered final follow-up targets or payloads fail closed before later automation acts on them.
- `render-review-provider-execution-follow-up-receipt` now converts that validated delivery plan into a machine-readable follow-up delivery receipt, recording whether post-execution triage work was actually created while preserving pure artifact-handoff semantics for success/no-op branches.
- `validate-review-provider-execution-follow-up-receipt` now verifies that receipt against the full provider-execution source chain plus the follow-up delivery plan, so forged final follow-up targets or impossible operation payloads fail closed before later automation reconciles them.
- `render-review-provider-execution-follow-up-reconciliation` now reduces `follow-up plan + follow-up receipt` into a machine-readable follow-up reconciliation/result summary, keeping invalid receipts in `manual_receipt_triage` and preserving closed delivery semantics when triage work is successfully opened.
- `validate-review-provider-execution-follow-up-reconciliation` now verifies that reconciliation against the full provider-execution source chain plus the follow-up plan/receipt pair, so later automation cannot silently report a failed or malformed post-execution delivery chain as closed.
- `render-review-provider-execution-follow-up-delivery-follow-up` now reduces `follow-up plan + follow-up reconciliation` into a machine-readable post-delivery closure/follow-up routing contract, distinguishing trusted result-artifact handoff, delivered manual triage items, repair-required delivery failures, and receipt-triage states.
- `validate-review-provider-execution-follow-up-delivery-follow-up` now verifies that post-delivery routing contract against the full provider-execution source chain plus the follow-up plan/receipt/reconciliation chain, so later automation cannot silently rewrite trusted handoff-vs-repair-vs-receipt-triage policy after delivery reconciliation.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up` now reduces that post-delivery routing contract plus its validated source chain into one more downstream provider-side post-delivery routing contract, making `result_artifact_handoff_ready`, `manual_follow_up_item_delivered`, `repair_follow_up_delivery_follow_up_required`, and `receipt_triage_required` explicit for the next executor layer.
- `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up` now verifies that downstream routing contract against the full provider-execution source chain plus the post-delivery plan/receipt/reconciliation chain, so later automation cannot silently rewrite trusted handoff-vs-repair-vs-receipt-triage policy after the first post-delivery routing layer.
- Downstream provider post-delivery receipt-triage branches now preserve trusted source-derived context explicitly (`preserved_result_artifact_handoff`, `preserved_active_follow_up_item`) while clearing untrusted current delivery state, and downstream executor builders now fail closed on malformed source payloads even outside CLI wrappers.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan` now converts that downstream provider-side post-delivery routing contract into an executor-ready delivery plan, preserving trusted result-artifact handoff / active follow-up context for no-op branches while emitting deterministic manual follow-up upsert payloads and stable operation keys only when later delivery work is actually required.
- `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-plan` now verifies that executor-ready delivery plan against the full provider-execution source chain plus the downstream post-delivery routing contract, so tampered final follow-up targets or impossible downstream delivery actions fail closed before any later automation acts on them.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-receipt` now converts that validated executor-ready delivery plan into a machine-readable delivery receipt, preserving pure no-op semantics for trusted handoff branches while recording only deterministic manual follow-up delivery outcomes for executor branches.
- `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-receipt` now verifies that delivery receipt against the full provider-execution source chain plus the executor-ready delivery plan, so forged final follow-up targets or impossible downstream operation payloads fail closed before later automation reconciles them.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-reconciliation` now reduces `executor-ready delivery plan + delivery receipt` into a machine-readable downstream post-delivery reconciliation/result summary, distinguishing closed downstream delivery chains, manual repair, and receipt triage without trusting malformed receipt metadata.
- `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-reconciliation` now verifies that downstream reconciliation against the full provider-execution source chain plus the executor-ready plan/receipt pair, so later automation cannot silently report a failed or malformed downstream delivery chain as closed.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` now reduces that downstream executor-ready plan + reconciliation chain into one more machine-readable post-delivery closure/follow-up routing contract, making `result_artifact_handoff_ready`, `manual_follow_up_item_delivered`, `repair_follow_up_delivery_follow_up_delivery_follow_up_required`, and `receipt_triage_required` explicit for the next layer.
- `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` now verifies that latest downstream routing contract against the full provider-execution source chain plus the executor-ready downstream plan/receipt/reconciliation trio, so later automation cannot silently rewrite trusted handoff-vs-repair-vs-receipt-triage policy after the deepest provider delivery layer.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` now reduces that newest downstream executor-ready plan + reconciliation chain into yet another machine-readable post-delivery closure/follow-up routing contract, making `result_artifact_handoff_ready`, `manual_follow_up_item_delivered`, `repair_follow_up_delivery_follow_up_delivery_follow_up_delivery_follow_up_required`, and `receipt_triage_required` explicit for the next executor layer.
- `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` now verifies that latest routing contract against the full provider-execution source chain plus the newest downstream plan/receipt/reconciliation trio, so later automation cannot silently rewrite trusted handoff-vs-repair-vs-receipt-triage policy after this additional provider delivery layer.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` and `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` now convert that latest routing contract into the next executor-ready delivery plan, preserving trusted handoff and delivered-manual-follow-up branches as pure no-op / closed semantics while emitting deterministic downstream upsert payloads only for repair / receipt-triage branches.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt` and `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt` now turn that delivery plan into a source-validated receipt, preserving no-op receipt semantics for trusted closed branches while recording only deterministic executor outcomes for deeper manual-follow-up branches.
- A Codex cold review found and closed a receipt-validation P1: newest downstream delivery receipts now reject malformed operation status enums before reconciliation, so forged statuses such as `skipped` cannot be treated as applied executor outcomes.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation` and `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation` now reduce that newest `plan + receipt` pair into another downstream reconciliation/result summary, distinguishing closed delivery chains, manual repair, and receipt triage without trusting malformed receipt metadata.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` now converts that newest downstream closure/follow-up routing contract into another executor-ready delivery plan, preserving trusted handoff and delivered-manual-follow-up branches as pure no-op/closed semantics while emitting deterministic downstream upsert payloads only for repair / receipt-triage branches.
- `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` now verifies that newest executor-ready delivery plan against the full provider-execution source chain plus the newest downstream routing contract, so tampered final follow-up targets or impossible deeper delivery actions fail closed before any later automation acts on them.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt` / `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt` now turn that newest executor-ready delivery plan into a source-validated receipt, preserving trusted no-op semantics for handoff / delivered-closed branches while recording only deterministic executor outcomes for deeper manual-follow-up branches.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation` / `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation` now reduce that newest `plan + receipt` pair into one more machine-readable downstream reconciliation/result summary, distinguishing closed delivery chains, manual repair, and receipt triage without trusting malformed receipt metadata.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` / `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` now reduce that latest downstream executor-ready plan + reconciliation chain into one more closure/follow-up routing contract, keeping trusted handoff and delivered manual follow-up closed while emitting explicit repair / receipt-triage routing only when needed.
- Latest manual triage payloads now include the full current contract depth in item keys and labels, preventing collisions with earlier downstream executor-layer repair / receipt-triage inbox items.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` now turn that latest closure/follow-up routing contract into an executor-ready delivery plan, with no-op operations for trusted handoff / delivered-closed branches and deterministic upsert operations only for repair / receipt-triage branches.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt` / `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-receipt` now record source-validated execution receipts for that plan, preserving no-op receipt semantics for closed branches and rejecting malformed operation status enums before reconciliation.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation` / `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-reconciliation` now reduce the latest `plan + receipt` pair into another downstream reconciliation/result summary, clearing untrusted delivery metadata whenever receipt validation fails.
- A Darwin cold review found and closed two P2 gaps in this latest trio: invalid receipts now reach CLI-rendered `manual_receipt_triage` reconciliation instead of being rejected as source-chain fatal, and branch regressions now cover trusted artifact handoff, repair failed upsert, and malformed receipt metadata clearing.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` / `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` now reduce the latest downstream executor-ready trio into one more closure/follow-up routing contract, preserving trusted handoff and delivered manual follow-up as closed/no-op branches while emitting explicit repair and receipt-triage routes with depth-disambiguated payloads.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` now export that latest closure/follow-up routing contract into another executor-ready delivery trio, preserving no-op/closed semantics for trusted handoff and delivered manual follow-up branches while emitting deterministic upsert operations only for repair / receipt-triage branches.
- The latest routing standalone contract validator now accepts source-aware receipt-triage issue labels structurally, so a routing payload that passes full source validation can feed the next executor plan without losing fail-closed item-key/title/action/label invariants.
- A Darwin cold review found and closed one P2 in that standalone receipt-triage matcher: it now rejects extra forged labels and requires exactly the expected stable labels plus one non-empty `receipt_validation:*` label before any executor upsert can copy the payload.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` / `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` now reduce that latest executor-ready trio into one more closure/follow-up routing contract, validating the N=6 source plan/receipt/reconciliation chain before deriving any downstream routing state.
- The newest routing layer keeps trusted artifact-handoff and delivered-manual-follow-up branches closed/no-op, while repair-required branches emit N=7 depth-disambiguated deterministic manual-triage payloads and receipt-triage branches preserve source-aware receipt issue labels.
- The provider follow-up delivery CLI regression now renders and validates this N=7 routing layer on both the delivered-closed branch and the malformed/failing executor branch that becomes manual repair.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` now export that N=7 closure/follow-up routing contract into the next executor-ready delivery trio, preserving trusted handoff and delivered-manual-follow-up branches as no-op/closed while emitting deterministic downstream upserts only for repair / receipt-triage branches.
- The latest executor-ready trio regression now covers trusted delivered-closed no-op delivery, repair-branch failed upsert reconciliation, and malformed receipt clearing of untrusted final delivery metadata.
- A Darwin cold review found and closed one P2 in this N=7 routing layer: direct builder / standalone source-contract paths now validate plan-to-reconciliation linkage and receipt-triage structure, so a valid plan cannot be paired with an unrelated or forged reconciliation to mint a downstream routing contract.
- Darwin follow-up review found no remaining P0/P1/P2; the residual observation is that direct builders intentionally remain plan+reconciliation scoped while the full source-chain guarantee lives in CLI/source validator paths.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` / `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` now reduce that latest executor-ready delivery trio into the next closure/follow-up routing contract, validating the full upstream source chain plus the N=7 plan/receipt/reconciliation trio before deriving any downstream state.
- The new N=8 routing regression covers delivered-closed no-op routing, repair-required manual triage, and malformed-receipt triage with source-aware issue-code labels.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` now export that N=8 closure/follow-up routing contract into another executor-ready delivery trio, preserving trusted handoff and delivered-manual-follow-up branches as no-op/closed while emitting deterministic downstream upserts only for repair / receipt-triage branches.
- The new N=8 executor-ready trio CLI regression renders and validates the plan, receipt, and reconciliation chain from the full upstream source set, including a failed repair upsert branch that must become manual repair without trusting final delivery metadata.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` / `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` now reduce that N=8 executor-ready trio into the next closure/follow-up routing contract, validating the full upstream source chain plus the N=8 plan/receipt/reconciliation trio before deriving downstream state.
- The newest routing CLI regression renders and validates this next routing layer on the repair failed-upsert path, checking schema version, deterministic repair route, depth label, and no trusted final active item propagation.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` now export that N=9 closure/follow-up routing contract into another executor-ready delivery trio, preserving trusted handoff and delivered-manual-follow-up branches as no-op/closed while emitting deterministic downstream upserts only for repair / receipt-triage branches and clearing untrusted final delivery metadata on invalid receipts.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` / `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` now reduce that N=9 executor-ready delivery trio into the next closure/follow-up routing contract, validating the full upstream source chain plus the N=9 plan/receipt/reconciliation trio before deriving downstream state.
- The new routing CLI regression renders and validates this N=10 routing layer on the repair failed-upsert path, checking schema version, source trio linkage, deterministic repair route, depth label, and no trusted final active item propagation.
- A Darwin follow-up review closed the N=10 depth-disambiguation P2: repair state/action identifiers now advance beyond the previous layer, and repair/receipt manual-triage item keys now include the full N=10 suffix depth to avoid inbox collisions.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` now export that N=10 closure/follow-up routing contract into another executor-ready delivery trio, preserving trusted handoff / delivered-closed no-op branches while emitting deterministic downstream upserts for repair / receipt-triage branches and clearing untrusted final delivery metadata on invalid receipts.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` / `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` now reduce that N=10 executor-ready delivery trio into the next N=11 closure/follow-up routing contract, validating the full upstream source chain plus the N=10 plan/receipt/reconciliation trio before deriving downstream state.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` now export that N=11 closure/follow-up routing contract into another executor-ready delivery trio, preserving trusted handoff / delivered-closed no-op branches while emitting deterministic downstream upserts for repair / receipt-triage branches and clearing untrusted final delivery metadata on invalid receipts.
- The N=11 trio uses short internal source module filenames (`provider-execution-follow-up-n11-*`) while preserving the long public schema and CLI contract names, preventing Windows build output path-length failures without changing automation-facing identifiers.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` / `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` now reduce that N=11 executor-ready delivery trio into the N=12 closure/follow-up routing contract through the short internal module `provider-execution-follow-up-n12.ts`; the public schema and CLI names remain long and stable, the source validator verifies the full upstream source chain plus the N=11 plan/receipt/reconciliation trio, trusted closed branches remain no-op, and repair / receipt-triage routes stay deterministic and depth-disambiguated.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` now export that N=12 closure/follow-up routing contract into another executor-ready delivery trio through short internal modules `provider-execution-follow-up-n12-*`; the public schema and CLI names remain long and stable, trusted handoff / delivered-closed branches stay no-op, repair / receipt-triage branches emit deterministic downstream upserts, and failed receipts clear untrusted final delivery metadata.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` / `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` now reduce that N=12 executor-ready delivery trio into the N=13 closure/follow-up routing contract through the short internal module `provider-execution-follow-up-n13.ts`; the public schema and CLI names remain long and stable, the source validator verifies the full upstream source chain plus the N=12 plan/receipt/reconciliation trio, trusted closed branches remain no-op, and repair / receipt-triage routes stay deterministic and depth-disambiguated.
- A Beauvoir read-only cold review found and closed one P2 in the N=13 delivered manual-follow-up branch: N=13 now trusts the N=12 reconciliation `final_follow_up_item_key/final_follow_up_queue` as the current active item and no longer requires `preserved_active_follow_up_item` to be non-null; regression coverage includes failed repair routing, applied delivered routing, and a direct builder/validator variant where preserved active context is empty but final delivery is trusted.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` now export that N=13 closure/follow-up routing contract into another executor-ready delivery trio through short internal modules `provider-execution-follow-up-n13-*`; public schema and CLI names remain long and stable, trusted handoff / delivered-closed branches stay no-op, repair / receipt-triage branches emit deterministic downstream upserts, and failed receipts clear untrusted final delivery metadata.
- The N=13 executor-ready trio regression was kept intentionally bounded: full source-chain CLI coverage remains on N=13 routing and plan render/validate, while N=13 receipt / reconciliation repair, delivered-closed, and malformed-receipt metadata-clearing semantics are covered by direct builder/validator contract tests to avoid recursive CLI validation timeouts.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` / `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` now reduce that N=13 executor-ready delivery trio into the N=14 closure/follow-up routing contract through the short internal module `provider-execution-follow-up-n14.ts`; the public schema and CLI names remain long and stable, the source validator verifies the full upstream source chain plus the N=13 plan/receipt/reconciliation trio, trusted artifact-handoff and delivered-closed branches remain no-op, and repair / receipt-triage routes stay deterministic and depth-disambiguated.
- The new N=14 routing direct regression covers artifact handoff, delivered closed, repair-required manual triage, receipt-triage manual triage, and forged plan/reconciliation linkage; the full provider follow-up delivery CLI regression file still passes, preserving existing N13 coverage while avoiding another recursive end-to-end branch explosion.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` now export that N=14 closure/follow-up routing contract into another executor-ready delivery trio through short internal modules `provider-execution-follow-up-n14-*`; public schema and CLI names remain long and stable, trusted artifact-handoff / delivered-closed branches stay no-op, repair / receipt-triage branches emit deterministic downstream upserts, and invalid receipts clear untrusted final delivery metadata.
- The N=14 executor-ready trio regression is intentionally direct-contract scoped: artifact no-op, delivered no-op, repair failed-upsert, and malformed-receipt fail-closed semantics are covered without adding another recursive CLI branch to the already-heavy provider follow-up delivery suite.
- A Hooke read-only cold review found and closed one N=14 P2: receipt validation now shape-guards `operations`, so receipts with missing or non-array operation payloads return validation issues and reconcile into manual receipt triage instead of throwing before fail-closed metadata clearing; regression coverage explicitly includes both missing and non-array `operations`.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` / `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` now reduce that N=14 executor-ready delivery trio into the N=15 closure/follow-up routing contract through the short internal module `provider-execution-follow-up-n15.ts`; public schema and CLI names remain long and stable, source validation verifies the full upstream source chain plus N=14 plan/receipt/reconciliation, trusted artifact-handoff and delivered-closed branches stay no-op, and repair / receipt-triage routes stay deterministic and depth-disambiguated.
- The new N=15 routing direct regression covers artifact handoff, delivered closed, repair-required manual triage, receipt-triage manual triage, and forged source schema/linkage rejection without adding another recursive CLI branch.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-plan` / `receipt` / `reconciliation` now export that N=15 closure/follow-up routing contract into another executor-ready delivery trio through short internal modules `provider-execution-follow-up-n15-*`; public schema and CLI names remain long and stable, trusted artifact-handoff / delivered-closed branches stay no-op, repair / receipt-triage branches emit deterministic downstream upserts, and invalid receipts clear untrusted final delivery metadata.
- The N=15 executor-ready trio direct regression covers artifact no-op, delivered no-op, repair failed-upsert, malformed receipt fail-closed, and invalid-receipt metadata clearing without adding another recursive CLI branch.
- A Confucius read-only cold review found and closed one N=15 P1/P2 pair: invalid-receipt reconciliation now nulls artifact-handoff metadata, and N=15 plan / receipt / reconciliation validate CLI paths return structured source validation issues even when malformed source payloads would otherwise throw before payload validation.
- `render-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` / `validate-review-provider-execution-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up-delivery-follow-up` now reduce the N=15 executor-ready delivery trio into the N=16 closure/follow-up routing contract through the short internal module `provider-execution-follow-up-n16.ts`; source validation verifies the full upstream chain plus N=15 plan/receipt/reconciliation before deriving closed, repair-required, or receipt-triage routing state.
- The N=16 routing direct regression covers artifact handoff, delivered closed, repair-required manual triage, receipt-triage manual triage, and forged N15 reconciliation linkage rejection without adding another recursive CLI branch.
- `render-review-provider-execution-follow-up...N16-plan` / `receipt` / `reconciliation` now export that N=16 closure/follow-up routing contract into another executor-ready delivery trio through short internal modules `provider-execution-follow-up-n16-*`; public schema and CLI names remain long and stable, trusted handoff / delivered-closed branches stay no-op, repair / receipt-triage branches emit deterministic downstream upserts, and failed or invalid receipts clear untrusted final delivery metadata.
- The N=16 executor-ready trio direct regression covers artifact no-op, delivered no-op, repair failed-upsert, malformed receipt fail-closed, and failed-upsert final-target clearing without adding another recursive CLI branch.
- An Arendt read-only cold review found and closed two N=16 P2 gaps: N=16 trio render CLI paths now call safe source validators so malformed/null sources return structured validation failures instead of raw TypeError stderr, and N=16 receipt validation now shape-guards malformed `operations[]` entries before reconciliation so `operations: [null]` becomes manual receipt triage with untrusted final metadata cleared.
- `render-review-provider-execution-follow-up...N17` / `validate-review-provider-execution-follow-up...N17` now reduce the N=16 executor-ready delivery trio into the N=17 closure/follow-up routing contract through the short internal module `provider-execution-follow-up-n17.ts`; source validation verifies the full upstream chain plus N=16 plan/receipt/reconciliation before deriving closed, repair-required, or receipt-triage routing state.
- The N=17 routing direct regression covers artifact handoff, delivered closed, repair-required manual triage, receipt-triage manual triage, forged N16 reconciliation linkage rejection, and malformed source-chain structured failures without adding another recursive success CLI branch.
- `render-review-provider-execution-follow-up...N17-plan` / `receipt` / `reconciliation` now export that N=17 closure/follow-up routing contract into an executor-ready delivery trio through short internal modules; trusted handoff and delivered-closed branches remain no-op, repair/receipt-triage branches produce deterministic upsert payloads, and invalid receipts clear untrusted final delivery metadata.
- The N=17 executor trio regressions now cover closed/no-op preservation of final active item state, failed manual upsert reconciliation, and malformed source-chain CLI fail-closed behavior for plan/receipt/reconciliation render paths.

## 10. Current Limits

- Real provider output still contains subject-level quality and semantic issues.
- A stricter knowledge-edge generation prompt has been added after the 2026-04-23 Zhipu run: the `subject_expert` request now explicitly says every `from_node_id` and `to_node_id` must reference a node in the same `nodes` array.
- Section-level semantic gates now fail fast on known deterministic reference errors, and blocked artifacts now expose a deterministic repair plan, retry policy, rerun lineage, orchestration guidance, stable inbox handoff export, executor-ready inbox delivery plan, delivery-plan validation, stable delivery operation keys, receipt validation hooks, reconciliation hooks, follow-up routing hooks, executor-ready follow-up delivery plans, follow-up delivery receipts, and follow-up delivery reconciliation hooks. Follow-up rendering now also fails closed on malformed reconciliation input, downstream follow-up plan/receipt CLI paths fail closed on malformed follow-up input, receipt-triage follow-up contracts now clear untrusted active-item metadata before any downstream summary or label generation, provider-execution follow-up delivery chains now extend through their own receipt/reconciliation/post-delivery-routing layer, and the downstream provider post-delivery routing layer now extends through repeated source-validated executor-ready delivery plan / receipt / reconciliation trios plus closure/follow-up routing layers. The latest N=11 trio modules plus the N=12 routing, N=12 executor-ready trio, N=13 routing, N=13 executor-ready trio, N=14 routing, N=14 executor-ready trio, N=15 routing, N=15 executor-ready trio, N=16 routing, N=16 executor-ready trio, and N=17 routing modules are short-named internally to preserve Windows build compatibility while keeping public contract names stable; delivered manual-follow-up validation keys off trusted final delivery metadata rather than requiring preserved prior active context, malformed N=16 trio render inputs / receipt operation entries now fail closed structurally, and malformed N=17 source chains return structured validation failures. Fully automated unattended policy-driven rerun loops are still a later enhancement.
- The new provider execution request, decision, attempt, receipt, reconciliation, and follow-up contracts keep that later enhancement fail-closed: they record exact rerun role scope, explicit human/budget verdicts, one authorized pending execution attempt, a machine-readable execution outcome, stable result summaries, repeated post-delivery routing layers, and executor-ready downstream delivery contracts, but they still do not execute real provider reruns or open downstream follow-up work by themselves.
- Zhipu `glm-5.1` timed out on the first role in a short control run; next real-provider run should either use a longer timeout, a faster model, or a smaller role prompt.
- Zhipu `glm-5.1` partial output also showed curriculum-localization drift; the prompt contract now sends China K-12 hard rules and provided standard alignment, but the next real run must still be reviewed before candidate approval.
- No candidate should be approved until semantic validation passes and a subject-matter reviewer accepts the content.
- The next engineering target is exporting the N=17 closure/follow-up routing contract into an executor-ready delivery plan / receipt / reconciliation trio, preserving trusted handoff and delivered-closed no-op semantics while repair / receipt-triage branches remain depth-disambiguated and machine-readable.
