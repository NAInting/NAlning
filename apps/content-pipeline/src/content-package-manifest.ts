import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";

import {
  ContentPackageManifestSchema,
  type AiNativeUnitSpec,
  type ContentPackageAsset,
  type ContentPackageCapability,
  type ContentPackageEntrypoint,
  type ContentPackageManifest,
  type InteractiveBlockPackageProfile,
  type UnitBlock,
  type UnitBlockType,
  type UnitPage,
  type UnitSourceTrace
} from "@edu-ai/shared-types";

export interface BuildContentPackageManifestOptions {
  packageVersion?: string;
  generatedAt?: string;
  sourceUnitPath?: string;
  sourceReviewArtifactId?: string;
  packagerVersion?: string;
}

export interface ContentPackageManifestValidationIssue {
  issue_id: string;
  severity: "blocking";
  path: string;
  code:
    | "invalid_content_package_manifest"
    | "content_package_asset_index_hash_mismatch"
    | "content_package_manifest_hash_mismatch"
    | "content_package_source_unit_mismatch"
    | "content_package_build_input_hash_mismatch";
  message: string;
  repair_hint: string;
}

export interface ContentPackageManifestValidationResult {
  passed: boolean;
  issue_count: number;
  issues: ContentPackageManifestValidationIssue[];
  manifest?: ContentPackageManifest;
}

const teacherLedFallbackEntrypointId = "entry_teacher_led_fallback";
const noAiTaskEntrypointId = "entry_no_ai_task";
const assessmentEntrypointId = "entry_assessment";
const noAiTaskAssetId = "asset_no_ai_task";
const assessmentAssetId = "asset_assessment";
const sourceTraceIndexAssetId = "asset_source_trace_index";
const projectOwnedLicenseRef = "license_project_owned";

export function buildContentPackageManifest(
  unit: AiNativeUnitSpec,
  options: BuildContentPackageManifestOptions = {}
): ContentPackageManifest {
  const packageVersion = options.packageVersion ?? "0.1.0";
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const entrypoints = buildRuntimeEntrypoints(unit);
  const assets = buildAssets(unit);
  const interactiveBlocks = buildInteractiveBlockProfiles(unit.runtime_content.pages);
  const manifest: ContentPackageManifest = {
    schema_version: "edu-ai-content-package-v0.1",
    identity: {
      package_id: packageIdFor(unit.metadata.unit_id, packageVersion),
      package_type: "offline_campus_package",
      package_version: packageVersion,
      unit_id: unit.metadata.unit_id,
      generated_at: generatedAt,
      generated_by: "content_pipeline",
      packager_version: options.packagerVersion ?? "content-package-builder-v0.1"
    },
    source: {
      source_unit_id: unit.metadata.unit_id,
      ...(options.sourceUnitPath ? { source_unit_path: options.sourceUnitPath } : {}),
      ...(options.sourceReviewArtifactId ? { source_review_artifact_id: options.sourceReviewArtifactId } : {}),
      source_trace: collectSourceTrace(unit)
    },
    runtime_entrypoints: entrypoints,
    assets,
    interactive_blocks: interactiveBlocks,
    offline_policy: {
      can_run_offline: true,
      fallback_mode: "teacher_led",
      offline_allowed_entrypoint_ids: entrypoints.map((entrypoint) => entrypoint.entrypoint_id),
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
      retention_note: "Generated content packages contain curriculum/runtime assets only; real student data, raw voice, and provider logs are excluded."
    },
    license_manifest: {
      package_license_status: "passed",
      license_entries: [
        {
          license_ref: projectOwnedLicenseRef,
          license_type: "project_owned",
          review_note: "Generated project-owned curriculum package. External assets require separate reviewed entries before approval."
        }
      ]
    },
    integrity: {
      build_input_hash: sha256(stableStringify(unit)),
      asset_index_hash: sha256(stableStringify(assets))
    },
    review: {
      status: "draft",
      issues: []
    }
  };

  return ContentPackageManifestSchema.parse(withManifestHash(manifest));
}

