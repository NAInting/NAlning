import {
  CurriculumDesignImportDraftSchema,
  type CurriculumDesignImportDraft,
  type CurriculumImportReviewArtifact
} from "@edu-ai/shared-types";

export type CurriculumImportValidationGate =
  | "shape"
  | "curriculum"
  | "pedagogy"
  | "runtime"
  | "governance";

export type CurriculumImportValidationSeverity = "low" | "medium" | "high" | "blocking";
export type CurriculumImportGateStatus = "passed" | "blocked" | "needs_human_review";

export interface CurriculumDesignImportValidationIssue {
  issue_id: string;
  severity: CurriculumImportValidationSeverity;
  gate: CurriculumImportValidationGate;
  owner: "curriculum_designer" | "subject_expert" | "pedagogy_designer" | "engineering_agent" | "qa_agent" | "human_reviewer";
  path: string;
  code: string;
  message: string;
  repair_hint: string;
}

export interface CurriculumDesignImportValidationResult {
  passed: boolean;
  issue_count: number;
  validation_summary: CurriculumImportReviewArtifact["validation_summary"];
  issues: CurriculumDesignImportValidationIssue[];
  draft?: CurriculumDesignImportDraft;
}

const foreignStandardPatterns = [
  /ccss/i,
  /common[-_\s]*core/i,
  /core\s+state\s+standards/i,
  /美国共同核心/,
  /共同核心州立标准/
];

const rawSensitivePatterns = [
  /raw[-_\s]*dialogue/i,
  /raw[-_\s]*transcript/i,
  /voice[-_\s]*audio/i,
  /voice[-_\s]*replay/i,
  /audio[-_\s]*playback/i,
  /原始对话/,
  /完整对话/,
  /对话原文/,
  /完整转写/,
  /语音回放/,
  /原始语音/,
  /情绪原文/,
  /家庭情况/,
  /家暴/,
  /自伤/
];

const noRetentionPatterns = [/不存/, /不落库/, /默认不/, /none/i, /ephemeral/i, /not\s+stored/i, /no\s+retention/i];

export function validateCurriculumDesignImportDraft(input: unknown): CurriculumDesignImportValidationResult {
  const parsed = CurriculumDesignImportDraftSchema.safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.issues.map<CurriculumDesignImportValidationIssue>((issue, index) => ({
      issue_id: `shape_issue_${index}`,
      severity: "blocking",
      gate: "shape",
      owner: "curriculum_designer",
      path: issue.path.length > 0 ? issue.path.join(".") : "$",
      code: "invalid_import_shape",
      message: issue.message,
      repair_hint: "Normalize the curriculum design into CurriculumDesignImportDraft before generating patches."
    }));
    return {
      passed: false,
      issue_count: issues.length,
      validation_summary: {
        shape_gate: "blocked",
        curriculum_gate: "blocked",
        pedagogy_gate: "blocked",
        runtime_gate: "blocked",
        governance_gate: "blocked"
      },
      issues
    };
  }

  const draft = parsed.data;
  const issues: CurriculumDesignImportValidationIssue[] = [
    ...collectCurriculumIssues(draft),
    ...collectPedagogyIssues(draft),
    ...collectRuntimeIssues(draft),
    ...collectGovernanceIssues(draft)
  ];
  const validationSummary = {
    shape_gate: "passed" as const,
    curriculum_gate: gateStatusFor(issues, "curriculum"),
    pedagogy_gate: gateStatusFor(issues, "pedagogy"),
    runtime_gate: gateStatusFor(issues, "runtime"),
    governance_gate: governanceGateStatusFor(issues)
  };

  return {
    passed: Object.values(validationSummary).every((status) => status === "passed"),
    issue_count: issues.length,
    validation_summary: validationSummary,
    issues,
    draft
  };
}

function collectCurriculumIssues(draft: CurriculumDesignImportDraft): CurriculumDesignImportValidationIssue[] {
  const issues: CurriculumDesignImportValidationIssue[] = [];
  draft.unit_overview.standard_alignment.forEach((alignment, index) => {
    const sourceText = [alignment.standard_system, alignment.standard_code ?? "", alignment.description].join("\n");
    if (containsForeignStandard(sourceText)) {
      issues.push(
        issue(
          "curriculum",
          "blocking",
          "subject_expert",
          `unit_overview.standard_alignment[${index}]`,
          "foreign_standard_substitution",
          "Curriculum import drafts must not substitute Chinese K-12 curriculum context with CCSS/Common Core or equivalent foreign standards.",
          "Replace the standard reference with the relevant Chinese curriculum standard or local textbook source."
        )
      );
    }
    if (alignment.needs_human_verification || alignment.confidence < 0.7) {
      issues.push(
        issue(
          "curriculum",
          "medium",
          "human_reviewer",
          `unit_overview.standard_alignment[${index}]`,
          "standard_alignment_needs_human_review",
          "Standard alignment is uncertain and requires human subject-review before apply.",
          "Ask a subject reviewer to confirm the exact standard code and description."
        )
      );
    }
  });

  draft.source_trace.forEach((source, index) => {
    const sourceText = [source.source_id, source.reference].join("\n");
    if (containsForeignStandard(sourceText)) {
      issues.push(
        issue(
          "curriculum",
          "blocking",
          "subject_expert",
          `source_trace[${index}]`,
          "foreign_standard_source_trace",
          "Source trace references an unapproved foreign standard.",
          "Use a Chinese curriculum, local textbook, teacher note, or approved human review source."
        )
      );
    }
  });

  return issues;
}

