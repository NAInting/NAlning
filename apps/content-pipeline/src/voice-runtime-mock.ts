import {
  VoiceTeacherProjectionSchema,
  VoiceTurnDraftSchema,
  type VoiceFailure,
  type VoicePrivacyClass,
  type VoiceRouteSelected,
  type VoiceTeacherProjection,
  type VoiceTurnDraft
} from "@edu-ai/shared-types";

export type SyntheticVoiceScenario =
  | "normal_math_question"
  | "oral_explanation"
  | "barge_in"
  | "mic_denied"
  | "stt_timeout"
  | "tts_timeout"
  | "sensitive_emotion"
  | "family_risk"
  | "raw_export_attempt";

export type VoiceRuntimeProjectionView = "student" | "teacher" | "guardian" | "admin_audit";

export interface SyntheticVoiceRuntimeInput {
  scenario: SyntheticVoiceScenario;
  generatedAt: string;
  sessionId: string;
  studentToken: string;
  unitId?: string | undefined;
  pageId?: string | undefined;
  blockId?: string | undefined;
  targetKnowledgeNodeIds?: string[] | undefined;
}

export interface VoiceRuntimeExportRequest {
  view: VoiceRuntimeProjectionView;
  requested_fields: string[];
  reason_code: string;
}

export interface VoiceRuntimeValidationIssue {
  severity: "error" | "warning";
  code: string;
  path: string;
  message: string;
}

export interface VoiceRuntimeValidationResult {
  passed: boolean;
  error_count: number;
  warning_count: number;
  issues: VoiceRuntimeValidationIssue[];
}

const voiceLatencyTargetsMs = {
  vad_ms: 300,
  stt_first_partial_ms: 800,
  stt_final_ms: 1800,
  privacy_classification_ms: 150,
  agent_first_token_ms: 1200,
  tts_first_audio_ms: 1200,
  barge_in_stop_ms: 300,
  total_turn_ms: 3500
} as const;

const rawExportFields = new Set([
  "*",
  "all",
  "audio",
  "raw_audio",
  "audio_blob",
  "audio_playback_url",
  "voice_audio",
  "voice_playback",
  "voice_recording",
  "voice_transcript",
  "student_voice_audio",
  "transcript",
  "raw_transcript",
  "full_transcript",
  "verbatim_transcript",
  "transcript_text",
  "student_voice_transcript"
]);

const rawExportFieldFragments = [
  "raw_audio",
  "audio_blob",
  "audio_playback",
  "voice_audio",
  "voice_playback",
  "voice_recording",
  "voice_transcript",
  "raw_transcript",
  "full_transcript",
  "verbatim_transcript",
  "transcript_text",
  "student_voice_audio",
  "student_voice_transcript"
];

const rawExportChineseFieldPatterns = [
  /\u539f\u59cb\s*(\u97f3\u9891|\u5f55\u97f3|\u8bed\u97f3|\u5bf9\u8bdd|\u56de\u7b54)/,
  /\u8bed\u97f3\s*(\u56de\u653e|\u64ad\u653e|\u5f55\u97f3|\u8f6c\u5199|\u8f6c\u5f55)/,
  /\u97f3\u9891\s*(\u56de\u653e|\u64ad\u653e|\u5f55\u97f3)/,
  /\u5b8c\u6574\s*(\u8f6c\u5199|\u8f6c\u5f55|\u9010\u5b57\u7a3f|\u5bf9\u8bdd|\u56de\u7b54)/,
  /\u9010\u5b57\u7a3f/,
  /\u5b66\u751f\s*(\u539f\u8bdd|\u8bed\u97f3\u8f6c\u5199|\u8bed\u97f3\u8f6c\u5f55|\u9010\u5b57|\u5b8c\u6574\u4f5c\u7b54)/
];

