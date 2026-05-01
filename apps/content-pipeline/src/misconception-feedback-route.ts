import {
  MisconceptionFeedbackRouteListSchema,
  type AiNativeUnitSpec,
  type MisconceptionFeedbackRoute
} from "@edu-ai/shared-types";

export type MisconceptionFeedbackRouteValidationSeverity = "error" | "warning";

export interface MisconceptionFeedbackRouteValidationIssue {
  severity: MisconceptionFeedbackRouteValidationSeverity;
  code: string;
  path: string;
  message: string;
}

export interface MisconceptionFeedbackRouteValidationResult {
  passed: boolean;
  error_count: number;
  warning_count: number;
  issues: MisconceptionFeedbackRouteValidationIssue[];
  routes?: MisconceptionFeedbackRoute[];
}

const normalizedChineseRawSensitivePatterns = [
  /原始\s*(对话|回答|转写|转录|语音|音频)/,
  /完整\s*(对话|回答|转写|转录|逐字稿)/,
  /对话\s*原文/,
  /回答\s*原文/,
  /学生\s*(原话|逐字|说了|回答了|写了)/,
  /语音\s*(回放|播放|转写|转录|录音|音频)/,
  /音频\s*(回放|播放|录音)/
];

const normalizedChineseSafetySensitivePatterns = [
  /自伤/,
  /自杀/,
  /轻生/,
  /家暴/,
  /虐待/,
  /家庭\s*(情况|冲突|细节)/,
  /情绪\s*原文/,
  /心理\s*诊断/
];

const normalizedChineseAnswerFirstPatterns = [/答案\s*是/, /正确\s*答案/, /最终\s*答案/, /直接\s*答案/];

const rawSensitivePatterns = [
  /\bexact\s+(student\s+)?response\b/i,
  /\bstudent\s+(said|wrote|answered)\b/i,
  /\bstudent\s+quote\b/i,
  /\b(full|complete|original)\s+(student\s+)?(answer|response|reply)\b/i,
  /\bstudent'?s?\s+(exact|full|complete|original)\s+(answer|response|reply)\b/i,
  /\bverbatim\b/i,
  /raw[-_\s]*dialogue/i,
  /raw[-_\s]*response/i,
  /raw[-_\s]*transcript/i,
  /voice[-_\s]*audio/i,
  /voice[-_\s]*transcript/i,
  /原始对话/,
  /完整对话/,
  /对话原文/,
  /原始回答/,
  /完整转写/,
  /语音回放/,
  /原始语音/
];

const safetySensitivePatterns = [/自伤/, /自杀/, /轻生/, /家暴/, /虐待/, /家庭情况/, /情绪原文/, /心理诊断/];
const answerFirstPatterns = [/答案是/, /正确答案/, /最终答案/, /直接答案/, /\banswer\s+is\b/i, /\bthe\s+answer\b/i];

const utf8ChineseRawSensitivePatterns = [
  /原始\s*(对话|回答|转写|转录|语音|音频)/,
  /完整\s*(对话|回答|转写|转录|逐字稿)/,
  /对话\s*原文/,
  /回答\s*原文/,
  /学生\s*(原话|逐字|说了|回答了|写了)/,
  /语音\s*(回放|播放|转写|转录|录音|音频)/,
  /音频\s*(回放|播放|录音)/
];

const utf8ChineseSafetySensitivePatterns = [
  /自伤/,
  /自杀/,
  /轻生/,
  /家暴/,
  /虐待/,
  /家庭\s*(情况|冲突|细节)/,
  /情绪\s*原文/,
  /心理\s*诊断/
];

const utf8ChineseAnswerFirstPatterns = [/答案\s*是/, /正确\s*答案/, /最终\s*答案/, /直接\s*答案/];
const disciplinaryAutomationPatterns = [
  /\b(auto|automatic)\s*(punish|penalty|discipline|sanction)\b/i,
  /自动\s*(处罚|惩罚|处分|扣分|排名|通报)/,
  /(处罚|惩罚|处分|扣分|排名)\s*自动/,
  /直接\s*(处罚|惩罚|处分|扣分|排名|通报)/
];