export function validateContentPackageManifest(input: unknown): ContentPackageManifestValidationResult {
  const parsed = ContentPackageManifestSchema.safeParse(input);
  if (parsed.success) {
    const expectedAssetIndexHash = sha256(stableStringify(parsed.data.assets));
    if (parsed.data.integrity.asset_index_hash !== expectedAssetIndexHash) {
      return {
        passed: false,
        issue_count: 1,
        issues: [
          {
            issue_id: "content_package_manifest_issue_asset_index_hash",
            severity: "blocking",
            path: "integrity.asset_index_hash",
            code: "content_package_asset_index_hash_mismatch",
            message: "Content package asset_index_hash does not match packaged asset index.",
            repair_hint: "Regenerate the content package manifest from the validated UnitSpec projection; do not hand-edit integrity fields."
          }
        ]
      };
    }

    if (parsed.data.integrity.manifest_hash) {
      const expectedManifestHash = sha256(stableStringify(omitManifestHash(parsed.data)));
      if (parsed.data.integrity.manifest_hash !== expectedManifestHash) {
        return {
          passed: false,
          issue_count: 1,
          issues: [
            {
              issue_id: "content_package_manifest_issue_manifest_hash",
              severity: "blocking",
              path: "integrity.manifest_hash",
              code: "content_package_manifest_hash_mismatch",
              message: "Content package manifest_hash does not match canonical manifest content.",
              repair_hint: "Regenerate the manifest hash after all package fields are finalized; do not hand-edit integrity fields."
            }
          ]
        };
      }
    }

    return {
      passed: true,
      issue_count: 0,
      issues: [],
      manifest: parsed.data
    };
  }

  const issues = parsed.error.issues.map<ContentPackageManifestValidationIssue>((issue, index) => ({
    issue_id: `content_package_manifest_issue_${index}`,
    severity: "blocking",
    path: issue.path.length > 0 ? issue.path.join(".") : "$",
    code: "invalid_content_package_manifest",
    message: issue.message,
    repair_hint: "Regenerate the content package manifest from the validated UnitSpec projection and keep privacy/license gates fail-closed."
  }));

  return {
    passed: false,
    issue_count: issues.length,
    issues
  };
}

export function validateContentPackageManifestForUnit(
  unit: AiNativeUnitSpec,
  input: unknown
): ContentPackageManifestValidationResult {
  const result = validateContentPackageManifest(input);
  if (!result.passed || !result.manifest) {
    return result;
  }

  const issues: ContentPackageManifestValidationIssue[] = [];
  if (result.manifest.identity.unit_id !== unit.metadata.unit_id || result.manifest.source.source_unit_id !== unit.metadata.unit_id) {
    issues.push({
      issue_id: "content_package_manifest_issue_source_unit",
      severity: "blocking",
      path: "identity.unit_id",
      code: "content_package_source_unit_mismatch",
      message: "Content package manifest unit identity does not match the supplied UnitSpec.",
      repair_hint: "Regenerate the content package manifest from the exact UnitSpec selected for package activation."
    });
  }

  const expectedBuildInputHash = sha256(stableStringify(unit));
  if (result.manifest.integrity.build_input_hash !== expectedBuildInputHash) {
    issues.push({
      issue_id: "content_package_manifest_issue_build_input_hash",
      severity: "blocking",
      path: "integrity.build_input_hash",
      code: "content_package_build_input_hash_mismatch",
      message: "Content package build_input_hash does not match the supplied UnitSpec.",
      repair_hint: "Regenerate the package after UnitSpec changes; never activate a package built from stale source content."
    });
  }

  if (issues.length > 0) {
    return {
      passed: false,
      issue_count: issues.length,
      issues
    };
  }

  return result;
}

function buildRuntimeEntrypoints(unit: AiNativeUnitSpec): ContentPackageEntrypoint[] {
  const pages = unit.runtime_content.pages;
  return [
    ...pages.map((page) => ({
      entrypoint_id: entrypointIdForPage(page.page_id),
      entrypoint_type: "student_page" as const,
      page_id: page.page_id,
      block_ids: page.blocks.map((block) => block.block_id),
      file_path: `runtime/pages/${page.page_id}.json`,
      required_capabilities: capabilitiesForPage(page)
    })),
    {
      entrypoint_id: noAiTaskEntrypointId,
      entrypoint_type: "no_ai_task" as const,
      block_ids: [],
      file_path: "assessment/no-ai-task.json",
      required_capabilities: ["static_read", "teacher_led"]
    },
    {
      entrypoint_id: assessmentEntrypointId,
      entrypoint_type: "assessment" as const,
      block_ids: assessmentBlockIdsForPages(pages),
      file_path: "assessment/assessment-items.json",
      required_capabilities: ["static_read"]
    },
    {
      entrypoint_id: teacherLedFallbackEntrypointId,
      entrypoint_type: "offline_fallback",
      block_ids: [],
      file_path: "teacher/offline-runbook.md",
      required_capabilities: ["teacher_led"]
    }
  ];
}