const unsafeSafeSummaryPatterns = [
  /\braw[-_\s]*(audio|transcript|dialogue|response)\b/i,
  /\bfull[-_\s]*transcript\b/i,
  /\bverbatim\b/i,
  /\bexact\s+(student\s+)?(response|transcript|words)\b/i,
  /\bstudent\s+(said|wrote|answered)\b/i,
  /\bstudent\s+quote\b/i,
  /\baudio\s+playback\b/i,
  /\bvoice\s+(recording|playback|transcript|audio)\b/i,
  /\bemotional\s+text\b/i,
  /\bfamily\s+(detail|context|content)\b/i,
  /原始\s*(音频|录音|转写|转录|对话|回答)/,
  /完整\s*(转写|转录|逐字稿)/,
  /学生\s*(原话|逐字|说了|回答了)/,
  /音频\s*(回放|播放)/,
  /语音\s*(录音|回放|播放|转写|转录)/,
  /情绪\s*原文/,
  /家庭\s*(细节|原文|内容)/
];

const utf8ChineseUnsafeSafeSummaryPatterns = [
  /原始\s*(音频|录音|转写|转录|对话|回答)/,
  /完整\s*(转写|转录|逐字稿|对话|回答)/,
  /学生\s*(原话|逐字|说了|回答了|写了)/,
  /音频\s*(回放|播放|录音)/,
  /语音\s*(录音|回放|播放|转写|转录)/,
  /情绪\s*原文/,
  /家庭\s*(细节|原文|内容|冲突)/
];

const actualUtf8ChineseUnsafeSafeSummaryPatterns = [
  /\u539f\u59cb\s*(\u97f3\u9891|\u5f55\u97f3|\u8f6c\u5199|\u8f6c\u5f55|\u5bf9\u8bdd|\u56de\u7b54)/,
  /\u5b8c\u6574\s*(\u8f6c\u5199|\u8f6c\u5f55|\u9010\u5b57\u7a3f|\u5bf9\u8bdd|\u56de\u7b54)/,
  /\u5b66\u751f\s*(\u539f\u8bdd|\u9010\u5b57|\u8bf4\u4e86|\u56de\u7b54\u4e86|\u5199\u4e86)/,
  /\u97f3\u9891\s*(\u56de\u653e|\u64ad\u653e|\u5f55\u97f3)/,
  /\u8bed\u97f3\s*(\u5f55\u97f3|\u56de\u653e|\u64ad\u653e|\u8f6c\u5199|\u8f6c\u5f55)/,
  /\u60c5\u7eea\s*\u539f\u6587/,
  /\u5bb6\u5ead\s*(\u7ec6\u8282|\u539f\u6587|\u5185\u5bb9|\u51b2\u7a81)/
];

export function buildSyntheticVoiceTurnDraft(input: SyntheticVoiceRuntimeInput): VoiceTurnDraft {
  const privacyClass = derivePrivacyClass(input.scenario);
  const failure = deriveFailure(input.scenario);
  const routeSelected = deriveRouteSelected(privacyClass, input.scenario);
  const fallbackUsed = routeSelected === "safe_fallback" || Boolean(failure);

  const turn: VoiceTurnDraft = {
    voice_turn_id: `voice_turn_${sanitizeKey(input.scenario)}_${sanitizeKey(input.sessionId)}`,
    session_id: input.sessionId,
    student_token: input.studentToken,
    unit_id: input.unitId,
    page_id: input.pageId,
    block_id: input.blockId,
    started_at: input.generatedAt,
    ended_at: input.generatedAt,
    input_mode: "voice",
    stt_provider_class: privacyClass === "campus_local_only" ? "campus_local" : "synthetic_test",
    tts_provider_class: privacyClass === "campus_local_only" ? "campus_local" : "synthetic_test",
    privacy_class: privacyClass,
    route_selected: routeSelected,
    transcript_handling: privacyClass === "campus_local_only" ? "blocked" : "ephemeral",
    safe_summary: deriveSafeSummary(input.scenario),
    target_knowledge_node_ids: input.targetKnowledgeNodeIds ?? ["lf_slope_meaning"],
    latency: deriveLatency(input.scenario),
    runtime_flags: {
      barge_in_detected: input.scenario === "barge_in",
      fallback_used: fallbackUsed,
      durable_learning_event_created: shouldCreateDurableLearningEvent(input.scenario, privacyClass),
      teacher_projection_allowed: true
    }
  };

  if (failure) {
    turn.failure = failure;
  }

  const parsed = VoiceTurnDraftSchema.parse(turn);
  return parsed;
}