const actualChineseRawSensitivePatterns = [
  /原始\s*(对话|回答|转写|转录|语音|音频)/,
  /完整\s*(对话|回答|转写|转录|逐字稿)/,
  /对话\s*原文/,
  /回答\s*原文/,
  /学生\s*(原话|逐字|说了|回答了|写了)/,
  /语音\s*(回放|播放|转写|转录|录音|音频)/,
  /音频\s*(回放|播放|录音)/
];

const actualChineseSafetySensitivePatterns = [
  /自伤/,
  /自杀/,
  /轻生/,
  /家暴/,
  /虐待/,
  /家庭\s*(情况|冲突|细节)/,
  /情绪\s*原文/,
  /心理\s*诊断/
];

const actualChineseAnswerFirstPatterns = [/答案\s*是/, /正确\s*答案/, /最终\s*答案/, /直接\s*答案/];

const actualChineseDisciplinaryAutomationPatterns = [
  /自动\s*(处罚|惩罚|处分|扣分|排名|通报)/,
  /(处罚|惩罚|处分|扣分|排名|通报)\s*自动/,
  /直接\s*(处罚|惩罚|处分|扣分|排名|通报)/
];

const actualUtf8ChineseRawSensitivePatterns = [
  /\u539f\u59cb\s*(\u5bf9\u8bdd|\u56de\u7b54|\u8f6c\u5199|\u8f6c\u5f55|\u8bed\u97f3|\u97f3\u9891)/,
  /\u5b8c\u6574\s*(\u5bf9\u8bdd|\u56de\u7b54|\u8f6c\u5199|\u8f6c\u5f55|\u9010\u5b57\u7a3f)/,
  /\u5bf9\u8bdd\s*\u539f\u6587/,
  /\u56de\u7b54\s*\u539f\u6587/,
  /\u4f5c\u7b54\s*\u539f\u6587/,
  /\u5b8c\u6574\s*(\u4f5c\u7b54|\u5b66\u751f\u4f5c\u7b54|\u5b66\u751f\u7b54\u6848)/,
  /\u5b66\u751f\s*(\u4f5c\u7b54\u539f\u6587|\u5b8c\u6574\u4f5c\u7b54|\u539f\u59cb\u4f5c\u7b54)/,
  /\u5b66\u751f\s*(\u539f\u8bdd|\u9010\u5b57|\u8bf4\u4e86|\u56de\u7b54\u4e86|\u5199\u4e86)/,
  /\u8bed\u97f3\s*(\u56de\u653e|\u64ad\u653e|\u8f6c\u5199|\u8f6c\u5f55|\u5f55\u97f3|\u97f3\u9891)/,
  /\u97f3\u9891\s*(\u56de\u653e|\u64ad\u653e|\u5f55\u97f3)/
];

const actualUtf8ChineseSafetySensitivePatterns = [
  /\u81ea\u4f24/,
  /\u81ea\u6740/,
  /\u8f7b\u751f/,
  /\u5bb6\u66b4/,
  /\u8650\u5f85/,
  /\u5bb6\u5ead\s*(\u60c5\u51b5|\u51b2\u7a81|\u7ec6\u8282)/,
  /\u60c5\u7eea\s*\u539f\u6587/,
  /\u5fc3\u7406\s*\u8bca\u65ad/
];

const actualUtf8ChineseAnswerFirstPatterns = [
  /\u7b54\u6848\s*\u662f/,
  /\u6b63\u786e\s*\u7b54\u6848/,
  /\u6700\u7ec8\s*\u7b54\u6848/,
  /\u76f4\u63a5\s*\u7b54\u6848/
];