function buildAssets(unit: AiNativeUnitSpec): ContentPackageAsset[] {
  const pages = unit.runtime_content.pages;
  const sourceTraceIndex = collectSourceTrace(unit);
  const sourceTraceIds = unique(sourceTraceIndex.map((source) => source.source_id));
  const pageAssets = pages.map<ContentPackageAsset>((page) => {
    const serializedPage = stableStringify(page);
    return {
      asset_id: assetIdForPage(page.page_id),
      asset_type: "runtime_json",
      file_path: `runtime/pages/${page.page_id}.json`,
      sha256: sha256(serializedPage),
      byte_size: Buffer.byteLength(serializedPage, "utf8"),
      related_page_id: page.page_id,
      source_trace_ids: unique(page.blocks.flatMap((block) => block.source_trace.map((source) => source.source_id))),
      contains_personal_data: false,
      license_ref: projectOwnedLicenseRef
    };
  });

  const assessmentSourceTraceIds = unit.assessment.meta.source_trace.map((source) => source.source_id);
  const noAiTaskPayload = stableStringify({
    purpose: "No-AI baseline task material",
    note: "Generated from approved assessment prompts. It must not contain real student responses.",
    items: unit.assessment.items.map((item) => ({
      item_id: item.item_id,
      type: item.type,
      target_nodes: item.target_nodes,
      prompt: item.prompt,
      requires_human_review: item.requires_human_review
    }))
  });
  const assessmentPayload = stableStringify({
    purpose: "Assessment and capability certification material",
    note: "Generated assessment projection for offline/campus review. It contains no real student submissions.",
    min_confidence_threshold: unit.assessment.min_confidence_threshold,
    items: unit.assessment.items
  });
  const teacherRunbookPayload = {
    purpose: "Teacher-led offline fallback",
    note: "Synthetic runbook placeholder generated from UnitSpec runtime pages. It must not contain real student data.",
    pages: pages.map((page) => ({ page_id: page.page_id, title: page.title, block_ids: page.blocks.map((block) => block.block_id) }))
  };
  const teacherRunbook = stableStringify(teacherRunbookPayload);
  const sourceTraceIndexPayload = stableStringify({
    purpose: "Content package source trace index",
    note: "Reproducible source trace projection for package audit. It contains no real student data or provider logs.",
    source_trace: sourceTraceIndex
  });
  return [
    ...pageAssets,
    {
      asset_id: noAiTaskAssetId,
      asset_type: "no_ai_task",
      file_path: "assessment/no-ai-task.json",
      sha256: sha256(noAiTaskPayload),
      byte_size: Buffer.byteLength(noAiTaskPayload, "utf8"),
      source_trace_ids: unique(assessmentSourceTraceIds),
      contains_personal_data: false,
      license_ref: projectOwnedLicenseRef
    },
    {
      asset_id: assessmentAssetId,
      asset_type: "assessment",
      file_path: "assessment/assessment-items.json",
      sha256: sha256(assessmentPayload),
      byte_size: Buffer.byteLength(assessmentPayload, "utf8"),
      source_trace_ids: unique(assessmentSourceTraceIds),
      contains_personal_data: false,
      license_ref: projectOwnedLicenseRef
    },
    {
      asset_id: "asset_teacher_offline_runbook",
      asset_type: "teacher_guide",
      file_path: "teacher/offline-runbook.md",
      sha256: sha256(teacherRunbook),
      byte_size: Buffer.byteLength(teacherRunbook, "utf8"),
      source_trace_ids: unique(pages.flatMap((page) => page.blocks.flatMap((block) => block.source_trace.map((source) => source.source_id)))),
      contains_personal_data: false,
      license_ref: projectOwnedLicenseRef
    },
    {
      asset_id: sourceTraceIndexAssetId,
      asset_type: "source_trace_index",
      file_path: "metadata/source-trace-index.json",
      sha256: sha256(sourceTraceIndexPayload),
      byte_size: Buffer.byteLength(sourceTraceIndexPayload, "utf8"),
      source_trace_ids: sourceTraceIds,
      contains_personal_data: false,
      license_ref: projectOwnedLicenseRef
    }
  ];
}

function assessmentBlockIdsForPages(pages: readonly UnitPage[]): string[] {
  return pages.flatMap((page) =>
    page.blocks
      .filter((block) => block.type === "quiz" || block.type === "practice" || block.type === "reflection")
      .map((block) => block.block_id)
  );
}

function buildInteractiveBlockProfiles(pages: readonly UnitPage[]): InteractiveBlockPackageProfile[] {
  return pages.flatMap((page) =>
    page.blocks.map((block) => ({
      page_id: page.page_id,
      block_id: block.block_id,
      block_type: block.type,
      interaction_family: interactionFamilyFor(block.type),
      input_modes: inputModesFor(block.type),
      scoring_mode: scoringModeFor(block.type),
      sandbox_required: block.sandbox.required,
      offline_supported: block.sandbox.runtime !== "server_rendered",
      fallback_entrypoint_id: teacherLedFallbackEntrypointId,
      teacher_visible_signal_fields: teacherVisibleSignalFieldsFor(block)
    }))
  );
}