export function projectSyntheticVoiceTurnForTeacher(turn: VoiceTurnDraft): VoiceTeacherProjection {
  const parsedTurn = VoiceTurnDraftSchema.parse(turn);
  if (!parsedTurn.runtime_flags.teacher_projection_allowed) {
    throw new Error("Teacher projection is not allowed for this voice turn.");
  }

  const sensitive = parsedTurn.privacy_class === "campus_local_only";
  const projection: VoiceTeacherProjection = {
    voice_turn_id: parsedTurn.voice_turn_id,
    session_id: parsedTurn.session_id,
    student_token: parsedTurn.student_token,
    unit_id: parsedTurn.unit_id,
    page_id: parsedTurn.page_id,
    block_id: parsedTurn.block_id,
    target_knowledge_node_ids: parsedTurn.target_knowledge_node_ids,
    teacher_signal_type: sensitive ? "needs_human_workflow" : deriveTeacherSignalType(parsedTurn),
    oral_explanation_quality_band: parsedTurn.runtime_flags.durable_learning_event_created ? "developing" : "not_evaluated",
    no_ai_oral_baseline_completed: parsedTurn.safe_summary.toLowerCase().includes("no-ai oral baseline"),
    safe_summary: sensitive
      ? "A synthetic sensitive voice case was routed to campus-local handling with abstract workflow signal only."
      : parsedTurn.safe_summary,
    raw_audio_available: false,
    raw_transcript_available: false
  };

  return VoiceTeacherProjectionSchema.parse(projection);
}

export function validateVoiceRuntimeExportRequest(
  turn: VoiceTurnDraft,
  request: VoiceRuntimeExportRequest
): VoiceRuntimeValidationResult {
  const issues: VoiceRuntimeValidationIssue[] = [];
  const parsedTurn = VoiceTurnDraftSchema.safeParse(turn);

  if (!parsedTurn.success) {
    issues.push(error("invalid_voice_turn", "turn", "Voice runtime export requires a valid VoiceTurnDraft."));
  }

  if (
    parsedTurn.success &&
    (request.view === "teacher" || request.view === "guardian") &&
    !parsedTurn.data.runtime_flags.teacher_projection_allowed
  ) {
    issues.push(error(
      "voice_teacher_projection_not_allowed",
      "runtime_flags.teacher_projection_allowed",
      "Teacher and guardian projections require teacher_projection_allowed=true."
    ));
  }

  if (request.view === "guardian" && request.requested_fields.length > 0) {
    issues.push(error(
      "guardian_realtime_voice_projection_denied",
      "view",
      "Guardian voice projections require a weekly guardian-safe summary contract; real-time voice runtime exports are denied."
    ));
  }

  if (request.reason_code.trim().length === 0) {
    issues.push(error(
      "voice_export_reason_code_required",
      "reason_code",
      "Voice export requests require a non-empty reason_code for audit review."
    ));
  } else if (containsUnsafeAuditReasonText(request.reason_code)) {
    issues.push(error(
      "voice_export_reason_code_raw_content_leak",
      "reason_code",
      "Voice export reason_code cannot include raw audio, transcript, student quotes, emotional text, or family details."
    ));
  }

  request.requested_fields.forEach((field, index) => {
    const normalizedField = normalizeExportField(field);
    if (isRawVoiceExportField(normalizedField, field)) {
      issues.push(error(
        "raw_voice_export_denied",
        `requested_fields.${index}`,
        `Voice export cannot include ${field}.`
      ));
    }
  });

  const requestsStudentOwnedTranscript = request.requested_fields.some(
    (field) => normalizeExportField(field) === "student_owned_transcript"
  );

  if ((request.view === "teacher" || request.view === "guardian") && requestsStudentOwnedTranscript) {
    issues.push(error(
      "student_owned_transcript_not_visible_to_adults",
      "requested_fields",
      "Teacher and guardian projections cannot request student-owned transcripts."
    ));
  }

  if (turn.privacy_class === "campus_local_only" && request.view !== "admin_audit") {
    issues.push(warning(
      "campus_local_voice_projection_is_abstract_only",
      "view",
      "campus-local voice turns can only expose abstract workflow signals outside admin audit."
    ));
  }

  return buildResult(issues);
}