const actualUtf8ChineseDisciplinaryAutomationPatterns = [
  /\u81ea\u52a8\s*(\u5904\u7f5a|\u60e9\u7f5a|\u5904\u5206|\u6263\u5206|\u6392\u540d|\u901a\u62a5)/,
  /(\u5904\u7f5a|\u60e9\u7f5a|\u5904\u5206|\u6263\u5206|\u6392\u540d|\u901a\u62a5)\s*\u81ea\u52a8/,
  /\u76f4\u63a5\s*(\u5904\u7f5a|\u60e9\u7f5a|\u5904\u5206|\u6263\u5206|\u6392\u540d|\u901a\u62a5)/
];

const unsafeRouteSourceTraceReferencePatterns = [
  /\braw\s+provider\s+(output|prompt|response|completion|payload)\b/i,
  /\bprovider\s+(log|prompt|request|response|payload|completion)\b/i,
  /\b(raw|original|full|complete|verbatim)\s+(student\s+)?(answer|response|reply|dialogue|transcript)\b/i,
  /\bvoice\s+(audio|recording|playback|transcript)\b/i,
  /\baudio\s+(recording|playback|transcript)\b/i,
  /\bemotion(al)?\s+(detail|content|text)\b/i,
  /\bfamily\s+(context|detail|content|conflict)\b/i,
  /\u6a21\u578b\s*(\u539f\u59cb\u8f93\u51fa|\u63d0\u793a\u8bcd\u539f\u6587|\u8f93\u51fa\u539f\u6587)/,
  /\u63d0\u793a\u8bcd\s*\u539f\u6587/
];

const unsafeBlockedRawFieldIntentPatterns = [
  /(allow|allowed|permit|permitted|read|view|show|export|share|visible|access)/i,
  /\u5141\u8bb8|\u53ef\u89c1|\u53ef\u67e5\u770b|\u5bfc\u51fa|\u5206\u4eab|\u8bbf\u95ee/
];

export function validateMisconceptionFeedbackRoutes(
  unit: AiNativeUnitSpec,
  input: unknown
): MisconceptionFeedbackRouteValidationResult {
  const parsed = MisconceptionFeedbackRouteListSchema.safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.issues.map<MisconceptionFeedbackRouteValidationIssue>((issue, index) => ({
      severity: "error",
      code: "invalid_misconception_route_shape",
      path: issue.path.length > 0 ? issue.path.join(".") : "$",
      message: `${issue.message} (shape issue ${index})`
    }));
    return buildResult(issues);
  }

  const routes = parsed.data;
  const issues = collectRouteSemanticIssues(unit, routes);
  return {
    ...buildResult(issues),
    routes
  };
}

export function listKnownMisconceptionIds(unit: AiNativeUnitSpec): string[] {
  return [
    ...unit.knowledge.nodes.flatMap((node) =>
      node.misconceptions.map((_, index) => `misconception_${node.node_id}_${index}`)
    ),
    ...unit.knowledge.global_misconceptions.map((_, index) => `misconception_global_${index}`)
  ];
}