function capabilitiesForPage(page: UnitPage): ContentPackageCapability[] {
  return unique(page.blocks.flatMap((block) => capabilitiesForBlock(block)));
}

function capabilitiesForBlock(block: UnitBlock): ContentPackageCapability[] {
  const capabilities: ContentPackageCapability[] = ["static_read"];
  if (["quiz", "flash_cards", "concept_graph", "interactive", "animation", "practice", "code"].includes(block.type)) {
    capabilities.push("interactive_runtime");
  }
  if (block.sandbox.required || block.type === "code") {
    capabilities.push("sandboxed_runtime");
  }
  return unique(capabilities);
}

function interactionFamilyFor(blockType: UnitBlockType): InteractiveBlockPackageProfile["interaction_family"] {
  if (blockType === "quiz") {
    return "quiz_check";
  }
  if (blockType === "interactive" || blockType === "animation") {
    return "simulation";
  }
  if (blockType === "reflection") {
    return "reflection";
  }
  if (blockType === "practice" || blockType === "flash_cards") {
    return "practice";
  }
  if (blockType === "concept_graph") {
    return "concept_map";
  }
  if (blockType === "code") {
    return "code_lab";
  }
  if (blockType === "callout") {
    return "dialogue_prompt";
  }
  return "static_read";
}

function inputModesFor(blockType: UnitBlockType): InteractiveBlockPackageProfile["input_modes"] {
  if (blockType === "quiz" || blockType === "flash_cards") {
    return ["choice", "text"];
  }
  if (blockType === "practice" || blockType === "reflection" || blockType === "code") {
    return ["text"];
  }
  if (blockType === "interactive" || blockType === "animation" || blockType === "concept_graph") {
    return ["choice", "drawing"];
  }
  return ["none"];
}

function scoringModeFor(blockType: UnitBlockType): InteractiveBlockPackageProfile["scoring_mode"] {
  if (blockType === "quiz" || blockType === "practice" || blockType === "flash_cards") {
    return "auto";
  }
  if (blockType === "reflection") {
    return "human_review";
  }
  if (blockType === "interactive" || blockType === "animation" || blockType === "concept_graph" || blockType === "code") {
    return "hybrid";
  }
  return "none";
}

function teacherVisibleSignalFieldsFor(block: UnitBlock): string[] {
  const payload = block.payload as Record<string, unknown>;
  return ["expected_signal", "requires_human_review", "teacher_visible_signal"].filter((field) => field in payload);
}

function collectSourceTrace(unit: AiNativeUnitSpec): UnitSourceTrace[] {
  return uniqueBy(
    [
      ...unit.knowledge.meta.source_trace,
      ...unit.pedagogy.meta.source_trace,
      ...unit.narrative.meta.source_trace,
      ...unit.implementation.meta.source_trace,
      ...unit.runtime_content.meta.source_trace,
      ...unit.assessment.meta.source_trace,
      ...unit.quality.meta.source_trace,
      ...unit.runtime_content.pages.flatMap((page) => page.blocks.flatMap((block) => block.source_trace))
    ],
    (source) => source.source_id
  )
    .slice(0, 200)
    .map((source) => ({
      source_id: source.source_id,
      source_type: source.source_type,
      reference: source.reference,
      retrieved_at: source.retrieved_at
    }));
}

function packageIdFor(unitId: string, packageVersion: string): string {
  return `pkg_${unitId}_${packageVersion.toLowerCase().replace(/[^a-z0-9_-]/g, "_")}`;
}

function entrypointIdForPage(pageId: string): string {
  return `entry_${pageId}`;
}

function assetIdForPage(pageId: string): string {
  return `asset_${pageId}`;
}

function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function stableStringify(value: unknown): string {
  return JSON.stringify(sortJson(value));
}

function omitManifestHash(manifest: ContentPackageManifest): ContentPackageManifest {
  const { manifest_hash: _manifestHash, ...integrity } = manifest.integrity;
  return {
    ...manifest,
    integrity
  };
}

function withManifestHash(manifest: ContentPackageManifest): ContentPackageManifest {
  return {
    ...manifest,
    integrity: {
      ...manifest.integrity,
      manifest_hash: sha256(stableStringify(omitManifestHash(manifest)))
    }
  };
}

function sortJson(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortJson);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, item]) => [key, sortJson(item)])
    );
  }
  return value;
}

function unique<T>(items: readonly T[]): T[] {
  return Array.from(new Set(items));
}

function uniqueBy<T>(items: readonly T[], getKey: (item: T) => string): T[] {
  const seen = new Set<string>();
  const uniqueItems: T[] = [];
  for (const item of items) {
    const key = getKey(item);
    if (!seen.has(key)) {
      seen.add(key);
      uniqueItems.push(item);
    }
  }
  return uniqueItems;
}
