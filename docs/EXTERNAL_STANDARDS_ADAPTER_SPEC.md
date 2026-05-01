# External Standards Adapter Spec

Version: 2026-04-26  
Status: Phase 0.7 draft spec  
Owner: platform architecture / governance  
Related docs:

- `docs/PROJECT_MASTER_PLAN_REBASE_2026-04-26.md`
- `docs/PROJECT_REBASE_EXISTING_WORK_AUDIT_2026-04-26.md`
- `docs/UNIT_SPEC.md`
- `docs/REVIEW_AND_SELF_CHECK_PROCESS.md`
- `packages/shared-types/src/learning/learning-event.ts`
- `packages/shared-types/src/content/ai-native-unit.ts`
- `packages/shared-types/src/agent/agent-runtime-event.ts`

---

## 1. Purpose

This spec defines the Phase 0.7 external standards adapter layer for the AI-native education platform.

The adapter layer lets the platform interoperate with outside learning ecosystems and offline content distribution patterns without changing the internal source-of-truth model.

The external inspiration set is:

1. xAPI / LRS: exportable learning activity statements.
2. H5P / Lumi: standardized interactive content type thinking.
3. Kolibri: campus/offline content channel and content package distribution.
4. DeepTutor: runtime content should be executable as `Unit -> Page -> Block -> RuntimeEvent -> Evidence`.
5. OpenMAIC: classroom actions, voice, whiteboard, and PBL workflows may become content package assets or runtime actions.

The key architectural rule is:

```text
Internal source of truth stays internal.
External formats are projections, not primary models.
```

---

## 2. Non-Goals

This phase does not:

1. Introduce H5P runtime as a dependency.
2. Introduce Kolibri as a dependency.
3. Introduce Open edX, Moodle, Canvas, or another LMS as a dependency.
4. Send real student data to any external LRS.
5. Export raw student-Agent dialogue, emotional content, family information, teacher private notes, or model reasoning.
6. Replace `LearningEvent`, `AiNativeUnitSpec`, or `AgentRuntimeEvent`.
7. Import external project code.
8. Decide a production external provider or content distribution vendor.

This phase only designs the contracts and gates.

---

## 3. System Boundary

### 3.1 Internal Source Models

| Internal model | Role |
| --- | --- |
| `LearningEvent` | Learning behavior source of truth |
| `AiNativeUnitSpec` | Approved course content source of truth |
| `runtime_content.pages[].blocks[]` | Renderable student learning experience |
| `AgentRuntimeEvent` | Agent and runtime telemetry source |
| `MasteryRecord` / `MasteryHistory` | Derived learning state |
| `ConsentRecord` / `AuditLogEntry` | Governance source |

### 3.2 External Projection Models

| Projection | Purpose | Source |
| --- | --- | --- |
| `ExternalLearningStatement` | xAPI-like learning statement | Privacy-filtered `LearningEvent` |
| `ContentPackageManifest` | Campus/offline content package metadata | Approved `AiNativeUnitSpec` |
| `InteractiveBlockProfile` | H5P-compatible content type classification | `runtime_content.blocks[]` |
| `CampusContentChannelManifest` | School/campus distribution channel manifest | Collection of approved content packages |
| `ExportAuditRecord` | Auditable export trace | Export request + filtered projection result |

Projection models are read/export contracts. They cannot write back into source units or source events.

---

## 4. Privacy Classification

### 4.1 Export Classes

| Class | Meaning | Default export behavior |
| --- | --- | --- |
| `public_content` | Approved course text, synthetic examples, non-personal assets | Allowed |
| `academic_summary` | Aggregated mastery/progress without raw responses | Allowed with scope check |
| `student_owned_record` | A student's own filtered learning record | Allowed only to student/guardian flow with consent |
| `teacher_safe_signal` | Abstract class/student learning signal | Allowed to teacher role after projection |
| `admin_audit_summary` | Audit metadata without sensitive raw payload | Allowed to compliance/admin |
| `raw_dialogue` | Original student-Agent conversation text/audio/transcript | Blocked |
| `emotion_or_personal` | Emotional expression, family info, personal hardship | Blocked from export |
| `provider_internal` | Raw prompt, model output, chain-of-thought, provider traces | Blocked |
| `teacher_private` | Teacher private notes or internal judgment chain | Blocked unless explicit admin audit path |

### 4.2 Absolute Deny List

Export adapters must reject any payload containing keys or semantic equivalents of:

```text
raw_prompt
prompt_messages
raw_output
raw_response
chain_of_thought
thinking
internal_reasoning
student_message
student_response
conversation_text
conversation_excerpt
full_transcript
transcript
audio_url
audio_blob
emotion_text
emotion_detail
guardian_private_note
teacher_private_note
family_info
home_conflict
diagnosis
```

This deny list mirrors the project direction already enforced by `AgentRuntimeEventSchema` and should be reused by the implementation rather than re-created ad hoc.

---

## 5. Adapter 1: xAPI-Like Learning Statement

### 5.1 Purpose

The xAPI-like adapter allows future export to a Learning Record Store or research/analytics environment while preserving internal event-sourcing boundaries.

Internal model remains:

```text
LearningEvent
```

External projection is:

```text
ExternalLearningStatement
```

### 5.2 Contract Shape

```ts
interface ExternalLearningStatement {
  statement_id: string;
  schema_version: "edu-ai-xapi-like-v0.1";
  source_event_id: string;
  actor: {
    actor_type: "student";
    pseudonymous_id: string;
    tenant_id?: string;
    school_id?: string;
  };
  verb: {
    id: string;
    display_zh: string;
  };
  object: {
    object_type: "unit" | "knowledge_node" | "assessment_item" | "runtime_block" | "intervention";
    object_id: string;
    display_name?: string;
  };
  context: {
    unit_id?: string;
    knowledge_node_ids: string[];
    session_id?: string;
    platform: "edu_ai_platform";
    privacy_filter_version: string;
  };
  result?: {
    completion?: boolean;
    success?: boolean;
    score_scaled?: number;
    duration_seconds?: number;
    confidence_score?: number;
    safe_summary?: string;
  };
  occurred_at: string;
  exported_at: string;
  export_scope: "student_owned_record" | "teacher_safe_signal" | "admin_audit_summary" | "research_anonymized";
}
```

### 5.3 Verb Mapping

| `LearningEvent.event_type` intent | External verb |
| --- | --- |
| Conversation turn | `interacted` |
| Exercise attempt | `attempted` |
| Unit progress | `progressed` |
| Help request | `requested_help` |
| Intervention | `received_intervention` |
| Reflection | `reflected` |
| No-AI baseline completion | `completed_independently` |
| Transfer challenge | `transferred_understanding` |
| Oral explanation | `explained_orally` |

If the internal enum does not yet distinguish no-AI, transfer, or oral-explanation events, the adapter should not invent raw event types. It may map through safe `payload` metadata only after schema support exists.

### 5.4 Required Redaction

The adapter must:

1. Replace real student identifiers with pseudonymous IDs.
2. Drop raw `student_answer` unless export scope is explicitly `student_owned_record` and consent allows it.
3. Drop raw dialogue, transcript, audio, emotional text, family context, and model traces.
4. Convert sensitive payloads into safe summaries or no result field.
5. Record `privacy_filter_version`.
6. Produce an audit record for every export batch.

### 5.5 Example

```json
{
  "statement_id": "stmt_20260426_0001",
  "schema_version": "edu-ai-xapi-like-v0.1",
  "source_event_id": "evt_demo_001",
  "actor": {
    "actor_type": "student",
    "pseudonymous_id": "stu_tok_9f3a"
  },
  "verb": {
    "id": "https://edu-ai.example/verbs/interacted",
    "display_zh": "完成了一次学习互动"
  },
  "object": {
    "object_type": "knowledge_node",
    "object_id": "lf_slope_meaning",
    "display_name": "斜率 k 的意义"
  },
  "context": {
    "unit_id": "math_g8_linear_function_intro",
    "knowledge_node_ids": ["lf_slope_meaning"],
    "session_id": "sess_synthetic_001",
    "platform": "edu_ai_platform",
    "privacy_filter_version": "privacy_export_v0.1"
  },
  "result": {
    "duration_seconds": 180,
    "confidence_score": 0.76,
    "safe_summary": "学生完成一次关于斜率方向的导师式互动。"
  },
  "occurred_at": "2026-04-26T10:00:00.000Z",
  "exported_at": "2026-04-26T10:05:00.000Z",
  "export_scope": "student_owned_record"
}
```

---

## 6. Adapter 2: Content Package Manifest

### 6.1 Purpose

The content package manifest supports campus intranet and offline-first delivery without adopting a heavy external LMS.

The package is a distribution artifact. It is not the authoring source.

Source:

```text
approved AiNativeUnitSpec
```

Output:

```text
ContentPackageManifest
```

### 6.2 Contract Shape