function collectRouteSemanticIssues(
  unit: AiNativeUnitSpec,
  routes: readonly MisconceptionFeedbackRoute[]
): MisconceptionFeedbackRouteValidationIssue[] {
  const issues: MisconceptionFeedbackRouteValidationIssue[] = [];
  const knownNodeIds = new Set(unit.knowledge.nodes.map((node) => node.node_id));
  const knownMisconceptionIds = new Set(listKnownMisconceptionIds(unit));
  const blocks = flattenBlocks(unit);
  const knownBlockIds = new Set(blocks.map(({ block }) => block.block_id));
  const assessmentItemsById = new Map(unit.assessment.items.map((item) => [item.item_id, item]));
  const blocksById = new Map(blocks.map(({ block }) => [block.block_id, block]));
  const knownAssessmentIds = new Set(assessmentItemsById.keys());
  const knownSourceTraceIds = collectKnownUnitSourceTraceIds(unit);

  collectDuplicateIds(
    routes.map((route) => route.route_id),
    "routes[].route_id",
    issues
  );

  routes.forEach((route, routeIndex) => {
    const routePath = `routes[${routeIndex}]`;
    if (route.unit_id !== unit.metadata.unit_id) {
      issues.push(error("route_unit_id_mismatch", `${routePath}.unit_id`, "Route unit_id must match the target UnitSpec metadata.unit_id."));
    }

    if (!knownNodeIds.has(route.target_node_id)) {
      issues.push(
        error(
          "unknown_route_target_node",
          `${routePath}.target_node_id`,
          `Route target_node_id "${route.target_node_id}" is not defined in knowledge.nodes.`
        )
      );
    }

    if (!knownMisconceptionIds.has(route.misconception_id)) {
      issues.push(
        error(
          "unknown_misconception_id",
          `${routePath}.misconception_id`,
          `Route misconception_id "${route.misconception_id}" is not in the derived misconception id set: ${Array.from(
            knownMisconceptionIds
          ).join(", ")}.`
        )
      );
    }

    collectBlockReferenceIssues(route.source_block_id, route.target_node_id, knownBlockIds, blocks, `${routePath}.source_block_id`, "source", issues);
    collectDetectionSignalBlockTypeIssues(route, blocks, routePath, issues);
    collectDetectionSignalEvidenceTypeIssues(route, routePath, issues);
    collectBlockReferenceIssues(route.retry.retry_block_id, route.target_node_id, knownBlockIds, blocks, `${routePath}.retry.retry_block_id`, "retry", issues);

    if (route.retry.no_ai_followup_task_id) {
      const followupAssessment = assessmentItemsById.get(route.retry.no_ai_followup_task_id);
      const followupBlock = blocksById.get(route.retry.no_ai_followup_task_id);
      if (!followupAssessment && !followupBlock) {
        issues.push(
          error(
            "unknown_no_ai_followup_task",
            `${routePath}.retry.no_ai_followup_task_id`,
            `no_ai_followup_task_id "${route.retry.no_ai_followup_task_id}" must reference an assessment item or runtime block.`
          )
        );
      } else if (
        !followupAssessment?.target_nodes.includes(route.target_node_id) &&
        !followupBlock?.target_nodes.includes(route.target_node_id)
      ) {
        issues.push(
          error(
            "no_ai_followup_target_node_mismatch",
            `${routePath}.retry.no_ai_followup_task_id`,
            `no_ai_followup_task_id "${route.retry.no_ai_followup_task_id}" must target route node "${route.target_node_id}".`
          )
        );
      }
    }

    if (
      route.evidence.mastery_update_allowed &&
      route.evidence.minimum_confidence_for_mastery_update < route.detection.confidence_threshold
    ) {
      issues.push(
        error(
          "low_confidence_mastery_update",
          `${routePath}.evidence.minimum_confidence_for_mastery_update`,
          "Mastery update confidence cannot be lower than detection confidence threshold."
        )
      );
    }

    if (containsAnswerFirstText(route.feedback.student_facing_prompt) && route.feedback.reveal_policy !== "teacher_mediated") {
      issues.push(
        error(
          "answer_first_prompt_requires_teacher_mediated_review",
          `${routePath}.feedback.student_facing_prompt`,
          "Answer-first misconception feedback requires teacher_mediated reveal policy and human review."
        )
      );
    }

    const teacherSignalText = [route.teacher_signal.visible_summary_template, ...route.teacher_signal.blocked_raw_fields].join("\n");
    if (containsRawSensitiveText(route.teacher_signal.visible_summary_template)) {
      issues.push(
        error(
          "teacher_signal_raw_content_leak",
          `${routePath}.teacher_signal.visible_summary_template`,
          "Teacher-safe misconception signals cannot expose raw dialogue, raw response, transcript, or voice details."
        )
      );
    }

    [
      {
        path: `${routePath}.detection.pattern_description`,
        text: route.detection.pattern_description
      },
      {
        path: `${routePath}.feedback.student_facing_prompt`,
        text: route.feedback.student_facing_prompt
      },
      {
        path: `${routePath}.retry.retry_prompt`,
        text: route.retry.retry_prompt
      }
    ].forEach((field) => {
      if (containsRawSensitiveText(field.text)) {
        issues.push(
          error(
            "misconception_route_raw_content_leak",
            field.path,
            "Misconception route text cannot expose raw dialogue, raw response, transcript, voice, or exact student-answer details."
          )
        );
      }
    });

    const routeSafetyText = [
      route.detection.pattern_description,
      route.feedback.student_facing_prompt,
      route.retry.retry_prompt,
      route.teacher_signal.visible_summary_template
    ].join("\n");

    if (containsSafetySensitiveText(routeSafetyText)) {
      issues.push(
        error(
          "safety_sensitive_content_in_misconception_route",
          routePath,
          "Misconception routes must not process emotional, family, self-harm, or safety-sensitive content; route such content to campus_local_only privacy workflow."
        )
      );
    }

    if (containsDisciplinaryAutomationText(routeSafetyText)) {
      issues.push(
        error(
          "disciplinary_automation_in_misconception_route",
          routePath,
          "Misconception routes cannot trigger automatic punishment, ranking, discipline, or sanctions; teacher judgment is required."
        )
      );
    }

    route.source_trace.forEach((source, sourceIndex) => {
      if (!knownSourceTraceIds.has(source.source_id)) {
        issues.push(
          error(
            "unknown_route_source_trace",
            `${routePath}.source_trace[${sourceIndex}].source_id`,
            `Route source_trace source_id "${source.source_id}" is not defined in the target UnitSpec source trace.`
          )
        );
      }

      if (containsUnsafeRouteSourceTraceReference(source.reference)) {
        issues.push(
          error(
            "unsafe_route_source_trace_reference",
            `${routePath}.source_trace[${sourceIndex}].reference`,
            "Misconception route source_trace.reference cannot include raw provider output, raw student content, voice transcripts, emotion details, or family context."
          )
        );
      }
    });

    const blockedRawFields = new Set(route.teacher_signal.blocked_raw_fields.map((field) => field.toLowerCase()));
    for (const requiredField of ["raw_dialogue", "raw_response", "voice_transcript"]) {
      if (!blockedRawFields.has(requiredField)) {
        issues.push(
          error(
            "missing_teacher_signal_blocked_raw_field",
            `${routePath}.teacher_signal.blocked_raw_fields`,
            `Teacher-safe signals must explicitly block ${requiredField}.`
          )
        );
      }
    }

    route.teacher_signal.blocked_raw_fields.forEach((field, fieldIndex) => {
      if (containsUnsafeBlockedRawFieldIntent(field)) {
        issues.push(
          error(
            "unsafe_teacher_signal_blocked_raw_field",
            `${routePath}.teacher_signal.blocked_raw_fields[${fieldIndex}]`,
            "teacher_signal.blocked_raw_fields must be a deny-list only; do not include allow, read, export, visible, or access variants."
          )
        );
      }
    });

    if (
      route.detection.detection_signal === "oral_explanation_pattern" &&
      !blockedRawFields.has("voice_audio")
    ) {
      issues.push(
        error(
          "oral_route_missing_voice_audio_block",
          `${routePath}.teacher_signal.blocked_raw_fields`,
          "Oral misconception routes must explicitly block voice_audio in teacher-safe signals."
        )
      );
    }

    if (route.teacher_signal.suggested_intervention_level === "L4" || route.teacher_signal.suggested_intervention_level === "L5") {
      issues.push(
        warning(
          "high_level_intervention_requires_confirmation",
          `${routePath}.teacher_signal.suggested_intervention_level`,
          "L4/L5 misconception-route suggestions require teacher or school workflow confirmation before any action."
        )
      );
    }
  });

  return issues;
}

