# Phase 2.4 Agent Invocation Contract Self Review

Date: 2026-04-24
Status: current self review

## Verdict

Phase 2.4 invocation contract is valid with six roles and explicit review-only real provider support.

The real Zhipu `glm-5.1` Option A run produced six candidate patches, then semantic validation correctly blocked promotion. This is the expected safe behavior.

## Checks

| Check | Result |
| --- | --- |
| Prompt assets include `assessment_designer` | Pass |
| LLM mock workflow has six invocations | Pass |
| Review artifacts can contain six candidate patches | Pass |
| Real provider run is review-only | Pass |
| Source `unit.yaml` writeback remains disabled | Pass |
| Blocked artifacts cannot be approved | Pass |
| Semantic validation fails closed | Pass |
| Blocked artifacts expose repair-plan rerun hints | Pass |
| Blocked artifacts can seed scoped rerun review runs | Pass |
| Blocked artifacts expose retry-policy stop/go guidance | Pass |
| Scoped rerun execution obeys retry-policy gates | Pass |
| Scoped rerun artifacts expose rerun lineage metadata | Pass |
| Review artifacts expose machine-readable orchestration guidance | Pass |
| Orchestration guidance includes human queue routing | Pass |
| Orchestration guidance includes inbox-ready handoff payloads | Pass |
| Review artifacts export stable inbox handoff JSON | Pass |
| Inbox handoff export includes rerun-chain supersession metadata | Pass |
| Inbox handoff export includes explicit create/replace delivery action | Pass |
| Review artifacts export executor-ready inbox delivery plan | Pass |
| Inbox delivery plan has dedicated fail-fast validator | Pass |
| Inbox delivery plan carries stable replay-safe operation keys | Pass |
| Inbox delivery receipts are plan-validated and machine-readable | Pass |
| Inbox delivery reconciliation is plan+receipt-validated and machine-readable | Pass |
| Inbox delivery follow-up routing is plan+reconciliation-validated and machine-readable | Pass |
| Follow-up rendering fails closed on invalid reconciliation input | Pass |
| Follow-up delivery plans are follow-up-validated and executor-ready | Pass |
| Follow-up delivery receipts are follow-up-plan-validated and machine-readable | Pass |
| Follow-up plan/receipt CLI path fails closed on invalid upstream follow-up input | Pass |
| Follow-up delivery reconciliation is follow-up-plan-receipt-validated and machine-readable | Pass |
| Receipt-triage follow-up never propagates an untrusted active inbox item | Pass |
| Blocked rerun artifacts export machine-readable provider execution requests | Pass |
| Provider execution requests validate concrete rerun roles and fail closed even outside CLI wrappers | Pass |
| Provider execution requests can be reduced into validated human/budget decision contracts | Pass |
| Provider execution decision validation now rejects tampered request fields and malformed reviewer/timestamp payloads | Pass |
| Approved provider execution decisions can be reduced into authorized pending execution attempt contracts | Pass |
| Authorized pending execution attempts can be reduced into validated execution receipts | Pass |
| Execution receipts can be reduced into validated reconciliation/result summaries | Pass |
| Provider execution reconciliation keeps canonical source schema-version literals even when the upstream chain is malformed | Pass |
| Provider execution reconciliation can be reduced into validated post-execution follow-up routing | Pass |
| Provider execution follow-up now fails closed on malformed reconciliation input and direct builder bypass attempts | Pass |
| Provider execution follow-up delivery plans are source-validated and executor-ready | Pass |
| Provider execution follow-up delivery receipts are source-validated and machine-readable | Pass |
| Provider execution follow-up delivery reconciliation is source-plan-receipt-validated and machine-readable | Pass |
| Provider execution post-delivery closure/follow-up routing is source-plan-reconciliation-validated and machine-readable | Pass |
| Downstream provider post-delivery routing is source-plan-reconciliation-validated and machine-readable | Pass |
| Receipt-triage downstream routing preserves trusted source-derived context while clearing untrusted current delivery metadata | Pass |
| Downstream provider post-delivery executor builders fail closed on malformed source payloads | Pass |
| Downstream provider post-delivery executor trio can be reduced into another validated closure/follow-up routing contract | Pass |
| Latest downstream provider post-delivery closure/follow-up routing can be reduced into another validated executor-ready delivery plan | Pass |
| Latest downstream provider post-delivery delivery plans can emit source-validated receipts | Pass |
| Latest downstream provider post-delivery executor trio can be reduced into another validated reconciliation/result summary contract | Pass |
| Newest downstream provider post-delivery executor trio can be reduced into another validated closure/follow-up routing contract | Pass |
| Newest downstream provider post-delivery closure/follow-up routing can be reduced into another validated executor-ready delivery plan | Pass |
| Newest downstream provider post-delivery delivery plans can emit source-validated receipts | Pass |
| Newest downstream provider post-delivery receipt validation rejects malformed operation status enums | Pass |
| Newest downstream provider post-delivery delivery plans plus receipts can be reduced into another validated reconciliation/result summary contract | Pass |
| Latest downstream provider post-delivery executor trio can be reduced into one more validated closure/follow-up routing contract | Pass |
| Latest downstream provider post-delivery routing branch tests cover artifact handoff, repair-required, and receipt-triage-required paths | Pass |
| Latest downstream provider post-delivery closure/follow-up routing can be exported as an executor-ready plan/receipt/reconciliation trio | Pass |
| Latest downstream provider post-delivery executor-ready trio preserves trusted no-op/closed branches and fail-closed receipt triage | Pass |
| Latest downstream provider post-delivery malformed receipts can render/validate manual receipt triage through CLI | Pass |
| Latest downstream provider post-delivery trio branch regression covers artifact handoff, repair failed upsert, and malformed receipt clearing | Pass |
| Latest downstream provider post-delivery executor-ready trio can be reduced into the next validated closure/follow-up routing contract | Pass |
| Latest downstream provider post-delivery next routing branch regression covers artifact handoff, repair-required, and receipt-triage-required paths | Pass |
| Newest N=8 provider post-delivery routing validates full source chain plus N=7 plan/receipt/reconciliation trio | Pass |
| Newest N=8 provider post-delivery routing branch regression covers delivered no-op, repair-required, and receipt-triage-required paths | Pass |
| Latest downstream provider post-delivery next routing contract can be exported as another validated executor-ready plan/receipt/reconciliation trio | Pass |
| Latest downstream provider post-delivery next executor trio keeps receipt-triage issue labels source-aware while preserving standalone structural fail-closed checks | Pass |
| Latest downstream provider post-delivery receipt-triage standalone validation rejects forged extra labels before executor upsert export | Pass |
| Latest downstream provider post-delivery next executor-ready trio can be reduced into another validated closure/follow-up routing contract | Pass |
| Latest downstream provider post-delivery N=7 routing CLI regression covers delivered-closed and repair-required branches | Pass |
| Latest downstream provider post-delivery N=7 direct builder rejects forged plan/reconciliation linkage | Pass |
| Latest downstream provider post-delivery N=7 routing contract can be exported as another executor-ready plan/receipt/reconciliation trio | Pass |
| Latest downstream provider post-delivery N=7 executor-ready trio regression covers no-op delivery, repair failed upsert, and malformed receipt clearing | Pass |
| Newest N=8 provider post-delivery routing contract can be exported as another executor-ready plan/receipt/reconciliation trio | Pass |
| Newest N=8 executor-ready trio CLI regression covers plan, receipt, and reconciliation render/validate on the repair failed-upsert branch | Pass |
| Newest N=8 executor-ready trio can be reduced into the next validated closure/follow-up routing contract | Pass |
| Newest next-routing CLI regression covers repair failed-upsert routing with depth-disambiguated labels | Pass |
| Newest N=9 provider post-delivery routing contract can be exported as another executor-ready plan/receipt/reconciliation trio | Pass |
| Newest N=9 executor-ready trio can be reduced into the next validated closure/follow-up routing contract | Pass |
| Newest N=10 routing CLI regression covers full source-chain render/validate on the repair failed-upsert path | Pass |
| Darwin follow-up review confirmed N=10 repair state/action and manual-triage item keys are depth-disambiguated | Pass |
| Newest N=10 closure/follow-up routing contract can be exported into another executor-ready plan/receipt/reconciliation trio | Pass |
| Newest N=10 executor-ready trio can be reduced into the next N=11 closure/follow-up routing contract | Pass |
| Newest N=11 closure/follow-up routing contract can be exported into another executor-ready plan/receipt/reconciliation trio | Pass |
| Newest N=11 executor-ready trio uses short internal module filenames while preserving public schema/CLI names, keeping Windows build emit paths valid | Pass |
| Newest N=11 executor-ready trio can be reduced into the N=12 closure/follow-up routing contract through a short internal module while preserving public schema/CLI names | Pass |
| Newest N=12 closure/follow-up routing contract can be exported into another executor-ready plan/receipt/reconciliation trio through short internal modules while preserving public schema/CLI names | Pass |
| Newest N=12 executor-ready trio can be reduced into the N=13 closure/follow-up routing contract through a short internal module while preserving public schema/CLI names | Pass |
| N=13 delivered manual-follow-up routing accepts trusted final delivery metadata even when preserved prior active context is empty | Pass |
| Newest N=13 closure/follow-up routing contract can be exported into another executor-ready plan/receipt/reconciliation trio through short internal modules while preserving public schema/CLI names | Pass |
| Newest N=13 executor-ready trio keeps trusted handoff / delivered-closed branches no-op and repair / receipt-triage branches deterministic while invalid receipts clear untrusted final delivery metadata | Pass |
| Newest N=13 executor-ready trio regression avoids recursive CLI timeout by keeping full source-chain CLI coverage on routing/plan and using direct contract tests for receipt/reconciliation branch semantics | Pass |
| Newest N=13 malformed receipt regression clears forged final delivery metadata and preserves manual receipt triage issue codes | Pass |
| Newest N=13 executor-ready trio can be reduced into the N=14 closure/follow-up routing contract through a short internal module while preserving public schema/CLI names | Pass |
| N=14 routing source validator verifies the full upstream source chain plus N=13 plan/receipt/reconciliation before deriving downstream state | Pass |
| N=14 routing branch regression covers artifact handoff, delivered closed, repair-required, receipt-triage, and forged source linkage | Pass |
| Newest N=14 closure/follow-up routing contract can be exported into another executor-ready plan/receipt/reconciliation trio through short internal modules while preserving public schema/CLI names | Pass |
| Newest N=14 executor-ready trio keeps trusted handoff / delivered-closed branches no-op and repair / receipt-triage branches deterministic while invalid receipts clear untrusted final delivery metadata | Pass |
| Newest N=14 executor-ready trio regression remains direct-contract scoped to avoid recursive CLI timeout while covering artifact no-op, delivered no-op, repair failed-upsert, and malformed receipt fail-closed semantics | Pass |
| N=14 receipt validator shape-guards missing/non-array operations before reconciliation so malformed receipts fail closed instead of throwing | Pass |
| Newest N=14 executor-ready trio can be reduced into the N=15 closure/follow-up routing contract through a short internal module while preserving public schema/CLI names | Pass |
| N=15 routing source validator verifies the full upstream source chain plus N=14 plan/receipt/reconciliation before deriving downstream state | Pass |
| N=15 routing direct regression covers artifact handoff, delivered closed, repair-required, receipt-triage, and forged source linkage | Pass |
| Newest N=15 closure/follow-up routing contract can be exported into another executor-ready plan/receipt/reconciliation trio through short internal modules while preserving public schema/CLI names | Pass |
| Newest N=15 executor-ready trio keeps trusted handoff / delivered-closed branches no-op and repair / receipt-triage branches deterministic while invalid receipts clear untrusted final delivery metadata | Pass |
| Newest N=15 executor-ready trio direct regression covers artifact no-op, delivered no-op, repair failed-upsert, malformed receipt fail-closed, and invalid-receipt metadata clearing | Pass |
| N=15 invalid receipt reconciliation clears artifact-handoff metadata after Confucius cold review | Pass |
| N=15 plan/receipt/reconciliation validate CLI paths return structured issues on malformed source chains | Pass |
| Newest N=15 executor-ready delivery trio can be reduced into the N=16 closure/follow-up routing contract through a short internal module while preserving public schema/CLI names | Pass |
| N=16 routing direct regression covers artifact handoff, delivered closed, repair-required, receipt-triage-required, and forged N15 source linkage branches | Pass |
| Newest N=16 closure/follow-up routing contract can be exported into another executor-ready plan/receipt/reconciliation trio through short internal modules while preserving public schema/CLI names | Pass |
| Newest N=16 executor-ready trio direct regression covers artifact no-op, delivered no-op, repair failed-upsert, malformed receipt fail-closed, and failed-upsert final-target clearing | Pass |
| N=16 plan/receipt/reconciliation render CLI paths return structured validation failures on malformed/null source chains | Pass |
| N=16 receipt validator shape-guards malformed operation entries before reconciliation | Pass |
| Newest N=16 executor-ready delivery trio can be reduced into the N=17 closure/follow-up routing contract through a short internal module while preserving public schema/CLI names | Pass |
| N=17 routing direct regression covers artifact handoff, delivered closed, repair-required, receipt-triage-required, and forged N16 source linkage branches | Pass |
| N=17 routing render/validate CLI paths return structured source validation failures on malformed/null source chains | Pass |
| Newest N=17 closure/follow-up routing contract can be exported into another executor-ready plan/receipt/reconciliation trio through short internal modules while preserving public schema/CLI names | Pass |
| Newest N=17 executor-ready trio keeps trusted handoff / delivered-closed branches no-op and repair / receipt-triage branches deterministic while invalid receipts clear untrusted final delivery metadata | Pass |
| N=17 plan/receipt/reconciliation render CLI paths return structured validation failures on malformed/null source chains | Pass |