export function validateVoiceRuntimePrivacyInvariant(input: unknown): VoiceRuntimeValidationResult {
  const issues: VoiceRuntimeValidationIssue[] = [];
  const parsedTurn = VoiceTurnDraftSchema.safeParse(input);

  if (!parsedTurn.success) {
    issues.push(error("invalid_voice_turn", "turn", "Voice runtime privacy invariant requires a valid VoiceTurnDraft."));
  }

  if (!isRecord(input)) {
    return buildResult(issues);
  }

  const runtimeFlags = isRecord(input.runtime_flags) ? input.runtime_flags : undefined;
  if (input.failure && runtimeFlags?.fallback_used !== true) {
    issues.push(error(
      "voice_failure_without_fallback",
      "runtime_flags.fallback_used",
      "Voice turns with failure metadata must explicitly mark fallback_used=true."
    ));
  }

  if (typeof input.safe_summary === "string" && containsUnsafeSafeSummaryText(input.safe_summary)) {
    issues.push(error(
      "voice_safe_summary_raw_content_leak",
      "safe_summary",
      "VoiceTurn safe_summary cannot expose raw audio, transcript, student quotes, emotional text, or family details."
    ));
  }

  if (input.privacy_class === "campus_local_only") {
    if (input.route_selected !== "campus_local" && input.route_selected !== "safe_fallback") {
      issues.push(error(
        "voice_failure_privacy_downgrade_denied",
        "route_selected",
        "campus_local_only voice turns cannot downgrade to cloud routes, including during failure fallback."
      ));
    }

    if (input.transcript_handling !== "blocked") {
      issues.push(error(
        "campus_local_transcript_retention_denied",
        "transcript_handling",
        "campus_local_only voice turns must block transcript retention during fallback."
      ));
    }

    if (input.stt_provider_class === "approved_cloud" || input.tts_provider_class === "approved_cloud") {
      issues.push(error(
        "campus_local_cloud_voice_provider_denied",
        "stt_provider_class",
        "campus_local_only voice turns cannot use cloud STT/TTS providers during fallback."
      ));
    }

    if (input.failure && runtimeFlags?.durable_learning_event_created === true) {
      issues.push(error(
        "campus_local_failure_learning_event_denied",
        "runtime_flags.durable_learning_event_created",
        "campus_local_only failure turns cannot create durable learning evidence."
      ));
    }
  }

  if (input.privacy_class === "student_sensitive" && input.route_selected === "approved_cloud") {
    issues.push(error(
      "student_sensitive_approved_cloud_route_denied",
      "route_selected",
      "student_sensitive voice turns must use a student-safe route instead of the generic approved_cloud route."
    ));
  }

  return buildResult(issues);
}