function collectDetectionSignalBlockTypeIssues(
  route: MisconceptionFeedbackRoute,
  blocks: readonly FlattenedBlock[],
  routePath: string,
  issues: MisconceptionFeedbackRouteValidationIssue[]
): void {
  const sourceBlock = blocks.find(({ block }) => block.block_id === route.source_block_id)?.block;
  if (!sourceBlock) {
    return;
  }

  const allowedTypes = allowedSourceBlockTypesForDetectionSignal(route.detection.detection_signal);
  if (allowedTypes === "any" || allowedTypes.includes(sourceBlock.type)) {
    return;
  }

  issues.push(
    error(
      "detection_signal_source_block_type_mismatch",
      `${routePath}.source_block_id`,
      `Detection signal "${route.detection.detection_signal}" cannot be produced by source block "${route.source_block_id}" of type "${sourceBlock.type}".`
    )
  );
}

function collectDetectionSignalEvidenceTypeIssues(
  route: MisconceptionFeedbackRoute,
  routePath: string,
  issues: MisconceptionFeedbackRouteValidationIssue[]
): void {
  const requiredEvidenceType = requiredEvidenceTypeForDetectionSignal(route.detection.detection_signal);
  if (route.evidence.evidence_types.includes(requiredEvidenceType)) {
    return;
  }

  issues.push(
    error(
      "detection_signal_evidence_type_mismatch",
      `${routePath}.evidence.evidence_types`,
      `Detection signal "${route.detection.detection_signal}" requires evidence type "${requiredEvidenceType}".`
    )
  );
}

