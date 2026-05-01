import {
  ClassroomActionPlanListSchema,
  type AiNativeUnitSpec,
  type ClassroomActionPlan
} from "@edu-ai/shared-types";

export type ClassroomActionPlanValidationSeverity = "error" | "warning";

export interface ClassroomActionPlanValidationIssue {
  severity: ClassroomActionPlanValidationSeverity;
  code: string;
  path: string;
  message: string;
}

export interface ClassroomActionPlanValidationResult {
  passed: boolean;
  error_count: number;
  warning_count: number;
  issues: ClassroomActionPlanValidationIssue[];
  plans?: ClassroomActionPlan[];
}

const normalizedChineseRawSensitivePatterns = [
  /原始\s*(对话|转写|转录|语音|音频)/,
  /完整\s*(对话|转写|转录|逐字稿)/,
  /对话\s*原文/,
  /学生\s*(原话|逐字|说了|回答了|写了)/,
  /语音\s*(回放|播放|转写|转录|录音|音频)/,
  /音频\s*(回放|播放|录音)/,
  /情绪\s*原文/,
  /家庭\s*(情况|冲突|细节|内容)/
];

const normalizedChineseDisciplinaryPatterns = [/处分/, /惩罚/, /处罚/, /记过/, /通报批评/, /自动\s*(处分|惩罚|处罚|记过)/];

const rawSensitivePatterns = [
  /\bexact\s+(student\s+)?(answer|response|reply)\b/i,
  /\b(full|complete|original)\s+(student\s+)?(answer|response|reply)\b/i,
  /\bstudent'?s?\s+(exact|full|complete|original)\s+(answer|response|reply)\b/i,
  /\bstudent\s+(said|wrote|answered)\b/i,
  /\bstudent\s+quote\b/i,
  /\bverbatim\b/i,
  /raw[-_\s]*dialogue/i,
  /raw[-_\s]*response/i,
  /raw[-_\s]*transcript/i,
  /voice[-_\s]*audio/i,
  /voice[-_\s]*transcript/i,
  /原始对话/,
  /完整对话/,
  /对话原文/,
  /完整转写/,
  /语音回放/,
  /原始语音/,
  /情绪原文/,
  /家庭情况/
];

const disciplinaryPatterns = [/处分/, /惩罚/, /处罚/, /记过/, /通报批评/, /discipline/i, /punish/i];

const utf8ChineseRawSensitivePatterns = [
  /原始\s*(对话|回答|转写|转录|语音|音频)/,
  /完整\s*(对话|回答|转写|转录|逐字稿)/,
  /对话\s*原文/,
  /回答\s*原文/,
  /学生\s*(原话|逐字|说了|回答了|写了)/,
  /语音\s*(回放|播放|转写|转录|录音|音频)/,
  /音频\s*(回放|播放|录音)/,
  /情绪\s*原文/,
  /家庭\s*(情况|冲突|细节|内容)/
];

const utf8ChineseDisciplinaryPatterns = [
  /自动\s*(处罚|惩罚|处分|扣分|排名|通报)/,
  /(处罚|惩罚|处分|扣分|排名|通报)\s*自动/,
  /直接\s*(处罚|惩罚|处分|扣分|排名|通报)/,
  /通报\s*批评/
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
  /\u97f3\u9891\s*(\u56de\u653e|\u64ad\u653e|\u5f55\u97f3)/,
  /\u60c5\u7eea\s*\u539f\u6587/,
  /\u5bb6\u5ead\s*(\u60c5\u51b5|\u51b2\u7a81|\u7ec6\u8282|\u5185\u5bb9)/
];

const actualUtf8ChineseDisciplinaryPatterns = [
  /\u81ea\u52a8\s*(\u5904\u7f5a|\u60e9\u7f5a|\u5904\u5206|\u6263\u5206|\u6392\u540d|\u901a\u62a5)/,
  /(\u5904\u7f5a|\u60e9\u7f5a|\u5904\u5206|\u6263\u5206|\u6392\u540d|\u901a\u62a5)\s*\u81ea\u52a8/,
  /\u76f4\u63a5\s*(\u5904\u7f5a|\u60e9\u7f5a|\u5904\u5206|\u6263\u5206|\u6392\u540d|\u901a\u62a5)/,
  /\u901a\u62a5\s*\u6279\u8bc4/
];