export function validateVoiceTeacherProjectionPrivacyInvariant(input: unknown): VoiceRuntimeValidationResult {
  const issues: VoiceRuntimeValidationIssue[] = [];
  const parsedProjection = VoiceTeacherProjectionSchema.safeParse(input);

  if (!parsedProjection.success) {
    issues.push(error("invalid_voice_teacher_projection", "projection", "Voice teacher projection privacy invariant requires a valid VoiceTeacherProjection."));
  }

  if (!isRecord(input)) {
    return buildResult(issues);
  }

  if (typeof input.safe_summary === "string" && containsUnsafeSafeSummaryText(input.safe_summary)) {
    issues.push(error(
      "voice_teacher_projection_raw_content_leak",
      "safe_summary",
      "Voice teacher projection safe_summary cannot expose raw audio, transcript, student quotes, emotional text, or family details."
    ));
  }

  if (input.teacher_signal_type === "needs_human_workflow" && input.oral_explanation_quality_band !== "not_evaluated") {
    issues.push(error(
      "voice_human_workflow_projection_cannot_evaluate_oral_quality",
      "oral_explanation_quality_band",
      "Voice projections that require human workflow must not evaluate oral quality from sensitive or campus-local content."
    ));
  }

  return buildResult(issues);
}

export function validateVoiceRuntimeLatencyTargets(input: unknown): VoiceRuntimeValidationResult {
  const issues: VoiceRuntimeValidationIssue[] = [];
  const parsedTurn = VoiceTurnDraftSchema.safeParse(input);

  if (!parsedTurn.success) {
    issues.push(error("invalid_voice_turn", "turn", "Voice runtime latency validation requires a valid VoiceTurnDraft."));
    return buildResult(issues);
  }

  for (const [metric, targetMs] of Object.entries(voiceLatencyTargetsMs)) {
    const value = parsedTurn.data.latency[metric as keyof typeof voiceLatencyTargetsMs];
    if (value !== undefined && value > targetMs) {
      issues.push(warning(
        `voice_${metric}_target_exceeded`,
        `latency.${metric}`,
        `Voice runtime spike latency ${metric}=${value}ms exceeds target ${targetMs}ms.`
      ));
    }
  }

  return buildResult(issues);
}

function derivePrivacyClass(scenario: SyntheticVoiceScenario): VoicePrivacyClass {
  switch (scenario) {
    case "sensitive_emotion":
    case "family_risk":
      return "campus_local_only";
    case "raw_export_attempt":
      return "student_sensitive";
    default:
      return "academic";
  }
}

function deriveRouteSelected(
  privacyClass: VoicePrivacyClass,
  scenario: SyntheticVoiceScenario
): VoiceRouteSelected {
  if (privacyClass === "campus_local_only") {
    return scenario === "family_risk" ? "safe_fallback" : "campus_local";
  }

  if (privacyClass === "student_sensitive") {
    return "student_safe_cloud";
  }

  return "student_safe_cloud";
}

function deriveFailure(scenario: SyntheticVoiceScenario): VoiceFailure | undefined {
  switch (scenario) {
    case "mic_denied":
      return {
        code: "mic_permission_denied",
        safe_message: "Microphone permission is unavailable. Continue with text or a no-AI task.",
        retryable: true
      };
    case "stt_timeout":
      return {
        code: "stt_timeout",
        safe_message: "Speech recognition timed out. Try once more or continue by text.",
        retryable: true
      };
    case "tts_timeout":
      return {
        code: "tts_timeout",
        safe_message: "Voice playback is unavailable. The safe text response is shown instead.",
        retryable: true
      };
    case "family_risk":
      return {
        code: "campus_local_model_unavailable",
        safe_message: "This topic stays local. A safe boundary response and human workflow signal were prepared.",
        retryable: false
      };
    case "raw_export_attempt":
      return {
        code: "raw_export_denied",
        safe_message: "Raw voice export is not allowed. Only safe learning traces can be reviewed.",
        retryable: false
      };
    default:
      return undefined;
  }
}

