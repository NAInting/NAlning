import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  buildContentPackageManifest,
  loadUnitSpecFromFile,
  validateContentPackageManifest,
  validateContentPackageManifestForUnit
} from "../src";

const sampleUnitPath = resolve(process.cwd(), "../../content/units/math-g8-s1-linear-function-concept/unit.yaml");

describe("content package manifest builder", () => {
  it("builds a valid offline content package manifest from the sample UnitSpec", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z",
      sourceUnitPath: "content/units/math-g8-s1-linear-function-concept/unit.yaml"
    });

    expect(manifest.schema_version).toBe("edu-ai-content-package-v0.1");
    expect(manifest.identity.unit_id).toBe(unit.metadata.unit_id);
    expect(manifest.privacy_manifest.contains_real_student_data).toBe(false);
    expect(manifest.privacy_manifest.contains_raw_provider_output).toBe(false);
    expect(manifest.privacy_manifest.export_scope).toBe("campus_internal_content");
    expect(manifest.privacy_manifest.privacy_filter_version).toBe("content-package-privacy-filter-v0.1");
    expect(manifest.privacy_manifest.safe_for_student_device_cache).toBe(false);
    expect(manifest.privacy_manifest.safe_for_teacher_device_cache).toBe(true);
    expect(manifest.privacy_manifest.blocked_data_classes).toEqual(
      expect.arrayContaining(["raw_dialogue", "voice_audio", "voice_transcript", "teacher_private_note", "student_memory", "provider_log"])
    );
    expect(manifest.integrity.manifest_hash).toMatch(/^[a-f0-9]{64}$/);
    expect(validateContentPackageManifest(manifest)).toMatchObject({
      passed: true,
      issue_count: 0
    });
    expect(validateContentPackageManifestForUnit(unit, manifest)).toMatchObject({
      passed: true,
      issue_count: 0
    });
  });

  it("blocks campus-internal packages marked as safe for student device cache", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.privacy_manifest.safe_for_student_device_cache = true;

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain("Student device cache requires export_scope=public_content");
  });

  it("blocks source unit paths that use external URLs", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    expect(() =>
      buildContentPackageManifest(unit, {
        generatedAt: "2026-04-26T15:00:00.000Z",
        sourceUnitPath: "https://cdn.example.invalid/unit.yaml"
      })
    ).toThrow("Content package source_unit_path must be repository-relative and cannot escape source root: https://cdn.example.invalid/unit.yaml");
  });

  it("blocks source unit paths that hide privacy-sensitive source payloads", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    expect(() =>
      buildContentPackageManifest(unit, {
        generatedAt: "2026-04-26T15:00:00.000Z",
        sourceUnitPath: "content/studentRawAudio/unit.yaml"
      })
    ).toThrow("Content package source_unit_path cannot point to privacy-sensitive source payload: content/studentRawAudio/unit.yaml");
  });

  it("blocks source unit paths outside approved UnitSpec YAML roots", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    expect(() =>
      buildContentPackageManifest(unit, {
        generatedAt: "2026-04-26T15:00:00.000Z",
        sourceUnitPath: "docs/unit-runtime-contract.json"
      })
    ).toThrow("Content package source_unit_path must point to an approved UnitSpec YAML under content/units/: docs/unit-runtime-contract.json");
  });

  it("blocks source trace references that include raw provider output", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    unit.knowledge.meta.source_trace[0] = {
      ...unit.knowledge.meta.source_trace[0]!,
      reference: "Synthetic fixture derived from raw provider output and provider prompt."
    };

    expect(() =>
      buildContentPackageManifest(unit, {
        generatedAt: "2026-04-26T15:00:00.000Z"
      })
    ).toThrow(
      "Content package source_trace.reference cannot include raw provider output, raw student content, voice transcripts, emotion details, or family context"
    );
  });

  it("creates one student page entrypoint per runtime page plus a teacher-led fallback", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });

    const studentEntrypoints = manifest.runtime_entrypoints.filter((entrypoint) => entrypoint.entrypoint_type === "student_page");
    const noAiTaskEntrypoints = manifest.runtime_entrypoints.filter((entrypoint) => entrypoint.entrypoint_type === "no_ai_task");
    const assessmentEntrypoints = manifest.runtime_entrypoints.filter((entrypoint) => entrypoint.entrypoint_type === "assessment");
    const fallbackEntrypoints = manifest.runtime_entrypoints.filter((entrypoint) => entrypoint.entrypoint_type === "offline_fallback");

    expect(studentEntrypoints).toHaveLength(unit.runtime_content.pages.length);
    expect(noAiTaskEntrypoints).toHaveLength(1);
    expect(assessmentEntrypoints).toHaveLength(1);
    expect(fallbackEntrypoints).toHaveLength(1);
    expect(manifest.offline_policy.offline_allowed_entrypoint_ids).toEqual(
      expect.arrayContaining(manifest.runtime_entrypoints.map((entrypoint) => entrypoint.entrypoint_id))
    );
  });

  it("keeps runtime entrypoint block references aligned with UnitSpec pages", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    const pageBlockIds = new Map(unit.runtime_content.pages.map((page) => [page.page_id, page.blocks.map((block) => block.block_id)]));

    for (const entrypoint of manifest.runtime_entrypoints.filter((item) => item.entrypoint_type === "student_page")) {
      expect(entrypoint.page_id).toBeDefined();
      expect(entrypoint.block_ids).toEqual(pageBlockIds.get(entrypoint.page_id!));
    }
  });

  it("creates package assets that are explicitly marked as non-personal data", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });

    expect(manifest.assets.length).toBeGreaterThan(0);
    expect(manifest.assets.every((asset) => asset.contains_personal_data === false)).toBe(true);
    expect(manifest.assets.every((asset) => /^[a-f0-9]{64}$/.test(asset.sha256))).toBe(true);
    expect(manifest.assets.map((asset) => asset.asset_type)).toEqual(expect.arrayContaining(["no_ai_task", "assessment", "source_trace_index"]));
  });

  it("creates a source trace index asset that covers the manifest source trace ids", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    const sourceTraceAsset = manifest.assets.find((asset) => asset.asset_type === "source_trace_index");

    expect(sourceTraceAsset).toBeDefined();
    expect(sourceTraceAsset).toMatchObject({
      asset_id: "asset_source_trace_index",
      file_path: "metadata/source-trace-index.json",
      contains_personal_data: false
    });
    expect(sourceTraceAsset?.source_trace_ids).toEqual(manifest.source.source_trace.map((source) => source.source_id));
  });

  it("blocks tampered manifests that add personal-data assets", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.assets[0] = {
      ...manifest.assets[0]!,
      contains_personal_data: true as false
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(expect.objectContaining({ code: "invalid_content_package_manifest" }));
  });

  it("blocks tampered asset indexes whose integrity hash was not regenerated", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.assets[0] = {
      ...manifest.assets[0]!,
      byte_size: manifest.assets[0]!.byte_size + 1
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        path: "integrity.asset_index_hash",
        code: "content_package_asset_index_hash_mismatch",
        message: "Content package asset_index_hash does not match packaged asset index."
      })
    );
  });

  it("blocks manifests with stale canonical manifest hashes", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.integrity.manifest_hash = "0".repeat(64);

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        path: "integrity.manifest_hash",
        code: "content_package_manifest_hash_mismatch",
        message: "Content package manifest_hash does not match canonical manifest content."
      })
    );
  });

  it("blocks tampered package metadata after the manifest hash was generated", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.identity.package_version = "0.1.1";

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        path: "integrity.manifest_hash",
        code: "content_package_manifest_hash_mismatch"
      })
    );
  });

  it("blocks packages generated from stale UnitSpec input", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    const changedUnit = {
      ...unit,
      metadata: {
        ...unit.metadata,
        title: `${unit.metadata.title} updated`
      }
    };

    const result = validateContentPackageManifestForUnit(changedUnit, manifest);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        path: "integrity.build_input_hash",
        code: "content_package_build_input_hash_mismatch"
      })
    );
  });

  it("blocks packages attached to a different UnitSpec identity", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    const otherUnit = {
      ...unit,
      metadata: {
        ...unit.metadata,
        unit_id: "math_g8_different_unit"
      }
    };

    const result = validateContentPackageManifestForUnit(otherUnit, manifest);

    expect(result.passed).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "identity.unit_id",
          code: "content_package_source_unit_mismatch"
        }),
        expect.objectContaining({
          path: "integrity.build_input_hash",
          code: "content_package_build_input_hash_mismatch"
        })
      ])
    );
  });

  it("blocks tampered asset paths that point to provider logs", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.assets[0] = {
      ...manifest.assets[0]!,
      file_path: "logs/provider-log.json"
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "Content package asset file_path cannot point to privacy-sensitive package payload: logs/provider-log.json"
    );
  });

  it("blocks tampered asset paths that hide raw voice payloads with camelCase names", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.assets[0] = {
      ...manifest.assets[0]!,
      file_path: "runtime/studentRawAudio.json"
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "Content package asset file_path cannot point to privacy-sensitive package payload: runtime/studentRawAudio.json"
    );
  });

  it("blocks tampered asset paths that hide raw voice payloads with Chinese names", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.assets[0] = {
      ...manifest.assets[0]!,
      file_path: "runtime/\u539f\u59cb\u97f3\u9891.json"
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "Content package asset file_path cannot point to privacy-sensitive package payload: runtime/\u539f\u59cb\u97f3\u9891.json"
    );
  });

  it("blocks tampered entrypoint paths that escape the package root", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.runtime_entrypoints[0] = {
      ...manifest.runtime_entrypoints[0]!,
      file_path: "../runtime/pages/page_slope_first_look.json"
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "Content package file_path must be package-relative and cannot escape package root: ../runtime/pages/page_slope_first_look.json"
    );
  });

  it("blocks tampered entrypoint paths that point to raw transcripts", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.runtime_entrypoints[0] = {
      ...manifest.runtime_entrypoints[0]!,
      file_path: "runtime/raw-transcript.json"
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "Content package entrypoint file_path cannot point to privacy-sensitive package payload: runtime/raw-transcript.json"
    );
  });

  it("blocks tampered entrypoint paths that hide voice transcripts with camelCase names", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.runtime_entrypoints[0] = {
      ...manifest.runtime_entrypoints[0]!,
      file_path: "runtime/teacherVoiceTranscriptField.json"
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "Content package entrypoint file_path cannot point to privacy-sensitive package payload: runtime/teacherVoiceTranscriptField.json"
    );
  });

  it("blocks tampered entrypoint paths without a matching packaged asset", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.runtime_entrypoints[0] = {
      ...manifest.runtime_entrypoints[0]!,
      file_path: "runtime/pages/missing-page.json"
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "Runtime entrypoint file_path must be backed by a packaged asset: runtime/pages/missing-page.json"
    );
  });

  it("blocks tampered asset paths that use absolute Windows paths", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.assets[0] = {
      ...manifest.assets[0]!,
      file_path: "C:\\student-data\\no-ai-task.json"
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "Content package file_path must be package-relative and cannot escape package root: C:\\student-data\\no-ai-task.json"
    );
  });

  it("blocks offline policies that reference missing entrypoints", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.offline_policy.offline_allowed_entrypoint_ids.push("missing_entrypoint");

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain("Unknown offline entrypoint id: missing_entrypoint");
  });

  it("blocks offline-allowed entrypoints that require voice runtime", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    const entrypoint = manifest.runtime_entrypoints[0]!;
    entrypoint.required_capabilities = [...entrypoint.required_capabilities, "voice_runtime"];

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      `Offline-allowed entrypoint ${entrypoint.entrypoint_id} cannot require network-bound capability voice_runtime`
    );
  });

  it("blocks offline-allowed entrypoints that require external LRS sync", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    const entrypoint = manifest.runtime_entrypoints.find((item) => item.entrypoint_type === "assessment")!;
    entrypoint.required_capabilities = [...entrypoint.required_capabilities, "external_lrs_sync"];

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      `Offline-allowed entrypoint ${entrypoint.entrypoint_id} cannot require network-bound capability external_lrs_sync`
    );
  });

  it("blocks offline campus packages that cannot run offline", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.offline_policy.can_run_offline = false;

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "offline_campus_package must set offline_policy.can_run_offline=true"
    );
  });

  it("blocks offline campus packages without a concrete fallback mode", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.offline_policy.fallback_mode = "none";

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "offline_campus_package must define a non-none fallback_mode"
    );
  });

  it("blocks offline campus packages without an offline-allowed no-AI task entrypoint", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    const noAiTaskEntrypoint = manifest.runtime_entrypoints.find((entrypoint) => entrypoint.entrypoint_type === "no_ai_task");
    manifest.offline_policy.offline_allowed_entrypoint_ids = manifest.offline_policy.offline_allowed_entrypoint_ids.filter(
      (entrypointId) => entrypointId !== noAiTaskEntrypoint?.entrypoint_id
    );

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "offline_campus_package must include an offline-allowed no_ai_task entrypoint"
    );
  });

  it("blocks offline campus packages without an offline-allowed fallback entrypoint", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    const fallbackEntrypoint = manifest.runtime_entrypoints.find((entrypoint) => entrypoint.entrypoint_type === "offline_fallback");
    manifest.offline_policy.offline_allowed_entrypoint_ids = manifest.offline_policy.offline_allowed_entrypoint_ids.filter(
      (entrypointId) => entrypointId !== fallbackEntrypoint?.entrypoint_id
    );

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "offline_campus_package must include an offline-allowed offline_fallback entrypoint"
    );
  });

  it("blocks runtime entrypoints that reference missing packaged blocks", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.runtime_entrypoints[0] = {
      ...manifest.runtime_entrypoints[0]!,
      block_ids: ["missing_block"]
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain("Unknown runtime entrypoint block_id: missing_block");
  });

  it("blocks interactive blocks that reference missing fallback entrypoints", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.interactive_blocks[0] = {
      ...manifest.interactive_blocks[0]!,
      fallback_entrypoint_id: "missing_entrypoint"
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "Unknown interactive block fallback_entrypoint_id: missing_entrypoint"
    );
  });

  it("blocks offline-unsupported blocks without a fallback entrypoint", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.interactive_blocks[0] = {
      ...manifest.interactive_blocks[0]!,
      offline_supported: false
    };
    delete manifest.interactive_blocks[0].fallback_entrypoint_id;

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      `Offline campus block ${manifest.interactive_blocks[0]!.block_id} must define fallback_entrypoint_id when offline_supported=false`
    );
  });

  it("blocks offline-unsupported blocks whose fallback is not offline-allowed", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    const assessmentEntrypoint = manifest.runtime_entrypoints.find((entrypoint) => entrypoint.entrypoint_type === "assessment");
    manifest.interactive_blocks[0] = {
      ...manifest.interactive_blocks[0]!,
      offline_supported: false,
      fallback_entrypoint_id: assessmentEntrypoint!.entrypoint_id
    };
    manifest.offline_policy.offline_allowed_entrypoint_ids = manifest.offline_policy.offline_allowed_entrypoint_ids.filter(
      (entrypointId) => entrypointId !== assessmentEntrypoint?.entrypoint_id
    );

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      `Offline campus block ${manifest.interactive_blocks[0]!.block_id} fallback_entrypoint_id must be offline-allowed`
    );
  });

  it("blocks tampered manifests that omit teacher private note from the privacy deny-list", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.privacy_manifest.blocked_data_classes = manifest.privacy_manifest.blocked_data_classes.filter(
      (dataClass) => dataClass !== "teacher_private_note"
    );

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain("Content packages must explicitly block teacher_private_note");
  });

  it("blocks tampered teacher-visible signal fields that expose voice transcripts", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.interactive_blocks[0] = {
      ...manifest.interactive_blocks[0]!,
      teacher_visible_signal_fields: ["voice_transcript"]
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "Content package teacher projections cannot expose voice_transcript"
    );
  });

  it("blocks tampered teacher-visible signal fields that expose voice transcripts through camelCase names", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.interactive_blocks[0] = {
      ...manifest.interactive_blocks[0]!,
      teacher_visible_signal_fields: ["teacherVoiceTranscriptField"]
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "Content package teacher projections cannot expose teacherVoiceTranscriptField"
    );
  });

  it("blocks tampered teacher-visible signal fields that expose voice transcripts through Chinese names", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.interactive_blocks[0] = {
      ...manifest.interactive_blocks[0]!,
      teacher_visible_signal_fields: ["\u8bed\u97f3\u8f6c\u5199"]
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "Content package teacher projections cannot expose \u8bed\u97f3\u8f6c\u5199"
    );
  });

  it("blocks tampered asset source trace ids that cannot be resolved", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.assets[0] = {
      ...manifest.assets[0]!,
      source_trace_ids: ["missing_source_trace"]
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain("Unknown asset source_trace_id: missing_source_trace");
  });

  it("blocks tampered asset license refs that cannot be resolved", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.assets[0] = {
      ...manifest.assets[0]!,
      license_ref: "missing_license"
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain("Unknown asset license_ref: missing_license");
  });

  it("blocks tampered assets without license refs", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    const assetWithoutLicense = { ...manifest.assets[0]! } as Record<string, unknown>;
    delete assetWithoutLicense.license_ref;
    manifest.assets[0] = assetWithoutLicense as typeof manifest.assets[number];

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({
        code: "invalid_content_package_manifest",
        path: "assets.0.license_ref"
      })
    );
  });

  it("blocks tampered license review notes that include raw provider output", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.license_manifest.license_entries[0] = {
      ...manifest.license_manifest.license_entries[0]!,
      review_note: "License review copied the raw provider output for later inspection."
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "Content package license review_note cannot include raw provider output, raw student content, voice transcripts, emotion details, or family context"
    );
  });

  it("blocks tampered license source URIs that include raw provider output or voice transcript provenance", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.license_manifest.license_entries[0] = {
      ...manifest.license_manifest.license_entries[0]!,
      source_uri: "https://example.invalid/raw-provider-output/voice-transcript"
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "Content package license source_uri cannot include raw provider output, raw student content, voice transcripts, emotion details, or family context"
    );
  });

  it("blocks tampered review issue text that includes raw provider output", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.review.issues = [
      {
        issue_id: "issue_raw_review_text",
        severity: "medium",
        status: "open",
        message: "Review issue copied raw provider output for debugging.",
        repair_hint: "Regenerate the manifest from sanitized package inputs."
      }
    ];

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain(
      "Content package review issue message cannot include raw provider output, raw student content, voice transcripts, emotion details, or family context"
    );
  });

  it("blocks tampered asset page refs that cannot be resolved", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.assets[0] = {
      ...manifest.assets[0]!,
      related_page_id: "missing_page"
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain("Unknown asset related_page_id: missing_page");
  });

  it("blocks tampered asset block refs that cannot be resolved", async () => {
    const unit = await loadUnitSpecFromFile(sampleUnitPath);
    const manifest = buildContentPackageManifest(unit, {
      generatedAt: "2026-04-26T15:00:00.000Z"
    });
    manifest.assets[0] = {
      ...manifest.assets[0]!,
      related_block_id: "missing_block"
    };

    const result = validateContentPackageManifest(manifest);

    expect(result.passed).toBe(false);
    expect(result.issues.map((issue) => issue.message)).toContain("Unknown asset related_block_id: missing_block");
  });
});
