# Content Package Manifest Spec

Version: 2026-04-26
Status: Phase 0.7 / Phase 3 draft spec
Owner: content-pipeline / campus deployment / governance
Related docs:

- `docs/PROJECT_MASTER_PLAN_REBASE_2026-04-26.md`
- `docs/PROJECT_REBASE_EXISTING_WORK_AUDIT_2026-04-26.md`
- `docs/EXTERNAL_STANDARDS_ADAPTER_SPEC.md`
- `docs/UNIT_SPEC.md`
- `docs/VOICE_RUNTIME_SPIKE_SPEC.md`
- `docs/CURRICULUM_DESIGN_IMPORT_CONTRACT.md`

---

## 1. Purpose

This document defines the campus/offline content package manifest for AI-native curriculum units.

The manifest is a distribution contract, not an authoring source. It lets an approved `unit.yaml` and its approved assets be packaged for:

1. Campus intranet delivery.
2. Weak-network classroom operation.
3. Teacher-led offline fallback.
4. Reproducible package verification.
5. Later interoperability with external content ecosystems.

Core rule:

```text
Approved unit stays source of truth.
Content package is a reproducible projection.
```

---

## 2. Non-Goals

This spec does not:

1. Introduce Kolibri, H5P, Moodle, Canvas, Open edX, or another runtime dependency.
2. Define a production sync server.
3. Package real student data, student submissions, voice recordings, transcripts, memory, teacher private notes, or provider logs.
4. Allow package generation from a blocked review artifact.
5. Replace `AiNativeUnitSpec`.
6. Write back to `unit.yaml`.
7. Decide school deployment topology.
8. Import external project code.

---

## 3. Source And Output

### 3.1 Source

Allowed sources:

1. Approved `AiNativeUnitSpec`.
2. Approved synthetic or owned media assets.
3. Approved teacher guide artifacts.
4. Approved no-AI worksheet artifacts.
5. Approved runtime block JSON generated from `runtime_content`.

Blocked sources:

1. Real student data.
2. Real teacher/guardian notes.
3. Raw dialogue, raw voice, transcript, emotional/family data.
4. Raw provider prompt or model output.
5. Unknown-license assets.
6. Blocked or unapproved review artifacts.

### 3.2 Output

Output artifact:

```text
content_package_manifest.json
```

The manifest may point to packaged files, but the manifest itself must be safe to store, audit, and sync across campus infrastructure.

---

## 4. Manifest Shape

```ts
interface ContentPackageManifest {
  schema_version: "edu-ai-content-package-v0.1";
  manifest_id: string;
  package_type: "unit" | "course_collection" | "teacher_guide" | "student_workspace";
  package_version: string;
  generated_at: string;
  generated_by: "content-pipeline" | "manual-review-tool" | "campus-packager";
  source: ContentPackageSource;
  package_identity: ContentPackageIdentity;
  runtime_entrypoints: ContentPackageEntrypoint[];
  assets: ContentPackageAsset[];
  interactive_profiles: InteractiveBlockPackageProfile[];
  offline_policy: ContentPackageOfflinePolicy;
  privacy_manifest: ContentPackagePrivacyManifest;
  license_manifest: ContentPackageLicenseManifest;
  integrity: ContentPackageIntegrity;
  review: ContentPackageReviewStatus;
}
```

```ts
interface ContentPackageSource {
  unit_id: string;
  unit_schema_version: string;
  source_unit_hash: string;
  source_unit_path?: string;
  source_review_artifact_id?: string;
  source_trace_manifest_id: string;
}
```

```ts
interface ContentPackageIdentity {
  title: string;
  subject: string;
  grade: string;
  locale: "zh-CN";
  duration_minutes?: number;
  curriculum_standard_refs: string[];
  prerequisite_unit_ids: string[];
}
```

```ts
interface ContentPackageEntrypoint {
  entrypoint_id: string;
  entrypoint_type: "student_page" | "teacher_guide" | "no_ai_task" | "assessment" | "offline_fallback";
  page_id?: string;
  block_ids: string[];
  file_path: string;
  required_capabilities: Array<"static_read" | "interactive_runtime" | "voice_runtime" | "whiteboard_runtime" | "local_model" | "teacher_led">;
}
```