```ts
interface ContentPackageManifest {
  manifest_id: string;
  schema_version: "edu-ai-content-package-v0.1";
  package_type: "unit" | "course_collection" | "teacher_guide" | "student_workspace";
  unit_id: string;
  unit_schema_version: string;
  title: string;
  subject: string;
  grade: string;
  package_version: string;
  generated_at: string;
  source_unit_hash: string;
  package_hash: string;
  locale: "zh-CN";
  offline_policy: {
    can_run_offline: boolean;
    requires_network_for: string[];
    fallback_mode: "static_only" | "local_runtime" | "teacher_led";
  };
  assets: ContentPackageAsset[];
  pages: ContentPackagePage[];
  blocked_data_classes: string[];
  privacy_notes: string[];
  review_status: "draft" | "approved" | "blocked";
}
```

```ts
interface ContentPackageAsset {
  asset_id: string;
  asset_type: "html" | "json" | "image" | "audio_synthetic" | "video_synthetic" | "worksheet_pdf" | "teacher_guide";
  path: string;
  sha256: string;
  size_bytes: number;
  license: "owned" | "school_provided" | "public_domain" | "cc_by" | "unknown_blocked";
  contains_personal_data: boolean;
}
```

```ts
interface ContentPackagePage {
  page_id: string;
  title: string;
  block_ids: string[];
  required_capabilities: string[];
}
```

### 6.3 Package Rules

1. Packages may include approved curriculum content, synthetic examples, static media, worksheets, teacher guides, rubrics, and runtime block JSON.
2. Packages must not include real student data.
3. Packages must not include raw provider prompts or model outputs.
4. Packages must not include unknown-license assets.
5. Packages must include checksums for every file.
6. Packages must include `source_unit_hash` so changes are auditable.
7. Packages must be reproducible from the same approved unit and asset set.

### 6.4 Offline Degradation Modes

| Mode | Meaning |
| --- | --- |
| `static_only` | Student can read pages, use worksheets, and complete no-AI tasks. No dynamic AI. |
| `local_runtime` | Campus local runtime can serve selected interactive blocks and local model routes. |
| `teacher_led` | Teacher can run the class using guide, slides, worksheets, and discussion prompts without live AI. |

Every pilot-ready unit must declare one fallback mode.

---

## 7. Adapter 3: H5P-Compatible Interactive Block Profile

### 7.1 Purpose

The platform should borrow H5P's interaction taxonomy without taking H5P runtime as a hard dependency.

This adapter classifies internal runtime blocks into stable interaction profiles.

### 7.2 Profile Contract

```ts
interface InteractiveBlockProfile {
  profile_id: string;
  schema_version: "edu-ai-interactive-profile-v0.1";
  source_block_id: string;
  internal_block_type: string;
  interaction_family:
    | "choice"
    | "ordering"
    | "drag_drop"
    | "hotspot"
    | "branching"
    | "simulation"
    | "oral_explanation"
    | "reflection"
    | "portfolio";
  input_mode: Array<"text" | "voice" | "touch" | "keyboard" | "whiteboard" | "file_upload">;
  scoring_mode: "none" | "auto" | "human_review" | "hybrid";
  no_ai_required: boolean;
  evidence_output: string[];
  sandbox_required: boolean;
}
```

### 7.3 Internal Block Mapping

| Internal `UnitBlock.type` | Profile family |
| --- | --- |
| `quiz` | `choice` or `reflection` depending on payload |
| `flash_cards` | `choice` |
| `concept_graph` | `simulation` or `hotspot` |
| `figure` | `hotspot` |
| `interactive` | `simulation`, `drag_drop`, or `branching` |
| `animation` | `simulation` |
| `timeline` | `ordering` |
| `practice` | `choice`, `reflection`, or `oral_explanation` |
| `reflection` | `reflection` |
| `code` | `simulation` with sandbox |
| Future `voice_dialogue` | `oral_explanation` or `branching` |
| Future `pbl_issueboard` | `portfolio` or `branching` |

The adapter must fail closed when payload shape is insufficient to determine a safe profile.

---

## 8. Adapter 4: Campus Content Channel

### 8.1 Purpose

Campus deployment should support weak-network and intranet-first operation.

The campus content channel is a manifest of approved content packages available to a school or tenant.

### 8.2 Contract Shape

```ts
interface CampusContentChannelManifest {
  channel_id: string;
  schema_version: "edu-ai-campus-channel-v0.1";
  tenant_id: string;
  school_id: string;
  channel_version: string;
  generated_at: string;
  packages: Array<{
    manifest_id: string;
    unit_id: string;
    package_version: string;
    package_hash: string;
    required_for_grade: string;
    sync_status: "pending" | "available" | "retired";
  }>;
  sync_policy: {
    allow_background_sync: boolean;
    max_package_size_mb: number;
    verify_checksum_before_activate: boolean;
  };
}
```

