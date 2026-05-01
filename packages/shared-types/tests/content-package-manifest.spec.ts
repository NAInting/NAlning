import { describe, expect, it } from "vitest";

import {
  ContentPackageManifestSchema,
  type ContentPackageManifest,
  type UnitSourceTrace
} from "../src";

const hash = "a".repeat(64);

const sourceTrace: UnitSourceTrace = {
  source_id: "runtime-content-block-spec-draft",
  source_type: "agent_output",
  reference: "Synthetic package manifest fixture.",
  retrieved_at: "2026-04-26T15:00:00.000Z"
};

function buildManifest(): ContentPackageManifest {
  return {
    schema_version: "edu-ai-content-package-v0.1",
    identity: {
      package_id: "pkg_math_g8_linear_function_intro_v0_1_0",
      package_type: "offline_campus_package",
      package_version: "0.1.0",
      unit_id: "math_g8_linear_function_intro",
      generated_at: "2026-04-26T15:00:00.000Z",
      generated_by: "content_pipeline",
      packager_version: "content-package-builder-v0.1"
    },
    source: {
      source_unit_id: "math_g8_linear_function_intro",
      source_unit_path: "content/units/math-g8-s1-linear-function-concept/unit.yaml",
      source_trace: [sourceTrace]
    },
    runtime_entrypoints: [
      {
        entrypoint_id: "entry_page_slope_first_look",
        entrypoint_type: "student_page",
        page_id: "page_slope_first_look",
        block_ids: ["block_slope_direction_prompt"],
        file_path: "runtime/pages/page_slope_first_look.json",
        required_capabilities: ["static_read"]
      },
      {
        entrypoint_id: "entry_no_ai_task",
        entrypoint_type: "no_ai_task",
        block_ids: [],
        file_path: "assessment/no-ai-task.json",
        required_capabilities: ["static_read", "teacher_led"]
      },
      {
        entrypoint_id: "entry_assessment",
        entrypoint_type: "assessment",
        block_ids: ["block_slope_direction_prompt"],
        file_path: "assessment/assessment-items.json",
        required_capabilities: ["static_read"]
      },
      {
        entrypoint_id: "entry_teacher_led_fallback",
        entrypoint_type: "offline_fallback",
        block_ids: [],
        file_path: "teacher/offline-runbook.md",
        required_capabilities: ["teacher_led"]
      }
    ],
    assets: [
      {
        asset_id: "asset_no_ai_task",
        asset_type: "no_ai_task",
        file_path: "assessment/no-ai-task.json",
        sha256: hash,
        byte_size: 128,
        source_trace_ids: ["runtime-content-block-spec-draft"],
        contains_personal_data: false,
        license_ref: "license_project_owned"
      },
      {
        asset_id: "asset_assessment",
        asset_type: "assessment",
        file_path: "assessment/assessment-items.json",
        sha256: hash,
        byte_size: 128,
        source_trace_ids: ["runtime-content-block-spec-draft"],
        contains_personal_data: false,
        license_ref: "license_project_owned"
      },
      {
        asset_id: "asset_page_slope_first_look",
        asset_type: "runtime_json",
        file_path: "runtime/pages/page_slope_first_look.json",
        sha256: hash,
        byte_size: 128,
        related_page_id: "page_slope_first_look",
        source_trace_ids: ["runtime-content-block-spec-draft"],
        contains_personal_data: false,
        license_ref: "license_project_owned"
      },
      {
        asset_id: "asset_teacher_offline_runbook",
        asset_type: "teacher_guide",
        file_path: "teacher/offline-runbook.md",
        sha256: hash,
        byte_size: 128,
        source_trace_ids: ["runtime-content-block-spec-draft"],
        contains_personal_data: false,
        license_ref: "license_project_owned"
      }
    ],
    interactive_blocks: [
      {
        page_id: "page_slope_first_look",
        block_id: "block_slope_direction_prompt",
        block_type: "callout",
        interaction_family: "static_read",
        input_modes: ["none"],
        scoring_mode: "none",
        sandbox_required: false,
        offline_supported: true,
        fallback_entrypoint_id: "entry_teacher_led_fallback",
        teacher_visible_signal_fields: []
      }
    ],
    offline_policy: {
      can_run_offline: true,
      fallback_mode: "teacher_led",
      offline_allowed_entrypoint_ids: [
        "entry_page_slope_first_look",
        "entry_no_ai_task",
        "entry_assessment",
        "entry_teacher_led_fallback"
      ],
      requires_network_for: ["live_ai_tutoring", "cloud_provider_calls", "speech_to_text", "text_to_speech"]
    },
    privacy_manifest: {
      contains_real_student_data: false,
      contains_raw_provider_output: false,
      export_scope: "campus_internal_content",
      privacy_filter_version: "content-package-privacy-filter-v0.1",
      blocked_data_classes: [
        "real_student_profile",
        "raw_dialogue",
        "voice_audio",
        "voice_transcript",
        "emotion_or_personal",
        "family_context",
        "teacher_private_note",
        "student_memory",
        "provider_log",
        "model_internal"
      ],
      allowed_runtime_event_domains: ["content", "academic", "runtime", "system"],
      safe_for_student_device_cache: false,
      safe_for_teacher_device_cache: true,
      retention_note: "Content packages contain generated course content only and no real student data."
    },
    license_manifest: {
      package_license_status: "passed",
      license_entries: [
        {
          license_ref: "license_project_owned",
          license_type: "project_owned",
          review_note: "Synthetic package fixture uses project-owned generated content."
        }
      ]
    },
    integrity: {
      build_input_hash: hash,
      asset_index_hash: hash
    },
    review: {
      status: "draft",
      issues: []
    }
  };
}