function deriveSafeSummary(scenario: SyntheticVoiceScenario): string {
  switch (scenario) {
    case "normal_math_question":
      return "Student asked a synthetic academic question about slope direction.";
    case "oral_explanation":
      return "Student completed a synthetic no-AI oral baseline explaining slope in their own words.";
    case "barge_in":
      return "Student interruption was simulated and the voice playback stop path was exercised.";
    case "mic_denied":
      return "Voice input was unavailable, so the session degraded to text or no-AI task mode.";
    case "stt_timeout":
      return "Speech recognition timeout degraded to retry guidance and text fallback.";
    case "tts_timeout":
      return "Voice playback timeout degraded to visible text response.";
    case "sensitive_emotion":
      return "Synthetic sensitive speech was routed to campus-local handling without raw content retention.";
    case "family_risk":
      return "Synthetic family-risk speech was blocked from cloud routing and moved to safe fallback.";
    case "raw_export_attempt":
      return "A synthetic raw voice export attempt was denied.";
  }
}

function deriveLatency(scenario: SyntheticVoiceScenario): VoiceTurnDraft["latency"] {
  const base = {
    vad_ms: 180,
    stt_first_partial_ms: 420,
    stt_final_ms: 950,
    privacy_classification_ms: 45,
    agent_first_token_ms: 850,
    tts_first_audio_ms: 760,
    total_turn_ms: 3180
  };

  if (scenario === "barge_in") {
    return {
      ...base,
      barge_in_stop_ms: 180,
      total_turn_ms: 1400
    };
  }

  if (scenario === "stt_timeout") {
    return {
      vad_ms: 180,
      stt_final_ms: 2200,
      privacy_classification_ms: 45,
      total_turn_ms: 2450
    };
  }

  return base;
}

function deriveTeacherSignalType(turn: VoiceTurnDraft): VoiceTeacherProjection["teacher_signal_type"] {
  if (turn.safe_summary.toLowerCase().includes("no-ai oral baseline")) {
    return "oral_baseline_completed";
  }

  if (turn.runtime_flags.durable_learning_event_created) {
    return "academic_signal";
  }

  return "none";
}

function shouldCreateDurableLearningEvent(
  scenario: SyntheticVoiceScenario,
  privacyClass: VoicePrivacyClass
): boolean {
  if (privacyClass === "campus_local_only") {
    return false;
  }

  return !["mic_denied", "stt_timeout", "raw_export_attempt"].includes(scenario);
}

function buildResult(issues: readonly VoiceRuntimeValidationIssue[]): VoiceRuntimeValidationResult {
  const errorCount = issues.filter((issue) => issue.severity === "error").length;
  const warningCount = issues.filter((issue) => issue.severity === "warning").length;

  return {
    passed: errorCount === 0,
    error_count: errorCount,
    warning_count: warningCount,
    issues: [...issues]
  };
}

function error(code: string, path: string, message: string): VoiceRuntimeValidationIssue {
  return {
    severity: "error",
    code,
    path,
    message
  };
}

function warning(code: string, path: string, message: string): VoiceRuntimeValidationIssue {
  return {
    severity: "warning",
    code,
    path,
    message
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function containsUnsafeSafeSummaryText(text: string): boolean {
  return [...unsafeSafeSummaryPatterns, ...utf8ChineseUnsafeSafeSummaryPatterns, ...actualUtf8ChineseUnsafeSafeSummaryPatterns].some((pattern) => pattern.test(text));
}

function containsUnsafeAuditReasonText(reasonCode: string): boolean {
  return containsUnsafeSafeSummaryText(reasonCode);
}

function normalizeExportField(field: string): string {
  const trimmed = field.trim();
  if (trimmed === "*") {
    return "*";
  }

  return trimmed
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function isRawVoiceExportField(normalizedField: string, originalField: string): boolean {
  return (
    rawExportFields.has(normalizedField) ||
    rawExportFieldFragments.some((fragment) => normalizedField.includes(fragment)) ||
    rawExportChineseFieldPatterns.some((pattern) => pattern.test(originalField))
  );
}

function sanitizeKey(value: string): string {
  const sanitized = value.replace(/[^A-Za-z0-9._-]+/g, "_").replace(/^_+|_+$/g, "");
  return sanitized.length > 0 ? sanitized : "unknown";
}