function requiredEvidenceTypeForDetectionSignal(
  signal: MisconceptionFeedbackRoute["detection"]["detection_signal"]
): MisconceptionFeedbackRoute["evidence"]["evidence_types"][number] {
  switch (signal) {
    case "selected_wrong_option":
      return "selected_choice";
    case "free_text_pattern":
      return "short_explanation";
    case "oral_explanation_pattern":
      return "oral_summary";
    case "simulation_behavior":
      return "simulation_trace";
    case "no_ai_task_error":
      return "no_ai_output";
    case "teacher_marked":
      return "teacher_observation";
  }
}

function allowedSourceBlockTypesForDetectionSignal(
  signal: MisconceptionFeedbackRoute["detection"]["detection_signal"]
): readonly AiNativeUnitSpec["runtime_content"]["pages"][number]["blocks"][number]["type"][] | "any" {
  switch (signal) {
    case "selected_wrong_option":
      return ["quiz", "flash_cards"];
    case "free_text_pattern":
      return ["callout", "quiz", "practice", "reflection"];
    case "oral_explanation_pattern":
      return ["callout", "practice", "reflection"];
    case "simulation_behavior":
      return ["interactive", "animation", "concept_graph", "code"];
    case "no_ai_task_error":
      return ["quiz", "practice", "reflection"];
    case "teacher_marked":
      return "any";
  }
}

function collectBlockReferenceIssues(
  blockId: string,
  targetNodeId: string,
  knownBlockIds: ReadonlySet<string>,
  blocks: readonly FlattenedBlock[],
  path: string,
  role: "source" | "retry",
  issues: MisconceptionFeedbackRouteValidationIssue[]
): void {
  if (!knownBlockIds.has(blockId)) {
    issues.push(error(`unknown_${role}_block`, path, `${role} block "${blockId}" is not defined in runtime_content.`));
    return;
  }

  const matched = blocks.find(({ block }) => block.block_id === blockId);
  if (matched && !matched.block.target_nodes.includes(targetNodeId)) {
    issues.push(
      error(
        `${role}_block_target_node_mismatch`,
        path,
        `${role} block "${blockId}" does not target route node "${targetNodeId}".`
      )
    );
  }
}

interface FlattenedBlock {
  pageId: string;
  block: AiNativeUnitSpec["runtime_content"]["pages"][number]["blocks"][number];
}