### 8.3 Channel Rules

1. Channel manifests list approved content only.
2. A package must pass checksum validation before activation.
3. Retired packages stay addressable for audit, but new sessions should not start from them.
4. A school may pin a channel version during a pilot window.
5. Channel sync logs must not contain student payloads.

---

## 9. Export Workflow

All external exports follow this flow:

```text
ExportRequest
  -> requester auth
  -> object-level authorization
  -> consent/scope check
  -> source model read
  -> projection builder
  -> privacy filter
  -> deny-list scanner
  -> schema validation
  -> audit record
  -> export artifact
```

### 9.1 Failure Policy

| Failure | Policy |
| --- | --- |
| Unknown export scope | Fail closed |
| Missing consent | Fail closed |
| Deny-list key detected | Fail closed |
| Unknown license asset | Fail closed |
| Checksum mismatch | Fail closed |
| Optional enrichment unavailable | Degrade |
| External LRS unavailable | Retry bounded, then queue or fail |

### 9.2 Idempotency

Export jobs must use stable idempotency keys:

```text
export_scope + source_object_id + source_version + privacy_filter_version + requester_id
```

Retries must not create duplicate audit records without linking to the original export attempt.

---

## 10. Audit Requirements

Every export batch must produce an audit record with:

1. Requester role and ID.
2. Tenant/school scope.
3. Export scope.
4. Source object IDs.
5. Source version or hash.
6. Privacy filter version.
7. Deny-list scan result.
8. Output artifact hash.
9. Result status.
10. Reason code if blocked.

Audit records must avoid raw exported sensitive content.

---

## 11. Validation Plan

### 11.1 Static Contract Tests

Future implementation should add tests for:

1. Valid `LearningEvent` maps to `ExternalLearningStatement`.
2. Raw dialogue payload fails export.
3. Emotional payload fails export.
4. Teacher private note fails export.
5. Approved `unit.yaml` maps to `ContentPackageManifest`.
6. Unknown-license asset blocks package.
7. Interactive block profile fails closed when block payload is ambiguous.
8. Content package checksum mismatch blocks activation.

### 11.2 Semantic Tests

1. Exported statements must not include raw student text unless allowed by `student_owned_record`.
2. Teacher scope cannot export student-owned raw records.
3. Guardian scope cannot export peer comparison.
4. Research scope must be anonymized.
5. Content packages must never include live student/session data.
6. H5P-compatible profiles cannot imply a runtime capability not declared by the block sandbox.

### 11.3 Manual Review

Before lock:

1. Run `pnpm scan:project-health`.
2. Add schema tests once implementation starts.
3. Perform a privacy review using `owasp-education-privacy-review`.
4. Perform an architecture review using `system-design-primer-review`.
5. Confirm no external code was imported.

---

## 12. Future Implementation Plan

Suggested files for a later implementation phase:

```text
packages/shared-types/src/external/external-learning-statement.ts
packages/shared-types/src/external/content-package-manifest.ts
packages/shared-types/src/external/interactive-block-profile.ts
packages/shared-types/src/external/campus-content-channel.ts
packages/shared-types/tests/external-standards.spec.ts
apps/content-pipeline/src/export/content-package.ts
apps/backend/src/routes/export-learning-statements.ts
```

This spec does not require creating those files yet.

---

## 13. Decision Gates

The following require user/human confirmation:

1. Connecting to a real external LRS.
2. Importing H5P runtime or Kolibri code.
3. Using any AGPL or unknown-license code.
4. Exporting real student data.
5. Exporting audio or transcript data.
6. Allowing aggregator providers to process export payloads.
7. Changing internal source models to match an external standard.

---

## 14. Completion Criteria For Phase 0.7 Spec

This spec is complete when:

1. It defines xAPI-like projection without replacing `LearningEvent`.
2. It defines content package manifest without replacing `AiNativeUnitSpec`.
3. It defines H5P-compatible interaction taxonomy without importing H5P runtime.
4. It defines campus content channel without importing Kolibri.
5. It defines privacy deny-list and export classes.
6. It defines audit requirements.
7. It defines validation and future implementation plan.
8. `pnpm scan:project-health` passes after the document is added.

---

## 15. Lock Recommendation

This document is safe to use as the Phase 0.7 entry spec.

It should not trigger code changes until the next implementation step explicitly creates shared-types schemas and adapter tests.