function collectPedagogyIssues(draft: CurriculumDesignImportDraft): CurriculumDesignImportValidationIssue[] {
  const hasNoAiPage = draft.student_material.pages.some((page) => page.page_type === "no_ai_baseline");
  const hasNoAiBlock = draft.student_material.pages.some((page) =>
    page.blocks.some((block) => block.block_type === "no_ai_task")
  );
  const hasNoAiTask = draft.learning_tasks.some((task) => task.task_type === "no_ai_baseline_task" || !task.ai_allowed);
  const hasNoAiCertification = draft.capability_certifications.some(
    (certification) => certification.certification_type === "no_ai_baseline"
  );

  if (hasNoAiPage || hasNoAiBlock || hasNoAiTask || hasNoAiCertification) {
    return [];
  }

  return [
    issue(
      "pedagogy",
      "blocking",
      "pedagogy_designer",
      "learning_tasks",
      "missing_no_ai_baseline",
      "AI-native curriculum units must include at least one no-AI baseline task, block, page, or certification.",
      "Add a no-AI task or certification that verifies student capability without AI prompting."
    )
  ];
}

function collectRuntimeIssues(draft: CurriculumDesignImportDraft): CurriculumDesignImportValidationIssue[] {
  const issues: CurriculumDesignImportValidationIssue[] = [];
  if (draft.runtime_contract.unit_id !== draft.unit_overview.unit_id_suggestion) {
    issues.push(
      issue(
        "runtime",
        "blocking",
        "engineering_agent",
        "runtime_contract.unit_id",
        "runtime_unit_id_mismatch",
        "Runtime contract unit_id must match unit_overview.unit_id_suggestion.",
        "Align the runtime contract to the unit overview before generating candidate patches."
      )
    );
  }

  const pageIds = new Set(draft.student_material.pages.map((page) => page.page_id));
  const blockIds = new Set(draft.student_material.pages.flatMap((page) => page.blocks.map((block) => block.block_id)));
  draft.runtime_contract.pages.forEach((page, pageIndex) => {
    if (!pageIds.has(page.page_id)) {
      issues.push(
        issue(
          "runtime",
          "blocking",
          "engineering_agent",
          `runtime_contract.pages[${pageIndex}].page_id`,
          "runtime_page_reference_missing",
          "Runtime contract references a page that does not exist in student_material.pages.",
          "Add the page to student_material or remove the runtime reference."
        )
      );
    }

    page.block_ids.forEach((blockId, blockIndex) => {
      if (!blockIds.has(blockId)) {
        issues.push(
          issue(
            "runtime",
            "blocking",
            "engineering_agent",
            `runtime_contract.pages[${pageIndex}].block_ids[${blockIndex}]`,
            "runtime_block_reference_missing",
            "Runtime contract references a block that does not exist in student_material.pages[].blocks.",
            "Add the block to student_material or remove the runtime reference."
          )
        );
      }
    });
  });

  draft.classroom_script.steps.forEach((step, stepIndex) => {
    step.runtime_event_suggestions.forEach((event, eventIndex) => {
      if (event.domain === "emotion" && event.privacy_level !== "campus_local_only") {
        issues.push(
          issue(
            "runtime",
            "blocking",
            "engineering_agent",
            `classroom_script.steps[${stepIndex}].runtime_event_suggestions[${eventIndex}].privacy_level`,
            "emotion_runtime_event_not_campus_local",
            "Emotion-domain runtime event suggestions must stay campus_local_only.",
            "Change the event privacy_level to campus_local_only or remove the emotion-domain suggestion."
          )
        );
      }
    });
  });

  return issues;
}