const unsafePlanSourceTraceReferencePatterns = [
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

const unsafeForbiddenPayloadIntentTokens = new Set([
  "allow",
  "allowed",
  "permit",
  "permitted",
  "read",
  "view",
  "show",
  "export",
  "share",
  "visible",
  "access"
]);

const unsafeForbiddenPayloadChineseIntentPatterns = [
  /\u5141\u8bb8/,
  /\u53ef\u89c1/,
  /\u53ef\u67e5\u770b/,
  /\u67e5\u770b/,
  /\u5bfc\u51fa/,
  /\u5206\u4eab/,
  /\u8bbf\u95ee/
];

export function validateClassroomActionPlans(
  unit: AiNativeUnitSpec,
  input: unknown
): ClassroomActionPlanValidationResult {
  const parsed = ClassroomActionPlanListSchema.safeParse(input);
  if (!parsed.success) {
    const issues = parsed.error.issues.map<ClassroomActionPlanValidationIssue>((issue, index) => ({
      severity: "error",
      code: "invalid_classroom_action_plan_shape",
      path: issue.path.length > 0 ? issue.path.join(".") : "$",
      message: `${issue.message} (shape issue ${index})`
    }));
    return buildResult(issues);
  }

  const plans = parsed.data;
  const issues = collectPlanSemanticIssues(unit, plans);
  return {
    ...buildResult(issues),
    plans
  };
}

function collectPlanSemanticIssues(
  unit: AiNativeUnitSpec,
  plans: readonly ClassroomActionPlan[]
): ClassroomActionPlanValidationIssue[] {
  const issues: ClassroomActionPlanValidationIssue[] = [];
  const knownNodeIds = new Set(unit.knowledge.nodes.map((node) => node.node_id));
  const pages = new Map(unit.runtime_content.pages.map((page) => [page.page_id, page]));
  const blocks = new Map(
    unit.runtime_content.pages.flatMap((page) => page.blocks.map((block) => [block.block_id, { pageId: page.page_id, block }] as const))
  );
  const knownSourceTraceIds = collectKnownUnitSourceTraceIds(unit);

  collectDuplicateIds(
    plans.map((plan) => plan.plan_id),
    "plans[].plan_id",
    "duplicate_plan_id",
    issues
  );

  plans.forEach((plan, planIndex) => {
    const planPath = `plans[${planIndex}]`;
    if (plan.unit_id !== unit.metadata.unit_id) {
      issues.push(error("plan_unit_id_mismatch", `${planPath}.unit_id`, "Classroom action plan unit_id must match UnitSpec metadata.unit_id."));
    }

    plan.source_trace.forEach((source, sourceIndex) => {
      if (!knownSourceTraceIds.has(source.source_id)) {
        issues.push(
          error(
            "unknown_classroom_plan_source_trace",
            `${planPath}.source_trace[${sourceIndex}].source_id`,
            `Classroom action plan source_trace source_id "${source.source_id}" is not defined in the target UnitSpec source trace.`
          )
        );
      }

      if (containsUnsafePlanSourceTraceReference(source.reference)) {
        issues.push(
          error(
            "unsafe_classroom_plan_source_trace_reference",
            `${planPath}.source_trace[${sourceIndex}].reference`,
            "Classroom action plan source_trace.reference cannot include raw provider output, raw student content, voice transcripts, emotion details, or family context."
          )
        );
      }
    });

    collectDuplicateIds(
      plan.actions.map((action) => action.action_id),
      `${planPath}.actions[].action_id`,
      "duplicate_action_id",
      issues
    );

    plan.actions.forEach((action, actionIndex) => {
      const actionPath = `${planPath}.actions[${actionIndex}]`;
      if (action.target_page_id && !pages.has(action.target_page_id)) {
        issues.push(
          error(
            "unknown_target_page",
            `${actionPath}.target_page_id`,
            `Action target_page_id "${action.target_page_id}" is not defined in runtime_content.pages.`
          )
        );
      }

      action.target_knowledge_node_ids.forEach((nodeId, nodeIndex) => {
        if (!knownNodeIds.has(nodeId)) {
          issues.push(
            error(
              "unknown_action_target_node",
              `${actionPath}.target_knowledge_node_ids[${nodeIndex}]`,
              `Action target knowledge node "${nodeId}" is not defined in knowledge.nodes.`
            )
          );
        }
      });

      action.target_block_ids.forEach((blockId, blockIndex) => {
        const matched = blocks.get(blockId);
        if (!matched) {
          issues.push(
            error(
              "unknown_action_target_block",
              `${actionPath}.target_block_ids[${blockIndex}]`,
              `Action target_block_id "${blockId}" is not defined in runtime_content blocks.`
            )
          );
          return;
        }

        if (action.target_page_id && matched.pageId !== action.target_page_id) {
          issues.push(
            error(
              "action_block_page_mismatch",
              `${actionPath}.target_block_ids[${blockIndex}]`,
              `Action target block "${blockId}" belongs to page "${matched.pageId}", not "${action.target_page_id}".`
            )
          );
        }

        const missingNodeIds = action.target_knowledge_node_ids.filter((nodeId) => !matched.block.target_nodes.includes(nodeId));
        if (missingNodeIds.length > 0) {
          issues.push(
            error(
              "action_block_target_node_mismatch",
              `${actionPath}.target_block_ids[${blockIndex}]`,
              `Action target block "${blockId}" does not target knowledge nodes: ${missingNodeIds.join(", ")}.`
            )
          );
        }
      });

      if (action.safety.visibility_scope === "student" && action.trigger.auto_start_allowed) {
        issues.push(
          error(
            "individual_action_auto_start_without_confirmation",
            `${actionPath}.trigger.auto_start_allowed`,
            "Individual student-scoped classroom actions cannot auto-start; teacher confirmation is required."
          )
        );
      }

      if (action.safety.visibility_scope === "student" && !action.safety.audit_required) {
        issues.push(
          error(
            "individual_action_without_audit",
            `${actionPath}.safety.audit_required`,
            "Individual student-scoped classroom actions must require an audit trail."
          )
        );
      }

      if (plan.teacher_control_policy.default_mode === "teacher_led_only" && action.trigger.auto_start_allowed) {
        issues.push(
          error(
            "teacher_led_action_auto_start",
            `${actionPath}.trigger.auto_start_allowed`,
            "teacher_led_only classroom plans cannot auto-start actions."
          )
        );
      }

      action.safety.forbidden_payloads.forEach((payload, payloadIndex) => {
        if (containsUnsafeForbiddenPayloadIntent(payload)) {
          issues.push(
            error(
              "unsafe_action_forbidden_payload",
              `${actionPath}.safety.forbidden_payloads[${payloadIndex}]`,
              "Classroom action safety.forbidden_payloads must be a deny-list only; do not include allow, read, export, visible, or access variants."
            )
          );
        }
      });

      if (action.trigger.trigger_type === "teacher_manual" && action.trigger.auto_start_allowed) {
        issues.push(
          error(
            "manual_trigger_auto_start",
            `${actionPath}.trigger.auto_start_allowed`,
            "teacher_manual classroom actions must wait for explicit teacher start."
          )
        );
      }

      if (action.teacher_checkpoint.checkpoint_type === "decide_intervention" && !action.teacher_checkpoint.decision_required) {
        issues.push(
          error(
            "intervention_checkpoint_without_teacher_decision",
            `${actionPath}.teacher_checkpoint.decision_required`,
            "decide_intervention checkpoints must require explicit teacher decision."
          )
        );
      }

      const actionSafetyText = [
        action.trigger.trigger_description,
        action.teacher_action,
        action.student_action,
        action.ai_action,
        action.teacher_checkpoint.teacher_prompt,
        ...action.teacher_checkpoint.evidence_to_review
      ].join("\n");

      if (containsRawSensitiveText(actionSafetyText)) {
        issues.push(
          error(
            "classroom_action_raw_content_leak",
            actionPath,
            "Classroom actions cannot include raw dialogue, voice, transcript, emotional text, or family-context details."
          )
        );
      }

      action.runtime_event_suggestions.forEach((event, eventIndex) => {
        if (containsRawSensitiveText(event.safe_summary)) {
          issues.push(
            error(
              "runtime_event_safe_summary_raw_content_leak",
              `${actionPath}.runtime_event_suggestions[${eventIndex}].safe_summary`,
              "Classroom runtime event safe_summary cannot expose raw dialogue, voice, transcript, emotional text, or family-context details."
            )
          );
        }
      });

      if (containsDisciplinaryText([action.teacher_action, action.ai_action, action.teacher_checkpoint.teacher_prompt].join("\n"))) {
        issues.push(
          error(
            "classroom_action_disciplinary_automation",
            actionPath,
            "Classroom action plans cannot automate discipline or punishment."
          )
        );
      }

      const requiresVoicePrivacyGuard =
        action.phase === "voice_exchange" ||
        action.runtime_event_suggestions.some((event) => event.event_type === "future_voice_turn");

      collectPhaseRuntimeEventSuggestionIssues(action, actionPath, issues);

      if (requiresVoicePrivacyGuard) {
        requireForbiddenPayloads(action.safety.forbidden_payloads, ["voice_audio", "voice_transcript"], actionPath, issues);
        if (plan.fallback_plan.voice_unavailable !== "text_or_teacher_read") {
          issues.push(
            error(
              "voice_action_missing_fallback",
              `${planPath}.fallback_plan.voice_unavailable`,
              "Voice classroom actions require text_or_teacher_read fallback."
            )
          );
        }
      }

      if (action.phase === "whiteboard_action") {
        if (plan.fallback_plan.whiteboard_unavailable !== "static_diagram_or_teacher_draw") {
          issues.push(
            error(
              "whiteboard_action_missing_fallback",
              `${planPath}.fallback_plan.whiteboard_unavailable`,
              "Whiteboard classroom actions require static_diagram_or_teacher_draw fallback."
            )
          );
        }
        if (action.target_block_ids.length > 0) {
          action.target_block_ids.forEach((blockId) => {
            const matched = blocks.get(blockId);
            if (matched && matched.block.type === "interactive" && !matched.block.sandbox.required) {
              issues.push(
                error(
                  "whiteboard_interactive_block_without_sandbox",
                  actionPath,
                  `Whiteboard action references interactive block "${blockId}" without required sandbox.`
                )
              );
            }
          });
        }
      }

      if (
        (action.phase === "quiz_prompt" || action.phase === "no_ai_baseline") &&
        action.teacher_checkpoint.evidence_to_review.length === 0
      ) {
        issues.push(
          warning(
            "checkpoint_without_evidence_to_review",
            `${actionPath}.teacher_checkpoint.evidence_to_review`,
            "Quiz/no-AI classroom actions should name the evidence a teacher can review."
          )
        );
      }
    });

    if (plan.evidence_plan.mastery_update_allowed && !plan.evidence_plan.evidence_types.includes("no_ai_output")) {
      issues.push(
        error(
          "mastery_update_without_no_ai_evidence",
          `${planPath}.evidence_plan.evidence_types`,
          "Classroom action plans that allow mastery updates must include no_ai_output evidence."
        )
      );
    }

    plan.evidence_plan.teacher_dashboard_projection.forEach((projection, projectionIndex) => {
      if (containsRawSensitiveText(projection)) {
        issues.push(
          error(
            "teacher_dashboard_projection_raw_content_leak",
            `${planPath}.evidence_plan.teacher_dashboard_projection[${projectionIndex}]`,
            "Teacher dashboard projections cannot expose raw dialogue, voice, transcript, emotional text, or family-context details."
          )
        );
      }
    });
  });

  return issues;
}

function collectPhaseRuntimeEventSuggestionIssues(
  action: ClassroomActionPlan["actions"][number],
  actionPath: string,
  issues: ClassroomActionPlanValidationIssue[]
): void {
  const requiredEventType = requiredRuntimeEventTypeForPhase(action.phase);
  if (!requiredEventType) {
    return;
  }

  if (action.runtime_event_suggestions.some((event) => event.event_type === requiredEventType)) {
    return;
  }

  issues.push(
    error(
      "missing_action_runtime_event_suggestion",
      `${actionPath}.runtime_event_suggestions`,
      `Classroom action phase "${action.phase}" requires runtime event suggestion "${requiredEventType}".`
    )
  );
}

function requiredRuntimeEventTypeForPhase(
  phase: ClassroomActionPlan["actions"][number]["phase"]
): ClassroomActionPlan["actions"][number]["runtime_event_suggestions"][number]["event_type"] | undefined {
  switch (phase) {
    case "voice_exchange":
      return "future_voice_turn";
    case "whiteboard_action":
      return "future_whiteboard_action";
    case "pbl_issue_open":
      return "future_pbl_action";
    default:
      return undefined;
  }
}

function requireForbiddenPayloads(
  forbiddenPayloads: readonly string[],
  requiredPayloads: readonly string[],
  path: string,
  issues: ClassroomActionPlanValidationIssue[]
): void {
  const normalized = new Set(forbiddenPayloads.map((payload) => payload.toLowerCase()));
  requiredPayloads.forEach((payload) => {
    if (!normalized.has(payload)) {
      issues.push(
        error(
          "missing_action_forbidden_payload",
          `${path}.safety.forbidden_payloads`,
          `Classroom action safety.forbidden_payloads must include ${payload}.`
        )
      );
    }
  });
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
  code: string,
  issues: ClassroomActionPlanValidationIssue[]
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
    issues.push(error(code, path, `Duplicate id "${id}" found.`));
  });
}