function flattenBlocks(unit: AiNativeUnitSpec): FlattenedBlock[] {
  return unit.runtime_content.pages.flatMap((page) => page.blocks.map((block) => ({ pageId: page.page_id, block })));
}

function collectKnownUnitSourceTraceIds(unit: AiNativeUnitSpec): Set<string> {
  return new Set(
    [
      ...unit.knowledge.meta.source_trace,
      ...unit.pedagogy.meta.source_trace,
      ...unit.narrative.meta.source_trace,
      ...unit.implementation.meta.source_trace,
      ...unit.runtime_content.meta.source_trace,
      ...unit.assessment.meta.source_trace,
      ...unit.quality.meta.source_trace,
      ...unit.runtime_content.pages.flatMap((page) => page.blocks.flatMap((block) => block.source_trace))
    ].map((source) => source.source_id)
  );
}

function collectDuplicateIds(
  ids: readonly string[],
  path: string,
  issues: MisconceptionFeedbackRouteValidationIssue[]
): void {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  ids.forEach((id) => {
    if (seen.has(id)) {
      duplicates.add(id);
      return;
    }
    seen.add(id);
  });
  duplicates.forEach((id) => {
    issues.push(error("duplicate_route_id", path, `Duplicate misconception route id "${id}" found.`));
  });
}

function containsRawSensitiveText(text: string): boolean {
  return [...rawSensitivePatterns, ...normalizedChineseRawSensitivePatterns, ...utf8ChineseRawSensitivePatterns, ...actualChineseRawSensitivePatterns, ...actualUtf8ChineseRawSensitivePatterns].some((pattern) => pattern.test(text));
}

function containsSafetySensitiveText(text: string): boolean {
  return [...safetySensitivePatterns, ...normalizedChineseSafetySensitivePatterns, ...utf8ChineseSafetySensitivePatterns, ...actualChineseSafetySensitivePatterns, ...actualUtf8ChineseSafetySensitivePatterns].some((pattern) => pattern.test(text));
}

function containsAnswerFirstText(text: string): boolean {
  return [...answerFirstPatterns, ...normalizedChineseAnswerFirstPatterns, ...utf8ChineseAnswerFirstPatterns, ...actualChineseAnswerFirstPatterns, ...actualUtf8ChineseAnswerFirstPatterns].some((pattern) => pattern.test(text));
}

function containsDisciplinaryAutomationText(text: string): boolean {
  return [...disciplinaryAutomationPatterns, ...actualChineseDisciplinaryAutomationPatterns, ...actualUtf8ChineseDisciplinaryAutomationPatterns].some((pattern) => pattern.test(text));
}

function containsUnsafeRouteSourceTraceReference(reference: string): boolean {
  return (
    unsafeRouteSourceTraceReferencePatterns.some((pattern) => pattern.test(reference)) ||
    containsRawSensitiveText(reference) ||
    containsSafetySensitiveText(reference)
  );
}

function containsUnsafeBlockedRawFieldIntent(field: string): boolean {
  const normalized = normalizeBlockedRawField(field);
  return unsafeBlockedRawFieldIntentPatterns.some((pattern) => pattern.test(field) || pattern.test(normalized));
}

function normalizeBlockedRawField(field: string): string {
  return field
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function buildResult(
  issues: readonly MisconceptionFeedbackRouteValidationIssue[]
): Omit<MisconceptionFeedbackRouteValidationResult, "routes"> {
  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  return {
    passed: errorCount === 0,
    error_count: errorCount,
    warning_count: warningCount,
    issues: [...issues]
  };
}

function error(code: string, path: string, message: string): MisconceptionFeedbackRouteValidationIssue {
  return {
    severity: "error",
    code,
    path,
    message
  };
}

function warning(code: string, path: string, message: string): MisconceptionFeedbackRouteValidationIssue {
  return {
    severity: "warning",
    code,
    path,
    message
  };
}