function collectGovernanceIssues(draft: CurriculumDesignImportDraft): CurriculumDesignImportValidationIssue[] {
  const issues: CurriculumDesignImportValidationIssue[] = [];

  draft.teacher_dashboard_signals.forEach((signal, signalIndex) => {
    const visibleText = [signal.visible_summary, ...signal.source_evidence].join("\n");
    if (containsRawSensitiveText(visibleText)) {
      issues.push(
        issue(
          "governance",
          "high",
          "qa_agent",
          `teacher_dashboard_signals[${signalIndex}]`,
          "teacher_signal_raw_content_leak",
          "Teacher dashboard signals must be safe projections and cannot contain raw dialogue, transcript, voice, emotional text, or family context.",
          "Replace raw content with an abstract learning signal and list the blocked raw fields."
        )
      );
    }
  });

  draft.student_material.pages.forEach((page, pageIndex) => {
    page.blocks.forEach((block, blockIndex) => {
      const teacherSignalText = block.teacher_visible_signal.join("\n");
      if (containsRawSensitiveText(teacherSignalText)) {
        issues.push(
          issue(
            "governance",
            "high",
            "qa_agent",
            `student_material.pages[${pageIndex}].blocks[${blockIndex}].teacher_visible_signal`,
            "block_teacher_signal_raw_content_leak",
            "Block-level teacher-visible signals cannot expose raw student dialogue, voice, emotion, or family details.",
            "Use a teacher-safe summary such as misconception cluster, confidence band, or no-AI evidence status."
          )
        );
      }
    });
  });

  draft.privacy_boundaries.forEach((boundary, boundaryIndex) => {
    if (
      ["raw_dialogue", "voice_audio", "voice_transcript", "emotion_or_personal", "family_context"].includes(
        boundary.data_class
      ) &&
      (boundary.teacher_visible || boundary.guardian_visible)
    ) {
      issues.push(
        issue(
          "governance",
          "blocking",
          "qa_agent",
          `privacy_boundaries[${boundaryIndex}]`,
          "raw_or_sensitive_boundary_visible_to_teacher_or_guardian",
          "Raw dialogue, voice, emotional, or family-context data cannot be visible to teacher or guardian projections.",
          "Set teacher_visible and guardian_visible to false and define a safe projection_rule."
        )
      );
    }

    if (boundary.data_class === "voice_audio" && !noRetentionPatterns.some((pattern) => pattern.test(boundary.retention_note))) {
      issues.push(
        issue(
          "governance",
          "high",
          "qa_agent",
          `privacy_boundaries[${boundaryIndex}].retention_note`,
          "voice_audio_retention_not_denied",
          "Voice audio must be not stored by default during the spike/import stage.",
          "Make the retention note explicitly state that raw voice audio is not stored by default."
        )
      );
    }

    if (
      boundary.data_class === "model_internal" &&
      (boundary.student_visible || boundary.teacher_visible || boundary.guardian_visible)
    ) {
      issues.push(
        issue(
          "governance",
          "blocking",
          "qa_agent",
          `privacy_boundaries[${boundaryIndex}]`,
          "model_internal_visible_to_end_user",
          "Model internals must not be visible to students, teachers, or guardians.",
          "Keep model_internal visible only to tightly scoped admin audit flows when needed."
        )
      );
    }
  });

  return issues;
}

function gateStatusFor(
  issues: readonly CurriculumDesignImportValidationIssue[],
  gate: Exclude<CurriculumImportValidationGate, "shape" | "governance">
): CurriculumImportGateStatus {
  const gateIssues = issues.filter((issue) => issue.gate === gate);
  if (gateIssues.some((issue) => issue.severity === "blocking" || issue.severity === "high")) {
    return "blocked";
  }
  if (gateIssues.some((issue) => issue.severity === "medium")) {
    return "needs_human_review";
  }
  return "passed";
}

function governanceGateStatusFor(
  issues: readonly CurriculumDesignImportValidationIssue[]
): "passed" | "blocked" {
  const gateIssues = issues.filter((issue) => issue.gate === "governance");
  return gateIssues.some((issue) => issue.severity === "blocking" || issue.severity === "high" || issue.severity === "medium")
    ? "blocked"
    : "passed";
}

function containsForeignStandard(text: string): boolean {
  return foreignStandardPatterns.some((pattern) => pattern.test(text));
}

function containsRawSensitiveText(text: string): boolean {
  return rawSensitivePatterns.some((pattern) => pattern.test(text));
}

function issue(
  gate: CurriculumImportValidationGate,
  severity: CurriculumImportValidationSeverity,
  owner: CurriculumDesignImportValidationIssue["owner"],
  path: string,
  code: string,
  message: string,
  repairHint: string
): CurriculumDesignImportValidationIssue {
  return {
    issue_id: `curriculum_import_${code}`,
    severity,
    gate,
    owner,
    path,
    code,
    message,
    repair_hint: repairHint
  };
}