function containsRawSensitiveText(text: string): boolean {
  return [...rawSensitivePatterns, ...normalizedChineseRawSensitivePatterns, ...utf8ChineseRawSensitivePatterns, ...actualUtf8ChineseRawSensitivePatterns].some((pattern) =>
    pattern.test(text)
  );
}

function containsDisciplinaryText(text: string): boolean {
  return [...disciplinaryPatterns, ...normalizedChineseDisciplinaryPatterns, ...utf8ChineseDisciplinaryPatterns, ...actualUtf8ChineseDisciplinaryPatterns].some((pattern) =>
    pattern.test(text)
  );
}

function containsUnsafePlanSourceTraceReference(reference: string): boolean {
  return unsafePlanSourceTraceReferencePatterns.some((pattern) => pattern.test(reference)) || containsRawSensitiveText(reference);
}

function containsUnsafeForbiddenPayloadIntent(payload: string): boolean {
  const normalizedTokens = normalizeForbiddenPayload(payload).split("_").filter(Boolean);
  return (
    normalizedTokens.some((token) => unsafeForbiddenPayloadIntentTokens.has(token)) ||
    unsafeForbiddenPayloadChineseIntentPatterns.some((pattern) => pattern.test(payload))
  );
}

function normalizeForbiddenPayload(payload: string): string {
  return payload
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function buildResult(
  issues: readonly ClassroomActionPlanValidationIssue[]
): Omit<ClassroomActionPlanValidationResult, "plans"> {
  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;
  return {
    passed: errorCount === 0,
    error_count: errorCount,
    warning_count: warningCount,
    issues: [...issues]
  };
}

function error(code: string, path: string, message: string): ClassroomActionPlanValidationIssue {
  return {
    severity: "error",
    code,
    path,
    message
  };
}

function warning(code: string, path: string, message: string): ClassroomActionPlanValidationIssue {
  return {
    severity: "warning",
    code,
    path,
    message
  };
}