describe("content package manifest schema", () => {
  it("accepts a synthetic offline package manifest", () => {
    expect(ContentPackageManifestSchema.safeParse(buildManifest()).success).toBe(true);
  });

  it("rejects assets that claim to contain personal data", () => {
    const manifest = buildManifest();
    manifest.assets[0] = {
      ...manifest.assets[0]!,
      contains_personal_data: true as false
    };

    expect(ContentPackageManifestSchema.safeParse(manifest).success).toBe(false);
  });

  it("rejects assets without license references", () => {
    const manifest = buildManifest();
    const assetWithoutLicense = { ...manifest.assets[0]! } as Record<string, unknown>;
    delete assetWithoutLicense.license_ref;
    manifest.assets[0] = assetWithoutLicense as ContentPackageManifest["assets"][number];

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join("."))).toContain("assets.0.license_ref");
    }
  });

  it("rejects assets whose file path points to privacy-sensitive payloads", () => {
    const manifest = buildManifest();
    manifest.assets[0] = {
      ...manifest.assets[0]!,
      file_path: "logs/provider-log.json"
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package asset file_path cannot point to privacy-sensitive package payload: logs/provider-log.json"
      );
    }
  });

  it("rejects asset file paths that hide raw voice payloads with camelCase names", () => {
    const manifest = buildManifest();
    manifest.assets[0] = {
      ...manifest.assets[0]!,
      file_path: "runtime/studentRawAudio.json"
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package asset file_path cannot point to privacy-sensitive package payload: runtime/studentRawAudio.json"
      );
    }
  });

  it("rejects asset file paths that hide raw voice payloads with Chinese names", () => {
    const manifest = buildManifest();
    manifest.assets[0] = {
      ...manifest.assets[0]!,
      file_path: "runtime/\u539f\u59cb\u97f3\u9891.json"
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package asset file_path cannot point to privacy-sensitive package payload: runtime/\u539f\u59cb\u97f3\u9891.json"
      );
    }
  });

  it("rejects source unit paths that escape the repository root", () => {
    const manifest = buildManifest();
    manifest.source.source_unit_path = "../private/unit.yaml";

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package source_unit_path must be repository-relative and cannot escape source root: ../private/unit.yaml"
      );
    }
  });

  it("rejects source unit paths that use local absolute paths", () => {
    const manifest = buildManifest();
    manifest.source.source_unit_path = "C:\\Users\\User\\Desktop\\student-data\\unit.yaml";

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package source_unit_path must be repository-relative and cannot escape source root: C:\\Users\\User\\Desktop\\student-data\\unit.yaml"
      );
    }
  });

  it("rejects source unit paths outside approved UnitSpec YAML roots", () => {
    const manifest = buildManifest();
    manifest.source.source_unit_path = "docs/unit-runtime-contract.json";

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package source_unit_path must point to an approved UnitSpec YAML under content/units/: docs/unit-runtime-contract.json"
      );
    }
  });

  it("rejects source unit paths that hide privacy-sensitive source payloads", () => {
    const manifest = buildManifest();
    manifest.source.source_unit_path = "content/studentRawAudio/unit.yaml";

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package source_unit_path cannot point to privacy-sensitive source payload: content/studentRawAudio/unit.yaml"
      );
    }
  });

  it("rejects source unit paths that hide Chinese raw transcript payloads", () => {
    const manifest = buildManifest();
    manifest.source.source_unit_path = "content/\u5b66\u751f\u8bed\u97f3\u8f6c\u5199/unit.yaml";

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package source_unit_path cannot point to privacy-sensitive source payload: content/\u5b66\u751f\u8bed\u97f3\u8f6c\u5199/unit.yaml"
      );
    }
  });

  it("rejects source trace references that include raw provider output", () => {
    const manifest = buildManifest();
    manifest.source.source_trace[0] = {
      ...manifest.source.source_trace[0]!,
      reference: "Synthetic fixture derived from raw provider output and provider prompt."
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package source_trace.reference cannot include raw provider output, raw student content, voice transcripts, emotion details, or family context"
      );
    }
  });

  it("rejects source trace references that include student or voice raw content", () => {
    const manifest = buildManifest();
    manifest.source.source_trace[0] = {
      ...manifest.source.source_trace[0]!,
      reference: "Synthetic fixture derived from student's exact answer and voice transcript."
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package source_trace.reference cannot include raw provider output, raw student content, voice transcripts, emotion details, or family context"
      );
    }
  });

  it("rejects entrypoint file paths that escape the package root", () => {
    const manifest = buildManifest();
    manifest.runtime_entrypoints[0] = {
      ...manifest.runtime_entrypoints[0]!,
      file_path: "../runtime/pages/page_slope_first_look.json"
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package file_path must be package-relative and cannot escape package root: ../runtime/pages/page_slope_first_look.json"
      );
    }
  });

  it("rejects entrypoint file paths that point to privacy-sensitive payloads", () => {
    const manifest = buildManifest();
    manifest.runtime_entrypoints[0] = {
      ...manifest.runtime_entrypoints[0]!,
      file_path: "runtime/raw-transcript.json"
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package entrypoint file_path cannot point to privacy-sensitive package payload: runtime/raw-transcript.json"
      );
    }
  });

  it("rejects entrypoint file paths that hide voice transcripts with camelCase names", () => {
    const manifest = buildManifest();
    manifest.runtime_entrypoints[0] = {
      ...manifest.runtime_entrypoints[0]!,
      file_path: "runtime/teacherVoiceTranscriptField.json"
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package entrypoint file_path cannot point to privacy-sensitive package payload: runtime/teacherVoiceTranscriptField.json"
      );
    }
  });

  it("rejects entrypoint file paths without a matching packaged asset", () => {
    const manifest = buildManifest();
    manifest.runtime_entrypoints[0] = {
      ...manifest.runtime_entrypoints[0]!,
      file_path: "runtime/pages/missing-page.json"
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Runtime entrypoint file_path must be backed by a packaged asset: runtime/pages/missing-page.json"
      );
    }
  });

  it("rejects asset file paths that use external URL schemes", () => {
    const manifest = buildManifest();
    manifest.assets[0] = {
      ...manifest.assets[0]!,
      file_path: "https://cdn.example.invalid/no-ai-task.json"
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package file_path must be package-relative and cannot escape package root: https://cdn.example.invalid/no-ai-task.json"
      );
    }
  });

  it("rejects passed license status when an unknown license is present", () => {
    const manifest = buildManifest();
    manifest.license_manifest.license_entries[0] = {
      ...manifest.license_manifest.license_entries[0]!,
      license_type: "unknown_blocked"
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content packages with unknown_blocked licenses cannot have passed license status"
      );
    }
  });

  it("rejects license review notes that include raw provider output", () => {
    const manifest = buildManifest();
    manifest.license_manifest.license_entries[0] = {
      ...manifest.license_manifest.license_entries[0]!,
      review_note: "License review copied the raw provider output for later inspection."
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package license review_note cannot include raw provider output, raw student content, voice transcripts, emotion details, or family context"
      );
    }
  });

  it("rejects license attribution that includes raw student or voice content", () => {
    const manifest = buildManifest();
    manifest.license_manifest.license_entries[0] = {
      ...manifest.license_manifest.license_entries[0]!,
      attribution: "Attribution derived from student's exact answer and voice transcript."
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package license attribution cannot include raw provider output, raw student content, voice transcripts, emotion details, or family context"
      );
    }
  });

  it("rejects license source URIs that include raw provider output or voice transcript provenance", () => {
    const manifest = buildManifest();
    manifest.license_manifest.license_entries[0] = {
      ...manifest.license_manifest.license_entries[0]!,
      source_uri: "https://example.invalid/raw-provider-output/voice-transcript"
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package license source_uri cannot include raw provider output, raw student content, voice transcripts, emotion details, or family context"
      );
    }
  });

  it("rejects review issue messages that include raw provider output", () => {
    const manifest = buildManifest();
    manifest.review.issues = [
      {
        issue_id: "issue_raw_provider_output",
        severity: "medium",
        status: "open",
        message: "Reviewer copied raw provider output into this issue for debugging.",
        repair_hint: "Regenerate the package from approved source content."
      }
    ];

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package review issue message cannot include raw provider output, raw student content, voice transcripts, emotion details, or family context"
      );
    }
  });

  it("rejects review issue repair hints that include voice transcripts", () => {
    const manifest = buildManifest();
    manifest.review.issues = [
      {
        issue_id: "issue_voice_transcript_hint",
        severity: "medium",
        status: "open",
        message: "Review issue text stays sanitized.",
        repair_hint: "Regenerate after removing the voice transcript and audio recording."
      }
    ];

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package review issue repair_hint cannot include raw provider output, raw student content, voice transcripts, emotion details, or family context"
      );
    }
  });

  it("rejects approved packages unless the license gate passed", () => {
    const manifest = buildManifest();
    manifest.review.status = "approved";
    manifest.license_manifest.package_license_status = "needs_review";

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "approved content packages require passed license status"
      );
    }
  });

  it("rejects approved packages without human review audit metadata", () => {
    const manifest = buildManifest();
    manifest.review.status = "approved";

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toEqual(
        expect.arrayContaining([
          "approved content packages require reviewed_by audit metadata",
          "approved content packages require reviewed_at audit metadata"
        ])
      );
    }
  });

  it("accepts approved packages with passed license gate and human review audit metadata", () => {
    const manifest = buildManifest();
    manifest.review = {
      status: "approved",
      reviewed_by: "human_reviewer_001",
      reviewed_at: "2026-04-26T16:00:00.000Z",
      issues: []
    };

    expect(ContentPackageManifestSchema.safeParse(manifest).success).toBe(true);
  });

  it("rejects offline packages without valid offline entrypoints", () => {
    const manifest = buildManifest();
    manifest.offline_policy.offline_allowed_entrypoint_ids = ["missing_entrypoint"];

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain("Unknown offline entrypoint id: missing_entrypoint");
    }
  });

  it("rejects offline-allowed entrypoints that require voice runtime", () => {
    const manifest = buildManifest();
    manifest.runtime_entrypoints[0] = {
      ...manifest.runtime_entrypoints[0]!,
      required_capabilities: [...manifest.runtime_entrypoints[0]!.required_capabilities, "voice_runtime"]
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Offline-allowed entrypoint entry_page_slope_first_look cannot require network-bound capability voice_runtime"
      );
    }
  });

  it("rejects offline-allowed entrypoints that require external LRS sync", () => {
    const manifest = buildManifest();
    manifest.runtime_entrypoints[2] = {
      ...manifest.runtime_entrypoints[2]!,
      required_capabilities: [...manifest.runtime_entrypoints[2]!.required_capabilities, "external_lrs_sync"]
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Offline-allowed entrypoint entry_assessment cannot require network-bound capability external_lrs_sync"
      );
    }
  });

  it("rejects offline campus packages that cannot run offline", () => {
    const manifest = buildManifest();
    manifest.offline_policy.can_run_offline = false;

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "offline_campus_package must set offline_policy.can_run_offline=true"
      );
    }
  });

  it("rejects offline campus packages without a concrete fallback mode", () => {
    const manifest = buildManifest();
    manifest.offline_policy.fallback_mode = "none";

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "offline_campus_package must define a non-none fallback_mode"
      );
    }
  });

  it("rejects offline campus packages without an offline-allowed no-AI task entrypoint", () => {
    const manifest = buildManifest();
    manifest.offline_policy.offline_allowed_entrypoint_ids = manifest.offline_policy.offline_allowed_entrypoint_ids.filter(
      (entrypointId) => entrypointId !== "entry_no_ai_task"
    );

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "offline_campus_package must include an offline-allowed no_ai_task entrypoint"
      );
    }
  });

  it("rejects offline campus packages without an offline-allowed fallback entrypoint", () => {
    const manifest = buildManifest();
    manifest.offline_policy.offline_allowed_entrypoint_ids = manifest.offline_policy.offline_allowed_entrypoint_ids.filter(
      (entrypointId) => entrypointId !== "entry_teacher_led_fallback"
    );

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "offline_campus_package must include an offline-allowed offline_fallback entrypoint"
      );
    }
  });

  it("rejects runtime entrypoints that reference missing interactive blocks", () => {
    const manifest = buildManifest();
    manifest.runtime_entrypoints[0] = {
      ...manifest.runtime_entrypoints[0]!,
      block_ids: ["missing_block"]
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain("Unknown runtime entrypoint block_id: missing_block");
    }
  });

  it("rejects interactive blocks with missing fallback entrypoints", () => {
    const manifest = buildManifest();
    manifest.interactive_blocks[0] = {
      ...manifest.interactive_blocks[0]!,
      fallback_entrypoint_id: "missing_entrypoint"
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Unknown interactive block fallback_entrypoint_id: missing_entrypoint"
      );
    }
  });

  it("rejects offline-unsupported blocks without a fallback entrypoint", () => {
    const manifest = buildManifest();
    manifest.interactive_blocks[0] = {
      ...manifest.interactive_blocks[0]!,
      offline_supported: false
    };
    delete manifest.interactive_blocks[0].fallback_entrypoint_id;

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Offline campus block block_slope_direction_prompt must define fallback_entrypoint_id when offline_supported=false"
      );
    }
  });

  it("rejects offline-unsupported blocks whose fallback is not offline-allowed", () => {
    const manifest = buildManifest();
    manifest.interactive_blocks[0] = {
      ...manifest.interactive_blocks[0]!,
      offline_supported: false,
      fallback_entrypoint_id: "entry_assessment"
    };
    manifest.offline_policy.offline_allowed_entrypoint_ids = manifest.offline_policy.offline_allowed_entrypoint_ids.filter(
      (entrypointId) => entrypointId !== "entry_assessment"
    );

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Offline campus block block_slope_direction_prompt fallback_entrypoint_id must be offline-allowed"
      );
    }
  });

  it("rejects privacy manifests that do not explicitly block raw voice audio", () => {
    const manifest = buildManifest();
    manifest.privacy_manifest.blocked_data_classes = manifest.privacy_manifest.blocked_data_classes.filter(
      (dataClass) => dataClass !== "voice_audio"
    );

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain("Content packages must explicitly block voice_audio");
    }
  });

  it("rejects privacy manifests that do not explicitly block teacher private notes", () => {
    const manifest = buildManifest();
    manifest.privacy_manifest.blocked_data_classes = manifest.privacy_manifest.blocked_data_classes.filter(
      (dataClass) => dataClass !== "teacher_private_note"
    );

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain("Content packages must explicitly block teacher_private_note");
    }
  });

  it("rejects campus-internal packages marked as safe for student device cache", () => {
    const manifest = buildManifest();
    manifest.privacy_manifest.safe_for_student_device_cache = true;

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain("Student device cache requires export_scope=public_content");
    }
  });

  it("rejects teacher-visible signal fields that expose raw student data", () => {
    const manifest = buildManifest();
    manifest.interactive_blocks[0] = {
      ...manifest.interactive_blocks[0]!,
      teacher_visible_signal_fields: ["voice_transcript"]
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package teacher projections cannot expose voice_transcript"
      );
    }
  });

  it("rejects teacher-visible signal fields that expose raw data through camelCase names", () => {
    const manifest = buildManifest();
    manifest.interactive_blocks[0] = {
      ...manifest.interactive_blocks[0]!,
      teacher_visible_signal_fields: ["teacherVoiceTranscriptField"]
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package teacher projections cannot expose teacherVoiceTranscriptField"
      );
    }
  });

  it("rejects teacher-visible signal fields that expose raw data through Chinese names", () => {
    const manifest = buildManifest();
    manifest.interactive_blocks[0] = {
      ...manifest.interactive_blocks[0]!,
      teacher_visible_signal_fields: ["\u8bed\u97f3\u8f6c\u5199"]
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain(
        "Content package teacher projections cannot expose \u8bed\u97f3\u8f6c\u5199"
      );
    }
  });

  it("rejects asset source traces that do not exist in the source manifest", () => {
    const manifest = buildManifest();
    manifest.assets[0] = {
      ...manifest.assets[0]!,
      source_trace_ids: ["missing_source_trace"]
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain("Unknown asset source_trace_id: missing_source_trace");
    }
  });

  it("rejects asset license refs that do not exist in the license manifest", () => {
    const manifest = buildManifest();
    manifest.assets[0] = {
      ...manifest.assets[0]!,
      license_ref: "missing_license"
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain("Unknown asset license_ref: missing_license");
    }
  });

  it("rejects asset page references that do not exist in the package", () => {
    const manifest = buildManifest();
    manifest.assets[0] = {
      ...manifest.assets[0]!,
      related_page_id: "missing_page"
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain("Unknown asset related_page_id: missing_page");
    }
  });

  it("rejects asset block references that do not exist in the package", () => {
    const manifest = buildManifest();
    manifest.assets[0] = {
      ...manifest.assets[0]!,
      related_block_id: "missing_block"
    };

    const result = ContentPackageManifestSchema.safeParse(manifest);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.message)).toContain("Unknown asset related_block_id: missing_block");
    }
  });
});