```ts
interface ContentPackageAsset {
  asset_id: string;
  asset_type:
    | "runtime_json"
    | "html"
    | "css"
    | "image"
    | "audio_synthetic"
    | "video_synthetic"
    | "worksheet_pdf"
    | "teacher_guide"
    | "rubric"
    | "source_trace";
  file_path: string;
  sha256: string;
  size_bytes: number;
  source_trace_ids: string[];
  license_id: string;
  contains_personal_data: false;
  generated_from_ai: boolean;
  ai_source_trace_required: boolean;
}
```

```ts
interface InteractiveBlockPackageProfile {
  block_id: string;
  page_id: string;
  block_type: string;
  interaction_family:
    | "static"
    | "choice"
    | "ordering"
    | "drag_drop"
    | "hotspot"
    | "branching"
    | "simulation"
    | "oral_explanation"
    | "reflection"
    | "portfolio";
  input_modes: Array<"text" | "voice" | "touch" | "keyboard" | "whiteboard" | "file_upload">;
  scoring_mode: "none" | "auto" | "human_review" | "hybrid";
  sandbox_required: boolean;
  offline_supported: boolean;
  fallback_entrypoint_id?: string;
}
```

```ts
interface ContentPackageOfflinePolicy {
  can_run_offline: boolean;
  fallback_mode: "static_only" | "teacher_led" | "local_runtime";
  requires_network_for: string[];
  offline_allowed_entrypoint_ids: string[];
  provider_unavailable_plan: string;
  teacher_runbook_path?: string;
}
```

```ts
interface ContentPackagePrivacyManifest {
  blocked_data_classes: Array<
    | "raw_dialogue"
    | "voice_audio"
    | "voice_transcript"
    | "emotion_or_personal"
    | "family_context"
    | "teacher_private_note"
    | "model_internal"
    | "provider_log"
    | "student_memory"
  >;
  export_scope: "public_content" | "campus_internal_content";
  privacy_filter_version: string;
  contains_real_student_data: false;
  contains_raw_provider_output: false;
  safe_for_student_device_cache: boolean;
  safe_for_teacher_device_cache: boolean;
}
```

```ts
interface ContentPackageLicenseManifest {
  licenses: Array<{
    license_id: string;
    license_type: "owned" | "school_provided" | "public_domain" | "cc_by" | "cc_by_sa" | "unknown_blocked";
    source_reference: string;
    attribution_required: boolean;
    attribution_text?: string;
  }>;
  package_license_status: "passed" | "blocked" | "needs_human_review";
}
```

```ts
interface ContentPackageIntegrity {
  manifest_hash: string;
  package_hash: string;
  total_size_bytes: number;
  file_count: number;
  reproducible_build_key: string;
}
```

```ts
interface ContentPackageReviewStatus {
  status: "draft" | "approved" | "blocked" | "needs_human_review";
  reviewer?: string;
  reviewed_at?: string;
  issues: Array<{
    issue_id: string;
    severity: "low" | "medium" | "high" | "blocking";
    message: string;
    repair_hint: string;
  }>;
}
```

---

## 5. Generation Flow

```text
approved unit.yaml
  -> schema validation
  -> semantic validation
  -> asset collection
  -> license scan
  -> privacy deny-list scan
  -> runtime entrypoint projection
  -> offline fallback projection
  -> checksum generation
  -> content_package_manifest.json
  -> package review artifact
```

Generation must fail closed if source validation, license scan, privacy scan, or checksum generation fails.

---

## 6. Required Package Contents

Every unit package must include:

1. `content_package_manifest.json`.
2. Student runtime entrypoints for approved pages.
3. Runtime block JSON derived from approved `runtime_content`.
4. Teacher guide or teacher runbook.
5. No-AI baseline task materials.
6. Assessment or capability certification rubric.
7. Source trace manifest.
8. Offline fallback plan.

Optional contents:

1. Synthetic images.
2. Synthetic audio.
3. Synthetic video.
4. Whiteboard action plan preview.
5. PBL issueboard template.
6. Voice script draft.

Optional contents still require license and privacy checks.

---

## 7. Privacy Rules

The package must never include:

1. Real student identifiers.
2. Real school/student submissions.
3. Raw student-Agent dialogue.
4. Raw voice audio.
5. Full voice transcript.
6. Emotional or family data.
7. Student memory snapshots.
8. Teacher private notes.
9. Provider prompts, raw model output, chain-of-thought, or hidden reasoning.
10. Review artifact patches unless explicitly approved as public content.

Teacher-safe summaries may be packaged only if they are generic course guidance, not live student projections.

---

## 8. Offline Degradation Rules

### 8.1 `static_only`

Allowed:

1. Read pages.
2. Complete no-AI worksheet.
3. Follow teacher guide.
4. Record local completion marker if backend unavailable.

Denied:

1. Live AI tutoring.
2. Cloud provider calls.
3. New mastery claims requiring online validation.

### 8.2 `teacher_led`

Allowed:

1. Teacher runs scenario and discussion.
2. Teacher uses whiteboard or printed material.
3. Students complete no-AI task.
4. Teacher later syncs safe class-level notes.

Denied:

1. Automated individualized intervention without backend.
2. Sensitive signal generation without privacy router.

### 8.3 `local_runtime`

Allowed:

1. Local static/interactive blocks.
2. Campus-local model only if separately approved.
3. Local privacy router.

Denied:

1. Cloud fallback for `campus_local_only` content.
2. Raw local logs containing student sensitive content.

---

## 9. Integrity And Versioning

Package identity must be stable across rebuilds.

Recommended reproducible build key:

```text
unit_id + unit_schema_version + source_unit_hash + asset_manifest_hash + packager_version
```

Rules:

1. Same source inputs should produce the same package hash.
2. Package version increments when source unit, assets, packager, or privacy filter changes.
3. Retired packages remain auditable but should not start new student sessions.
4. Package activation requires checksum verification.
5. Package sync logs must not include student payloads.

---

## 10. Failure Policy

| Failure | Policy |
| --- | --- |
| Source unit schema invalid | Block package |
| Semantic validation fails | Block package |
| Unknown license asset | Block package |
| Privacy deny-list hit | Block package |
| Asset checksum mismatch | Block activation |
| Missing optional enrichment | Degrade |
| Voice runtime unavailable | Use text/static/no-AI fallback |
| External sync unavailable | Keep prior approved package active |

No package generation failure may write back to `unit.yaml`.

---

## 11. Validation Plan

Future implementation should add:

1. Valid approved unit creates a manifest.
2. Blocked review artifact source cannot create a package.
3. Unknown-license asset blocks package.
4. Any `contains_personal_data = true` asset blocks package.
5. Raw dialogue or transcript key in package payload blocks package.
6. Missing no-AI fallback blocks pilot-ready package.
7. Checksum mismatch blocks activation.
8. Package manifest remains reproducible for same inputs.

Recommended commands once implemented:

```powershell
pnpm --filter @edu-ai/shared-types test
pnpm --filter @edu-ai/content-pipeline test
pnpm scan:project-health
```

---

## 12. Decision Gates

The following require user/human confirmation:

1. Connecting packages to a real school sync server.
2. Importing Kolibri, H5P, or LMS code.
3. Shipping real student data in any package.
4. Using unknown-license or restricted-license assets.
5. Enabling campus-local model runtime inside package execution.
6. Treating package manifest as source of truth.

---

## 13. Completion Criteria

This spec is complete when it defines:

1. Manifest shape.
2. Source and output boundaries.
3. Required package contents.
4. Privacy and license gates.
5. Offline degradation behavior.
6. Integrity/versioning rules.
7. Failure policy.
8. Validation plan.
9. Decision gates.

---

## 14. Lock Recommendation

This document is safe to use as the Phase 0.7 / Phase 3 content package entry spec.

The next implementation step should be shared-types schema plus a content-pipeline manifest builder using synthetic/sample units only.