## Real Provider Result

- Artifact: `content/units/math-g8-s1-linear-function-concept/review-artifact.zhipu-option-a-2026-04-23.json`
- Status: `blocked`
- Candidate patches: 6
- Semantic issue: `knowledge.edges[3].from_node_id` references missing node `lf_slope_meaning`
- Writeback performed: false

## Residual Risk

Scoped retry execution, retry-policy guidance, rerun-lineage metadata, orchestration guidance, human-queue routing, inbox-ready handoff payloads, stable inbox handoff export, executor-ready inbox delivery plan, delivery-plan validation, replay-safe operation keys, plan-validated delivery receipts, plan+receipt-validated reconciliation results, plan+reconciliation-validated follow-up routing, follow-up-validated executor-ready follow-up delivery plans, follow-up-plan-validated delivery receipts, and follow-up-plan-receipt-validated follow-up delivery reconciliation are now wired in for review-only runs. Follow-up rendering now fails closed if reconciliation input is malformed or inconsistent with its source plan, downstream follow-up plan/receipt CLI paths now also fail closed if upstream follow-up input is malformed, receipt-triage follow-up contracts no longer propagate an untrusted active inbox item into manual-triage summaries or labels, and blocked rerun artifacts can now export a provider execution request with explicit rerun scope and estimated provider call count. That provider execution request layer now also rejects unknown rerun-start roles and fail-closes in builder/validator code paths, not just CLI wrappers; the decision layer now revalidates contract-critical request fields and malformed reviewer/timestamp payloads instead of fail-open / crashing; approved requests can now be reduced into an authorized pending execution attempt contract without yet spending provider calls; those authorized attempts can now be reduced into a validated execution receipt that records either a result artifact or an execution failure; those receipts can now be reduced into a validated reconciliation/result summary that nulls untrusted downstream metadata whenever receipt validation fails; a Volta cold review recently closed one more P1 by forcing reconciliation summaries to preserve canonical `source_*_schema_version` literals instead of echoing malformed upstream schema strings; a Peirce cold review closed one more P2 by sanitizing `failure_code` before it becomes manual-triage label metadata; a Lovelace cold review closed one more P1/P2 pair by shape-guarding malformed reconciliation payloads and fail-closing direct builder bypass at the provider-execution-follow-up layer; a Plato cold review then closed one more P1/P2/P2 set by preserving trusted source-derived context on downstream receipt-triage branches, fail-closing downstream executor builders on malformed source payloads, and surfacing real receipt issue detail in triage summaries/labels; Darwin cold reviews closed malformed operation-status validation, latest-depth manual triage item-key/label disambiguation, latest malformed receipt triage reachability, latest executor trio branch coverage, and forged extra-label rejection for standalone receipt-triage validation; Beauvoir closed one N=13 P2 by allowing delivered manual-follow-up branches to trust final delivery metadata even when preserved prior active context is empty; Hooke closed one N=14 P2 by shape-guarding missing/non-array receipt operations before reconciliation; Confucius closed one N=15 P1/P2 pair by clearing invalid-receipt artifact handoff metadata and structured-guarding malformed N15 validation source chains; and Arendt closed two N=16 P2 gaps by making trio render source validation safe and shape-guarding malformed receipt operation entries. The current provider execution chain now extends through validated delivery plan, receipt, reconciliation, post-delivery closure/follow-up routing, repeated downstream post-delivery routing contracts, and repeated source-validated executor-ready delivery plan / receipt / reconciliation trios without pretending receipt metadata alone is enough to derive approval routing. The newest N=10 closure/follow-up routing contract now exports into another executor-ready plan / receipt / reconciliation trio with CLI render/validate regression coverage, that N=10 trio now reduces into the next N=11 closure/follow-up routing contract, that N=11 routing layer now exports into another executor-ready plan / receipt / reconciliation trio, that N=11 trio now reduces into the N=12 closure/follow-up routing contract through a short internal module, that N=12 routing now exports into another executor-ready plan / receipt / reconciliation trio through short internal modules, that N=12 trio now reduces into the N=13 closure/follow-up routing contract through a short internal module, that N=13 routing now exports into another executor-ready plan / receipt / reconciliation trio through short internal modules, that N=13 trio now reduces into the N=14 closure/follow-up routing contract through a short internal module, that N=14 routing now exports into another executor-ready plan / receipt / reconciliation trio through short internal modules, that N=14 trio now reduces into the N=15 closure/follow-up routing contract through a short internal module, that N=15 routing now exports into another executor-ready plan / receipt / reconciliation trio through short internal modules, that N=15 trio now reduces into the N=16 closure/follow-up routing contract through a short internal module, that N=16 routing now exports into another executor-ready plan / receipt / reconciliation trio through short internal modules, that N=16 trio now reduces into the N=17 closure/follow-up routing contract through a short internal module, and that N=17 routing now exports into another executor-ready plan / receipt / reconciliation trio through short internal modules. The next engineering target is reducing the N=17 executor-ready plan / receipt / reconciliation trio into the N=18 closure/follow-up routing contract.




